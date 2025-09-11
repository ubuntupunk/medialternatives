/**
 * WordPress.com Implicit OAuth Utilities
 * Based on Automattic's Grasshopper implementation
 * https://github.com/automattic/grasshopper
 */

/**
 * WordPress.com OAuth token structure
 * @interface WordPressToken
 * @property {string} accessToken - OAuth access token
 * @property {string} tokenType - Token type (usually 'bearer')
 * @property {number} expiresIn - Token expiration time in seconds
 * @property {string} scope - Granted OAuth scopes
 * @property {string} siteId - WordPress.com site identifier
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
 * Authentication state structure
 * @interface AuthState
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {WordPressToken} [token] - Current authentication token
 * @property {string} [error] - Authentication error message
 */
interface AuthState {
  isAuthenticated: boolean;
  token?: WordPressToken;
  error?: string;
}

/**
 * Initiate WordPress.com implicit OAuth flow
 * @returns {void}
 * @throws {Error} If not in browser or client ID not configured
 */
export function initiateWordPressOAuth(): void {
  // Ensure we're in the browser
  if (typeof window === 'undefined') {
    throw new Error('OAuth can only be initiated in the browser');
  }
  
  // Generate state for CSRF protection
  const state = generateRandomState();
  localStorage.setItem('wp_oauth_state', state);
  
  // Build OAuth URL
  const authUrl = new URL('https://public-api.wordpress.com/oauth2/authorize');
  
  // Use your registered WordPress.com OAuth app client ID
  const clientId = process.env.NEXT_PUBLIC_WORDPRESS_COM_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('WordPress.com Client ID not configured. Add NEXT_PUBLIC_WORDPRESS_COM_CLIENT_ID to .env.local');
  }
  
  authUrl.searchParams.set('client_id', clientId);
  console.log('Using WordPress.com Client ID:', clientId);
  
  // Use the full analytics page URL as redirect URI
  const redirectUri = window.location.origin + '/dashboard/analytics';
  authUrl.searchParams.set('redirect_uri', redirectUri);
  
  authUrl.searchParams.set('response_type', 'token');
  
  // WordPress.com OAuth scopes - using only documented scopes
  // Based on https://developer.wordpress.com/docs/oauth2/#token-scope
  // Note: WordPress.com only supports 'read', 'write', 'global', 'auth' scopes
  // Stats access is included in 'read' scope for Jetpack sites
  const scopes = [
    'read',              // Basic read access (includes stats for Jetpack sites)
    'global'             // Access to WordPress.com account information
  ].join(',');
  
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('blog', 'medialternatives.wordpress.com');
  authUrl.searchParams.set('state', state);
  
  console.log('OAuth URL:', authUrl.toString());
  console.log('Redirect URI:', redirectUri);
  console.log('Requested Scopes:', scopes);
  console.log('Target Blog:', 'medialternatives.wordpress.com');
  
  // Redirect to WordPress.com
  window.location.href = authUrl.toString();
}

/**
 * Check if we're returning from OAuth and extract token
 * @returns {AuthState} Authentication state with token if successful
 */
export function handleOAuthCallback(): AuthState {
  // Ensure we're in the browser
  if (typeof window === 'undefined') {
    return { isAuthenticated: false };
  }
  
  const hash = window.location.hash;
  
  if (!hash || !hash.includes('access_token=')) {
    return { isAuthenticated: false };
  }
  
  try {
    // Parse URL fragment
    const params = new URLSearchParams(hash.substring(1));
    
    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');
    const expiresIn = params.get('expires_in');
    const scope = params.get('scope');
    const siteId = params.get('site_id');
    const state = params.get('state');
    
    // Verify state for CSRF protection
    const storedState = localStorage.getItem('wp_oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }
    
    if (!accessToken || !siteId) {
      throw new Error('Missing required OAuth parameters');
    }
    
    // Create token object
    const token: WordPressToken = {
      accessToken,
      tokenType: tokenType || 'bearer',
      expiresIn: parseInt(expiresIn || '3600'),
      scope: scope || 'read',
      siteId,
      state: state || '',
      expiresAt: new Date(Date.now() + parseInt(expiresIn || '3600') * 1000)
    };
    
    // Store token securely
    storeToken(token);
    
    // Clean up URL and localStorage
    window.history.replaceState({}, document.title, window.location.pathname);
    localStorage.removeItem('wp_oauth_state');
    
    return {
      isAuthenticated: true,
      token
    };
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'OAuth callback failed'
    };
  }
}

/**
 * Get stored authentication token
 * @returns {WordPressToken | null} Stored token or null if not found/expired
 */
export function getStoredToken(): WordPressToken | null {
  // Ensure we're in the browser
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const tokenData = localStorage.getItem('wp_oauth_token');
    if (!tokenData) return null;
    
    const token: WordPressToken = JSON.parse(tokenData);
    
    // Check if token is expired
    if (new Date() > new Date(token.expiresAt)) {
      clearStoredToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error retrieving stored token:', error);
    clearStoredToken();
    return null;
  }
}

/**
 * Store authentication token securely
 * @param {WordPressToken} token - Token to store
 * @returns {void}
 */
export function storeToken(token: WordPressToken): void {
  // Ensure we're in the browser
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('wp_oauth_token', JSON.stringify(token));
  } catch (error) {
    console.error('Error storing token:', error);
  }
}

/**
 * Clear stored authentication token
 * @returns {void}
 */
export function clearStoredToken(): void {
  // Ensure we're in the browser
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('wp_oauth_token');
  localStorage.removeItem('wp_oauth_state');
}

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if user has valid stored token
 */
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  return token !== null;
}

/**
 * Get current authentication status
 * @returns {AuthState} Current authentication state
 */
export function getAuthStatus(): AuthState {
  const token = getStoredToken();
  
  if (token) {
    return {
      isAuthenticated: true,
      token
    };
  }
  
  return { isAuthenticated: false };
}

/**
 * Make authenticated API call to WordPress.com
 * @param {string} endpoint - API endpoint URL
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If not authenticated or request fails
 */
export async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  console.log('🔐 Making authenticated request to:', endpoint);
  console.log('🎫 Using token:', token.accessToken.substring(0, 20) + '...');
  
  const headers = {
    'Authorization': `Bearer ${token.accessToken}`,
    'Content-Type': 'application/json',
    // Remove User-Agent header - causes CORS issues
    ...options.headers
  };
  
  const response = await fetch(endpoint, {
    ...options,
    headers
  });
  
  console.log('📡 Response status:', response.status, response.statusText);
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  console.log('📄 Content-Type:', contentType);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error Response:', errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await response.text();
    console.error('❌ Non-JSON response received:', responseText.substring(0, 500));
    throw new Error('API returned non-JSON response');
  }
  
  return response;
}

/**
 * Generate random state for CSRF protection
 * @returns {string} Random state string
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * WordPress.com API endpoints for authenticated requests
 * @constant {Object} WORDPRESS_API_ENDPOINTS
 */
export const WORDPRESS_API_ENDPOINTS = {
  SITE_STATS: (siteId: string) => `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/stats`,
  SITE_STATS_SUMMARY: (siteId: string, period: string) => 
    `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/stats/summary?period=${period}`,
  SITE_STATS_TOP_POSTS: (siteId: string, period: string) => 
    `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/stats/top-posts?period=${period}`,
  SITE_STATS_REFERRERS: (siteId: string, period: string) => 
    `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/stats/referrers?period=${period}`,
  SITE_STATS_SEARCH_TERMS: (siteId: string, period: string) => 
    `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/stats/search-terms?period=${period}`
} as const;