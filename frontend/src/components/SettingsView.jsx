import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle, 
  Sparkles, 
  ExternalLink,
  Lock,
  DollarSign
} from 'lucide-react';

export default function SettingsView({ 
  settings, 
  onSaveSettings, 
  onTestConnection, 
  onSync, 
  onResetDemo, 
  isSyncing 
}) {
  const [storeUrl, setStoreUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [storeCurrency, setStoreCurrency] = useState('USD');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreUrl(settings.storeUrl || '');
      setStoreCurrency(settings.storeCurrency || 'USD');
    }
  }, [settings]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection({
        storeUrl,
        consumerKey,
        consumerSecret
      });
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    await onSaveSettings({
      storeUrl,
      consumerKey: consumerKey || undefined,
      consumerSecret: consumerSecret || undefined,
      storeCurrency
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Security Banner */}
      <div className="banner banner-info" style={{ marginBottom: '24px' }}>
        <ShieldCheck size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Enterprise Security Guarantee:</strong> Your WooCommerce API Consumer Key and Consumer Secret are encrypted and stored solely in backend environment storage (`backend/.env` / local SQLite). They are never transmitted or exposed in the frontend browser bundle.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Credentials Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--primary)" /> Store API Credentials
            </h3>
            {settings?.isConfigured ? (
              <span className="badge badge-live">Configured</span>
            ) : (
              <span className="badge badge-demo">Demo Fallback</span>
            )}
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                WooCommerce Store Base URL:
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="url" 
                  className="input-field" 
                  style={{ paddingLeft: '38px' }} 
                  placeholder="https://yourstore.com" 
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  required
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Must be an active WordPress site with WooCommerce and HTTPS enabled.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Consumer Key (ck_...):
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)' }} 
                  placeholder={settings?.consumerKeyMasked || "ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"} 
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Consumer Secret (cs_...):
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)' }} 
                  placeholder={settings?.hasSecret ? "••••••••••••••••••••••••••••••••" : "cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"} 
                  value={consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Store Currency:
              </label>
              <select 
                className="select-field" 
                value={storeCurrency} 
                onChange={(e) => setStoreCurrency(e.target.value)}
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
              </select>
            </div>

            {testResult && (
              <div className={`banner ${testResult.success ? 'banner-success' : 'banner-error'}`} style={{ marginTop: '4px' }}>
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <div style={{ fontSize: '0.82rem' }}>
                  {testResult.message}
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="banner banner-success" style={{ marginTop: '4px' }}>
                <CheckCircle2 size={16} />
                <div style={{ fontSize: '0.82rem' }}>
                  Settings saved successfully!
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleTest}
                disabled={testing}
              >
                <RefreshCw size={14} className={testing ? 'animate-spin-slow' : ''} />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Sync Controls & Diagnostics */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px' }}>Synchronization Operations</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Sync Timestamp</div>
              <div style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                {settings?.lastSync || 'Never'}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Sync Engine State</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {settings?.syncStatus || 'Idle'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn btn-accent" 
              style={{ width: '100%' }}
              onClick={onSync}
              disabled={isSyncing}
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin-slow' : ''} />
              {isSyncing ? 'Synchronizing with WooCommerce...' : 'Perform Full Store Sync'}
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={onResetDemo}
            >
              <Sparkles size={16} /> Reload Demo Data (Testing Mode)
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Setup Guide */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="var(--primary)" /> How to Generate WooCommerce REST API Keys (Beginner Guide)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.88rem', marginBottom: '4px' }}>
              1. Open WordPress Admin
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Log in to your WordPress administrator dashboard (e.g. <code>https://mystore.com/wp-admin</code>).
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.88rem', marginBottom: '4px' }}>
              2. Go to WooCommerce REST API
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Navigate to <strong>WooCommerce</strong> &gt; <strong>Settings</strong> &gt; <strong>Advanced</strong> &gt; <strong>REST API</strong> tab.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.88rem', marginBottom: '4px' }}>
              3. Generate Key with Read/Write
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Click <strong>Add Key</strong>. Set Description to <code>CRM Dashboard</code> and Permissions to <strong>Read/Write</strong>.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.88rem', marginBottom: '4px' }}>
              4. Enable Pretty Permalinks
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Under <strong>Settings</strong> &gt; <strong>Permalinks</strong>, ensure permalinks are set to <strong>Post name</strong> (required for REST endpoints).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
