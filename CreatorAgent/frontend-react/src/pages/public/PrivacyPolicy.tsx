import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
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
          <div className="badge badge-emerald" style={{ marginBottom: '16px' }}>
            <Shield size={12} /> Compliance & Privacy
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '12px' }}>
            Privacy Policy
          </h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Effective Date: October 13, 2026</span>
            <span>•</span>
            <span>Version 3.0</span>
          </div>
        </header>

        {/* Table of Contents */}
        <div className="studio-card" style={{ padding: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#FFFFFF' }}>Table of Contents</h3>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--accent-violet)' }}>
            <li><a href="#section-1" style={{ color: 'inherit', textDecoration: 'none' }}>1. Overview and Scope</a></li>
            <li><a href="#section-2" style={{ color: 'inherit', textDecoration: 'none' }}>2. Information We Collect</a></li>
            <li><a href="#section-3" style={{ color: 'inherit', textDecoration: 'none' }}>3. Google & YouTube User Data Disclosure</a></li>
            <li><a href="#section-4" style={{ color: 'inherit', textDecoration: 'none' }}>4. Uploaded Media, Transcripts & Project Data</a></li>
            <li><a href="#section-5" style={{ color: 'inherit', textDecoration: 'none' }}>5. Data Processing & AI Subprocessors</a></li>
            <li><a href="#section-6" style={{ color: 'inherit', textDecoration: 'none' }}>6. Cookies and Local Storage</a></li>
            <li><a href="#section-7" style={{ color: 'inherit', textDecoration: 'none' }}>7. Data Retention and Deletion Requests</a></li>
            <li><a href="#section-8" style={{ color: 'inherit', textDecoration: 'none' }}>8. Security Safeguards</a></li>
            <li><a href="#section-9" style={{ color: 'inherit', textDecoration: 'none' }}>9. Children's Privacy</a></li>
            <li><a href="#section-10" style={{ color: 'inherit', textDecoration: 'none' }}>10. Contact Details & Privacy Inquiries</a></li>
          </ol>
        </div>

        {/* Content Body */}
        <div style={{ fontSize: '0.98rem', lineHeight: '1.8', color: '#D4D4D8', display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <section id="section-1">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>1. Overview and Scope</h2>
            <p>
              CreatorOps (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides an autonomous creator operations and video publishing platform. This Privacy Policy describes how we collect, process, store, and protect information when you visit our website, utilize our software, or connect your Google/YouTube account to our studio tools.
            </p>
          </section>

          <section id="section-2">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>2. Information We Collect</h2>
            <p>We collect information strictly necessary to provide video rendering, metadata synchronization, and publishing functionality:</p>
            <ul style={{ paddingLeft: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Authentication Data:</strong> User email, display name, and avatar managed securely through Supabase authentication.</li>
              <li><strong>Project Metadata:</strong> Project names, video format preferences, aspect ratio codes, layout selections, and natural language editing instructions saved in your project database.</li>
              <li><strong>Video Media Files:</strong> Temporary video and audio files provided by you to perform FFmpeg spatial compositing.</li>
            </ul>
          </section>

          <section id="section-3">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>3. Google & YouTube User Data Disclosure</h2>
            <p>
              CreatorOps uses official Google OAuth 2.0 to connect with YouTube. We adhere strictly to the <strong>Google API Services User Data Policy</strong>, including the Limited Use requirements:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Scopes Requested:</strong> We request <code>https://www.googleapis.com/auth/youtube.readonly</code> (to display your channel profile and recent videos in YouTube Studio) and <code>https://www.googleapis.com/auth/youtube.upload</code> (to upload your finalized master videos upon your explicit confirmation).</li>
              <li><strong>Backend Isolation:</strong> OAuth tokens and refresh tokens are stored securely in backend environment variables and Supabase RLS. They are never exposed in public client bundles, sent to external analytics tools, or shared with third parties.</li>
              <li><strong>Account Disconnection:</strong> You can disconnect your YouTube account and delete all stored tokens instantly from the Connected Accounts dashboard or by hitting the <code>/api/youtube/clear</code> endpoint. You may also revoke access at any time via <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-violet)' }}>Google Security Settings</a>.</li>
            </ul>
          </section>

          <section id="section-4">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>4. Uploaded Media, Transcripts & Project Data</h2>
            <p>
              When you process footage or audio through CreatorOps:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Media files are stored in your configured working output directory (<code>media_output/</code>) solely to execute FFmpeg rendering tasks.</li>
              <li>Transcripts and subtitle cues (.srt / .vtt) generated during production are stored securely in your project records.</li>
              <li>We claim zero ownership rights over any footage, audio, or text you process through CreatorOps.</li>
            </ul>
          </section>

          <section id="section-5">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>5. Data Processing & AI Subprocessors</h2>
            <p>
              CreatorOps uses deterministic local algorithmic pipelines for spatial compositing, audio ducking, and subtitle alignment. Where external AI model providers (such as Google Gemini or OpenAI) are configured via optional API keys, only text prompts and titles are transmitted for metadata suggestions. Raw video streams are processed on your dedicated FFmpeg server.
            </p>
          </section>

          <section id="section-6">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>6. Cookies and Local Storage</h2>
            <p>
              CreatorOps does not use tracking cookies or cross-site tracking pixels on private dashboard routes. We use browser <code>localStorage</code> strictly for technical operation: retaining your session tokens and UI state. For full details, please review our <Link to="/cookies" style={{ color: 'var(--accent-violet)' }}>Cookie Policy</Link>.
            </p>
          </section>

          <section id="section-7">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>7. Data Retention and Deletion Requests</h2>
            <p>
              Because CreatorOps operates with a dedicated database and media storage, you maintain direct control over data deletion:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Projects, jobs, and publishing records can be deleted individually from the studio interface.</li>
              <li>Temporary media files can be deleted by purging the <code>media_output/</code> directory.</li>
              <li>To submit a formal data deletion inquiry or request complete removal from shared support records, email <a href="mailto:privacy@creatorops.app" style={{ color: 'var(--accent-violet)' }}>privacy@creatorops.app</a>.</li>
            </ul>
          </section>

          <section id="section-8">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>8. Security Safeguards</h2>
            <p>
              We implement industry-standard safeguards: backend routes enforce session verification, CORS is explicitly configured to allowed origins, and high-risk session cookies are prevented from committing to version control via strict gitignore rules.
            </p>
          </section>

          <section id="section-9">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>9. Children's Privacy</h2>
            <p>
              CreatorOps is designed for professional adult creators and is not directed to individuals under the age of 13 (or under 16 in the European Economic Area). We do not knowingly collect personal information from children.
            </p>
          </section>

          <section id="section-10">
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>10. Contact Details & Privacy Inquiries</h2>
            <p>
              For questions or privacy requests regarding this policy, contact our Data Protection Officer at:
            </p>
            <div className="studio-card" style={{ padding: '20px', marginTop: '12px' }}>
              <div><strong>CreatorOps Legal & Privacy Team</strong></div>
              <div>Email: <a href="mailto:privacy@creatorops.app" style={{ color: 'var(--accent-violet)' }}>privacy@creatorops.app</a></div>
              <div>Website: <Link to="/" style={{ color: 'var(--accent-violet)' }}>https://creator-ops-beta.vercel.app</Link></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
