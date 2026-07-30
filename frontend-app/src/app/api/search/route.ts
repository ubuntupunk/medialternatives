import { NextRequest, NextResponse } from 'next/server';
import { validateQueryParams, createAPIResponse, sanitizeInput, schemas } from '@/lib/validation';
import { createRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { withCache, searchCache } from '@/lib/cache';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com';

/**
 * GET /api/search - Search WordPress posts
 *
 * Search for posts in the WordPress.com content using the provided query.
 * Results are cached for 5 minutes to improve performance.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Standardized API response with search results
 *
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search WordPress posts
 *     description: Search for posts in the WordPress.com content
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SearchResult'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIResponse'
 */
async function searchHandler(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = createRateLimit(rateLimitConfigs.search);
    const rateLimitResponse = await rateLimit(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate query parameters
    const validation = validateQueryParams(request.nextUrl.searchParams, schemas.search);

    if ('response' in validation) {
      return validation.response;
    }

    const { q, per_page = 10 } = validation.data;

    // Sanitize input
    const sanitizedQuery = sanitizeInput(q);

    // Search WordPress.com API
    const searchUrl = `${WORDPRESS_API_URL}/posts?search=${encodeURIComponent(sanitizedQuery)}&per_page=${per_page}&_embed=true`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 5 minutes
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();

    // Transform the response to include relevant fields
    const searchResults = posts.map((post: Record<string, unknown>) => ({
      ID: post.id as number,
      title: (post.title as Record<string, string>)?.rendered || '',
      excerpt: (post.excerpt as Record<string, string>)?.rendered || '',
      content: (post.content as Record<string, string>)?.rendered || '',
      slug: post.slug as string,
      date: post.date as string,
      modified: post.modified as string,
      type: post.type as string,
      link: post.link as string,
      author: ((post._embedded as Record<string, unknown>)?.author as unknown[])?.[0] && (((post._embedded as Record<string, unknown>)?.author as unknown[])?.[0] as Record<string, unknown>)?.name as string || 'Unknown',
      featured_media: ((post._embedded as Record<string, unknown>)?.['wp:featuredmedia'] as unknown[])?.[0] && (((post._embedded as Record<string, unknown>)?.['wp:featuredmedia'] as unknown[])?.[0] as Record<string, unknown>)?.source_url as string || null,
      categories: (((post._embedded as Record<string, unknown>)?.['wp:term'] as unknown[][])?.[0] || []).map((cat: unknown) => (cat as Record<string, unknown>).name as string),
      tags: (((post._embedded as Record<string, unknown>)?.['wp:term'] as unknown[][])?.[1] || []).map((tag: unknown) => (tag as Record<string, unknown>).name as string)
    }));

    const successResponse = createAPIResponse(true, searchResults);

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Search API error:', error);

    const errorResponse = createAPIResponse(false, undefined, {
      code: 'SEARCH_FAILED',
      message: 'Search failed. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Export with caching middleware
export const GET = withCache(searchHandler, searchCache, {
  ttl: 300, // 5 minutes cache for search results
  shouldCache: (request, response) => {
    // Only cache successful responses
    return response.status === 200;
  }
});