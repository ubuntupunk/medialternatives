import { handleHealthCheck } from '@/lib/monitoring';

/**
 * GET /api/health - Health check endpoint
 *
 * Provides comprehensive health status for the API service.
 * Used by load balancers, monitoring systems, and deployment pipelines.
 *
 * @returns {NextResponse} Health status with HTTP status codes:
 *   - 200: Service is healthy
 *   - 503: Service is unhealthy
 */
export async function GET() {
  return handleHealthCheck();
}