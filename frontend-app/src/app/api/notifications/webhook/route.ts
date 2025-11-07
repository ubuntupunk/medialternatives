import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/notifications/webhook - Send webhook notification for dead links
 *
 * Sends structured JSON payload to configured webhook URL for dead link alerts.
 * Includes timeout handling and proper error responses.
 *
 * @param {NextRequest} request - Next.js request with webhook URL and notification data
 * @returns {Promise<NextResponse>} Webhook sending result or error response
 */
export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, notification } = await request.json();

    if (!webhookUrl || !notification) {
      return NextResponse.json(
        { error: 'Webhook URL and notification data are required' },
        { status: 400 }
      );
    }

    // URL validation
    try {
      new URL(webhookUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // Prepare webhook payload
    const payload = {
      type: 'dead_links_alert',
      timestamp: notification.timestamp,
      data: {
        totalDeadLinks: notification.totalDeadLinks,
        postsAffected: notification.postsAffected,
        summary: notification.summary,
        details: notification.details.slice(0, 20), // Limit details to prevent large payloads
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com'}/dashboard/dead-links`
      },
      source: {
        name: 'MediaAlternatives',
        service: 'Dead Link Checker',
        version: '1.0.0'
      }
    };

    // Send webhook
    const success = await sendWebhook(webhookUrl, payload);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook notification sent successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send webhook notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending webhook notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send webhook notification
 * @param {string} webhookUrl - Target webhook endpoint URL
 * @param {any} payload - JSON payload to send
 * @returns {Promise<boolean>} True if webhook sent successfully (2xx response)
 */
async function sendWebhook(webhookUrl: string, payload: any): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MediaAlternatives-DeadLinkChecker/1.0',
        'X-Webhook-Source': 'medialternatives-deadlink-checker'
      },
      body: JSON.stringify(payload),
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    // Consider 2xx status codes as success
    return response.status >= 200 && response.status < 300;

  } catch (error) {
    console.error('Error sending webhook:', error);
    return false;
  }
}