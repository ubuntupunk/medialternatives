import React from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, WordPressCategory, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';
import Link from 'next/link';

interface CategoryPagePaginatedProps {
  params: {
    slug: string;
    page: string;
  };
}

/**
 * Paginated category page that displays posts for a specific category and page number
 * Accessible via /category/[slug]/page/[page] URLs
 */
export default async function CategoryPagePaginated({ params }: CategoryPagePaginatedProps) {
  const { slug } = params;
  const currentPage = parseInt(params.page, 10);
  
  // Validate page number
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  let category: WordPressCategory | null = null;
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
    // Get category information by slug
    category = await wordpressApi.getCategory(slug);
    
    if (!category) {
      notFound();
    }

    // Get posts for this category with pagination
    const response = await wordpressApi.getPostsByCategoryWithPagination(category.id, {
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

    console.log(`Category "${slug}" page ${currentPage} pagination info:`, pagination);

  } catch (err) {
    console.error('Error fetching category data:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching category data';
    
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

  // If category is null due to error, create a fallback
  if (!category && error) {
    category = {
      id: 0,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug: slug,
      description: '',
      count: posts.length,
      link: '',
      taxonomy: 'category',
      parent: 0,
      meta: []
    };
  }

  return (
    <Layout>
      <div className="category-page-paginated">
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
              <Link href={`/category/${slug}`}>{category?.name}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Page {currentPage}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="category-header mb-4">
          <h1 className="category-title">
            {category?.name} - Page {currentPage}
          </h1>
          {category?.description && (
            <p className="category-description text-muted">
              {category.description}
            </p>
          )}
          <p className="category-meta text-muted">
            Showing {posts.length} posts on page {currentPage} of {pagination.totalPages} 
            ({pagination.total} total posts in this category)
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
            <p>There are no posts in the &quot;{category?.name}&quot; category on page {currentPage}.</p>
            <Link href={`/category/${slug}`} className="btn btn-primary">
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
                baseUrl={`/category/${slug}`}
              />
            )}
          </>
        )}

        {/* Back to Categories Link */}
        <div className="mt-4 text-center">
          <Link href="/blog" className="btn btn-outline-secondary">
            ← Back to All Posts
          </Link>
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-light border rounded">
            <h6>Category &quot;{category?.name}&quot; Page {currentPage} Debug Info:</h6>
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
    const category = await wordpressApi.getCategory(params.slug);
    
    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The requested category could not be found.'
      };
    }

    return {
      title: `${category.name} - Page ${currentPage} - ${SITE_CONFIG.SITE_TITLE}`,
      description: category.description 
        ? `${category.description} - Page ${currentPage}`
        : `Posts in the ${category.name} category - Page ${currentPage}`,
      openGraph: {
        title: `${category.name} - Page ${currentPage} - ${SITE_CONFIG.SITE_TITLE}`,
        description: category.description 
          ? `${category.description} - Page ${currentPage}`
          : `Posts in the ${category.name} category - Page ${currentPage}`,
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Category',
      description: 'Category page'
    };
  }
}