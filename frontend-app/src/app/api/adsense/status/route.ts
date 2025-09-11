import { NextResponse } from 'next/server';
import { readToken } from '../auth/token-storage';

/**
 * GET /api/adsense/status - Check AdSense authentication status
 *
 * Returns current authentication state, token availability, and configuration status.
 * Used by dashboard to determine if AdSense API is ready for use.
 *
 * @returns {Promise<NextResponse>} Authentication status and configuration info
 */
export async function GET() {
  try {
    const tokens = await readToken();
    
    return NextResponse.json({
      authenticated: !!tokens,
      hasRefreshToken: !!(tokens?.refresh_token),
      clientConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      status: tokens ? 'authenticated' : 'not_authenticated',
      note: tokens ? 'AdSense API ready' : 'AdSense authentication required'
    });
    
  } catch (error) {
    console.error('Error checking AdSense status:', error);
    return NextResponse.json({
      authenticated: false,
      hasRefreshToken: false,
      clientConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}