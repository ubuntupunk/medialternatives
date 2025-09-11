import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/session - Session validation endpoint
 *
 * Validates the current user session from httpOnly cookie and returns
 * authentication status and user information for client-side state management.
 *
 * @param {NextRequest} request - Next.js request object with cookies
 * @returns {Promise<NextResponse>} Session validation response
 */
export async function GET(request: NextRequest) {
  try {
    // Get the httpOnly auth session cookie
    const authCookie = request.cookies.get('auth-session');
    
    if (!authCookie) {
      return NextResponse.json({
        success: true,
        data: {
          isAuthenticated: false,
          user: null
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          version: '1.0.0'
        }
      });
    }

    // Parse and validate session data
    try {
      const sessionData = JSON.parse(authCookie.value);
      
      // Check if session is expired
      if (Date.now() > sessionData.expires) {
        // Session expired, clear the cookie
        const response = NextResponse.json({
          success: true,
          data: {
            isAuthenticated: false,
            user: null,
            sessionExpired: true
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            version: '1.0.0'
          }
        });

        // Clear the expired cookie
        response.cookies.set('auth-session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 0,
          path: '/'
        });

        return response;
      }

      // Valid session, return user data
      return NextResponse.json({
        success: true,
        data: {
          isAuthenticated: true,
          user: {
            userId: sessionData.userId,
            username: sessionData.username,
            isAdmin: sessionData.isAdmin,
          },
          sessionInfo: {
            loginTime: sessionData.loginTime,
            expires: sessionData.expires,
            sessionId: sessionData.sessionId
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          version: '1.0.0'
        }
      });

    } catch {
      // Invalid session data, clear the cookie
      const response = NextResponse.json({
        success: true,
        data: {
          isAuthenticated: false,
          user: null,
          sessionInvalid: true
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          version: '1.0.0'
        }
      });

      // Clear the invalid cookie
      response.cookies.set('auth-session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });

      return response;
    }

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