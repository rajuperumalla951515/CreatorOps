import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export const TermsOfUse: React.FC = () => {
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
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
            <FileText size={12} /> Legal Agreement
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '12px' }}>
            Terms of Use
          </h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Last Updated: October 13, 2026</span>
            <span>•</span>
            <span>Version 3.0</span>
          </div>
        </header>

        {/* Notice Card */}
        <div className="studio-card" style={{ padding: '24px', marginBottom: '40px', borderLeft: '4px solid var(--accent-violet)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} style={{ color: 'var(--accent-violet)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '6px' }}>Important Notice to Creators</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                By accessing or using CreatorOps, you agree to these Terms of Use and acknowledge that by connecting your YouTube account, you are also bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>YouTube Terms of Service</a> and Google Privacy Policy.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="studio-card" style={{ padding: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#FFFFFF' }}>Table of Contents</h3>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--accent-violet)' }}>
            <li><a href="#section-1" style={{ color: 'inherit', textDecoration: 'none' }}>1. Acceptance and Eligibility</a></li>
            <li><a href="#section-2" style={{ color: 'inherit', textDecoration: 'none' }}>2. Account Security & Creator Keys</a></li>
            <li><a href="#section-3" style={{ color: 'inherit', textDecoration: 'none' }}>3. Ownership of Content and Intellectual Property</a></li>
            <li><a href="#section-4" style={{ color: 'inherit', textDecoration: 'none' }}>4. Permitted and Prohibited Uses</a></li>
            <li><a href="#section-5" style={{ color: 'inherit', textDecoration: 'none' }}>5. Third-Party Platforms and YouTube API Terms</a></li>
            <li><a href="#section-6" style={{ color: 'inherit', textDecoration: 'none' }}>6. AI-Generated Output & Creator Review Requirement</a></li>
            <li><a href="#section-7" style={{ color: 'inherit', textDecoration: 'none' }}>7. Publishing Authorization & Human Confirmation</a></li>
            <li><a href="#section-8" style={{ color: 'inherit', textDecoration: 'none' }}>8. Compute Quotas, Retention & Service Availability</a></li>
            <li><a href="#section-9" style={{ color: 'inherit', textDecoration: 'none' }}>9. Termination and Account Disconnection</a></li>
            <li><a href="#section-10" style={{ color: 'inherit', textDecoration: 'none' }}>10. Disclaimers, Limitation of Liability & Contact</a></li>
          </ol>
        </div>

        {/* Content Body */}
        <div style={{ fontSize: '0.98rem', lineHeight: '1.8', color: '#D4D4D8', display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <section id="section-1">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>1. Acceptance and Eligibility</h2>
            <p>
              These Terms of Use ("Terms") constitute a legally binding agreement between you ("User", "Creator", or "you") and CreatorOps ("CreatorOps", "we", "us", or "our"). By registering for an account, accessing the web studio, or utilizing any of our automated agents or API endpoints, you affirm that you are at least 18 years of age (or the age of majority in your jurisdiction) and possess full legal capacity to enter into these Terms.
            </p>
          </section>

          <section id="section-2">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>2. Account Security & Creator Keys</h2>
            <p>
              Access to authenticated studio features requires a secure account and, where configured, a valid Creator Access Key. You are exclusively responsible for maintaining the confidentiality of your session credentials, API keys, and device access. CreatorOps will never request your Google or YouTube account passwords directly.
            </p>
          </section>

          <section id="section-3">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>3. Ownership of Content and Intellectual Property</h2>
            <p>
              <strong>You retain 100% full ownership, copyright, and intellectual property rights</strong> in and to all raw video files, audio tracks, graphics, and written briefs uploaded or linked to your CreatorOps projects.
            </p>
            <p style={{ marginTop: '12px' }}>
              By submitting media to CreatorOps, you grant us solely a temporary, non-exclusive, worldwide, royalty-free license to access, transcode, analyze, and render your footage strictly for the purpose of executing the editing tasks and publishing workflows directed by you. We do not claim ownership of your content, nor do we sell or license your footage to any third parties.
            </p>
          </section>

          <section id="section-4">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>4. Permitted and Prohibited Uses</h2>
            <p>
              You represent and warrant that you hold all necessary licenses, copyrights, synchronization rights, and consents for all content processed through CreatorOps.
            </p>
            <p style={{ marginTop: '12px' }}>
              <strong>Strictly Prohibited Activities:</strong>
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <li>Uploading or processing footage containing non-consensual imagery, hate speech, or content infringing third-party copyrights or trademarks.</li>
              <li>Attempting to circumvent server-side rate limits, job timeouts, or security boundaries.</li>
              <li>Using automated scraping, bots, or unauthorized reverse-engineering tools against the studio endpoints.</li>
              <li>Using CreatorOps to bypass copyright restrictions or YouTube Content ID safeguards.</li>
              <li>Inputting malicious files designed to exploit server-side FFmpeg decoders or underlying operating system processes.</li>
            </ul>
          </section>

          <section id="section-5">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>5. Third-Party Platforms and YouTube API Terms</h2>
            <p>
              CreatorOps utilizes YouTube API Services to retrieve channel metadata and upload videos upon creator instruction. By authorizing CreatorOps to interact with your YouTube channel, you expressly acknowledge and agree to:
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <li>Comply with the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>YouTube Terms of Service</a>.</li>
              <li>Acknowledge the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>Google Privacy Policy</a>.</li>
              <li>Understand that channel access permissions can be revoked at any time either via the CreatorOps Connected Accounts dashboard or directly through the <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>Google Security Permissions portal</a>.</li>
            </ul>
          </section>

          <section id="section-6">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>6. AI-Generated Output & Creator Review Requirement</h2>
            <p>
              Our automated agents generate video edits, title suggestions, transcriptions, timestamps, and metadata based on algorithmic analysis of your media. Due to the inherent nature of machine learning:
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <li>CreatorOps makes no guarantees regarding the virality, search ranking, monetization eligibility, or audience reception of output videos.</li>
              <li>AI-generated transcripts and captions may contain inaccuracies and must be reviewed and verified by the creator prior to release.</li>
              <li>The creator maintains sole responsibility for verifying all titles, descriptions, and hashtags for factual accuracy, compliance with local advertising laws, and community guidelines.</li>
            </ul>
          </section>

          <section id="section-7">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>7. Publishing Authorization & Human Confirmation</h2>
            <p>
              CreatorOps enforces an <strong>explicit human confirmation protocol</strong>. Under no circumstance will the Publishing Agent upload, make public, or schedule a video to your connected YouTube channel without an unambiguous, user-confirmed action in the studio workspace. You remain responsible for all content published through your authorized API credentials.
            </p>
          </section>

          <section id="section-8">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>8. Compute Quotas, Retention & Service Availability</h2>
            <p>
              Video processing involves intensive hardware resources (FFmpeg transcoding, multi-track compositing, speech-to-text inference). We provide service tiers with defined compute limits:
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <li>Raw and intermediate render files are stored in temporary scratch space and automatically purged 24 to 72 hours after project completion to conserve storage.</li>
              <li>Users are encouraged to download final rendered MP4 files immediately upon job completion.</li>
              <li>We strive for 99.9% platform availability, but provide services on an "AS IS" and "AS AVAILABLE" basis without liability for rendering delays caused by external network issues or third-party API rate limits.</li>
            </ul>
          </section>

          <section id="section-9">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>9. Termination and Account Disconnection</h2>
            <p>
              You may terminate your account and revoke third-party authorizations at any time. We reserve the right to suspend or terminate accounts that violate these Terms, infringe intellectual property rights, or engage in abusive platform usage without prior notice.
            </p>
          </section>

          <section id="section-10">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>10. Disclaimers, Limitation of Liability & Contact</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CREATOROPS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL CREATOROPS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO USE THE PLATFORM.
            </p>
            <p style={{ marginTop: '12px' }}>
              If you have any questions or legal concerns regarding these Terms, please contact our legal desk at:
            </p>
            <div className="studio-card" style={{ padding: '16px', marginTop: '12px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                <strong>Legal Operations:</strong> legal@creatorops.app<br />
                <strong>Support Desk:</strong> support@creatorops.app<br />
                <strong>Website:</strong> https://creator-ops-beta.vercel.app
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
