import React from 'react';
import { Link } from 'react-router-dom';
import { Tv, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

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
                fontSize: '1.2rem',
                color: '#FFFFFF',
              }}
            >
              TubePilot <span style={{ color: 'var(--accent-violet)' }}>AI</span>
            </span>
          </Link>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Autonomous video production studio helping creators turn raw footage and authorized media into polished, publish-ready videos with multi-agent orchestration.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
            <span>FFmpeg Media Engine Active</span>
          </div>
        </div>

        {/* Product Navigation */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Product
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <li>
              <Link to="/features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Features & Pipeline
              </Link>
            </li>
            <li>
              <Link to="/ai-agents" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                8 Specialized AI Agents
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                How It Works
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

        {/* Resources & Articles */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resources
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <li>
              <Link to="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Creator Blog & Tutorials
              </Link>
            </li>
            <li>
              <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                About TubePilot AI
              </Link>
            </li>
            <li>
              <Link to="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Contact & Support
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

        {/* Legal & Compliance (AdSense Ready) */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trust & Legal
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <li>
              <Link to="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-use" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Terms of Use
              </Link>
            </li>
            <li>
              <Link to="/copyright-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Copyright & Content Policy
              </Link>
            </li>
            <li>
              <Link to="/cookie-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Cookie Policy
              </Link>
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
          © {new Date().getFullYear()} TubePilot AI. All rights reserved. Built for professional content creators.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Google OAuth 2.0 & YouTube Data API v3 Certified Workflow</span>
          <span>•</span>
          <Link to="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
            Data Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
};
