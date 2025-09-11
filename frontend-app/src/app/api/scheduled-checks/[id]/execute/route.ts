import { NextRequest, NextResponse } from 'next/server';
import { wordpressApi } from '@/services/wordpress-api';
import { checkMultiplePostsLinks } from '@/utils/deadLinkChecker';
import { ScheduledCheck } from '@/utils/scheduler';

// Import the in-memory storage (in production, use a database)
// This is a simplified approach for demo purposes
const scheduledChecks: ScheduledCheck[] = [];

/**
 * POST /api/scheduled-checks/[id]/execute - Execute a scheduled check
 *
 * Runs the dead link check for a specific scheduled check ID.
 * Updates check status and sends notifications if dead links are found.
 *
 * @param {NextRequest} request - Next.js request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Scheduled check ID to execute
 * @returns {Promise<NextResponse>} Execution results or error response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkId = id;

    // Find the scheduled check
    const checkIndex = scheduledChecks.findIndex(check => check.id === checkId);
    
    if (checkIndex === -1) {
      return NextResponse.json(
        { error: 'Scheduled check not found' },
        { status: 404 }
      );
    }

    const scheduledCheck = scheduledChecks[checkIndex];

    // Update status to running
    scheduledChecks[checkIndex] = {
      ...scheduledCheck,
      status: 'running',
      startedAt: new Date().toISOString()
    };

    try {
      // Execute the dead link check
      const postsToCheck = scheduledCheck.settings.postsToCheck || 10;
      const posts = await wordpressApi.getPosts({ per_page: Math.min(postsToCheck, 20) });

      if (posts.length === 0) {
        throw new Error('No posts found to check');
      }

      const result = await checkMultiplePostsLinks(posts);

      // Update check with results
      const completedCheck = {
        ...scheduledChecks[checkIndex],
        status: 'completed',
        completedAt: new Date().toISOString(),
        results: {
          type: 'scheduled_check',
          postsChecked: posts.length,
          result,
          summary: {
            totalPosts: posts.length,
            totalLinks: result.totalLinks,
            deadLinks: result.deadLinks.length,
            workingLinks: result.workingLinks,
            processingTimeMs: result.processingTime,
            processingTimeMinutes: Math.round(result.processingTime / 60000 * 100) / 100
          }
        }
      };

      scheduledChecks[checkIndex] = completedCheck;

      // Send notifications if dead links found
      if (result.deadLinks.length > 0) {
        await sendScheduledCheckNotifications(completedCheck);
      }

      return NextResponse.json(completedCheck);

    } catch (error) {
      // Update check with error
      const failedCheck = {
        ...scheduledChecks[checkIndex],
        status: 'failed',
        completedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      scheduledChecks[checkIndex] = failedCheck;

      console.error('Error executing scheduled check:', error);
      return NextResponse.json(failedCheck, { status: 500 });
    }

  } catch (error) {
    console.error('Error in scheduled check execution:', error);
    return NextResponse.json(
      { error: 'Failed to execute scheduled check' },
      { status: 500 }
    );
  }
}

/**
 * Send notifications for scheduled check results
 * @param {any} check - Completed scheduled check with results
 * @returns {Promise<void>}
 */
async function sendScheduledCheckNotifications(check: ScheduledCheck): Promise<void> {
  try {
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
      source: 'scheduled_check',
      checkId: check.id
    };

    // Load notification settings (in production, get from database)
    const notificationSettings = getStoredNotificationSettings();

    // Send browser notification (this would be handled client-side)
    console.log('Scheduled check notification:', notification.summary);

    // Send email notification if configured
    if (notificationSettings.enableEmailNotifications && notificationSettings.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: notificationSettings.email,
            notification
          })
        });
      } catch (error) {
        console.error('Failed to send scheduled check email notification:', error);
      }
    }

    // Send webhook notification if configured
    if (notificationSettings.enableWebhookNotifications && notificationSettings.webhookUrl) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl: notificationSettings.webhookUrl,
            notification
          })
        });
      } catch (error) {
        console.error('Failed to send scheduled check webhook notification:', error);
      }
    }

  } catch (error) {
    console.error('Error sending scheduled check notifications:', error);
  }
}

/**
 * Get stored notification settings
 * In production, this would come from a database
 * @returns {Object} Notification settings configuration
 */
function getStoredNotificationSettings() {
  // Default settings for demo
  return {
    enableEmailNotifications: false,
    enableWebhookNotifications: false,
    email: null,
    webhookUrl: null,
    threshold: 1
  };
}