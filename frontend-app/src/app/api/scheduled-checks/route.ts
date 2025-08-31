import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, use a database like PostgreSQL, MongoDB, or Redis
let scheduledChecks: any[] = [];
let scheduleSettings: any = null;

/**
 * GET /api/scheduled-checks - Retrieve scheduled checks
 *
 * Returns list of scheduled dead link checks with optional filtering by status.
 * Supports pagination with limit parameter.
 *
 * @param {NextRequest} request - Next.js request with optional query parameters
 * @returns {Promise<NextResponse>} Scheduled checks data or error response
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredChecks = scheduledChecks;

    if (status) {
      filteredChecks = scheduledChecks.filter(check => check.status === status);
    }

    // Sort by timestamp (newest first) and limit
    const sortedChecks = filteredChecks
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      checks: sortedChecks,
      total: filteredChecks.length,
      settings: scheduleSettings
    });

  } catch (error) {
    console.error('Error fetching scheduled checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled checks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scheduled-checks - Create a new scheduled check
 *
 * Creates a new scheduled dead link check with the provided settings.
 * Generates unique ID if not provided and validates required fields.
 *
 * @param {NextRequest} request - Next.js request with scheduled check data
 * @returns {Promise<NextResponse>} Created scheduled check or error response
 */
export async function POST(request: NextRequest) {
  try {
    const checkData = await request.json();

    // Validate required fields
    if (!checkData.settings || !checkData.settings.frequency) {
      return NextResponse.json(
        { error: 'Schedule settings are required' },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    if (!checkData.id) {
      checkData.id = `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Set default values
    const scheduledCheck = {
      ...checkData,
      timestamp: checkData.timestamp || new Date().toISOString(),
      status: checkData.status || 'pending'
    };

    // Add to storage
    scheduledChecks.push(scheduledCheck);

    // Keep only last 100 checks to prevent memory issues
    if (scheduledChecks.length > 100) {
      scheduledChecks = scheduledChecks
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);
    }

    return NextResponse.json(scheduledCheck, { status: 201 });

  } catch (error) {
    console.error('Error creating scheduled check:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled check' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/scheduled-checks - Update schedule settings
 *
 * Updates global schedule settings for automated dead link checking.
 * Validates frequency and time format before saving.
 *
 * @param {NextRequest} request - Next.js request with schedule settings
 * @returns {Promise<NextResponse>} Updated settings or error response
 */
export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();

    // Validate settings
    if (!settings.frequency || !['daily', 'weekly', 'monthly'].includes(settings.frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be daily, weekly, or monthly' },
        { status: 400 }
      );
    }

    if (!settings.time || !/^\d{2}:\d{2}$/.test(settings.time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Must be HH:MM' },
        { status: 400 }
      );
    }

    // Update settings
    scheduleSettings = {
      ...settings,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(scheduleSettings);

  } catch (error) {
    console.error('Error updating schedule settings:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule settings' },
      { status: 500 }
    );
  }
}