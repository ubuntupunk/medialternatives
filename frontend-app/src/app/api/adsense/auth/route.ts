// frontend-app/src/app/api/adsense/auth/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import {
  generateState,
  generatePKCE,
  getRedirectURI,
  validateScopes,
  storeOAuthState,
  generateSessionId
} from '@/lib/oauth-security';

import { GOOGLE_SCOPES } from '@/lib/constants';
import { getToken } from './token-utils';

const OAUTH2_CLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectURI()
);



/**
 * GET /api/adsense/auth - Initiate secure AdSense OAuth flow
 *
 * Initiates a secure OAuth flow with CSRF protection and PKCE.
 * Generates authorization URL with state parameter and code challenge.
 *
 * @returns {NextResponse} Redirect response to Google OAuth with security parameters
 */
export async function GET() {
  try {
    // Check if we have tokens but no refresh token - force re-auth
    const existingTokens = await getToken();
    if (existingTokens && !existingTokens.refresh_token) {
      console.log('Existing tokens found but no refresh token - forcing re-authentication');
      // Don't clear tokens here, let the OAuth flow handle it
    }

    // Generate security parameters
    const state = generateState();
    const pkce = generatePKCE();
    const sessionId = generateSessionId();

    // Store state and PKCE values for later verification
    await storeOAuthState(sessionId, state, { codeVerifier: pkce.codeVerifier });

    // Define allowed scopes
    const scopes = [GOOGLE_SCOPES.ADSENSE];

    // Validate scopes
    if (!validateScopes(scopes)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_SCOPES', message: 'Requested scopes are not allowed' }
        },
        { status: 400 }
      );
    }

    // Generate secure authorization URL
    const authUrl = OAUTH2_CLIENT.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to ensure refresh token
      state: `${sessionId}:${state}`, // Include session ID with state
      code_challenge: pkce.codeChallenge,
       code_challenge_method: 'S256' as 'S256' & 'plain'
    });

    // Create response with session cookie
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('oauth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'OAUTH_INIT_ERROR', message: 'Failed to initiate OAuth flow' }
      },
      { status: 500 }
    );
  }
}
