import { NextRequest, NextResponse } from 'next/server';
import { wordpressApi } from '@/services/wordpress-api';
import { checkMultiplePostsLinks, checkPostLinks } from '@/utils/deadLinkChecker';
import { createRateLimit } from '@/lib/rate-limit';

/**
 * API endpoint to check for dead links in posts
 * Usage: 
 * - GET /api/check-dead-links?posts=10 (check last 10 posts)
 * - GET /api/check-dead-links?post_id=123 (check specific post)
 * - GET /api/check-dead-links?all=true (check all posts - use with caution)
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting to prevent excessive CPU usage
    const rateLimit = createRateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10, // 10 dead link checks per hour
      message: 'Dead link check rate limit exceeded. Please try again later.',
      statusCode: 429
    });

    const rateLimitResponse = await rateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const postsCount = searchParams.get('posts');
    const checkAll = searchParams.get('all') === 'true';
    
    // Check specific post
    if (postId) {
      const post = await wordpressApi.getPostById(parseInt(postId));
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      const deadLinks = await checkPostLinks(post);
      
      return NextResponse.json({
        type: 'single_post',
        post: {
          id: post.id,
          title: post.title.rendered,
          slug: post.slug
        },
        deadLinks,
        summary: {
          totalDeadLinks: deadLinks.length,
          hasDeadLinks: deadLinks.length > 0
        }
      });
    }
    
    // Check multiple posts
    let posts;
    if (checkAll) {
      // Warning: This could take a very long time - limit to 10 posts for CPU safety
      posts = await wordpressApi.getPosts({ per_page: 10 }); // Reduced from 100 to 10 for safety
    } else {
      const count = postsCount ? parseInt(postsCount) : 3; // Reduced default from 5 to 3
      posts = await wordpressApi.getPosts({ per_page: Math.min(count, 5) }); // Max 5 for API safety
    }
    
    if (posts.length === 0) {
      return NextResponse.json({ error: 'No posts found' }, { status: 404 });
    }
    
    const result = await checkMultiplePostsLinks(posts);
    
    return NextResponse.json({
      type: 'multiple_posts',
      postsChecked: posts.length,
      result,
      summary: {
        totalPosts: posts.length,
        totalLinks: result.totalLinks,
        deadLinks: result.deadLinks.length,
        workingLinks: result.workingLinks,
        processingTimeMs: result.processingTime,
        processingTimeMinutes: Math.round(result.processingTime / 60000 * 100) / 100
      },
      recommendations: generateRecommendations(result.deadLinks)
    });
    
  } catch (error) {
    console.error('Error checking dead links:', error);
    return NextResponse.json(
      { error: 'Failed to check dead links', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

interface DeadLink {
  url: string;
  status: number | null;
  error: string | null;
  context: string;
  postId: number;
  postTitle: string;
  postSlug: string;
  archiveUrl?: string;
  suggestions?: string[];
  retryable?: boolean;
  checkedAt?: string;
}

/**
 * Generate recommendations based on dead links found
 */
function generateRecommendations(deadLinks: DeadLink[]) {
  const recommendations = [];
  
  if (deadLinks.length === 0) {
    recommendations.push('✅ No dead links found! Your content is in good shape.');
    return recommendations;
  }
  
  // Group by domain to identify problematic sites
  const domainCounts = deadLinks.reduce((acc, link) => {
    try {
      const domain = new URL(link.url).hostname;
      acc[domain] = (acc[domain] || 0) + 1;
    } catch {
      // Invalid URL
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topProblematicDomains = Object.entries(domainCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);
  
  if (topProblematicDomains.length > 0) {
    recommendations.push(
      `🔍 Most problematic domains: ${topProblematicDomains.map(([domain, count]) => `${domain} (${count} links)`).join(', ')}`
    );
  }
  
  // Check for archive availability
  const linksWithArchives = deadLinks.filter(link => 
    link.suggestions?.some((s: string) => s.includes('Archive snapshots found'))
  );
  
  if (linksWithArchives.length > 0) {
    recommendations.push(
      `📚 ${linksWithArchives.length} dead links have Internet Archive snapshots available`
    );
  }
  
  // Priority recommendations
  const highPriorityLinks = deadLinks.filter(link => link.status === null || link.status >= 500);
  if (highPriorityLinks.length > 0) {
    recommendations.push(
      `⚠️ ${highPriorityLinks.length} links are completely unreachable (high priority for fixing)`
    );
  }
  
  const clientErrorLinks = deadLinks.filter(link => link.status && link.status >= 400 && link.status < 500);
  if (clientErrorLinks.length > 0) {
    recommendations.push(
      `🔗 ${clientErrorLinks.length} links return 4xx errors (may have moved or been deleted)`
    );
  }
  
  recommendations.push(
    '💡 Consider updating dead links with Internet Archive versions or finding alternative sources'
  );
  
  return recommendations;
}