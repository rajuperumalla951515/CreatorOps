import React from 'react';
import {
  HelpCircle,
  BookOpen,
  Film,
  ShieldAlert,
  Mail,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';

export const HelpSupport: React.FC = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '6px' }}>Help & Knowledge Base</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Master the TubePilot AI autonomous editing pipeline, FFmpeg compositing, and YouTube publishing.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Guides Grid */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-violet)' }} /> Studio Quickstart Guides
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '4px' }}>1. Natural Language Project Planning</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Navigate to <strong>New Project</strong>, provide your video link or file, and describe your editing goals. The Project Planner Agent will synthesize a structured manifest with timeline operations before rendering starts.
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '4px' }}>2. Interactive Rule-of-Thirds Reframing</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                In the <strong>Studio Workspace</strong>, set Reframing Algorithm to <em>Interactive Rule-of-Thirds Crop</em>. Drag the handles directly on the video viewport to keep your subject perfectly framed for 9:16 Shorts.
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '4px' }}>3. Official YouTube Publishing</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Once your video finishes rendering, click <em>Publish to YouTube</em>. Fill in the title, description, and visibility setting, and click Confirm. TubePilot strictly requires human confirmation before irreversible uploads.
              </p>
            </div>
          </div>
        </div>

        {/* Support & Contact Desk */}
        <div className="studio-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '4px' }}>Need Technical Support?</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Our engineering team is available for API quota questions, custom render models, and bug reports.
            </p>
          </div>
          <a
            href="mailto:support@tubepilot.ai"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Mail size={16} /> Contact Support Desk
          </a>
        </div>
      </div>
    </div>
  );
};
