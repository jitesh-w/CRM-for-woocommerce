import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  Plus, 
  Trash2, 
  FileText, 
  MessageSquare, 
  Clock, 
  Eye,
  Send
} from 'lucide-react';

export default function CustomerModal({ 
  customer, 
  onClose, 
  onAddNote, 
  onDeleteNote, 
  onViewOrder,
  onComposeEmail
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('CRM Support');
  const [submittingNote, setSubmittingNote] = useState(false);

  if (!customer) return null;

  const billing = customer.billing_address || {};
  const shipping = customer.shipping_address || {};
  const orders = customer.orders || [];
  const notes = customer.notes || [];
  const communications = customer.communications || [];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    await onAddNote(customer.id, newNote.trim(), noteAuthor);
    setNewNote('');
    setSubmittingNote(false);
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

  const avatar = customer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((customer.first_name || 'Guest') + ' ' + (customer.last_name || ''))}&background=6366f1&color=fff`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={avatar} 
              alt={customer.first_name} 
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                  {customer.first_name} {customer.last_name}
                </h2>
                {customer.is_demo === 1 && <span className="badge badge-demo">Demo</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                <span>ID: #{customer.id}</span>
                <span>•</span>
                <span>Customer since {new Date(customer.date_created).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                onComposeEmail && onComposeEmail(customer);
              }}
            >
              <Send size={13} /> Email Customer
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onClose} 
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Quick Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lifetime Revenue</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>{formatCurrency(customer.total_spent)}</div>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#60a5fa' }}>{customer.orders_count || orders.length}</div>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg. Order Value</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#c084fc' }}>
                {formatCurrency(customer.orders_count > 0 ? customer.total_spent / customer.orders_count : 0)}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tab-list">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              Overview & Addresses
            </button>
            <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              Order History ({orders.length})
            </button>
            <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
              CRM Notes ({notes.length})
            </button>
            <button className={`tab-btn ${activeTab === 'comms' ? 'active' : ''}`} onClick={() => setActiveTab('comms')}>
              Communications ({communications.length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--primary)" /> Billing Details
                </h4>
                <div style={{ fontSize: '0.88rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  <div><strong>{billing.first_name || customer.first_name} {billing.last_name || customer.last_name}</strong></div>
                  <div>{billing.address_1 || 'No address specified'}</div>
                  {billing.address_2 && <div>{billing.address_2}</div>}
                  <div>{[billing.city, billing.state, billing.postcode].filter(Boolean).join(', ')}</div>
                  <div>{billing.country || ''}</div>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>Email: <strong style={{ color: 'var(--text-primary)' }}>{billing.email || customer.email}</strong></div>
                    <div>Phone: <strong style={{ color: 'var(--text-primary)' }}>{billing.phone || customer.phone || 'N/A'}</strong></div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#06b6d4" /> Shipping Destination
                </h4>
                <div style={{ fontSize: '0.88rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  <div><strong>{shipping.first_name || customer.first_name} {shipping.last_name || customer.last_name}</strong></div>
                  <div>{shipping.address_1 || 'Same as billing address'}</div>
                  {shipping.address_2 && <div>{shipping.address_2}</div>}
                  <div>{[shipping.city, shipping.state, shipping.postcode].filter(Boolean).join(', ')}</div>
                  <div>{shipping.country || ''}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Orders */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No orders recorded for this customer yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: '600' }}>#{ord.id}</td>
                          <td style={{ fontSize: '0.78rem' }}>{formatDate(ord.date_created)}</td>
                          <td>{(ord.line_items || []).length} items</td>
                          <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(ord.total)}</td>
                          <td><span className={`badge ${getStatusBadge(ord.status)}`}>{ord.status}</span></td>
                          <td>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => {
                                onClose();
                                onViewOrder(ord.id);
                              }}
                            >
                              <Eye size={13} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: CRM Notes */}
          {activeTab === 'notes' && (
            <div>
              {/* Add Note Form */}
              <form onSubmit={handleAddNoteSubmit} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Staff author (e.g. Lead Support, Sales Exec)" 
                    style={{ maxWidth: '240px' }}
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                  />
                </div>
                <textarea 
                  className="textarea-field" 
                  rows={3} 
                  placeholder="Add internal CRM note about customer preferences, commitments, or VIP notes..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submittingNote}>
                    <Plus size={14} /> Add Customer Note
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No notes logged yet. Use the form above to add an internal note.
                  </div>
                ) : (
                  notes.map((n) => (
                    <div 
                      key={n.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <strong style={{ color: 'var(--primary)' }}>{n.author}</strong>
                          <span>•</span>
                          <span>{formatDate(n.created_at)}</span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                          {n.content}
                        </p>
                      </div>

                      <button 
                        className="btn btn-danger btn-sm" 
                        style={{ padding: '4px 8px' }}
                        onClick={() => onDeleteNote(n.id)}
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Communications */}
          {activeTab === 'comms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {communications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No communications logged yet for this customer.
                </div>
              ) : (
                communications.map((comm) => (
                  <div 
                    key={comm.id}
                    style={{ 
                      padding: '12px 14px', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-subtle)' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="badge badge-processing" style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>
                        {comm.type} ({comm.channel || 'Direct'})
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(comm.date)}</span>
                    </div>
                    {comm.subject && (
                      <div style={{ fontWeight: '600', fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {comm.subject}
                      </div>
                    )}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {comm.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
