import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'crm.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize Tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      phone TEXT,
      avatar_url TEXT,
      orders_count INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0.0,
      currency TEXT DEFAULT 'USD',
      billing_address TEXT,
      shipping_address TEXT,
      date_created TEXT,
      is_demo INTEGER DEFAULT 0,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      status TEXT,
      total REAL DEFAULT 0.0,
      currency TEXT DEFAULT 'USD',
      payment_method_title TEXT,
      date_created TEXT,
      date_modified TEXT,
      line_items TEXT,
      billing TEXT,
      shipping TEXT,
      is_demo INTEGER DEFAULT 0,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS customer_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT NOT NULL,
      author TEXT DEFAULT 'CRM Agent',
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'email', 'call', 'meeting', 'note'
      subject TEXT,
      details TEXT NOT NULL,
      channel TEXT DEFAULT 'Direct',
      date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT,
      task_description TEXT NOT NULL,
      due_date TEXT NOT NULL,
      priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
      status TEXT DEFAULT 'pending', -- 'pending', 'completed'
      created_at TEXT NOT NULL
    );
  `);

  // Check if customers table is empty. If so, seed initial demo data.
  const customerCountRow = db.prepare('SELECT COUNT(*) as count FROM customers').get();
  if (customerCountRow.count === 0) {
    seedDemoData();
  }
}

// Ensure database tables exist immediately on startup
initDb();

export function seedDemoData(force = false) {
  if (force) {
    db.exec(`
      DELETE FROM customers WHERE is_demo = 1;
      DELETE FROM orders WHERE is_demo = 1;
      DELETE FROM customer_notes;
      DELETE FROM communications;
      DELETE FROM reminders;
    `);
  }

  const now = new Date().toISOString();

  const demoCustomers = [
    {
      id: 'demo-101',
      email: 'sarah.jenkins@example.com',
      first_name: 'Sarah',
      last_name: 'Jenkins',
      username: 'sjenkins',
      phone: '+1 (555) 234-5678',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      orders_count: 5,
      total_spent: 1249.50,
      currency: 'USD',
      billing_address: JSON.stringify({
        first_name: 'Sarah',
        last_name: 'Jenkins',
        address_1: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postcode: '97477',
        country: 'US',
        phone: '+1 (555) 234-5678',
        email: 'sarah.jenkins@example.com'
      }),
      shipping_address: JSON.stringify({
        first_name: 'Sarah',
        last_name: 'Jenkins',
        address_1: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postcode: '97477',
        country: 'US'
      }),
      date_created: '2025-08-12T10:15:00Z',
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'demo-102',
      email: 'alex.rivera@example.com',
      first_name: 'Alex',
      last_name: 'Rivera',
      username: 'arivera',
      phone: '+1 (555) 876-5432',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      orders_count: 3,
      total_spent: 680.00,
      currency: 'USD',
      billing_address: JSON.stringify({
        first_name: 'Alex',
        last_name: 'Rivera',
        address_1: '120 Market Street, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postcode: '94105',
        country: 'US',
        phone: '+1 (555) 876-5432',
        email: 'alex.rivera@example.com'
      }),
      shipping_address: JSON.stringify({
        first_name: 'Alex',
        last_name: 'Rivera',
        address_1: '120 Market Street, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postcode: '94105',
        country: 'US'
      }),
      date_created: '2025-09-04T14:20:00Z',
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'demo-103',
      email: 'priya.sharma@example.com',
      first_name: 'Priya',
      last_name: 'Sharma',
      username: 'psharma',
      phone: '+1 (555) 456-7890',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      orders_count: 7,
      total_spent: 2450.00,
      currency: 'USD',
      billing_address: JSON.stringify({
        first_name: 'Priya',
        last_name: 'Sharma',
        address_1: '45 Austin Ave',
        city: 'Austin',
        state: 'TX',
        postcode: '78701',
        country: 'US',
        phone: '+1 (555) 456-7890',
        email: 'priya.sharma@example.com'
      }),
      shipping_address: JSON.stringify({
        first_name: 'Priya',
        last_name: 'Sharma',
        address_1: '45 Austin Ave',
        city: 'Austin',
        state: 'TX',
        postcode: '78701',
        country: 'US'
      }),
      date_created: '2025-06-21T09:00:00Z',
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'demo-104',
      email: 'marcus.vance@example.com',
      first_name: 'Marcus',
      last_name: 'Vance',
      username: 'mvance',
      phone: '+1 (555) 345-6789',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      orders_count: 2,
      total_spent: 310.25,
      currency: 'USD',
      billing_address: JSON.stringify({
        first_name: 'Marcus',
        last_name: 'Vance',
        address_1: '88 Lincoln Way',
        city: 'Chicago',
        state: 'IL',
        postcode: '60601',
        country: 'US',
        phone: '+1 (555) 345-6789',
        email: 'marcus.vance@example.com'
      }),
      shipping_address: JSON.stringify({
        first_name: 'Marcus',
        last_name: 'Vance',
        address_1: '88 Lincoln Way',
        city: 'Chicago',
        state: 'IL',
        postcode: '60601',
        country: 'US'
      }),
      date_created: '2025-10-10T16:45:00Z',
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'demo-105',
      email: 'elena.rostova@example.com',
      first_name: 'Elena',
      last_name: 'Rostova',
      username: 'erostova',
      phone: '+1 (555) 987-6543',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      orders_count: 4,
      total_spent: 1120.80,
      currency: 'USD',
      billing_address: JSON.stringify({
        first_name: 'Elena',
        last_name: 'Rostova',
        address_1: '500 5th Avenue, Apt 12B',
        city: 'New York',
        state: 'NY',
        postcode: '10110',
        country: 'US',
        phone: '+1 (555) 987-6543',
        email: 'elena.rostova@example.com'
      }),
      shipping_address: JSON.stringify({
        first_name: 'Elena',
        last_name: 'Rostova',
        address_1: '500 5th Avenue, Apt 12B',
        city: 'New York',
        state: 'NY',
        postcode: '10110',
        country: 'US'
      }),
      date_created: '2025-11-02T11:10:00Z',
      is_demo: 1,
      synced_at: now
    }
  ];

  const insertCustomer = db.prepare(`
    INSERT OR REPLACE INTO customers 
    (id, email, first_name, last_name, username, phone, avatar_url, orders_count, total_spent, currency, billing_address, shipping_address, date_created, is_demo, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of demoCustomers) {
    insertCustomer.run(
      c.id, c.email, c.first_name, c.last_name, c.username, c.phone, c.avatar_url,
      c.orders_count, c.total_spent, c.currency, c.billing_address, c.shipping_address,
      c.date_created, c.is_demo, c.synced_at
    );
  }

  const demoOrders = [
    {
      id: 'wc-9001',
      customer_id: 'demo-101',
      customer_name: 'Sarah Jenkins',
      customer_email: 'sarah.jenkins@example.com',
      status: 'completed',
      total: 349.50,
      currency: 'USD',
      payment_method_title: 'Credit Card (Stripe)',
      date_created: '2026-03-01T14:30:00Z',
      date_modified: '2026-03-02T10:00:00Z',
      line_items: JSON.stringify([
        { id: 1, name: 'Ergonomic Executive Chair', price: 299.50, quantity: 1, total: '299.50' },
        { id: 2, name: 'Memory Foam Lumbar Support', price: 50.00, quantity: 1, total: '50.00' }
      ]),
      billing: demoCustomers[0].billing_address,
      shipping: demoCustomers[0].shipping_address,
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'wc-9002',
      customer_id: 'demo-102',
      customer_name: 'Alex Rivera',
      customer_email: 'alex.rivera@example.com',
      status: 'processing',
      total: 220.00,
      currency: 'USD',
      payment_method_title: 'PayPal',
      date_created: '2026-03-04T09:15:00Z',
      date_modified: '2026-03-04T09:20:00Z',
      line_items: JSON.stringify([
        { id: 3, name: 'Mechanical Keyboard RGB Pro', price: 180.00, quantity: 1, total: '180.00' },
        { id: 4, name: 'Braided USB-C Cable', price: 40.00, quantity: 1, total: '40.00' }
      ]),
      billing: demoCustomers[1].billing_address,
      shipping: demoCustomers[1].shipping_address,
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'wc-9003',
      customer_id: 'demo-103',
      customer_name: 'Priya Sharma',
      customer_email: 'priya.sharma@example.com',
      status: 'completed',
      total: 890.00,
      currency: 'USD',
      payment_method_title: 'Direct Bank Transfer',
      date_created: '2026-02-24T18:00:00Z',
      date_modified: '2026-02-25T11:45:00Z',
      line_items: JSON.stringify([
        { id: 5, name: '4K Ultra-Wide Monitor 34"', price: 890.00, quantity: 1, total: '890.00' }
      ]),
      billing: demoCustomers[2].billing_address,
      shipping: demoCustomers[2].shipping_address,
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'wc-9004',
      customer_id: 'demo-104',
      customer_name: 'Marcus Vance',
      customer_email: 'marcus.vance@example.com',
      status: 'pending',
      total: 145.00,
      currency: 'USD',
      payment_method_title: 'Credit Card',
      date_created: '2026-03-05T12:00:00Z',
      date_modified: '2026-03-05T12:00:00Z',
      line_items: JSON.stringify([
        { id: 6, name: 'Studio Monitor Headphones', price: 145.00, quantity: 1, total: '145.00' }
      ]),
      billing: demoCustomers[3].billing_address,
      shipping: demoCustomers[3].shipping_address,
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'wc-9005',
      customer_id: 'demo-105',
      customer_name: 'Elena Rostova',
      customer_email: 'elena.rostova@example.com',
      status: 'on-hold',
      total: 420.00,
      currency: 'USD',
      payment_method_title: 'Direct Bank Transfer',
      date_created: '2026-03-05T08:30:00Z',
      date_modified: '2026-03-05T08:30:00Z',
      line_items: JSON.stringify([
        { id: 7, name: 'Dual Monitor Arm Mount', price: 120.00, quantity: 1, total: '120.00' },
        { id: 8, name: 'Standing Desk Converter 36"', price: 300.00, quantity: 1, total: '300.00' }
      ]),
      billing: demoCustomers[4].billing_address,
      shipping: demoCustomers[4].shipping_address,
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'wc-9006',
      customer_id: 'demo-101',
      customer_name: 'Sarah Jenkins',
      customer_email: 'sarah.jenkins@example.com',
      status: 'refunded',
      total: 75.00,
      currency: 'USD',
      payment_method_title: 'Credit Card (Stripe)',
      date_created: '2026-02-15T15:20:00Z',
      date_modified: '2026-02-17T09:10:00Z',
      line_items: JSON.stringify([
        { id: 9, name: 'Wireless Charging Desk Pad', price: 75.00, quantity: 1, total: '75.00' }
      ]),
      billing: demoCustomers[0].billing_address,
      shipping: demoCustomers[0].shipping_address,
      is_demo: 1,
      synced_at: now
    },
    {
      id: 'wc-9007',
      customer_id: 'demo-103',
      customer_name: 'Priya Sharma',
      customer_email: 'priya.sharma@example.com',
      status: 'cancelled',
      total: 160.00,
      currency: 'USD',
      payment_method_title: 'PayPal',
      date_created: '2026-02-10T16:00:00Z',
      date_modified: '2026-02-10T16:30:00Z',
      line_items: JSON.stringify([
        { id: 10, name: 'Webcam 4K Ultra HD with Ring Light', price: 160.00, quantity: 1, total: '160.00' }
      ]),
      billing: demoCustomers[2].billing_address,
      shipping: demoCustomers[2].shipping_address,
      is_demo: 1,
      synced_at: now
    }
  ];

  const insertOrder = db.prepare(`
    INSERT OR REPLACE INTO orders 
    (id, customer_id, customer_name, customer_email, status, total, currency, payment_method_title, date_created, date_modified, line_items, billing, shipping, is_demo, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const o of demoOrders) {
    insertOrder.run(
      o.id, o.customer_id, o.customer_name, o.customer_email, o.status, o.total,
      o.currency, o.payment_method_title, o.date_created, o.date_modified,
      o.line_items, o.billing, o.shipping, o.is_demo, o.synced_at
    );
  }

  // Demo Notes
  const insertNote = db.prepare(`
    INSERT INTO customer_notes (customer_id, author, content, created_at)
    VALUES (?, ?, ?, ?)
  `);
  insertNote.run('demo-101', 'Support Lead Alex', 'Sarah inquired about the warranty for the Ergonomic Chair. Sent PDF manual.', '2026-03-02T11:00:00Z');
  insertNote.run('demo-103', 'Account Manager David', 'VIP Client: Priya is outfitting a new Austin studio. Mention bulk VIP discounts for next order.', '2026-02-26T14:30:00Z');
  insertNote.run('demo-105', 'Billing Rep Clara', 'Bank transfer pending confirmation for order #wc-9005. Customer requested delivery by Friday.', '2026-03-05T09:00:00Z');

  // Demo Communications
  const insertComm = db.prepare(`
    INSERT INTO communications (customer_id, type, subject, details, channel, date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertComm.run('demo-101', 'email', 'Warranty & Setup Guide Sent', 'Forwarded manufacturer setup guide and extended 3-year warranty certificate.', 'Email', '2026-03-02T11:15:00Z', '2026-03-02T11:15:00Z');
  insertComm.run('demo-102', 'call', 'Shipping Delay Update Call', 'Called Alex to advise that mechanical switch stock arrived and order is dispatching today.', 'Phone Call', '2026-03-04T10:00:00Z', '2026-03-04T10:00:00Z');
  insertComm.run('demo-103', 'meeting', 'Commercial Account Review', 'Virtual Zoom meeting to discuss enterprise workstation requirements.', 'Zoom Meeting', '2026-02-28T16:00:00Z', '2026-02-28T16:00:00Z');
  insertComm.run('demo-104', 'note', 'Payment Reminder Alert', 'Customer card encountered a temporary 3D Secure issue; sent payment retry link.', 'SMS / Portal', '2026-03-05T12:30:00Z', '2026-03-05T12:30:00Z');

  // Demo Reminders
  const insertReminder = db.prepare(`
    INSERT INTO reminders (customer_id, task_description, due_date, priority, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertReminder.run('demo-105', 'Verify bank wire receipt for order #wc-9005 and mark processing', '2026-03-06T15:00:00Z', 'high', 'pending', now);
  insertReminder.run('demo-103', 'Send custom quotation for 10x monitor arms to Priya', '2026-03-08T18:00:00Z', 'medium', 'pending', now);
  insertReminder.run('demo-102', 'Follow up after delivery to confirm switch feedback', '2026-03-10T12:00:00Z', 'low', 'pending', now);
  insertReminder.run('demo-101', 'Check satisfaction with lumbar support', '2026-03-04T10:00:00Z', 'medium', 'completed', now);

  // Settings
  const insertSetting = db.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`);
  insertSetting.run('last_sync', 'Never (Demo Mode active)', now);
  insertSetting.run('sync_status', 'Demo Dataset Loaded', now);
  insertSetting.run('store_name', 'WooCommerce Sample Store', now);
  insertSetting.run('store_currency', 'USD', now);
}

// Queries & API Handlers
export const dbQueries = {
  // Settings
  getSetting(key) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
  },
  getAllSettings() {
    return db.prepare('SELECT key, value, updated_at FROM settings').all();
  },
  setSetting(key, value) {
    const now = new Date().toISOString();
    return db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)').run(key, value, now);
  },

  // Customers
  getCustomers({ search, sortBy = 'total_spent', order = 'DESC', limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }

    const allowedSort = ['total_spent', 'orders_count', 'date_created', 'first_name', 'id'];
    const sortCol = allowedSort.includes(sortBy) ? sortBy : 'total_spent';
    const sortDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const customers = db.prepare(query).all(...params);

    const totalCountQuery = search
      ? `SELECT COUNT(*) as count FROM customers WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`
      : `SELECT COUNT(*) as count FROM customers`;
    const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [];
    const countRow = db.prepare(totalCountQuery).get(...countParams);

    return {
      customers: customers.map(c => ({
        ...c,
        billing_address: c.billing_address ? JSON.parse(c.billing_address) : null,
        shipping_address: c.shipping_address ? JSON.parse(c.shipping_address) : null
      })),
      total: countRow.count
    };
  },

  getCustomerById(id) {
    const c = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!c) return null;

    const orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY date_created DESC').all(id);
    const notes = db.prepare('SELECT * FROM customer_notes WHERE customer_id = ? ORDER BY created_at DESC').all(id);
    const communications = db.prepare('SELECT * FROM communications WHERE customer_id = ? ORDER BY date DESC').all(id);
    const reminders = db.prepare('SELECT * FROM reminders WHERE customer_id = ? ORDER BY due_date ASC').all(id);

    return {
      ...c,
      billing_address: c.billing_address ? JSON.parse(c.billing_address) : null,
      shipping_address: c.shipping_address ? JSON.parse(c.shipping_address) : null,
      orders: orders.map(o => ({
        ...o,
        line_items: o.line_items ? JSON.parse(o.line_items) : [],
        billing: o.billing ? JSON.parse(o.billing) : null,
        shipping: o.shipping ? JSON.parse(o.shipping) : null
      })),
      notes,
      communications,
      reminders
    };
  },

  upsertCustomer(c, isDemo = 0) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO customers (id, email, first_name, last_name, username, phone, avatar_url, orders_count, total_spent, currency, billing_address, shipping_address, date_created, is_demo, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email=excluded.email,
        first_name=excluded.first_name,
        last_name=excluded.last_name,
        username=excluded.username,
        phone=excluded.phone,
        avatar_url=excluded.avatar_url,
        orders_count=excluded.orders_count,
        total_spent=excluded.total_spent,
        billing_address=excluded.billing_address,
        shipping_address=excluded.shipping_address,
        date_created=excluded.date_created,
        is_demo=excluded.is_demo,
        synced_at=excluded.synced_at
    `);

    stmt.run(
      String(c.id),
      c.email || '',
      c.first_name || '',
      c.last_name || '',
      c.username || '',
      c.billing?.phone || c.phone || '',
      c.avatar_url || '',
      Number(c.orders_count) || 0,
      parseFloat(c.total_spent) || 0.0,
      c.currency || 'USD',
      JSON.stringify(c.billing || {}),
      JSON.stringify(c.shipping || {}),
      c.date_created || now,
      isDemo,
      now
    );
  },

  // Orders
  getOrders({ status, customerId, search, limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status.toLowerCase());
    }

    if (customerId) {
      query += ` AND customer_id = ?`;
      params.push(String(customerId));
    }

    if (search) {
      query += ` AND (id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY date_created DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const orders = db.prepare(query).all(...params);

    let countQuery = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const countParams = [];
    if (status && status !== 'all') {
      countQuery += ` AND status = ?`;
      countParams.push(status.toLowerCase());
    }
    if (customerId) {
      countQuery += ` AND customer_id = ?`;
      countParams.push(String(customerId));
    }
    if (search) {
      countQuery += ` AND (id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countRow = db.prepare(countQuery).get(...countParams);

    return {
      orders: orders.map(o => ({
        ...o,
        line_items: o.line_items ? JSON.parse(o.line_items) : [],
        billing: o.billing ? JSON.parse(o.billing) : null,
        shipping: o.shipping ? JSON.parse(o.shipping) : null
      })),
      total: countRow.count
    };
  },

  getOrderById(id) {
    const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(String(id));
    if (!o) return null;
    return {
      ...o,
      line_items: o.line_items ? JSON.parse(o.line_items) : [],
      billing: o.billing ? JSON.parse(o.billing) : null,
      shipping: o.shipping ? JSON.parse(o.shipping) : null
    };
  },

  upsertOrder(o, isDemo = 0) {
    const now = new Date().toISOString();
    const customerName = `${o.billing?.first_name || ''} ${o.billing?.last_name || ''}`.trim() || 'Guest Customer';
    const customerEmail = o.billing?.email || '';

    const stmt = db.prepare(`
      INSERT INTO orders (id, customer_id, customer_name, customer_email, status, total, currency, payment_method_title, date_created, date_modified, line_items, billing, shipping, is_demo, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        customer_id=excluded.customer_id,
        customer_name=excluded.customer_name,
        customer_email=excluded.customer_email,
        status=excluded.status,
        total=excluded.total,
        currency=excluded.currency,
        payment_method_title=excluded.payment_method_title,
        date_created=excluded.date_created,
        date_modified=excluded.date_modified,
        line_items=excluded.line_items,
        billing=excluded.billing,
        shipping=excluded.shipping,
        is_demo=excluded.is_demo,
        synced_at=excluded.synced_at
    `);

    stmt.run(
      String(o.id),
      String(o.customer_id || 0),
      customerName,
      customerEmail,
      (o.status || 'pending').toLowerCase(),
      parseFloat(o.total) || 0.0,
      o.currency || 'USD',
      o.payment_method_title || '',
      o.date_created || now,
      o.date_modified || now,
      JSON.stringify(o.line_items || []),
      JSON.stringify(o.billing || {}),
      JSON.stringify(o.shipping || {}),
      isDemo,
      now
    );
  },

  // Notes
  addCustomerNote(customerId, content, author = 'CRM Staff') {
    const now = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO customer_notes (customer_id, author, content, created_at)
      VALUES (?, ?, ?, ?)
    `).run(String(customerId), author, content, now);
    return { id: info.lastInsertRowid, customer_id: customerId, author, content, created_at: now };
  },

  deleteCustomerNote(id) {
    return db.prepare('DELETE FROM customer_notes WHERE id = ?').run(Number(id));
  },

  // Communications
  getCommunications({ customerId, type, limit = 50 } = {}) {
    let query = `
      SELECT c.*, cust.first_name, cust.last_name, cust.email
      FROM communications c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      WHERE 1=1
    `;
    const params = [];
    if (customerId) {
      query += ` AND c.customer_id = ?`;
      params.push(String(customerId));
    }
    if (type && type !== 'all') {
      query += ` AND c.type = ?`;
      params.push(type);
    }
    query += ` ORDER BY c.date DESC LIMIT ?`;
    params.push(limit);

    return db.prepare(query).all(...params);
  },

  addCommunication({ customer_id, type, subject, details, channel, date }) {
    const now = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO communications (customer_id, type, subject, details, channel, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(String(customer_id), type, subject || '', details, channel || 'Direct', date || now, now);
    return { id: info.lastInsertRowid, customer_id, type, subject, details, channel, date: date || now, created_at: now };
  },

  deleteCommunication(id) {
    return db.prepare('DELETE FROM communications WHERE id = ?').run(Number(id));
  },

  // Reminders
  getReminders({ status, customerId } = {}) {
    let query = `
      SELECT r.*, c.first_name, c.last_name, c.email
      FROM reminders r
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (customerId) {
      query += ` AND r.customer_id = ?`;
      params.push(String(customerId));
    }
    query += ` ORDER BY r.due_date ASC`;
    return db.prepare(query).all(...params);
  },

  addReminder({ customer_id, task_description, due_date, priority = 'medium' }) {
    const now = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO reminders (customer_id, task_description, due_date, priority, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `).run(customer_id ? String(customer_id) : null, task_description, due_date, priority, now);
    return { id: info.lastInsertRowid, customer_id, task_description, due_date, priority, status: 'pending', created_at: now };
  },

  updateReminderStatus(id, status) {
    return db.prepare('UPDATE reminders SET status = ? WHERE id = ?').run(status, Number(id));
  },

  deleteReminder(id) {
    return db.prepare('DELETE FROM reminders WHERE id = ?').run(Number(id));
  },

  // Dashboard Stats
  getDashboardStats() {
    const customerCountRow = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    const orderCountRow = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const revenueRow = db.prepare(`
      SELECT SUM(total) as total_sales 
      FROM orders 
      WHERE status IN ('completed', 'processing')
    `).get();

    const pendingOrdersRow = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'on-hold')
    `).get();

    const orderStatusCounts = db.prepare(`
      SELECT status, COUNT(*) as count, SUM(total) as total_sum 
      FROM orders 
      GROUP BY status
    `).all();

    const recentOrders = db.prepare(`
      SELECT * FROM orders 
      ORDER BY date_created DESC 
      LIMIT 6
    `).all().map(o => ({
      ...o,
      line_items: o.line_items ? JSON.parse(o.line_items) : []
    }));

    const topCustomers = db.prepare(`
      SELECT id, first_name, last_name, email, avatar_url, orders_count, total_spent 
      FROM customers 
      ORDER BY total_spent DESC 
      LIMIT 5
    `).all();

    const pendingReminders = db.prepare(`
      SELECT r.*, c.first_name, c.last_name 
      FROM reminders r
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.status = 'pending'
      ORDER BY r.due_date ASC
      LIMIT 5
    `).all();

    const isDemoDataRow = db.prepare(`
      SELECT COUNT(*) as count FROM customers WHERE is_demo = 1
    `).get();

    return {
      totalCustomers: customerCountRow.count,
      totalOrders: orderCountRow.count,
      totalSales: revenueRow.total_sales || 0,
      pendingOrders: pendingOrdersRow.count,
      statusBreakdown: orderStatusCounts,
      recentOrders,
      topCustomers,
      pendingReminders,
      isDemoMode: isDemoDataRow.count > 0,
      lastSync: this.getSetting('last_sync') || 'Never',
      syncStatus: this.getSetting('sync_status') || 'Ready'
    };
  }
};
