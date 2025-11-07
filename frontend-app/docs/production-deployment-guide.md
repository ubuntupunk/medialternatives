# Production Deployment Guide

## Complete Setup Instructions

### Step 1: Environment Variables Setup

Run the automated setup script:

```bash
cd frontend-app
bash scripts/setup-vercel-env.sh
```

This will set all required environment variables:
- `WORDPRESS_API_URL`
- `REVALIDATE_SECRET` (auto-generated)
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `NEXT_PUBLIC_DEBUG_MODE`
- `NEXT_PUBLIC_AVATAR_STORAGE`
- `NODE_ENV`

### Step 2: Manual Environment Variables

Set these manually in Vercel dashboard:

1. **BLOB_READ_WRITE_TOKEN**:
   - Go to [Vercel Storage](https://vercel.com/dashboard/stores)
   - Create a Blob store
   - Copy the token

2. **Google OAuth** (if using AdSense):
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Step 3: Deploy to Production

```bash
bash scripts/deploy-production.sh
```

This script will:
- ✅ Check all environment variables
- ✅ Run build verification
- ✅ Deploy to Vercel production
- ✅ Provide post-deployment checklist

### Step 4: Verify Deployment

1. **Test site functionality**
2. **Check revalidation endpoint**:
   ```bash
   curl -X POST "https://your-domain.com/api/revalidate" \
     -H "Content-Type: application/json" \
     -d '{"secret":"your_revalidate_secret"}'
   ```
3. **Monitor function usage**: https://vercel.com/dashboard/usage

### Step 5: Set Up WordPress Webhooks

Follow the guide: `docs/wordpress-webhooks-setup.md`

**Recommended**: Start with IFTTT integration for free automated updates.

## Current Cache Strategy

### ISR (Incremental Static Regeneration)
- **Homepage**: 5 minutes
- **Blog page**: 5 minutes
- **Post pages**: 10 minutes
- **Category pages**: 5 minutes

### On-Demand Revalidation
- **Manual**: `/api/revalidate` endpoint
- **Webhooks**: Automated via IFTTT/Zapier
- **Cache clearing**: `/api/cache/clear` endpoint

## Monitoring & Alerts

### Usage Monitoring
- **Endpoint**: `/api/monitor/usage`
- **Dashboard**: https://vercel.com/dashboard/usage
- **Logs**: `vercel logs --follow`

### Expected Usage (Monthly)
- **Function Invocations**: 30,000-60,000
- **ISR Regenerations**: ~25,000
- **Manual Revalidations**: ~1,000
- **Webhook Triggers**: ~500

### Cost Optimization
1. **ISR intervals**: Adjust based on content frequency
2. **Webhook batching**: Group multiple revalidations
3. **Rate limiting**: Prevent excessive calls
4. **Smart targeting**: Only revalidate affected pages

## Troubleshooting

### Common Issues

1. **Environment variables not working**:
   ```bash
   vercel env ls
   vercel env pull .env.production
   ```

2. **Build failures**:
   ```bash
   npm run build
   # Fix TypeScript/ESLint errors
   ```

3. **Revalidation not working**:
   ```bash
   # Test endpoint
   curl -X GET "https://your-domain.com/api/revalidate"
   
   # Check secret
   echo $REVALIDATE_SECRET
   ```

4. **WordPress URLs not updating**:
   - Verify `WORDPRESS_API_URL` environment variable
   - Check `WORDPRESS_URLS` utility import

### Debug Commands

```bash
# Check deployment logs
vercel logs --follow

# Test environment locally
vercel dev

# Pull production environment
vercel env pull .env.production

# Check function usage
curl "https://your-domain.com/api/monitor/usage"
```

## Security Checklist

- ✅ Strong `REVALIDATE_SECRET` (32+ characters)
- ✅ Secure `ADMIN_PASSWORD`
- ✅ Environment variables not in code
- ✅ Webhook rate limiting enabled
- ✅ HTTPS only for all endpoints

## Performance Targets

- **Page Load**: < 2 seconds
- **ISR Regeneration**: < 5 seconds
- **Function Invocations**: < 50,000/month
- **Cache Hit Rate**: > 90%

## Maintenance Schedule

### Weekly
- Review Vercel usage dashboard
- Check function logs for errors
- Monitor site performance

### Monthly
- Rotate `REVALIDATE_SECRET`
- Review and optimize ISR intervals
- Update dependencies

### Quarterly
- Security audit
- Performance optimization
- Cost analysis and optimization