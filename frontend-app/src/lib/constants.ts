/**
 * Base URL for WordPress.com REST API v2
 * @constant {string} WORDPRESS_API_BASE
 */
export const WORDPRESS_API_BASE = process.env.WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com';

/**
 * URL for WordPress.com site information API
 * @constant {string} WORDPRESS_SITE_INFO_API
 */
export const WORDPRESS_SITE_INFO_API = process.env.WORDPRESS_API_URL?.replace('/wp/v2/sites/', '/rest/v1.1/sites/') || 'https://public-api.wordpress.com/rest/v1.1/sites/medialternatives.wordpress.com';

/**
 * Base URL for Jetpack REST API
 * @constant {string} JETPACK_API_BASE
 */
export const JETPACK_API_BASE = 'https://public-api.wordpress.com/rest/v1.1/sites/medialternatives.wordpress.com';

/**
 * Jetpack API endpoints for analytics and statistics
 * @constant {Object} JETPACK_ENDPOINTS
 * @property {string} STATS - General site statistics
 * @property {string} STATS_SUMMARY - Summary statistics
 * @property {string} STATS_TOP_POSTS - Top performing posts
 * @property {string} STATS_REFERRERS - Traffic referrers
 * @property {string} STATS_SEARCH_TERMS - Search terms
 * @property {string} STATS_VISITS - Visit statistics
 */
export const JETPACK_ENDPOINTS = {
  STATS: '/stats',
  STATS_SUMMARY: '/stats/summary',
  STATS_TOP_POSTS: '/stats/top-posts',
  STATS_REFERRERS: '/stats/referrers',
  STATS_SEARCH_TERMS: '/stats/search-terms',
  STATS_VISITS: '/stats/visits'
} as const;

/**
 * WordPress.com OAuth 2.0 configuration
 * @constant {Object} WORDPRESS_COM_OAUTH
 * @property {string|undefined} CLIENT_ID - OAuth client ID from environment
 * @property {string|undefined} CLIENT_SECRET - OAuth client secret from environment
 * @property {string} AUTHORIZE_URL - OAuth authorization endpoint
 * @property {string} AUTHENTICATE_URL - OAuth authentication endpoint
 * @property {string} TOKEN_URL - OAuth token endpoint
 * @property {string} SCOPE - Requested OAuth scopes
 * @property {string} REDIRECT_URI - OAuth redirect URI
 */
export const WORDPRESS_COM_OAUTH = {
  CLIENT_ID: process.env.NEXT_PUBLIC_WORDPRESS_COM_CLIENT_ID,
  CLIENT_SECRET: process.env.WORDPRESS_COM_CLIENT_SECRET,
  AUTHORIZE_URL: 'https://public-api.wordpress.com/oauth2/authorize',
  AUTHENTICATE_URL: 'https://public-api.wordpress.com/oauth2/authenticate',
  TOKEN_URL: 'https://public-api.wordpress.com/oauth2/token',
  SCOPE: 'read:stats,read:posts,read:media,read:site,write:posts,write:media,write:site',
  REDIRECT_URI: process.env.NEXT_PUBLIC_WORDPRESS_COM_REDIRECT_URI || 'http://localhost:3000'
} as const;

/**
 * Google AdSense publisher ID
 * @constant {string} ADSENSE_CLIENT_ID
 */
export const ADSENSE_CLIENT_ID = 'ca-pub-1630578712653878';

/**
 * AdSense ad slot IDs for different placements
 * @constant {Object} ADSENSE_SLOTS
 * @property {string} MAIN - Main content ad slot
 * @property {string} FEED - Feed/sidebar ad slot
 */
export const ADSENSE_SLOTS = {
  MAIN: '8018906534',
  FEED: '9120443942'
} as const;

/**
 * Google Analytics 4 measurement ID
 * @constant {string} GOOGLE_ANALYTICS_ID
 */
export const GOOGLE_ANALYTICS_ID = 'G-CZNQG5YM3Z';

/**
 * Site-wide configuration constants
 * @constant {Object} SITE_CONFIG
 * @property {number} POSTS_PER_PAGE - Number of posts to display per page
 * @property {number} CATEGORIES_PER_PAGE - Number of categories per page
 * @property {number} EXCERPT_LENGTH - Maximum length of post excerpts
 * @property {string} SITE_TITLE - Site title for SEO and branding
 * @property {string} SITE_DESCRIPTION - Site description for SEO
 */
export const SITE_CONFIG = {
  POSTS_PER_PAGE: 6, // Optimized for load more and pagination
  CATEGORIES_PER_PAGE: 50,
  EXCERPT_LENGTH: 150,
  SITE_TITLE: 'Medialternatives',
  SITE_DESCRIPTION: 'Reaching out from the Global South',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com'
} as const;

/**
 * Theme color constants derived from additional.css
 * @constant {Object} THEME_COLORS
 * @property {string} BACKGROUND - Main background color
 * @property {string} LINK - Default link color
 * @property {string} LINK_HOVER - Link hover color
 * @property {string} LINK_VISITED - Visited link color
 * @property {string} BUTTON_BG - Button background color
 * @property {string} BUTTON_TEXT - Button text color
 * @property {string} FOOTER_TEXT - Footer text color
 */
export const THEME_COLORS = {
  BACKGROUND: '#e3e3e3',
  LINK: '#0031FF',
  LINK_HOVER: 'blueviolet',
  LINK_VISITED: '#B800FF',
  BUTTON_BG: '#04AA6D',
  BUTTON_TEXT: '#00e7ff',
  FOOTER_TEXT: '#8B008B'
} as const;

/**
 * Bootstrap layout configuration classes
 * @constant {Object} LAYOUT_CONFIG
 * @property {string} MAIN_COLUMN_CLASS - CSS classes for main content column
 * @property {string} SIDEBAR_COLUMN_CLASS - CSS classes for sidebar column
 * @property {string} BIG_POST_CLASS - CSS classes for featured posts
 * @property {string} REGULAR_POST_CLASS - CSS classes for regular posts
 */
export const LAYOUT_CONFIG = {
  MAIN_COLUMN_CLASS: 'col-md-8 col-sm-12',
  SIDEBAR_COLUMN_CLASS: 'col-md-4 col-sm-12',
  BIG_POST_CLASS: 'col-md-12',
  REGULAR_POST_CLASS: 'col-md-6 col-sm-12'
} as const;

/**
 * Header image configuration
 * @constant {Object} HEADER_CONFIG
 * @property {number} DEFAULT_HEIGHT - Default header image height in pixels
 * @property {string} FALLBACK_IMAGE - Fallback header image path
 */
export const HEADER_CONFIG = {
  DEFAULT_HEIGHT: 400,
  FALLBACK_IMAGE: '/images/header-bg.jpg'
} as const;

/**
 * API request configuration constants
 * @constant {Object} API_CONFIG
 * @property {Object} DEFAULT_PARAMS - Default parameters for all API requests
 * @property {number} CACHE_TIME - Cache duration in milliseconds
 * @property {number} RETRY_ATTEMPTS - Number of retry attempts for failed requests
 */
export const API_CONFIG = {
  DEFAULT_PARAMS: {
    _embed: true
    // per_page will be set by individual calls
  },
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3
} as const;