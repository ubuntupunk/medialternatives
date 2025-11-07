# Dead Link Checker - Complete Feature Guide

## 🚀 Overview

The Dead Link Checker is now a comprehensive tool with advanced features including notifications, scheduled checks, and export functionality. This guide covers all features and setup instructions.

## ✨ Features

### 🔍 Core Link Checking
- **Smart URL Detection**: Finds links in href attributes and plain text
- **External Link Focus**: Automatically skips internal links, anchors, mailto, etc.
- **HTTP Status Validation**: Uses HEAD requests for efficient checking
- **Context Capture**: Shows surrounding text for each broken link
- **Archive Integration**: Automatically searches Internet Archive for alternatives
- **Rate Limiting**: Respectful 500ms delays between requests

### 🔔 Notifications System
- **Browser Notifications**: Instant desktop alerts when dead links are found
- **Email Notifications**: Detailed HTML email reports with broken link summaries
- **Webhook Notifications**: Integration with Slack, Discord, or custom webhooks
- **Smart Thresholds**: Only notify when a minimum number of dead links are found
- **Test Functionality**: Send test notifications to verify settings

### ⏰ Scheduled Checks
- **Flexible Scheduling**: Daily, weekly, or monthly automated checks
- **Customizable Timing**: Set specific time and day for checks
- **Post Limits**: Configure how many posts to check per run
- **History Tracking**: View results of previous scheduled checks
- **Status Monitoring**: Track pending, running, completed, and failed checks

### 📊 Export Functionality
- **Multiple Formats**: Export to CSV, JSON, or PDF
- **Customizable Data**: Choose what information to include
- **Context Options**: Include/exclude surrounding text, suggestions, archive links
- **Grouping Options**: Group results by post (JSON format)
- **Professional Reports**: Well-formatted PDF reports with summaries

## 🛠 Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Cron Job Security
CRON_SECRET=your-secure-random-string

# Scheduled Checks Configuration
DEADLINK_SCHEDULE_ENABLED=true
DEADLINK_SCHEDULE_FREQUENCY=weekly
DEADLINK_SCHEDULE_TIME=09:00
DEADLINK_SCHEDULE_DAY_OF_WEEK=1
DEADLINK_SCHEDULE_POSTS_COUNT=10

# Email Notifications
DEADLINK_EMAIL_NOTIFICATIONS=true
DEADLINK_NOTIFICATION_EMAIL=admin@yourdomain.com

# Webhook Notifications
DEADLINK_WEBHOOK_NOTIFICATIONS=true
DEADLINK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Site URL (for links in notifications)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Vercel Cron Jobs (Recommended)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/dead-links",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

### 3. Alternative Cron Setup

If not using Vercel, set up external cron jobs:

```bash
# Weekly check every Monday at 9 AM
0 9 * * 1 curl -H "Authorization: Bearer your-cron-secret" https://yourdomain.com/api/cron/dead-links
```

## 📱 User Interface

### Navigation Tabs
- **Check Links**: Manual dead link checking with various options
- **Schedule**: Configure automated checks and view history
- **Notifications**: Set up browser, email, and webhook alerts
- **Export**: Download results in multiple formats

### Check Options
- **Recent Posts**: Check last 5-20 posts
- **Specific Post**: Check a single post by ID
- **All Posts**: Comprehensive site-wide check (use carefully)

### Notification Settings
- **Browser Notifications**: Requires user permission
- **Email Notifications**: Detailed HTML reports
- **Webhook Notifications**: JSON payloads for integrations
- **Threshold Control**: Set minimum dead links to trigger alerts

### Export Options
- **Format Selection**: CSV, JSON, or PDF
- **Data Inclusion**: Context, suggestions, archive links
- **Grouping**: Organize by post (JSON only)
- **Preview**: See what will be included before export

## 🔧 API Endpoints

### Manual Checking
```bash
# Check recent posts
GET /api/check-dead-links?posts=10

# Check specific post
GET /api/check-dead-links?post_id=123

# Check all posts (careful!)
GET /api/check-dead-links?all=true
```

### Notifications
```bash
# Send email notification
POST /api/notifications/email
{
  "email": "admin@domain.com",
  "notification": { ... }
}

# Send webhook notification
POST /api/notifications/webhook
{
  "webhookUrl": "https://hooks.slack.com/...",
  "notification": { ... }
}
```

### Scheduled Checks
```bash
# Get scheduled checks
GET /api/scheduled-checks

# Create scheduled check
POST /api/scheduled-checks
{
  "settings": { ... }
}

# Execute specific check
POST /api/scheduled-checks/{id}/execute

# Update schedule settings
PUT /api/scheduled-checks/settings
{
  "enabled": true,
  "frequency": "weekly",
  ...
}
```

### Cron Jobs
```bash
# Run scheduled check (requires auth)
GET /api/cron/dead-links
Authorization: Bearer your-cron-secret

# Health check
POST /api/cron/dead-links
```

### Export
```bash
# Generate PDF report
POST /api/export/pdf
{
  "html": "<html>...</html>",
  "filename": "report.pdf"
}
```

## 📧 Email Notification Format

Email notifications include:
- **Summary Statistics**: Dead links count, posts affected
- **Detailed Link List**: URLs, status codes, post titles
- **Action Buttons**: Direct links to dashboard
- **Professional Styling**: HTML formatted for readability

## 🔗 Webhook Payload Format

```json
{
  "type": "dead_links_alert",
  "timestamp": "2024-01-15T09:00:00Z",
  "data": {
    "totalDeadLinks": 5,
    "postsAffected": 3,
    "summary": "Found 5 dead links across 3 posts",
    "details": [...],
    "dashboardUrl": "https://yourdomain.com/dashboard/dead-links"
  },
  "source": {
    "name": "MediaAlternatives",
    "service": "Dead Link Checker",
    "version": "1.0.0"
  }
}
```

## 🎯 Best Practices

### Scheduling
- **Start Small**: Begin with weekly checks of 10-20 posts
- **Monitor Performance**: Watch processing times and adjust accordingly
- **Off-Peak Hours**: Schedule during low-traffic periods
- **Gradual Scaling**: Increase post count gradually

### Notifications
- **Set Appropriate Thresholds**: Avoid notification spam
- **Test Settings**: Use test buttons to verify configuration
- **Multiple Channels**: Use both email and webhooks for redundancy
- **Clear Recipients**: Ensure notifications go to active maintainers

### Export Usage
- **Regular Backups**: Export results for record keeping
- **Format Selection**: Use CSV for spreadsheets, PDF for reports
- **Data Filtering**: Include only necessary information
- **Archive Reports**: Keep historical data for trend analysis

## 🔒 Security Considerations

### Cron Job Protection
- **Secret Authentication**: Use strong, random CRON_SECRET
- **Environment Variables**: Never commit secrets to code
- **HTTPS Only**: Ensure all webhook URLs use HTTPS
- **Rate Limiting**: Built-in delays prevent server overload

### Data Privacy
- **Email Security**: Use secure email providers
- **Webhook Validation**: Verify webhook endpoint security
- **Export Handling**: Secure storage of exported reports
- **Access Control**: Dashboard requires authentication

## 🚨 Troubleshooting

### Common Issues

**Notifications Not Working**
- Check browser notification permissions
- Verify email/webhook URLs are correct
- Test with lower thresholds
- Check browser console for errors

**Scheduled Checks Not Running**
- Verify CRON_SECRET is set correctly
- Check Vercel cron job configuration
- Monitor API endpoint logs
- Ensure schedule settings are enabled

**Export Failures**
- Check browser download permissions
- Verify results exist before exporting
- Try different export formats
- Check console for error messages

**Performance Issues**
- Reduce posts per check
- Increase rate limiting delays
- Check network connectivity
- Monitor processing times

### Debug Endpoints

```bash
# Check cron job health
POST /api/cron/dead-links

# Test API connectivity
GET /api/check-dead-links?posts=1

# Verify environment
GET /api/debug-env
```

## 🔮 Future Enhancements

### Planned Features
- **Database Storage**: Persistent storage for checks and settings
- **Advanced Scheduling**: Cron expression support
- **Link Monitoring**: Track link health over time
- **Bulk Actions**: Fix multiple links at once
- **Integration APIs**: WordPress plugin integration
- **Performance Analytics**: Detailed timing and success metrics

### Integration Opportunities
- **Content Management**: Auto-update broken links
- **SEO Tools**: Integration with SEO monitoring
- **Analytics**: Link performance tracking
- **Team Collaboration**: Multi-user notifications
- **API Webhooks**: Real-time link status updates

## 📞 Support

For issues or questions:
1. Check this documentation first
2. Review browser console for errors
3. Test with minimal configurations
4. Check API endpoint responses
5. Verify environment variable setup

The Dead Link Checker is now a production-ready tool with enterprise-level features for maintaining link quality across your WordPress site.