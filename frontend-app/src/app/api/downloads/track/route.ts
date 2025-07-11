import { NextRequest, NextResponse } from 'next/server';

interface DownloadTrackingData {
  filename: string;
  fileid: string;
  category: string;
  timestamp: string;
}

// Simple in-memory storage for download tracking
// In production, you'd want to use a database
const downloadStats = new Map<string, {
  count: number;
  lastDownload: string;
  firstDownload: string;
}>();

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

export async function GET() {
  try {
    // Return download statistics
    const stats = Array.from(downloadStats.entries()).map(([fileid, data]) => ({
      fileid,
      ...data
    }));
    
    const totalDownloads = Array.from(downloadStats.values())
      .reduce((sum, stat) => sum + stat.count, 0);
    
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