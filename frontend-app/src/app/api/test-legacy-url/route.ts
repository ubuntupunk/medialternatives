import { NextRequest, NextResponse } from 'next/server';
import { findPostByLegacyUrl } from '@/utils/legacyUrlMatcher';

/**
 * GET /api/test-legacy-url - Test legacy URL matching
 *
 * Tests the legacy URL matching system with date-based URLs.
 * Attempts to find WordPress posts that match legacy URL patterns.
 *
 * @param {NextRequest} request - Next.js request with year, month, day, slug parameters
 * @returns {Promise<NextResponse>} Legacy URL match results or error response
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2015';
    const month = searchParams.get('month') || '05';
    const day = searchParams.get('day') || '08';
    const slug = searchParams.get('slug') || 'apartheid-the-nazis-and-mcebo-dlamini';

    console.log(`Testing legacy URL: /${year}/${month}/${day}/${slug}/`);

    const match = await findPostByLegacyUrl(year, month, day, slug);

    if (match) {
      return NextResponse.json({
        success: true,
        legacyUrl: `/${year}/${month}/${day}/${slug}/`,
        newUrl: `/${match.post.slug}`,
        confidence: match.confidence,
        strategy: match.strategy,
        post: {
          id: match.post.id,
          title: match.post.title.rendered,
          slug: match.post.slug,
          date: match.post.date
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        legacyUrl: `/${year}/${month}/${day}/${slug}/`,
        error: 'No matching post found',
        searchUrl: `/search?q=${encodeURIComponent(slug.replace(/-/g, ' '))}&legacy=true`
      });
    }

  } catch (error) {
    console.error('Error testing legacy URL:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}