// frontend-app/src/app/api/adsense/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { readToken, writeToken } from '../token-storage';

const OAUTH2_CLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * POST /api/adsense/auth/logout - Sign out of AdSense
 *
 * Revokes OAuth tokens on Google's side and clears stored tokens locally.
 * Ensures clean logout and allows re-authentication.
 *
 * @returns {Promise<NextResponse>} Logout confirmation or error response
 */
export async function POST() {
  try {
    const tokens = await readToken();

    if (tokens && tokens.refresh_token) {
      // Revoke the token on Google's side
      await OAUTH2_CLIENT.revokeToken(tokens.refresh_token);
    }

    // Clear the stored token
    await writeToken({});

    return NextResponse.json({ message: 'Successfully signed out' }, { status: 200 });
  } catch (error) {
    console.error('Error signing out of AdSense:', error);
    // Even if revocation fails, we should clear the local token to allow re-authentication
    await writeToken({});
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
