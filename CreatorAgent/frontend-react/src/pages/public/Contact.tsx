import React, { useState } from 'react';
import { Mail, MessageSquare, CheckCircle2, Send, HelpCircle, Shield } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', padding: '64px 24px 96px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
            Support & Publisher Inquiry
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
            Contact TubePilot AI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Have a question about self-hosting, Google OAuth authorization, custom FFmpeg pipelines, or privacy requests? Reach our team directly.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Contact Details & Info */}
          <div>
            <div className="studio-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Publisher Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>Platform Name</div>
                  <div>TubePilot AI — Autonomous Video Production Studio</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>Support & Inquiries</div>
                  <div style={{ color: 'var(--accent-violet)' }}>support@tubepilot.ai</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>Privacy & Data Requests</div>
                  <div style={{ color: 'var(--accent-violet)' }}>privacy@tubepilot.ai</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>Deployment Environment</div>
                  <div>Self-Hosted Docker / Render Container Cloud</div>
                </div>
              </div>
            </div>

            <div className="studio-card" style={{ padding: '24px', background: 'var(--surface-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px' }}>
                <Shield size={16} /> Privacy Guarantee
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Inquiries sent through this form are used exclusively to answer your support questions. We never sell contact information or share communication logs with third parties.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="studio-card-elevated" style={{ padding: '36px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <CheckCircle2 size={28} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Message Received</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  Thank you for contacting TubePilot AI. Our engineering team responds to all legitimate inquiries within 1 business day.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Send Us a Message</h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="studio-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="studio-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Inquiry Type
                  </label>
                  <select
                    className="studio-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="General Support">General Support & Troubleshooting</option>
                    <option value="Google OAuth Setup">Google OAuth & YouTube API Setup</option>
                    <option value="Docker / Self-Hosting">Docker / Self-Hosting Assistance</option>
                    <option value="Privacy / Data Request">Privacy / Data Deletion Request</option>
                    <option value="Business Inquiry">Commercial & Publisher Inquiry</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="studio-input"
                    style={{ resize: 'vertical' }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or question in detail..."
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
