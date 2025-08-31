/**
 * WordPress.com URL utilities
 * Generates WordPress.com admin URLs based on environment configuration
 */

/**
 * Extract site slug from API URL
 * @returns {string} WordPress site slug
 */
function getWordPressSiteSlug(): string {
  const apiUrl = process.env.WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com';
  const match = apiUrl.match(/\/sites\/([^\/]+)/);
  return match ? match[1] : 'medialternatives.wordpress.com';
}

/**
 * Get base WordPress.com admin URL
 * @returns {string} WordPress admin base URL
 */
function getWordPressAdminBase(): string {
  const siteSlug = getWordPressSiteSlug();
  return `https://${siteSlug}/wp-admin`;
}

/**
 * WordPress.com URL constants and helper functions
 * @constant {Object} WORDPRESS_URLS
 * @property {string} ADMIN_BASE - Base WordPress admin URL
 * @property {string} NEW_POST - URL for creating new posts
 * @property {string} EDIT_POSTS - URL for editing posts
 * @property {string} DRAFT_POSTS - URL for draft posts
 * @property {string} CATEGORIES - URL for managing categories
 * @property {string} MEDIA - URL for media library
 * @property {Function} getEditPostUrl - Generate edit post URL
 * @property {Function} getPostUrl - Generate post permalink URL
 */
export const WORDPRESS_URLS = {
  // Admin URLs
  ADMIN_BASE: getWordPressAdminBase(),
  NEW_POST: `${getWordPressAdminBase()}/post-new.php`,
  EDIT_POSTS: `${getWordPressAdminBase()}/edit.php`,
  DRAFT_POSTS: `${getWordPressAdminBase()}/edit.php?post_status=draft`,
  CATEGORIES: `${getWordPressAdminBase()}/edit-tags.php?taxonomy=category`,
  MEDIA: `${getWordPressAdminBase()}/upload.php`,

  // Helper functions
  /**
   * Generate edit post URL
   * @param {number} postId - WordPress post ID
   * @returns {string} Edit post URL
   */
  getEditPostUrl: (postId: number) => `${getWordPressAdminBase()}/post.php?post=${postId}&action=edit`,

  /**
   * Generate post permalink URL
   * @param {{link?: string, analyticsPath?: string}} post - Post object with link or analytics path
   * @returns {string} Post permalink URL
   */
  getPostUrl: (post: { link?: string; analyticsPath?: string }) => {
    if (post.link) return post.link;
    if (post.analyticsPath) return `https://${getWordPressSiteSlug()}${post.analyticsPath}`;
    return `https://${getWordPressSiteSlug()}`;
  }
} as const;

/**
 * WordPress site slug extracted from API URL
 * @constant {string} WORDPRESS_SITE_SLUG
 */
export const WORDPRESS_SITE_SLUG = getWordPressSiteSlug();