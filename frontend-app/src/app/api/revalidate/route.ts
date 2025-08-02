import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * On-demand revalidation API endpoint
 * Usage: POST /api/revalidate
 * Body: { path?: string, tag?: string, secret?: string }
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
 * GET endpoint to show revalidation options
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