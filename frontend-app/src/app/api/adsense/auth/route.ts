// frontend-app/src/app/api/adsense/auth/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { readToken, writeToken } from './token-storage';

const OAUTH2_CLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-url/api/adsense/callback'
    : 'http://localhost:3000/api/adsense/callback'
);

export async function getToken() {
  return await readToken();
}

export async function setToken(newToken: object) {
  await writeToken(newToken);
}

export async function GET() {
  const authUrl = OAUTH2_CLIENT.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/adsense.readonly'],
    prompt: 'consent',
  });
  return NextResponse.redirect(authUrl);
}
