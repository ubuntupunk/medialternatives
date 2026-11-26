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
  '/dashboard',
  '/api/avatars',
];

/**
 * High-volume scraper and AI-crawler user agents observed during the Cloudflare
 * failover. WAF custom rules are preferred, but Workers Free accounts without
 * WAF edit access still need a cheap short-circuit before Next.js rendering.
 * @constant {RegExp}
 */
const botUserAgentPattern =
  /PetalBot|MJ12bot|meta-webindexer|pixellm-research-pilot|HeadlessChrome|GPTBot|ClaudeBot|Amazonbot/i;

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

  // Scrapers and scanners probe WordPress endpoints on every migrated site.
  // Answer them at the edge of the Worker instead of rendering a Next.js 404
  // page, which is expensive on Workers Free (10 ms CPU/request).
  if (
    /^\/(?:wp-login\.php|xmlrpc\.php|wp-admin(?:\/|$)|wp-content(?:\/|$)|wp-includes(?:\/|$))/.test(
      pathname
    )
  ) {
    return new NextResponse(null, {
      status: 404,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  }

  // Scraper UAs repeatedly requested uncached paths and dominated Worker CPU.
  // Stop them here when WAF custom rules are unavailable on the account.
  const userAgent = request.headers.get('user-agent') ?? '';
  if (botUserAgentPattern.test(userAgent)) {
    return new NextResponse(null, {
      status: 403,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  }

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
    // Check for JWT authentication
    const accessToken = request.cookies.get('access_token');

    if (!accessToken) {
      // Redirect to login page
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For now, just check if token exists (full JWT verification happens in API routes)
    // In production, you might want to verify the token here too
    // For admin routes, we trust the API will verify admin status
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