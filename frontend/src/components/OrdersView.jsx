import React from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CreditCard, 
  User, 
  ShoppingBag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function OrdersView({ 
  orders = [], 
  total = 0, 
  statusFilter = 'all', 
  setStatusFilter, 
  search = '', 
  setSearch, 
  onViewOrder,
  onViewCustomer 
}) {
  const formatCurrency = (val, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const statusTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'processing', label: 'Processing' },
    { id: 'pending', label: 'Pending Payment' },
    { id: 'on-hold', label: 'On Hold' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'refunded', label: 'Refunded' }
  ];

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
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
      {/* Status Filter Tabs */}
      <div className="tab-list" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Meta Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div className="search-box">
          <Search size={17} className="search-icon" />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by order ID, customer name, email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Showing <strong>{orders.length}</strong> of {total} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date Placed</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No orders found matching the filter "{statusFilter}".
                </td>
              </tr>
            ) : (
              orders.map((ord) => {
                const itemsCount = (ord.line_items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
                return (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          #{ord.id}
                        </span>
                        {ord.is_demo === 1 && (
                          <span className="badge badge-demo" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>Demo</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div>
                        <div 
                          style={{ fontWeight: '600', color: 'var(--text-primary)', cursor: ord.customer_id && ord.customer_id !== '0' ? 'pointer' : 'default', textDecoration: ord.customer_id && ord.customer_id !== '0' ? 'underline' : 'none' }}
                          onClick={() => ord.customer_id && ord.customer_id !== '0' && onViewCustomer && onViewCustomer(ord.customer_id)}
                        >
                          {ord.customer_name || 'Guest Customer'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {ord.customer_email || 'No email registered'}
                        </div>
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDate(ord.date_created)}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <ShoppingBag size={13} color="var(--text-muted)" /> {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {ord.payment_method_title || 'Standard Checkout'}
                    </td>

                    <td>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {formatCurrency(ord.total, ord.currency)}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => onViewOrder(ord.id)}
                        title="View complete order breakdown"
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
