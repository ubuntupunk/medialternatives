'use client';

import { useState } from 'react';

// Mock data for testing when WordPress.com site isn't ready
const mockSiteInfo = {
  ID: 123456,
  name: "David Robert Lewis - Media Activism",
  description: "Media activism resources and insights",
  URL: "https://davidrobertlewis5.wordpress.com",
  post_count: 25,
  subscribers_count: 150,
  lang: "en",
  is_private: false,
  jetpack: true
};

const mockPosts = [
  {
    id: 1,
    title: { rendered: "Getting Started with Media Activism" },
    excerpt: { rendered: "An introduction to effective media activism strategies..." },
    date: "2024-01-15T10:00:00",
    author: 1,
    status: "publish",
    _embedded: {
      author: [{ name: "David Robert Lewis" }],
      'wp:featuredmedia': [{
        source_url: "https://placeholder.co/400x200/007bff/ffffff?text=Featured+Image"
      }]
    }
  },
  {
    id: 2,
    title: { rendered: "Digital Storytelling Techniques" },
    excerpt: { rendered: "Learn how to craft compelling digital narratives..." },
    date: "2024-01-10T14:30:00",
    author: 1,
    status: "publish",
    _embedded: {
      author: [{ name: "David Robert Lewis" }]
    }
  }
];

const mockCategories = [
  { id: 1, name: "Media Activism", count: 12 },
  { id: 2, name: "Digital Strategy", count: 8 },
  { id: 3, name: "Storytelling", count: 6 },
  { id: 4, name: "Social Media", count: 4 },
  { id: 5, name: "Resources", count: 3 }
];

export default function APITestMockPage() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info">
            <h4 className="alert-heading">Mock Data Test</h4>
            <p>This page shows mock data to demonstrate how the API integration will work once WordPress.com is set up.</p>
          </div>

          <h1 className="mb-4">WordPress.com API Mock Test Results</h1>
          
          {/* Site Info Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">Site Information</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Site Name:</strong> {mockSiteInfo.name}</p>
                  <p><strong>Description:</strong> {mockSiteInfo.description}</p>
                  <p><strong>URL:</strong> <a href={mockSiteInfo.URL} target="_blank" rel="noopener noreferrer">{mockSiteInfo.URL}</a></p>
                  <p><strong>Language:</strong> {mockSiteInfo.lang}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Post Count:</strong> {mockSiteInfo.post_count}</p>
                  <p><strong>Subscribers:</strong> {mockSiteInfo.subscribers_count}</p>
                  <p><strong>Private:</strong> {mockSiteInfo.is_private ? 'Yes' : 'No'}</p>
                  <p><strong>Jetpack:</strong> {mockSiteInfo.jetpack ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">Recent Posts ({mockPosts.length})</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {mockPosts.map((post) => (
                  <div key={post.id} className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">{post.title.rendered}</h5>
                        <p className="card-text">
                          <small className="text-muted">
                            {new Date(post.date).toLocaleDateString()} | 
                            Author: {post._embedded?.author?.[0]?.name || 'Unknown'} | 
                            Status: {post.status}
                          </small>
                        </p>
                        <div className="card-text">{post.excerpt.rendered}</div>
                        {post._embedded?.['wp:featuredmedia']?.[0] && (
                          <img 
                            src={post._embedded['wp:featuredmedia'][0].source_url} 
                            alt={post.title.rendered}
                            className="img-fluid mt-2"
                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">Categories ({mockCategories.length})</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {mockCategories.map((category) => (
                  <div key={category.id} className="col-md-4 mb-2">
                    <span className="badge bg-secondary me-2">
                      {category.name} ({category.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* API Structure Demo */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">API Structure Demo</h3>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-info"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} API Response Structure
              </button>
              
              {showDetails && (
                <div className="mt-3">
                  <h5>Sample Post Object:</h5>
                  <pre className="bg-light p-3 rounded">
                    <code>{JSON.stringify(mockPosts[0], null, 2)}</code>
                  </pre>
                  
                  <h5 className="mt-3">Sample Category Object:</h5>
                  <pre className="bg-light p-3 rounded">
                    <code>{JSON.stringify(mockCategories[0], null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="alert alert-success">
            <h4 className="alert-heading">Next Steps</h4>
            <ol>
              <li>Set up WordPress.com site at davidrobertlewis5.wordpress.com</li>
              <li>Import content from current site</li>
              <li>Test real API endpoints at <code>/api-test</code></li>
              <li>Begin component development</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}