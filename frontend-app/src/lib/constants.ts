// WordPress.com API Configuration
export const WORDPRESS_API_BASE = process.env.WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com';
export const WORDPRESS_SITE_INFO_API = process.env.WORDPRESS_API_URL?.replace('/wp/v2/sites/', '/rest/v1.1/sites/') || 'https://public-api.wordpress.com/rest/v1.1/sites/medialternatives.wordpress.com';

// AdSense Configuration
export const ADSENSE_CLIENT_ID = 'ca-pub-1630578712653878';
export const ADSENSE_SLOTS = {
  MAIN: '8018906534',
  FEED: '9120443942'
} as const;

// Google Analytics
export const GOOGLE_ANALYTICS_ID = 'G-CZNQG5YM3Z';

// Site Configuration
export const SITE_CONFIG = {
  POSTS_PER_PAGE: 6, // Optimized for load more and pagination
  CATEGORIES_PER_PAGE: 50,
  EXCERPT_LENGTH: 150,
  SITE_TITLE: 'Medialternatives',
  SITE_DESCRIPTION: 'Reaching out from the Global South'
} as const;

// Theme Colors (from additional.css)
export const THEME_COLORS = {
  BACKGROUND: '#e3e3e3',
  LINK: '#0031FF',
  LINK_HOVER: 'blueviolet',
  LINK_VISITED: '#B800FF',
  BUTTON_BG: '#04AA6D',
  BUTTON_TEXT: '#00e7ff',
  FOOTER_TEXT: '#8B008B'
} as const;

// Layout Configuration
export const LAYOUT_CONFIG = {
  MAIN_COLUMN_CLASS: 'col-md-8 col-sm-12',
  SIDEBAR_COLUMN_CLASS: 'col-md-4 col-sm-12',
  BIG_POST_CLASS: 'col-md-12',
  REGULAR_POST_CLASS: 'col-md-6 col-sm-12'
} as const;

// Header Image Configuration
export const HEADER_CONFIG = {
  DEFAULT_HEIGHT: 400,
  FALLBACK_IMAGE: '/images/header-bg.jpg'
} as const;

// API Request Configuration
export const API_CONFIG = {
  DEFAULT_PARAMS: {
    _embed: true
    // per_page will be set by individual calls
  },
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3
} as const;