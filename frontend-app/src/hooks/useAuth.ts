'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * User information interface
 */
export interface User {
  userId: string;
  username: string;
  isAdmin: boolean;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Custom React hook for authentication management
 *
 * Provides authentication state management, login/logout functionality,
 * and route protection utilities for the Media Alternatives application.
 *
 * @returns {Object} Authentication hook interface
 * @property {User|null} user - Current authenticated user
 * @property {boolean} isLoading - Whether authentication is loading
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {Function} login - Login function
 * @property {Function} logout - Logout function
  * @property {Function} useRequireAuth - Require authentication for route
  * @property {Function} useRequireAdmin - Require admin access for route
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, login, logout } = useAuth();
 *
 * // Login
 * const result = await login('password');
 *
 * // Logout
 * await logout();
 *
  * // Require authentication
  * useRequireAuth('/auth/login');
  *
  * // Require admin access
  * useRequireAdmin('/auth/unauthorized');
 * ```
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const router = useRouter();

  // Check authentication status using secure session validation API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include', // Include httpOnly cookies
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data.isAuthenticated) {
            setAuthState({
              user: result.data.user,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            // Not authenticated or session expired/invalid
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          // API error, assume not authenticated
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }

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
        credentials: 'include', // Include cookies for httpOnly session
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update auth state with user data from login response
        setAuthState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        const errorMessage = data.error?.message || data.error || 'Login failed';
        return { success: false, error: errorMessage };
      }
    } catch (_error) {
      return { success: false, error: 'Network error' };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include httpOnly cookies
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
      
      // Note: No need to manually clear httpOnly cookies - the server handles this
      
      // Redirect to home
      router.push('/');
    }
  };

  // Require authentication (redirect if not authenticated)
  const useRequireAuth = (redirectTo: string = '/auth/login') => {
    const { isLoading, isAuthenticated } = authState;
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        const currentPath = window.location.pathname;
        const loginUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`;
        router.push(loginUrl);
      }
    }, [isLoading, isAuthenticated, redirectTo]);
  };

  // Require admin access
  const useRequireAdmin = (redirectTo: string = '/auth/unauthorized') => {
    const { isLoading, isAuthenticated, user } = authState;
    useEffect(() => {
      if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
        router.push(redirectTo);
      }
    }, [isLoading, isAuthenticated, user?.isAdmin, redirectTo]);
  };

  return {
    ...authState,
    login,
    logout,
    useRequireAuth,
    useRequireAdmin,
  };
}