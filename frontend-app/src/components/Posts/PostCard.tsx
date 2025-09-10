import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostCardProps } from '@/types';
import { formatDate, createExcerpt, getFeaturedImageUrl, getPostAuthor, getPostAuthorId } from '@/utils/helpers';
import AuthorDisplay from '@/components/UI/AuthorDisplay';
import { LAYOUT_CONFIG } from '@/lib/constants';

/**
 * Regular post card component for grid display
 */
const PostCard: React.FC<PostCardProps> = ({
  post,
  className = '',
  showExcerpt = true,
  showAuthor = true,
  showDate = true
}) => {
  const featuredImageUrl = getFeaturedImageUrl(post);
  const author = getPostAuthor(post);
  const authorId = getPostAuthorId(post);
  const excerpt = createExcerpt(post);
  
  return (
    <article 
      id={`post-${post.id}`} 
      className={`${LAYOUT_CONFIG.REGULAR_POST_CLASS} ${className}`}
    >
      <header className="entry-header">
        {featuredImageUrl && (
          <div className="entry-thumbnail">
            <Link href={`/post/${post.slug}`}>
              <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                <Image 
                  src={featuredImageUrl}
                  alt={post.title.rendered}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>
          </div>
        )}
        
        {(showDate || showAuthor) && (
          <div className="entry-meta">
            {showDate && (
              <time className="entry-date published" dateTime={post.date}>
                {formatDate(post.date)}
              </time>
            )}
            {' '}
            {showAuthor && (
              <AuthorDisplay author={author} authorId={authorId} showPrefix={true} />
            )}
          </div>
        )}
        
        <h2 className="entry-title">
          <Link href={`/${post.slug}`} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
        </h2>
      </header>
      
      {showExcerpt && excerpt && (
        <div className="entry-content">
          <p className="text-pretty">{excerpt}</p>
          <div className="mt-2">
            <Link 
              href={`/post/${post.slug}`}
              className="btn btn-sm read-more-pill"
              style={{
                backgroundColor: '#04AA6D',
                borderColor: '#04AA6D',
                color: '#00e7ff',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                fontWeight: '600',
                fontSize: '12px',
                padding: '0.25rem 0.75rem',
                textDecoration: 'none',
                textTransform: 'uppercase',
                borderRadius: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              Read Full Story
            </Link>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
