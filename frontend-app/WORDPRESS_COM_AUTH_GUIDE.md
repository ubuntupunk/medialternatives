# WordPress.com Authentication Guide

## Your Site: medialternatives.wordpress.com

Since your site is hosted on WordPress.com, you have several authentication options. Here's the step-by-step guide for each method:

## 🚀 Method 1: Application Passwords (Recommended - Easiest)

### Why This Method?
- ✅ **Simplest setup** (5 minutes)
- ✅ **Most secure** (revokable, scoped)
- ✅ **No OAuth complexity**
- ✅ **Works immediately**

### Steps:
1. **Go to WordPress.com Settings**
   - Visit: https://wordpress.com/me/security
   - Login with your WordPress.com account

2. **Create Application Password**
   - Scroll to "Application Passwords"
   - Click "Add New Application Password"
   - Name: "Medialternatives Dashboard"
   - Click "Add New Password"

3. **Copy the Generated Password**
   - You'll get something like: `abcd 1234 efgh 5678`
   - **Save this immediately** (you can't see it again)

4. **Add to Environment Variables**
   ```bash
   # Add to your .env.local file
   WORDPRESS_COM_USERNAME=your-wordpress-username
   WORDPRESS_COM_APP_PASSWORD=abcd-1234-efgh-5678
   ```

5. **Test the Connection**
   - The dashboard will automatically use these credentials
   - No additional setup required!

---

## 🔐 Method 2: WordPress.com OAuth (Production-Grade)

### Why This Method?
- ✅ **Most professional** (like "Login with Google")
- ✅ **User-friendly** (no password sharing)
- ✅ **Scalable** (multiple users)
- ❌ **More complex setup**

### Steps:

#### Step 1: Create WordPress.com OAuth App
1. **Go to WordPress.com Developer Console**
   - Visit: https://developer.wordpress.com/apps/
   - Login with your WordPress.com account

2. **Create New Application**
   - Click "Create New Application"
   - Fill out the form:
     ```
     Name: Medialternatives Analytics Dashboard
     Description: Analytics dashboard for medialternatives.com
     Website URL: https://your-dashboard-domain.com
     Redirect URLs: https://your-dashboard-domain.com/api/jetpack-auth/callback
     Javascript Origins: https://your-dashboard-domain.com
     ```

3. **Get Your Credentials**
   - After creation, you'll get:
     - **Client ID**: `12345`
     - **Client Secret**: `abcdef123456`

#### Step 2: Configure Environment Variables
```bash
# Add to your .env.local file
WORDPRESS_COM_CLIENT_ID=12345
WORDPRESS_COM_CLIENT_SECRET=abcdef123456
WORDPRESS_COM_REDIRECT_URI=http://localhost:3000/api/jetpack-auth/callback
```

#### Step 3: Test OAuth Flow
1. Go to your dashboard Jetpack tab
2. Click "Connect WordPress.com"
3. Authorize the app on WordPress.com
4. You'll be redirected back with an access token

---

## 🛠️ Method 3: Manual Nonce Extraction (Quick Testing)

### Why This Method?
- ✅ **Immediate access** (works right now)
- ✅ **No app setup required**
- ❌ **Temporary** (expires in 24 hours)
- ❌ **Manual process**

### Steps:

#### Step 1: Access WordPress Admin
1. **Go to your WordPress.com dashboard**
   - Visit: https://wordpress.com/stats/medialternatives.wordpress.com
   - Login to your account

#### Step 2: Extract Nonce from Browser
1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Type this command:**
   ```javascript
   // Check if nonce is available
   console.log('WP API Nonce:', window.Initial_State?.WP_API_nonce);
   console.log('API Root:', window.Initial_State?.WP_API_root);
   ```

4. **Copy the nonce value** (something like: `abc123def456`)

#### Step 3: Extract Authentication Cookie
1. **Go to Network tab** in Developer Tools
2. **Refresh the page**
3. **Find any request to wordpress.com**
4. **Look at Request Headers**
5. **Copy the Cookie header** (long string starting with `wordpress_logged_in_...`)

#### Step 4: Add to Environment Variables
```bash
# Add to your .env.local file
WP_API_NONCE=abc123def456
WP_AUTH_COOKIE=wordpress_logged_in_12345=username%7C1234567890%7C...
WP_API_ROOT=https://medialternatives.wordpress.com/wp-json/wp/v2
```

---

## 🔑 Method 4: WordPress.com API Key (If Available)

### Check if you have API access:
1. **Go to WordPress.com Settings**
   - Visit: https://wordpress.com/me/security
   - Look for "API Keys" or "Developer Tools"

2. **If available, create an API key**
   - Follow the prompts to generate a key
   - Add to environment variables:
   ```bash
   WORDPRESS_COM_API_KEY=your-api-key-here
   ```

---

## 🧪 Testing Your Authentication

### After setting up any method, test it:

1. **Restart your development server**
   ```bash
   npm run dev
   ```

2. **Go to Analytics Dashboard**
   - Navigate to `/dashboard/analytics`
   - Click on "Jetpack Analytics" tab

3. **Check Authentication Status**
   - Click "Check Status" button
   - Should show "Connected" if working

4. **Load Real Data**
   - Click "Refresh Data" button
   - Should load real stats from WordPress.com

---

## 🎯 Recommended Approach

### For Development/Testing:
1. **Start with Application Passwords** (Method 1)
   - Quickest to set up
   - Most reliable
   - Easy to revoke if needed

### For Production:
1. **Use OAuth** (Method 2)
   - More professional
   - Better user experience
   - Scalable for multiple users

### For Quick Testing:
1. **Use Nonce Extraction** (Method 3)
   - Immediate access
   - Good for proof-of-concept
   - Remember to refresh every 24 hours

---

## 🔧 Environment Variables Summary

Choose ONE of these sets:

### Option A: Application Passwords
```bash
WORDPRESS_COM_USERNAME=your-username
WORDPRESS_COM_APP_PASSWORD=abcd-1234-efgh-5678
```

### Option B: OAuth
```bash
WORDPRESS_COM_CLIENT_ID=12345
WORDPRESS_COM_CLIENT_SECRET=abcdef123456
WORDPRESS_COM_REDIRECT_URI=http://localhost:3000/api/jetpack-auth/callback
```

### Option C: Nonce + Cookie
```bash
WP_API_NONCE=abc123def456
WP_AUTH_COOKIE=wordpress_logged_in_12345=...
WP_API_ROOT=https://medialternatives.wordpress.com/wp-json/wp/v2
```

---

## 🚨 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check environment variables are set correctly
   - Restart development server
   - Verify credentials are still valid

2. **"Permission denied"**
   - Ensure your WordPress.com account has admin access
   - Check if site has Jetpack Stats enabled

3. **"Nonce expired"**
   - Re-extract nonce from WordPress admin
   - Nonces expire every 24 hours

4. **"CORS errors"**
   - Make sure redirect URI matches exactly
   - Check if site allows API access

### Need Help?
- Check the browser console for detailed error messages
- Test authentication status with the "Check Status" button
- Try demo mode first to ensure UI is working

---

## 🎉 Next Steps

Once authenticated, you'll have access to:
- ✅ **Real visitor statistics**
- ✅ **Top posts and pages**
- ✅ **Referrer analysis**
- ✅ **Search terms data**
- ✅ **Engagement metrics** (likes, comments)

The dashboard will automatically switch from mock data to live WordPress.com analytics!