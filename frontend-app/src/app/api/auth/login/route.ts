import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Admin password from environment variables (temporary - will be replaced with hash)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Security check - ensure password is set in production
if (!ADMIN_PASSWORD) {
  console.error('SECURITY WARNING: ADMIN_PASSWORD environment variable is not set!');
  console.error('Please set ADMIN_PASSWORD in your .env file for security.');
}

/**
 * POST /api/auth/login - Enhanced authentication endpoint
 *
 * Authenticates admin user with improved security measures.
 * This is a transitional implementation that will be upgraded to JWT in the next iteration.
 *
 * @param {NextRequest} request - Next.js request object containing password
 * @returns {Promise<NextResponse>} Authentication response with secure session
 */
export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting for authentication
    const rateLimit = createRateLimit(rateLimitConfigs.auth);
    const rateLimitResponse = await rateLimit(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Password is required' }
        },
        { status: 400 }
      );
    }

    // Security check - ensure admin password is configured
    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'CONFIG_ERROR', message: 'Authentication system not properly configured' }
        },
        { status: 500 }
      );
    }

    // Check password
    if (password !== ADMIN_PASSWORD) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));

      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid password' }
        },
        { status: 401 }
      );
    }

    // Create session data with enhanced security
    const sessionData = {
      userId: 'david-robert-lewis',
      username: 'David Robert Lewis',
      isAdmin: true,
      loginTime: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          userId: sessionData.userId,
          username: sessionData.username,
          isAdmin: sessionData.isAdmin,
        },
        message: 'Login successful'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: sessionData.sessionId,
        version: '1.0.0'
      }
    });

    // Set secure HTTP-only cookie (improved from previous version)
    response.cookies.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: true, // Now properly secure
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // More secure than 'lax'
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
      },
      { status: 500 }
    );
  }
}