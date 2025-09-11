import { apiCache, searchCache, analyticsCache } from './cache';

/**
 * Production Monitoring and Health Check System
 * Provides comprehensive monitoring, alerting, and health checks for production deployment
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database?: ServiceStatus;
    cache?: ServiceStatus;
    external?: ServiceStatus;
    api?: ServiceStatus;
  };
  metrics: {
    requests: RequestMetrics;
    performance: PerformanceMetrics;
    errors: ErrorMetrics;
  };
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  message?: string;
}

export interface RequestMetrics {
  total: number;
  successful: number;
  failed: number;
  averageResponseTime: number;
  requestsPerMinute: number;
}

export interface PerformanceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  activeConnections: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  topErrors: Array<{
    endpoint: string;
    count: number;
    lastError: string;
  }>;
}

/**
 * Health Check System
 */
export class HealthCheckSystem {
  private startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private errors: Map<string, { count: number; lastError: string; lastTime: string }> = new Map();

  /**
   * Record a request
   */
  recordRequest(endpoint: string, responseTime: number, success: boolean): void {
    this.requestCount++;
    this.responseTimes.push(responseTime);

    if (!success) {
      this.errorCount++;
      const errorKey = endpoint;
      const existing = this.errors.get(errorKey) || { count: 0, lastError: '', lastTime: '' };
      this.errors.set(errorKey, {
        count: existing.count + 1,
        lastError: `Request failed at ${new Date().toISOString()}`,
        lastTime: new Date().toISOString()
      });
    }

    // Keep only last 1000 response times for memory efficiency
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;
    const cacheStats = apiCache.getStats();

    // Check external services
    const externalStatus = await this.checkExternalServices();

    // Calculate metrics
    const totalRequests = this.requestCount;
    const successfulRequests = totalRequests - this.errorCount;
    const averageResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 0;

    const requestsPerMinute = (totalRequests / (uptime / 1000 / 60));

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (externalStatus.status === 'down' || cacheStats.hitRate < 50) {
      overallStatus = 'degraded';
    }

    if (this.errorCount / Math.max(totalRequests, 1) > 0.1) { // >10% error rate
      overallStatus = 'unhealthy';
    }

    // Get top errors
    const topErrors = Array.from(this.errors.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        lastError: data.lastError
      }));

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        cache: {
          status: cacheStats.hitRate > 70 ? 'up' : cacheStats.hitRate > 50 ? 'degraded' : 'down',
          responseTime: 0, // Cache is in-memory
          lastChecked: new Date().toISOString(),
          message: `Cache hit rate: ${(cacheStats.hitRate).toFixed(1)}%`
        },
        external: externalStatus,
        api: {
          status: this.errorCount / Math.max(totalRequests, 1) < 0.05 ? 'up' : 'degraded',
          responseTime: averageResponseTime,
          lastChecked: new Date().toISOString(),
          message: `Error rate: ${((this.errorCount / Math.max(totalRequests, 1)) * 100).toFixed(1)}%`
        }
      },
      metrics: {
        requests: {
          total: totalRequests,
          successful: successfulRequests,
          failed: this.errorCount,
          averageResponseTime,
          requestsPerMinute
        },
        performance: {
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          cpuUsage: 0, // Would need external monitoring
          cacheHitRate: cacheStats.hitRate,
          activeConnections: 0 // Would need connection tracking
        },
        errors: {
          totalErrors: this.errorCount,
          errorRate: (this.errorCount / Math.max(totalRequests, 1)) * 100,
          topErrors
        }
      }
    };
  }

  /**
   * Check external services health
   */
  private async checkExternalServices(): Promise<ServiceStatus> {
    const services = [
      { name: 'WordPress API', url: process.env.WORDPRESS_API_URL },
      { name: 'Google Analytics', url: 'https://www.googleapis.com' }
    ];

    let healthyServices = 0;
    let totalResponseTime = 0;

    for (const service of services) {
      if (!service.url) continue;

      try {
        const startTime = Date.now();
        const response = await fetch(service.url, {
          method: 'HEAD'
        });
        const responseTime = Date.now() - startTime;
        totalResponseTime += responseTime;

        if (response.ok) {
          healthyServices++;
        }
      } catch (error) {
        // Service is down
      }
    }

    const isHealthy = healthyServices === services.length;
    const averageResponseTime = healthyServices > 0 ? totalResponseTime / healthyServices : 0;

    return {
      status: isHealthy ? 'up' : healthyServices > 0 ? 'degraded' : 'down',
      responseTime: averageResponseTime,
      lastChecked: new Date().toISOString(),
      message: `${healthyServices}/${services.length} external services healthy`
    };
  }

  /**
   * Run automated health checks
   */
  async runAutomatedChecks(): Promise<{
    healthStatus: HealthStatus;
    alerts: Alert[];
  }> {
    const healthStatus = await this.getHealthStatus();
    const alerts: Alert[] = [];

    // Check for critical issues
    if (healthStatus.status === 'unhealthy') {
      alerts.push({
        level: 'critical',
        message: 'Service is unhealthy',
        details: `High error rate: ${healthStatus.metrics.errors.errorRate.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    if (healthStatus.services.external?.status === 'down') {
      alerts.push({
        level: 'warning',
        message: 'External services are down',
        details: healthStatus.services.external.message || 'External API dependencies unavailable',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    if (healthStatus.metrics.performance.cacheHitRate < 50) {
      alerts.push({
        level: 'warning',
        message: 'Low cache hit rate',
        details: `Cache hit rate: ${healthStatus.metrics.performance.cacheHitRate.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    return { healthStatus, alerts };
  }
}

/**
 * Alert System
 */
export interface Alert {
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: string;
  timestamp: string;
  resolved?: boolean;
}

export class AlertSystem {
  private alerts: Alert[] = [];
  private alertCallbacks: Array<(alert: Alert) => void> = [];

  /**
   * Create a new alert
   */
  createAlert(level: Alert['level'], message: string, details?: string): void {
    const alert: Alert = {
      level,
      message,
      details,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);

    // Notify callbacks
    this.alertCallbacks.forEach(callback => callback(alert));

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve alert
   */
  resolveAlert(index: number): void {
    if (this.alerts[index]) {
      this.alerts[index].resolved = true;
    }
  }

  /**
   * Get alert summary
   */
  getAlertSummary(): {
    total: number;
    active: number;
    byLevel: Record<string, number>;
  } {
    const active = this.getActiveAlerts();
    const byLevel: Record<string, number> = {};

    active.forEach(alert => {
      byLevel[alert.level] = (byLevel[alert.level] || 0) + 1;
    });

    return {
      total: this.alerts.length,
      active: active.length,
      byLevel
    };
  }
}

/**
 * Performance Monitoring
 */
export class PerformanceMonitor {
  private metrics: Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    lastUpdated: string;
  }> = new Map();

  /**
   * Record performance metric
   */
  recordMetric(name: string, duration: number): void {
    const existing = this.metrics.get(name) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      lastUpdated: new Date().toISOString()
    };

    existing.count++;
    existing.totalTime += duration;
    existing.minTime = Math.min(existing.minTime, duration);
    existing.maxTime = Math.max(existing.maxTime, duration);
    existing.lastUpdated = new Date().toISOString();

    this.metrics.set(name, existing);
  }

  /**
   * Get performance metrics
   */
  getMetrics(): Array<{
    name: string;
    count: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    lastUpdated: string;
  }> {
    return Array.from(this.metrics.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      averageTime: data.totalTime / data.count,
      minTime: data.minTime,
      maxTime: data.maxTime,
      lastUpdated: data.lastUpdated
    }));
  }

  /**
   * Get slow endpoints (>500ms average)
   */
  getSlowEndpoints(): Array<{
    name: string;
    averageTime: number;
    count: number;
  }> {
    return this.getMetrics()
      .filter(metric => metric.averageTime > 500)
      .sort((a, b) => b.averageTime - a.averageTime);
  }
}

// Global instances
export const healthCheckSystem = new HealthCheckSystem();
export const alertSystem = new AlertSystem();
export const performanceMonitor = new PerformanceMonitor();

/**
 * Monitoring middleware
 */
export function withMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const endpoint = request.nextUrl.pathname;

    try {
      const response = await handler(request);
      const responseTime = Date.now() - startTime;

      // Record metrics
      healthCheckSystem.recordRequest(endpoint, responseTime, response.status < 400);
      performanceMonitor.recordMetric(endpoint, responseTime);

      // Check for slow responses
      if (responseTime > 2000) { // 2 seconds
        alertSystem.createAlert(
          'warning',
          `Slow response detected: ${endpoint}`,
          `Response time: ${responseTime}ms`
        );
      }

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Record error
      healthCheckSystem.recordRequest(endpoint, responseTime, false);

      // Create alert for errors
      alertSystem.createAlert(
        'error',
        `API Error: ${endpoint}`,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  };
}

/**
 * Health check endpoint handler
 */
export async function handleHealthCheck(): Promise<NextResponse> {
  try {
    const healthStatus = await healthCheckSystem.getHealthStatus();
    const statusCode = healthStatus.status === 'healthy' ? 200 :
                      healthStatus.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed'
      },
      { status: 503 }
    );
  }
}

/**
 * Metrics endpoint handler
 */
export async function handleMetrics(): Promise<NextResponse> {
  try {
    const healthStatus = await healthCheckSystem.getHealthStatus();
    const performanceMetrics = performanceMonitor.getMetrics();
    const alertSummary = alertSystem.getAlertSummary();

    return NextResponse.json({
      health: healthStatus,
      performance: performanceMetrics,
      alerts: alertSummary,
      cache: {
        api: apiCache.getStats(),
        search: searchCache.getStats(),
        analytics: analyticsCache.getStats()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Metrics collection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}