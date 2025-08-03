import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/profile',
  '/dashboard',
  '/api/avatars/upload',
];

// Admin routes (more sensitive)
const adminRoutes = [
  '/admin',
  '/api/avatars',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle legacy date-based URLs from WordPress.com
  // Format: /2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/
  // These should be handled by the [year]/[month]/[day]/[slug] route
  
  // Check for date-based URL pattern
  const dateUrlPattern = /^\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/([^\/]+)\/?$/;
  const dateMatch = pathname.match(dateUrlPattern);
  
  if (dateMatch) {
    // This is a date-based URL, let Next.js routing handle it
    // The [year]/[month]/[day]/[slug]/page.tsx will process it
    return NextResponse.next();
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
      
    } catch (error) {
      // Invalid session, redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth-session');
      return response;
    }
  }
  
  return NextResponse.next();
}

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