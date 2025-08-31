import { NextResponse } from 'next/server';

/**
 * GET /api/test-redirects - Test redirect functionality
 *
 * Returns test configuration for verifying URL redirects.
 * Provides test URLs and expected redirect behavior.
 *
 * @returns {Promise<NextResponse>} Test configuration and instructions
 */
export async function GET() {
  const testUrls = [
    // Clean URLs (should work directly)
    { url: '/south-africas-trade-pivot', shouldRedirect: false, expectedTarget: 'Clean URL - works directly' },
    { url: '/media-activism-guide', shouldRedirect: false, expectedTarget: 'Clean URL - works directly' },
    { url: '/digital-storytelling', shouldRedirect: false, expectedTarget: 'Clean URL - works directly' },
    
    // Should NOT redirect
    { url: '/blog', shouldRedirect: false, expectedTarget: null },
    { url: '/about', shouldRedirect: false, expectedTarget: null },
    { url: '/category/activism', shouldRedirect: false, expectedTarget: null },
    { url: '/post/existing-post', shouldRedirect: false, expectedTarget: null },
    { url: '/api/posts', shouldRedirect: false, expectedTarget: null },
    { url: '/page/2', shouldRedirect: false, expectedTarget: null },
  ];

  return NextResponse.json({
    message: 'Redirect test configuration',
    testUrls,
    instructions: {
      manual: 'Test redirects manually with: curl -I "https://your-domain.com/south-africas-trade-pivot"',
      expected: 'Should return HTTP 301 with Location header pointing to /post/south-africas-trade-pivot',
      automation: 'Use this endpoint data to create automated tests'
    },
    middleware: {
      location: 'src/middleware.ts',
      pattern: 'Redirects /:slug to /post/:slug for valid post slugs',
      exclusions: [
        'Known pages (/, /blog, /about, etc.)',
        'Category/tag/author pages',
        'API routes',
        'Static files',
        'Already /post/ URLs'
      ]
    }
  });
}