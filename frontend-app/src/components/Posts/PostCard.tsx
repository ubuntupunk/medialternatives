import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostCardProps } from '@/types';
import { formatDate, createExcerpt, getFeaturedImageUrl, getPostAuthor, decodeHtmlEntities } from '@/utils/helpers';
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
            
            {showAuthor && author && (
              <span className="byline">
                {' by '}
                <span className="author vcard">
                  <Link href={`/author/${author.slug}`}>
                    {author.name}
                  </Link>
                </span>
              </span>
            )}
          </div>
        )}
        
        <h2 className="entry-title">
          <Link href={`/post/${post.slug}`} dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(post.title.rendered) }} />
        </h2>
      </header>
      
      {showExcerpt && excerpt && (
        <div className="entry-content">
          <div dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(excerpt) }} />
        </div>
      )}
    </article>
  );
};

export default PostCard;
