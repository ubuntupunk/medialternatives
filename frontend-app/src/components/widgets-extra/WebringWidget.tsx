import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { WebringWidgetProps, webringThemes } from './types';
import styles from './WebringWidget.module.css';
import { useClientOnly } from '@/hooks/useClientOnly';

/**
 * Interactive Webring Widget Component
 *
 * A dynamic widget that displays webring information with interactive theme changing.
 * Users can hover over the widget and tooltip to cycle through different visual themes.
 *
 * @component
 * @param {WebringWidgetProps} props - The component props
 * @returns {JSX.Element} The rendered webring widget
 *
 * @example
 * ```tsx
 * <WebringWidget
 *   title="My Webring"
 *   theme="dark"
 *   size="medium"
 *   showImage={true}
 * />
 * ```
 */
const WebringWidget: React.FC<WebringWidgetProps> = ({
  title = 'Webring',
  webringUrl = 'https://meshring.netlify.app',
  theme = 'dark',
  size = 'medium',
  showImage = true,
  className = '',
  showDescription = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('dark');
  const [currentTheme, setCurrentTheme] = useState<string>('dark');
  const [isHoveringWidget, setIsHoveringWidget] = useState(false);
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const infoButtonRef = useRef<HTMLAnchorElement>(null);
  const widgetRef = useRef<HTMLElement>(null);
  const isClient = useClientOnly();
  
  // Available themes for theme changes
  const availableThemes = ['default', 'minimal', 'ocean', 'sunset', 'dark', 'tokyo', 'dracula', 'disco'];

  // Handle theme selection - default to dark
  useEffect(() => {
    if (isClient) {
      const initialTheme = theme === 'random' ? 'dark' : theme;
      setSelectedTheme(initialTheme);
      setCurrentTheme(initialTheme);
    }
  }, [isClient, theme]);

  /**
   * Changes the widget theme to a random theme different from the current one
   *
   * @private
   * @function changeToRandomTheme
   * @returns {void}
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
   * Handles mouse entering the widget area
   * Changes theme if not already hovering over tooltip
   *
   * @private
   * @function handleWidgetMouseEnter
   * @returns {void}
   */
  const handleWidgetMouseEnter = () => {
    setIsHoveringWidget(true);
    if (!isHoveringTooltip) {
      changeToRandomTheme();
    }
  };

  /**
   * Handles mouse leaving the widget area
   * Resets hover states and hides tooltip
   *
   * @private
   * @function handleWidgetMouseLeave
   * @returns {void}
   */
  const handleWidgetMouseLeave = () => {
    setIsHoveringWidget(false);
    setIsHoveringTooltip(false);
    setShowTooltip(false);
  };

  /**
   * Handles mouse entering the tooltip/info button
   * Shows tooltip and changes theme
   *
   * @private
   * @function handleTooltipMouseEnter
   * @returns {void}
   */
  const handleTooltipMouseEnter = () => {
    setIsHoveringTooltip(true);
    setShowTooltip(true);
    changeToRandomTheme();
  };

  /**
   * Handles mouse leaving the tooltip/info button
   * Hides tooltip
   *
   * @private
   * @function handleTooltipMouseLeave
   * @returns {void}
   */
  const handleTooltipMouseLeave = () => {
    setIsHoveringTooltip(false);
    setShowTooltip(false);
  };
  
  // Use current theme for styling
  const themeData = webringThemes[currentTheme] || webringThemes.dark;
  
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
        setIsHoveringTooltip(false);
        infoButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTooltip]);

  const themeStyles = {
    '--webring-bg': themeData.colors.background,
    '--webring-border': themeData.colors.border,
    '--webring-text': themeData.colors.text,
    '--webring-accent': themeData.colors.accent,
    '--webring-link': themeData.colors.linkColor,
    '--webring-link-hover': themeData.colors.linkHover,
    '--webring-button-bg': themeData.colors.buttonBackground,
    '--webring-button-text': themeData.colors.buttonText,
    '--webring-button-hover': themeData.colors.buttonHover,
  } as React.CSSProperties;

  return (
    <aside
      ref={widgetRef}
      className={`widget ${styles.webringWidget} ${getSizeClass()} ${styles[`theme-${currentTheme}`]} ${className} ${isKeyboardNav ? styles.keyboardNav : ''} ${(isHoveringWidget || isHoveringTooltip) ? styles.themeChanging : ''}`}
      style={themeStyles}
      role="complementary"
      aria-labelledby="webring-title"
      onMouseEnter={handleWidgetMouseEnter}
      onMouseLeave={handleWidgetMouseLeave}
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