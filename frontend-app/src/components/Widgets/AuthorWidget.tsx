"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Avatar from '@/components/UI/Avatar';
import { AuthorWidgetProps, WordPressUser } from '@/types';

/**
 * Author widget component
 * Displays author information with optional social menu
 */
// Available themes for theme changes (similar to WebringWidget)
const authorThemes = {
  default: { colors: { background: '#f8f9fa', border: '#dee2e6', text: '#495057', accent: '#007bff', linkColor: '#007bff', linkHover: '#0056b3', buttonBackground: '#007bff', buttonText: '#ffffff', buttonHover: '#0056b3' } },
  minimal: { colors: { background: '#ffffff', border: '#e9ecef', text: '#212529', accent: '#6c757d', linkColor: '#6c757d', linkHover: '#495057', buttonBackground: '#6c757d', buttonText: '#ffffff', buttonHover: '#495057' } },
  ocean: { colors: { background: '#e3f2fd', border: '#bbdefb', text: '#0d47a1', accent: '#1976d2', linkColor: '#1976d2', linkHover: '#0d47a1', buttonBackground: '#1976d2', buttonText: '#ffffff', buttonHover: '#0d47a1' } },
  sunset: { colors: { background: '#fff3e0', border: '#ffcc02', text: '#e65100', accent: '#ff6f00', linkColor: '#ff6f00', linkHover: '#e65100', buttonBackground: '#ff6f00', buttonText: '#ffffff', buttonHover: '#e65100' } },
  dark: { colors: { background: '#343a40', border: '#495057', text: '#ffffff', accent: '#ffc107', linkColor: '#ffc107', linkHover: '#ffca2c', buttonBackground: '#ffc107', buttonText: '#000000', buttonHover: '#ffca2c' } },
  tokyo: { colors: { background: '#1a1a2e', border: '#16213e', text: '#e94560', accent: '#0f3460', linkColor: '#e94560', linkHover: '#f39c12', buttonBackground: '#e94560', buttonText: '#ffffff', buttonHover: '#f39c12' } },
  dracula: { colors: { background: '#282a36', border: '#44475a', text: '#f8f8f2', accent: '#bd93f9', linkColor: '#bd93f9', linkHover: '#ff79c6', buttonBackground: '#bd93f9', buttonText: '#282a36', buttonHover: '#ff79c6' } },
  disco: { colors: { background: '#2d1b69', border: '#7c3aed', text: '#fbbf24', accent: '#ec4899', linkColor: '#fbbf24', linkHover: '#f59e0b', buttonBackground: '#ec4899', buttonText: '#ffffff', buttonHover: '#f59e0b' } }
};

const AuthorWidget: React.FC<AuthorWidgetProps> = ({
  authorId,
  author: initialAuthor, // Renamed to avoid conflict with state
  title = 'About Author',
  showSocialMenu = true
}) => {
  const [author, setAuthor] = useState<WordPressUser | null>(initialAuthor || null);
  const [isLoading, setIsLoading] = useState(!initialAuthor);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const infoButtonRef = useRef<HTMLAnchorElement>(null);

  // Available themes for theme changes
  const availableThemes = ['default', 'minimal', 'ocean', 'sunset', 'dark', 'tokyo', 'dracula', 'disco'];

  // Handle theme selection - default to default
  useEffect(() => {
    setCurrentTheme('default');
  }, []);

  /**
   * Changes the widget theme to a random theme different from the current one
   */
  const changeToRandomTheme = () => {
    const currentIndex = availableThemes.indexOf(currentTheme);
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * availableThemes.length);
    } while (randomIndex === currentIndex && availableThemes.length > 1); // Avoid same theme

    const newTheme = availableThemes[randomIndex];
    setCurrentTheme(newTheme);
  };

  /**
   * Handles mouse entering the tooltip/info button
   * Shows tooltip and changes theme
   */
  const handleTooltipMouseEnter = () => {
    setIsHoveringTooltip(true);
    setShowTooltip(true);
    changeToRandomTheme();
  };

  /**
   * Handles mouse leaving the tooltip/info button
   * Hides tooltip
   */
  const handleTooltipMouseLeave = () => {
    setIsHoveringTooltip(false);
    setShowTooltip(false);
  };

  // Handle keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardNav(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNav(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Handle Escape key to close tooltip
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTooltip) {
        setShowTooltip(false);
        setIsHoveringTooltip(false);
        infoButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTooltip]);

  // Use current theme for styling
  const themeData = authorThemes[currentTheme as keyof typeof authorThemes] || authorThemes.default;

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

      // For now, always use fallback author data to avoid WordPress API authentication issues
      // The site's WordPress REST API v2 requires authentication that isn't properly configured
      setAuthor({
        id: 1,
        name: 'David Robert Lewis',
        slug: 'david-robert-lewis',
        description: 'Media activist, code hacker, music journalist, living in South Africa.',
        link: '/author/david-robert-lewis',
        avatar_urls: {
          '24': '/images/avatar.webp',
          '48': '/images/avatar.webp',
          '96': '/images/avatar.webp'
        },
        avatar_url: '/images/avatar.webp',
        url: '/author/david-robert-lewis',
        meta: {}
      });
      setIsLoading(false);

      // TODO: Re-enable API fetching when WordPress REST API authentication is properly configured
      /*
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
            '24': '/images/avatar.webp',
            '48': '/images/avatar.webp',
            '96': '/images/avatar.webp'
          },
          avatar_url: '/images/avatar.webp',
          url: '/author/david-robert-lewis',
          meta: {}
        });
      } finally {
        setIsLoading(false);
      }
      */
    };

    fetchAuthor();
  }, [authorId, initialAuthor]);

  if (isLoading) {
    return <div className="widget author-widget">Loading author information...</div>;
  }

  if (!author) {
    return <div className="widget author-widget"></div>;
  }

  // Get avatar URL with fallback
  const getAvatarUrl = () => {
    // 1. Try high-res WordPress avatar
    if (author.avatar_urls?.['96'] && typeof author.avatar_urls['96'] === 'string') {
      return author.avatar_urls['96'];
    }
    
    // 2. Try standard WordPress avatar
    if (author.avatar_url && typeof author.avatar_url === 'string') {
      return author.avatar_url;
    }
    
    // 3. Fallback to Gravatar
    const gravatarId = author.slug || 'davidrobertlewis';
    return `https://www.gravatar.com/avatar/${gravatarId}?s=96&d=mp`;
  };

  let avatarUrl = getAvatarUrl();

  // Fix known legacy path issues
  if (avatarUrl === '/images/avatar.png' || avatarUrl === '/avatar.png' || avatarUrl === '/images/avatar.webp' || avatarUrl === '/avatar.webp') {
    avatarUrl = '/images/avatar.webp';
  }
  
  // Ensure we don't have "default-avatar" in the URL if we want to use Gravatar
  if (avatarUrl.includes('default-avatar')) {
    const gravatarId = author.slug || 'davidrobertlewis';
    avatarUrl = `https://www.gravatar.com/avatar/${gravatarId}?s=96&d=mp`;
  }
  
  // Final sanitization
  if (typeof avatarUrl !== 'string' || avatarUrl.includes('{')) {
    avatarUrl = '/images/avatar.webp'; // Use the known good local avatar as ultimate fallback
  }

  const themeStyles = {
    '--author-bg': themeData.colors.background,
    '--author-border': themeData.colors.border,
    '--author-text': themeData.colors.text,
    '--author-accent': themeData.colors.accent,
    '--author-link': themeData.colors.linkColor,
    '--author-link-hover': themeData.colors.linkHover,
    '--author-button-bg': themeData.colors.buttonBackground,
    '--author-button-text': themeData.colors.buttonText,
    '--author-button-hover': themeData.colors.buttonHover,
  } as React.CSSProperties;

  return (
    <div
      className={`widget author-widget ${isKeyboardNav ? 'keyboard-nav' : ''} ${isHoveringTooltip ? 'theme-changing' : ''}`}
      style={themeStyles}
    >
      <h3 className="widget-title">
        {title}
        <div className="author-info-container">
          <a
            ref={infoButtonRef}
            href="https://github.com/ubuntupunk"
            target="_blank"
            rel="noopener noreferrer"
            className="author-info"
            aria-describedby={showTooltip ? "author-tooltip" : undefined}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowTooltip(false);
                setIsHoveringTooltip(false);
              }
            }}
            title=""
          >
            ?
          </a>

          {showTooltip && (
            <div
              id="author-tooltip"
              ref={tooltipRef}
              role="tooltip"
              className="author-tooltip"
              aria-live="polite"
            >
              Check out my GitHub repos! Click to visit github.com/ubuntupunk
            </div>
          )}
        </div>
      </h3>
      <div className="user-info">
        <div className="author-avatar">
          <Avatar
            src={avatarUrl}
            name={author.name}
            size={75}
            className="shadow-sm border"
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
                  X.com
                </a>
              </li>
              <li>
                <a href="https://facebook.com/davidrobertlewis" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-facebook"></i>
                  Facebook
                </a>
              </li>
              <li>
                <a href="/feed.atom" target="_blank" rel="noopener noreferrer" title="Subscribe to Atom Feed">
                  <i className="bi bi-rss"></i>
                  Atom Feed
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
