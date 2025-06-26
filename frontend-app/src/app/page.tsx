import React from 'react';
import Layout from '@/components/Layout/Layout';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';
import { WordPressPost } from '@/types/wordpress';
import { mockPosts } from '@/utils/mockData';

// This is a server component that fetches data on the server
export default async function Home() {
  let posts: WordPressPost[] = [];
  let error = null;
  
  try {
    // Fetch real posts from WordPress.com API
    posts = await wordpressApi.getPosts({ 
      per_page: SITE_CONFIG.POSTS_PER_PAGE,
      _embed: true
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    error = err instanceof Error ? err.message : 'Unknown error fetching posts';
    
    // Fallback to mock data if API fails
    posts = mockPosts;
  }

  // Get page information
  const currentPage = 1;
  // Calculate total pages based on post count or use default
  const totalPages = 5; // In a real implementation, we would get this from API headers

  return (
    <Layout>
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
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/"
          />
        </>
      )}
    </Layout>
  );
}