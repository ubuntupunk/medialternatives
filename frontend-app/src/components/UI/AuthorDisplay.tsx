'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WordPressUser } from '@/types/wordpress';
import { wordpressApi } from '@/services/wordpress-api';

interface AuthorDisplayProps {
  authorId?: number;
  author?: WordPressUser;
  className?: string;
  showPrefix?: boolean;
  showAvatar?: boolean;
  showBio?: boolean;
}

/**
 * Author display component that can fetch author data by ID
 * Falls back to fetching author data if not provided
 */
const AuthorDisplay: React.FC<AuthorDisplayProps> = ({
  authorId,
  author: initialAuthor,
  className = '',
  showPrefix = true,
  showAvatar = true,
  showBio = false
}) => {
  const [author, setAuthor] = useState<WordPressUser | null>(initialAuthor || null);
  const [isLoading, setIsLoading] = useState(!initialAuthor && !!authorId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      // If we already have author data, don't fetch
      if (initialAuthor) {
        setAuthor(initialAuthor);
        setIsLoading(false);
        return;
      }

      // If no author ID, nothing to fetch
      if (!authorId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const authorData = await wordpressApi.getUser(authorId);
        setAuthor(authorData);
      } catch (err) {
        console.error('Error fetching author:', err);
        setError('Failed to load author information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthor();
  }, [authorId, initialAuthor]);

  if (isLoading) {
    return (
      <span className={`author-loading ${className}`}>
        {showPrefix && 'by '}Loading...
      </span>
    );
  }

  // We map unknown-error and unknown-author to our default author.
  if (error) {
    return (
      <span className={`byline author-error ${className}`}>
        {showPrefix && 'by '}
        <span className="author vcard">
          <Link href="/author/david-robert-lewis">
            David Robert Lewis
          </Link>
        </span>
      </span>
    );
  }

  if (!author) {
    return (
      <span className={`byline author-unknown ${className}`}>
        {showPrefix && 'by '}
        <span className="author vcard">
          <Link href="/author/david-robert-lewis">
            David Robert Lewis
          </Link>
        </span>
      </span>
    );
  }

  return (
    <div className={`author-display ${className}`}>
      {showAvatar && author.avatar_urls && (
        <Image
          src={author.avatar_urls['96'] || author.avatar_urls['48'] || author.avatar_urls['24']}
          alt={`${author.name} avatar`}
          className="author-avatar rounded-circle me-2"
          width={32}
          height={32}
        />
      )}
      <span className="byline">
        {showPrefix && 'by '}
        <span className="author vcard">
          <Link href={`/author/${author.slug}`}>
            {author.name}
          </Link>
        </span>
      </span>
      {showBio && author.description && (
        <div className="author-bio mt-2 text-muted small">
          {author.description}
        </div>
      )}
    </div>
  );
};

export default AuthorDisplay;