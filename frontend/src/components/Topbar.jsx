import React from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Wifi } from 'lucide-react';

export default function Topbar({ 
  title, 
  onSync, 
  isSyncing, 
  lastSync, 
  syncStatus, 
  isConfigured, 
  isDemo 
}) {
  const formatTime = (timeStr) => {
    if (!timeStr || timeStr.includes('Never')) return 'Never';
    try {
      const d = new Date(timeStr);
      return isNaN(d.getTime()) ? timeStr : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
    } catch {
      return timeStr;
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isConfigured ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
              <Wifi size={14} /> WC API Connected
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b' }}>
              <AlertTriangle size={14} /> Unconnected (Demo Mode)
            </span>
          )}
          <span>•</span>
          <span>Last Sync: <strong style={{ color: 'var(--text-secondary)' }}>{formatTime(lastSync)}</strong></span>
        </div>

        <button 
          id="sync-wc-btn"
          className="btn btn-primary" 
          onClick={onSync} 
          disabled={isSyncing}
          title="Fetch latest customer and order updates from WooCommerce"
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin-slow' : ''} />
          {isSyncing ? 'Syncing Store Data...' : 'Sync from WooCommerce'}
        </button>
      </div>
    </header>
  );
}
