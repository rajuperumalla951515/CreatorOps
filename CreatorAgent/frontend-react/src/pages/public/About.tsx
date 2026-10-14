import React from 'react';
import { Link } from 'react-router-dom';
import { Tv, Cpu, ShieldCheck, ArrowRight, Layers, Workflow, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
            Mission & Architecture
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
            About CreatorOps
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            Building the next generation of autonomous, deterministic video production and operations tools for high-velocity digital creators.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="studio-card" style={{ padding: '40px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Our Philosophy: Deterministic Systems</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
            Most video automation tools treat artificial intelligence as a black box—promising magic results but delivering inconsistent edits, desynchronized audio, and hallucinated metadata.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
            CreatorOps was engineered with an opposite philosophy: <strong>Deterministic Agent Orchestration</strong>. We combine specialized autonomous agents with industry-standard FFmpeg media compositing. Every trim, spatial layout, caption track, and chapter timestamp is grounded in verifiable mathematical coordinates and media probes.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            The result is an autonomous studio that respects creator intentionality, operates within strict security boundaries, and delivers reliable, publish-ready videos every time.
          </p>
        </div>

        {/* Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '64px' }}>
          <div className="studio-card" style={{ padding: '28px' }}>
            <Cpu size={24} color="var(--accent-violet)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Specialized AI Roles</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              8 discrete agents with dedicated schemas: Planner, Analyst, Transcriber, Editor, QA Auditor, Metadata Strategist, Publisher, and Supervisor.
            </p>
          </div>

          <div className="studio-card" style={{ padding: '28px' }}>
            <Layers size={24} color="var(--accent-blue)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Spatial Compositing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Dynamic dual-stream transformations built for 9:16 vertical retention—featuring rule-of-thirds grid control and background audio ducking.
            </p>
          </div>

          <div className="studio-card" style={{ padding: '28px' }}>
            <ShieldCheck size={24} color="#10B981" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Security & User Ownership</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Local and private cloud deployments protect user credentials. We enforce human confirmation before any irreversible publishing action.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="studio-card-elevated" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Explore the Production Studio</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Test the live studio workspace and experience the 8 specialized agents firsthand.
          </p>
          <Link to="/app" className="btn-primary" style={{ padding: '12px 28px' }}>
            Launch Studio Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
