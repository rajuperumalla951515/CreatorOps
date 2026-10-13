import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../utils/supabase';
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Browser automatically redirects to Google OAuth consent URL
    } catch (err: any) {
      setErrorMessage(err.message || 'Google OAuth failed. Ensure Google provider is enabled in Supabase.');
      setGoogleLoading(false);
    }
  };

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
        const data = await signUpWithEmail(email, password, fullName);
        if (data?.session?.access_token) {
          localStorage.setItem('tubepilot_supabase_token', data.session.access_token);
          setSuccessMessage('Account created and signed in successfully!');
        } else {
          setSuccessMessage('Registration submitted! If confirmation is enabled, check your inbox/spam folder. You can also log in directly or use your Creator Key.');
        }
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
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

        {/* Auth Mode Tabs */}
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

        {/* Continue with Google OAuth Button */}
        {mode !== 'key' && (
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-2)',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-3)';
                e.currentTarget.style.borderColor = 'var(--accent-violet)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '18px 0 6px 0',
                color: 'var(--text-muted)',
                fontSize: '0.74rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ padding: '0 10px' }}>or with email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>
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
