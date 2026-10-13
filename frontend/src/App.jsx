import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import OrdersView from './components/OrdersView';
import CommunicationView from './components/CommunicationView';
import SettingsView from './components/SettingsView';
import CustomerModal from './components/CustomerModal';
import OrderModal from './components/OrderModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSortBy, setCustomerSortBy] = useState('total_spent');

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  const [communications, setCommunications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [settings, setSettings] = useState(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderData, setSelectedOrderData] = useState(null);

  const [preselectedEmailCustomer, setPreselectedEmailCustomer] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // --- Data Fetching ---
  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const loadCustomers = async () => {
    try {
      const params = new URLSearchParams({
        search: customerSearch,
        sortBy: customerSortBy,
        limit: 100
      });
      const res = await fetch(`/api/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setTotalCustomers(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams({
        status: orderStatusFilter,
        search: orderSearch,
        limit: 100
      });
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalOrders(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const loadCommunications = async () => {
    try {
      const res = await fetch('/api/communications?limit=100');
      if (res.ok) {
        const data = await res.json();
        setCommunications(data);
      }
    } catch (err) {
      console.error('Failed to load communications:', err);
    }
  };

  const loadReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadCustomers();
    loadOrders();
    loadCommunications();
    loadReminders();
    loadSettings();
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [customerSearch, customerSortBy]);

  useEffect(() => {
    loadOrders();
  }, [orderStatusFilter, orderSearch]);

  // Load single customer 360 profile
  const openCustomerProfile = async (id) => {
    setSelectedCustomerId(id);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomerData(data);
      }
    } catch (err) {
      console.error('Failed to load customer profile:', err);
    }
  };

  // Load single order details
  const openOrderDetails = async (id) => {
    setSelectedOrderId(id);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrderData(data);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    }
  };

  // Handlers
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Synchronized ${data.customersCount} customers & ${data.ordersCount} orders from WooCommerce!`);
        await Promise.all([
          loadDashboard(),
          loadCustomers(),
          loadOrders(),
          loadSettings()
        ]);
      } else {
        showToast('error', data.message || 'WooCommerce synchronization failed. Verify API credentials.');
      }
    } catch (err) {
      showToast('error', `Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        showToast('success', 'Demo dataset reloaded successfully!');
        await Promise.all([
          loadDashboard(),
          loadCustomers(),
          loadOrders(),
          loadCommunications(),
          loadReminders(),
          loadSettings()
        ]);
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleAddNote = async (customerId, content, author) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author })
      });
      if (res.ok) {
        showToast('success', 'Note added to customer profile');
        openCustomerProfile(customerId);
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await fetch(`/api/customers/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok && selectedCustomerId) {
        openCustomerProfile(selectedCustomerId);
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleAddCommunication = async (commData) => {
    try {
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commData)
      });
      if (res.ok) {
        showToast('success', 'Interaction logged to history');
        loadCommunications();
        if (selectedCustomerId) openCustomerProfile(selectedCustomerId);
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteCommunication = async (id) => {
    try {
      const res = await fetch(`/api/communications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCommunications();
        if (selectedCustomerId) openCustomerProfile(selectedCustomerId);
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleAddReminder = async (remData) => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(remData)
      });
      if (res.ok) {
        showToast('success', 'Task reminder created');
        loadReminders();
        loadDashboard();
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleToggleReminder = async (id, status) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadReminders();
        loadDashboard();
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadReminders();
        loadDashboard();
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleSaveSettings = async (settingsData) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      if (res.ok) {
        showToast('success', 'WooCommerce store settings saved');
        loadSettings();
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleTestConnection = async (config) => {
    const res = await fetch('/api/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  };

  const handleComposeEmail = (customer) => {
    setPreselectedEmailCustomer(customer);
    setCurrentView('communication');
  };

  const titles = {
    dashboard: 'Executive CRM Dashboard',
    customers: 'Customer Relationship Management',
    orders: 'Order Tracking & History',
    communication: 'Customer Communication Hub',
    settings: 'WooCommerce API Integration & Settings'
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          maxWidth: '420px',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div className={`banner ${toast.type === 'success' ? 'banner-success' : 'banner-error'}`} style={{ boxShadow: 'var(--shadow-lg)' }}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <div style={{ flex: 1, fontSize: '0.85rem' }}>{toast.message}</div>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        stats={stats}
        onResetDemo={handleResetDemo}
        isDemo={stats?.isDemoMode ?? true}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Topbar 
          title={titles[currentView] || 'CRM Dashboard'}
          onSync={handleSync}
          isSyncing={isSyncing}
          lastSync={stats?.lastSync || settings?.lastSync}
          syncStatus={stats?.syncStatus || settings?.syncStatus}
          isConfigured={settings?.isConfigured}
          isDemo={stats?.isDemoMode ?? true}
        />

        <main className="content-body">
          {currentView === 'dashboard' && (
            <DashboardView 
              stats={stats}
              onViewCustomer={openCustomerProfile}
              onViewOrder={openOrderDetails}
              onToggleReminder={handleToggleReminder}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'customers' && (
            <CustomersView 
              customers={customers}
              total={totalCustomers}
              search={customerSearch}
              setSearch={setCustomerSearch}
              sortBy={customerSortBy}
              setSortBy={setCustomerSortBy}
              onViewCustomer={openCustomerProfile}
              onComposeEmail={handleComposeEmail}
            />
          )}

          {currentView === 'orders' && (
            <OrdersView 
              orders={orders}
              total={totalOrders}
              statusFilter={orderStatusFilter}
              setStatusFilter={setOrderStatusFilter}
              search={orderSearch}
              setSearch={setOrderSearch}
              onViewOrder={openOrderDetails}
              onViewCustomer={openCustomerProfile}
            />
          )}

          {currentView === 'communication' && (
            <CommunicationView 
              customers={customers}
              communications={communications}
              reminders={reminders}
              onAddCommunication={handleAddCommunication}
              onDeleteCommunication={handleDeleteCommunication}
              onAddReminder={handleAddReminder}
              onToggleReminder={handleToggleReminder}
              onDeleteReminder={handleDeleteReminder}
              preselectedCustomer={preselectedEmailCustomer}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView 
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onTestConnection={handleTestConnection}
              onSync={handleSync}
              onResetDemo={handleResetDemo}
              isSyncing={isSyncing}
            />
          )}
        </main>
      </div>

      {/* Customer 360 Modal */}
      {selectedCustomerId && selectedCustomerData && (
        <CustomerModal 
          customer={selectedCustomerData}
          onClose={() => {
            setSelectedCustomerId(null);
            setSelectedCustomerData(null);
          }}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onViewOrder={openOrderDetails}
          onComposeEmail={handleComposeEmail}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrderId && selectedOrderData && (
        <OrderModal 
          order={selectedOrderData}
          onClose={() => {
            setSelectedOrderId(null);
            setSelectedOrderData(null);
          }}
          onViewCustomer={openCustomerProfile}
        />
      )}
    </div>
  );
}
