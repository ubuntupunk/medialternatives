import { 
  WordPressPost, 
  WordPressCategory, 
  WordPressTag, 
  WordPressUser, 
  WordPressSiteInfo,
  GetPostsParams,
  GetCategoriesParams,
  WordPressAPIError,
  PaginationInfo,
  PaginationResponse,
  APIResponseWithHeaders
} from '@/types/wordpress';
import { 
  WORDPRESS_API_BASE, 
  WORDPRESS_SITE_INFO_API, 
  API_CONFIG 
} from '@/lib/constants';

/**
 * WordPress.com API Service
 *
 * A comprehensive service for interacting with WordPress.com REST API.
 * Provides methods for fetching posts, categories, tags, users, and site information
 * with built-in caching, error handling, and pagination support.
 *
 * @class WordPressAPIService
 * @example
 * ```typescript
 * const api = new WordPressAPIService();
 * const posts = await api.getPosts({ per_page: 10 });
 * ```
 */
class WordPressAPIService {
  private baseUrl: string;
  private siteInfoUrl: string;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.baseUrl = WORDPRESS_API_BASE;
    this.siteInfoUrl = WORDPRESS_SITE_INFO_API;
    this.cache = new Map();
  }

   /**
    * Extract pagination information from response headers
    * @private
    * @param {Headers} headers - Response headers from API call
    * @param {Record<string, any>} params - Request parameters
    * @returns {PaginationInfo} Pagination metadata
    */
   private extractPaginationInfo(headers: Headers, params: Record<string, any>): PaginationInfo {
    const total = parseInt(headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(headers.get('X-WP-TotalPages') || '1', 10);
    const currentPage = parseInt(String(params.page || '1'), 10);
    const perPage = parseInt(String(params.per_page || '10'), 10);
    
    return {
      total,
      totalPages,
      currentPage,
      perPage,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
      prevPage: currentPage > 1 ? currentPage - 1 : undefined
    };
  }

   /**
    * Generic fetch method with error handling, caching, and header extraction
    * @private
    * @template T - Response data type
    * @param {string} endpoint - API endpoint URL
    * @param {Record<string, any>} [params={}] - Query parameters
    * @param {boolean} [useCache=true] - Whether to use caching
    * @returns {Promise<APIResponseWithHeaders<T>>} Response with data and headers
    */
   private async fetchWithHeaders<T>(
     endpoint: string,
     params: Record<string, any> = {},
     useCache: boolean = true
   ): Promise<APIResponseWithHeaders<T>> {
    // Build URL with parameters
    const url = new URL(endpoint);
    const allParams = {
      ...API_CONFIG.DEFAULT_PARAMS,
      ...params
    };
    
    // Convert all values to strings for URLSearchParams
    const stringParams: Record<string, string> = {};
    Object.entries(allParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        stringParams[key] = value.join(',');
      } else {
        stringParams[key] = String(value);
      }
    });
    
    const searchParams = new URLSearchParams(stringParams);
    url.search = searchParams.toString();

    const cacheKey = url.toString();

    // Check cache first (for data only, headers are always fresh)
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const isExpired = Date.now() - cached.timestamp > API_CONFIG.CACHE_TIME;
      
      if (!isExpired) {
        // For cached responses, we don't have real headers, so create mock headers
        // Use realistic values based on cached data length
        const mockHeaders = new Headers();
        const dataLength = Array.isArray(cached.data) ? cached.data.length : 0;
        const perPage = parseInt(String(params.per_page || '10'), 10);
        const currentPage = parseInt(String(params.page || '1'), 10);
        
        // Estimate total based on current page and data length
        // If we got a full page of results, assume there might be more
        const estimatedTotal = dataLength === perPage ? (currentPage * perPage) + 1 : (currentPage - 1) * perPage + dataLength;
        const estimatedTotalPages = Math.ceil(estimatedTotal / perPage);
        
        mockHeaders.set('X-WP-Total', String(estimatedTotal));
        mockHeaders.set('X-WP-TotalPages', String(estimatedTotalPages));
        
        return {
          data: cached.data,
          headers: mockHeaders
        };
      }
    }

    // Fetch with retry logic
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          const errorData: WordPressAPIError = await response.json().catch(() => ({
            code: 'fetch_error',
            message: `HTTP ${response.status}: ${response.statusText}`
          }));
          
          // Log the error for debugging
          console.error('WordPress API Error:', {
            endpoint,
            status: response.status,
            message: errorData.message,
            code: errorData.code
          });
          
          // For authentication errors, provide more helpful message
          if (response.status === 401 || 
              errorData.message?.includes('authentication') || 
              errorData.code === 'rest_not_logged_in') {
            throw new Error(`WordPress.com API requires authentication for this endpoint. The site may not be properly configured yet.`);
          }
          
          throw new Error(`API Error: ${errorData.message}`);
        }

        const data: T = await response.json();
        
        // Cache successful response
        if (useCache) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }

        return {
          data,
          headers: response.headers
        };
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('Unknown API error');
  }

   /**
    * Generic fetch method with error handling and caching
    * @private
    * @template T - Response data type
    * @param {string} endpoint - API endpoint URL
    * @param {Record<string, any>} [params={}] - Query parameters
    * @param {boolean} [useCache=true] - Whether to use caching
    * @returns {Promise<T>} Response data
    */
   private async fetchWithCache<T>(
     endpoint: string,
     params: Record<string, any> = {},
     useCache: boolean = true
   ): Promise<T> {
    // Build URL with parameters
    const url = new URL(endpoint);
    const allParams = {
      ...API_CONFIG.DEFAULT_PARAMS,
      ...params
    };
    
    // Convert all values to strings for URLSearchParams
    const stringParams: Record<string, string> = {};
    Object.entries(allParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        stringParams[key] = value.join(',');
      } else {
        stringParams[key] = String(value);
      }
    });
    
    const searchParams = new URLSearchParams(stringParams);
    url.search = searchParams.toString();

    const cacheKey = url.toString();

    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const isExpired = Date.now() - cached.timestamp > API_CONFIG.CACHE_TIME;
      
      if (!isExpired) {
        return cached.data;
      }
    }

    // Fetch with retry logic
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          const errorData: WordPressAPIError = await response.json().catch(() => ({
            code: 'fetch_error',
            message: `HTTP ${response.status}: ${response.statusText}`
          }));
          
          // Log the error for debugging
          console.error('WordPress API Error:', {
            endpoint,
            status: response.status,
            message: errorData.message,
            code: errorData.code
          });
          
          // For authentication errors, provide more helpful message
          if (response.status === 401 || 
              errorData.message?.includes('authentication') || 
              errorData.code === 'rest_not_logged_in') {
            throw new Error(`WordPress.com API requires authentication for this endpoint. The site may not be properly configured yet.`);
          }
          
          throw new Error(`API Error: ${errorData.message}`);
        }

        const data: T = await response.json();
        
        // Cache successful response
        if (useCache) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('Unknown API error');
  }

   /**
    * Get posts with optional filtering
    * @param {GetPostsParams} [params={}] - Query parameters for filtering posts
    * @returns {Promise<WordPressPost[]>} Array of WordPress posts
    */
   async getPosts(params: GetPostsParams = {}): Promise<WordPressPost[]> {
    const endpoint = `${this.baseUrl}/posts`;
    return this.fetchWithCache<WordPressPost[]>(endpoint, params);
  }

   /**
    * Get a single post by slug
    * @param {string} slug - Post slug
    * @returns {Promise<WordPressPost | null>} Post data or null if not found
    */
   async getPost(slug: string): Promise<WordPressPost | null> {
    try {
      const posts = await this.fetchWithCache<WordPressPost[]>(
        `${this.baseUrl}/posts`,
        { slug, _embed: true }
      );
      return posts.length > 0 ? posts[0] : null;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

   /**
    * Get a post by ID
    * @param {number} id - Post ID
    * @returns {Promise<WordPressPost | null>} Post data or null if not found
    */
   async getPostById(id: number): Promise<WordPressPost | null> {
    try {
      return await this.fetchWithCache<WordPressPost>(
        `${this.baseUrl}/posts/${id}`,
        { _embed: true }
      );
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }
  }

   /**
    * Get categories
    * @param {GetCategoriesParams} [params={}] - Query parameters for filtering categories
    * @returns {Promise<WordPressCategory[]>} Array of WordPress categories
    */
   async getCategories(params: GetCategoriesParams = {}): Promise<WordPressCategory[]> {
    const endpoint = `${this.baseUrl}/categories`;
    const defaultParams = {
      per_page: 100,
      orderby: 'count',
      order: 'desc',
      exclude: [1], // Exclude 'Uncategorized' category (ID 1)
      ...params
    };
    return this.fetchWithCache<WordPressCategory[]>(endpoint, defaultParams);
  }

   /**
    * Get a single category by slug
    * @param {string} slug - Category slug
    * @returns {Promise<WordPressCategory | null>} Category data or null if not found
    */
   async getCategory(slug: string): Promise<WordPressCategory | null> {
    try {
      const categories = await this.fetchWithCache<WordPressCategory[]>(
        `${this.baseUrl}/categories`,
        { slug }
      );
      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

   /**
    * Get tags
    * @param {Record<string, any>} [params={}] - Query parameters for filtering tags
    * @returns {Promise<WordPressTag[]>} Array of WordPress tags
    */
   async getTags(params: Record<string, any> = {}): Promise<WordPressTag[]> {
    const endpoint = `${this.baseUrl}/tags`;
    const defaultParams = {
      per_page: 100,
      orderby: 'count',
      order: 'desc',
      ...params
    };
    return this.fetchWithCache<WordPressTag[]>(endpoint, defaultParams);
  }

   /**
    * Get a single tag by slug
    * @param {string} slug - Tag slug
    * @returns {Promise<WordPressTag | null>} Tag data or null if not found
    */
   async getTag(slug: string): Promise<WordPressTag | null> {
    try {
      const tags = await this.fetchWithCache<WordPressTag[]>(
        `${this.baseUrl}/tags`,
        { slug }
      );
      return tags.length > 0 ? tags[0] : null;
    } catch (error) {
      console.error('Error fetching tag:', error);
      return null;
    }
  }

   /**
    * Get users/authors
    * @param {Record<string, any>} [params={}] - Query parameters for filtering users
    * @returns {Promise<WordPressUser[]>} Array of WordPress users
    */
   async getUsers(params: Record<string, any> = {}): Promise<WordPressUser[]> {
    const endpoint = `${this.baseUrl}/users`;
    return this.fetchWithCache<WordPressUser[]>(endpoint, params);
  }

   /**
    * Get a single user by ID
    * @param {number} id - User ID
    * @returns {Promise<WordPressUser | null>} User data or null if not found
    */
   async getUser(id: number): Promise<WordPressUser | null> {
    try {
      return await this.fetchWithCache<WordPressUser>(
        `${this.baseUrl}/users/${id}`
      );
    } catch (error) {
      console.error('Error fetching user:', error);
      
      // Return fallback author data for known users
      if (id === 1) {
        return {
          id: 1,
          name: 'David Robert Lewis',
          slug: 'david-robert-lewis',
          description: 'Media activist, investigative journalist, and author focused on media alternatives and press freedom in South Africa.',
          avatar_urls: {
            '24': '/images/avatar.jpeg',
            '48': '/images/avatar.jpeg',
            '96': '/images/avatar.jpeg'
          },
          avatar_url: '/images/avatar.jpeg',
          link: '/author/david-robert-lewis',
          url: 'https://medialternatives.com',
          meta: {}
        };
      }
      
      return null;
    }
  }

   /**
    * Get a single user by slug
    * @param {string} slug - User slug
    * @returns {Promise<WordPressUser | null>} User data or null if not found
    */
   async getUserBySlug(slug: string): Promise<WordPressUser | null> {
    try {
      const users = await this.fetchWithCache<WordPressUser[]>(
        `${this.baseUrl}/users`,
        { slug }
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error fetching user by slug:', error);
      return null;
    }
  }

   /**
    * Get site information
    * @returns {Promise<WordPressSiteInfo | null>} Site information or null if error
    */
   async getSiteInfo(): Promise<WordPressSiteInfo | null> {
    try {
      return await this.fetchWithCache<WordPressSiteInfo>(this.siteInfoUrl);
    } catch (error) {
      console.error('Error fetching site info:', error);
      return null;
    }
  }

   /**
    * Search posts
    * @param {string} query - Search query string
    * @param {GetPostsParams} [params={}] - Additional query parameters
    * @returns {Promise<WordPressPost[]>} Array of matching posts
    */
   async searchPosts(query: string, params: GetPostsParams = {}): Promise<WordPressPost[]> {
    const endpoint = `${this.baseUrl}/posts`;
    const searchParams = {
      search: query,
      ...params
    };
    return this.fetchWithCache<WordPressPost[]>(endpoint, searchParams, false); // Don't cache search results
  }

   /**
    * Get posts by category
    * @param {number} categoryId - Category ID
    * @param {GetPostsParams} [params={}] - Additional query parameters
    * @returns {Promise<WordPressPost[]>} Array of posts in the category
    */
   async getPostsByCategory(categoryId: number, params: GetPostsParams = {}): Promise<WordPressPost[]> {
    const endpoint = `${this.baseUrl}/posts`;
    const categoryParams = {
      categories: [categoryId],
      ...params
    };
    return this.fetchWithCache<WordPressPost[]>(endpoint, categoryParams);
  }

   /**
    * Get posts by author
    * @param {number} authorId - Author ID
    * @param {GetPostsParams} [params={}] - Additional query parameters
    * @returns {Promise<WordPressPost[]>} Array of posts by the author
    */
   async getPostsByAuthor(authorId: number, params: GetPostsParams = {}): Promise<WordPressPost[]> {
    const endpoint = `${this.baseUrl}/posts`;
    const authorParams = {
      author: authorId,
      ...params
    };
    return this.fetchWithCache<WordPressPost[]>(endpoint, authorParams);
  }

   /**
    * Get posts by tag
    * @param {number} tagId - Tag ID
    * @param {GetPostsParams} [params={}] - Additional query parameters
    * @returns {Promise<WordPressPost[]>} Array of posts with the tag
    */
   async getPostsByTag(tagId: number, params: GetPostsParams = {}): Promise<WordPressPost[]> {
    const endpoint = `${this.baseUrl}/posts`;
    const tagParams = {
      tags: [tagId],
      ...params
    };
    return this.fetchWithCache<WordPressPost[]>(endpoint, tagParams);
  }

  // ========================================
  // PAGINATION-AWARE METHODS
  // ========================================

   /**
    * Get posts with pagination information
    * @param {GetPostsParams} [params={}] - Query parameters for filtering posts
    * @returns {Promise<PaginationResponse<WordPressPost[]>>} Posts with pagination metadata
    */
   async getPostsWithPagination(params: GetPostsParams = {}): Promise<PaginationResponse<WordPressPost[]>> {
    const endpoint = `${this.baseUrl}/posts`;
    try {
      const { data, headers } = await this.fetchWithHeaders<WordPressPost[]>(endpoint, params);
      const pagination = this.extractPaginationInfo(headers, params);
      
      return {
        data,
        pagination
      };
    } catch (error) {
      console.error('Error fetching posts with pagination:', error);
      
      // Fallback with mock pagination data
      const posts = await this.getPosts(params);
      const perPage = parseInt(String(params.per_page || '10'), 10);
      const currentPage = parseInt(String(params.page || '1'), 10);
      
      // If we got a full page of results, assume there might be more
      const estimatedTotal = posts.length === perPage ? (currentPage * perPage) + 1 : (currentPage - 1) * perPage + posts.length;
      const estimatedTotalPages = Math.ceil(estimatedTotal / perPage);
      
      return {
        data: posts,
        pagination: {
          total: estimatedTotal,
          totalPages: estimatedTotalPages,
          currentPage,
          perPage,
          hasNext: currentPage < estimatedTotalPages,
          hasPrev: currentPage > 1,
          nextPage: currentPage < estimatedTotalPages ? currentPage + 1 : undefined,
          prevPage: currentPage > 1 ? currentPage - 1 : undefined
        }
      };
    }
  }

   /**
    * Get posts by category with pagination information
    * @param {number} categoryId - Category ID
    * @param {GetPostsParams} [params={}] - Additional query parameters
    * @returns {Promise<PaginationResponse<WordPressPost[]>>} Posts with pagination metadata
    */
   async getPostsByCategoryWithPagination(categoryId: number, params: GetPostsParams = {}): Promise<PaginationResponse<WordPressPost[]>> {
    const endpoint = `${this.baseUrl}/posts`;
    const categoryParams = {
      categories: [categoryId],
      ...params
    };
    
    try {
      const { data, headers } = await this.fetchWithHeaders<WordPressPost[]>(endpoint, categoryParams);
      const pagination = this.extractPaginationInfo(headers, categoryParams);
      
      return {
        data,
        pagination
      };
    } catch (error) {
      console.error('Error fetching posts by category with pagination:', error);
      
      // Fallback with mock pagination data
      const posts = await this.getPostsByCategory(categoryId, params);
      return {
        data: posts,
        pagination: {
          total: posts.length,
          totalPages: 1,
          currentPage: parseInt(String(params.page || '1'), 10),
          perPage: parseInt(String(params.per_page || '10'), 10),
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

   /**
    * Search posts with pagination information
    * @param {string} query - Search query string
    * @param {GetPostsParams} [params={}] - Additional query parameters
    * @returns {Promise<PaginationResponse<WordPressPost[]>>} Search results with pagination metadata
    */
   async searchPostsWithPagination(query: string, params: GetPostsParams = {}): Promise<PaginationResponse<WordPressPost[]>> {
    const endpoint = `${this.baseUrl}/posts`;
    const searchParams = {
      search: query,
      ...params
    };
    
    try {
      const { data, headers } = await this.fetchWithHeaders<WordPressPost[]>(endpoint, searchParams, false); // Don't cache search results
      const pagination = this.extractPaginationInfo(headers, searchParams);
      
      return {
        data,
        pagination
      };
    } catch (error) {
      console.error('Error searching posts with pagination:', error);
      
      // Fallback with mock pagination data
      const posts = await this.searchPosts(query, params);
      return {
        data: posts,
        pagination: {
          total: posts.length,
          totalPages: 1,
          currentPage: parseInt(String(params.page || '1'), 10),
          perPage: parseInt(String(params.per_page || '10'), 10),
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

   /**
    * Get posts by author with pagination information
    * @param {number} authorId - Author ID
    * @param {GetPostsParams} [params={}] - Additional query parameters
    * @returns {Promise<PaginationResponse<WordPressPost[]>>} Posts with pagination metadata
    */
   async getPostsByAuthorWithPagination(authorId: number, params: GetPostsParams = {}): Promise<PaginationResponse<WordPressPost[]>> {
    const endpoint = `${this.baseUrl}/posts`;
    const authorParams = {
      author: authorId,
      ...params
    };
    
    try {
      const { data, headers } = await this.fetchWithHeaders<WordPressPost[]>(endpoint, authorParams);
      const pagination = this.extractPaginationInfo(headers, authorParams);
      
      return {
        data,
        pagination
      };
    } catch (error) {
      console.error('Error fetching posts by author with pagination:', error);
      
      // Fallback with mock pagination data
      const posts = await this.getPostsByAuthor(authorId, params);
      return {
        data: posts,
        pagination: {
          total: posts.length,
          totalPages: 1,
          currentPage: parseInt(String(params.page || '1'), 10),
          perPage: parseInt(String(params.per_page || '10'), 10),
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

   /**
    * Get posts by tag with pagination information
    * @param {number} tagId - Tag ID
    * @param {GetPostsParams} [params={}] - Additional query parameters
    * @returns {Promise<PaginationResponse<WordPressPost[]>>} Posts with pagination metadata
    */
   async getPostsByTagWithPagination(tagId: number, params: GetPostsParams = {}): Promise<PaginationResponse<WordPressPost[]>> {
    const endpoint = `${this.baseUrl}/posts`;
    const tagParams = {
      tags: [tagId],
      ...params
    };
    
    try {
      const { data, headers } = await this.fetchWithHeaders<WordPressPost[]>(endpoint, tagParams);
      const pagination = this.extractPaginationInfo(headers, tagParams);
      
      return {
        data,
        pagination
      };
    } catch (error) {
      console.error('Error fetching posts by tag with pagination:', error);
      
      // Fallback with mock pagination data
      const posts = await this.getPostsByTag(tagId, params);
      return {
        data: posts,
        pagination: {
          total: posts.length,
          totalPages: 1,
          currentPage: parseInt(String(params.page || '1'), 10),
          perPage: parseInt(String(params.per_page || '10'), 10),
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

   /**
    * Clear cache (useful for development or forced refresh)
    * @returns {void}
    */
   clearCache(): void {
    this.cache.clear();
  }

   /**
    * Get cache statistics
    * @returns {{size: number, keys: string[]}} Cache statistics
    */
   getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const wordpressApi = new WordPressAPIService();

// Export class for testing or multiple instances
export { WordPressAPIService };
