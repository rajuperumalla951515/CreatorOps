import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '../utils/supabase';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'key'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const data = await signInWithEmail(email, password);
        if (data?.session?.access_token) {
          localStorage.setItem('tubepilot_supabase_token', data.session.access_token);
        }
        setSuccessMessage('Successfully signed in to TubePilot AI studio!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, fullName);
        setSuccessMessage('Registration successful! Please check your email inbox to verify your account.');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else if (mode === 'key') {
        if (!accessKey.trim()) {
          throw new Error('Please enter your Creator Access Key.');
        }
        const verifyRes = await api.verifyCreatorKey(accessKey.trim());
        if (verifyRes.valid) {
          setSuccessMessage('Creator Access Key verified successfully!');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
        } else {
          throw new Error('Invalid Creator Access Key.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fadeIn" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '440px', padding: '32px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.2rem',
              marginBottom: '12px',
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)',
            }}
          >
            TP
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
            TubePilot AI Studio
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
            {mode === 'signin' && 'Sign in to access your projects and channel'}
            {mode === 'signup' && 'Create your autonomous video production account'}
            {mode === 'key' && 'Enter your private Creator Access Key'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-surface-2)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
          }}
        >
          {(['signin', 'signup', 'key'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setErrorMessage(null); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: mode === m ? 'var(--bg-surface-3)' : 'transparent',
                color: mode === m ? '#FFFFFF' : 'var(--text-secondary)',
              }}
            >
              {m === 'signin' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Access Key'}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              color: '#FCA5A5',
              fontSize: '0.82rem',
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#6EE7B7',
              fontSize: '0.82rem',
              lineHeight: 1.4,
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivers"
                className="input-field"
              />
            </div>
          )}

          {mode !== 'key' ? (
            <>
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@tubepilot.ai"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input-field"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="input-label">Creator Key</label>
              <input
                type="password"
                required
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter CREATOR_ACCESS_KEY"
                className="input-field"
                style={{ fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                Configured in backend environment variables as <code>CREATOR_ACCESS_KEY</code>.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {loading ? (
              <span className="spin">⟳ Processing...</span>
            ) : (
              <span>
                {mode === 'signin' && 'Sign In to Studio'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'key' && 'Verify & Unlock'}
              </span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '20px' }}>
          By signing in you agree to TubePilot AI's{' '}
          <a href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }} onClick={onClose}>
            Terms of Use
          </a>{' '}
          and{' '}
          <a href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }} onClick={onClose}>
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
