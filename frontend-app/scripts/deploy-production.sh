#!/bin/bash

# Production Deployment Script
# Ensures environment variables are set and deploys to Vercel

echo "🚀 Production Deployment Script"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the frontend-app directory."
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "📋 Pre-deployment checklist:"
echo ""

# Check environment variables
echo "🔍 Checking environment variables..."
ENV_VARS=(
    "WORDPRESS_API_URL"
    "REVALIDATE_SECRET"
    "ADMIN_PASSWORD"
    "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"
    "NEXT_PUBLIC_ADSENSE_CLIENT_ID"
    "NEXT_PUBLIC_DEBUG_MODE"
    "NEXT_PUBLIC_AVATAR_STORAGE"
)

MISSING_VARS=()

for var in "${ENV_VARS[@]}"; do
    if vercel env ls | grep -q "$var.*production"; then
        echo "✅ $var is set"
    else
        echo "❌ $var is missing"
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo ""
    echo "❌ Missing environment variables detected!"
    echo "Run the setup script first:"
    echo "bash scripts/setup-vercel-env.sh"
    echo ""
    echo "Missing variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo ""
echo "✅ All required environment variables are set!"

# Deploy to production
echo ""
echo "🚀 Deploying to production..."
if vercel --prod; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "1. ✅ Test the site functionality"
    echo "2. ✅ Verify new posts appear (may take 5-10 minutes)"
    echo "3. ✅ Test manual revalidation endpoint"
    echo "4. ✅ Set up WordPress webhooks (see docs/wordpress-webhooks-setup.md)"
    echo ""
    echo "🔗 Useful links:"
    echo "- Vercel Dashboard: https://vercel.com/dashboard"
    echo "- Function Logs: vercel logs --follow"
    echo ""
    echo "📊 Monitor usage at: https://vercel.com/dashboard/usage"
else
    echo "❌ Deployment failed!"
    exit 1
fi