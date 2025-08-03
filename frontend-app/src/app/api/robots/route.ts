import { NextResponse } from 'next/server';

/**
 * Generate robots.txt with sitemap reference
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