// frontend-app/src/app/api/adsense/data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken } from '../auth/route'; // We will export this function from the auth route

const OAUTH2_CLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-url/api/adsense/callback'
    : 'http://localhost:3000/api/adsense/callback'
);

export async function GET() {
  const tokens = getToken();

  if (!tokens) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  OAUTH2_CLIENT.setCredentials(tokens);
  const adsense = google.adsense({
    version: 'v2',
    auth: OAUTH2_CLIENT,
  });

  try {
    const accountList = await adsense.accounts.list();
    const accounts = accountList.data.accounts;

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ accounts: [] });
    }

    // For simplicity, we'll fetch ad units for the first account
    const accountName = accounts[0].name;
    const adClientList = await adsense.accounts.adclients.list({ parent: accountName });
    const adClients = adClientList.data.adClients;

    if (!adClients || adClients.length === 0) {
      return NextResponse.json({ accounts, adUnits: [] });
    }

    const adClientName = adClients[0].name;
    const adUnitList = await adsense.accounts.adclients.adunits.list({ parent: adClientName });
    
    return NextResponse.json({
      accounts,
      adUnits: adUnitList.data.adUnits || [],
    });

  } catch (error) {
    console.error('Error fetching AdSense data:', error);
    return NextResponse.json({ error: 'Failed to fetch AdSense data' }, { status: 500 });
  }
}
