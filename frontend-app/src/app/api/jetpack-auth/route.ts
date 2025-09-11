import { NextRequest, NextResponse } from 'next/server';

// Jetpack Authentication API
// Handles WordPress.com OAuth flow and nonce generation

interface JetpackAuthStatus {
  isAuthenticated: boolean;
  authMethod: 'oauth' | 'nonce' | 'none';
  siteUrl: string;
  nonce?: string;
  expiresAt?: string;
  permissions: string[];
}

export async function GET() {
  try {
    // Check current authentication status
    const authStatus = await checkJetpackAuthStatus();
    
    return NextResponse.json({
      success: true,
      data: authStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Jetpack auth status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check authentication status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    
    switch (action) {
      case 'initiate_oauth':
        return await initiateOAuthFlow();
      case 'exchange_code':
        return await exchangeOAuthCode(params);
      case 'refresh_token':
        return await refreshAccessToken(params);
      case 'generate_nonce':
        return await generateWPNonce();
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Jetpack auth action error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication action failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Check current Jetpack authentication status
 */
async function checkJetpackAuthStatus(): Promise<JetpackAuthStatus> {
  const siteUrl = 'medialternatives.wordpress.com';
  
  // Check for stored authentication credentials
  const accessToken = process.env.WORDPRESS_COM_ACCESS_TOKEN;
  const apiNonce = process.env.WP_API_NONCE;
  const authCookie = process.env.WP_AUTH_COOKIE;
  
  if (accessToken) {
    // Verify OAuth token is still valid
    try {
      const response = await fetch('https://public-api.wordpress.com/rest/v1.1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        return {
          isAuthenticated: true,
          authMethod: 'oauth',
          siteUrl,
          permissions: ['read:stats', 'read:posts'],
          expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        };
      }
    } catch (error) {
      console.error('OAuth token validation failed:', error);
    }
  }
  
  if (apiNonce && authCookie) {
    return {
      isAuthenticated: true,
      authMethod: 'nonce',
      siteUrl,
      nonce: apiNonce,
      permissions: ['read:stats'],
      expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
    };
  }
  
  return {
    isAuthenticated: false,
    authMethod: 'none',
    siteUrl,
    permissions: []
  };
}

/**
 * Initiate WordPress.com OAuth flow
 */
async function initiateOAuthFlow() {
  const clientId = process.env.WORDPRESS_COM_CLIENT_ID;
  const redirectUri = process.env.WORDPRESS_COM_REDIRECT_URI || 
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/jetpack-auth/callback`;
  
  if (!clientId) {
    throw new Error('WordPress.com OAuth client ID not configured');
  }
  
  const scope = 'read:stats,read:posts';
  const state = generateRandomState();
  
  const authUrl = new URL('https://public-api.wordpress.com/oauth2/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);
  
  return NextResponse.json({
    success: true,
    data: {
      authUrl: authUrl.toString(),
      state,
      expiresIn: 600 // 10 minutes
    }
  });
}

/**
 * Exchange OAuth authorization code for access token
 */
async function exchangeOAuthCode(params: { code: string; state: string }) {
  const clientId = process.env.WORDPRESS_COM_CLIENT_ID;
  const clientSecret = process.env.WORDPRESS_COM_CLIENT_SECRET;
  const redirectUri = process.env.WORDPRESS_COM_REDIRECT_URI;
  
  if (!clientId || !clientSecret) {
    throw new Error('WordPress.com OAuth credentials not configured');
  }
  
  const tokenResponse = await fetch('https://public-api.wordpress.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: params.code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri || ''
    })
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange OAuth code for token');
  }
  
  const tokenData = await tokenResponse.json();
  
  // In production, you would store this securely
  // For now, we'll return it for manual environment variable setup
  return NextResponse.json({
    success: true,
    data: {
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
      expiresIn: tokenData.expires_in,
      note: 'Store this access token in WORDPRESS_COM_ACCESS_TOKEN environment variable'
    }
  });
}

/**
 * Refresh OAuth access token
 */
async function refreshAccessToken(params: { refreshToken: string }) {
  const clientId = process.env.WORDPRESS_COM_CLIENT_ID;
  const clientSecret = process.env.WORDPRESS_COM_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('WordPress.com OAuth credentials not configured');
  }
  
  const tokenResponse = await fetch('https://public-api.wordpress.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: params.refreshToken,
      grant_type: 'refresh_token'
    })
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to refresh access token');
  }
  
  const tokenData = await tokenResponse.json();
  
  return NextResponse.json({
    success: true,
    data: {
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in
    }
  });
}

/**
 * Generate WordPress nonce for API requests
 */
async function generateWPNonce() {
  // This would typically require authenticated access to the WordPress site
  // For now, return instructions for manual nonce generation
  
  return NextResponse.json({
    success: false,
    error: 'Nonce generation requires WordPress admin access',
    instructions: {
      method1: 'Access your WordPress admin dashboard and check browser console for window.Initial_State.WP_API_nonce',
      method2: 'Use WordPress wp_create_nonce() function with action "wp_rest"',
      method3: 'Extract nonce from authenticated WordPress admin page requests',
      note: 'Nonces expire after 24 hours and are tied to specific user sessions'
    }
  });
}

/**
 * Generate random state for OAuth flow
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}