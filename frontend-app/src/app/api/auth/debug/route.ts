import { NextResponse } from 'next/server';

/**
 * GET /api/auth/debug - Debug endpoint for authentication system
 * Shows current state of users and environment variables (for development only)
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  const debugInfo = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ? 'SET' : 'NOT SET',
    },
    users: {
      // We'll add user info here if needed
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(debugInfo);
}