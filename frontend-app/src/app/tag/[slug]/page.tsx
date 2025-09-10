import React from 'react';
import { notFound } from 'next/navigation';
import LoadMore from '@/components/UI/LoadMore';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, WordPressTag, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';
import Link from 'next/link';

interface TagPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

/**
 * Dynamic tag page that displays posts filtered by tag
 * Accessible via /tag/[slug] URLs from post tag links
 */
export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = params;
  const currentPage = parseInt(searchParams.page || '1', 10);
  
  let tag: WordPressTag | null = null;
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
    
    console.log(`Tag "${slug}" pagination info:`, pagination);

  } catch (err) {
    console.error('Error fetching tag data:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching tag data';
    
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
            {tag?.name}
          </li>
        </ol>
      </nav>

      {/* Tag Header */}
      <div className="tag-header mb-4">
        <h1 className="tag-title">
          Tag: {tag?.name}
        </h1>
        {tag?.description && (
          <p className="tag-description text-muted">
            {tag.description}
          </p>
        )}
        <p className="tag-meta text-muted">
          {tag?.count} {tag?.count === 1 ? 'post' : 'posts'} with this tag
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
          <h4>No posts found with this tag</h4>
          <p>There are currently no posts tagged with &quot;{tag?.name}&quot;.</p>
          <Link href="/blog" className="btn btn-primary">
            View All Posts
          </Link>
        </div>
      ) : (
        <LoadMore 
          initialPosts={posts}
          initialPagination={pagination}
          tagId={tag?.id}
        />
      )}

      {/* Back to Blog Link */}
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
export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const tag = await wordpressApi.getTag(params.slug);
    
    if (!tag) {
      return {
        title: 'Tag Not Found',
        description: 'The requested tag could not be found.'
      };
    }

    return {
      title: `${tag.name} - ${SITE_CONFIG.SITE_TITLE}`,
      description: tag.description || `Posts tagged with ${tag.name}`,
      openGraph: {
        title: `${tag.name} - ${SITE_CONFIG.SITE_TITLE}`,
        description: tag.description || `Posts tagged with ${tag.name}`,
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