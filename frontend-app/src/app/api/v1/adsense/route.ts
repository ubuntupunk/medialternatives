// frontend-app/src/app/api/adsense/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { readToken, writeToken } from '../auth/token-storage';
import {
  generateState,
  generatePKCE,
  getRedirectURI,
  validateScopes,
  storeOAuthState,
  generateSessionId
} from '@/lib/oauth-security';

const OAUTH2_CLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectURI()
);

/**
 * Get stored AdSense OAuth token
 * @returns {Promise<any>} Stored OAuth token or null
 */
export async function getToken() {
  return await readToken();
}

/**
 * Store AdSense OAuth token
 * @param {object} newToken - OAuth token to store
 * @returns {Promise<void>}
 */
export async function setToken(newToken: object) {
  await writeToken(newToken);
}

/**
 * GET /api/adsense/auth - Initiate secure AdSense OAuth flow
 *
 * Initiates a secure OAuth flow with CSRF protection and PKCE.
 * Generates authorization URL with state parameter and code challenge.
 *
 * @returns {NextResponse} Redirect response to Google OAuth with security parameters
 */
export async function GET(request: NextRequest) {
  try {
    // Generate security parameters
    const state = generateState();
    const pkce = generatePKCE();
    const sessionId = generateSessionId();

    // Store state and PKCE values for later verification
    storeOAuthState(sessionId, state, { codeVerifier: pkce.codeVerifier });

    // Define allowed scopes
    const scopes = ['https://www.googleapis.com/auth/adsense.readonly'];

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
      prompt: 'consent',
      state: `${sessionId}:${state}`, // Include session ID with state
      code_challenge: pkce.codeChallenge,
      code_challenge_method: 'S256' as any // Type assertion for Google OAuth client
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
