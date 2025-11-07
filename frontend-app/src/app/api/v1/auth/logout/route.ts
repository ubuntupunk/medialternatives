import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout - Secure user logout endpoint
 *
 * Clears all authentication cookies and terminates the user session.
 * Removes both access and refresh tokens from the browser.
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
        version: '1.0.0'
      }
    });

    // Clear all authentication cookies
    response.cookies.set('auth-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    // Clear JWT tokens (when implemented)
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

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