import { NextRequest, NextResponse } from 'next/server';
import { wordpressApi } from '@/services/wordpress-api';

/**
 * GET /api/legacy-url-lookup - Lookup posts by legacy URLs
 *
 * Finds WordPress posts that match legacy date-based URL patterns.
 * Uses multiple strategies to find the best matching post.
 *
 * @param {NextRequest} request - Next.js request with legacy URL parameter
 * @returns {Promise<NextResponse>} Legacy URL lookup results or error response
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const legacyUrl = searchParams.get('url');
    
    if (!legacyUrl) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    // Parse date-based URL
    const dateUrlPattern = /^\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/([^\/]+)\/?$/;
    const match = legacyUrl.match(dateUrlPattern);
    
    if (!match) {
      return NextResponse.json({ error: 'Invalid date-based URL format' }, { status: 400 });
    }

    const [, year, month, day, slug] = match;
    const searchResults = [];

    // Strategy 1: Try exact slug match
    try {
      const post = await wordpressApi.getPost(slug);
      if (post) {
        searchResults.push({
          strategy: 'exact_slug',
          post: {
            id: post.id,
            slug: post.slug,
            title: post.title.rendered,
            date: post.date,
            newUrl: `/${post.slug}`
          }
        });
      }
    } catch {
      // Continue to next strategy
    }

    // Strategy 2: Search by title keywords
    try {
      const searchTerms = slug.replace(/-/g, ' ');
      const posts = await wordpressApi.searchPosts(searchTerms, { per_page: 5 });
      
      posts.forEach(post => {
        searchResults.push({
          strategy: 'title_search',
          post: {
            id: post.id,
            slug: post.slug,
            title: post.title.rendered,
            date: post.date,
            newUrl: `/${post.slug}`,
            relevance: calculateRelevance(slug, post.slug, post.title.rendered)
          }
        });
      });
    } catch {
      // Continue to next strategy
    }

    // Strategy 3: Find posts from specific date
    try {
      const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const postsFromDate = await wordpressApi.getPosts({
        search: dateString,
        per_page: 10
      });
      
      postsFromDate.forEach(post => {
        searchResults.push({
          strategy: 'date_match',
          post: {
            id: post.id,
            slug: post.slug,
            title: post.title.rendered,
            date: post.date,
            newUrl: `/${post.slug}`,
            relevance: calculateRelevance(slug, post.slug, post.title.rendered)
          }
        });
      });
    } catch {
      // Continue
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = searchResults.reduce((acc, current) => {
      const existing = acc.find(item => item.post.id === current.post.id);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, [] as typeof searchResults);

    // Sort by date (newest first)
    uniqueResults.sort((a, b) => new Date(b.post.date).getTime() - new Date(a.post.date).getTime());

    return NextResponse.json({
      legacyUrl,
      parsedDate: { year, month, day, slug },
      results: uniqueResults,
      bestMatch: uniqueResults[0] || null,
      totalFound: uniqueResults.length
    });

  } catch (error) {
    console.error('Error in legacy URL lookup:', error);
    return NextResponse.json(
      { error: 'Failed to lookup legacy URL' },
      { status: 500 }
    );
  }
}

/**
 * Calculate relevance score between legacy slug and post data
 * @param {string} legacySlug - Slug from legacy URL
 * @param {string} postSlug - Current post slug
 * @param {string} postTitle - Post title
 * @returns {number} Relevance score (0-100)
 */
function calculateRelevance(legacySlug: string, postSlug: string, postTitle: string): number {
  let score = 0;
  
  // Exact slug match gets highest score
  if (legacySlug === postSlug) {
    score += 100;
  }
  
  // Partial slug match
  const legacyWords = legacySlug.split('-');
  const postWords = postSlug.split('-');
  const titleWords = postTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  
  // Count matching words in slug
  const slugMatches = legacyWords.filter(word => postWords.includes(word)).length;
  score += (slugMatches / legacyWords.length) * 50;
  
  // Count matching words in title
  const titleMatches = legacyWords.filter(word => 
    titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
  ).length;
  score += (titleMatches / legacyWords.length) * 30;
  
  return Math.round(score);
}