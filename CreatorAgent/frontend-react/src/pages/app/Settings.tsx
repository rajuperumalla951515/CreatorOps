import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  ShieldCheck,
  Server,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Unlock,
} from 'lucide-react';
import { api } from '../../services/api';

export const Settings: React.FC = () => {
  const [creatorKey, setCreatorKey] = useState<string>(
    () => localStorage.getItem('tubepilot_creator_key') || localStorage.getItem('creatorops_access_key') || ''
  );
  const [keyInput, setKeyInput] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<string>('Checking...');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      setBackendHealth(res.status === 'ok' ? 'Online (v3.0.0)' : 'Degraded');
    } catch {
      setBackendHealth('Offline (Ensure FastAPI is running)');
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    api.setCreatorKey(keyInput.trim());
    setCreatorKey(keyInput.trim());
    setKeyInput('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearKey = () => {
    api.clearCreatorKey();
    setCreatorKey('');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>Studio Settings</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your security credentials, backend configuration, and storage policies.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Creator Access Key */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Key size={18} style={{ color: 'var(--accent-violet)' }} />
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0 }}>Creator Access Key</h3>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
            If your backend environment is secured with a <code style={{ color: 'var(--accent-cyan)' }}>CREATOR_ACCESS_KEY</code>, enter it below to authorize studio API calls and unlocks.
          </p>

          {creatorKey ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" />
                <span style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>Creator Key is configured & active</span>
              </div>
              <button
                onClick={handleClearKey}
                className="btn btn-secondary btn-sm"
                style={{ color: '#EF4444', fontSize: '0.78rem' }}
              >
                Clear Key
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveKey} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input
                type="password"
                className="input-field"
                placeholder="Enter CREATOR_ACCESS_KEY..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!keyInput.trim()}>
                Save Key
              </button>
            </form>
          )}

          {saveSuccess && (
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)' }}>
              Key saved to secure browser local storage.
            </div>
          )}
        </div>

        {/* System & Storage Diagnostics */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Server size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0 }}>System Health & Database</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>FastAPI Engine Status</span>
              <span style={{ fontWeight: 600, color: backendHealth.startsWith('Online') ? 'var(--accent-emerald)' : '#EF4444' }}>
                {backendHealth}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Database Engine</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>SQLite (CreatorAgent/data/tubepilot.db)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Scratch Storage Retention</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>Automatic purge after 72 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
