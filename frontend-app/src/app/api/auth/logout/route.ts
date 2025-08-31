import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout - User logout endpoint
 *
 * Clears the authentication session cookie and logs out the user.
 * Removes the auth-session cookie from the browser.
 *
 * @returns {Promise<NextResponse>} Logout confirmation response
 */
export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear the auth cookie
    const cookieStore = cookies();
    cookieStore.delete('auth-session');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}