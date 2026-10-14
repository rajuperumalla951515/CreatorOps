import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getCurrentUser, onAuthStateChange } from '../utils/supabase';

/**
 * ProtectedRoute: Enforces authentication for private application routes (/app/*).
 * Redirects unauthenticated visitors to /login, preserving their intended destination.
 */
export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    // Check active session
    getCurrentUser()
      .then((user) => {
        if (isMounted) {
          setIsAuthenticated(Boolean(user));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (isMounted) {
        setIsAuthenticated(Boolean(session?.user));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-black)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: 'var(--accent-violet)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Authenticating CreatorOps session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * PublicOnlyRoute: Prevents already-signed-in users from seeing login/signup screens.
 * Redirects authenticated users directly to /app.
 */
export const PublicOnlyRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((user) => {
        if (isMounted) {
          setIsAuthenticated(Boolean(user));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      });

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (isMounted) {
        setIsAuthenticated(Boolean(session?.user));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // Silent seamless loading for login route
  }

  if (isAuthenticated) {
    const destination = (location.state as any)?.from || '/app';
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
