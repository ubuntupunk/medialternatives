'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ImageGenerator from '@/components/ImageGenerator/ImageGenerator';

export default function ImageGeneratorPage() {
  const { user, requireAuth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  // Require authentication
  requireAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts-with-placeholders');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGeneration = async () => {
    setBulkProcessing(true);
    setProcessedCount(0);
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      try {
        await generateImageForPost(post);
        setProcessedCount(i + 1);
      } catch (error) {
        console.error(`Error generating image for post ${post.id}:`, error);
      }
    }
    
    setBulkProcessing(false);
    await fetchPosts(); // Refresh the list
  };

  const generateImageForPost = async (post) => {
    const response = await fetch('/api/generate-post-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: post.id,
        title: post.title.rendered,
        content: post.content.rendered,
        excerpt: post.excerpt.rendered
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }
    
    return response.json();
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please log in to access the image generator.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Image Generator
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 text-balance">
            <i className="bi bi-image me-2 text-primary"></i>
            AI Image Generator
          </h1>
          <p className="text-muted text-pretty">
            Generate custom images for your blog posts using AI. Replace placeholder images with content-relevant visuals.
          </p>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-success"
            onClick={handleBulkGeneration}
            disabled={bulkProcessing || posts.length === 0}
          >
            {bulkProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing... ({processedCount}/{posts.length})
              </>
            ) : (
              <>
                <i className="bi bi-lightning-fill me-2"></i>
                Bulk Generate ({posts.length} posts)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-primary">{posts.length}</h5>
              <p className="card-text small text-muted">Posts with Placeholders</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-success">{processedCount}</h5>
              <p className="card-text small text-muted">Images Generated</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-warning">
                {posts.length - processedCount}
              </h5>
              <p className="card-text small text-muted">Remaining</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-info">
                {posts.length > 0 ? Math.round((processedCount / posts.length) * 100) : 0}%
              </h5>
              <p className="card-text small text-muted">Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Single Image Generator */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-brush me-2"></i>
                Single Image Generator
              </h5>
            </div>
            <div className="card-body">
              <ImageGenerator />
            </div>
          </div>
        </div>
      </div>

      {/* Posts with Placeholder Images */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-images me-2"></i>
                Posts Needing Images
              </h5>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={fetchPosts}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="alert alert-success text-center">
                  <i className="bi bi-check-circle me-2"></i>
                  All posts have proper featured images! No placeholder images found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Post</th>
                        <th>Current Image</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.id}>
                          <td>
                            <div>
                              <h6 className="mb-1 text-balance" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                              <small className="text-muted">
                                {new Date(post.date).toLocaleDateString()}
                              </small>
                            </div>
                          </td>
                          <td>
                            <img 
                              src={post.featured_image_url || 'https://picsum.photos/100/60'} 
                              alt="Current featured image"
                              className="img-thumbnail"
                              style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                            />
                          </td>
                          <td>
                            <span className="badge bg-warning">
                              Placeholder
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => generateImageForPost(post)}
                            >
                              <i className="bi bi-magic me-1"></i>
                              Generate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}