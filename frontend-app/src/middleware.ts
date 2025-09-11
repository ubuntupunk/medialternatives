import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that require user authentication
 * @constant {string[]} protectedRoutes
 */
const protectedRoutes = [
  '/profile',
  '/dashboard',
  '/api/avatars/upload',
];

/**
 * Admin routes requiring elevated permissions
 * @constant {string[]} adminRoutes
 */
const adminRoutes = [
  '/admin',
  '/api/avatars',
];

/**
 * Next.js middleware for route protection and URL redirects
 *
 * Handles authentication checks, legacy URL redirects, and route protection
 * for the Media Alternatives application.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {NextResponse} Response object (redirect or continue)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle ALL legacy date-based URLs from WordPress.com
  // Format: /YYYY/MM/DD/post-slug/
  
  // Check for date-based URL pattern
  const dateUrlPattern = /^\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/([^\/]+)\/?$/;
  const dateMatch = pathname.match(dateUrlPattern);
  
  if (dateMatch) {
    const [, year, month, day, slug] = dateMatch;
    console.log(`Legacy URL detected: /${year}/${month}/${day}/${slug}/`);
    
    // Redirect ALL date-based URLs to clean URLs
    // This handles hundreds of legacy URLs automatically
    const redirectUrl = new URL(`/${slug}`, request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }
  
  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute || isAdminRoute) {
    // Check for authentication
    const authCookie = request.cookies.get('auth-session');
    
    if (!authCookie) {
      // Redirect to login page
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify the session (basic check for now)
    try {
      const sessionData = JSON.parse(authCookie.value);
      const isExpired = Date.now() > sessionData.expires;
      
      if (isExpired) {
        // Session expired, redirect to login
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('auth-session');
        return response;
      }
      
      // For admin routes, check if user is admin
      if (isAdminRoute && !sessionData.isAdmin) {
        return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
      }
      
    } catch (_error) {
      // Invalid session, redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth-session');
      return response;
    }
  }
  
  return NextResponse.next();
}

/**
 * Middleware configuration for route matching
 * @constant {Object} config
 * @property {string[]} matcher - URL patterns to match for middleware execution
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};