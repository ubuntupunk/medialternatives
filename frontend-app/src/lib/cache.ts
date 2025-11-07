import { NextRequest, NextResponse } from 'next/server';

/**
 * API Caching System
 * Provides intelligent caching for API responses to improve performance
 */

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  strategy: 'lru' | 'lfu' | 'fifo'; // Cache eviction strategy
}

/**
 * In-memory cache implementation
 * In production, this should be replaced with Redis or similar
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 300, // 5 minutes default
      maxSize: 1000, // 1000 entries default
      strategy: 'lru', // Least Recently Used default
      ...config
    };

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get cached data
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + (entry.ttl * 1000)) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  /**
   * Set cached data
  */
  set(key: string, data: any, ttl?: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      hits: 0,
      lastAccessed: Date.now()
    };

    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, entry);
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  } {
    let totalHits = 0;
    let totalRequests = 0;

    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      totalRequests += entry.hits + 1; // +1 for the initial set
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      totalHits,
      totalMisses: totalRequests - totalHits
    };
  }

  /**
   * Evict entries based on strategy
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | null = null;

    switch (this.config.strategy) {
      case 'lru': // Least Recently Used
        let oldestAccess = Date.now();
        for (const [key, entry] of this.cache.entries()) {
          if (entry.lastAccessed < oldestAccess) {
            oldestAccess = entry.lastAccessed;
            keyToEvict = key;
          }
        }
        break;

      case 'lfu': // Least Frequently Used
        let leastHits = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          if (entry.hits < leastHits) {
            leastHits = entry.hits;
            keyToEvict = key;
          }
        }
        break;

      case 'fifo': // First In, First Out
        let oldestTimestamp = Date.now();
        for (const [key, entry] of this.cache.entries()) {
          if (entry.timestamp < oldestTimestamp) {
            oldestTimestamp = entry.timestamp;
            keyToEvict = key;
          }
        }
        break;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + (entry.ttl * 1000)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instances for different use cases
export const apiCache = new MemoryCache({ ttl: 300, maxSize: 500 }); // 5 min TTL for API responses
export const searchCache = new MemoryCache({ ttl: 600, maxSize: 200 }); // 10 min TTL for search results
export const analyticsCache = new MemoryCache({ ttl: 1800, maxSize: 100 }); // 30 min TTL for analytics

/**
 * Generate cache key from request
 */
export function generateCacheKey(request: NextRequest, additionalData?: any): string {
  const url = new URL(request.url);
  const keyParts = [
    request.method,
    url.pathname,
    url.search,
    request.headers.get('authorization') || '',
    JSON.stringify(additionalData || {})
  ];

  return keyParts.join('|');
}

/**
 * Cache middleware for API routes
 */
export function withCache(
  handler: (request: NextRequest) => Promise<NextResponse>,
  cacheInstance = apiCache,
  options: {
    ttl?: number;
    cacheKey?: (request: NextRequest) => string;
    shouldCache?: (request: NextRequest, response: NextResponse) => boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const {
      ttl,
      cacheKey = (req) => generateCacheKey(req),
      shouldCache = (req, res) => res.status === 200
    } = options;

    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler(request);
    }

    const key = cacheKey(request);
    const cachedData = cacheInstance.get(key);

    if (cachedData) {
      // Return cached response
      const cachedResponse = NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Timestamp': new Date().toISOString()
        }
      });
      return cachedResponse;
    }

    // Execute handler
    const response = await handler(request);

    // Cache successful responses
    if (shouldCache(request, response)) {
      try {
        const responseData = await response.json();

        // Clone the response for caching
        const responseClone = NextResponse.json(responseData, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'X-Cache': 'MISS'
          }
        });

        cacheInstance.set(key, responseData, ttl);
        return responseClone;
      } catch (error) {
        // If we can't parse the response, just return it without caching
        return response;
      }
    }

    // Add cache miss header
    const responseClone = new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-Cache': 'MISS'
      }
    });

    return responseClone as NextResponse;
  };
}

/**
 * Cache warming utility
 */
export class CacheWarmer {
  private baseURL: string;
  private endpoints: string[];

  constructor(baseURL: string, endpoints: string[]) {
    this.baseURL = baseURL;
    this.endpoints = endpoints;
  }

  /**
   * Warm up cache by pre-fetching endpoints
   */
  async warmCache(): Promise<{
    successful: number;
    failed: number;
    duration: number;
  }> {
    const startTime = Date.now();
    let successful = 0;
    let failed = 0;

    const promises = this.endpoints.map(async (endpoint) => {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`);
        if (response.ok) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    });

    await Promise.all(promises);

    return {
      successful,
      failed,
      duration: Date.now() - startTime
    };
  }

  /**
   * Add endpoint to warming list
   */
  addEndpoint(endpoint: string): void {
    if (!this.endpoints.includes(endpoint)) {
      this.endpoints.push(endpoint);
    }
  }

  /**
   * Remove endpoint from warming list
   */
  removeEndpoint(endpoint: string): void {
    const index = this.endpoints.indexOf(endpoint);
    if (index > -1) {
      this.endpoints.splice(index, 1);
    }
  }
}

// Global cache warmer instance
export const cacheWarmer = new CacheWarmer(
  process.env.NODE_ENV === 'production'
    ? 'https://medialternatives.com'
    : 'http://localhost:3000',
  [
    '/api/search?q=test',
    '/api/analytics',
    '/api/versions'
  ]
);