import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import { wordpressApi } from '@/services/wordpress-api';
import PostCard from '@/components/Posts/PostCard';
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
      <h1 className="mb-4">Environment</h1>
      <div className="row">
        {validPosts.length > 0 ? (
          validPosts.map((post) => (
            <div key={post.id} className="col-md-6 col-lg-4 mb-4">
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <p>No environmental posts found.</p>
        )}
      </div>
    </div>
  );
};

export default EnvironmentPage;
