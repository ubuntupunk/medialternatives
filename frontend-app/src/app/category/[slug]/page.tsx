import React from 'react';
import { notFound } from 'next/navigation';
import LoadMore from '@/components/UI/LoadMore';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, WordPressCategory, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';
import Link from 'next/link';

// Enable ISR - revalidate every 5 minutes for category pages
export const revalidate = 300; // 5 minutes

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

/**
 * Dynamic category page that displays posts filtered by category
 * Accessible via /category/[slug] URLs from CategoryCloud widget
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  
  let category: WordPressCategory | null = null;
  let posts: WordPressPost[] = [];
  let pagination: PaginationInfo = {
    total: 0,
    totalPages: 1,
    currentPage: currentPage,
    perPage: SITE_CONFIG.POSTS_PER_PAGE,
    hasNext: false,
    hasPrev: false,
    nextPage: undefined,
    prevPage: undefined
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
    
    console.log(`Category "${slug}" pagination info:`, pagination);

  } catch (err) {
    console.error('Error fetching category data:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching category data';
    
    // Fallback to mock data for development
    posts = mockPosts.slice(0, SITE_CONFIG.POSTS_PER_PAGE);
    const totalPages = Math.ceil(mockPosts.length / SITE_CONFIG.POSTS_PER_PAGE);
    pagination = {
      total: mockPosts.length,
      totalPages: totalPages,
      currentPage: currentPage,
      perPage: SITE_CONFIG.POSTS_PER_PAGE,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
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
    <>
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/blog">Blog</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {category?.name}
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="category-header mb-4">
        <h1 className="category-title">
          Category: {category?.name}
        </h1>
        {category?.description && (
          <p className="category-description text-muted">
            {category.description}
          </p>
        )}
        <p className="category-meta text-muted">
          {category?.count} {category?.count === 1 ? 'post' : 'posts'} in this category
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
          <h4>No posts found in this category</h4>
          <p>There are currently no posts in the &quot;{category?.name}&quot; category.</p>
          <Link href="/blog" className="btn btn-primary">
            View All Posts
          </Link>
        </div>
      ) : (
        <LoadMore 
          initialPosts={posts}
          initialPagination={pagination}
          categoryId={category?.id}
        />
      )}

      {/* Back to Categories Link */}
      <div className="mt-4 text-center">
        <Link href="/blog" className="btn btn-outline-secondary">
          ← Back to All Posts
        </Link>
      </div>
    </>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const category = await wordpressApi.getCategory(slug);
    
    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The requested category could not be found.'
      };
    }

    return {
      title: `${category.name} - ${SITE_CONFIG.SITE_TITLE}`,
      description: category.description || `Posts in the ${category.name} category`,
      openGraph: {
        title: `${category.name} - ${SITE_CONFIG.SITE_TITLE}`,
        description: category.description || `Posts in the ${category.name} category`,
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
