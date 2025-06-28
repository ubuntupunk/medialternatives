'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WordPressUser } from '@/types/wordpress';
import { wordpressApi } from '@/services/wordpress-api';

interface AuthorDisplayProps {
  authorId?: number;
  author?: WordPressUser;
  className?: string;
  showPrefix?: boolean;
}

/**
 * Author display component that can fetch author data by ID
 * Falls back to fetching author data if not provided
 */
const AuthorDisplay: React.FC<AuthorDisplayProps> = ({
  authorId,
  author: initialAuthor,
  className = '',
  showPrefix = true
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
      <span className={`author-error ${className}`}>
        {showPrefix && 'by '} David Robert Lewis  
      </span>
    );
  }

  if (!author) {
    return (
      <span className={`author-unknown ${className}`}>
        {showPrefix && 'by '} David Robert Lewis
      </span>
    );
  }

  return (
    <span className={`byline ${className}`}>
      {showPrefix && 'by '}
      <span className="author vcard">
        <Link href={`/author/${author.slug}`}>
          {author.name}
        </Link>
      </span>
    </span>
  );
};

export default AuthorDisplay;