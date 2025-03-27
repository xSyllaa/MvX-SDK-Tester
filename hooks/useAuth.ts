'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  isAnonymous: boolean;
}

interface UseAuthOptions {
  callbackUrl?: string;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthSession {
  user: User | null;
  token: string | null;
  expiresAt: string | null;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { callbackUrl = '/' } = options;
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Vérifier l'état de l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          setSession({
            user: data.user,
            token: data.token,
            expiresAt: data.expiresAt
          });
          setStatus('authenticated');
        } else {
          setSession(null);
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setSession(null);
        setStatus('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const loginWithCredentials = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to login');
        return false;
      }

      setSession({
        user: data.user,
        token: data.token,
        expiresAt: data.expiresAt
      });
      setStatus('authenticated');
      
      if (callbackUrl) {
        window.location.href = callbackUrl;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setSession(null);
      setStatus('unauthenticated');
      
      if (callbackUrl) {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    isAuthenticated,
    isLoading,
    error,
    loading,
    loginWithCredentials,
    logout,
  };
} 