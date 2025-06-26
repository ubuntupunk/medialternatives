"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthorWidgetProps, WordPressUser } from '@/types';
import { wordpressApi } from '@/services/wordpress-api';

/**
 * Author widget component
 * Displays author information with optional social menu
 */
const AuthorWidget: React.FC<AuthorWidgetProps> = ({
  authorId,
  title = 'About Author',
  showSocialMenu = true
}) => {
  const [author, setAuthor] = useState<WordPressUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!authorId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await wordpressApi.getUser(authorId);
        setAuthor(data);
      } catch (err) {
        setError('Failed to load author information');
        console.error('Error fetching author:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthor();
  }, [authorId]);

  if (isLoading) {
    return <div className="widget author-widget">Loading author information...</div>;
  }

  if (error) {
    return <div className="widget author-widget">Error: {error}</div>;
  }

  if (!author) {
    return <div className="widget author-widget">No author information available.</div>;
  }

  // Get avatar URL with fallback
  const avatarUrl = author.avatar_urls?.['96'] || author.avatar_url || '/images/default-avatar.png';

  return (
    <div className="widget author-widget">
      <h3 className="widget-title">{title}</h3>
      <div className="user-info">
        <div className="author-avatar">
          <Image
            src={avatarUrl}
            alt={author.name}
            width={75}
            height={75}
            style={{ borderRadius: '50%' }}
          />
        </div>
        
        <Link href={`/author/${author.slug}`} className="author-name">
          {author.name}
        </Link>
        
        {author.description && (
          <p className="author-description">{author.description}</p>
        )}
        
        {showSocialMenu && (
          <div className="author-social-menu">
            <ul className="social-links">
              {/* Social links would be dynamically generated here */}
              {/* For now, we'll use placeholder links */}
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorWidget;