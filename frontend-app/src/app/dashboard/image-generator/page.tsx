'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import ImageGenerator from '@/components/ImageGenerator/ImageGenerator';
import { WordPressPost } from '@/types/wordpress';

interface PostWithStatus extends Omit<WordPressPost, 'status'> {
  generationStatus?: 'idle' | 'generating' | 'completed' | 'failed' | 'error';
  progress?: number;
  error?: string;
  featured_image_url?: string;
  generated_at?: string;
  needs_image?: boolean;
}

export default function ImageGeneratorPage() {
  const { user, useRequireAuth } = useAuth();
  const [posts, setPosts] = useState<PostWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [processingPosts, setProcessingPosts] = useState<Set<number>>(new Set());
  const [generationSettings, setGenerationSettings] = useState({
    style: 'photorealistic',
    aspectRatio: '16:9',
    quality: 'high',
    includeText: false
  });

  // Require authentication
  useRequireAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts-with-placeholders');
      const data: { posts?: PostWithStatus[] } = await response.json();
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

  const generateImageForPost = async (post: PostWithStatus, customSettings?: typeof generationSettings) => {
    // Add post to processing set
    setProcessingPosts(prev => new Set(prev).add(post.id));
    
    try {
      // Update post status to generating
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { ...p, status: 'generating', progress: 0 }
            : p
        )
      );

      const response = await fetch('/api/generate-post-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          title: post.title.rendered,
          content: post.content?.rendered || '',
          excerpt: post.excerpt?.rendered || '',
          settings: customSettings || generationSettings
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }
      
      const result = await response.json();
      
      // Update the post with the new image and success status
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { 
                ...p, 
                featured_image_url: result.imageUrl, 
                needs_image: false,
                status: 'completed',
                progress: 100,
                generated_at: new Date().toISOString()
              }
            : p
        )
      );
      
      return result;
    } catch (error) {
      console.error(`Error generating image for post ${post.id}:`, error);

      // Update post status to error
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === post.id
            ? { ...p, status: 'error', progress: 0, error: error instanceof Error ? error.message : 'Unknown error' }
            : p
        )
      );

      throw error;
    } finally {
      // Remove post from processing set
      setProcessingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    }
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
          <div className="d-flex gap-2 justify-content-end">
            <Link 
              href="/dashboard/image-generator/debug"
              className="btn btn-outline-warning btn-sm"
            >
              <i className="bi bi-bug me-1"></i>
              Debug
            </Link>
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

      {/* Generation Settings */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Default Generation Settings
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label htmlFor="defaultStyle" className="form-label">Style</label>
                  <select
                    className="form-select"
                    id="defaultStyle"
                    value={generationSettings.style}
                    onChange={(e) => setGenerationSettings({...generationSettings, style: e.target.value})}
                  >
                    <option value="photorealistic">Photorealistic</option>
                    <option value="illustration">Illustration</option>
                    <option value="abstract">Abstract</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="defaultAspectRatio" className="form-label">Aspect Ratio</label>
                  <select
                    className="form-select"
                    id="defaultAspectRatio"
                    value={generationSettings.aspectRatio}
                    onChange={(e) => setGenerationSettings({...generationSettings, aspectRatio: e.target.value})}
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="4:3">4:3 (Standard)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="defaultQuality" className="form-label">Quality</label>
                  <select
                    className="form-select"
                    id="defaultQuality"
                    value={generationSettings.quality}
                    onChange={(e) => setGenerationSettings({...generationSettings, quality: e.target.value})}
                  >
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="defaultIncludeText"
                      checked={generationSettings.includeText}
                      onChange={(e) => setGenerationSettings({...generationSettings, includeText: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="defaultIncludeText">
                      Include title in image
                    </label>
                  </div>
                </div>
              </div>
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
                Posts Needing Images ({posts.length})
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
                        <th style={{ width: '40%' }}>Post</th>
                        <th style={{ width: '20%' }}>Current Image</th>
                        <th style={{ width: '20%' }}>Status</th>
                        <th style={{ width: '20%' }}>Actions</th>
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
                              {/* Progress bar for individual post */}
                              {processingPosts.has(post.id) && (
                                <div className="progress mt-2" style={{ height: '3px' }}>
                                  <div 
                                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                                    role="progressbar" 
                                    style={{ width: '100%' }}
                                  ></div>
                                </div>
                              )}
                               {post.generationStatus === 'completed' && (
                                <div className="mt-1">
                                  <small className="text-success">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Generated {post.generated_at ? new Date(post.generated_at).toLocaleTimeString() : 'recently'}
                                  </small>
                                </div>
                               )}
                               {post.generationStatus === 'error' && (
                                 <div className="mt-1">
                                   <small className="text-danger">
                                     <i className="bi bi-exclamation-triangle me-1"></i>
                                     {post.error}
                                   </small>
                                 </div>
                               )}
                            </div>
                          </td>
                          <td>
                             <div className="position-relative">
                               <Image
                                 src={post.featured_image_url || 'https://picsum.photos/100/60'}
                                 alt="Current featured image"
                                 className="img-thumbnail"
                                 width={100}
                                 height={60}
                                 style={{ objectFit: 'cover' }}
                               />
                              {processingPosts.has(post.id) && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded">
                                  <div className="spinner-border spinner-border-sm text-light" role="status">
                                    <span className="visually-hidden">Generating...</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {processingPosts.has(post.id) ? (
                              <span className="badge bg-primary">
                                <i className="bi bi-arrow-repeat me-1"></i>
                                Generating...
                              </span>
                            ) : post.generationStatus === 'completed' ? (
                              <span className="badge bg-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Complete
                              </span>
                            ) : post.generationStatus === 'error' ? (
                              <span className="badge bg-danger">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                Error
                              </span>
                            ) : (
                              <span className="badge bg-warning">
                                <i className="bi bi-image me-1"></i>
                                Placeholder
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              <button 
                                className="btn btn-primary btn-sm"
                                 onClick={async () => {
                                   try {
                                     await generateImageForPost(post);
                                   } catch (_error) {
                                     // Error is already handled in the function
                                   }
                                 }}
                                disabled={bulkProcessing || processingPosts.has(post.id)}
                              >
                                {processingPosts.has(post.id) ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-magic me-1"></i>
                                    Generate
                                  </>
                                )}
                              </button>
                              {post.generationStatus === 'error' && (
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                 onClick={async () => {
                                     try {
                                       await generateImageForPost(post);
                                     } catch (_error) {
                                       // Error is already handled in the function
                                     }
                                   }}
                                  disabled={bulkProcessing || processingPosts.has(post.id)}
                                >
                                  <i className="bi bi-arrow-clockwise me-1"></i>
                                  Retry
                                </button>
                              )}
                            </div>
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