import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

export const Pricing: React.FC = () => {
  const tiers = [
    {
      name: 'Starter (Local Dev)',
      price: '$0',
      period: 'free forever',
      desc: 'Run completely free on your local machine with self-hosted Python & FFmpeg compute.',
      features: [
        'Unlimited local renders on your machine',
        'Top Landscape & Split Vertical layouts',
        'Custom coordinate interactive cropping',
        'Synchronized SubRip (.srt) caption export',
        'Connect 1 authorized YouTube channel',
        'Local SQLite persistent project database',
      ],
      cta: 'Get Started Free',
      highlight: false,
    },
    {
      name: 'Creator Studio Pro',
      price: '$29',
      period: '/ month',
      desc: 'Hosted cloud container execution with dedicated FFmpeg processing and full autonomous agents.',
      features: [
        'Cloud-hosted container deployment (Render / Docker)',
        'All 6 layout presets including Picture-in-Picture',
        'Automated YouTube Data API v3 publishing & scheduling',
        '8 Specialized Autonomous Agents pipeline',
        'Quality Assurance frame inspection certification',
        'SEO titles, structured descriptions & real chapters',
        'Multi-track background soundtrack ducking',
      ],
      cta: 'Launch Studio Pro',
      highlight: true,
    },
    {
      name: 'Production Team',
      price: '$79',
      period: '/ month',
      desc: 'Designed for production studios managing multiple creators and publishing schedules.',
      features: [
        'Manage multiple YouTube channels simultaneously',
        'Extended duration rendering (up to 10 minutes)',
        'Custom branding & thumbnail template synthesis',
        'Publishing calendar automation & queue management',
        'Priority background job processing',
        'Private webhook events & direct download API',
      ],
      cta: 'Contact Studio Team',
      highlight: false,
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
            Transparent Pricing
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
            Simple, Predictable Compute Tiers.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            No hidden export fees or token surcharges. Choose the compute capacity that fits your video production volume.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
          }}
        >
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={tier.highlight ? 'studio-card-elevated' : 'studio-card'}
              style={{
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                border: tier.highlight ? '1px solid var(--accent-violet)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>{tier.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  {tier.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "'Outfit', sans-serif" }}>
                  {tier.price}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tier.period}</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1, fontSize: '0.88rem' }}>
                {tier.features.map((feat, fIdx) => (
                  <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EDEDED' }}>
                    <CheckCircle2 size={16} color="var(--accent-violet)" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/app"
                className={tier.highlight ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', textAlign: 'center' }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Compute Transparency Notice */}
        <div className="studio-card" style={{ padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <HelpCircle size={22} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '6px' }}>
              How is rendering compute managed?
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              TubePilot AI runs on an open-source FFmpeg media core. When self-hosting on your own machine or container, you incur zero per-video rendering charges. On cloud deployments (such as Render or Railway), compute usage is bound only by your host container CPU and memory allocations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
