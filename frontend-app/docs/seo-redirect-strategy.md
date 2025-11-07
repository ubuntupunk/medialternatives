# SEO Redirect Strategy for URL Migration

## Problem Statement

**Original URLs**: `https://medialternatives.com/south-africas-trade-pivot`
**New URLs**: `https://medialternatives.com/post/south-africas-trade-pivot`

This URL structure change will break:
- ✅ **SEO rankings** - Search engines have indexed the old URLs
- ✅ **Bookmarks** - Users have saved the old URLs
- ✅ **External links** - Other sites link to the old URLs
- ✅ **Social shares** - Shared links use the old format

## Solution Implemented

### 1. **Automatic 301 Redirects (Middleware)**

**File**: `src/middleware.ts`

```typescript
// Automatically redirects:
// /south-africas-trade-pivot → /post/south-africas-trade-pivot
// /another-article → /post/another-article
```

**Benefits**:
- ✅ **SEO preserved** - 301 redirects pass link juice
- ✅ **User experience** - No broken links
- ✅ **Automatic** - Works for all legacy URLs
- ✅ **Performance** - Edge-level redirects (fast)

### 2. **Updated Sitemap**

**File**: `src/app/api/sitemap/route.ts`

- Generates XML sitemap with new `/post/` URLs
- Helps search engines discover the new structure
- Updates automatically when new posts are added

### 3. **Robots.txt**

**File**: `src/app/api/robots/route.ts`

- Points to the new sitemap
- Allows crawling of `/post/` URLs
- Disallows admin and API routes

## Implementation Details

### Middleware Logic

```typescript
// 1. Skip known pages and routes
const knownPages = ['/', '/blog', '/about', '/search', ...]

// 2. Check if it's already a /post/ URL
if (pathname.startsWith('/post/')) return next()

// 3. Check if it's a category/tag/author page
if (pathname.startsWith('/category/')) return next()

// 4. If it looks like a post slug, redirect
if (/^[a-z0-9-]+$/.test(slug)) {
  redirect(`/post/${slug}`, 301) // Permanent redirect
}
```

### URL Pattern Matching

**Redirected**:
- `/south-africas-trade-pivot` → `/post/south-africas-trade-pivot`
- `/media-activism-guide` → `/post/media-activism-guide`
- `/digital-storytelling` → `/post/digital-storytelling`

**Not Redirected**:
- `/blog` (known page)
- `/category/activism` (category page)
- `/author/david` (author page)
- `/page/2` (pagination)
- `/api/posts` (API route)

## SEO Benefits

### 1. **301 Redirects Preserve SEO**
- Search engines transfer ranking signals
- Link equity is maintained
- No loss of search visibility

### 2. **Canonical URLs**
- New URLs become the canonical version
- Old URLs redirect permanently
- Prevents duplicate content issues

### 3. **Updated Sitemaps**
- Search engines discover new structure
- Faster indexing of new URLs
- Better crawl efficiency

## Testing the Redirects

### Manual Testing

```bash
# Test redirect functionality
curl -I "https://medialternatives.com/south-africas-trade-pivot"
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://medialternatives.com/post/south-africas-trade-pivot

# Test known pages (should not redirect)
curl -I "https://medialternatives.com/blog"
# Should return: HTTP/1.1 200 OK
```

### Automated Testing

```bash
# Test multiple URLs
for slug in "south-africas-trade-pivot" "media-activism" "digital-story"; do
  echo "Testing /$slug"
  curl -I "https://medialternatives.com/$slug" | grep -E "(HTTP|Location)"
done
```

## Monitoring & Analytics

### 1. **Google Search Console**
- Monitor crawl errors
- Check redirect status
- Track ranking changes

### 2. **Google Analytics**
- Set up redirect tracking
- Monitor traffic patterns
- Track 404 errors

### 3. **Server Logs**
- Monitor redirect performance
- Check for redirect loops
- Identify missed URLs

## Alternative Solutions Considered

### Option 1: **Vercel Redirects** (Not Chosen)
```json
// vercel.json
{
  "redirects": [
    {
      "source": "/:slug",
      "destination": "/post/:slug",
      "permanent": true
    }
  ]
}
```
**Why not chosen**: Too broad, would redirect everything

### Option 2: **Next.js Rewrites** (Not Chosen)
```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/:slug',
      destination: '/post/:slug',
    },
  ]
}
```
**Why not chosen**: Rewrites don't help with SEO (same URL)

### Option 3: **Database Mapping** (Overkill)
- Store old URL → new URL mappings
- Query database for each request
- **Why not chosen**: Unnecessary complexity

## Deployment Checklist

### Pre-Deployment
- [ ] Test middleware locally
- [ ] Verify redirect logic
- [ ] Check known pages don't redirect
- [ ] Test sitemap generation

### Post-Deployment
- [ ] Test live redirects
- [ ] Submit new sitemap to Google
- [ ] Monitor Search Console
- [ ] Check Analytics for 404s
- [ ] Update any internal links

### Long-term Monitoring
- [ ] Weekly Search Console review
- [ ] Monthly SEO ranking check
- [ ] Quarterly redirect audit
- [ ] Update sitemap as needed

## Expected Timeline

### Immediate (0-7 days)
- Redirects active
- Search engines discover redirects
- User experience improved

### Short-term (1-4 weeks)
- Search engines re-index new URLs
- Rankings stabilize
- Old URLs show redirect status

### Long-term (1-3 months)
- Full SEO value transferred
- Old URLs removed from search results
- New URL structure fully established

## Success Metrics

### Technical
- ✅ **0 broken links** from old URLs
- ✅ **301 redirect status** for all legacy URLs
- ✅ **Fast redirect response** (< 100ms)
- ✅ **No redirect loops**

### SEO
- ✅ **Maintained rankings** for key terms
- ✅ **Reduced 404 errors** in Search Console
- ✅ **Improved crawl efficiency**
- ✅ **Updated search results** showing new URLs

This comprehensive redirect strategy ensures a smooth transition from the old URL structure to the new one while preserving SEO value and user experience.