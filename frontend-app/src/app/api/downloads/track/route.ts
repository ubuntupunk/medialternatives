import { NextRequest, NextResponse } from 'next/server';

/**
 * Download tracking data interface
 * @interface DownloadTrackingData
 * @property {string} filename - Name of the downloaded file
 * @property {string} fileid - Unique identifier for the file
 * @property {string} category - Category of the download
 * @property {string} timestamp - ISO timestamp of the download
 */
interface DownloadTrackingData {
  filename: string;
  fileid: string;
  category: string;
  timestamp: string;
}

/**
 * Download statistics interface
 * @interface DownloadStats
 * @property {number} count - Number of downloads
 * @property {string} lastDownload - Timestamp of last download
 * @property {string} firstDownload - Timestamp of first download
 */
interface DownloadStats {
  count: number;
  lastDownload: string;
  firstDownload: string;
}

// In-memory storage for download statistics
// In production, this should be replaced with a database
const downloadStats = new Map<string, DownloadStats>();

/**
 * POST /api/downloads/track - Track file download
 *
 * Records download events for analytics and monitoring.
 * Updates download statistics for each file.
 *
 * @param {NextRequest} request - Next.js request with download tracking data
 * @returns {Promise<NextResponse>} Tracking confirmation or error response
 */
export async function POST(request: NextRequest) {
  try {
    const data: DownloadTrackingData = await request.json();
    
    // Validate required fields
    if (!data.filename || !data.fileid || !data.category || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Update download statistics
    const key = data.fileid;
    const existing = downloadStats.get(key);
    
    if (existing) {
      downloadStats.set(key, {
        count: existing.count + 1,
        lastDownload: data.timestamp,
        firstDownload: existing.firstDownload
      });
    } else {
      downloadStats.set(key, {
        count: 1,
        lastDownload: data.timestamp,
        firstDownload: data.timestamp
      });
    }
    
    // Log download for monitoring
    console.log(`📥 Download tracked: ${data.filename} (${data.category}) - Total: ${downloadStats.get(key)?.count}`);
    
    return NextResponse.json({
      success: true,
      stats: downloadStats.get(key)
    });
    
  } catch (error) {
    console.error('Download tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/downloads/track - Get download statistics
 *
 * Returns aggregated download statistics for all tracked files.
 * Includes total downloads, file counts, and individual file stats.
 *
 * @returns {Promise<NextResponse>} Download statistics or error response
 */
export async function GET() {
  try {
    // Return download statistics
    const stats = Array.from(downloadStats.entries()).map(([fileid, data]: [string, DownloadStats]) => ({
      fileid,
      ...data
    }));

    const totalDownloads = Array.from(downloadStats.values())
      .reduce((sum: number, stat: DownloadStats) => sum + stat.count, 0);
    
    return NextResponse.json({
      totalFiles: downloadStats.size,
      totalDownloads,
      files: stats
    });
    
  } catch (error) {
    console.error('Download stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get download stats' },
      { status: 500 }
    );
  }
}