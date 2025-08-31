import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { WebringWidgetProps, webringThemes } from './types';
import styles from './WebringWidget.module.css';
import { useClientOnly } from '@/hooks/useClientOnly';

const WebringWidget: React.FC<WebringWidgetProps> = ({
  title = 'Webring',
  webringUrl = 'https://meshring.netlify.app',
  theme = 'random',
  size = 'medium',
  showImage = true,
  className = '',
  showDescription = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const infoButtonRef = useRef<HTMLAnchorElement>(null);
  const isClient = useClientOnly();
  
  // Handle random theme selection on client side only
  useEffect(() => {
    if (isClient && theme === 'random') {
      const availableThemes = ['default', 'minimal', 'ocean', 'sunset', 'dark', 'tokyo', 'dracula', 'disco'];
      const randomIndex = Math.floor(Math.random() * availableThemes.length);
      setSelectedTheme(availableThemes[randomIndex]);
    } else if (theme !== 'random') {
      setSelectedTheme(theme);
    }
  }, [isClient, theme]);
  
  const currentTheme = webringThemes[selectedTheme] || webringThemes.default;
  
  const getSizeClass = () => {
    switch (size) {
      case 'small': return styles.sizeSmall;
      case 'large': return styles.sizeLarge;
      default: return styles.sizeMedium;
    }
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
        infoButtonRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTooltip]);

  const themeStyles = {
    '--webring-bg': currentTheme.colors.background,
    '--webring-border': currentTheme.colors.border,
    '--webring-text': currentTheme.colors.text,
    '--webring-accent': currentTheme.colors.accent,
    '--webring-link': currentTheme.colors.linkColor,
    '--webring-link-hover': currentTheme.colors.linkHover,
    '--webring-button-bg': currentTheme.colors.buttonBackground,
    '--webring-button-text': currentTheme.colors.buttonText,
    '--webring-button-hover': currentTheme.colors.buttonHover,
  } as React.CSSProperties;

  return (
    <aside 
      className={`widget ${styles.webringWidget} ${getSizeClass()} ${styles[`theme-${selectedTheme}`]} ${className} ${isKeyboardNav ? styles.keyboardNav : ''}`}
      style={themeStyles}
      role="complementary"
      aria-labelledby="webring-title"
    >
      <h3 id="webring-title" className={styles.widgetTitle}>{title}</h3>
      
      <div className={styles.webringContent}>
        {showImage && (
          <div className={styles.surferImageContainer}>
            <Image
              src="https://meshring.netlify.app/assets/images/surfer.jpg"
              alt="Surfer on a wave"
              width={size === 'small' ? 40 : size === 'large' ? 80 : 60}
              height={size === 'small' ? 40 : size === 'large' ? 80 : 60}
              className={styles.surferImage}
              role="img"
              aria-label="Surfer on a wave"
              unoptimized={true}
              onError={(e) => {
                console.error('Surfer image failed to load:', e);
                // Fallback to a simple icon or hide the image
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Surfer image loaded successfully');
              }}
            />
          </div>
        )}
        
        <div className={styles.webringText}>
          <p className={styles.webringIntro}>Member of the</p>
          <h4 className={styles.webringName}>
            <a 
              href={webringUrl}
              aria-label="Visit MuizenMesh Webring homepage"
            >
              MuizenMesh Webring
            </a>
          </h4>
          
          {showDescription && (
            <p className={styles.webringMembers}>
              A community of independent websites
            </p>
          )}
        </div>
        
        <div className={styles.webringInfoContainer}>
          <a 
            ref={infoButtonRef}
            href="https://en.wikipedia.org/wiki/Webring"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.webringInfo}
            aria-describedby={showTooltip ? "webring-tooltip" : undefined}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowTooltip(false);
              }
            }}
            title=""
          >
            ?
          </a>
          
          {showTooltip && (
            <div 
              id="webring-tooltip"
              ref={tooltipRef}
              role="tooltip"
              className={styles.webringTooltip}
              aria-live="polite"
            >
              What is a webring? Click to learn more on Wikipedia
            </div>
          )}
        </div>
      </div>
      
      <nav 
        className={styles.webringNavigation}
        aria-label="Webring navigation"
      >
        <a 
          href={`${webringUrl}/prev`} 
          className={styles.webringLink}
          aria-label="Go to previous website in the webring"
        >
          &larr; Previous
        </a>
        <a 
          href={`${webringUrl}/random`} 
          className={styles.webringLink}
          aria-label="Go to a random website in the webring"
        >
          Random
        </a>
        <a 
          href={`${webringUrl}/next`} 
          className={styles.webringLink}
          aria-label="Go to next website in the webring"
        >
          Next &rarr;
        </a>
      </nav>
    </aside>
  );
};

export default WebringWidget;