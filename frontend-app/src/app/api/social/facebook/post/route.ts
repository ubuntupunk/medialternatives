import { NextRequest, NextResponse } from 'next/server';
import { facebookApi } from '@/services/facebook-api';

/**
 * POST /api/social/facebook/post
 *
 * Automatically posts content to Facebook page when triggered
 * Used for automated posting when new content is published
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, message, link, imageUrl, scheduledTime } = body;

    // Validate required fields
    if (!postId && !message) {
      return NextResponse.json(
        { error: 'Either postId or message is required' },
        { status: 400 }
      );
    }

    let postContent;

    if (postId) {
      // Get post data from WordPress API
      const post = await facebookApi.getPostForFacebook(postId);

      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      postContent = {
        message: post.excerpt || post.title,
        link: post.link,
        picture: post.featuredImage || imageUrl
      };
    } else {
      // Use provided content
      postContent = {
        message,
        link,
        picture: imageUrl
      };
    }

    // Post to Facebook
    const result = await facebookApi.postToPage(postContent, scheduledTime);

    return NextResponse.json({
      success: true,
      postId: result.id,
      message: 'Posted to Facebook successfully'
    });

  } catch (error) {
    console.error('Facebook posting error:', error);
    return NextResponse.json(
      {
        error: 'Failed to post to Facebook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/social/facebook/post
 *
 * Get posting status or recent posts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'recent') {
      const posts = await facebookApi.getRecentPosts();
      return NextResponse.json({ posts });
    }

    if (action === 'status') {
      const status = await facebookApi.getPageInfo();
      return NextResponse.json({ status });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=recent or ?action=status' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Facebook API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Facebook data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}