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
    const searchResults = posts.map((post: any) => ({
      ID: post.id,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      slug: post.slug,
      date: post.date,
      modified: post.modified,
      type: post.type,
      link: post.link,
      author: post._embedded?.author?.[0]?.name || 'Unknown',
      featured_media: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      categories: post._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.name) || [],
      tags: post._embedded?.['wp:term']?.[1]?.map((tag: any) => tag.name) || []
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