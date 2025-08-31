import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * POST /api/revalidate - Trigger on-demand cache revalidation
 *
 * Revalidates Next.js cache for specific paths or tags.
 * Supports optional secret validation for security.
 *
 * @param {NextRequest} request - Next.js request with path, tag, and optional secret
 * @returns {Promise<NextResponse>} Revalidation result or error response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, tag, secret } = body;

    // Optional secret validation for security
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    const revalidated: string[] = [];

    // Revalidate specific path
    if (path) {
      revalidatePath(path);
      revalidated.push(`path: ${path}`);
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      revalidated.push(`tag: ${tag}`);
    }

    // If no specific path/tag, revalidate common pages
    if (!path && !tag) {
      const commonPaths = ['/', '/blog', '/category', '/post'];
      commonPaths.forEach(p => {
        revalidatePath(p);
        revalidated.push(`path: ${p}`);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Revalidation triggered',
      revalidated,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error during revalidation:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate - Show revalidation options and examples
 *
 * Returns documentation and examples for the revalidation endpoint.
 * Useful for understanding how to use the POST endpoint.
 *
 * @returns {Promise<NextResponse>} Revalidation endpoint documentation
 */
export async function GET() {
  return NextResponse.json({
    message: 'On-demand revalidation endpoint',
    usage: {
      method: 'POST',
      body: {
        path: 'Specific path to revalidate (e.g., "/", "/blog")',
        tag: 'Cache tag to revalidate',
        secret: 'Optional secret for security'
      }
    },
    examples: [
      { path: '/', description: 'Revalidate homepage' },
      { path: '/blog', description: 'Revalidate blog page' },
      { path: '/post/[slug]', description: 'Revalidate specific post' },
      { tag: 'posts', description: 'Revalidate all posts' }
    ]
  });
}