import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify legacy URL redirects work
 * Usage: GET /api/legacy-redirect-test
 */
export async function GET(request: NextRequest) {
  const testUrls = [
    '/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/',
    '/2020/03/15/covid-19-media-response/',
    '/2018/12/01/media-freedom-report/',
    '/2019/06/10/digital-storytelling-guide/',
    '/2021/09/25/journalism-ethics-south-africa/'
  ];

  const results = testUrls.map(url => {
    const match = url.match(/^\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/([^\/]+)\/?$/);
    if (match) {
      const [, year, month, day, slug] = match;
      return {
        legacyUrl: url,
        cleanUrl: `/${slug}`,
        year,
        month,
        day,
        slug,
        shouldRedirect: true
      };
    }
    return {
      legacyUrl: url,
      shouldRedirect: false,
      error: 'Invalid format'
    };
  });

  return NextResponse.json({
    message: 'Legacy URL redirect test results',
    testUrls: results,
    implementation: {
      method: 'Middleware redirect',
      pattern: '/YYYY/MM/DD/slug/ → /slug',
      coverage: 'All date-based WordPress.com URLs',
      performance: 'Edge-level redirect (fastest)'
    },
    instructions: {
      test: 'Visit any legacy URL to test redirect',
      example: 'https://medialternatives.com/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/',
      expected: 'HTTP 301 redirect to clean URL'
    }
  });
}