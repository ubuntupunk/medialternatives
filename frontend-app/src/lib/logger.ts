/**
 * Simple API logging utility for Media Alternatives
 * Provides structured logging for API requests and responses
 */

export interface APILogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  responseTime: number;
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log API request
 */
export function logAPIRequest(entry: Omit<APILogEntry, 'timestamp'>): void {
  const logEntry: APILogEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Request]', {
      method: logEntry.method,
      path: logEntry.path,
      statusCode: logEntry.statusCode,
      responseTime: logEntry.responseTime,
      userId: logEntry.userId,
      ip: logEntry.ip
    });
  }

  // In production, you would send to a logging service
  // TODO: Implement production logging (Winston, DataDog, etc.)
}

/**
 * Log API error
 */
export function logAPIError(
  method: string,
  path: string,
  error: Error,
  requestId: string,
  userId?: string
): void {
  const logEntry: APILogEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method,
    path,
    userId,
    ip: 'unknown', // Would be populated by middleware
    userAgent: 'unknown', // Would be populated by middleware
    statusCode: 500,
    responseTime: 0,
    error: {
      message: error.message,
      stack: error.stack
    }
  };

  console.error('[API Error]', logEntry);
}

/**
 * Middleware to log API requests
 * This would be used in a custom Next.js middleware or API route wrapper
 */
export function createAPILogger() {
  return {
    logRequest: logAPIRequest,
    logError: logAPIError,
    generateRequestId
  };
}

// Export singleton instance
export const apiLogger = createAPILogger();