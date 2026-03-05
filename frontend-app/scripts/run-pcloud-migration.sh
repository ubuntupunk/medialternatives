#!/bin/bash

# pCloud PDF Migration Runner Script
# This script sets up environment and runs the pCloud migration

echo "🚀 Starting pCloud PDF Migration for Medialternatives"
echo "=================================================="

# Check if .env file exists
if [ ! -f "frontend-app/.env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create frontend-app/.env.local with your pCloud credentials:"
    echo ""
    echo "# pCloud Storage Configuration"
    echo "PCLOUD_ACCESS_TOKEN=your_pcloud_oauth_token"
    echo "# OR"
    echo "PCLOUD_USERNAME=your_pcloud_username"
    echo "PCLOUD_PASSWORD=your_pcloud_password"
    echo ""
    exit 1
fi

# Check if pcloud-sdk-js is installed
cd frontend-app
if [ ! -d "node_modules/pcloud-sdk-js" ]; then
    echo "📦 Installing pCloud SDK..."
    bun add pcloud-sdk-js dotenv
fi

# Check pCloud OAuth2 credentials
echo "🔐 Checking pCloud OAuth2 credentials..."
if ! grep -q "PCLOUD_CLIENT_ID\|PCLOUD_ACCESS_TOKEN" .env.local; then
    echo "⚠️  Warning: No pCloud OAuth2 credentials found in .env.local"
    echo ""
    echo "You need either:"
    echo "  1. OAuth2 App Credentials:"
    echo "     PCLOUD_CLIENT_ID=your_client_id"
    echo "     PCLOUD_CLIENT_SECRET=your_client_secret"
    echo "  2. OR existing Access Token:"
    echo "     PCLOUD_ACCESS_TOKEN=your_access_token"
    echo ""
    echo "To set up pCloud access (Client ID required):"
    echo "  1. Create pCloud app at: https://docs.pcloud.com/"
    echo "  2. Get Client ID and Client Secret"
    echo "  3. Run setup:"
    echo "     Option A (Recommended): node scripts/pcloud-oauth-server.js"
    echo "     Option B (Manual): node scripts/setup-pcloud-oauth.js"
    echo "  4. Follow the setup instructions"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Run OAuth2 setup first: node scripts/setup-pcloud-oauth.js"
        exit 1
    fi
fi

# Run the migration
echo "📄 Starting PDF migration to pCloud..."
echo "This will:"
echo "  1. Download 32 PDF files from medialternatives.com"
echo "  2. Upload them to your pCloud storage"
echo "  3. Generate URL mappings for updating case.md"
echo "  4. Create organized folder structure"
echo ""

read -p "Proceed with migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

# Run the migration script
echo "🔄 Running migration..."
node scripts/migrate-pdfs-pcloud.js

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📁 Generated files:"
    ls -la pdf-*.json pcloud-*.json migration-*.json 2>/dev/null || echo "  (No mapping files found - check migration output)"
    echo ""
    echo "🔄 Next steps:"
    echo "  1. Review the migration report"
    echo "  2. Update case.md with new pCloud URLs"
    echo "  3. Test download functionality"
    echo "  4. Deploy updated content"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Check the error messages above and:"
    echo "  1. Verify pCloud credentials"
    echo "  2. Check internet connection"
    echo "  3. Ensure pCloud account has sufficient storage"
    exit 1
fi