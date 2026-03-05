# WordPress.com Webhooks & Automated Revalidation Setup

## Overview

Set up automated cache invalidation when content is published, updated, or deleted on WordPress.com. This ensures your Next.js site updates immediately without waiting for ISR intervals.

## WordPress.com Webhook Limitations

⚠️ **Important**: WordPress.com (hosted) has limited webhook support compared to self-hosted WordPress. Available options:

### Available Methods

1. **Jetpack Webhooks** (if available on your plan)
2. **IFTTT Integration** (free alternative)
3. **Zapier Integration** (paid alternative)
4. **Manual Triggers** (immediate solution)

## Method 1: Manual Revalidation (Immediate Solution)

### Setup

Your revalidation endpoint is ready at: `/api/revalidate`

```bash
# Revalidate all common pages
curl -X POST "https://your-domain.com/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{"secret":"your_revalidate_secret"}'

# Revalidate specific post
curl -X POST "https://your-domain.com/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{"path":"/post/your-post-slug","secret":"your_revalidate_secret"}'

# Revalidate homepage
curl -X POST "https://your-domain.com/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{"path":"/","secret":"your_revalidate_secret"}'
```

### Browser Bookmarklet

Create a bookmark with this JavaScript for one-click revalidation:

```javascript
javascript:(function(){
  fetch('https://your-domain.com/api/revalidate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({secret: 'your_revalidate_secret'})
  }).then(r => r.json()).then(d => alert('Revalidated: ' + JSON.stringify(d.revalidated)));
})();
```

## Method 2: IFTTT Integration (Free)

### Setup Steps

1. **Create IFTTT Account**: Sign up at [ifttt.com](https://ifttt.com)

2. **Create New Applet**:
   - **IF**: RSS Feed → New feed item
   - **Feed URL**: `https://medialternatives.wordpress.com/feed/`
   - **THEN**: Webhooks → Make a web request

3. **Webhook Configuration**:
   ```
   URL: https://your-domain.com/api/revalidate
   Method: POST
   Content Type: application/json
   Body: {"secret":"your_revalidate_secret","trigger":"new_post"}
   ```

### Pros & Cons

✅ **Pros**: Free, easy setup, works with WordPress.com
❌ **Cons**: 15-minute delay, limited to RSS feed updates

## Method 3: Zapier Integration (Paid)

### Setup Steps

1. **Create Zapier Account**: Sign up at [zapier.com](https://zapier.com)

2. **Create New Zap**:
   - **Trigger**: RSS by Zapier → New Item in Feed
   - **Feed URL**: `https://medialternatives.wordpress.com/feed/`
   - **Action**: Webhooks by Zapier → POST

3. **Webhook Configuration**:
   ```
   URL: https://your-domain.com/api/revalidate
   Payload Type: JSON
   Data: {
     "secret": "your_revalidate_secret",
     "trigger": "zapier_new_post",
     "post_title": "{{title}}",
     "post_url": "{{link}}"
   }
   ```

## Monitoring & Overhead Management

### Vercel Function Usage Monitoring

Monitor these metrics in Vercel dashboard:

1. **Function Invocations**: Revalidation API calls
2. **Bandwidth**: Data transfer from revalidations  
3. **Build Minutes**: ISR regenerations

### Cost Optimization Tips

1. **Use ISR as primary**: Webhooks as secondary
2. **Batch operations**: Multiple paths per webhook
3. **Smart caching**: Avoid unnecessary revalidations
4. **Monitor patterns**: Track usage and optimize

### Usage Limits (Vercel Pro Plan)

- **Function Invocations**: 1,000,000/month
- **Your Current Usage**: ~30,000-60,000/month (well within limits)
- **ISR Regenerations**: Count as function invocations
- **Manual Revalidations**: Also count as function invocations

## Recommended Setup

For your WordPress.com site, I recommend:

1. **Primary**: ISR with 5-10 minute intervals (current setup)
2. **Secondary**: IFTTT webhook for immediate updates
3. **Manual**: Bookmarklet for urgent updates
4. **Monitoring**: Weekly usage review

This provides the best balance of performance, cost, and freshness.