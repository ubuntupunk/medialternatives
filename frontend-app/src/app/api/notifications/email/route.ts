import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/notifications/email - Send email notification for dead links
 *
 * Sends HTML and text email notifications containing dead link reports.
 * Currently uses mock implementation - requires email service integration.
 *
 * @param {NextRequest} request - Next.js request with email and notification data
 * @returns {Promise<NextResponse>} Email sending result or error response
 */
export async function POST(request: NextRequest) {
  try {
    const { email, notification } = await request.json();

    if (!email || !notification) {
      return NextResponse.json(
        { error: 'Email and notification data are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // For now, we'll use a simple email service
    // In production, you'd integrate with SendGrid, AWS SES, etc.
    const emailContent = generateEmailContent(notification);
    
    // Mock email sending (replace with actual email service)
    console.log('Sending email notification to:', email);
    console.log('Email content:', emailContent);

    // Simulate email sending
    const success = await sendEmail(email, emailContent);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email notification sent successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending email notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate email content for dead link notification
 * @param {any} notification - Dead link notification data
 * @returns {Object} Email content with subject, HTML, and text versions
 */
function generateEmailContent(notification: any) {
  const { totalDeadLinks, postsAffected, summary, details, timestamp } = notification;
  
  const subject = `🔗 Dead Links Alert: ${totalDeadLinks} broken links found`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dead Links Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
        .summary { background: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
        .link-item { background: white; padding: 10px; margin-bottom: 10px; border-left: 4px solid #dc3545; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6c757d; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔗 Dead Links Alert</h1>
            <p>Broken links detected on your website</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <h3>Summary</h3>
                <p><strong>Dead Links Found:</strong> ${totalDeadLinks}</p>
                <p><strong>Posts Affected:</strong> ${postsAffected}</p>
                <p><strong>Detected:</strong> ${new Date(timestamp).toLocaleString()}</p>
            </div>
            
            <div class="alert">
                <strong>Action Required:</strong> ${summary}
            </div>
            
            <h3>Broken Links Details</h3>
            ${details.slice(0, 10).map((link: any) => `
                <div class="link-item">
                    <strong>URL:</strong> ${link.url}<br>
                    <strong>Status:</strong> ${link.status || 'Timeout/Error'}<br>
                    <strong>Post:</strong> ${link.postTitle}<br>
                    ${link.error ? `<strong>Error:</strong> ${link.error}<br>` : ''}
                </div>
            `).join('')}
            
            ${details.length > 10 ? `<p><em>... and ${details.length - 10} more broken links</em></p>` : ''}
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com'}/dashboard/dead-links" class="btn">
                    View Full Report
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>This notification was sent by MediaAlternatives Dead Link Checker</p>
            <p>To manage notification settings, visit your dashboard</p>
        </div>
    </div>
</body>
</html>
  `;

  const text = `
Dead Links Alert - ${totalDeadLinks} broken links found

Summary:
- Dead Links: ${totalDeadLinks}
- Posts Affected: ${postsAffected}
- Detected: ${new Date(timestamp).toLocaleString()}

${summary}

Broken Links:
${details.slice(0, 5).map((link: any) => 
  `- ${link.url} (${link.status || 'Timeout'}) in "${link.postTitle}"`
).join('\n')}

${details.length > 5 ? `... and ${details.length - 5} more broken links` : ''}

View the full report: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://medialternatives.com'}/dashboard/dead-links
  `;

  return { subject, html, text };
}

/**
 * Mock email sending function
 * Replace with actual email service integration
 * @param {string} email - Recipient email address
 * @param {any} content - Email content with subject, HTML, and text
 * @returns {Promise<boolean>} True if email sent successfully
 */
async function sendEmail(email: string, content: any): Promise<boolean> {
  try {
    // This is a mock implementation
    // In production, integrate with:
    // - SendGrid: https://sendgrid.com/
    // - AWS SES: https://aws.amazon.com/ses/
    // - Nodemailer with SMTP
    // - Resend: https://resend.com/
    
    console.log(`Mock: Sending email to ${email}`);
    console.log(`Subject: ${content.subject}`);
    console.log(`HTML length: ${content.html.length} chars`);
    console.log(`Text length: ${content.text.length} chars`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
    
  } catch (error) {
    console.error('Error in mock email sending:', error);
    return false;
  }
}