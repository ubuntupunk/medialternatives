import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Admin password from environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Security check - ensure password is set in production
if (!ADMIN_PASSWORD) {
  console.error('SECURITY WARNING: ADMIN_PASSWORD environment variable is not set!');
  console.error('Please set ADMIN_PASSWORD in your .env file for security.');
}

/**
 * POST /api/auth/login - Admin authentication endpoint
 * @param {NextRequest} request - Next.js request object containing password
 * @returns {Promise<NextResponse>} Authentication response with session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Security check - ensure admin password is configured
    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Authentication system not properly configured' },
        { status: 500 }
      );
    }

    // Check password
    if (password !== ADMIN_PASSWORD) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session data
    const sessionData = {
      userId: 'david-robert-lewis',
      username: 'David Robert Lewis',
      isAdmin: true,
      loginTime: Date.now(),
      expires: Date.now() + SESSION_DURATION,
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: sessionData.userId,
        username: sessionData.username,
        isAdmin: sessionData.isAdmin,
      }
    });

    // Set secure cookie
    const cookieStore = cookies();
    cookieStore.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: false, // Allow client-side access for now
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}