import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { wordpressApi } from '@/services/wordpress-api';
import { checkMultiplePostsLinks } from '@/utils/deadLinkChecker';
import { LinkCheckResult } from '@/utils/deadLinkChecker';

interface DeadLinkScheduleSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek: number;
  postsToCheck: number;
  nextRun?: string;
}

interface ScheduledCheckResult {
  id: string;
  timestamp: string;
  status: 'completed' | 'failed';
  source: 'cron';
  settings?: DeadLinkScheduleSettings;
  results?: {
    type: string;
    postsChecked: number;
    result: LinkCheckResult;
    summary: {
      totalPosts: number;
      totalLinks: number;
      deadLinks: number;
      workingLinks: number;
      processingTimeMs: number;
    };
  };
  error?: string;
}

/**
 * GET /api/cron/dead-links - Execute scheduled dead link check
 *
 * Cron job endpoint for automated dead link checking.
 * Can be called by Vercel Cron Jobs, GitHub Actions, or external cron services.
 * Requires authorization header for security.
 *

 * @returns {Promise<NextResponse>} Check results or error response
 */
export async function GET() {
  try {
    // Security check - verify cron authorization
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled dead link check...');

    // Get schedule settings (in production, load from database)
    const scheduleSettings = getStoredScheduleSettings();
    
    if (!scheduleSettings.enabled) {
      return NextResponse.json({
        message: 'Scheduled checks are disabled',
        timestamp: new Date().toISOString()
      });
    }

    // Check if it's time to run
    if (!shouldRunNow(scheduleSettings)) {
      return NextResponse.json({
        message: 'Not scheduled to run at this time',
        nextRun: scheduleSettings.nextRun,
        timestamp: new Date().toISOString()
      });
    }

    // Execute the check
    const postsToCheck = scheduleSettings.postsToCheck || 10;
    const posts = await wordpressApi.getPosts({ per_page: Math.min(postsToCheck, 20) });

    if (posts.length === 0) {
      return NextResponse.json({
        error: 'No posts found to check',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    const result = await checkMultiplePostsLinks(posts);

    // Create scheduled check record
    const scheduledCheck: ScheduledCheckResult = {
      id: `cron_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      source: 'cron',
      settings: scheduleSettings,
      results: {
        type: 'scheduled_check',
        postsChecked: posts.length,
        result,
        summary: {
          totalPosts: posts.length,
          totalLinks: result.totalLinks,
          deadLinks: result.deadLinks.length,
          workingLinks: result.workingLinks,
          processingTimeMs: result.processingTime
        }
      }
    };

    // Store the check result (in production, save to database)
    await storeScheduledCheck(scheduledCheck);

    // Send notifications if dead links found
    if (result.deadLinks.length > 0) {
      await sendCronNotifications(scheduledCheck);
    }

    // Update next run time
    await updateNextRunTime(scheduleSettings);

    return NextResponse.json({
      success: true,
      message: `Scheduled check completed. Found ${result.deadLinks.length} dead links in ${posts.length} posts.`,
      checkId: scheduledCheck.id,
      summary: scheduledCheck.results?.summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in scheduled dead link check:', error);
    
    // Log failed check
    const failedCheck: ScheduledCheckResult = {
      id: `cron_failed_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'failed',
      source: 'cron',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    await storeScheduledCheck(failedCheck);

    return NextResponse.json({
      error: 'Scheduled check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Get stored schedule settings
 * In production, this would come from a database
 * @returns {DeadLinkScheduleSettings} Schedule settings configuration
 */
function getStoredScheduleSettings(): DeadLinkScheduleSettings {
  // Default settings for demo
  // In production, load from database or environment variables
  return {
    enabled: process.env.DEADLINK_SCHEDULE_ENABLED === 'true',
    frequency: (process.env.DEADLINK_SCHEDULE_FREQUENCY as 'daily' | 'weekly' | 'monthly') || 'weekly',
    time: process.env.DEADLINK_SCHEDULE_TIME || '09:00',
    dayOfWeek: parseInt(process.env.DEADLINK_SCHEDULE_DAY_OF_WEEK || '1'),
    postsToCheck: parseInt(process.env.DEADLINK_SCHEDULE_POSTS_COUNT || '10'),
    nextRun: process.env.DEADLINK_SCHEDULE_NEXT_RUN
  };
}

/**
 * Check if the scheduled check should run now
 * @param {DeadLinkScheduleSettings} settings - Schedule settings
 * @returns {boolean} True if check should run now
 */
function shouldRunNow(settings: DeadLinkScheduleSettings): boolean {
  if (!settings.nextRun) {
    return true; // Run if no next run time is set
  }
  
  const now = new Date();
  const nextRun = new Date(settings.nextRun);
  
  return now >= nextRun;
}

/**
 * Store scheduled check result
 * In production, save to database
 * @param {ScheduledCheckResult} check - Scheduled check result to store
 * @returns {Promise<void>}
 */
async function storeScheduledCheck(check: ScheduledCheckResult): Promise<void> {
  try {
    // In production, save to database
    console.log('Storing scheduled check:', check.id, check.status);
    
    // For now, just log to console
    // In production:
    // await db.scheduledChecks.create({ data: check });
    
  } catch (error) {
    console.error('Failed to store scheduled check:', error);
  }
}

/**
 * Send notifications for cron job results
 * @param {ScheduledCheckResult} check - Completed scheduled check with results
 * @returns {Promise<void>}
 */
async function sendCronNotifications(check: ScheduledCheckResult): Promise<void> {
  try {
    if (!check.results) {
      console.warn('No results found in scheduled check for notifications');
      return;
    }

    const { results } = check;
    const deadLinks = results.result.deadLinks;

    if (deadLinks.length === 0) {
      return;
    }

    // Create notification payload
    const notification = {
      timestamp: new Date().toISOString(),
      totalDeadLinks: deadLinks.length,
      postsAffected: results.summary.totalPosts,
      summary: `Scheduled check found ${deadLinks.length} dead links across ${results.summary.totalPosts} posts`,
      details: deadLinks,
      source: 'cron',
      checkId: check.id
    };

    // Get notification settings from environment variables
    const emailEnabled = process.env.DEADLINK_EMAIL_NOTIFICATIONS === 'true';
    const webhookEnabled = process.env.DEADLINK_WEBHOOK_NOTIFICATIONS === 'true';
    const email = process.env.DEADLINK_NOTIFICATION_EMAIL;
    const webhookUrl = process.env.DEADLINK_WEBHOOK_URL;

    console.log('Sending cron notifications for', deadLinks.length, 'dead links');

    // Send email notification if configured
    if (emailEnabled && email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, notification })
        });
        console.log('Email notification sent to:', email);
      } catch (error) {
        console.error('Failed to send cron email notification:', error);
      }
    }

    // Send webhook notification if configured
    if (webhookEnabled && webhookUrl) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookUrl, notification })
        });
        console.log('Webhook notification sent to:', webhookUrl);
      } catch (error) {
        console.error('Failed to send cron webhook notification:', error);
      }
    }

  } catch (error) {
    console.error('Error sending cron notifications:', error);
  }
}

/**
 * Update next run time
 * @param {DeadLinkScheduleSettings} settings - Schedule settings
 * @returns {Promise<void>}
 */
async function updateNextRunTime(settings: DeadLinkScheduleSettings): Promise<void> {
  try {
    // Calculate next run time
    const [hours, minutes] = settings.time.split(':').map(Number);
    
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    switch (settings.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
    
    console.log('Next scheduled run:', nextRun.toISOString());
    
    // In production, update database
    // await db.settings.update({ 
    //   where: { key: 'deadlink_next_run' },
    //   data: { value: nextRun.toISOString() }
    // });
    
  } catch (error) {
    console.error('Failed to update next run time:', error);
  }
}

/**
 * POST /api/cron/dead-links - Health check endpoint
 *
 * Returns health status and configuration information for the cron job.
 * Useful for monitoring and debugging cron job execution.
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} Health check response
 */
export async function POST() {
  return NextResponse.json({
    message: 'Dead Link Checker Cron Job',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    usage: {
      'GET': 'Run scheduled dead link check',
      'POST': 'Health check'
    },
    environment: {
      scheduleEnabled: process.env.DEADLINK_SCHEDULE_ENABLED === 'true',
      emailNotifications: process.env.DEADLINK_EMAIL_NOTIFICATIONS === 'true',
      webhookNotifications: process.env.DEADLINK_WEBHOOK_NOTIFICATIONS === 'true'
    }
  });
}