import axios from 'axios';
import { dbQueries } from '../db.js';

export class WooCommerceService {
  constructor(customConfig = null) {
    this.customConfig = customConfig;
  }

  loadConfig() {
    if (this.customConfig) return this.customConfig;
    const storeUrl = dbQueries.getSetting('wc_store_url') || process.env.WOOCOMMERCE_STORE_URL || '';
    const consumerKey = dbQueries.getSetting('wc_consumer_key') || process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    const consumerSecret = dbQueries.getSetting('wc_consumer_secret') || process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

    return {
      storeUrl: storeUrl.trim().replace(/\/+$/, ''),
      consumerKey: consumerKey.trim(),
      consumerSecret: consumerSecret.trim()
    };
  }

  getClient(config = null) {
    const activeConfig = config || this.loadConfig();
    if (!activeConfig.storeUrl || !activeConfig.consumerKey || !activeConfig.consumerSecret) {
      throw new Error('WooCommerce credentials are incomplete. Please provide Store URL, Consumer Key, and Consumer Secret.');
    }

    const auth = Buffer.from(`${activeConfig.consumerKey}:${activeConfig.consumerSecret}`).toString('base64');

    return axios.create({
      baseURL: `${activeConfig.storeUrl}/wp-json/wc/v3`,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WooCommerce-CRM-Integration/1.0'
      },
      timeout: 25000
    });
  }

  async testConnection(customConfig = null) {
    const config = customConfig || this.loadConfig();
    try {
      const client = this.getClient(config);
      // Verify connection by requesting system status or 1 customer
      const res = await client.get('/customers', { params: { per_page: 1 } });
      const storeName = config.storeUrl.replace(/^https?:\/\//, '');

      return {
        success: true,
        message: 'Successfully connected to WooCommerce REST API v3!',
        store: storeName,
        totalCustomersHeader: res.headers['x-wp-total'] || null
      };
    } catch (error) {
      let message = 'Unable to connect to WooCommerce store.';
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          message = 'Authentication failed. Please verify your Consumer Key and Consumer Secret permissions (Read/Write access required).';
        } else if (error.response.status === 404) {
          message = 'WooCommerce REST API endpoint not found. Ensure WooCommerce is installed and Pretty Permalinks are enabled (Settings > Permalinks).';
        } else {
          message = `WooCommerce API Error (${error.response.status}): ${error.response.data?.message || error.message}`;
        }
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        message = `Cannot reach store at "${config.storeUrl}". Please verify the URL and network connection.`;
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message
      };
    }
  }

  async syncAllData(progressCallback = null) {
    const config = this.loadConfig();
    const testResult = await this.testConnection(config);
    if (!testResult.success) {
      dbQueries.setSetting('sync_status', `Failed: ${testResult.message}`);
      throw new Error(testResult.message);
    }

    const client = this.getClient(config);
    let totalSyncedCustomers = 0;
    let totalSyncedOrders = 0;

    dbQueries.setSetting('sync_status', 'Synchronizing customers...');

    // 1. Sync Customers with Pagination
    let customerPage = 1;
    let hasMoreCustomers = true;

    while (hasMoreCustomers) {
      try {
        const response = await client.get('/customers', {
          params: {
            page: customerPage,
            per_page: 50,
            role: 'all'
          }
        });

        const customers = response.data || [];
        for (const customer of customers) {
          dbQueries.upsertCustomer(customer, 0);
          totalSyncedCustomers++;
        }

        const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
        if (customerPage >= totalPages || customers.length < 50) {
          hasMoreCustomers = false;
        } else {
          customerPage++;
        }
      } catch (err) {
        hasMoreCustomers = false;
        console.error(`Error fetching customers page ${customerPage}:`, err.message);
        throw new Error(`Failed during customer synchronization (page ${customerPage}): ${err.message}`);
      }
    }

    dbQueries.setSetting('sync_status', 'Synchronizing orders...');

    // 2. Sync Orders with Pagination
    let orderPage = 1;
    let hasMoreOrders = true;

    while (hasMoreOrders) {
      try {
        const response = await client.get('/orders', {
          params: {
            page: orderPage,
            per_page: 50
          }
        });

        const orders = response.data || [];
        for (const order of orders) {
          dbQueries.upsertOrder(order, 0);
          totalSyncedOrders++;
        }

        const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
        if (orderPage >= totalPages || orders.length < 50) {
          hasMoreOrders = false;
        } else {
          orderPage++;
        }
      } catch (err) {
        hasMoreOrders = false;
        console.error(`Error fetching orders page ${orderPage}:`, err.message);
        throw new Error(`Failed during orders synchronization (page ${orderPage}): ${err.message}`);
      }
    }

    const now = new Date().toISOString();
    dbQueries.setSetting('last_sync', now);
    dbQueries.setSetting('sync_status', `Completed: ${totalSyncedCustomers} customers and ${totalSyncedOrders} orders`);

    return {
      success: true,
      customersCount: totalSyncedCustomers,
      ordersCount: totalSyncedOrders,
      lastSync: now
    };
  }
}
