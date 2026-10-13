import React from 'react';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function DashboardView({ 
  stats, 
  onViewCustomer, 
  onViewOrder, 
  onToggleReminder,
  onNavigate 
}) {
  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading CRM analytics...</p>
      </div>
    );
  }

  const {
    totalCustomers = 0,
    totalOrders = 0,
    totalSales = 0,
    pendingOrders = 0,
    statusBreakdown = [],
    recentOrders = [],
    topCustomers = [],
    pendingReminders = [],
    isDemoMode = true
  } = stats;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Color map for status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'badge-completed';
      case 'processing': return 'badge-processing';
      case 'pending': return 'badge-pending';
      case 'on-hold': return 'badge-on-hold';
      case 'cancelled': return 'badge-cancelled';
      case 'refunded': return 'badge-refunded';
      default: return 'badge-pending';
    }
  };

  return (
    <div className="animate-fade-in">
      {isDemoMode && (
        <div className="banner banner-warning">
          <Sparkles size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>Demo Data Mode Active:</strong> Showing realistic sample WooCommerce data. To sync your real WooCommerce store orders and customers, configure your store API keys in the <strong>Settings</strong> tab.
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('settings')}>
            Configure API
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => onNavigate('customers')}>
          <div className="metric-top">
            <span className="metric-label">Total Customers</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Users size={22} />
            </div>
          </div>
          <div className="metric-value">{totalCustomers}</div>
          <div className="metric-footer" style={{ color: '#10b981' }}>
            <ArrowUpRight size={14} /> Active WooCommerce buyer profiles
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => onNavigate('orders')}>
          <div className="metric-top">
            <span className="metric-label">Total Orders</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <ShoppingCart size={22} />
            </div>
          </div>
          <div className="metric-value">{totalOrders}</div>
          <div className="metric-footer">
            <Clock size={14} /> Across all order lifecycle states
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-top">
            <span className="metric-label">Total Sales Revenue</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(totalSales)}</div>
          <div className="metric-footer" style={{ color: '#34d399' }}>
            <ArrowUpRight size={14} /> From completed & processing orders
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => onNavigate('orders')}>
          <div className="metric-top">
            <span className="metric-label">Action Required</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <AlertCircle size={22} />
            </div>
          </div>
          <div className="metric-value" style={{ color: pendingOrders > 0 ? '#fbbf24' : 'inherit' }}>
            {pendingOrders}
          </div>
          <div className="metric-footer" style={{ color: '#fbbf24' }}>
            Orders pending payment or on-hold
          </div>
        </div>
      </div>

      {/* Analytics & Distribution Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Order Status Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Order Status Breakdown</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{totalOrders} Total Orders</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {statusBreakdown.map((item) => {
              const count = item.count;
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              const colors = {
                completed: '#10b981',
                processing: '#3b82f6',
                pending: '#f59e0b',
                'on-hold': '#8b5cf6',
                cancelled: '#ef4444',
                refunded: '#ec4899'
              };
              const color = colors[item.status.toLowerCase()] || '#6366f1';

              return (
                <div key={item.status} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                      <span className={`badge ${getStatusColor(item.status)}`} style={{ marginRight: '6px', padding: '2px 6px', fontSize: '0.7rem' }}>
                        {item.status}
                      </span>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      <strong>{count}</strong> orders ({pct}%) • {formatCurrency(item.total_sum)}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Follow-up Tasks / Reminders */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--primary)" /> CRM Follow-ups & Reminders
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('communication')}>
              View All
            </button>
          </div>

          {pendingReminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No pending tasks! All customer follow-ups are up to date.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingReminders.map((rem) => {
                const priorityColors = {
                  high: '#ef4444',
                  medium: '#f59e0b',
                  low: '#3b82f6'
                };
                return (
                  <div 
                    key={rem.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px', 
                      padding: '12px 14px', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={false} 
                      onChange={() => onToggleReminder(rem.id, 'completed')}
                      style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      title="Mark task as complete"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                        {rem.task_description}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {rem.first_name && (
                          <span>Customer: <strong>{rem.first_name} {rem.last_name}</strong></span>
                        )}
                        <span>Due: {formatDate(rem.due_date)}</span>
                        <span style={{ 
                          color: priorityColors[rem.priority] || '#94a3b8', 
                          fontWeight: '700', 
                          textTransform: 'uppercase', 
                          fontSize: '0.7rem' 
                        }}>
                          {rem.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Top VIP Customers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Recent Orders */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Recent Orders</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders')}>
              All Orders <ChevronRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      #{ord.id}
                    </td>
                    <td>{ord.customer_name}</td>
                    <td style={{ fontSize: '0.78rem' }}>{formatDate(ord.date_created)}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {formatCurrency(ord.total)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => onViewOrder(ord.id)}
                        title="View order details"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top VIP Customers */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Top VIP Customers</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('customers')}>
              All Customers <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topCustomers.map((c) => (
              <div 
                key={c.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
                onClick={() => onViewCustomer(c.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.first_name + ' ' + c.last_name)}&background=6366f1&color=fff`} 
                    alt={c.first_name}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {c.first_name} {c.last_name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {c.email} • {c.orders_count} orders
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: '#10b981', fontSize: '0.92rem' }}>
                    {formatCurrency(c.total_spent)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Lifetime Value
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
