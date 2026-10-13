import React, { useState } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Video, 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Send, 
  AlertCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function CommunicationView({ 
  customers = [],
  communications = [],
  reminders = [],
  onAddCommunication,
  onDeleteCommunication,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  preselectedCustomer = null
}) {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'reminders', 'emailComposer'

  // New Communication Form State
  const [commCustomerId, setCommCustomerId] = useState(preselectedCustomer?.id || (customers[0]?.id || ''));
  const [commType, setCommType] = useState('email');
  const [commSubject, setCommSubject] = useState('');
  const [commDetails, setCommDetails] = useState('');
  const [commChannel, setCommChannel] = useState('Email');

  // New Reminder Form State
  const [remCustomerId, setRemCustomerId] = useState(preselectedCustomer?.id || (customers[0]?.id || ''));
  const [remDesc, setRemDesc] = useState('');
  const [remDueDate, setRemDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
  const [remPriority, setRemPriority] = useState('medium');

  // Email Composer State
  const [emailCustomerId, setEmailCustomerId] = useState(preselectedCustomer?.id || (customers[0]?.id || ''));
  const [emailSubject, setEmailSubject] = useState('Important Update regarding your recent order');
  const [emailBody, setEmailBody] = useState(`Hi {{name}},\n\nThank you for shopping with us! We wanted to check in and see how everything is going with your recent order.\n\nPlease don't hesitate to reach out if you have any questions or require any assistance.\n\nWarm regards,\nCustomer Care Team`);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const selectedEmailCustomer = customers.find(c => c.id === emailCustomerId) || customers[0] || {};

  const handleTemplateSelect = (templateType) => {
    const custName = selectedEmailCustomer.first_name || 'Valued Customer';
    switch (templateType) {
      case 'thank_you':
        setEmailSubject(`Thank you for your order, ${custName}!`);
        setEmailBody(`Hi ${custName},\n\nWe wanted to extend a personal thank you for your order with our store! We've begun preparing your items with the utmost care.\n\nIf you have any questions about tracking or delivery, feel free to reply directly to this email.\n\nBest regards,\nCustomer Success Team`);
        break;
      case 'shipping_update':
        setEmailSubject(`Shipping Update for ${custName}`);
        setEmailBody(`Hi ${custName},\n\nGreat news! Your package is currently being processed and prepared for carrier pickup.\n\nYou will receive an official tracking number notification as soon as it departs our warehouse.\n\nWarm regards,\nFulfillment Team`);
        break;
      case 'payment_reminder':
        setEmailSubject(`Action Required: Pending payment confirmation for your order`);
        setEmailBody(`Dear ${custName},\n\nWe noticed that your recent checkout is currently awaiting payment confirmation. To ensure your reserved items remain allocated, please complete payment at your earliest convenience.\n\nLet us know if you need assistance with an alternate payment method.\n\nSincerely,\nAccounts Support`);
        break;
      case 'vip_offer':
        setEmailSubject(`Exclusive VIP Invitation for ${custName}`);
        setEmailBody(`Hello ${custName},\n\nAs one of our most valued patrons, we are delighted to share an exclusive preview of our upcoming catalog along with complimentary priority shipping.\n\nThank you for your continued partnership!\n\nExecutive Relations`);
        break;
      default:
        break;
    }
  };

  const handleCreateComm = async (e) => {
    e.preventDefault();
    if (!commCustomerId || !commDetails.trim()) return;
    await onAddCommunication({
      customer_id: commCustomerId,
      type: commType,
      subject: commSubject.trim(),
      details: commDetails.trim(),
      channel: commChannel,
      date: new Date().toISOString()
    });
    setCommSubject('');
    setCommDetails('');
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!remDesc.trim() || !remDueDate) return;
    await onAddReminder({
      customer_id: remCustomerId || null,
      task_description: remDesc.trim(),
      due_date: new Date(remDueDate).toISOString(),
      priority: remPriority
    });
    setRemDesc('');
  };

  const handleCopyDraft = () => {
    const text = `To: ${selectedEmailCustomer.email || ''}\nSubject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleOpenMailto = () => {
    const email = selectedEmailCustomer.email || '';
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');

    // Also optionally log to communication history
    onAddCommunication({
      customer_id: selectedEmailCustomer.id,
      type: 'email',
      subject: emailSubject,
      details: `Prepared and opened in default email client: "${emailSubject}"`,
      channel: 'Email Client (Drafted)',
      date: new Date().toISOString()
    });
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getCommIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'call': return <Phone size={14} color="#60a5fa" />;
      case 'meeting': return <Video size={14} color="#c084fc" />;
      case 'note': return <FileText size={14} color="#fbbf24" />;
      default: return <Mail size={14} color="#34d399" />;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Tab Navigation */}
      <div className="tab-list">
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={15} /> Interaction Timeline ({communications.length})
          </span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} /> Follow-up Tasks & Reminders ({reminders.length})
          </span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'emailComposer' ? 'active' : ''}`}
          onClick={() => setActiveTab('emailComposer')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={15} /> Customer Email Composer
          </span>
        </button>
      </div>

      {/* TAB 1: INTERACTION TIMELINE */}
      {activeTab === 'timeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Timeline Feed */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Recent Communications</h3>
            {communications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No communication records logged yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {communications.map((c) => (
                  <div 
                    key={c.id} 
                    style={{ 
                      padding: '14px', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      background: 'rgba(255, 255, 255, 0.04)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getCommIcon(c.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {c.first_name ? `${c.first_name} ${c.last_name}` : `Customer #${c.customer_id}`}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{formatDate(c.date)}</span>
                      </div>
                      {c.subject && (
                        <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '4px' }}>
                          {c.subject}
                        </div>
                      )}
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                        {c.details}
                      </p>
                      <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Channel: <strong>{c.channel || 'Direct'}</strong> • Type: <strong style={{ textTransform: 'capitalize' }}>{c.type}</strong>
                      </div>
                    </div>
                    <button 
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 6px' }}
                      onClick={() => onDeleteCommunication(c.id)}
                      title="Delete log entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log New Communication Form */}
          <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Log New Interaction</h3>
            <form onSubmit={handleCreateComm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Target Customer:
                </label>
                <select 
                  className="select-field" 
                  value={commCustomerId} 
                  onChange={(e) => setCommCustomerId(e.target.value)}
                  required
                >
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.first_name} {cust.last_name} ({cust.email || `#${cust.id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                    Type:
                  </label>
                  <select 
                    className="select-field" 
                    value={commType} 
                    onChange={(e) => setCommType(e.target.value)}
                  >
                    <option value="email">Email</option>
                    <option value="call">Phone Call</option>
                    <option value="meeting">Video Meeting</option>
                    <option value="note">Internal Note</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                    Channel / Tool:
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Outlook, Zoom, WhatsApp" 
                    value={commChannel}
                    onChange={(e) => setCommChannel(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Subject / Summary:
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Discussed order discount" 
                  value={commSubject}
                  onChange={(e) => setCommSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Interaction Details:
                </label>
                <textarea 
                  className="textarea-field" 
                  rows={4} 
                  placeholder="Record summary of conversation, key points agreed, or action items..."
                  value={commDetails}
                  onChange={(e) => setCommDetails(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Save Communication Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: REMINDERS & TASKS */}
      {activeTab === 'reminders' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Reminders List */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Follow-up Task Checklist</h3>
            {reminders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No tasks registered yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reminders.map((r) => {
                  const isCompleted = r.status === 'completed';
                  const priorityColors = {
                    high: '#ef4444',
                    medium: '#f59e0b',
                    low: '#3b82f6'
                  };
                  return (
                    <div 
                      key={r.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        padding: '14px', 
                        borderRadius: 'var(--radius-md)', 
                        background: isCompleted ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        opacity: isCompleted ? 0.6 : 1
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isCompleted} 
                        onChange={() => onToggleReminder(r.id, isCompleted ? 'pending' : 'completed')}
                        style={{ marginTop: '4px', cursor: 'pointer', width: '17px', height: '17px', accentColor: 'var(--primary)' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '0.88rem', 
                          fontWeight: '500', 
                          color: 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none'
                        }}>
                          {r.task_description}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {r.first_name && (
                            <span>Customer: <strong>{r.first_name} {r.last_name}</strong></span>
                          )}
                          <span>•</span>
                          <span>Due: <strong>{formatDate(r.due_date)}</strong></span>
                          <span>•</span>
                          <span style={{ 
                            color: priorityColors[r.priority] || '#94a3b8', 
                            fontWeight: '700', 
                            textTransform: 'uppercase' 
                          }}>
                            {r.priority}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-danger btn-sm" 
                        style={{ padding: '4px 6px' }}
                        onClick={() => onDeleteReminder(r.id)}
                        title="Delete reminder"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Reminder Form */}
          <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Schedule Follow-up Reminder</h3>
            <form onSubmit={handleCreateReminder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Associated Customer (Optional):
                </label>
                <select 
                  className="select-field" 
                  value={remCustomerId} 
                  onChange={(e) => setRemCustomerId(e.target.value)}
                >
                  <option value="">General CRM Task (No customer linked)</option>
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.first_name} {cust.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Task Description:
                </label>
                <textarea 
                  className="textarea-field" 
                  rows={3} 
                  placeholder="e.g. Call customer to confirm satisfaction with mechanical keyboard..." 
                  value={remDesc}
                  onChange={(e) => setRemDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                    Due Date:
                  </label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={remDueDate}
                    onChange={(e) => setRemDueDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                    Priority:
                  </label>
                  <select 
                    className="select-field" 
                    value={remPriority} 
                    onChange={(e) => setRemPriority(e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Create Follow-up Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL COMPOSER */}
      {activeTab === 'emailComposer' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Customer Email Composer</h3>
              <span className="badge badge-pending" style={{ fontSize: '0.72rem' }}>
                Manual Dispatch (Safe Mode)
              </span>
            </div>

            <div className="banner banner-info" style={{ marginBottom: '16px', fontSize: '0.8rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>Safe Messaging Policy:</strong> In compliance with security standards, emails are generated as structured drafts. You can inspect, modify, and open them directly in your default email client (`mailto:`) or copy the draft. No emails are transmitted without explicit user action.
              </div>
            </div>

            {/* Template Presets */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Quick Presets / Templates:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleTemplateSelect('thank_you')}>
                  Thank You & Setup
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleTemplateSelect('shipping_update')}>
                  Shipping Update
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleTemplateSelect('payment_reminder')}>
                  Payment Follow-up
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleTemplateSelect('vip_offer')}>
                  VIP Exclusive Note
                </button>
              </div>
            </div>

            {/* Email Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Recipient Customer:
                </label>
                <select 
                  className="select-field" 
                  value={emailCustomerId} 
                  onChange={(e) => setEmailCustomerId(e.target.value)}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} &lt;{c.email}&gt;
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Email Subject Line:
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                  Email Message Body:
                </label>
                <textarea 
                  className="textarea-field" 
                  rows={8} 
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleOpenMailto}
                  disabled={!selectedEmailCustomer?.email}
                >
                  <Send size={15} /> Open in Mail App & Log
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCopyDraft}
                >
                  {copiedDraft ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                  {copiedDraft ? 'Copied to Clipboard!' : 'Copy Draft'}
                </button>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '14px' }}>Live Email Preview</h3>
            <div style={{ 
              borderRadius: 'var(--radius-md)', 
              background: '#0d1322', 
              border: '1px solid var(--border-subtle)', 
              overflow: 'hidden' 
            }}>
              <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                <div><strong>To:</strong> {selectedEmailCustomer?.first_name} {selectedEmailCustomer?.last_name} &lt;{selectedEmailCustomer?.email}&gt;</div>
                <div style={{ marginTop: '4px' }}><strong>Subject:</strong> {emailSubject}</div>
              </div>
              <div style={{ padding: '16px', fontSize: '0.86rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {emailBody}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
