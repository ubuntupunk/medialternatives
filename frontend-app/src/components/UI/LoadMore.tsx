"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { WordPressPost, PaginationInfo } from '@/types/wordpress';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import PostGrid from '@/components/Posts/PostGrid';

interface LoadMoreProps {
  initialPosts: WordPressPost[];
  initialPagination: PaginationInfo;
  className?: string;
  categoryId?: number;
  authorId?: number;
  tagId?: number;
}

/**
 * Load More component for infinite scroll-style loading
 * Shows a "Load More" button instead of traditional pagination
 */
const LoadMore: React.FC<LoadMoreProps> = ({
  initialPosts,
  initialPagination,
  className = '',
  categoryId,
  authorId,
  tagId
}) => {
  const [posts, setPosts] = useState<WordPressPost[]>(initialPosts);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMorePosts = async () => {
    if (!pagination.hasNext || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (categoryId) {
        response = await wordpressApi.getPostsByCategoryWithPagination(categoryId, {
          per_page: SITE_CONFIG.POSTS_PER_PAGE,
          page: pagination.nextPage,
          _embed: true
        });
      } else if (authorId) {
        response = await wordpressApi.getPostsByAuthorWithPagination(authorId, {
          per_page: SITE_CONFIG.POSTS_PER_PAGE,
          page: pagination.nextPage,
          _embed: true
        });
      } else if (tagId) {
        response = await wordpressApi.getPostsByTagWithPagination(tagId, {
          per_page: SITE_CONFIG.POSTS_PER_PAGE,
          page: pagination.nextPage,
          _embed: true
        });
      } else {
        response = await wordpressApi.getPostsWithPagination({
          per_page: SITE_CONFIG.POSTS_PER_PAGE,
          page: pagination.nextPage,
          _embed: true
        });
      }

      // Append new posts to existing posts
      setPosts(prevPosts => [...prevPosts, ...response.data]);
      setPagination(response.pagination);

    } catch (err) {
      console.error('Error loading more posts:', err);
      setError(err instanceof Error ? err.message : 'Error loading more posts');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`load-more-container ${className}`}>
      {/* Display all posts - first post as featured */}
      <PostGrid posts={posts} showFeatured={true} />

      {/* Load More Button */}
      {pagination.hasNext && (
        <div className="text-center mt-5 mb-4">
          <button
            onClick={loadMorePosts}
            disabled={isLoading}
            className="btn btn-lg load-more-btn"
            style={{
              minWidth: '240px',
              padding: '0.75rem 2rem',
              backgroundColor: isLoading ? '#6c757d' : '#ffffff',
              borderColor: isLoading ? '#6c757d' : '#0d6efd',
              color: isLoading ? '#ffffff' : '#0d6efd',
              fontWeight: '600',
              fontSize: '1rem',
              borderRadius: '0.375rem',
              border: '2px solid',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              textTransform: 'none',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#0d6efd';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(13, 110, 253, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#0d6efd';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading More Posts...
              </>
            ) : (
              <>
                Load More Posts
                <span style={{ 
                  fontSize: '0.85em', 
                  opacity: 0.8, 
                  marginLeft: '8px',
                  fontWeight: '500'
                }}>
                  ({pagination.total - posts.length} remaining)
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="alert alert-warning mt-3" style={{ borderRadius: '0.5rem' }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={loadMorePosts}
            className="btn btn-sm ms-2"
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#f0ad4e',
              color: '#f0ad4e',
              fontWeight: '600',
              borderRadius: '0.375rem',
              border: '2px solid',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0ad4e';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#f0ad4e';
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* End of posts message */}
      {!pagination.hasNext && posts.length > 0 && (
        <div className="text-center mt-4 mb-4">
          <div className="alert alert-info">
            <strong>You&apos;ve reached the end!</strong> 
            <p className="mb-0">
              You&apos;ve viewed all {posts.length} posts. 
              <Link href="/blog" className="alert-link ms-1">Browse by categories</Link> or 
              <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="alert-link ms-1">
                scroll to top
              </a>.
            </p>
          </div>
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-light border rounded">
          <h6>Load More Debug Info:</h6>
          <small>
            Posts loaded: {posts.length} / {pagination.total} | 
            Current page: {pagination.currentPage} | 
            Total pages: {pagination.totalPages} | 
            Has next: {pagination.hasNext ? 'Yes' : 'No'} | 
            Next page: {pagination.nextPage || 'N/A'}
          </small>
        </div>
      )}
    </div>
  );
};

export default LoadMore;