"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from '@/components/UI/Avatar';
import { AuthorWidgetProps, WordPressUser } from '@/types';
import { wordpressApi } from '@/services/wordpress-api';
import { loadAvatarFromStorage } from '@/utils/avatarUtils';

/**
 * Enhanced Author widget component with improved avatar support
 * Displays author information with custom or generated avatars
 */
const EnhancedAuthorWidget: React.FC<AuthorWidgetProps> = ({
  authorId,
  author: initialAuthor,
  title = 'About Author',
  showSocialMenu = true
}) => {
  const [author, setAuthor] = useState<WordPressUser | null>(initialAuthor || null);
  const [isLoading, setIsLoading] = useState(!initialAuthor);
  const [error, setError] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

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
        
        // Check for custom avatar in storage
        if (data) {
          const storedAvatar = loadAvatarFromStorage(data.id.toString());
          setCustomAvatar(storedAvatar);
        }
      } catch (err) {
        setError('Failed to load author information');
        console.error('Error fetching author:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthor();
  }, [authorId, initialAuthor]);

  if (isLoading) {
    return (
      <div className="widget author-widget">
        <div className="d-flex align-items-center">
          <div className="placeholder-glow">
            <div className="placeholder rounded-circle" style={{ width: 75, height: 75 }}></div>
          </div>
          <div className="ms-3 flex-grow-1">
            <div className="placeholder-glow">
              <div className="placeholder col-6"></div>
              <div className="placeholder col-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget author-widget">
        <h3 className="widget-title">{title}</h3>
        <div className="d-flex align-items-center">
          <Avatar 
            name="David Robert Lewis" 
            size={75}
            className="me-3"
          />
          <div>
            <Link href="/author/david-robert-lewis" className="author-name text-decoration-none">
              <strong>David Robert Lewis</strong>
            </Link>
            <p className="text-muted small mb-0">Site Author</p>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="widget author-widget">
        <h3 className="widget-title">{title}</h3>
        <div className="d-flex align-items-center">
          <Avatar 
            name="David Robert Lewis" 
            size={75}
            className="me-3"
          />
          <div>
            <Link href="/author/david-robert-lewis" className="author-name text-decoration-none">
              <strong>David Robert Lewis</strong>
            </Link>
            <p className="text-muted small mb-0">Site Author</p>
          </div>
        </div>
      </div>
    );
  }

  // Use custom avatar if available, otherwise use WordPress avatar or generate one
  const avatarSrc = customAvatar || 
                   author.avatar_urls?.['96'] || 
                   author.avatar_url;

  return (
    <div className="widget author-widget">
      <h3 className="widget-title">{title}</h3>
      <div className="user-info">
        <div className="d-flex align-items-start mb-3">
          <Avatar
            src={avatarSrc}
            name={author.name}
            size={75}
            className="me-3 border shadow-sm"
            showTooltip={true}
          />
          
          <div className="flex-grow-1">
            <Link 
              href={`/author/${author.slug}`} 
              className="author-name text-decoration-none"
            >
              <strong className="text-primary">{author.name}</strong>
            </Link>
            
            {author.description && (
              <p className="author-description text-muted small mt-1 mb-0 lh-base">
                {author.description.length > 120 
                  ? `${author.description.substring(0, 120)}...` 
                  : author.description
                }
              </p>
            )}
          </div>
        </div>
        
        {showSocialMenu && (
          <div className="author-social-menu">
            <div className="d-flex gap-2">
              <Link 
                href={`/author/${author.slug}`}
                className="btn btn-outline-primary btn-sm"
              >
                <i className="bi bi-person me-1"></i>
                View Profile
              </Link>
              
              {author.url && (
                <a 
                  href={author.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-globe me-1"></i>
                  Website
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAuthorWidget;