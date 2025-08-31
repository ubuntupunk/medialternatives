import { NextRequest, NextResponse } from 'next/server';

/**
 * API Versioning System for Media Alternatives
 * Handles version routing, deprecation warnings, and version compatibility
 */

export interface APIVersion {
  version: string;
  releaseDate: string;
  isCurrent: boolean;
  isDeprecated: boolean;
  deprecationDate?: string;
  sunsetDate?: string;
  changes: string[];
}

/**
 * Supported API versions
 */
export const API_VERSIONS: APIVersion[] = [
  {
    version: 'v1',
    releaseDate: '2024-01-01',
    isCurrent: true,
    isDeprecated: false,
    changes: [
      'Initial stable release',
      'JWT authentication',
      'Rate limiting',
      'Input validation',
      'OAuth security hardening'
    ]
  }
];

/**
 * Get current API version
 */
export function getCurrentVersion(): APIVersion {
  return API_VERSIONS.find(v => v.isCurrent) || API_VERSIONS[0];
}

/**
 * Get API version from request
 */
export function getAPIVersion(request: NextRequest): string {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);

  // Check if path starts with /api/v{version}
  if (pathSegments[0] === 'api' && pathSegments[1]?.startsWith('v')) {
    return pathSegments[1];
  }

  // Default to current version for unversioned /api routes
  return getCurrentVersion().version;
}

/**
 * Check if API version is supported
 */
export function isVersionSupported(version: string): boolean {
  return API_VERSIONS.some(v => v.version === version);
}

/**
 * Get version information
 */
export function getVersionInfo(version: string): APIVersion | null {
  return API_VERSIONS.find(v => v.version === version) || null;
}

/**
 * Check if version is deprecated
 */
export function isVersionDeprecated(version: string): boolean {
  const versionInfo = getVersionInfo(version);
  return versionInfo?.isDeprecated || false;
}

/**
 * Generate deprecation warning headers
 */
export function getDeprecationHeaders(version: string): Record<string, string> {
  const versionInfo = getVersionInfo(version);

  if (!versionInfo?.isDeprecated) {
    return {};
  }

  const headers: Record<string, string> = {
    'X-API-Deprecated': 'true',
    'X-API-Version': version,
    'X-API-Current-Version': getCurrentVersion().version
  };

  if (versionInfo.deprecationDate) {
    headers['X-API-Deprecation-Date'] = versionInfo.deprecationDate;
  }

  if (versionInfo.sunsetDate) {
    headers['X-API-Sunset-Date'] = versionInfo.sunsetDate;
  }

  return headers;
}

/**
 * API Version middleware
 * Handles version routing and deprecation warnings
 */
export function withAPIVersioning(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const version = getAPIVersion(request);

    // Check if version is supported
    if (!isVersionSupported(version)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSUPPORTED_VERSION',
            message: `API version '${version}' is not supported`,
            details: {
              supportedVersions: API_VERSIONS.map(v => v.version),
              currentVersion: getCurrentVersion().version
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            version: getCurrentVersion().version
          }
        },
        { status: 400 }
      );
    }

    // Call the handler
    const response = await handler(request);

    // Add version headers
    response.headers.set('X-API-Version', version);
    response.headers.set('X-API-Current-Version', getCurrentVersion().version);

    // Add deprecation headers if needed
    const deprecationHeaders = getDeprecationHeaders(version);
    Object.entries(deprecationHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Version-aware API response wrapper
 */
export function createVersionedResponse(
  success: boolean,
  data?: any,
  error?: any,
  request?: NextRequest
): any {
  const version = request ? getAPIVersion(request) : getCurrentVersion().version;

  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version
    }
  };
}

/**
 * API Version router
 * Routes requests to appropriate version handlers
 */
export class APIVersionRouter {
  private routes: Map<string, Map<string, (request: NextRequest) => Promise<NextResponse>>> = new Map();

  /**
   * Register a route for a specific version
   */
  register(
    version: string,
    path: string,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): void {
    if (!this.routes.has(version)) {
      this.routes.set(version, new Map());
    }

    this.routes.get(version)!.set(path, handler);
  }

  /**
   * Get handler for version and path
   */
  getHandler(
    version: string,
    path: string
  ): ((request: NextRequest) => Promise<NextResponse>) | null {
    const versionRoutes = this.routes.get(version);
    if (!versionRoutes) return null;

    return versionRoutes.get(path) || null;
  }

  /**
   * Handle versioned request
   */
  async handle(request: NextRequest): Promise<NextResponse> {
    const url = new URL(request.url);
    const version = getAPIVersion(request);

    // Remove version prefix from path for routing
    const pathWithoutVersion = url.pathname.replace(`/api/${version}`, '/api') || '/api';

    const handler = this.getHandler(version, pathWithoutVersion);

    if (!handler) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ROUTE_NOT_FOUND',
            message: `Route not found for version ${version}: ${pathWithoutVersion}`
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            version
          }
        },
        { status: 404 }
      );
    }

    return handler(request);
  }
}

// Global router instance
export const apiRouter = new APIVersionRouter();