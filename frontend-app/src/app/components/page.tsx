import React from 'react';
import Layout from '@/components/Layout/Layout';
import CategoryCloud from '@/components/Widgets/CategoryCloud';
import AuthorWidget from '@/components/Widgets/AuthorWidget';
import AdSenseWidget, { AdSenseFeed } from '@/components/Widgets/AdSenseWidget';
import PostCard from '@/components/Posts/PostCard';
import PostCardBig from '@/components/Posts/PostCardBig';
import Pagination from '@/components/UI/Pagination';

// Sample post data for demonstration
const samplePost = {
  id: 1,
  date: '2023-06-15T12:00:00',
  slug: 'hello-world',
  title: { rendered: 'Sample Post Title' },
  excerpt: { rendered: '<p>This is a sample post excerpt for demonstration purposes. It shows how the post card component renders content from WordPress.com API.</p>' },
  content: { rendered: '<p>This is the full content of the post.</p>' },
  featured_media: 1,
  author: 1,
  _embedded: {
    author: [{ name: 'Admin', slug: 'admin' }],
    'wp:featuredmedia': [{ source_url: 'https://via.placeholder.com/800x400' }]
  }
};

// Sample categories for demonstration
const sampleCategories = [
  { id: 1, name: 'Technology', slug: 'technology', count: 15 },
  { id: 2, name: 'Design', slug: 'design', count: 8 },
  { id: 3, name: 'Development', slug: 'development', count: 12 },
  { id: 4, name: 'WordPress', slug: 'wordpress', count: 5 },
  { id: 5, name: 'React', slug: 'react', count: 10 },
  { id: 6, name: 'Next.js', slug: 'nextjs', count: 3 },
  { id: 7, name: 'CSS', slug: 'css', count: 7 },
  { id: 8, name: 'JavaScript', slug: 'javascript', count: 20 }
];

export default function ComponentsPage() {
  return (
    <Layout showSidebar={false}>
      <div className="components-showcase">
        <h1 className="mb-5">Components Showcase</h1>
        
        <section className="mb-5">
          <h2>Post Components</h2>
          <div className="row">
            <div className="col-12 mb-4">
              <h3>Big Post Card</h3>
              <PostCardBig post={samplePost} />
            </div>
            
            <div className="col-md-6 mb-4">
              <h3>Regular Post Card</h3>
              <PostCard post={samplePost} />
            </div>
          </div>
        </section>
        
        <section className="mb-5">
          <h2>Widget Components</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <h3>Category Cloud</h3>
              <CategoryCloud categories={sampleCategories} />
            </div>
            
            <div className="col-md-4 mb-4">
              <h3>Author Widget</h3>
              <AuthorWidget authorId={1} />
            </div>
            
            <div className="col-md-4 mb-4">
              <h3>AdSense Widget</h3>
              <AdSenseWidget />
            </div>
          </div>
        </section>
        
        <section className="mb-5">
          <h2>UI Components</h2>
          <div className="row">
            <div className="col-12 mb-4">
              <h3>Pagination</h3>
              <Pagination currentPage={3} totalPages={10} baseUrl="/blog" />
            </div>
          </div>
        </section>
        
        <section className="mb-5">
          <h2>AdSense Feed</h2>
          <div className="row">
            <div className="col-12">
              <p>This is some content before the ad.</p>
              <AdSenseFeed />
              <p>This is some content after the ad.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}