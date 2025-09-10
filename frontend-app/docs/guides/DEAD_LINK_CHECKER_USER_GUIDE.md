# Dead Link Checker - User Guide

## 📖 Table of Contents
1. [Getting Started](#getting-started)
2. [Understanding the Interface](#understanding-the-interface)
3. [Running Link Checks](#running-link-checks)
4. [Setting Up Notifications](#setting-up-notifications)
5. [Scheduling Automated Checks](#scheduling-automated-checks)
6. [Exporting Results](#exporting-results)
7. [Understanding Results](#understanding-results)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## 🚀 Getting Started

### Accessing the Dead Link Checker
1. Navigate to your dashboard at `/dashboard`
2. Click on the **"Dead Link Checker"** card
3. You'll see a tabbed interface with four main sections:
   - **Check Links**: Manual link checking
   - **Schedule**: Automated checking setup
   - **Notifications**: Alert configuration
   - **Export**: Download results

### First Time Setup
Before running your first check, consider:
1. **Set up notifications** to get alerts when issues are found
2. **Configure scheduling** for regular automated checks
3. **Review export options** to understand reporting capabilities

## 🖥 Understanding the Interface

### Navigation Tabs
- **🔍 Check Links**: Run manual checks on your posts
- **📅 Schedule**: Set up automated recurring checks
- **🔔 Notifications**: Configure email, browser, and webhook alerts
- **📊 Export**: Download results in CSV, JSON, or PDF format

### Progress Tracking
When running checks, you'll see:
- **Progress Bar**: Visual indicator of completion percentage
- **Current Item**: The link currently being checked
- **Time Estimates**: How long the process will take

### Status Indicators
- **Green Badge**: Working link (200-299 status)
- **Yellow Badge**: Client error (400-499 status)
- **Red Badge**: Server error (500+ status)
- **Gray Badge**: Timeout or network error
- **Blue Retry Icon**: Temporary error that might resolve

## 🔍 Running Link Checks

### Check Types

#### Recent Posts
- **Best for**: Regular maintenance
- **Options**: Check last 5, 10, 15, or 20 posts
- **Time**: 1-5 minutes depending on link count
- **Recommended**: Start with 5 posts for first check

#### Specific Post
- **Best for**: Troubleshooting specific content
- **Input**: Enter the WordPress post ID
- **Time**: 30 seconds to 2 minutes
- **Use case**: After editing a post with many external links

#### All Posts (Use Carefully)
- **Best for**: Comprehensive site audit
- **Warning**: Can take 30+ minutes for large sites
- **Limitation**: Limited to 100 posts for safety
- **Recommendation**: Use scheduled checks instead

### Running a Check
1. Select your check type
2. Configure options (post count or ID)
3. Click **"Check Dead Links"**
4. Monitor the progress bar
5. Review results when complete

### Understanding Progress
- **Percentage**: Overall completion
- **Current Item**: Link being checked (truncated for display)
- **Time Tracking**: Elapsed time and estimates
- **Status Updates**: Real-time progress information

## 🔔 Setting Up Notifications

### Browser Notifications
1. Go to **Notifications** tab
2. Check **"Enable browser notifications"**
3. Allow permission when prompted
4. Test with the **"Test Browser Notification"** button

**Benefits:**
- Instant alerts on your desktop
- Works even when browser is minimized
- No setup required beyond permission

### Email Notifications
1. Check **"Enable email notifications"**
2. Enter your email address
3. Set notification threshold (minimum dead links to trigger)
4. Save settings

**Email Features:**
- Professional HTML formatting
- Detailed link breakdown
- Direct links to dashboard
- Summary statistics

### Webhook Notifications
Perfect for team integration:

#### Slack Integration
1. Create a Slack webhook URL
2. Enter URL in webhook field
3. Enable webhook notifications
4. Test the integration

#### Discord Integration
1. Create a Discord webhook
2. Enter the webhook URL
3. Configure notification threshold
4. Test with a manual check

#### Custom Webhooks
- JSON payload with full link details
- Includes metadata and timestamps
- Configurable retry logic
- Error handling and fallbacks

### Notification Threshold
- **Purpose**: Avoid spam for minor issues
- **Recommendation**: Start with threshold of 1
- **Adjustment**: Increase if you get too many alerts
- **Use case**: Set higher for large sites with occasional issues

## ⏰ Scheduling Automated Checks

### Schedule Configuration

#### Frequency Options
- **Daily**: Every day at specified time
- **Weekly**: Specific day of week and time
- **Monthly**: Specific day of month and time

#### Time Settings
- **Format**: 24-hour format (HH:MM)
- **Timezone**: Uses server timezone
- **Recommendation**: Choose off-peak hours (early morning)

#### Posts to Check
- **Range**: 1-50 posts per scheduled check
- **Recommendation**: Start with 10-15 posts
- **Scaling**: Increase gradually based on performance

### Setting Up Scheduling
1. Go to **Schedule** tab
2. Check **"Enable Scheduled Checks"**
3. Select frequency (daily/weekly/monthly)
4. Set time (e.g., 09:00 for 9 AM)
5. Choose day (for weekly/monthly)
6. Set number of posts to check
7. Save settings

### Monitoring Scheduled Checks
- **Next Run**: Shows when next check will occur
- **Recent Checks**: History of last 5 scheduled runs
- **Status Tracking**: Pending, running, completed, failed
- **Results Summary**: Dead links found in each check

### Cron Job Setup (Advanced)
For reliable scheduling, set up server-side cron jobs:
```bash
# Weekly check every Monday at 9 AM
0 9 * * 1 curl -H "Authorization: Bearer your-secret" https://yoursite.com/api/cron/dead-links
```

## 📊 Exporting Results

### Export Formats

#### CSV (Comma Separated Values)
- **Best for**: Spreadsheet analysis
- **Use case**: Data manipulation, filtering, sorting
- **Compatible with**: Excel, Google Sheets, Numbers
- **Size**: Compact, fast download

#### JSON (JavaScript Object Notation)
- **Best for**: Technical analysis, API integration
- **Use case**: Custom reporting, data processing
- **Features**: Structured data, grouping options
- **Size**: Larger but more detailed

#### PDF (Portable Document Format)
- **Best for**: Professional reports, sharing
- **Use case**: Executive summaries, client reports
- **Features**: Formatted layout, charts, summaries
- **Size**: Medium, includes styling

### Export Options

#### Include Context
- **What**: Surrounding text where link appears
- **Benefit**: Understand link placement
- **Size impact**: Increases file size
- **Recommendation**: Include for detailed analysis

#### Include Suggestions
- **What**: Fix recommendations for each broken link
- **Benefit**: Actionable repair guidance
- **Content**: Archive links, alternative suggestions
- **Recommendation**: Always include

#### Include Archive Links
- **What**: Internet Archive Wayback Machine URLs
- **Benefit**: Find historical versions of content
- **Success rate**: ~70% of links have archives
- **Recommendation**: Include for content recovery

#### Group by Post (JSON only)
- **What**: Organize results by post rather than flat list
- **Benefit**: Easier to see which posts need attention
- **Use case**: Content management workflows
- **Recommendation**: Enable for content teams

### Exporting Process
1. Run a link check first
2. Go to **Export** tab
3. Select format (CSV/JSON/PDF)
4. Choose data options
5. Click **"Export Results"**
6. File downloads automatically

## 📈 Understanding Results

### Summary Statistics
- **Posts Checked**: Number of posts analyzed
- **Total Links**: All external links found
- **Working Links**: Links returning 200-299 status
- **Dead Links**: Links with errors or bad status codes
- **Processing Time**: How long the check took

### Error Analysis
When errors are found, you'll see breakdown by type:

#### Forbidden (403) Errors
- **Meaning**: Server blocks automated requests
- **Reality**: Link likely works for human visitors
- **Action**: Manually verify, consider acceptable
- **Common sites**: Social media, news sites, some blogs

#### Timeout Errors
- **Meaning**: Server didn't respond within time limit
- **Causes**: Slow server, network issues, overloaded site
- **Action**: Retry later, check if site is down
- **Retryable**: Yes, often temporary

#### Server Errors (500+)
- **Meaning**: Website has internal problems
- **Urgency**: High - likely broken for all visitors
- **Action**: Find alternative source or remove link
- **Retryable**: Sometimes, but indicates real issues

#### Client Errors (400-499)
- **Meaning**: Page not found, moved, or restricted
- **Common**: 404 (Not Found), 401 (Unauthorized)
- **Action**: Update link or find replacement
- **Retryable**: Usually not, permanent issues

### Link Details Table
For each broken link, you'll see:
- **URL**: The broken link (truncated for display)
- **Status**: HTTP status code with color coding
- **Post**: Which post contains the link
- **Context**: Surrounding text for context
- **Archive**: Link to Internet Archive if available
- **Suggestions**: Recommended fixes

### Retry Indicators
- **Blue retry icon**: Indicates temporary errors
- **Timestamp**: When link was last checked
- **Retryable flag**: Whether error might resolve

## 🔧 Troubleshooting

### Common Issues

#### "Forbidden" Errors
**Problem**: Many links show 403 Forbidden status
**Cause**: Websites blocking automated requests
**Solution**: 
- This is normal behavior
- Links likely work for human visitors
- Consider these "false positives"
- Manually verify important links

#### CORS Errors
**Problem**: "CORS blocked" error messages
**Cause**: Browser security preventing cross-origin requests
**Solution**:
- Use server-side checking (scheduled checks)
- Understand this doesn't mean link is broken
- Consider using API-based checking

#### Slow Performance
**Problem**: Checks taking very long time
**Cause**: Many links, slow external sites, rate limiting
**Solutions**:
- Reduce number of posts checked
- Use scheduled checks during off-peak hours
- Increase rate limiting delays
- Check fewer posts more frequently

#### No Notifications Received
**Problem**: Configured notifications but not receiving them
**Troubleshooting**:
1. Check browser notification permissions
2. Verify email address is correct
3. Test webhook URLs manually
4. Check notification threshold settings
5. Look for notifications in spam folder

#### Scheduled Checks Not Running
**Problem**: Automated checks not executing
**Troubleshooting**:
1. Verify schedule is enabled
2. Check cron job configuration
3. Confirm environment variables are set
4. Monitor API endpoint logs
5. Test manual execution

### Performance Optimization

#### For Large Sites
- Start with small batches (5-10 posts)
- Use scheduled checks instead of manual "all posts"
- Increase rate limiting delays
- Monitor server resources

#### For Slow Networks
- Reduce timeout values
- Check fewer posts per run
- Use export features for offline analysis
- Schedule checks during low-traffic periods

### Error Recovery

#### After Failed Checks
1. Review error messages for clues
2. Try smaller batch sizes
3. Check network connectivity
4. Verify API endpoints are accessible
5. Contact support if issues persist

#### Data Recovery
- Export results immediately after successful checks
- Keep historical exports for trend analysis
- Use JSON format for complete data preservation
- Regular backups of notification settings

## ✅ Best Practices

### Regular Maintenance
- **Weekly checks**: For active sites with frequent updates
- **Monthly checks**: For stable sites with occasional updates
- **Quarterly audits**: Comprehensive all-posts checks
- **Post-update checks**: After major content changes

### Notification Strategy
- **Start conservative**: Low thresholds, limited recipients
- **Adjust based on volume**: Increase thresholds if too noisy
- **Multiple channels**: Use both email and webhooks
- **Team coordination**: Ensure notifications reach right people

### Content Management
- **Prioritize fixes**: Focus on high-traffic posts first
- **Archive alternatives**: Use Internet Archive for historical content
- **Link replacement**: Find authoritative alternative sources
- **Documentation**: Keep records of link changes

### Performance Management
- **Batch processing**: Check posts in small groups
- **Off-peak scheduling**: Run during low-traffic hours
- **Resource monitoring**: Watch server performance during checks
- **Gradual scaling**: Increase check frequency slowly

### Data Management
- **Regular exports**: Download results for historical tracking
- **Trend analysis**: Compare results over time
- **False positive tracking**: Note sites that commonly block bots
- **Action tracking**: Record which links were fixed

### Team Workflows
- **Role assignment**: Designate who handles different types of errors
- **Escalation procedures**: Define when to involve technical team
- **Communication protocols**: How to report and track fixes
- **Training**: Ensure team understands error types and priorities

## 📞 Getting Help

### Self-Service Resources
1. **This User Guide**: Comprehensive usage instructions
2. **Technical Documentation**: `/docs/DEAD_LINK_CHECKER_FEATURES.md`
3. **API Documentation**: For advanced integrations
4. **Troubleshooting Section**: Common issues and solutions

### Support Channels
1. **Dashboard Help**: Built-in tooltips and guidance
2. **Error Messages**: Detailed error descriptions with suggestions
3. **Test Functions**: Built-in testing for notifications and exports
4. **Debug Information**: Available in browser console

### Best Practices for Getting Help
1. **Describe the issue**: What you were trying to do
2. **Include error messages**: Copy exact error text
3. **Provide context**: Browser, operating system, network
4. **Share screenshots**: Visual information helps diagnosis
5. **Test systematically**: Try different options to isolate issue

---

## 🎯 Quick Start Checklist

For new users, follow this checklist:

- [ ] **Access the tool**: Navigate to `/dashboard/dead-links`
- [ ] **Run first check**: Start with 5 recent posts
- [ ] **Review results**: Understand the different error types
- [ ] **Set up notifications**: Configure browser alerts
- [ ] **Schedule regular checks**: Weekly checks of 10 posts
- [ ] **Export results**: Download CSV for record keeping
- [ ] **Configure team alerts**: Set up email/webhook notifications
- [ ] **Document process**: Share this guide with your team

The Dead Link Checker is a powerful tool for maintaining link quality across your WordPress site. Start small, learn the interface, and gradually expand your usage as you become more comfortable with the features.