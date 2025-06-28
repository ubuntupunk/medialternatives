// frontend-app/src/app/api/adsense/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { setToken } from '../auth/route';

const OAUTH2_CLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-url/api/adsense/callback'
    : 'http://localhost:3000/api/adsense/callback'
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      const { tokens: newTokens } = await OAUTH2_CLIENT.getToken(code);
      await setToken(newTokens);
      
      return NextResponse.redirect(new URL('/dashboard/adsense?status=success', req.url));

    } catch (error) {
      console.error('Error retrieving access token', error);
      return NextResponse.redirect(new URL('/dashboard/adsense?status=error', req.url));
    }
  }

  return NextResponse.redirect(new URL('/dashboard/adsense?status=no_code', req.url));
}
