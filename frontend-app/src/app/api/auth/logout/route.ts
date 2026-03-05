import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

/**
 * POST /api/auth/logout - Secure JWT-based user logout endpoint
 *
 * Clears all authentication cookies and terminates the user session.
 * Removes both access and refresh JWT tokens from the browser.
 *
 * @returns {Promise<NextResponse>} Logout confirmation response
 */
export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      data: { message: 'Logout successful' },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: '2.0.0'
      }
    });

    // Clear all JWT authentication cookies
    clearAuthCookies(response);

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
      },
      { status: 500 }
    );
  }
}