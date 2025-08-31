import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/jetpack-auth/implicit - Jetpack Implicit OAuth Implementation
 *
 * Handles WordPress.com Implicit OAuth flow based on Automattic's Grasshopper approach.
 * Supports initiation, callback handling, and information retrieval.
 *
 * @param {NextRequest} request - Next.js request with action parameter
 * @returns {Promise<NextResponse>} OAuth operation result or error response
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'initiate':
        return initiateImplicitOAuth();
      case 'callback':
        return handleOAuthCallback(request);
      default:
        return getImplicitOAuthInfo();
    }
    
  } catch (error) {
    console.error('Implicit OAuth error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Implicit OAuth operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Initiate WordPress.com Implicit OAuth Flow
 * No client secret needed - perfect for frontend apps
 * @returns {NextResponse} OAuth initiation data with authorization URL
 */
function initiateImplicitOAuth() {
  // WordPress.com OAuth endpoint for implicit flow
  const authUrl = new URL('https://public-api.wordpress.com/oauth2/authorize');
  
  // Parameters for implicit OAuth
  authUrl.searchParams.set('client_id', '69634'); // WordPress.com public client ID for implicit flow
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/analytics?oauth=callback`);
  authUrl.searchParams.set('response_type', 'token'); // Key difference: 'token' not 'code'
  authUrl.searchParams.set('scope', 'read'); // Read access to stats
  authUrl.searchParams.set('blog', 'medialternatives.wordpress.com'); // Specific site
  
  // Generate state for security
  const state = generateRandomState();
  authUrl.searchParams.set('state', state);
  
  return NextResponse.json({
    success: true,
    data: {
      authUrl: authUrl.toString(),
      state,
      method: 'implicit',
      note: 'Token will be returned in URL fragment after authorization'
    }
  });
}

/**
 * Handle OAuth callback (though with implicit flow, token is in URL fragment)
 * @param {NextRequest} request - Next.js request object
 * @returns {NextResponse} Callback handling instructions
 */
function handleOAuthCallback(request: NextRequest) {
  // With implicit flow, the token is in the URL fragment (#access_token=...)
  // This is handled client-side, not server-side
  
  return NextResponse.json({
    success: true,
    message: 'Implicit OAuth callback - token should be in URL fragment',
    instructions: {
      clientSide: 'Extract token from window.location.hash',
      format: '#access_token=TOKEN&token_type=bearer&expires_in=3600&scope=read&site_id=SITE_ID&state=STATE',
      nextSteps: 'Use extracted token for WordPress.com API calls'
    }
  });
}

/**
 * Get information about implicit OAuth setup
 * @returns {NextResponse} OAuth implementation information
 */
function getImplicitOAuthInfo() {
  return NextResponse.json({
    success: true,
    data: {
      method: 'implicit',
      description: 'WordPress.com Implicit OAuth (Grasshopper-style)',
      advantages: [
        'No client secret required',
        'Perfect for frontend applications',
        'Token returned directly in URL',
        'Site ID automatically provided',
        'Single-site scope'
      ],
      flow: [
        '1. Redirect user to WordPress.com OAuth',
        '2. User authorizes application',
        '3. Redirect back with token in URL fragment',
        '4. Extract token client-side',
        '5. Use token for API calls'
      ],
      security: {
        state: 'CSRF protection via state parameter',
        scope: 'Limited to read-only access',
        expiry: 'Tokens expire automatically',
        revocation: 'User can revoke access anytime'
      }
    }
  });
}

/**
 * Generate random state for CSRF protection
 * @returns {string} Random state string
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}