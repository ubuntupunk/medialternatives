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
          id: 1,
          name: 'David Robert Lewis',
          slug: 'david-robert-lewis',
          description: 'Media activist, investigative journalist, and author focused on media alternatives and press freedom in South Africa.',
          link: '/author/david-robert-lewis',
          avatar_urls: {
            '24': '/images/avatar.jpeg',
            '48': '/images/avatar.jpeg',
            '96': '/images/avatar.jpeg'
          },
          avatar_url: '/images/avatar.jpeg',
          url: '/author/david-robert-lewis',
          meta: {}
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

  // Fallback to Gravatar if no WordPress avatar or if it's the default
  if (avatarUrl === '/images/default-avatar.png' || !avatarUrl || avatarUrl.includes('default-avatar')) {
    // Create Gravatar URL from author name or email-like identifier
    const gravatarId = author.slug || 'davidrobertlewis';
    avatarUrl = `https://www.gravatar.com/avatar/${gravatarId}?s=96&d=mp`;
  }

  // Ensure we don't use non-existent avatar.png
  if (avatarUrl === '/images/avatar.png') {
    avatarUrl = '/images/avatar.jpeg';
  }

  // Fallback to Gravatar if no WordPress avatar or if it's the default
  if (avatarUrl === '/images/default-avatar.png' || !avatarUrl || avatarUrl.includes('default-avatar')) {
    // Create Gravatar URL from author name or email-like identifier
    const gravatarId = author.slug || 'davidrobertlewis';
    avatarUrl = `https://www.gravatar.com/avatar/${gravatarId}?s=96&d=mp`;
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
            alt={`${author.name} avatar`}
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
              {/* Social links with Bootstrap icons */}
              <li>
                <a href="https://x.com/davidrobertlewis" target="_blank" rel="noopener noreferrer" title="Follow on X">
                  <i className="bi bi-twitter-x"></i>
                </a>
              </li>
              <li>
                <a href="https://facebook.com/davidrobertlewis" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-facebook"></i>
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
