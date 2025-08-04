import { useWordPressAuth } from '@/contexts/WordPressAuthContext';
import { makeAuthenticatedRequest, WORDPRESS_API_ENDPOINTS } from '@/utils/wordpressImplicitAuth';

/**
 * Hook for making authenticated WordPress.com API calls
 * Automatically handles authentication state and provides fallbacks
 */
export function useAuthenticatedAPI() {
  const { isAuthenticated, token, checkPermission } = useWordPressAuth();

  /**
   * Make an authenticated request to WordPress.com API
   */
  const makeRequest = async (endpoint: string, options?: RequestInit) => {
    if (!isAuthenticated || !token) {
      throw new Error('Not authenticated with WordPress.com');
    }

    return makeAuthenticatedRequest(endpoint, options);
  };

  /**
   * Get site statistics (requires read permission)
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
   * Check if a specific API operation is available
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