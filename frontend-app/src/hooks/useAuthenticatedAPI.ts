import { useWordPressAuth } from '@/contexts/WordPressAuthContext';
import { makeAuthenticatedRequest, WORDPRESS_API_ENDPOINTS } from '@/utils/wordpressImplicitAuth';

/**
 * Custom React hook for making authenticated WordPress.com API calls
 *
 * This hook provides a convenient interface for interacting with WordPress.com APIs
 * that require authentication. It automatically handles authentication state,
 * token management, and provides fallbacks for unauthenticated scenarios.
 *
 * @returns {Object} Hook interface with authentication methods and state
 * @property {boolean} isAuthenticated - Whether user is currently authenticated
 * @property {Object} token - Current authentication token
 * @property {Function} makeRequest - Generic authenticated request method
 * @property {Function} getStats - Get site statistics
 * @property {Function} getTopPosts - Get top posts data
 * @property {Function} getReferrers - Get referrer data
 * @property {Function} getUser - Get user information
 * @property {Function} canPerform - Check if operation is allowed
 *
 * @example
 * ```tsx
 * const { isAuthenticated, getStats, canPerform } = useAuthenticatedAPI();
 *
 * if (isAuthenticated && canPerform('read')) {
 *   const stats = await getStats('30');
 *   console.log('Site stats:', stats);
 * }
 * ```
 */
export function useAuthenticatedAPI() {
  const { isAuthenticated, token, checkPermission } = useWordPressAuth();

  /**
   * Make a generic authenticated request to WordPress.com API
   *
   * @async
   * @param {string} endpoint - The API endpoint URL
   * @param {RequestInit} [options] - Additional fetch options
   * @returns {Promise<Response>} The fetch response
   * @throws {Error} If not authenticated or request fails
   *
   * @example
   * ```typescript
   * const response = await makeRequest('/wp/v2/posts');
   * const posts = await response.json();
   * ```
   */
  const makeRequest = async (endpoint: string, options?: RequestInit) => {
    if (!isAuthenticated || !token) {
      throw new Error('Not authenticated with WordPress.com');
    }

    return makeAuthenticatedRequest(endpoint, options);
  };

  /**
   * Get site statistics from WordPress.com
   *
   * @async
   * @param {string} [period='30'] - Time period in days (7, 30, 90, etc.)
   * @returns {Promise<Object>} Site statistics data
   * @throws {Error} If not authenticated or insufficient permissions
   *
   * @example
   * ```typescript
   * const stats = await getStats('30');
   * console.log(`Views: ${stats.views}, Visitors: ${stats.visitors}`);
   * ```
   */
  const getStats = async (period: string = '30') => {
    if (!checkPermission('read')) {
      throw new Error('Insufficient permissions for stats');
    }

    if (!token?.siteId) {
      throw new Error('No site ID available');
    }

    const response = await makeRequest(
      WORDPRESS_API_ENDPOINTS.SITE_STATS_SUMMARY(token.siteId, period)
    );

    if (!response.ok) {
      throw new Error(`Stats API failed: ${response.status}`);
    }

    return response.json();
  };

   /**
    * Get top posts (requires read permission)
    * @async
    * @param {string} [period='30'] - Time period in days
    * @returns {Promise<Object>} Top posts data
    * @throws {Error} If not authenticated or insufficient permissions
    */
   const getTopPosts = async (period: string = '30') => {
    if (!checkPermission('read')) {
      throw new Error('Insufficient permissions for top posts');
    }

    if (!token?.siteId) {
      throw new Error('No site ID available');
    }

    const response = await makeRequest(
      WORDPRESS_API_ENDPOINTS.SITE_STATS_TOP_POSTS(token.siteId, period)
    );

    if (!response.ok) {
      throw new Error(`Top posts API failed: ${response.status}`);
    }

    return response.json();
  };

   /**
    * Get referrers (requires read permission)
    * @async
    * @param {string} [period='30'] - Time period in days
    * @returns {Promise<Object>} Referrer data
    * @throws {Error} If not authenticated or insufficient permissions
    */
   const getReferrers = async (period: string = '30') => {
    if (!checkPermission('read')) {
      throw new Error('Insufficient permissions for referrers');
    }

    if (!token?.siteId) {
      throw new Error('No site ID available');
    }

    const response = await makeRequest(
      WORDPRESS_API_ENDPOINTS.SITE_STATS_REFERRERS(token.siteId, period)
    );

    if (!response.ok) {
      throw new Error(`Referrers API failed: ${response.status}`);
    }

    return response.json();
  };

   /**
    * Get user information (requires read permission)
    * @async
    * @param {number} [userId=1] - User ID to fetch
    * @returns {Promise<Object>} User information
    * @throws {Error} If not authenticated or insufficient permissions
    */
   const getUser = async (userId: number = 1) => {
    if (!checkPermission('read')) {
      throw new Error('Insufficient permissions for user data');
    }

    if (!token?.siteId) {
      throw new Error('No site ID available');
    }

    try {
      const response = await makeRequest(
        `https://public-api.wordpress.com/rest/v1.1/sites/${token.siteId}/users/${userId}`
      );

      if (!response.ok) {
        throw new Error(`User API failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Return fallback user data for known users
      if (userId === 1) {
        return {
          id: 1,
          name: 'David Robert Lewis',
          description: 'Media activist, investigative journalist, and author focused on media alternatives and press freedom in South Africa.',
          avatar_URL: '/images/avatar.png',
          profile_URL: '/author/david-robert-lewis'
        };
      }
      throw error;
    }
  };

  /**
   * Check if a specific API operation is available based on current permissions
   *
   * @param {string} operation - The operation to check ('read', 'write', 'stats', 'posts', 'media')
   * @returns {boolean} Whether the operation is allowed
   *
   * @example
   * ```typescript
   * if (canPerform('stats')) {
   *   // User can access statistics
   *   const stats = await getStats();
   * }
   * ```
   */
  const canPerform = (operation: 'read' | 'write' | 'stats' | 'posts' | 'media') => {
    if (!isAuthenticated) return false;

    switch (operation) {
      case 'read':
      case 'stats':
        return checkPermission('read');
      case 'write':
      case 'posts':
      case 'media':
        return checkPermission('write');
      default:
        return false;
    }
  };

  return {
    // State
    isAuthenticated,
    token,
    
    // Generic API
    makeRequest,
    
    // Specific API methods
    getStats,
    getTopPosts,
    getReferrers,
    getUser,
    
    // Permission checking
    canPerform,
    checkPermission
  };
}