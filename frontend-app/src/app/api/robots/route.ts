import { NextResponse } from 'next/server';

/**
 * GET /api/robots - Generate robots.txt file
 *
 * Generates a robots.txt file that allows all crawlers to access content
 * while disallowing sensitive routes and providing sitemap reference.
 *
 * @returns {Promise<NextResponse>} Robots.txt content with proper headers
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com';
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and API routes
Disallow: /api/
Disallow: /dashboard/
Disallow: /auth/
Disallow: /_next/

# Allow important pages
Allow: /post/
Allow: /blog/
Allow: /category/
Allow: /tag/
Allow: /author/`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // 24 hours
    }
  });
}