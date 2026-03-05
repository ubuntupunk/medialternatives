import { NextRequest, NextResponse } from 'next/server';
import { facebookApi } from '@/services/facebook-api';

/**
 * POST /api/social/facebook/autopost
 *
 * Trigger automated posting of a specific post to Facebook
 * Called when new content is published on medialternatives.com
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postSlug, postId, customMessage } = body;

    // Validate required fields
    if (!postSlug && !postId) {
      return NextResponse.json(
        { error: 'Either postSlug or postId is required' },
        { status: 400 }
      );
    }

    // Check if auto-posting is enabled
    const autoPostEnabled = process.env.FACEBOOK_AUTO_POST_ENABLED === 'true';

    if (!autoPostEnabled) {
      return NextResponse.json({
        message: 'Auto-posting disabled',
        postSlug,
        postId
      });
    }

    // Check if Facebook API is configured
    if (!facebookApi.isConfigured()) {
      console.warn('Facebook API not configured, skipping auto-post');
      return NextResponse.json({
        message: 'Facebook API not configured',
        postSlug,
        postId
      });
    }

    let postUrl: string;
    let postTitle: string;
    let featuredImage: string | undefined;

    if (postSlug) {
      // Get post data from our site
      const { wordpressApi } = await import('@/services/wordpress-api');
      const post = await wordpressApi.getPost(postSlug);

      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com'}/post/${post.slug}`;
      postTitle = post.title.rendered;

      // Get featured image
      const { getFeaturedImageUrl } = await import('@/utils/helpers');
      featuredImage = getFeaturedImageUrl(post) || undefined;
    } else {
      // Use provided postId to construct URL
      postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com'}/post/${postId}`;
      postTitle = `New article published`;
    }

    // Prepare Facebook post content
    const postContent = {
      message: customMessage || `New article: ${postTitle}`,
      link: postUrl,
      picture: featuredImage
    };

    // Post to Facebook
    const result = await facebookApi.postToPage(postContent);

    console.log(`Auto-posted to Facebook: ${result.id} for post ${postSlug || postId}`);

    return NextResponse.json({
      success: true,
      facebookPostId: result.id,
      postUrl,
      message: 'Successfully auto-posted to Facebook'
    });

  } catch (error) {
    console.error('Facebook auto-post error:', error);
    return NextResponse.json(
      {
        error: 'Failed to auto-post to Facebook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/social/facebook/autopost
 *
 * Check auto-posting status and configuration
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Facebook auto-post endpoint is active',
    facebookConfigured: facebookApi.isConfigured(),
    autoPostEnabled: process.env.FACEBOOK_AUTO_POST_ENABLED === 'true',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com'
  });
}