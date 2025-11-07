import { NextRequest, NextResponse } from 'next/server';
import { withAPIVersioning, getAPIVersion, isVersionSupported, getCurrentVersion, createVersionedResponse } from '@/lib/api-versioning';

/**
 * Main API router with versioning support
 *
 * This route handles API versioning and routes requests to the appropriate
 * version handler. It provides backward compatibility and deprecation warnings.
 */
async function apiRouter(request: NextRequest): Promise<NextResponse> {
  const version = getAPIVersion(request);

  // Handle version information endpoint
  if (request.nextUrl.pathname === '/api/versions' && request.method === 'GET') {
    return NextResponse.json(createVersionedResponse(true, {
      current: getCurrentVersion(),
      supported: [
        {
          version: 'v1',
          status: 'current',
          releaseDate: '2024-01-01',
          description: 'Stable release with JWT auth, rate limiting, and security hardening'
        }
      ],
      deprecated: []
    }, undefined, request));
  }

  // Check if version is supported
  if (!isVersionSupported(version)) {
    return NextResponse.json(createVersionedResponse(false, undefined, {
      code: 'UNSUPPORTED_VERSION',
      message: `API version '${version}' is not supported. Use 'v1' or omit version for current.`,
      details: {
        supportedVersions: ['v1'],
        currentVersion: 'v1',
        migrationGuide: 'https://docs.medialternatives.com/api/migration'
      }
    }, request), { status: 400 });
  }

  // For now, redirect to v1 routes
  // In a full implementation, this would route to different handlers based on version
  const newPath = request.nextUrl.pathname.replace('/api/', `/api/v1/`);
  const newUrl = new URL(newPath, request.url);

  // Copy search params
  newUrl.search = request.nextUrl.search;

  // Create redirect response with version headers
  const response = NextResponse.redirect(newUrl);

  // Add version headers
  response.headers.set('X-API-Version', version);
  response.headers.set('X-API-Current-Version', getCurrentVersion().version);

  return response;
}

// Export with versioning middleware
export const GET = withAPIVersioning(apiRouter);
export const POST = withAPIVersioning(apiRouter);
export const PUT = withAPIVersioning(apiRouter);
export const DELETE = withAPIVersioning(apiRouter);
export const PATCH = withAPIVersioning(apiRouter);
export const OPTIONS = withAPIVersioning(apiRouter);