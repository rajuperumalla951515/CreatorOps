import React from 'react';
import { Link } from 'react-router-dom';
import { Tv, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '64px 24px 36px 24px',
        color: 'var(--text-secondary)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        {/* Brand Column */}
        <div style={{ maxWidth: '320px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'var(--gradient-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tv size={16} color="#FFFFFF" />
            </div>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: '1.25rem',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Creator<span style={{ color: 'var(--accent-violet)' }}>Ops</span>
            </span>
          </Link>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Autonomous operations platform and video production studio for creators. Reframe footage, composite multi-stream layouts, generate subtitle cues, and manage YouTube distribution.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
            <span>Media Engine Active • Python API</span>
          </div>
        </div>

        {/* Product Navigation */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#FFFFFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Product
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', padding: 0, margin: 0 }}>
            <li>
              <Link to="/features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Features & Pipeline
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/ai-agents" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                8 Autonomous Agents
              </Link>
            </li>
            <li>
              <Link to="/pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Pricing & Quotas
              </Link>
            </li>
            <li>
              <Link to="/app" style={{ color: 'var(--accent-violet)', textDecoration: 'none', fontWeight: 600 }}>
                Studio Dashboard ↗
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources & Support */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#FFFFFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Resources & Access
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', padding: 0, margin: 0 }}>
            <li>
              <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/signup" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Create Account
              </Link>
            </li>
            <li>
              <Link to="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Engineering & Blog
              </Link>
            </li>
            <li>
              <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                About CreatorOps
              </Link>
            </li>
            <li>
              <Link to="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#FFFFFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Trust & Legal
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', padding: 0, margin: 0 }}>
            <li>
              <Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/copyright" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Copyright & Content Policy
              </Link>
            </li>
            <li>
              <Link to="/cookies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Cookie Policy
              </Link>
            </li>
            <li>
              <a
                href="https://developers.google.com/youtube/v3"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                YouTube API Docs <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Disclaimer & Copyright */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          © {new Date().getFullYear()} CreatorOps. All rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span>Google OAuth 2.0 & YouTube Data API v3 Workflow</span>
          <span>•</span>
          <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
            Data Privacy
          </Link>
          <span>•</span>
          <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};
