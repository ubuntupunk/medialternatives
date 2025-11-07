import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Standard API Response interface
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

/**
 * Create standardized API response
 */
export function createAPIResponse<T>(
  success: boolean,
  data?: T,
  error?: APIResponse['error'],
  meta?: APIResponse['meta']
): APIResponse<T> {
  const response: APIResponse<T> = { success };

  if (data !== undefined) {
    response.data = data;
  }

  if (error) {
    response.error = error;
  }

  if (meta) {
    response.meta = meta;
  } else {
    // Add default metadata
    response.meta = {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0'
    };
  }

  return response;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validation schemas
 */
export const schemas = {
  // Authentication schemas
  login: z.object({
    password: z.string().min(1, 'Password is required')
  }),

  // Search schemas
  search: z.object({
    q: z.string().min(2, 'Query must be at least 2 characters'),
    per_page: z.string().optional().transform(val => {
      const num = parseInt(val || '10');
      return Math.min(Math.max(num, 1), 100); // Between 1 and 100
    })
  }),

  // Analytics schemas
  analytics: z.object({
    period: z.enum(['7d', '30d', '90d', '1y']).optional().default('7d')
  }),

  // Generic ID parameter
  id: z.object({
    id: z.string().min(1, 'ID is required')
  }),

  // File upload schemas
  fileUpload: z.object({
    file: z.any().refine(
      (file) => file && file.size <= 5 * 1024 * 1024, // 5MB limit
      'File size must be less than 5MB'
    ).refine(
      (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return allowedTypes.includes(file?.type);
      },
      'File must be a valid image (JPEG, PNG, GIF, WebP)'
    )
  })
};

/**
 * Validate request data against schema
 */
export function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string; details: any } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      error: 'Unknown validation error',
      details: error
    };
  }
}

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validation = validateData(body, schema);

    if (!validation.success) {
      const errorResponse = createAPIResponse(false, undefined, {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: validation.details
      });

      return {
        success: false,
        response: NextResponse.json(errorResponse, { status: 400 })
      };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    const errorResponse = createAPIResponse(false, undefined, {
      code: 'INVALID_JSON',
      message: 'Invalid JSON in request body',
      details: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      response: NextResponse.json(errorResponse, { status: 400 })
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    // Convert search params to object
    const queryData: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      queryData[key] = value;
    }

    const validation = validateData(queryData, schema);

    if (!validation.success) {
      const errorResponse = createAPIResponse(false, undefined, {
        code: 'VALIDATION_ERROR',
        message: 'Query parameter validation failed',
        details: validation.details
      });

      return {
        success: false,
        response: NextResponse.json(errorResponse, { status: 400 })
      };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    const errorResponse = createAPIResponse(false, undefined, {
      code: 'VALIDATION_ERROR',
      message: 'Query parameter validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      response: NextResponse.json(errorResponse, { status: 400 })
    };
  }
}



/**
 * Sanitize input string (basic XSS protection)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Rate limiting helper (basic implementation)
 * In production, use a proper rate limiting library
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
    private maxRequests: number = 100
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => time > windowStart);

    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();