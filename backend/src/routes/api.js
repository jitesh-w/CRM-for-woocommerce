import express from 'express';
import { dbQueries, seedDemoData } from '../db.js';
import { WooCommerceService } from '../services/woocommerce.js';

const router = express.Router();
const wcService = new WooCommerceService();

// --- Dashboard ---
router.get('/dashboard', (req, res) => {
  try {
    const stats = dbQueries.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Customers ---
router.get('/customers', (req, res) => {
  try {
    const { search, sortBy, order, limit, offset } = req.query;
    const result = dbQueries.getCustomers({
      search: search || '',
      sortBy: sortBy || 'total_spent',
      order: order || 'DESC',
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers/:id', (req, res) => {
  try {
    const customer = dbQueries.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/customers/:id/notes', (req, res) => {
  try {
    const { content, author } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Note content is required' });
    }
    const note = dbQueries.addCustomerNote(req.params.id, content.trim(), author || 'CRM Specialist');
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/customers/notes/:id', (req, res) => {
  try {
    dbQueries.deleteCustomerNote(req.params.id);
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Orders ---
router.get('/orders', (req, res) => {
  try {
    const { status, customerId, search, limit, offset } = req.query;
    const result = dbQueries.getOrders({
      status: status || 'all',
      customerId: customerId || null,
      search: search || '',
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:id', (req, res) => {
  try {
    const order = dbQueries.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Communications ---
router.get('/communications', (req, res) => {
  try {
    const { customerId, type, limit } = req.query;
    const result = dbQueries.getCommunications({
      customerId: customerId || null,
      type: type || 'all',
      limit: parseInt(limit, 10) || 50
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/communications', (req, res) => {
  try {
    const { customer_id, type, subject, details, channel, date } = req.body;
    if (!customer_id || !details) {
      return res.status(400).json({ error: 'Customer ID and details are required' });
    }
    const comm = dbQueries.addCommunication({
      customer_id,
      type: type || 'email',
      subject,
      details,
      channel,
      date
    });
    res.status(201).json(comm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/communications/:id', (req, res) => {
  try {
    dbQueries.deleteCommunication(req.params.id);
    res.json({ success: true, message: 'Communication record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Reminders & Tasks ---
router.get('/reminders', (req, res) => {
  try {
    const { status, customerId } = req.query;
    const result = dbQueries.getReminders({
      status: status || 'all',
      customerId: customerId || null
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reminders', (req, res) => {
  try {
    const { customer_id, task_description, due_date, priority } = req.body;
    if (!task_description || !due_date) {
      return res.status(400).json({ error: 'Task description and due date are required' });
    }
    const reminder = dbQueries.addReminder({
      customer_id,
      task_description,
      due_date,
      priority: priority || 'medium'
    });
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/reminders/:id', (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be pending or completed' });
    }
    dbQueries.updateReminderStatus(req.params.id, status);
    res.json({ success: true, id: req.params.id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/reminders/:id', (req, res) => {
  try {
    dbQueries.deleteReminder(req.params.id);
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Settings & Integration ---
router.get('/settings', (req, res) => {
  try {
    const rawStoreUrl = dbQueries.getSetting('wc_store_url') || process.env.WOOCOMMERCE_STORE_URL || '';
    const rawKey = dbQueries.getSetting('wc_consumer_key') || process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    const rawSecret = dbQueries.getSetting('wc_consumer_secret') || process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

    // Mask secret for UI security
    const maskedSecret = rawSecret ? `${rawSecret.substring(0, 7)}••••••••••••${rawSecret.slice(-4)}` : '';
    const maskedKey = rawKey ? `${rawKey.substring(0, 7)}••••••••••••${rawKey.slice(-4)}` : '';

    res.json({
      storeUrl: rawStoreUrl,
      consumerKeyMasked: maskedKey,
      hasSecret: Boolean(rawSecret),
      lastSync: dbQueries.getSetting('last_sync') || 'Never',
      syncStatus: dbQueries.getSetting('sync_status') || 'Idle',
      storeCurrency: dbQueries.getSetting('store_currency') || 'USD',
      isConfigured: Boolean(rawStoreUrl && rawKey && rawSecret)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings', (req, res) => {
  try {
    const { storeUrl, consumerKey, consumerSecret, storeCurrency } = req.body;

    if (storeUrl !== undefined) dbQueries.setSetting('wc_store_url', storeUrl.trim());
    if (consumerKey !== undefined && consumerKey.trim()) dbQueries.setSetting('wc_consumer_key', consumerKey.trim());
    if (consumerSecret !== undefined && consumerSecret.trim()) dbQueries.setSetting('wc_consumer_secret', consumerSecret.trim());
    if (storeCurrency !== undefined) dbQueries.setSetting('store_currency', storeCurrency);

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-connection', async (req, res) => {
  try {
    const { storeUrl, consumerKey, consumerSecret } = req.body;
    let customConfig = null;
    if (storeUrl && consumerKey && consumerSecret) {
      customConfig = {
        storeUrl: storeUrl.trim().replace(/\/+$/, ''),
        consumerKey: consumerKey.trim(),
        consumerSecret: consumerSecret.trim()
      };
    }
    const result = await wcService.testConnection(customConfig);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const result = await wcService.syncAllData();
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/demo/reset', (req, res) => {
  try {
    seedDemoData(true);
    res.json({ success: true, message: 'Demo dataset reloaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
