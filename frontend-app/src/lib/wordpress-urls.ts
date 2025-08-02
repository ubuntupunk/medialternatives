/**
 * WordPress.com URL utilities
 * Generates WordPress.com admin URLs based on environment configuration
 */

// Extract site slug from API URL
function getWordPressSiteSlug(): string {
  const apiUrl = process.env.WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com';
  const match = apiUrl.match(/\/sites\/([^\/]+)/);
  return match ? match[1] : 'medialternatives.wordpress.com';
}

// Get base WordPress.com admin URL
function getWordPressAdminBase(): string {
  const siteSlug = getWordPressSiteSlug();
  return `https://${siteSlug}/wp-admin`;
}

export const WORDPRESS_URLS = {
  // Admin URLs
  ADMIN_BASE: getWordPressAdminBase(),
  NEW_POST: `${getWordPressAdminBase()}/post-new.php`,
  EDIT_POSTS: `${getWordPressAdminBase()}/edit.php`,
  DRAFT_POSTS: `${getWordPressAdminBase()}/edit.php?post_status=draft`,
  CATEGORIES: `${getWordPressAdminBase()}/edit-tags.php?taxonomy=category`,
  MEDIA: `${getWordPressAdminBase()}/upload.php`,
  
  // Helper functions
  getEditPostUrl: (postId: number) => `${getWordPressAdminBase()}/post.php?post=${postId}&action=edit`,
  getPostUrl: (post: { link?: string; analyticsPath?: string }) => {
    if (post.link) return post.link;
    if (post.analyticsPath) return `https://${getWordPressSiteSlug()}${post.analyticsPath}`;
    return `https://${getWordPressSiteSlug()}`;
  }
} as const;

// Export site slug for other uses
export const WORDPRESS_SITE_SLUG = getWordPressSiteSlug();