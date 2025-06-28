// frontend-app/src/app/api/adsense/data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getToken, setToken } from '../auth/route';

const OAUTH2_CLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-url/api/adsense/callback'
    : 'http://localhost:3000/api/adsense/callback'
);

// Listen for token refresh events
OAUTH2_CLIENT.on('tokens', (newTokens) => {
  console.log('AdSense token refreshed, saving new token...');
  setToken(newTokens);
});

export async function GET() {
  const tokens = await getToken();

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

    const accountName = accounts[0].name;

    // Fetch Ad Units
    const adClientList = await adsense.accounts.adclients.list({ parent: accountName });
    const adClients = adClientList.data.adClients;
    let adUnits = [];
    if (adClients && adClients.length > 0) {
      const adClientName = adClients[0].name;
      const adUnitList = await adsense.accounts.adclients.adunits.list({ parent: adClientName });
      adUnits = adUnitList.data.adUnits || [];
    }

    // Fetch Report Data
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const report = await adsense.accounts.reports.generate({
      account: accountName,
      dateRange: 'CUSTOM',
      'dateRange.startDate.year': startDate.getFullYear(),
      'dateRange.startDate.month': startDate.getMonth() + 1,
      'dateRange.startDate.day': startDate.getDate(),
      'dateRange.endDate.year': endDate.getFullYear(),
      'dateRange.endDate.month': endDate.getMonth() + 1,
      'dateRange.endDate.day': endDate.getDate(),
      metrics: ['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'PAGE_VIEWS', 'CLICKS'],
    });

    return NextResponse.json({
      accounts,
      adUnits,
      report: report.data,
    });

  } catch (error) {
    console.error('Error fetching AdSense data:', error);
    return NextResponse.json({ error: 'Failed to fetch AdSense data' }, { status: 500 });
  }
}
