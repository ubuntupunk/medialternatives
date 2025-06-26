import React from 'react';
import Layout from '@/components/Layout/Layout';
import CategoryCloud from '@/components/Widgets/CategoryCloud';
import AuthorWidget from '@/components/Widgets/AuthorWidget';
import AdSenseWidget, { AdSenseFeed } from '@/components/Widgets/AdSenseWidget';
import PostCard from '@/components/Posts/PostCard';
import PostCardBig from '@/components/Posts/PostCardBig';
import Pagination from '@/components/UI/Pagination';
import { mockPosts, mockCategories } from '@/utils/mockData';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Components",
  description: "UI components showcase for Medialternatives - demonstrating React components used throughout the site.",
};

export default function ComponentsPage() {
  // Use the first mock post for demonstration
  const samplePost = mockPosts[0];
  return (
    <Layout showSidebar={false}>
      <div className="components-showcase">
        <h1 className="mb-5">Components Showcase</h1>
        <div className="alert alert-info mb-4">
          <strong>Note:</strong> This page showcases UI components with sample data. Some components connect to the WordPress.com API.
        </div>
        
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
              <CategoryCloud categories={mockCategories} />
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
              <Pagination currentPage={3} totalPages={10} baseUrl="/" />
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