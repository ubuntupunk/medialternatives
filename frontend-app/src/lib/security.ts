import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers middleware for API responses
 * Implements OWASP security headers and best practices
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-API-Version': '1.0.0'
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * CORS configuration for API routes
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS || 'https://medialternatives.com'
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400' // 24 hours
};

/**
 * Handle CORS preflight requests
 */
export function handleCors(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
  return null;
}

/**
 * Validate request origin for security
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://medialternatives.com', 'https://www.medialternatives.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  if (!origin) return true; // Allow requests without origin (server-to-server)

  return allowedOrigins.includes(origin);
}

/**
 * Basic security middleware wrapper
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle CORS
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    // Validate origin
    if (!validateOrigin(request)) {
      const response = NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403 }
      );
      return applySecurityHeaders(response);
    }

    // Call the actual handler
    const response = await handler(request);

    // Apply security headers
    return applySecurityHeaders(response);
  };
}