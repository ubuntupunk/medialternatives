'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { wordpressApi } from '@/services/wordpress-api';
import { WordPressPost } from '@/types/wordpress';
import { formatDate } from '@/utils/helpers';

export default function ContentManagementPage() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('recent');

  // Fetch popular posts from Google Analytics
  const fetchPopularPosts = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await fetch('/api/analytics?period=30d');
      const result = await response.json();
      
      if (result.success && result.data.topPages) {
        // Match analytics pages with WordPress posts
        const popularPostsData = await Promise.all(
          result.data.topPages.slice(0, 5).map(async (page: any) => {
            try {
              // Extract slug from page path
              const slug = page.page.replace('/post/', '').replace('/', '');
              if (slug && slug !== '' && !slug.includes('/')) {
                const post = await wordpressApi.getPost(slug);
                if (post) {
                  return {
                    ...post,
                    views: page.views,
                    analyticsPath: page.page
                  };
                }
              }
              return {
                title: { rendered: page.page },
                slug: page.page,
                views: page.views,
                analyticsPath: page.page,
                isAnalyticsOnly: true
              };
            } catch (err) {
              return {
                title: { rendered: page.page },
                slug: page.page,
                views: page.views,
                analyticsPath: page.page,
                isAnalyticsOnly: true
              };
            }
          })
        );
        setPopularPosts(popularPostsData.filter(Boolean));
      } else {
        throw new Error(result.note || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching popular posts:', err);
      setAnalyticsError(err instanceof Error ? err.message : 'Failed to fetch popular posts');
      
      // Set fallback popular posts based on recent posts
      if (posts.length > 0) {
        setPopularPosts(posts.slice(0, 5).map((post, index) => ({
          ...post,
          views: Math.floor(Math.random() * 1000) + 500,
          isEstimated: true
        })));
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await wordpressApi.getPosts({
          per_page: 20,
          _embed: true,
          orderby: 'date',
          order: 'desc'
        });
        setPosts(fetchedPosts);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchPopularPosts();
    }
  }, [posts]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      publish: { class: 'bg-success', text: 'Published' },
      draft: { class: 'bg-secondary', text: 'Draft' },
      pending: { class: 'bg-warning', text: 'Pending' },
      private: { class: 'bg-info', text: 'Private' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const tabs = [
    { id: 'recent', label: 'Recent Posts', icon: 'bi-clock' },
    { id: 'drafts', label: 'Drafts', icon: 'bi-file-earmark' },
    { id: 'popular', label: 'Popular', icon: 'bi-graph-up' },
    { id: 'media', label: 'Media', icon: 'bi-image' }
  ];

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Content
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2">
            <i className="bi bi-file-text me-2 text-secondary"></i>
            Content Management
          </h1>
          <p className="text-muted">
            Manage your posts, pages, and media content.
          </p>
        </div>
        <div className="col-md-4 text-end">
          <a 
            href="https://davidrobertlewis5.wordpress.com/wp-admin/post-new.php"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <i className="bi bi-plus-circle me-2"></i>
            New Post
          </a>
        </div>
      </div>

      {/* Content Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-file-text fs-2 mb-2"></i>
              <h4 className="mb-0">{posts.length}</h4>
              <small>Total Posts</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-check-circle fs-2 mb-2"></i>
              <h4 className="mb-0">{posts.filter(p => p.status === 'publish').length}</h4>
              <small>Published</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-file-earmark fs-2 mb-2"></i>
              <h4 className="mb-0">{posts.filter(p => p.status === 'draft').length}</h4>
              <small>Drafts</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-calendar fs-2 mb-2"></i>
              <h4 className="mb-0">
                {posts.length > 0 ? Math.round(posts.length / 12) : 0}
              </h4>
              <small>Posts/Month</small>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                {tabs.map(tab => (
                  <li key={tab.id} className="nav-item">
                    <button
                      className={`nav-link ${selectedTab === tab.id ? 'active' : ''}`}
                      onClick={() => setSelectedTab(tab.id)}
                    >
                      <i className={`${tab.icon} me-2`}></i>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-3">Loading content...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              ) : (
                <div className="tab-content">
                  {selectedTab === 'recent' && (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Categories</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.slice(0, 15).map(post => (
                            <tr key={post.id}>
                              <td>
                                <div>
                                  <strong className="text-truncate d-block" style={{ maxWidth: '300px' }}>
                                    {post.title.rendered}
                                  </strong>
                                  <small className="text-muted">ID: {post.id}</small>
                                </div>
                              </td>
                              <td>{getStatusBadge(post.status)}</td>
                              <td>
                                <small>
                                  {formatDate(post.date)}
                                  <br />
                                  <span className="text-muted">
                                    {post.modified !== post.date && `Modified: ${formatDate(post.modified)}`}
                                  </span>
                                </small>
                              </td>
                              <td>
                                <small>
                                  {post.categories.length > 0 ? `${post.categories.length} categories` : 'Uncategorized'}
                                </small>
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <Link 
                                    href={`/post/${post.slug}`}
                                    className="btn btn-outline-primary"
                                    title="View Post"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </Link>
                                  <a 
                                    href={`https://davidrobertlewis5.wordpress.com/wp-admin/post.php?post=${post.id}&action=edit`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-secondary"
                                    title="Edit in WordPress"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </a>
                                  <a 
                                    href={post.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-info"
                                    title="View on WordPress.com"
                                  >
                                    <i className="bi bi-box-arrow-up-right"></i>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedTab === 'drafts' && (
                    <div className="text-center py-5">
                      <i className="bi bi-file-earmark text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">
                        Draft posts would be displayed here
                        <br />
                        <small>WordPress.com API doesn't expose draft posts in public API</small>
                      </p>
                      <a 
                        href="https://davidrobertlewis5.wordpress.com/wp-admin/edit.php?post_status=draft"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        View Drafts in WordPress
                      </a>
                    </div>
                  )}

                  {selectedTab === 'popular' && (
                    <div className="text-center py-5">
                      <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">
                        Popular posts analytics would be displayed here
                        <br />
                        <small>Integration with Google Analytics required</small>
                      </p>
                    </div>
                  )}

                  {selectedTab === 'media' && (
                    <div className="text-center py-5">
                      <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">
                        Media library would be displayed here
                        <br />
                        <small>WordPress.com media API integration needed</small>
                      </p>
                      <a 
                        href="https://davidrobertlewis5.wordpress.com/wp-admin/upload.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        Manage Media in WordPress
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <a 
                    href="https://davidrobertlewis5.wordpress.com/wp-admin/post-new.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary w-100"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    New Post
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a 
                    href="https://davidrobertlewis5.wordpress.com/wp-admin/edit.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary w-100"
                  >
                    <i className="bi bi-list me-2"></i>
                    All Posts
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a 
                    href="https://davidrobertlewis5.wordpress.com/wp-admin/edit-tags.php?taxonomy=category"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-info w-100"
                  >
                    <i className="bi bi-tags me-2"></i>
                    Categories
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a 
                    href="https://davidrobertlewis5.wordpress.com/wp-admin/upload.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-warning w-100"
                  >
                    <i className="bi bi-image me-2"></i>
                    Media Library
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="row mt-4">
        <div className="col-12 text-center">
          <Link href="/dashboard" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}