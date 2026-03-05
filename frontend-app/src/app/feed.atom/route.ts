import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /feed.atom - Redirect to the actual Atom feed API endpoint
 *
 * This provides a clean, SEO-friendly URL for the Atom feed that redirects
 * to the actual API endpoint. This is the standard convention for feed URLs.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Redirect response to the feed API
 */
export async function GET(request: NextRequest) {
  // Get the base URL from the request
  const baseUrl = new URL(request.url).origin;
  
  // Redirect to the actual feed API endpoint
  return NextResponse.redirect(`${baseUrl}/api/feed/atom`, 301);
}