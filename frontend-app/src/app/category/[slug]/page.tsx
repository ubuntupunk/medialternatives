import React from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, WordPressCategory } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';
import Link from 'next/link';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

/**
 * Dynamic category page that displays posts filtered by category
 * Accessible via /category/[slug] URLs from CategoryCloud widget
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const currentPage = parseInt(searchParams.page || '1', 10);
  
  let category: WordPressCategory | null = null;
  let posts: WordPressPost[] = [];
  let error: string | null = null;
  let totalPages = 1;

  try {
    // Get category information by slug
    category = await wordpressApi.getCategory(slug);
    
    if (!category) {
      notFound();
    }

    // Get posts for this category with pagination
    posts = await wordpressApi.getPostsByCategory(category.id, {
      per_page: SITE_CONFIG.POSTS_PER_PAGE,
      page: currentPage,
      _embed: true
    });

    // Calculate total pages (this is a simplified calculation)
    // In a real implementation, we'd get this from API response headers
    totalPages = Math.ceil(category.count / SITE_CONFIG.POSTS_PER_PAGE);

  } catch (err) {
    console.error('Error fetching category data:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching category data';
    
    // Fallback to mock data for development
    posts = mockPosts.slice(0, SITE_CONFIG.POSTS_PER_PAGE);
    totalPages = 3;
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
          <p>There are currently no posts in the "{category?.name}" category.</p>
          <Link href="/blog" className="btn btn-primary">
            View All Posts
          </Link>
        </div>
      ) : (
        <>
          <PostGrid posts={posts} showFeatured={currentPage === 1} />
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
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
    </Layout>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const category = await wordpressApi.getCategory(params.slug);
    
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