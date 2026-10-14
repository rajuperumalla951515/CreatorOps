import React from 'react';
import { Link } from 'react-router-dom';
import { Copyright, ArrowLeft, ShieldAlert, CheckCircle } from 'lucide-react';

export const CopyrightPolicy: React.FC = () => {
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
          <div className="badge badge-indigo" style={{ marginBottom: '16px' }}>
            <Copyright size={12} /> IP & Content Protection
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '12px' }}>
            Copyright & Content Policy
          </h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Last Updated: October 13, 2026</span>
            <span>•</span>
            <span>DMCA Compliance</span>
          </div>
        </header>

        {/* Core Principles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <div className="studio-card" style={{ padding: '20px' }}>
            <CheckCircle size={20} style={{ color: 'var(--accent-emerald)', marginBottom: '10px' }} />
            <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '6px' }}>Creator Ownership</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Creators retain 100% intellectual property ownership of their source footage, graphics, audio, and output compositions.
            </p>
          </div>
          <div className="studio-card" style={{ padding: '20px' }}>
            <ShieldAlert size={20} style={{ color: 'var(--accent-violet)', marginBottom: '10px' }} />
            <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '6px' }}>Authorized Use Only</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Users must own or possess explicit commercial licenses for all footage, audio, and assets imported into projects.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ fontSize: '0.98rem', lineHeight: '1.8', color: '#D4D4D8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>1. Digital Millennium Copyright Act (DMCA) Notice</h2>
            <p>
              CreatorOps respects the intellectual property rights of creators and copyright owners. In compliance with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512) and international copyright legislation, we maintain an active designated agent to receive notifications of claimed infringement.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>2. AI Transformation Does Not Expose Exemption from Copyright</h2>
            <p>
              <strong>Important Clarification:</strong> Applying automated AI transformations—such as automated reframing, layout collage, smart cut detection, background music mixing, or automated captioning—does not automatically convert copyrighted media into "fair use" or lawful derivative works under copyright law.
            </p>
            <p style={{ marginTop: '12px' }}>
              Creators are strictly prohibited from using CreatorOps to process, modify, or publish broadcast television, copyrighted films, commercial music tracks, or unauthorized YouTube streams without explicit written consent from the rights holder.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>3. How to Submit a Copyright Infringement Notice</h2>
            <p>
              If you believe in good faith that any content hosted or processed through CreatorOps infringes upon your copyright, please transmit a formal written notice containing:
            </p>
            <ol style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <li>Identification of the copyrighted work claimed to have been infringed (or a representative list if multiple works).</li>
              <li>Identification of the infringing material, including relevant URLs, project identifiers, or file hashes.</li>
              <li>Your contact information: legal name, physical mailing address, telephone number, and email address.</li>
              <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
              <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
            </ol>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>4. Designated DMCA Agent Contact</h2>
            <div className="studio-card" style={{ padding: '20px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                <strong>Attention:</strong> Copyright & DMCA Compliance Officer<br />
                <strong>Entity:</strong> CreatorOps Legal Operations<br />
                <strong>Email:</strong> dmca@creatorops.app<br />
                <strong>Website:</strong> https://creator-ops-beta.vercel.app
              </p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>5. Counter-Notification Procedure</h2>
            <p>
              If your content was removed or access was disabled as a result of a DMCA notice and you believe this was due to mistake or misidentification (for instance, because you hold a valid synchronization license), you may submit a formal counter-notification to our designated agent pursuant to 17 U.S.C. § 512(g)(3).
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '12px' }}>6. Repeat Infringer Policy</h2>
            <p>
              CreatorOps maintains an uncompromising repeat infringer policy. We will terminate access, invalidate Creator Keys, and permanently delete accounts of creators who are repeatedly identified as infringing the intellectual property rights of third parties.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
