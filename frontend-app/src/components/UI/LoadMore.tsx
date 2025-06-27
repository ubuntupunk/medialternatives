"use client";

import React, { useState } from 'react';
import { WordPressPost, PaginationInfo } from '@/types/wordpress';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import PostGrid from '@/components/Posts/PostGrid';

interface LoadMoreProps {
  initialPosts: WordPressPost[];
  initialPagination: PaginationInfo;
  className?: string;
}

/**
 * Load More component for infinite scroll-style loading
 * Shows a "Load More" button instead of traditional pagination
 */
const LoadMore: React.FC<LoadMoreProps> = ({
  initialPosts,
  initialPagination,
  className = ''
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
      const response = await wordpressApi.getPostsWithPagination({
        per_page: SITE_CONFIG.POSTS_PER_PAGE,
        page: pagination.nextPage,
        _embed: true
      });

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
        <div className="text-center mt-4">
          <button
            onClick={loadMorePosts}
            disabled={isLoading}
            className="btn btn-primary btn-lg"
            style={{
              minWidth: '200px',
              backgroundColor: '#04AA6D',
              borderColor: '#04AA6D',
              color: '#00e7ff',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              `Load More Posts (${pagination.total - posts.length} remaining)`
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="alert alert-warning mt-3">
          <strong>Error:</strong> {error}
          <button 
            onClick={loadMorePosts}
            className="btn btn-sm btn-outline-warning ms-2"
          >
            Try Again
          </button>
        </div>
      )}

      {/* End of posts message */}
      {!pagination.hasNext && posts.length > 0 && (
        <div className="text-center mt-4 mb-4">
          <div className="alert alert-info">
            <strong>You've reached the end!</strong> 
            <p className="mb-0">
              You've viewed all {posts.length} posts. 
              <a href="/blog" className="alert-link ms-1">Browse by categories</a> or 
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