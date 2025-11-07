import React from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, WordPressTag, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';
import Link from 'next/link';

interface TagPagePaginatedProps {
  params: {
    slug: string;
    page: string;
  };
}

/**
 * Paginated tag page that displays posts for a specific tag and page number
 * Accessible via /tag/[slug]/page/[page] URLs
 */
export default async function TagPagePaginated({ params }: TagPagePaginatedProps) {
  const { slug } = params;
  const currentPage = parseInt(params.page, 10);
  
  // Validate page number
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  let tag: WordPressTag | null = null;
  let posts: WordPressPost[] = [];
  let pagination: PaginationInfo = {
    total: 0,
    totalPages: 1,
    currentPage: currentPage,
    perPage: SITE_CONFIG.POSTS_PER_PAGE,
    hasNext: false,
    hasPrev: false
  };
  let error: string | null = null;

  try {
    // Get tag information by slug
    tag = await wordpressApi.getTag(slug);
    
    if (!tag) {
      notFound();
    }

    // Get posts for this tag with pagination
    const response = await wordpressApi.getPostsByTagWithPagination(tag.id, {
      per_page: SITE_CONFIG.POSTS_PER_PAGE,
      page: currentPage,
      _embed: true
    });

    posts = response.data;
    pagination = response.pagination;

    // If the requested page is beyond available pages, show 404
    if (currentPage > pagination.totalPages) {
      notFound();
    }

    console.log(`Tag "${slug}" page ${currentPage} pagination info:`, pagination);

  } catch (err) {
    console.error('Error fetching tag data:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching tag data';
    
    // Fallback to mock data for development
    const totalMockPages = Math.ceil(mockPosts.length / SITE_CONFIG.POSTS_PER_PAGE);
    
    if (currentPage > totalMockPages) {
      notFound();
    }

    const startIndex = (currentPage - 1) * SITE_CONFIG.POSTS_PER_PAGE;
    const endIndex = startIndex + SITE_CONFIG.POSTS_PER_PAGE;
    posts = mockPosts.slice(startIndex, endIndex);

    pagination = {
      total: mockPosts.length,
      totalPages: totalMockPages,
      currentPage: currentPage,
      perPage: SITE_CONFIG.POSTS_PER_PAGE,
      hasNext: currentPage < totalMockPages,
      hasPrev: currentPage > 1,
      nextPage: currentPage < totalMockPages ? currentPage + 1 : undefined,
      prevPage: currentPage > 1 ? currentPage - 1 : undefined
    };
  }

  // If tag is null due to error, create a fallback
  if (!tag && error) {
    tag = {
      id: 0,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug: slug,
      description: '',
      count: posts.length,
      link: '',
      taxonomy: 'post_tag',
      meta: []
    };
  }

  return (
    <Layout>
      <div className="tag-page-paginated">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/blog">Blog</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href={`/tag/${slug}`}>{tag?.name}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Page {currentPage}
            </li>
          </ol>
        </nav>

        {/* Tag Header */}
        <div className="tag-header mb-4">
          <h1 className="tag-title">
            {tag?.name} - Page {currentPage}
          </h1>
          {tag?.description && (
            <p className="tag-description text-muted">
              {tag.description}
            </p>
          )}
          <p className="tag-meta text-muted">
            Showing {posts.length} posts on page {currentPage} of {pagination.totalPages} 
            ({pagination.total} total posts with this tag)
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-warning mb-4">
            <strong>API Error:</strong> {error}
            <p>Displaying fallback mock data.</p>
          </div>
        )}

        {/* Posts Display */}
        {posts.length === 0 ? (
          <div className="alert alert-info">
            <h4>No posts found on this page</h4>
            <p>There are no posts tagged with "{tag?.name}" on page {currentPage}.</p>
            <Link href={`/tag/${slug}`} className="btn btn-primary">
              Go to First Page
            </Link>
          </div>
        ) : (
          <>
            <PostGrid posts={posts} showFeatured={currentPage === 1} />
            
            {pagination.totalPages > 1 && (
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                baseUrl={`/tag/${slug}`}
              />
            )}
          </>
        )}

        {/* Back to Blog Link */}
        <div className="mt-4 text-center">
          <Link href="/blog" className="btn btn-outline-secondary">
            ← Back to All Posts
          </Link>
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-light border rounded">
            <h6>Tag "{tag?.name}" Page {currentPage} Debug Info:</h6>
            <small>
              Total posts: {pagination.total} | 
              Total pages: {pagination.totalPages} | 
              Current page: {pagination.currentPage} | 
              Per page: {pagination.perPage} | 
              Has next: {pagination.hasNext ? 'Yes' : 'No'} | 
              Has prev: {pagination.hasPrev ? 'Yes' : 'No'} |
              Posts on this page: {posts.length}
            </small>
          </div>
        )}
      </div>
    </Layout>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: { slug: string; page: string } }) {
  const currentPage = parseInt(params.page, 10);
  
  if (isNaN(currentPage) || currentPage < 1) {
    return {
      title: 'Invalid Page',
      description: 'The requested page number is invalid.'
    };
  }

  try {
    const tag = await wordpressApi.getTag(params.slug);
    
    if (!tag) {
      return {
        title: 'Tag Not Found',
        description: 'The requested tag could not be found.'
      };
    }

    return {
      title: `${tag.name} - Page ${currentPage} - ${SITE_CONFIG.SITE_TITLE}`,
      description: tag.description 
        ? `${tag.description} - Page ${currentPage}`
        : `Posts tagged with ${tag.name} - Page ${currentPage}`,
      openGraph: {
        title: `${tag.name} - Page ${currentPage} - ${SITE_CONFIG.SITE_TITLE}`,
        description: tag.description 
          ? `${tag.description} - Page ${currentPage}`
          : `Posts tagged with ${tag.name} - Page ${currentPage}`,
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Tag',
      description: 'Tag page'
    };
  }
}