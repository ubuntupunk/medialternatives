'use client';

import { useState, useEffect } from 'react';
import { wordpressApi } from '@/services/wordpress-api';
import { WordPressPost, WordPressCategory, WordPressSiteInfo } from '@/types/wordpress';


export default function APITestPage() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [siteInfo, setSiteInfo] = useState<WordPressSiteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function testAPI() {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Testing WordPress.com API...');

        // Test site info
        console.log('📡 Fetching site info...');
        const siteData = await wordpressApi.getSiteInfo();
        setSiteInfo(siteData);
        console.log('✅ Site info:', siteData);

        // Test posts
        console.log('📡 Fetching posts...');
        const postsData = await wordpressApi.getPosts({ per_page: 5 });
        setPosts(postsData);
        console.log('✅ Posts:', postsData);

        // Test categories
        console.log('📡 Fetching categories...');
        const categoriesData = await wordpressApi.getCategories({ per_page: 10 });
        setCategories(categoriesData);
        console.log('✅ Categories:', categoriesData);

        // Test cache stats
        const cacheStats = wordpressApi.getCacheStats();
        console.log('💾 Cache stats:', cacheStats);

      } catch (err) {
        console.error('❌ API Test Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="mt-3">Testing WordPress.com API...</h5>
                <p className="text-muted">Please wait while we test the connection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger">
              <h4 className="alert-heading">API Test Failed</h4>
              <p><strong>Error:</strong> {error}</p>
              <hr />
              <p className="mb-0">
                This might be because:
                <ul className="mt-2">
                  <li>WordPress.com site is not set up yet</li>
                  <li>API endpoint is not accessible</li>
                  <li>Network connectivity issues</li>
                  <li>CORS restrictions</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">WordPress.com API Test Results</h1>
          
          {/* Site Info Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">🌐 Site Information</h3>
            </div>
            <div className="card-body">
              {siteInfo ? (
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Site Name:</strong> {siteInfo.name}</p>
                    <p><strong>Description:</strong> {siteInfo.description}</p>
                    <p><strong>URL:</strong> <a href={siteInfo.URL} target="_blank" rel="noopener noreferrer">{siteInfo.URL}</a></p>
                    <p><strong>Language:</strong> {siteInfo.lang}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Post Count:</strong> {siteInfo.post_count}</p>
                    <p><strong>Subscribers:</strong> {siteInfo.subscribers_count}</p>
                    <p><strong>Private:</strong> {siteInfo.is_private ? 'Yes' : 'No'}</p>
                    <p><strong>Jetpack:</strong> {siteInfo.jetpack ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted">No site information available</p>
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">📝 Recent Posts ({posts.length})</h3>
            </div>
            <div className="card-body">
              {posts.length > 0 ? (
                <div className="row">
                  {posts.map((post) => (
                    <div key={post.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                          <p className="card-text">
                            <small className="text-muted">
                              {new Date(post.date).toLocaleDateString()} | 
                              Author ID: {post.author} | 
                              Status: {post.status}
                            </small>
                          </p>
                          <div className="card-text" dangerouslySetInnerHTML={{ 
                            __html: post.excerpt.rendered.substring(0, 150) + '...' 
                          }} />
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
              ) : (
                <p className="text-muted">No posts found</p>
              )}
            </div>
          </div>

          {/* Categories Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">🏷️ Categories ({categories.length})</h3>
            </div>
            <div className="card-body">
              {categories.length > 0 ? (
                <div className="row">
                  {categories.map((category) => (
                    <div key={category.id} className="col-md-4 mb-2">
                      <span className="badge bg-secondary me-2">
                        {category.name} ({category.count})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No categories found</p>
              )}
            </div>
          </div>

          {/* API Service Stats */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">💾 Cache Statistics</h3>
            </div>
            <div className="card-body">
              <p><strong>Cached Requests:</strong> {wordpressApi.getCacheStats().size}</p>
              <details>
                <summary>Cache Keys</summary>
                <ul className="mt-2">
                  {wordpressApi.getCacheStats().keys.map((key, index) => (
                    <li key={index} className="small text-muted">{key}</li>
                  ))}
                </ul>
              </details>
            </div>
          </div>

          {/* Test Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title mb-0">🧪 Test Actions</h3>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary me-2"
                onClick={() => window.location.reload()}
              >
                Refresh Test
              </button>
              <button 
                className="btn btn-secondary me-2"
                onClick={() => {
                  wordpressApi.clearCache();
                  alert('Cache cleared!');
                }}
              >
                Clear Cache
              </button>
              <button 
                className="btn btn-info"
                onClick={() => {
                  console.log('API Service:', wordpressApi);
                  console.log('Posts:', posts);
                  console.log('Categories:', categories);
                  console.log('Site Info:', siteInfo);
                }}
              >
                Log to Console
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}