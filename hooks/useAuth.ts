'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

interface UseAuthOptions {
  callbackUrl?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { callbackUrl = '/' } = options;
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const loginWithGithub = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('github', { callbackUrl });
    } catch (error) {
      console.error('GitHub login error:', error);
      setError('Failed to login with GitHub');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error('Credentials login error:', error);
      setError('Failed to login with credentials');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl });
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
    loginWithGithub,
    loginWithGoogle,
    loginWithCredentials,
    logout,
  };
} 