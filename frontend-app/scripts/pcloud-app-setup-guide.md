# pCloud App Setup Guide

## Confirmed: Client ID Required

After testing, pCloud requires a Client ID for all OAuth2 flows. Here's how to set up your pCloud app:

## Step 1: Create pCloud Developer Account

1. Go to [pCloud Developers](https://docs.pcloud.com/)
2. Sign in with your pCloud account
3. Navigate to the App Console/Developer Dashboard

## Step 2: Create New App

1. Click "Create New App" or similar
2. Fill in app details:
   - **App Name**: `Medialternatives PDF Migration`
   - **Description**: `Legal document migration and hosting`
   - **App Type**: `Web Application`
   - **Redirect URI**: `http://localhost:3000/auth/pcloud/callback`

## Step 3: Get Credentials

After creating the app, you'll receive:
- **Client ID**: A public identifier for your app
- **Client Secret**: A private key (keep secure)

## Step 4: Configure Environment

Add to your `frontend-app/.env.local`:

```bash
# pCloud OAuth2 App Credentials
PCLOUD_CLIENT_ID=your_client_id_here
PCLOUD_CLIENT_SECRET=your_client_secret_here
```

## Step 5: Run OAuth2 Setup

```bash
cd frontend-app
node scripts/pcloud-oauth-server.js
```

This will:
1. Start a local server at http://localhost:3000
2. Open your browser for authorization
3. Handle the OAuth2 callback
4. Generate your access token

## Step 6: Complete Setup

Copy the generated access token to your `.env.local`:

```bash
PCLOUD_ACCESS_TOKEN=your_generated_token
```

## Step 7: Run Migration

```bash
./scripts/run-pcloud-migration.sh
```

## Troubleshooting

### "Need to provide 'client_id'" Error
- This confirms Client ID is required
- Make sure you've created a pCloud app
- Check that PCLOUD_CLIENT_ID is set in .env.local

### "Invalid client_id" Error
- Verify the Client ID is correct
- Check for typos in .env.local
- Ensure the app is active in pCloud console

### "Redirect URI mismatch" Error
- Set redirect URI to: `http://localhost:3000/auth/pcloud/callback`
- Make sure it matches exactly in pCloud app settings

### "Invalid client_secret" Error
- Verify the Client Secret is correct
- Regenerate the secret if needed
- Check for extra spaces or characters

## Security Notes

- Keep your Client Secret private
- Don't commit credentials to git
- Use environment variables only
- Regenerate tokens if compromised

## Alternative: Manual Token Generation

If the automated flow doesn't work:

1. Use the authorization URL from the script
2. Complete authorization in browser
3. Copy the authorization code
4. Use the manual setup script to exchange for token

## Storage Usage

Your 10GB pCloud free tier should be sufficient for:
- 32 PDF files (~250MB estimated)
- Room for future documents
- Organized folder structure