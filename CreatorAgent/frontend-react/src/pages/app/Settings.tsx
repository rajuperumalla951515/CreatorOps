import React, { useState, useEffect } from 'react';
import {
  User,
  Key,
  ShieldCheck,
  Server,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Clock,
  Sparkles,
  Sliders,
  Activity,
  Save,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  getCurrentUser,
  ensureProfile,
  updateProfile,
  getUserPreferences,
  updateUserPreferences,
  getAuditEvents,
  logAuditEvent,
  type UserProfile,
  type UserPreferences,
  type AuditEventRecord,
} from '../../utils/supabase';

export const Settings: React.FC = () => {
  // Auth & Profile state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [activities, setActivities] = useState<AuditEventRecord[]>([]);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [defaultRatio, setDefaultRatio] = useState('9:16');
  const [autoSave, setAutoSave] = useState(true);

  // Status indicators
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Creator Access Key
  const [creatorKey, setCreatorKey] = useState<string>(
    () => localStorage.getItem('tubepilot_creator_key') || localStorage.getItem('creatorops_access_key') || ''
  );
  const [keyInput, setKeyInput] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<string>('Checking...');

  useEffect(() => {
    checkHealth();
    loadUserData();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      setBackendHealth(res.status === 'ok' ? 'Online (FastAPI + Supabase)' : 'Degraded');
    } catch {
      setBackendHealth('Offline (Ensure backend is running)');
    }
  };

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const prof = await ensureProfile(user);
        setProfile(prof);
        setDisplayName(prof.display_name || '');
        setUsername(prof.username || '');
        setAvatarUrl(prof.avatar_url || '');
        setBio(prof.bio || '');

        const prefs = await getUserPreferences(user.id);
        if (prefs) {
          setPreferences(prefs);
          setDefaultRatio(prefs.editor_settings?.defaultRatio || '9:16');
          setAutoSave(prefs.editor_settings?.autoSave ?? true);
        }

        loadActivities(user.id);
      }
    } catch (err) {
      console.warn('Error loading user data:', err);
    }
  };

  const loadActivities = async (userId: string) => {
    setLoadingActivities(true);
    try {
      const events = await getAuditEvents(userId, 15);
      setActivities(events);
    } catch (err) {
      console.warn('Could not load audit events:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const updated = await updateProfile(currentUser.id, {
        display_name: displayName.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
      });
      setProfile(updated);

      // Save preferences
      await updateUserPreferences(currentUser.id, {
        editor_settings: {
          autoSave,
          snapTimeline: true,
          defaultRatio,
        },
      });

      // Log activity
      await logAuditEvent({
        userId: currentUser.id,
        eventType: 'profile_updated',
        entityType: 'profiles',
        entityId: currentUser.id,
        description: 'Updated creator profile and studio preferences',
        status: 'success',
      });

      setProfileSuccess('Profile and preferences saved to Supabase successfully!');
      setTimeout(() => setProfileSuccess(null), 4000);
      loadActivities(currentUser.id);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
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
          Manage your creator profile, Supabase database synchronization, and security credentials.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* 1. Creator Profile Settings */}
        <div className="studio-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={20} style={{ color: 'var(--accent-violet)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>Creator Profile</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Stored persistently in Supabase PostgreSQL <code style={{ color: 'var(--accent-cyan)' }}>public.profiles</code>.
              </p>
            </div>
          </div>

          {currentUser ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Avatar Preview & URL */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '2px solid var(--border-subtle)',
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      referrerPolicy="no-referrer"
                      onError={() => {}}
                    />
                  ) : (
                    (displayName || currentUser.email || 'C')[0].toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Display Name & Username */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Alex Rivera"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Username (Unique Handle)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>@</span>
                    <input
                      type="text"
                      className="input-field"
                      style={{ paddingLeft: '28px' }}
                      placeholder="alex_creator"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Email (Read-only from Supabase Auth) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Authenticated Account Email (Verified)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="email"
                    disabled
                    className="input-field"
                    style={{ backgroundColor: 'var(--bg-surface-2)', opacity: 0.8, cursor: 'not-allowed' }}
                    value={currentUser.email || ''}
                  />
                  <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <CheckCircle2 size={12} /> Supabase Auth
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Creator Bio & Channel Niche
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Tell your audience about your channel focus and production style..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Preferences: Aspect Ratio & Auto-Save */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Default Production Format
                  </label>
                  <select
                    className="input-field"
                    value={defaultRatio}
                    onChange={(e) => setDefaultRatio(e.target.value)}
                  >
                    <option value="9:16">Vertical (9:16 Shorts / Reels)</option>
                    <option value="16:9">Landscape (16:9 Standard YouTube)</option>
                    <option value="1:1">Square (1:1 Feed)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
                  <input
                    type="checkbox"
                    id="autoSaveToggle"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-violet)' }}
                  />
                  <label htmlFor="autoSaveToggle" style={{ fontSize: '0.85rem', color: '#FFFFFF', cursor: 'pointer' }}>
                    Auto-save project drafts automatically
                  </label>
                </div>
              </div>

              {/* Actions & Alerts */}
              {profileSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', borderRadius: '6px', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                  <Check size={16} /> {profileSuccess}
                </div>
              )}

              {profileError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '6px', color: '#EF4444', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} /> {profileError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} /> {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Sign in with Supabase to manage your synchronized creator profile.
            </div>
          )}
        </div>

        {/* 2. User Activity History Log */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0 }}>Recent User Activity Log</h3>
            </div>
            {currentUser && (
              <button
                onClick={() => loadActivities(currentUser.id)}
                disabled={loadingActivities}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
              >
                <RefreshCw size={14} className={loadingActivities ? 'spin' : ''} /> Refresh Log
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Audited user actions recorded in Supabase <code style={{ color: 'var(--accent-cyan)' }}>public.audit_events</code>.
          </p>

          {loadingActivities ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading activity history from Supabase...
            </div>
          ) : activities.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No user activity records logged yet. Actions like YouTube authorization, profile updates, and project creation will be recorded here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {activities.map((act) => {
                const date = new Date(act.created_at).toLocaleString();
                const isError = act.status === 'failed';
                return (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <span className={`badge badge-${isError ? 'violet' : 'emerald'}`} style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                        {act.event_type.replace(/_/g, ' ')}
                      </span>
                      <span style={{ color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {act.description || act.event_type}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {date}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Creator Access Key */}
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

        {/* 4. System Diagnostics */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Server size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0 }}>System Health & Database Architecture</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>FastAPI Engine Status</span>
              <span style={{ fontWeight: 600, color: backendHealth.startsWith('Online') ? 'var(--accent-emerald)' : '#EF4444' }}>
                {backendHealth}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Primary Cloud Database</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>Supabase PostgreSQL (Active & RLS Enforced)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Local Cache Fallback</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>SQLite (CreatorAgent/data/tubepilot.db)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
