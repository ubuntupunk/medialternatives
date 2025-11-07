# WordPress.com OAuth Debugging Guide

## Current Configuration Analysis

From your `.env.local`:
- **Client ID**: `122122`
- **Client Secret**: `PF8PyDBDQDBsFhRd7DrBGNx4GcjmiV51dplgSl3AOd9NPtZ6mMxRRbsbZY1nu83x`

## Issue Diagnosis

The error shows you're getting `read` scope but need `stats` scope. This suggests:

1. **OAuth app is working** (you're getting authenticated)
2. **Scope configuration issue** (not getting the right permissions)
3. **WordPress.com app settings** may need updating

## Step 1: Test Current OAuth App

Run this in browser console on your dashboard:

```javascript
// Test current OAuth URL generation
const authUrl = new URL('https://public-api.wordpress.com/oauth2/authorize');
authUrl.searchParams.set('client_id', '122122');
authUrl.searchParams.set('redirect_uri', window.location.origin + '/dashboard/analytics');
authUrl.searchParams.set('response_type', 'token');
authUrl.searchParams.set('scope', 'read,global');
authUrl.searchParams.set('blog', 'medialternatives.wordpress.com');
authUrl.searchParams.set('state', 'test-' + Date.now());

console.log('Test OAuth URL:', authUrl.toString());
// Copy this URL and test it manually
```

## Step 2: Check WordPress.com App Settings

1. **Visit**: https://developer.wordpress.com/apps/
2. **Find your app** with Client ID `122122`
3. **Check these settings**:
   - **Redirect URLs**: Must include `http://localhost:3000/dashboard/analytics` and `https://medialternatives.com/dashboard/analytics`
   - **Scopes**: Should allow `read`, `global`, and ideally `stats`
   - **Site Association**: Should be linked to `medialternatives.wordpress.com`

## Step 3: Alternative Scope Configurations

Try these scope combinations (one at a time):

### Option A: Just Read (Current)
```
scope=read
```

### Option B: Read + Global (Our Current Fix)
```
scope=read,global
```

### Option C: All Available Scopes
```
scope=read,write,global
```

## Step 4: WordPress.com API Endpoint Testing

Test different API endpoints to see what works:

```javascript
// Test 1: Public posts (should work without auth)
fetch('https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com/posts?per_page=1')
  .then(r => r.json())
  .then(d => console.log('Public posts:', d));

// Test 2: Stats with current token (will fail)
const token = localStorage.getItem('wp_oauth_token');
if (token) {
  fetch('https://public-api.wordpress.com/rest/v1.1/sites/245834125/stats/summary', {
    headers: { 'Authorization': `Bearer ${JSON.parse(token).accessToken}` }
  })
  .then(r => r.json())
  .then(d => console.log('Stats result:', d));
}
```

## Step 5: Jetpack Connection Check

The stats API requires Jetpack. Check if your site has Jetpack properly connected:

1. **WordPress.com Admin**: Go to your site admin
2. **Jetpack Settings**: Verify Jetpack is connected
3. **Stats Module**: Ensure Jetpack Stats is enabled

## Step 6: Alternative Solutions

If OAuth continues to have scope issues:

### Solution A: Use WordPress.com REST API v2
```javascript
// Instead of stats API, calculate from posts
const posts = await fetch('https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com/posts?per_page=100');
const analytics = {
  totalPosts: posts.length,
  recentPosts: posts.filter(p => new Date(p.date) > new Date(Date.now() - 30*24*60*60*1000)).length
};
```

### Solution B: Google Analytics Only
- Keep WordPress.com for content
- Use Google Analytics for all statistics
- Simpler and more reliable

### Solution C: Manual Stats Collection
- Track page views with custom implementation
- Store in local database or service
- More control over data

## Expected Outcomes

### If OAuth App is Valid:
- You'll be redirected to WordPress.com
- You'll see permission request screen
- You'll be redirected back with token

### If OAuth App is Invalid:
- You'll get "Invalid client_id" error
- Need to re-register the application

### If Scope Issue:
- Authentication works but API calls fail
- Need to update app permissions on WordPress.com

## Next Steps Based on Results

1. **OAuth URL works**: App is valid, focus on scope configuration
2. **OAuth URL fails**: Need to re-register or fix app settings
3. **Scope still insufficient**: Consider alternative approaches