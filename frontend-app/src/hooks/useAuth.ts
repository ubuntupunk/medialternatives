'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  userId: string;
  username: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-session='));

        if (authCookie) {
          const sessionData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
          
          // Check if session is still valid
          if (Date.now() < sessionData.expires) {
            setAuthState({
              user: {
                userId: sessionData.userId,
                username: sessionData.username,
                isAdmin: sessionData.isAdmin,
              },
              isLoading: false,
              isAuthenticated: true,
            });
            return;
          } else {
            // Session expired, clear cookie
            document.cookie = 'auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
        }

        // No valid session
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });

      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();

    // Check auth status periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Login function
  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API response
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Clear cookie
      document.cookie = 'auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Redirect to home
      router.push('/');
    }
  };

  // Require authentication (redirect if not authenticated)
  const requireAuth = (redirectTo: string = '/auth/login') => {
    useEffect(() => {
      if (!authState.isLoading && !authState.isAuthenticated) {
        const currentPath = window.location.pathname;
        const loginUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`;
        router.push(loginUrl);
      }
    }, [authState.isLoading, authState.isAuthenticated, redirectTo]);
  };

  // Require admin access
  const requireAdmin = (redirectTo: string = '/auth/unauthorized') => {
    useEffect(() => {
      if (!authState.isLoading && (!authState.isAuthenticated || !authState.user?.isAdmin)) {
        router.push(redirectTo);
      }
    }, [authState.isLoading, authState.isAuthenticated, authState.user?.isAdmin, redirectTo]);
  };

  return {
    ...authState,
    login,
    logout,
    requireAuth,
    requireAdmin,
  };
}