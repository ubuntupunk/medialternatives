'use client';

import React, { useState, useEffect } from 'react';

interface FacebookPost {
  id: string;
  message?: string;
  link?: string;
  picture?: string;
  created_time: string;
  updated_time?: string;
}

interface FacebookPageInfo {
  id: string;
  name: string;
  about?: string;
  category?: string;
  website?: string;
  link?: string;
}

interface FacebookStatus {
  configured: boolean;
  pageInfo?: FacebookPageInfo;
  recentPosts?: FacebookPost[];
  error?: string;
}

export default function FacebookManager() {
  const [status, setStatus] = useState<FacebookStatus>({ configured: false });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [autoPosting, setAutoPosting] = useState(false);
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);

  useEffect(() => {
    loadFacebookStatus();
  }, []);

  const loadFacebookStatus = async () => {
    try {
      const response = await fetch('/api/social/facebook/post?action=status');
      const data = await response.json();

      if (response.ok) {
        setStatus({
          configured: true,
          pageInfo: data.status
        });
      } else {
        setStatus({
          configured: false,
          error: data.error
        });
      }
    } catch {
      setStatus({
        configured: false,
        error: 'Failed to connect to Facebook API'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentPosts = async () => {
    try {
      const response = await fetch('/api/social/facebook/post?action=recent');
      const data = await response.json();

      if (response.ok) {
        setStatus(prev => ({
          ...prev,
          recentPosts: data.posts
        }));
      }
    } catch {
      console.error('Failed to connect to Facebook API');
    } finally {
      setPosting(false);
    }
  };

  const handleAutoPost = async () => {
    setAutoPosting(true);
    let data;
    try {
      const response = await fetch('/api/social/facebook/autopost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postSlug: postSlug.trim(),
        }),
      });

      data = await response.json();

      if (response.ok) {
        alert(`Auto-posted to Facebook successfully! Post URL: ${data.postUrl}`);
        setPostSlug('');
        loadRecentPosts(); // Refresh recent posts
      } else {
        alert(`Failed to auto-post: ${data.error}`);
      }
    } catch {
      alert(`Failed to auto-post: ${data.error}`);
    } finally {
      setAutoPosting(false);
    }
  };

  const toggleAutoPost = async () => {
    // This would typically update a database or environment variable
    // For now, just toggle local state
    setAutoPostEnabled(!autoPostEnabled);
    alert(`Auto-posting ${!autoPostEnabled ? 'enabled' : 'disabled'}`);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading Facebook integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="facebook-manager">
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Facebook Page Integration</h5>
        </div>
        <div className="card-body">
          {!status.configured ? (
            <div className="alert alert-warning">
              <h4 className="alert-heading">Facebook Not Configured</h4>
              <p>To enable Facebook posting, you need to:</p>
              <ol>
                <li>Create a Facebook App at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">developers.facebook.com</a></li>
                <li>Add &quot;Facebook Login&quot; and &quot;Pages&quot; products</li>
                <li>Get a Page Access Token for your page</li>
                <li>Set the environment variables: <code>FACEBOOK_PAGE_ID</code>, <code>FACEBOOK_PAGE_ACCESS_TOKEN</code></li>
              </ol>
              <button className="btn btn-primary btn-sm" onClick={loadFacebookStatus}>
                Check Configuration
              </button>
            </div>
          ) : (
            <div>
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-success me-2">Connected</span>
                <span>Posting to: <strong>{status.pageInfo?.name}</strong></span>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="auto-post"
                  checked={autoPostEnabled}
                  onChange={toggleAutoPost}
                />
                <label className="form-check-label" htmlFor="auto-post">
                  Auto-post new articles to Facebook
                </label>
              </div>

              <button className="btn btn-outline-primary btn-sm" onClick={loadRecentPosts}>
                Load Recent Posts
              </button>
            </div>
          )}
        </div>
      </div>

      {status.configured && (
        <>
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Manual Post to Facebook</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  disabled={posting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Link (optional)</label>
                <input
                  type="url"
                  className="form-control"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  disabled={posting}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAutoPost}
                disabled={posting || !message.trim()}
              >
                {posting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Posting...
                  </>
                ) : (
                  'Post to Facebook'
                )}
              </button>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h6 className="mb-0">Auto-Post Article to Facebook</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Post Slug</label>
                <input
                  type="text"
                  className="form-control"
                  value={postSlug}
                  onChange={(e) => setPostSlug(e.target.value)}
                  placeholder="article-slug-here"
                  disabled={autoPosting}
                />
                <div className="form-text">
                  Enter the post slug (e.g., &quot;my-article-title&quot;) to auto-post the medialternatives.com link to Facebook
                </div>
              </div>

              <button
                className="btn btn-success"
                onClick={handleAutoPost}
                disabled={autoPosting || !postSlug.trim()}
              >
                {autoPosting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Auto-Posting...
                  </>
                ) : (
                  'Auto-Post Article'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {status.recentPosts && status.recentPosts.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h6 className="mb-0">Recent Facebook Posts</h6>
          </div>
          <div className="card-body">
            {status.recentPosts.map((post) => (
              <div key={post.id} className="border-bottom mb-3 pb-3">
                <p className="mb-1">{post.message}</p>
                {post.link && (
                  <small className="text-muted">
                    <a href={post.link} target="_blank" rel="noopener noreferrer">
                      {post.link}
                    </a>
                  </small>
                )}
                <br />
                <small className="text-muted">
                  Posted: {new Date(post.created_time).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}