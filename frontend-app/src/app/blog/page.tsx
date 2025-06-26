import React from 'react';
import Layout from '@/components/Layout/Layout';
import PostGrid from '@/components/Posts/PostGrid';
import Pagination from '@/components/UI/Pagination';
import { wordpressApi } from '@/services/wordpress-api';
import { SITE_CONFIG } from '@/lib/constants';

// This is a server component that fetches data on the server
export default async function BlogPage() {
  // In a real implementation, we would use Next.js data fetching
  // For now, we'll use placeholder data
  const posts = [
    {
      id: 1,
      date: '2023-06-15T12:00:00',
      slug: 'hello-world',
      title: { rendered: 'Hello World' },
      excerpt: { rendered: '<p>This is a sample post excerpt.</p>' },
      content: { rendered: '<p>This is the full content of the post.</p>' },
      featured_media: 1,
      author: 1,
      _embedded: {
        author: [{ name: 'Admin', slug: 'admin' }],
        'wp:featuredmedia': [{ source_url: 'https://via.placeholder.com/800x400' }]
      }
    },
    {
      id: 2,
      date: '2023-06-10T10:00:00',
      slug: 'getting-started',
      title: { rendered: 'Getting Started with Next.js' },
      excerpt: { rendered: '<p>Learn how to get started with Next.js.</p>' },
      content: { rendered: '<p>This is the full content about getting started with Next.js.</p>' },
      featured_media: 2,
      author: 1,
      _embedded: {
        author: [{ name: 'Admin', slug: 'admin' }],
        'wp:featuredmedia': [{ source_url: 'https://via.placeholder.com/800x400' }]
      }
    },
    {
      id: 3,
      date: '2023-06-05T09:00:00',
      slug: 'wordpress-api',
      title: { rendered: 'Using WordPress.com API' },
      excerpt: { rendered: '<p>Learn how to use WordPress.com API with Next.js.</p>' },
      content: { rendered: '<p>This is the full content about using WordPress.com API.</p>' },
      featured_media: 3,
      author: 1,
      _embedded: {
        author: [{ name: 'Admin', slug: 'admin' }],
        'wp:featuredmedia': [{ source_url: 'https://via.placeholder.com/800x400' }]
      }
    }
  ];

  // In a real implementation, we would fetch the total pages from the API
  const totalPages = 5;
  const currentPage = 1;

  return (
    <Layout>
      <h1>Blog</h1>
      <PostGrid posts={posts} showFeatured={true} />
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/blog"
      />
    </Layout>
  );
}