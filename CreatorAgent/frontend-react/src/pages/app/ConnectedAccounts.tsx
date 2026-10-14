import React, { useState, useEffect } from 'react';
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  Lock,
} from 'lucide-react';
import { YouTubeIcon } from '../../components/YouTubeIcon';
import { api } from '../../services/api';
import type { YtProfile } from '../../services/api';
import { getCurrentUser, getConnectedYouTubeChannel, supabase, logAuditEvent } from '../../utils/supabase';

const API_BASE = (
  import.meta.env.VITE_API_BASE !== undefined
    ? import.meta.env.VITE_API_BASE
    : (window.location.port === '5173' ? 'http://localhost:8000' : '')
).replace(/\/$/, '');

export const ConnectedAccounts: React.FC = () => {
  const [profile, setProfile] = useState<YtProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadProfile();
    const handleChannelUpdate = () => {
      loadProfile();
    };
    window.addEventListener('tubepilot:channel-updated', handleChannelUpdate);
    return () => {
      window.removeEventListener('tubepilot:channel-updated', handleChannelUpdate);
    };
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getYoutubeProfile();
      if (data) {
        setProfile(data);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback to Supabase direct
    }

    try {
      const user = await getCurrentUser();
      if (user) {
        const supaChannel = await getConnectedYouTubeChannel(user.id);
        if (supaChannel) {
          setProfile({
            channel_id: supaChannel.channel_id,
            title: supaChannel.channel_title,
            handle: supaChannel.channel_handle,
            avatar_url: supaChannel.avatar_url,
            subscriber_count: supaChannel.subscriber_count,
            video_count: supaChannel.video_count,
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setProfile(null);
    setLoading(false);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await api.getYoutubeAuthUrl(window.location.pathname, window.location.origin);
      if (res.code_verifier) {
        sessionStorage.setItem('yt_code_verifier', res.code_verifier);
      }
      window.location.href = res.auth_url;
    } catch (err: any) {
      console.warn('API auth-url request failed, attempting direct login route:', err);
      try {
        window.location.href = `${API_BASE}/api/youtube/login?redirect_uri=${encodeURIComponent(window.location.origin)}&state=${encodeURIComponent(window.location.pathname)}`;
        return;
      } catch {
        // Continue to alert
      }
      const msg =
        err?.message === 'Failed to fetch'
          ? 'Cannot connect to TubePilot backend server on port 8000. Please ensure the backend is running (python CreatorAgent/Backend/api_server.py).'
          : (err?.message || 'Failed to initialize Google OAuth flow.');
      alert(msg);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this YouTube channel?')) return;
    setIsDisconnecting(true);
    try {
      await api.disconnectYoutube().catch(() => {});
      const user = await getCurrentUser();
      if (user) {
        await supabase.from('youtube_channels').delete().eq('user_id', user.id);
        await logAuditEvent({
          userId: user.id,
          eventType: 'youtube_disconnected',
          entityType: 'youtube_channels',
          description: 'Disconnected YouTube channel from Connected Accounts',
          status: 'success',
        });
      }
      setProfile(null);
      window.dispatchEvent(new CustomEvent('tubepilot:channel-updated', { detail: null }));
    } catch {
      alert('Disconnect request failed.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>Connected Accounts & Integrations</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Manage third-party platform authorizations and review OAuth token security boundaries.
        </p>
      </div>

      {/* YouTube / Google Account Card */}
      <div className="studio-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
              }}
            >
              <YouTubeIcon size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', margin: 0 }}>YouTube Channel (Google OAuth)</h3>
                <span className={`badge badge-${profile ? 'emerald' : 'violet'}`}>
                  {profile ? 'Authorized' : 'Disconnected'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Official YouTube Data API v3 OAuth Integration
              </p>
            </div>
          </div>

          {profile ? (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444' }}
            >
              <LogOut size={14} /> Disconnect Channel
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isConnecting ? <span className="spin">⟳</span> : <YouTubeIcon size={14} />} Connect Channel
            </button>
          )}
        </div>

        {profile && (
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.title)}`}
              alt={profile.title}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>{profile.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {profile.subscriber_count} subscribers • Channel ID: {profile.channel_id}
              </div>
            </div>
          </div>
        )}

        {/* OAuth Scopes & Transparency */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '12px' }}>Requested OAuth Scopes & Justification</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>youtube.upload</span>
              <span style={{ color: 'var(--text-secondary)' }}>Enables publishing your rendered videos only upon explicit confirmation.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '6px' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>youtube.readonly</span>
              <span style={{ color: 'var(--text-secondary)' }}>Displays your channel handle, avatar, and verify upload status.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revocation Security Notice */}
      <div className="studio-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} style={{ color: 'var(--accent-emerald)' }} /> Third-Party Token Revocation
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
          You can unconditionally revoke TubePilot AI's access to your Google Account at any time directly through Google's Account Security Center.
        </p>
        <a
          href="https://myaccount.google.com/permissions"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ExternalLink size={14} /> Open Google Account Permissions Portal
        </a>
      </div>
    </div>
  );
};
