import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  RefreshCw, 
  Store,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, stats, onResetDemo, isDemo }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users, badge: stats?.totalCustomers },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: stats?.totalOrders },
    { id: 'communication', label: 'Communication', icon: MessageSquare, badge: stats?.pendingReminders?.length },
    { id: 'settings', label: 'WooCommerce Config', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Store size={22} />
        </div>
        <div>
          <div className="brand-title">WooCommerce CRM</div>
          <div className="brand-subtitle">Executive Suite v3.0</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <Icon size={19} />
              <span className="nav-text">{item.label}</span>
              {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="mode-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Layers size={13} /> Status
            </span>
            {isDemo ? (
              <span className="badge badge-demo">Demo Data</span>
            ) : (
              <span className="badge badge-live">Live WC API</span>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {isDemo 
              ? 'Using realistic preview records. Connect store credentials in Settings.'
              : 'Directly synchronized with remote WooCommerce store.'}
          </p>
          {isDemo && (
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ width: '100%', marginTop: '4px', fontSize: '0.75rem' }}
              onClick={onResetDemo}
            >
              <Sparkles size={13} /> Reset Demo Data
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
