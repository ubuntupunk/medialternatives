import React from 'react';
import PostGrid from '@/components/Posts/PostGrid';
import LoadMore from '@/components/UI/LoadMore';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost, PaginationInfo } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300; // 5 minutes

// This is a server component that fetches data on the server
export default async function Home() {
  let posts: WordPressPost[] = [];
  let pagination: PaginationInfo = {
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
    
    console.log('Home page pagination info:', pagination);
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
      hasPrev: false,
      nextPage: mockPosts.length > SITE_CONFIG.POSTS_PER_PAGE ? 2 : undefined,
      prevPage: undefined
    };
  }

  return (
    <>
      {error && (
        <div className="alert alert-warning mb-4">
          <strong>API Error:</strong> {error}
          <p>Displaying fallback mock data.</p>
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="alert alert-info">No posts found.</div>
      ) : (
        <LoadMore 
          initialPosts={posts}
          initialPagination={pagination}
        />
      )}
    </>
  );
}
