#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this script to set all required production environment variables

echo "🚀 Setting up Vercel environment variables for production..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Generate secure secrets
REVALIDATE_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "🔐 Generated secure revalidation secret: $REVALIDATE_SECRET"

echo "📝 Setting environment variables..."

# Core WordPress configuration
echo "Setting WORDPRESS_API_URL..."
echo "https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com" | vercel env add WORDPRESS_API_URL production

# Security variables
echo "Setting REVALIDATE_SECRET..."
echo "$REVALIDATE_SECRET" | vercel env add REVALIDATE_SECRET production

echo "Setting ADMIN_PASSWORD..."
echo "MediaActivist2024!SecurePass" | vercel env add ADMIN_PASSWORD production

# Public variables (NEXT_PUBLIC_*)
echo "Setting NEXT_PUBLIC_GOOGLE_ANALYTICS_ID..."
echo "G-CZNQG5YM3Z" | vercel env add NEXT_PUBLIC_GOOGLE_ANALYTICS_ID production

echo "Setting NEXT_PUBLIC_ADSENSE_CLIENT_ID..."
echo "ca-pub-1630578712653878" | vercel env add NEXT_PUBLIC_ADSENSE_CLIENT_ID production

echo "Setting NEXT_PUBLIC_DEBUG_MODE..."
echo "false" | vercel env add NEXT_PUBLIC_DEBUG_MODE production

echo "Setting NEXT_PUBLIC_AVATAR_STORAGE..."
echo "vercel" | vercel env add NEXT_PUBLIC_AVATAR_STORAGE production

echo "Setting NODE_ENV..."
echo "production" | vercel env add NODE_ENV production

echo "✅ Environment variables set successfully!"
echo ""
echo "📋 IMPORTANT NEXT STEPS:"
echo "1. Set BLOB_READ_WRITE_TOKEN manually from Vercel Storage dashboard"
echo "2. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET if using AdSense"
echo "3. Save this revalidation secret for webhook setup: $REVALIDATE_SECRET"
echo ""
echo "🔗 Webhook URL for WordPress.com:"
echo "https://your-domain.com/api/revalidate"
echo ""
echo "🚀 Deploy to production:"
echo "vercel --prod"