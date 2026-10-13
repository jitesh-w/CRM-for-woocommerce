import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  ArrowUpDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function CustomersView({ 
  customers = [], 
  total = 0, 
  search = '', 
  setSearch, 
  sortBy = 'total_spent', 
  setSortBy, 
  onViewCustomer,
  onComposeEmail
}) {
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

  return (
    <div className="animate-fade-in">
      {/* Header Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div className="search-box">
          <Search size={17} className="search-icon" />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search name, email, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sort by:</span>
          <select 
            className="select-field" 
            style={{ width: 'auto', padding: '8px 14px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="total_spent">Total Spent (High to Low)</option>
            <option value="orders_count">Order Count (High to Low)</option>
            <option value="date_created">Registration Date (Newest)</option>
            <option value="first_name">Customer Name (A-Z)</option>
          </select>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
            Showing <strong>{customers.length}</strong> of {total}
          </span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Info</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Lifetime Value</th>
              <th>Registered</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No customer records found matching "{search}".
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const billing = c.billing_address || {};
                const location = [billing.city, billing.state, billing.country].filter(Boolean).join(', ') || 'N/A';
                const avatar = c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((c.first_name || 'Guest') + ' ' + (c.last_name || ''))}&background=4f46e5&color=fff`;

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={avatar} 
                          alt={c.first_name} 
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {c.first_name} {c.last_name}
                            {c.is_demo === 1 && (
                              <span className="badge badge-demo" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>Demo</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            ID: #{c.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Mail size={13} color="var(--text-muted)" /> {c.email || 'No email'}
                        </span>
                        {c.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                            <Phone size={13} /> {c.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem' }}>
                        <MapPin size={13} color="var(--text-muted)" /> {location}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <ShoppingBag size={14} color="var(--text-muted)" /> {c.orders_count}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', color: '#10b981', fontSize: '0.92rem' }}>
                        {formatCurrency(c.total_spent)}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Calendar size={13} /> {formatDate(c.date_created)}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => onComposeEmail && onComposeEmail(c)}
                          title="Prepare Email"
                        >
                          <Mail size={13} />
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => onViewCustomer(c.id)}
                          title="Open 360 Profile"
                        >
                          <Eye size={13} /> Profile
                        </button>
                      </div>
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
