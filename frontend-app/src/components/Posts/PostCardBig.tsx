import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostCardProps } from '@/types';
import { formatDate, createExcerpt, getFeaturedImageUrl, getPostAuthor, getPostAuthorId } from '@/utils/helpers';
import AuthorDisplay from '@/components/UI/AuthorDisplay';
import InteractiveButton from '@/components/UI/InteractiveButton';
import { LAYOUT_CONFIG } from '@/lib/constants';

/**
 * Big post card component for featured posts
 */
const PostCardBig: React.FC<PostCardProps> = ({
  post,
  className = '',
  showExcerpt = true,
  showAuthor = true,
  showDate = true
}) => {
  const featuredImageUrl = getFeaturedImageUrl(post, 'full');
  const author = getPostAuthor(post);
  const authorId = getPostAuthorId(post);
  const excerpt = createExcerpt(post, 250);
  
  return (
    <article 
      id={`post-${post.id}`} 
      className={`big-post ${LAYOUT_CONFIG.BIG_POST_CLASS} ${className}`}
    >
      <header className="entry-header">
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
        
        {featuredImageUrl && (
          <div className="entry-thumbnail">
            <Link href={`/${post.slug}`}>
              <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                <Image 
                  src={featuredImageUrl}
                  alt={post.title.rendered}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="100vw"
                  priority
                />
              </div>
            </Link>
          </div>
        )}
      </header>
      
      {showExcerpt && excerpt && (
        <div className="entry-content">
          <p className="text-pretty">{excerpt}</p>
          <div className="mt-3 mb-4">
            <InteractiveButton href={`/${post.slug}`}>
              Read full story &rarr;
            </InteractiveButton>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCardBig;