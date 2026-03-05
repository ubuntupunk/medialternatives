import React from 'react';
import FacebookManager from '@/components/Dashboard/FacebookManager';

/**
 * Facebook Dashboard Page
 *
 * Provides interface for managing Facebook page integration,
 * including automated posting, manual posting, and monitoring.
 */
export default function FacebookDashboardPage() {
  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center mb-4">
            <i className="bi bi-facebook text-primary fs-2 me-3"></i>
            <div>
              <h1 className="h2 mb-1">Facebook Page Management</h1>
              <p className="text-muted mb-0">
                Automate posting to your Facebook page and manage social media content
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <FacebookManager />
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Setup Instructions
              </h5>
            </div>
            <div className="card-body">
              <h6>1. Create Facebook App</h6>
              <ol>
                <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
                <li>Create a new app (choose "Business" type)</li>
                <li>Add "Facebook Login" and "Pages" products</li>
              </ol>

              <h6>2. Get Page Access Token</h6>
              <ol>
                <li>Go to your app's dashboard</li>
                <li>Navigate to "Tools & Support" → "Graph API Explorer"</li>
                <li>Select your app and generate a Page Access Token</li>
                <li>Request permissions: <code>pages_manage_posts</code>, <code>pages_read_engagement</code></li>
              </ol>

              <h6>3. Environment Variables</h6>
              <p>Add these to your <code>.env.local</code> file:</p>
              <pre className="bg-light p-3 rounded">
{`FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
FACEBOOK_AUTO_POST_ENABLED=true`}
              </pre>

              <h6>4. Auto-Posting Integration</h6>
              <p>To auto-post when new articles are published on your site:</p>
              <ul>
                <li>Use the "Auto-Post Article" section in this dashboard</li>
                <li>Or call the API directly: <code>POST /api/social/facebook/autopost</code> with <code>{`{ "postSlug": "your-post-slug" }`}</code></li>
                <li>Enable auto-posting in the dashboard settings above</li>
                <li>Integrate with your post publishing workflow to automatically trigger posting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}