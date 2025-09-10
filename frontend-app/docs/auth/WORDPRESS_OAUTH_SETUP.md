# WordPress.com OAuth App Registration Guide

## Issue
Client ID 69634 doesn't accept our redirect URI. We need to register our own WordPress.com OAuth application.

## Step-by-Step Registration

### 1. Go to WordPress.com Developer Console
Visit: https://developer.wordpress.com/apps/

### 2. Create New Application
Click "Create New Application" button

### 3. Fill in Application Details
```
Application Name: Medialternatives Analytics Dashboard
Description: Analytics dashboard for medialternatives.com with Jetpack integration
Website URL: http://localhost:3000 (for development)
Redirect URLs: http://localhost:3000
Javascript Origins: http://localhost:3000
Type: Web Application
```

### 4. Application Settings
- **Grant Type**: Authorization Code (for implicit flow)
- **Scope**: Read access to stats
- **Blog**: medialternatives.wordpress.com (if prompted)

### 5. Get Your Credentials
After creation, you'll receive:
- **Client ID**: (e.g., 12345)
- **Client Secret**: (not needed for implicit flow, but provided)

### 6. Update Environment Variables
Add to your `.env.local`:
```bash
WORDPRESS_COM_CLIENT_ID=your-new-client-id
WORDPRESS_COM_REDIRECT_URI=http://localhost:3000
```

### 7. Update Code
We'll update the code to use your new client ID instead of 69634.

## Alternative: Try WordPress.com's Official Client ID

If registration is complex, we can also try some other approaches:
1. Use WordPress.com's official documentation examples
2. Check if there's a public development client ID
3. Use a different OAuth flow

## Production Setup
For production deployment, you'll need to:
1. Update redirect URI to your production domain
2. Update website URL to your production domain
3. Set environment variables in Vercel/deployment platform

## Troubleshooting
- Make sure redirect URI exactly matches what you enter in the app
- Use http:// for localhost (not https://)
- Don't include trailing slashes
- Client ID should be just numbers (no quotes or spaces)