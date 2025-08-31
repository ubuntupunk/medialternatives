'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  initiateWordPressOAuth, 
  handleOAuthCallback, 
  getAuthStatus, 
  clearStoredToken,
  getStoredToken
} from '@/utils/wordpressImplicitAuth';

/**
 * WordPress.com OAuth token structure
 * @interface WordPressToken
 * @property {string} accessToken - The OAuth access token
 * @property {string} tokenType - Token type (usually 'bearer')
 * @property {number} expiresIn - Token expiration time in seconds
 * @property {string} scope - Granted OAuth scopes
 * @property {string} siteId - WordPress.com site ID
 * @property {string} state - OAuth state parameter for CSRF protection
 * @property {Date} expiresAt - Token expiration timestamp
 */
interface WordPressToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  siteId: string;
  state: string;
  expiresAt: Date;
}

/**
 * WordPress.com user information structure
 * @interface WordPressUser
 * @property {number} id - User ID
 * @property {string} name - Display name
 * @property {string} [email] - User email (if available)
 * @property {string} [avatar_url] - User avatar URL
 * @property {string[]} [roles] - User roles
 */
interface WordPressUser {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
  roles?: string[];
}

/**
 * WordPress.com authentication state structure
 * @interface WordPressAuthState
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {WordPressToken | null} token - Current authentication token
 * @property {WordPressUser | null} user - Current user information
 * @property {string[]} permissions - Array of granted permissions
 * @property {boolean} loading - Whether authentication is loading
 * @property {string | null} error - Authentication error message
 * @property {string | null} siteId - Current site ID
 */
interface WordPressAuthState {
  isAuthenticated: boolean;
  token: WordPressToken | null;
  user: WordPressUser | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
  siteId: string | null;
}

/**
 * WordPress.com authentication action methods
 * @interface WordPressAuthActions
 * @property {() => Promise<void>} login - Initiate OAuth login flow
 * @property {() => void} logout - Clear authentication and logout
 * @property {() => Promise<void>} refreshToken - Refresh authentication token
 * @property {(scope: string) => boolean} checkPermission - Check if user has specific permission
 * @property {() => void} clearError - Clear current error state
 */
interface WordPressAuthActions {
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkPermission: (scope: string) => boolean;
  clearError: () => void;
}

/**
 * Complete WordPress.com authentication context type
 * @interface WordPressAuthContextType
 * @extends WordPressAuthState
 * @extends WordPressAuthActions
 */
interface WordPressAuthContextType extends WordPressAuthState, WordPressAuthActions {}

// Context
const WordPressAuthContext = createContext<WordPressAuthContextType | undefined>(undefined);

/**
 * Props for WordPressAuthProvider component
 * @interface WordPressAuthProviderProps
 * @property {ReactNode} children - Child components to render
 */
interface WordPressAuthProviderProps {
  children: ReactNode;
}

/**
 * WordPress.com Authentication Context Provider Component
 *
 * This provider component manages the authentication state for WordPress.com OAuth.
 * It handles the OAuth flow, token storage, and provides authentication methods
 * to child components through React Context.
 *
 * @param {WordPressAuthProviderProps} props - Component props
 * @returns {JSX.Element} Context provider wrapping children
 *
 * @example
 * ```tsx
 * import { WordPressAuthProvider } from '@/contexts/WordPressAuthContext';
 *
 * function App() {
 *   return (
 *     <WordPressAuthProvider>
 *       <MyApp />
 *     </WordPressAuthProvider>
 *   );
 * }
 * ```
 */
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

  /**
   * Initialize authentication state on component mount
   * @returns {Promise<void>}
   */
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

  /**
   * Update authentication state with new token
   * @param {WordPressToken} token - New authentication token
   * @returns {Promise<void>}
   */
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

  /**
   * Initiate WordPress.com OAuth login flow
   * @returns {Promise<void>}
   */
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

  /**
   * Clear authentication and logout user
   * @returns {void}
   */
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

  /**
   * Refresh authentication token if still valid
   * @returns {Promise<void>}
   */
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

  /**
   * Check if user has specific permission scope
   * @param {string} scope - Permission scope to check
   * @returns {boolean} True if user has the permission
   */
  const checkPermission = (scope: string): boolean => {
    return state.permissions.includes(scope) || state.permissions.includes('read') || state.permissions.includes('write');
  };

  /**
   * Clear current error state
   * @returns {void}
   */
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

/**
 * Custom hook to access WordPress.com authentication context
 *
 * This hook provides access to the WordPress.com authentication state and methods.
 * Must be used within a WordPressAuthProvider component.
 *
 * @returns {WordPressAuthContextType} Authentication context with state and methods
 * @throws {Error} If used outside of WordPressAuthProvider
 *
 * @example
 * ```tsx
 * import { useWordPressAuth } from '@/contexts/WordPressAuthContext';
 *
 * function MyComponent() {
 *   const { isAuthenticated, login, logout, user } = useWordPressAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={login}>Login with WordPress.com</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWordPressAuth(): WordPressAuthContextType {
  const context = useContext(WordPressAuthContext);
  if (context === undefined) {
    throw new Error('useWordPressAuth must be used within a WordPressAuthProvider');
  }
  return context;
}

/**
 * TypeScript type definitions for WordPress.com authentication
 */

/**
 * WordPress.com OAuth token structure
 * @typedef {Object} WordPressToken
 * @property {string} accessToken - The OAuth access token
 * @property {string} tokenType - Token type (usually 'bearer')
 * @property {number} expiresIn - Token expiration time in seconds
 * @property {string} scope - Granted OAuth scopes
 * @property {string} siteId - WordPress.com site ID
 * @property {string} state - OAuth state parameter for CSRF protection
 * @property {Date} expiresAt - Token expiration timestamp
 */

/**
 * WordPress.com user information structure
 * @typedef {Object} WordPressUser
 * @property {number} id - User ID
 * @property {string} name - Display name
 * @property {string} [email] - User email (if available)
 * @property {string} [avatar_url] - User avatar URL
 * @property {string[]} [roles] - User roles
 */

/**
 * WordPress.com authentication state structure
 * @typedef {Object} WordPressAuthState
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {WordPressToken|null} token - Current authentication token
 * @property {WordPressUser|null} user - Current user information
 * @property {string[]} permissions - Array of granted permissions
 * @property {boolean} loading - Whether authentication is loading
 * @property {string|null} error - Authentication error message
 * @property {string|null} siteId - Current site ID
 */

// Export types for use in other components
export type { WordPressToken, WordPressUser, WordPressAuthState };