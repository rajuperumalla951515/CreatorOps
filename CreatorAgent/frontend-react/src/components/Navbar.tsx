import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Video,
  Sparkles,
  ShieldCheck,
  Lock,
  Unlock,
  Menu,
  X,
  ArrowRight,
  Tv,
  User,
  LogOut,
} from 'lucide-react';
import { api } from '../services/api';
import { getCurrentUser, signOut, ensureProfile, type UserProfile } from '../utils/supabase';
import { AuthModal } from './AuthModal';
import type { YtProfile } from '../types';

export const Navbar: React.FC<{ onOpenAuthModal?: () => void }> = ({ onOpenAuthModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [ytProfile, setYtProfile] = useState<YtProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();

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

    api.getAuthStatus()
      .then((res) => {
        setIsProtected(res.protected);
        setIsUnlocked(res.authenticated);
      })
      .catch(() => {});

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
    setIsUnlocked(false);
  };

  const navLinks = [
    { label: 'Features', path: '/features' },
    { label: 'AI Agents', path: '/ai-agents' },
    { label: 'How It Works', path: '/how-it-works' },
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
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '70px',
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
              }}
            >
              TubePilot <span style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>AI</span>
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Autonomous Studio
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
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive(link.path) ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'color 0.2s ease',
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
          {/* User Profile or Sign In CTA */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
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
                <span className="hide-mobile" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userProfile?.display_name || currentUser.email}
                </span>
              </div>
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
                }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => (onOpenAuthModal ? onOpenAuthModal() : setAuthModalOpen(true))}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: '#FFFFFF',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* YouTube Channel Indicator if authenticated */}
          {ytProfile && (
            <Link
              to="/app/youtube"
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
            >
              {ytProfile.avatar_url && (
                <img
                  src={ytProfile.avatar_url}
                  alt={ytProfile.title}
                  style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                />
              )}
              <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 600 }}>
                {ytProfile.title}
              </span>
            </Link>
          )}

          {/* Studio App Launch CTA */}
          <Link
            to="/app"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Launch Studio <ArrowRight size={14} />
          </Link>

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
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                fontSize: '1rem',
                color: isActive(link.path) ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 500,
                padding: '6px 0',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Open Studio Workspace
            </Link>
          </div>
        </div>
      )}

      {/* Embedded Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={loadUserData}
      />

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
