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
  author: initialAuthor, // Renamed to avoid conflict with state
  title = 'About Author',
  showSocialMenu = true
}) => {
  const [author, setAuthor] = useState<WordPressUser | null>(initialAuthor || null);
  const [isLoading, setIsLoading] = useState(!initialAuthor);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (initialAuthor) {
        setAuthor(initialAuthor);
        setIsLoading(false);
        return;
      }

      if (!authorId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await wordpressApi.getUser(authorId);
        setAuthor(data);
      } catch (err) {
        // If authentication is required, fall back to default author info
        console.warn('Author data requires authentication, using fallback:', err);
        setAuthor({
          id: authorId,
          name: 'David Robert Lewis',
          slug: 'david-robert-lewis',
          description: 'Media activist, researcher, and writer focusing on South African media landscape and social justice issues.',
          avatar_urls: {
            '96': '/images/avatar.png'
          },
          url: '/author/david-robert-lewis'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthor();
  }, [authorId, initialAuthor]);

  if (isLoading) {
    return <div className="widget author-widget">Loading author information...</div>;
  }

  if (error) {
    return <div className="widget author-widget">Error: {error}</div>;
  }

  if (!author) {
    return <div className="widget author-widget"></div>;
  }

  // Get avatar URL with fallback and ensure it's a string
  let avatarUrl = '/images/default-avatar.png';
  
  if (author.avatar_urls?.['96']) {
    avatarUrl = typeof author.avatar_urls['96'] === 'string' ? author.avatar_urls['96'] : '/images/default-avatar.png';
  } else if (author.avatar_url) {
    avatarUrl = typeof author.avatar_url === 'string' ? author.avatar_url : '/images/default-avatar.png';
  }
  
  // Ensure we don't pass objects or malformed data to Image component
  if (typeof avatarUrl !== 'string' || avatarUrl.includes('{')) {
    console.warn('Invalid avatar URL detected, using fallback:', avatarUrl);
    avatarUrl = '/images/default-avatar.png';
  }

  return (
    <div className="widget author-widget">
      <h3 className="widget-title">{title}</h3>
      <div className="user-info">
        <div className="author-avatar">
          <Image
            src={avatarUrl}
            alt={author.name || 'Author avatar'}
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
                  X.com
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
