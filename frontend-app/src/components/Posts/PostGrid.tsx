import React from 'react';
import { WordPressPost } from '@/types/wordpress';
import PostCard from './PostCard';
import PostCardBig from './PostCardBig';

interface PostGridProps {
  posts: WordPressPost[];
  showFeatured?: boolean;
  className?: string;
}

/**
 * Post grid component for displaying multiple posts
 * First post is displayed as a featured post if showFeatured is true
 */
const PostGrid: React.FC<PostGridProps> = ({
  posts,
  showFeatured = true,
  className = ''
}) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="posts-container">
        <p>No posts found.</p>
      </div>
    );
  }

  return (
    <div id="posts-container" className={`row ${className}`}>
      {showFeatured && posts.length > 0 && (
        <PostCardBig post={posts[0]} />
      )}
      
      {posts.slice(showFeatured ? 1 : 0).map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostGrid;