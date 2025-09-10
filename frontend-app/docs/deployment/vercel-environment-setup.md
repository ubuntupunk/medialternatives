# Vercel Environment Variables Setup

## Current Environment Variables Status

### Required Production Variables

```bash
# WordPress.com API Configuration
WORDPRESS_API_URL=https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com

# Google Analytics (public - prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-CZNQG5YM3Z

# AdSense Configuration (public - prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1630578712653878

# Environment
NODE_ENV=production

# Debug Mode (set to false for production)
NEXT_PUBLIC_DEBUG_MODE=false

# Avatar Storage Configuration
NEXT_PUBLIC_AVATAR_STORAGE=vercel

# Vercel Blob Storage (Recommended for Vercel deployment)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Authentication Configuration
ADMIN_PASSWORD=your_secure_admin_password_here

# On-demand revalidation secret (for webhook security)
REVALIDATE_SECRET=your_secure_revalidation_secret_here

# Google OAuth (for AdSense integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Setting Environment Variables in Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Set WordPress API URL
vercel env add WORDPRESS_API_URL production
# Enter: https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com

# Set revalidation secret
vercel env add REVALIDATE_SECRET production
# Enter: your_secure_random_string_here

# Set admin password
vercel env add ADMIN_PASSWORD production
# Enter: your_secure_admin_password

# Set Google Analytics ID (public)
vercel env add NEXT_PUBLIC_GOOGLE_ANALYTICS_ID production
# Enter: G-CZNQG5YM3Z

# Set AdSense Client ID (public)
vercel env add NEXT_PUBLIC_ADSENSE_CLIENT_ID production
# Enter: ca-pub-1630578712653878

# Set debug mode (public)
vercel env add NEXT_PUBLIC_DEBUG_MODE production
# Enter: false

# Set avatar storage (public)
vercel env add NEXT_PUBLIC_AVATAR_STORAGE production
# Enter: vercel
```

### Method 2: Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate scope (Production, Preview, Development)

## Bulk Environment Variable Setup Script

```bash
#!/bin/bash
# Run this script to set all production environment variables

echo "Setting up Vercel environment variables for production..."

# Core WordPress configuration
vercel env add WORDPRESS_API_URL production <<< "https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com"

# Security
vercel env add REVALIDATE_SECRET production <<< "$(openssl rand -base64 32)"
vercel env add ADMIN_PASSWORD production <<< "MediaActivist2024!SecurePass"

# Public variables
vercel env add NEXT_PUBLIC_GOOGLE_ANALYTICS_ID production <<< "G-CZNQG5YM3Z"
vercel env add NEXT_PUBLIC_ADSENSE_CLIENT_ID production <<< "ca-pub-1630578712653878"
vercel env add NEXT_PUBLIC_DEBUG_MODE production <<< "false"
vercel env add NEXT_PUBLIC_AVATAR_STORAGE production <<< "vercel"

echo "Environment variables set successfully!"
echo "Remember to set BLOB_READ_WRITE_TOKEN manually from Vercel Storage dashboard"
```

## Verification

After setting variables, verify with:

```bash
# List all environment variables
vercel env ls

# Pull current production environment
vercel env pull .env.production

# Deploy to test
vercel --prod
```

## Security Best Practices

1. **REVALIDATE_SECRET**: Use a strong, random 32+ character string
2. **ADMIN_PASSWORD**: Use a complex password with mixed case, numbers, symbols
3. **Never commit**: Keep `.env.production` in `.gitignore`
4. **Rotate secrets**: Change secrets periodically
5. **Scope correctly**: Use appropriate environment scopes (production/preview/development)

## Troubleshooting

### Common Issues

1. **Environment not updating**: Redeploy after changing variables
2. **Public variables not working**: Ensure `NEXT_PUBLIC_` prefix
3. **Build failures**: Check for typos in variable names
4. **API errors**: Verify WORDPRESS_API_URL is correct

### Debug Commands

```bash
# Check current deployment environment
vercel logs --follow

# Test environment in preview
vercel env add VARIABLE_NAME preview

# Remove incorrect variable
vercel env rm VARIABLE_NAME production
```