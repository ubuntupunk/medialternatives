import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostCardProps } from '@/types';
import { formatDate, createExcerpt, getFeaturedImageUrl, getPostAuthor, getPostAuthorId, decodeHtmlEntities } from '@/utils/helpers';
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
                  alt={decodeHtmlEntities(post.title.rendered)}
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
          <Link href={`/post/${post.slug}`} dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(post.title.rendered) }} />
        </h2>
      </header>
      
      {showExcerpt && excerpt && (
        <div className="entry-content">
          <p className="text-pretty">{excerpt}</p>
        </div>
      )}
    </article>
  );
};

export default PostCard;
