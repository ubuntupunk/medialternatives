import { NextResponse } from 'next/server';
import { getToken } from '../auth/route';

// Check AdSense authentication status
export async function GET() {
  try {
    const tokens = await getToken();
    
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