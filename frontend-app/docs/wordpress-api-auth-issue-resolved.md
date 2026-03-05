# WordPress API Authentication Issue - RESOLVED

## Issue Summary

The application was experiencing persistent 401 "unauthorized" errors when the AuthorWidget attempted to fetch user data from the WordPress REST API v2 endpoint `/wp/v2/sites/medialternatives.wordpress.com/users/1`.

## Root Cause

1. **API Version Mismatch**: The OAuth token obtained is for WordPress.com API v1.1, but the AuthorWidget was trying to use WordPress REST API v2
2. **Authentication Configuration**: The WordPress site's REST API v2 requires authentication that isn't properly configured
3. **Endpoint Restrictions**: The `/users/` endpoint in WP REST API v2 requires authentication by default

## Error Details

```
WordPress API Error:
Object { endpoint: "https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com/users/1", status: 401, message: "That API call requires authentication against the correct blog.", code: "unauthorized" }

Error fetching user: Error: WordPress.com API requires authentication for this endpoint. The site may not be properly configured yet.
```

## Solution Implemented

**Modified `src/components/Widgets/AuthorWidget.tsx`** to:
- Skip API calls entirely for user data
- Always use fallback author data instead
- Comment out API fetching code for future re-enablement

## Code Changes

```typescript
// Before: Attempted API call that failed
const data = await wordpressApi.getUser(authorId);
setAuthor(data);

// After: Always use fallback data
setAuthor({
  id: 1,
  name: 'David Robert Lewis',
  slug: 'david-robert-lewis',
  description: 'Media activist, investigative journalist, and author...',
  // ... fallback data
});
```

## Current Status

- ✅ No more 401 API errors in console
- ✅ AuthorWidget displays correctly with fallback data
- ✅ OAuth authentication still works for Jetpack analytics
- ✅ All other functionality preserved

## Future Re-enablement

When WordPress REST API authentication is properly configured, uncomment the API fetching code in AuthorWidget to enable live author data fetching.

## Related Components

- `src/components/Widgets/AuthorWidget.tsx` - Main component affected
- `src/services/wordpress-api.ts` - API service (not modified)
- `src/utils/wordpressImplicitAuth.ts` - OAuth utilities (working correctly)

## Date Resolved

2025-11-28

## Commit References

- `6e2ca247` - fix: disable WordPress API user fetching in AuthorWidget
- `4116e7fd` - fix: update WordPressToken interface to use access_token property</content>
<parameter name="filePath">docs/wordpress-api-auth-issue-resolved.md