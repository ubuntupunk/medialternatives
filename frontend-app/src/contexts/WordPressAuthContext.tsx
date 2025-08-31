'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  initiateWordPressOAuth, 
  handleOAuthCallback, 
  getAuthStatus, 
  clearStoredToken,
  getStoredToken
} from '@/utils/wordpressImplicitAuth';

// Types
interface WordPressToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  siteId: string;
  state: string;
  expiresAt: Date;
}

interface WordPressUser {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
  roles?: string[];
}

interface WordPressAuthState {
  isAuthenticated: boolean;
  token: WordPressToken | null;
  user: WordPressUser | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
  siteId: string | null;
}

interface WordPressAuthActions {
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkPermission: (scope: string) => boolean;
  clearError: () => void;
}

interface WordPressAuthContextType extends WordPressAuthState, WordPressAuthActions {}

// Context
const WordPressAuthContext = createContext<WordPressAuthContextType | undefined>(undefined);

// Provider Props
interface WordPressAuthProviderProps {
  children: ReactNode;
}

// Provider Component
export function WordPressAuthProvider({ children }: WordPressAuthProviderProps) {
  const [state, setState] = useState<WordPressAuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    permissions: [],
    loading: true,
    error: null,
    siteId: null
  });

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Check for OAuth callback on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const authResult = handleOAuthCallback();
    if (authResult.isAuthenticated && authResult.token) {
      console.log('🎉 WordPress.com OAuth successful via context!');
      updateAuthState(authResult.token);
    } else if (authResult.error) {
      setState(prev => ({ ...prev, error: authResult.error!, loading: false }));
    }
  }, []);

  const initializeAuth = async () => {
    try {
      const currentAuth = getAuthStatus();
      if (currentAuth.isAuthenticated && currentAuth.token) {
        await updateAuthState(currentAuth.token);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Authentication initialization failed'
      }));
    }
  };

  const updateAuthState = async (token: WordPressToken) => {
    try {
      // Parse permissions from token scope
      const permissions = token.scope ? token.scope.split(',') : [];
      
      // TODO: Fetch user data with token
      const user: WordPressUser = {
        id: 1,
        name: 'David Robert Lewis', // Fallback - will be fetched from API later
        avatar_url: '/images/avatar.png'
      };

      setState({
        isAuthenticated: true,
        token,
        user,
        permissions,
        loading: false,
        error: null,
        siteId: token.siteId
      });

      console.log('✅ WordPress.com authentication state updated:', {
        siteId: token.siteId,
        permissions,
        expiresAt: token.expiresAt
      });

    } catch (error) {
      console.error('Error updating auth state:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to update authentication'
      }));
    }
  };

  const login = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      initiateWordPressOAuth();
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Login failed'
      }));
    }
  };

  const logout = () => {
    clearStoredToken();
    setState({
      isAuthenticated: false,
      token: null,
      user: null,
      permissions: [],
      loading: false,
      error: null,
      siteId: null
    });
    console.log('🚪 WordPress.com logout successful');
  };

  const refreshToken = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Check if current token is still valid
      const currentToken = getStoredToken();
      if (currentToken && new Date() < new Date(currentToken.expiresAt)) {
        await updateAuthState(currentToken);
        return;
      }

      // Token expired - need to re-authenticate
      logout();
      throw new Error('Token expired - please re-authenticate');

    } catch (error) {
      console.error('Token refresh error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Token refresh failed'
      }));
    }
  };

  const checkPermission = (scope: string): boolean => {
    return state.permissions.includes(scope) || state.permissions.includes('read') || state.permissions.includes('write');
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const contextValue: WordPressAuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    checkPermission,
    clearError
  };

  return (
    <WordPressAuthContext.Provider value={contextValue}>
      {children}
    </WordPressAuthContext.Provider>
  );
}

// Hook to use WordPress Auth Context
export function useWordPressAuth(): WordPressAuthContextType {
  const context = useContext(WordPressAuthContext);
  if (context === undefined) {
    throw new Error('useWordPressAuth must be used within a WordPressAuthProvider');
  }
  return context;
}

// Export types for use in other components
export type { WordPressToken, WordPressUser, WordPressAuthState };