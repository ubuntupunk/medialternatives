import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate limit store entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limit store
 * In production, this should be replaced with Redis or another persistent store
 */
class MemoryStore {
  private store = new Map<string, RateLimitEntry>();

  /**
   * Get rate limit entry for a key
   */
  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // Check if the entry has expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }

    return entry;
  }

  /**
   * Set rate limit entry for a key
   */
  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  /**
   * Increment rate limit count for a key
   */
  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const resetTime = now + windowMs;
    const existing = this.get(key);

    if (existing) {
      existing.count += 1;
      this.set(key, existing);
      return existing;
    }

    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime
    };
    this.set(key, newEntry);
    return newEntry;
  }

  /**
   * Clean up expired entries (optional maintenance)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Global store instance
const store = new MemoryStore();

// Clean up expired entries every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

/**
 * Default rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
    statusCode: 429
  },

  // Moderate limits for general API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests. Please try again later.',
    statusCode: 429
  },

  // Generous limits for search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    message: 'Search rate limit exceeded. Please wait before searching again.',
    statusCode: 429
  },

  // Strict limits for file uploads
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
    message: 'Upload rate limit exceeded. Please try again later.',
    statusCode: 429
  }
};

/**
 * Create rate limit middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // Get client identifier (IP address)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     request.headers.get('x-client-ip') ||
                     'unknown';

    // Skip rate limiting for health checks or specific paths
    if (request.nextUrl.pathname === '/api/health' ||
        request.nextUrl.pathname.startsWith('/api/docs')) {
      return null;
    }

    const key = `${clientIP}:${request.method}:${request.nextUrl.pathname}`;
    const entry = store.increment(key, config.windowMs);

    // Set rate limit headers
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetTime = Math.ceil((entry.resetTime - Date.now()) / 1000); // seconds

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: config.message || 'Rate limit exceeded',
            details: {
              limit: config.maxRequests,
              remaining: 0,
              resetIn: resetTime,
              resetAt: new Date(entry.resetTime).toISOString()
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            version: '1.0.0'
          }
        },
        {
          status: config.statusCode || 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': resetTime.toString()
          }
        }
      );

      return response;
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

    return null; // Continue to next middleware/route
  };
}

/**
 * Apply rate limiting to a response
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  config: RateLimitConfig,
  currentCount: number
): NextResponse {
  const remaining = Math.max(0, config.maxRequests - currentCount);
  const resetTime = Date.now() + config.windowMs;

  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());

  return response;
}

/**
 * Get rate limit status for a key
 */
export function getRateLimitStatus(key: string, config: RateLimitConfig) {
  const entry = store.get(key);
  if (!entry) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs
    };
  }

  return {
    count: entry.count,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime
  };
}