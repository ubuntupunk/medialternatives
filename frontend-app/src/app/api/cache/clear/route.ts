import { NextRequest, NextResponse } from 'next/server';
import { wordpressApi } from '@/services/wordpress-api';

/**
 * API endpoint to clear application cache
 * Usage: POST /api/cache/clear
 * Optional: ?password=your_admin_password for security
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    
    // Optional password protection
    if (process.env.ADMIN_PASSWORD && password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Clear the WordPress API cache
    const statsBefore = wordpressApi.getCacheStats();
    wordpressApi.clearCache();
    const statsAfter = wordpressApi.getCacheStats();

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      stats: {
        before: statsBefore,
        after: statsAfter,
        cleared: statsBefore.size
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = wordpressApi.getCacheStats();
    
    return NextResponse.json({
      cacheStats: stats,
      cacheTime: '5 minutes',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}