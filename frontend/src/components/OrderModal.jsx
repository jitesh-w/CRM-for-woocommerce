import React from 'react';
import { 
  X, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Calendar, 
  User, 
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function OrderModal({ order, onClose, onViewCustomer }) {
  if (!order) return null;

  const lineItems = order.line_items || [];
  const billing = order.billing || {};
  const shipping = order.shipping || {};

  const formatCurrency = (val, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Order #{order.id}</h2>
              <span className={`badge ${getStatusBadge(order.status)}`}>
                {order.status}
              </span>
              {order.is_demo === 1 && <span className="badge badge-demo">Demo</span>}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Placed on {formatDate(order.date_created)}
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Customer & Payment Info Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={13} color="var(--primary)" /> Customer Info
              </div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {order.customer_name || 'Guest Customer'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {order.customer_email || 'No email specified'}
              </div>
              {order.customer_id && order.customer_id !== '0' && (
                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '8px', fontSize: '0.75rem', padding: '4px 8px' }}
                  onClick={() => {
                    onClose();
                    onViewCustomer && onViewCustomer(order.customer_id);
                  }}
                >
                  <ExternalLink size={12} /> Open Customer 360
                </button>
              )}
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CreditCard size={13} color="#10b981" /> Payment & Currency
              </div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {order.payment_method_title || 'Direct Checkout'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Currency: <strong>{order.currency || 'USD'}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Total: <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{formatCurrency(order.total, order.currency)}</strong>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={16} color="var(--primary)" /> Ordered Items ({lineItems.length})
            </h3>
            
            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        No product item details recorded for this order.
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {item.name}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          x{item.quantity || 1}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {formatCurrency(item.price, order.currency)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {formatCurrency(item.total || (item.price * (item.quantity || 1)), order.currency)}
                        </td>
                      </tr>
                    ))
                  )}
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: '700' }}>
                      Grand Total:
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: '#10b981', fontSize: '1.05rem' }}>
                      {formatCurrency(order.total, order.currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Addresses Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', marginBottom: '8px' }}>
                Billing Address
              </div>
              <div>{billing.first_name} {billing.last_name}</div>
              <div>{billing.address_1 || 'No billing address'}</div>
              {billing.address_2 && <div>{billing.address_2}</div>}
              <div>{[billing.city, billing.state, billing.postcode].filter(Boolean).join(', ')}</div>
              <div>{billing.country}</div>
              {billing.phone && <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>Tel: {billing.phone}</div>}
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', marginBottom: '8px' }}>
                Shipping Address
              </div>
              <div>{shipping.first_name || billing.first_name} {shipping.last_name || billing.last_name}</div>
              <div>{shipping.address_1 || billing.address_1 || 'Same as billing address'}</div>
              {shipping.address_2 && <div>{shipping.address_2}</div>}
              <div>{[shipping.city || billing.city, shipping.state || billing.state, shipping.postcode || billing.postcode].filter(Boolean).join(', ')}</div>
              <div>{shipping.country || billing.country}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
