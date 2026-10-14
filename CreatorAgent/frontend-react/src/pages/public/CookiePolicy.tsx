import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft, Check, Database, Shield } from 'lucide-react';

export const CookiePolicy: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: '32px',
          }}
        >
          <ArrowLeft size={16} /> Return to Home
        </Link>

        {/* Header */}
        <header style={{ marginBottom: '48px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '32px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '16px' }}>
            <Cookie size={12} /> Browser Storage & Cookies
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '12px' }}>
            Cookie & Local Storage Policy
          </h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Last Updated: October 13, 2026</span>
            <span>•</span>
            <span>Transparent Tracking Disclosures</span>
          </div>
        </header>

        {/* Highlight Card */}
        <div className="studio-card" style={{ padding: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: 'var(--accent-emerald)' }} /> Minimalist Storage Footprint
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            CreatorOps does not use invasive third-party cross-site advertising cookies or tracking pixels. We store only essential session tokens and studio interface preferences necessary for authenticating your workspace and preserving your video editor layouts.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ fontSize: '0.98rem', lineHeight: '1.8', color: '#D4D4D8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>1. What are Cookies and Browser Storage?</h2>
            <p>
              Cookies are small data files transferred to your computer or mobile device through your browser. Modern web applications also use LocalStorage and SessionStorage, which allow the browser to store key-value data directly on your device without transmitting it on every single HTTP network request.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>2. Data We Store Locally</h2>
            <p>
              Below is the comprehensive list of client-side storage keys utilized by the CreatorOps studio:
            </p>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="studio-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent-violet)', fontSize: '0.9rem', fontWeight: 600 }}>tubepilot_auth_token</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Stores your temporary cryptographic session authentication JWT.
                  </p>
                </div>
                <span className="badge badge-violet" style={{ fontSize: '0.75rem' }}>Strictly Essential</span>
              </div>

              <div className="studio-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 600 }}>tubepilot_creator_key</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Stores the optional Creator Access Key configured in your studio workspace for API authorization.
                  </p>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>Essential Security</span>
              </div>

              <div className="studio-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent-emerald)', fontSize: '0.9rem', fontWeight: 600 }}>tubepilot_editor_prefs</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Saves workspace preferences: timeline snapping, audio meter toggles, canvas background color.
                  </p>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>Functional / UI</span>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>3. Third-Party Cookies and Analytics</h2>
            <p>
              When navigating the public marketing pages, performance telemetry may be recorded to detect broken links or server latency. These metrics are anonymized and aggregated. We do not sell your personal data or provide browser tracking histories to data brokers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>4. How to Clear or Disable Storage</h2>
            <p>
              You can clear TubePilot AI cookies and LocalStorage items at any time through your browser settings:
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <li>In Google Chrome: Settings → Privacy and Security → Site settings → View permissions and data stored across sites → Search for "tubepilot.ai".</li>
              <li>In Mozilla Firefox: Settings → Privacy & Security → Cookies and Site Data → Manage Data.</li>
              <li>In Apple Safari: Preferences → Privacy → Manage Website Data.</li>
            </ul>
            <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <em>Note: Clearing essential session storage will log you out of the studio workspace and require re-authenticating on your next visit.</em>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
