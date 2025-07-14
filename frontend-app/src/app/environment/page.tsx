import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import { wordpressApi } from '@/services/wordpress-api';
import PostCard from '@/components/Posts/PostCard';
import PostCardBig from '@/components/Posts/PostCardBig';
import { WordPressPost } from '@/types/wordpress';

const EnvironmentPage: React.FC = async () => {
  const filePath = path.join(process.cwd(), 'src', 'content', 'environment.md');
  const urlsContent = await fs.readFile(filePath, 'utf8');
  const urls = urlsContent.split('\n').filter(url => url.trim() !== '');

  const posts: (WordPressPost | null)[] = await Promise.all(
    urls.map(async (url) => {
      try {
        const urlParts = url.split('/');
        // The slug is usually the second to last part of the URL, before the trailing slash or query params
        let slug = urlParts[urlParts.length - 2];
        // Handle cases with query parameters like ?fbclid=...
        if (slug?.includes('?')) {
          slug = slug.split('?')[0];
        }
        if (slug) {
          return await wordpressApi.getPost(slug);
        }
        return null;
      } catch (error) {
        console.error(`Error fetching post for URL: ${url}`, error);
        return null;
      }
    })
  );

  const validPosts = posts.filter((post): post is WordPressPost => post !== null);

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-4 mb-3 text-balance">Environment</h1>
          <p className="lead text-muted text-balance">
            Explore our environmental coverage and climate activism content.
          </p>
        </div>
      </div>
      
      <div className="row g-4">
        {validPosts.length > 0 ? (
          <>
            {/* Featured Story - Full Width */}
            {validPosts[0] && (
              <div className="col-12 mb-4">
                <PostCardBig post={validPosts[0]} />
              </div>
            )}
            
            {/* Remaining Stories - Two Columns */}
            {validPosts.slice(1).map((post) => (
              <div key={post.id} className="col-md-6 col-sm-12">
                <PostCard post={post} />
              </div>
            ))}
          </>
        ) : (
          <div className="col-12">
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              No environmental posts found. Check back soon for new content!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentPage;
