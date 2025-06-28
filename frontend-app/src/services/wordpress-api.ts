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
        const mockHeaders = new Headers();
        mockHeaders.set('X-WP-Total', '0');
        mockHeaders.set('X-WP-TotalPages', '1');
        
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
   */
  async getPosts(params: GetPostsParams = {}): Promise<WordPressPost[]> {
    const endpoint = `${this.baseUrl}/posts`;
    return this.fetchWithCache<WordPressPost[]>(endpoint, params);
  }

  /**
   * Get a single post by slug
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
   */
  async getUsers(params: Record<string, any> = {}): Promise<WordPressUser[]> {
    const endpoint = `${this.baseUrl}/users`;
    return this.fetchWithCache<WordPressUser[]>(endpoint, params);
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: number): Promise<WordPressUser | null> {
    try {
      return await this.fetchWithCache<WordPressUser>(
        `${this.baseUrl}/users/${id}`
      );
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Get site information
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
   * Get posts by category with pagination information
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
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
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
