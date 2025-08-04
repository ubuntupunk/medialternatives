# WordPress.com OAuth Debug

## Error Encountered
```
Invalid request, please go back and try again.
Error Code: invalid_request
Error Message: Mismatch in redirect_uri.
```

## Current Configuration
- **Client ID**: 69634 (WordPress.com public client)
- **Redirect URI**: http://localhost:3000/dashboard/analytics
- **Response Type**: token (implicit flow)
- **Scope**: read
- **Blog**: medialternatives.wordpress.com

## Possible Issues

### 1. Client ID 69634 May Be Outdated
The Grasshopper project might have used a different client ID, or this public client ID might no longer be valid.

### 2. Redirect URI Not Registered
WordPress.com OAuth requires exact redirect URI matches. Our localhost URL might not be registered.

### 3. Need to Register Our Own App
We might need to create our own WordPress.com OAuth application instead of using a public one.

## Solutions to Try

### Option A: Register Our Own WordPress.com App
1. Go to https://developer.wordpress.com/apps/
2. Create new application
3. Set redirect URI to: http://localhost:3000/dashboard/analytics
4. Use our own client ID

### Option B: Use WordPress.com's Standard Redirect
Some OAuth providers have standard redirect URIs like:
- http://localhost:3000
- http://127.0.0.1:3000
- Or a specific callback path

### Option C: Check Grasshopper's Actual Implementation
Look at the real Grasshopper code to see:
- What client ID they use
- What redirect URI they use
- If they register their own app

## WordPress.com OAuth Documentation
- https://developer.wordpress.com/docs/oauth2/
- https://developer.wordpress.com/apps/

## Next Steps
1. Try registering our own WordPress.com OAuth app
2. Use exact redirect URI match
3. Test with registered client ID/secret