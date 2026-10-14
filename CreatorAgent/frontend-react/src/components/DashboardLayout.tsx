import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Film,
  Bot,
  Subtitles,
  Sparkles,
  Calendar,
  History,
  Link2,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  ExternalLink,
  LogOut,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { YouTubeIcon } from './YouTubeIcon';
import { api } from '../services/api';
import { getCurrentUser, signOut, ensureProfile, getConnectedYouTubeChannel, type UserProfile } from '../utils/supabase';
import { AuthModal } from './AuthModal';
import type { YtProfile } from '../services/api';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('tubepilot_sidebar_collapsed') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [ytProfile, setYtProfile] = useState<YtProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);

  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('tubepilot_sidebar_collapsed', String(next));
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Check auth and YouTube profile on load
  useEffect(() => {
    checkSecurity();
    loadProfile();
    const handleChannelUpdate = () => {
      loadProfile();
    };
    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setUserProfile(e.detail);
      }
    };
    window.addEventListener('tubepilot:channel-updated', handleChannelUpdate);
    window.addEventListener('tubepilot:profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('tubepilot:channel-updated', handleChannelUpdate);
      window.removeEventListener('tubepilot:profile-updated', handleProfileUpdate);
    };
  }, []);

  const checkSecurity = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const prof = await ensureProfile(user);
        setUserProfile(prof);
      } else {
        setUserProfile(null);
      }
    } catch {
      setCurrentUser(null);
      setUserProfile(null);
    }
    try {
      const status = await api.getAuthStatus();
      setIsProtected(status.protected);
      setIsUnlocked(status.authenticated);
      if (status.protected && !status.authenticated) {
        setAuthModalOpen(true);
      }
    } catch {
      // Offline or local development mode
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await api.getYoutubeProfile();
      if (profile) {
        setYtProfile(profile);
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
          setYtProfile({
            channel_id: supaChannel.channel_id,
            title: supaChannel.channel_title,
            handle: supaChannel.channel_handle,
            avatar_url: supaChannel.avatar_url,
            subscriber_count: supaChannel.subscriber_count,
            video_count: supaChannel.video_count,
          });
          return;
        }
      }
    } catch {
      // Fallback
    }
    setYtProfile(null);
  };

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('tubepilot_supabase_token');
    sessionStorage.removeItem('yt_code_verifier');
    api.clearCreatorKey();
    setCurrentUser(null);
    setUserProfile(null);
    setYtProfile(null);
    setIsUnlocked(false);
    setAuthModalOpen(true);
  };

  const navigationItems = [
    { title: 'Overview', path: '/app', icon: LayoutDashboard },
    { title: 'New Project', path: '/app/new', icon: PlusCircle, badge: 'AI Plan' },
    { title: 'My Projects', path: '/app/projects', icon: FolderKanban },
    { title: 'Studio Workspace', path: '/app/studio', icon: Film, highlight: true },
    { title: 'AI Agents Studio', path: '/app/agents', icon: Bot, badge: '8 Agents' },
    { title: 'Captions Studio', path: '/app/captions', icon: Subtitles },
    { title: 'Metadata Studio', path: '/app/metadata', icon: Sparkles },
    { title: 'YouTube Studio', path: '/app/youtube', icon: YouTubeIcon },
    { title: 'Publishing Calendar', path: '/app/calendar', icon: Calendar },
    { title: 'Job History', path: '/app/jobs', icon: History },
    { title: 'Connected Accounts', path: '/app/accounts', icon: Link2 },
    { title: 'Settings', path: '/app/settings', icon: Settings },
    { title: 'Help & Docs', path: '/app/help', icon: HelpCircle },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-black)' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: collapsed ? '72px' : '260px',
          backgroundColor: 'var(--bg-surface-1)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
        className="hide-mobile"
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: '64px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Link
            to="/app"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-blue) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Film size={16} color="#FFFFFF" />
            </div>
            {!collapsed && (
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                TubePilot <span style={{ color: 'var(--accent-violet)' }}>AI</span>
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Collapsed expansion button */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
              }}
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: collapsed ? '12px 8px' : '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '10px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  backgroundColor: isActive
                    ? 'rgba(124, 58, 237, 0.12)'
                    : item.highlight && !collapsed
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(124, 58, 237, 0.3)'
                    : '1px solid transparent',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
                title={collapsed ? item.title : undefined}
              >
                <Icon
                  size={18}
                  style={{
                    color: isActive
                      ? 'var(--accent-violet)'
                      : item.highlight
                      ? 'var(--accent-cyan)'
                      : 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                />
                {!collapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(124, 58, 237, 0.2)',
                      color: 'var(--accent-violet)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / User & Security Status */}
        <div
          style={{
            padding: collapsed ? '12px 8px' : '16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-2)',
          }}
        >
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {(() => {
                  const userName =
                    userProfile?.display_name ||
                    currentUser.user_metadata?.full_name ||
                    currentUser.user_metadata?.name ||
                    currentUser.user_metadata?.display_name ||
                    currentUser.email?.split('@')[0] ||
                    'Creator';
                  const userAvatar =
                    userProfile?.avatar_url ||
                    currentUser.user_metadata?.avatar_url ||
                    currentUser.user_metadata?.picture ||
                    '';
                  const userTag = userProfile?.username ? `@${userProfile.username}` : currentUser.email;

                  return (
                    <>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#7C3AED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#fff',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt={userName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          userName[0].toUpperCase()
                        )}
                      </div>
                      {!collapsed && (
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: '#fff',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                            title={userName}
                          >
                            {userName}
                          </div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                            title={currentUser.email}
                          >
                            {userTag}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              {!collapsed && (
                <button
                  onClick={handleSignOut}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                background: isUnlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${isUnlocked ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                color: isUnlocked ? 'var(--accent-emerald)' : '#EF4444',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
              title="Sign In / Unlock Studio"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                {!collapsed && <span>{isUnlocked ? 'Studio Unlocked' : 'Sign In / Unlock'}</span>}
              </div>
              {!collapsed && <Key size={12} />}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--bg-surface-1)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile menu button + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'none',
              }}
              className="show-mobile-flex"
            >
              <Menu size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Studio</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                {navigationItems.find(
                  (i) => i.path === location.pathname || (i.path !== '/app' && location.pathname.startsWith(i.path))
                )?.title || 'Workspace'}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* YouTube Profile Status */}
            {ytProfile ? (
              <Link
                to="/app/youtube"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '24px',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                }}
              >
                <img
                  src={
                    ytProfile.avatar_url && ytProfile.avatar_url.trim().length > 0
                      ? ytProfile.avatar_url
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(ytProfile.title)}&background=8b5cf6&color=fff`
                  }
                  alt={ytProfile.title}
                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{ytProfile.title}</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                  Connected
                </span>
              </Link>
            ) : (
              <Link
                to="/app/accounts"
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}
              >
                <YouTubeIcon size={14} style={{ color: '#EF4444' }} /> Connect YouTube
              </Link>
            )}

            {/* Public Marketing Link */}
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
              title="Return to Public Website"
            >
              <span>Marketing</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '280px',
              backgroundColor: 'var(--bg-surface-1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              borderRight: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={20} style={{ color: 'var(--accent-violet)' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>TubePilot AI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/app'
                    ? location.pathname === '/app'
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/app'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                    }}
                  >
                    <Icon size={18} style={{ color: isActive ? 'var(--accent-violet)' : 'var(--text-muted)' }} />
                    <span style={{ flex: 1 }}>{item.title}</span>
                    {item.badge && <span className="badge badge-violet">{item.badge}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Auth & Creator Key Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          checkSecurity();
          loadProfile();
        }}
      />
    </div>
  );
};
