// frontend-app/src/app/api/adsense/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { setToken, getToken } from '../auth/token-utils';
import { getOAuthState } from '@/lib/oauth-security';

const OAUTH2_CLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-url/api/adsense/callback'
    : 'http://localhost:3000/api/adsense/callback'
);

/**
 * GET /api/adsense/callback - Handle AdSense OAuth callback
 *
 * Processes OAuth authorization code from Google and exchanges it for access tokens.
 * Stores tokens securely and redirects to dashboard with status.
 *
 * @param {NextRequest} req - Next.js request with OAuth code parameter
 * @returns {NextResponse} Redirect response to dashboard with status
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/adsense?status=no_code', req.url));
  }

  if (!state) {
    console.error('No state parameter provided');
    return NextResponse.redirect(new URL('/dashboard/adsense?status=error', req.url));
  }

  try {
    // Parse state parameter (format: sessionId:state)
    const [sessionId, receivedState] = state.split(':');

    console.log('OAuth callback debug:', {
      fullState: state,
      sessionId,
      receivedState,
      sessionIdLength: sessionId?.length,
      receivedStateLength: receivedState?.length
    });

    if (!sessionId || !receivedState) {
      console.error('Invalid state parameter format');
      return NextResponse.redirect(new URL('/dashboard/adsense?status=error', req.url));
    }

    // Retrieve stored OAuth state and PKCE verifier
    const storedState = await getOAuthState(sessionId);

    console.log('Stored state lookup:', {
      sessionId,
      storedState: !!storedState,
      stateStoreSize: (global as any).stateStoreSize || 'unknown'
    });

    if (!storedState) {
      console.error('OAuth state not found or expired for sessionId:', sessionId);
      return NextResponse.redirect(new URL('/dashboard/adsense?status=error', req.url));
    }

    // Validate state parameter
    if (storedState.state !== receivedState) {
      console.error('State parameter mismatch - possible CSRF attack');
      return NextResponse.redirect(new URL('/dashboard/adsense?status=error', req.url));
    }

    // Exchange code for tokens using PKCE
    const tokenOptions: { code: string; codeVerifier?: string } = { code };

    // If we have a code verifier from PKCE, include it
    if (storedState.pkce?.codeVerifier) {
      tokenOptions.codeVerifier = storedState.pkce.codeVerifier;
    }

    const { tokens: newTokens } = await OAUTH2_CLIENT.getToken(tokenOptions);

    // Store the tokens
    if (newTokens.refresh_token) {
      const existingTokens = await getToken();
      const mergedTokens = { ...existingTokens, ...newTokens };
      await setToken(mergedTokens);
      console.log('AdSense tokens stored with refresh token');
    } else {
      await setToken(newTokens);
      console.log('AdSense tokens stored (no refresh token provided)');
    }

    return NextResponse.redirect(new URL('/dashboard/adsense?status=success', req.url));

  } catch (error) {
    console.error('Error retrieving access token:', error);
    return NextResponse.redirect(new URL('/dashboard/adsense?status=error', req.url));
  }
}
