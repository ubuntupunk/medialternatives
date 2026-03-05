import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, refreshAccessToken } from '@/lib/auth';

/**
 * GET /api/auth/session - JWT-based session validation endpoint
 *
 * Validates the current user session using JWT tokens and returns
 * authentication status and user information for client-side state management.
 *
 * @param {NextRequest} request - Next.js request object with JWT cookies
 * @returns {Promise<NextResponse>} Session validation response
 */
export async function GET(request: NextRequest) {
  try {
    // Try to validate access token
    const payload = validateAuth(request);

    if (!payload) {
      // Access token invalid/expired, try to refresh
      const refreshResult = refreshAccessToken(request);

      if (refreshResult) {
        // Successfully refreshed, update access token cookie
        const response = NextResponse.json({
          success: true,
          data: {
            isAuthenticated: true,
            user: {
              userId: refreshResult.user.userId,
              username: refreshResult.user.username,
              email: refreshResult.user.email,
              isAdmin: refreshResult.user.isAdmin,
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            version: '2.0.0'
          }
        });

        // Update access token cookie
        response.cookies.set('access_token', refreshResult.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60, // 15 minutes
          path: '/'
        });

        return response;
      }

      // No valid tokens, user is not authenticated
      return NextResponse.json({
        success: true,
        data: {
          isAuthenticated: false,
          user: null
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          version: '2.0.0'
        }
      });
    }

    // Valid access token, return user data
    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: true,
        user: {
          userId: payload.userId,
          username: payload.username,
          email: payload.email,
          isAdmin: payload.isAdmin,
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: '2.0.0'
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
      },
      { status: 500 }
    );
  }
}