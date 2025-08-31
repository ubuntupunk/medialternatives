import { NextRequest, NextResponse } from 'next/server';
import { wordpressApi } from '@/services/wordpress-api';

/**
 * GET /api/posts-with-placeholders - Get posts with placeholder images
 *
 * Returns WordPress posts that have placeholder or missing featured images.
 * Useful for identifying posts that need image updates.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Posts with placeholder images or error response
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch posts from WordPress.com API
    const posts = await wordpressApi.getPosts({
      per_page: 100, // Get more posts to check for placeholders
      _embed: true
    });

    // Filter posts that have placeholder images (picsum.photos or no featured image)
    const postsWithPlaceholders = posts.filter(post => {
      const featuredImageUrl = getFeaturedImageUrl(post);
      
      // Check if it's a placeholder or missing image
      return !featuredImageUrl || 
             featuredImageUrl.includes('picsum.photos') ||
             featuredImageUrl.includes('placeholder') ||
             featuredImageUrl.includes('via.placeholder.com');
    });

    // Add featured image URL to each post for easier access
    const enrichedPosts = postsWithPlaceholders.map(post => ({
      ...post,
      featured_image_url: getFeaturedImageUrl(post),
      needs_image: true,
      placeholder_type: getPlaceholderType(getFeaturedImageUrl(post))
    }));

    return NextResponse.json({
      success: true,
      posts: enrichedPosts,
      total: enrichedPosts.length,
      note: 'Posts with placeholder or missing featured images'
    });

  } catch (error) {
    console.error('Error fetching posts with placeholders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Extract featured image URL from WordPress post
 * @param {any} post - WordPress post object
 * @returns {string | null} Featured image URL or null if not found
 */
function getFeaturedImageUrl(post: any): string | null {
  // Check for featured media in _embedded data
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  
  // Check for featured media link
  if (post._links?.['wp:featuredmedia']?.[0]?.href) {
    // This would require another API call to get the actual image URL
    // For now, we'll mark it as needing investigation
    return null;
  }
  
  // Check if there's a featured_media ID but no embedded data
  if (post.featured_media && post.featured_media !== 0) {
    // Has featured media but not embedded - might need separate API call
    return null;
  }
  
  // No featured image found
  return null;
}

/**
 * Determine the type of placeholder image being used
 * @param {string | null} imageUrl - Image URL to analyze
 * @returns {string} Placeholder type ('missing', 'picsum', 'placeholder', etc.)
 */
function getPlaceholderType(imageUrl: string | null): string {
  if (!imageUrl) return 'missing';
  if (imageUrl.includes('picsum.photos')) return 'picsum';
  if (imageUrl.includes('placeholder')) return 'placeholder';
  if (imageUrl.includes('via.placeholder.com')) return 'via_placeholder';
  return 'unknown';
}