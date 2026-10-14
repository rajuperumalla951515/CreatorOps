import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { supabase, getCurrentUser, logAuditEvent } from '../utils/supabase';
import { CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';

interface NotificationState {
  type: 'loading' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

export const OAuthHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState<NotificationState | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // 1. Google OAuth Error / User Cancelled
    if (error) {
      let errorTitle = 'Authorization Failed';
      let errorMsg = `Google OAuth error: ${error}`;

      if (error === 'access_denied') {
        errorTitle = 'Access Denied / Cancelled';
        errorMsg =
          'YouTube connection was cancelled, or your Google account is not on the authorized Test Users list in Google Cloud Console. Once the app completes Google verification or is moved to In Production, any user can connect.';
      } else if (error === 'redirect_uri_mismatch') {
        errorTitle = 'Redirect URI Mismatch';
        errorMsg =
          `The current domain (${window.location.origin}) is not listed in Authorized redirect URIs in Google Cloud Console. Please add it to your OAuth 2.0 Web Client.`;
      } else if (error === 'invalid_client') {
        errorTitle = 'Invalid OAuth Client';
        errorMsg = 'Google Cloud Client ID or secret is invalid or deleted. Check your .env configuration.';
      }

      setNotification({
        type: 'warning',
        title: errorTitle,
        message: errorMsg,
      });

      // Clean query params from browser URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
      const timer = setTimeout(() => setNotification(null), 8000);
      return () => clearTimeout(timer);
    }

    // 2. Google OAuth Success Code Received
    if (code) {
      setNotification({
        type: 'loading',
        title: 'Connecting YouTube Channel',
        message: 'Exchanging Google authorization code with YouTube Data API v3...',
      });

      const verifier = sessionStorage.getItem('yt_code_verifier') || undefined;
      const redirectUri = window.location.origin;

      api
        .handleYoutubeCallback(code, redirectUri, verifier)
        .then(async (res) => {
          sessionStorage.removeItem('yt_code_verifier');
          const channelTitle = res?.profile?.title || 'YouTube Channel';

          // Persist directly to Supabase with authenticated session
          try {
            const user = await getCurrentUser();
            if (user && res?.profile?.channel_id) {
              const recId = `yt_${user.id.slice(0, 8)}_${res.profile.channel_id}`;
              await supabase.from('youtube_channels').upsert(
                {
                  id: recId,
                  user_id: user.id,
                  channel_id: res.profile.channel_id,
                  channel_title: channelTitle,
                  channel_handle: res.profile.handle || res.profile.custom_url || '',
                  avatar_url: res.profile.avatar_url || res.profile.thumbnail_url || '',
                  subscriber_count: String(res.profile.subscriber_count || '0'),
                  video_count: String(res.profile.video_count || '0'),
                  view_count: String(res.profile.view_count || '0'),
                  status: 'active',
                },
                { onConflict: 'user_id,channel_id' }
              );

              await logAuditEvent({
                userId: user.id,
                eventType: 'youtube_connected',
                entityType: 'youtube_channels',
                entityId: res.profile.channel_id,
                description: `Connected YouTube channel: ${channelTitle}`,
                status: 'success',
                payload: { channel_id: res.profile.channel_id, title: channelTitle },
              });
            }
          } catch (syncErr) {
            console.debug('Direct Supabase channel sync skipped:', syncErr);
          }

          setNotification({
            type: 'success',
            title: 'Channel Connected!',
            message: `Successfully connected ${channelTitle} to TubePilot AI Studio.`,
          });

          // Dispatch event to inform all studio pages
          window.dispatchEvent(
            new CustomEvent('tubepilot:channel-updated', { detail: res?.profile })
          );

          // Determine target redirect path (e.g. /app/youtube, /app/accounts, or /app)
          const targetPath =
            state && state.startsWith('/') ? state : '/app/youtube';

          // Clean URL so the code query param is removed
          window.history.replaceState({}, document.title, targetPath);

          if (location.pathname !== targetPath) {
            navigate(targetPath, { replace: true });
          }

          const timer = setTimeout(() => setNotification(null), 4500);
          return () => clearTimeout(timer);
        })
        .catch((err: any) => {
          setNotification({
            type: 'error',
            title: 'Connection Failed',
            message:
              err.message ||
              'Unable to complete OAuth token exchange. Please check your credentials.',
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          const timer = setTimeout(() => setNotification(null), 6000);
          return () => clearTimeout(timer);
        });
    }
  }, []);

  if (!notification) return null;

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.4)';
      case 'error':
        return 'rgba(244, 63, 94, 0.4)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.4)';
      default:
        return 'rgba(139, 92, 246, 0.4)';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0 }} />;
      case 'error':
        return <AlertTriangle size={18} style={{ color: '#F43F5E', flexShrink: 0 }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />;
      default:
        return <Loader2 size={18} className="spin" style={{ color: '#8B5CF6', flexShrink: 0 }} />;
    }
  };

  return (
    <aside
      aria-label="OAuth Notification"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        backgroundColor: 'var(--bg-surface-1)',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        maxWidth: '420px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      className="animate-fadeIn"
    >
      <div style={{ marginTop: '2px' }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px 0' }}>
          {notification.title}
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
          {notification.message}
        </p>
      </div>
      {notification.type !== 'loading' && (
        <button
          onClick={() => setNotification(null)}
          aria-label="Close notification"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          <X size={16} />
        </button>
      )}
    </aside>
  );
};

export default OAuthHandler;
