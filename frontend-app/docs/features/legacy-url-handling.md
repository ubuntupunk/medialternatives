# Legacy URL Handling Guide

## Problem Statement

WordPress.com uses date-based URLs like:
- `https://medialternatives.wordpress.com/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/`

But our new Next.js site uses clean URLs like:
- `https://medialternatives.com/apartheid-the-nazis-and-mcebo-dlamini`

This creates 404 errors for existing bookmarks and external links.

## Solution Implemented

### 1. **Date-Based Route Handler**

**File**: `src/app/[year]/[month]/[day]/[slug]/page.tsx`

Handles URLs in the format: `/YYYY/MM/DD/post-slug/`

### 2. **Intelligent Post Matching**

**File**: `src/utils/legacyUrlMatcher.ts`

Uses multiple strategies to find the correct post:

#### Strategy 1: Exact Slug Match (100% confidence)
```typescript
// Try to find post with exact slug
const post = await wordpressApi.getPost(slug);
```

#### Strategy 2: Title Search (60-90% confidence)
```typescript
// Search by keywords from slug
const searchTerms = slug.replace(/-/g, ' ');
const posts = await wordpressApi.searchPosts(searchTerms);
```

#### Strategy 3: Date Match (30-80% confidence)
```typescript
// Find posts published on specific date
const posts = await wordpressApi.getPosts({
  after: `${dateString}T00:00:00`,
  before: `${dateString}T23:59:59`
});
```

#### Strategy 4: Fuzzy Matching (50-80% confidence)
```typescript
// Try common slug variations
const variations = generateSlugVariations(slug);
```

### 3. **Known Mappings**

For problematic URLs, we maintain a manual mapping:

```typescript
export const KNOWN_LEGACY_MAPPINGS: Record<string, string> = {
  'apartheid-the-nazis-and-mcebo-dlamini': 'apartheid-the-nazis-and-mcebo-dlamini',
  // Add more as discovered
};
```

### 4. **Middleware Integration**

**File**: `src/middleware.ts`

Detects date-based URLs and routes them to the handler:

```typescript
const dateUrlPattern = /^\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/([^\/]+)\/?$/;
const dateMatch = pathname.match(dateUrlPattern);
```

## URL Examples

### ✅ Handled Automatically
- `/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/` → `/apartheid-the-nazis-and-mcebo-dlamini`
- `/2020/03/15/covid-19-media-response/` → `/covid-19-media-response`
- `/2018/12/01/media-freedom-report/` → `/media-freedom-report`

### 🔍 Fallback to Search
- `/2015/05/08/non-existent-post/` → `/search?q=non existent post&legacy=true`

## Testing the Solution

### Manual Testing
```bash
# Test the specific problematic URL
curl -I "https://medialternatives.com/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/"
# Should return: HTTP 301 or 302 redirect

# Test the API lookup
curl "https://medialternatives.com/api/legacy-url-lookup?url=/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/"
```

### Debugging
```bash
# Check server logs for matching process
# Look for console.log outputs showing:
# - "Processing legacy URL: /2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/"
# - "Found match with X% confidence using strategy: slug"
```

## Performance Considerations

### Caching Strategy
- Successful matches are cached in the application
- Failed lookups are cached for 5 minutes to prevent repeated API calls
- Known mappings are served instantly

### API Efficiency
- Multiple strategies run in sequence (fail-fast)
- Limits API calls with reasonable per_page limits
- Stops at first confident match (>80% confidence)

## Monitoring & Maintenance

### 1. **Track Failed Lookups**
Monitor search redirects with `legacy=true` parameter to identify patterns.

### 2. **Add Known Mappings**
When patterns emerge, add them to `KNOWN_LEGACY_MAPPINGS`:

```typescript
export const KNOWN_LEGACY_MAPPINGS: Record<string, string> = {
  'problematic-slug': 'correct-slug',
  'another-legacy-slug': 'new-clean-slug',
};
```

### 3. **Analytics Integration**
Track legacy URL usage:

```javascript
// In Google Analytics
gtag('event', 'legacy_url_redirect', {
  'legacy_url': legacyUrl,
  'new_url': newUrl,
  'confidence': confidence,
  'strategy': strategy
});
```

## Common Issues & Solutions

### Issue 1: Post Not Found
**Problem**: Legacy URL doesn't match any post
**Solution**: Falls back to search page with keywords

### Issue 2: Multiple Matches
**Problem**: Search returns multiple similar posts
**Solution**: Uses confidence scoring to pick best match

### Issue 3: Date Mismatch
**Problem**: Post exists but published on different date
**Solution**: Title search strategy finds it regardless of date

### Issue 4: Slug Variations
**Problem**: WordPress.com slug differs from current slug
**Solution**: Fuzzy matching with common variations

## Advanced Features

### 1. **Confidence Scoring**
Each match includes a confidence score (0-100):
- 100: Exact slug match
- 80-99: High confidence fuzzy match
- 60-79: Good title/content match
- 30-59: Possible date/keyword match
- <30: Redirect to search

### 2. **Strategy Reporting**
Each redirect logs which strategy was used:
- `exact_slug`: Direct slug match
- `title_search`: Found via search
- `date_match`: Found by publication date
- `fuzzy_match`: Found via slug variations

### 3. **Fallback Chain**
1. Known mappings (instant)
2. Exact slug match (fast)
3. Title search (medium)
4. Date-based search (slower)
5. Fuzzy matching (slowest)
6. Search page (fallback)

## SEO Benefits

### 1. **301 Redirects**
Proper 301 redirects preserve SEO value from legacy URLs.

### 2. **No Broken Links**
External sites linking to old URLs continue to work.

### 3. **User Experience**
Bookmarks and shared links continue to function.

### 4. **Search Engine Signals**
Search engines understand the URL structure change.

## Future Enhancements

### 1. **Bulk URL Mapping**
Create a comprehensive mapping file for all legacy URLs:

```typescript
// Generate from WordPress.com sitemap
const legacyMappings = await generateMappingsFromSitemap();
```

### 2. **Machine Learning**
Use ML to improve matching accuracy over time:

```typescript
// Learn from successful matches
const improvedMatch = await mlMatcher.findBestMatch(legacyUrl);
```

### 3. **Real-time Sync**
Sync with WordPress.com to handle new posts automatically:

```typescript
// Webhook from WordPress.com
await syncNewPost(wordpressPost);
```

This comprehensive solution ensures that all legacy WordPress.com URLs continue to work while providing the best possible user experience and maintaining SEO value.