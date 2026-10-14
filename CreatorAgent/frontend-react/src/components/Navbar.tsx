import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Tv,
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { getCurrentUser, signOut, ensureProfile, type UserProfile } from '../utils/supabase';
import { api } from '../services/api';
import type { YtProfile } from '../types';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ytProfile, setYtProfile] = useState<YtProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const loadUserData = () => {
    getCurrentUser()
      .then(async (user) => {
        setCurrentUser(user);
        if (user) {
          const prof = await ensureProfile(user);
          setUserProfile(prof);
        } else {
          setUserProfile(null);
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setUserProfile(null);
      });

    api.getYoutubeProfile()
      .then((profile) => {
        if (profile) {
          setYtProfile(profile);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadUserData();
    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setUserProfile(e.detail);
      }
    };
    window.addEventListener('tubepilot:profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('tubepilot:profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('tubepilot_supabase_token');
    sessionStorage.removeItem('yt_code_verifier');
    api.clearCreatorKey();
    setCurrentUser(null);
    setUserProfile(null);
    setYtProfile(null);
    navigate('/');
  };

  const navLinks = [
    { label: 'Features', path: '/features' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'AI Pipeline', path: '/ai-agents' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Blog', path: '/blog' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--gradient-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
            }}
          >
            <Tv size={18} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: '1.25rem',
                color: '#FFFFFF',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Creator<span style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>Ops</span>
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Creator Studio OS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '32px',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: isActive(link.path) ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = isActive(link.path) ? '#FFFFFF' : 'var(--text-secondary)')
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* YouTube Channel Indicator */}
              {ytProfile && (
                <Link
                  to="/app/youtube"
                  className="hide-mobile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    background: 'var(--surface-secondary)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-subtle)',
                  }}
                  title={`Connected channel: ${ytProfile.title}`}
                >
                  {ytProfile.avatar_url && (
                    <img
                      src={ytProfile.avatar_url}
                      alt={ytProfile.title}
                      style={{ width: '18px', height: '18px', borderRadius: '50%' }}
                    />
                  )}
                  <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 600, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ytProfile.title}
                  </span>
                </Link>
              )}

              {/* User Profile Pill */}
              <Link
                to="/app/settings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                }}
                title={userProfile?.display_name || currentUser.email}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    overflow: 'hidden',
                  }}
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    (userProfile?.display_name || currentUser.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <span className="hide-mobile" style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userProfile?.display_name || currentUser.email?.split('@')[0]}
                </span>
              </Link>

              {/* Launch Studio CTA */}
              <Link
                to="/app"
                className="btn-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <LayoutDashboard size={14} />
                <span>Open Studio</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s ease',
                }}
                title="Sign Out"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/login"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <User size={14} />
                <span>Sign In</span>
              </Link>

              <Link
                to="/signup"
                className="btn-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              padding: '6px',
            }}
            className="mobile-menu-btn"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-primary)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                textDecoration: 'none',
                fontSize: '0.95rem',
                color: isActive(link.path) ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 500,
                padding: '6px 0',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentUser ? (
              <>
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px', textAlign: 'center' }}
                >
                  Open Studio Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: '#EF4444',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px', textAlign: 'center' }}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
