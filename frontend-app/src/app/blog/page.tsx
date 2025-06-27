import React from 'react';
import Layout from '@/components/Layout/Layout';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';

// This is a server component that fetches data on the server
export default async function BlogPage() {
  let posts: WordPressPost[] = [];
  let pagination = {
    total: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: SITE_CONFIG.POSTS_PER_PAGE,
    hasNext: false,
    hasPrev: false
  };
  let error = null;
  
  try {
    // Fetch real posts with pagination from WordPress.com API
    const response = await wordpressApi.getPostsWithPagination({ 
      per_page: SITE_CONFIG.POSTS_PER_PAGE,
      page: 1,
      _embed: true
    });
    
    posts = response.data;
    pagination = response.pagination;
    
    console.log('Blog page pagination info:', pagination);
  } catch (err) {
    console.error('Error fetching posts with pagination:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching posts';
    
    // Fallback to mock data if API fails
    posts = mockPosts;
    pagination = {
      total: mockPosts.length,
      totalPages: Math.ceil(mockPosts.length / SITE_CONFIG.POSTS_PER_PAGE),
      currentPage: 1,
      perPage: SITE_CONFIG.POSTS_PER_PAGE,
      hasNext: mockPosts.length > SITE_CONFIG.POSTS_PER_PAGE,
      hasPrev: false
    };
  }

  return (
    <Layout>
      <h1>Blog</h1>
      
      {error && (
        <div className="alert alert-warning mb-4">
          <strong>API Error:</strong> {error}
          <p>Displaying fallback mock data.</p>
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="alert alert-info">No posts found.</div>
      ) : (
        <>
          <PostGrid posts={posts} showFeatured={true} />
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/blog"
          />
          
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-light border rounded">
              <h6>Blog Pagination Debug Info:</h6>
              <small>
                Total posts: {pagination.total} | 
                Total pages: {pagination.totalPages} | 
                Current page: {pagination.currentPage} | 
                Per page: {pagination.perPage} | 
                Has next: {pagination.hasNext ? 'Yes' : 'No'} | 
                Has prev: {pagination.hasPrev ? 'Yes' : 'No'}
              </small>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}