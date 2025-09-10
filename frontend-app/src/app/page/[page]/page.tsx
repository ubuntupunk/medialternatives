import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';

interface HomePagePaginatedProps {
  params: {
    page: string;
  };
}

/**
 * Paginated home page that displays posts for a specific page number
 * Accessible via /page/[page] URLs
 */
export default async function HomePagePaginated({ params }: HomePagePaginatedProps) {
  const currentPage = parseInt(params.page, 10);
  
  // Validate page number
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  let posts: WordPressPost[] = [];
  let pagination: PaginationInfo = {
    total: 0,
    totalPages: 1,
    currentPage: currentPage,
    perPage: SITE_CONFIG.POSTS_PER_PAGE,
    hasNext: false,
    hasPrev: false
  };
  let error = null;

  try {
    // Fetch real posts with pagination from WordPress.com API
    const response = await wordpressApi.getPostsWithPagination({
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

    console.log(`Home page ${currentPage} pagination info:`, pagination);
  } catch (err) {
    console.error('Error fetching posts with pagination:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching posts';

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

  return (
    <>
      {/* Page Header for non-first pages */}
      {currentPage > 1 && (
        <div className="page-header mb-4">
          <h1>Latest Posts - Page {currentPage}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Page {currentPage}
              </li>
            </ol>
          </nav>
        </div>
      )}

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
          <p>There are no posts available on page {currentPage}.</p>
          <Link href="/" className="btn btn-primary">
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
              baseUrl="/"
            />
          )}
        </>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-light border rounded">
          <h6>Home Page {currentPage} Debug Info:</h6>
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
    </>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: { page: string } }) {
  const currentPage = parseInt(params.page, 10);
  
  if (isNaN(currentPage) || currentPage < 1) {
    return {
      title: 'Invalid Page',
      description: 'The requested page number is invalid.'
    };
  }

  return {
    title: currentPage === 1 
      ? SITE_CONFIG.SITE_TITLE 
      : `Page ${currentPage} - ${SITE_CONFIG.SITE_TITLE}`,
    description: currentPage === 1
      ? SITE_CONFIG.SITE_DESCRIPTION
      : `Browse posts on page ${currentPage}. Latest articles and insights from ${SITE_CONFIG.SITE_TITLE}.`,
    openGraph: {
      title: currentPage === 1 
        ? SITE_CONFIG.SITE_TITLE 
        : `Page ${currentPage} - ${SITE_CONFIG.SITE_TITLE}`,
      description: currentPage === 1
        ? SITE_CONFIG.SITE_DESCRIPTION
        : `Browse posts on page ${currentPage}`,
      type: 'website',
    },
  };
}