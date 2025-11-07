import { NextResponse } from 'next/server';
import { getOpenAPISpec } from '@/lib/openapi';

/**
 * GET /api/docs - OpenAPI specification endpoint
 *
 * Returns the OpenAPI 3.1.0 specification for the Media Alternatives API
 *
 * @returns {NextResponse} OpenAPI specification JSON
 */
export async function GET() {
  try {
    const spec = getOpenAPISpec();

    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('OpenAPI spec generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate OpenAPI specification' },
      { status: 500 }
    );
  }
}