import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Link2,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Video,
  Clock,
  Eye,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { YouTubeIcon } from '../../components/YouTubeIcon';
import { ProfileSkeleton, TableSkeleton } from '../../components/skeletons';
import { api } from '../../services/api';
import type { YtProfile, PublishingJob } from '../../services/api';

const API_BASE = (
  import.meta.env.VITE_API_BASE !== undefined
    ? import.meta.env.VITE_API_BASE
    : (window.location.port === '5173' ? 'http://localhost:8000' : '')
).replace(/\/$/, '');

export const YouTubeStudio: React.FC = () => {
  const [profile, setProfile] = useState<YtProfile | null>(null);
  const [publishingJobs, setPublishingJobs] = useState<PublishingJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    const handleChannelUpdate = () => {
      loadData();
    };
    window.addEventListener('tubepilot:channel-updated', handleChannelUpdate);
    return () => {
      window.removeEventListener('tubepilot:channel-updated', handleChannelUpdate);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prof, history] = await Promise.all([
        api.getYoutubeProfile().catch(() => null),
        api.getPublishingHistory().catch(() => []),
      ]);
      setProfile(prof);
      setPublishingJobs(history);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await api.getYoutubeAuthUrl(window.location.pathname);
      if (res.code_verifier) {
        sessionStorage.setItem('yt_code_verifier', res.code_verifier);
      }
      window.location.href = res.auth_url;
    } catch (err: any) {
      console.warn('API auth-url request failed, attempting direct login route:', err);
      try {
        window.location.href = `${API_BASE}/api/youtube/login?state=${encodeURIComponent(window.location.pathname)}`;
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
    if (!confirm('Disconnect your YouTube channel from TubePilot AI? You will need to re-authorize via Google OAuth to upload videos.')) return;
    setIsDisconnecting(true);
    try {
      await api.disconnectYoutube();
      setProfile(null);
      window.dispatchEvent(new CustomEvent('tubepilot:channel-updated', { detail: null }));
    } catch {
      alert('Could not complete disconnection request.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>YouTube Studio Integration</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Official YouTube Data API v3 publishing pipeline, channel metrics, and upload management.
          </p>
        </div>

        {profile ? (
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}
          >
            <LogOut size={16} /> Disconnect Channel
          </button>
        ) : (
          <a
            href={`${API_BASE}/api/youtube/login`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <YouTubeIcon size={16} /> Authorize YouTube via Google OAuth
          </a>
        )}
      </div>

      {/* Channel Card Banner */}
      {loading ? (
        <ProfileSkeleton className="mb-8" />
      ) : profile ? (
        <div
          className="studio-card"
          style={{
            padding: '28px',
            marginBottom: '32px',
            borderLeft: '4px solid #EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img
              src={
                profile.avatar_url && profile.avatar_url.trim().length > 0
                  ? profile.avatar_url
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.title)}&background=ef4444&color=fff`
              }
              alt={profile.title}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(239, 68, 68, 0.4)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', margin: 0 }}>{profile.title}</h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  <CheckCircle2 size={12} /> Authorized Channel
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {profile.handle || 'YouTube Creator'} • Channel ID: <span style={{ fontFamily: 'monospace' }}>{profile.channel_id || 'UC...'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF' }}>{profile.subscriber_count}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Subscribers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF' }}>{profile.video_count}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Videos</div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="btn btn-secondary btn-sm"
              style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} /> Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="studio-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '32px' }}>
          <YouTubeIcon size={48} style={{ color: '#EF4444', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '8px' }}>No YouTube Channel Connected</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
            Connect your YouTube channel via Google OAuth to enable direct, one-click video publishing, thumbnail uploads, and scheduling directly from TubePilot AI.
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {isConnecting ? <span className="spin">⟳</span> : <YouTubeIcon size={16} />} Connect YouTube Channel
          </button>
        </div>
      )}

      {/* Quota & Safety Notice */}
      <div className="studio-card" style={{ padding: '20px', marginBottom: '32px', backgroundColor: 'var(--bg-surface-2)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '4px' }}>Official YouTube API Compliance & Safety</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              TubePilot AI respects Google API Services User Data Policy and the YouTube Developer Terms of Service. Under no circumstance are videos uploaded without explicit human confirmation. Client secrets and OAuth refresh tokens are securely retained exclusively on the backend server with least-privilege scopes.
            </p>
          </div>
        </div>
      </div>

      {/* Publishing History Table */}
      <div className="studio-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>Publishing History & Upload Queue</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{publishingJobs.length} uploads recorded</span>
        </div>

        {loading ? (
          <TableSkeleton rows={4} columns={4} />
        ) : publishingJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Video size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.88rem' }}>No upload history recorded yet.</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem' }}>
              Render a video in the Studio Workspace to publish your first video.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {publishingJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF' }}>{job.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Visibility: <strong style={{ color: '#FFFFFF', textTransform: 'capitalize' }}>{job.privacy}</strong> •{' '}
                    {new Date(job.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge badge-${job.status === 'published' ? 'emerald' : job.status === 'failed' ? 'violet' : 'cyan'}`}>
                    {job.status}
                  </span>
                  {job.youtube_video_id && (
                    <a
                      href={`https://youtube.com/watch?v=${job.youtube_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                    >
                      <ExternalLink size={12} /> View on YouTube
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
