import { handleMetrics } from '@/lib/monitoring';

/**
 * GET /api/metrics - Detailed metrics endpoint
 *
 * Provides comprehensive metrics for monitoring and observability.
 * Includes health status, performance metrics, cache statistics, and alerts.
 *
 * @returns {NextResponse} Detailed metrics data
 */
export async function GET() {
  return handleMetrics();
}