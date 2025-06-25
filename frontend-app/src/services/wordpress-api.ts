import { 
  WordPressPost, 
  WordPressCategory, 
  WordPressTag, 
  WordPressUser, 
  WordPressSiteInfo,
  GetPostsParams,
  GetCategoriesParams,
  WordPressAPIError 
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