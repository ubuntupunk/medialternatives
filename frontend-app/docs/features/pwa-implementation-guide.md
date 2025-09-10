# PWA Implementation Guide - Medialternatives

## Overview

Medialternatives has been implemented as a Progressive Web App (PWA) to provide a native app-like experience with robust offline functionality. This is particularly important for our Global South audience who may experience intermittent connectivity or limited data plans.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Caching Strategy](#caching-strategy)
5. [Components](#components)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Performance](#performance)
10. [Future Enhancements](#future-enhancements)

## Features

### ✅ Implemented Features

- **📱 Add to Home Screen** - Smart installation prompts for mobile devices
- **🌐 Offline Reading** - Access previously loaded articles without internet
- **⚡ Intelligent Caching** - Multiple caching strategies for optimal performance
- **🔔 Connection Status** - Visual indicators for online/offline state
- **📊 Background Sync** - Automatic content updates when connection restored
- **🎨 Native App Feel** - Full-screen standalone mode
- **📱 Cross-Platform** - Works on iOS, Android, and desktop

### 🎯 Target Benefits

- **Global South Accessibility** - Works with poor/intermittent connections
- **Data Conservation** - Reduces bandwidth usage through intelligent caching
- **Performance** - Lightning-fast loading from cache
- **User Engagement** - Native app experience increases retention

## Architecture

### Core Technologies

- **Next.js 15** - React framework with built-in optimizations
- **next-pwa** - PWA plugin for Next.js with Workbox integration
- **Workbox** - Google's library for adding offline support
- **Service Workers** - Background scripts for caching and offline functionality

### File Structure

```
frontend-app/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Generated service worker (auto-generated)
│   └── images/
│       ├── android-chrome-*.png
│       └── apple-touch-icon.png
├── src/
│   └── components/
│       └── UI/
│           ├── AddToHomeScreen.tsx
│           └── OfflineIndicator.tsx
├── next.config.js             # PWA configuration
└── docs/
    └── pwa-implementation-guide.md
```

## Installation

### Dependencies

```bash
bun add next-pwa workbox-webpack-plugin
```

### Configuration Files

1. **next.config.js** - PWA and caching configuration
2. **public/manifest.json** - App metadata and icons
3. **src/app/layout.tsx** - PWA meta tags and manifest link

## Caching Strategy

Our PWA implements multiple caching strategies optimized for different content types:

### 1. WordPress API (NetworkFirst - 24h)
```javascript
{
  urlPattern: /^https:\/\/public-api\.wordpress\.com\/.*$/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'wordpress-api',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    }
  }
}
```
- **Strategy**: Try network first, fallback to cache
- **Use Case**: Fresh content when online, cached content when offline
- **TTL**: 24 hours

### 2. Images (CacheFirst - 7-30 days)
```javascript
{
  urlPattern: /^https:\/\/picsum\.photos\/.*$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'images',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    }
  }
}
```
- **Strategy**: Serve from cache first, update in background
- **Use Case**: Fast image loading, reduced bandwidth
- **TTL**: 7 days for external images, 30 days for static assets

### 3. Static Resources (CacheFirst - 30 days)
```javascript
{
  urlPattern: /\.(?:js|css|woff|woff2|ttf|eot)$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'static-resources',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    }
  }
}
```
- **Strategy**: Long-term caching for static assets
- **Use Case**: CSS, JavaScript, fonts
- **TTL**: 30 days

### 4. Individual Posts (NetworkFirst - 24h)
```javascript
{
  urlPattern: /^\/post\/.*$/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'posts',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    }
  }
}
```
- **Strategy**: Fresh content preferred, cached fallback
- **Use Case**: Individual article pages
- **TTL**: 24 hours

### 5. Homepage (NetworkFirst - 1h)
```javascript
{
  urlPattern: /^\/$/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'homepage',
    expiration: {
      maxEntries: 1,
      maxAgeSeconds: 60 * 60, // 1 hour
    }
  }
}
```
- **Strategy**: Frequent updates for latest content
- **Use Case**: Homepage with latest posts
- **TTL**: 1 hour

## Components

### AddToHomeScreen Component

**Location**: `src/components/UI/AddToHomeScreen.tsx`

**Features**:
- Detects PWA installation capability
- Shows platform-specific installation instructions
- Handles iOS Safari manual installation
- Remembers user dismissal (24-hour cooldown)
- Auto-hides if already installed

**Usage**:
```tsx
import AddToHomeScreen from '@/components/UI/AddToHomeScreen';

// Automatically included in Layout component
<AddToHomeScreen />
```

**Detection Logic**:
- **Android/Chrome**: Uses `beforeinstallprompt` event
- **iOS Safari**: Shows manual instructions
- **Desktop**: Browser-specific prompts
- **Already Installed**: Detects standalone mode

### OfflineIndicator Component

**Location**: `src/components/UI/OfflineIndicator.tsx`

**Features**:
- Real-time connection status monitoring
- Visual offline/online notifications
- Dismissible "back online" banner
- Positioned at top of viewport

**Usage**:
```tsx
import OfflineIndicator from '@/components/UI/OfflineIndicator';

// Automatically included in Layout component
<OfflineIndicator />
```

**States**:
- **Online**: Hidden (normal operation)
- **Offline**: Yellow banner - "📱 You're offline. Reading cached articles."
- **Back Online**: Green banner - "🟢 Back online! Content is now fresh."

## Configuration

### PWA Manifest (public/manifest.json)

```json
{
  "name": "Medialternatives - Reaching out from the Global South",
  "short_name": "Medialternatives",
  "description": "Media activism and alternative journalism from the Global South",
  "theme_color": "#e3e3e3",
  "background_color": "#e3e3e3",
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
  "orientation": "portrait-primary",
  "categories": ["news", "education", "lifestyle"],
  "lang": "en-US"
}
```

### Meta Tags (src/app/layout.tsx)

```tsx
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#e3e3e3" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Medialternatives" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
```

### Next.js Configuration

The PWA is configured in `next.config.js` using the `next-pwa` plugin:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Caching strategies defined here
  ],
});

module.exports = withPWA(nextConfig);
```

**Key Settings**:
- **dest**: Service worker files generated in `public/`
- **register**: Automatically register service worker
- **skipWaiting**: Update service worker immediately
- **disable**: Disabled in development for easier debugging

## Testing

### Manual Testing

1. **Installation Test**:
   ```bash
   # Build and serve the app
   bun run build
   bun run start
   
   # Visit http://localhost:3000
   # Look for "Add to Home Screen" popup after 3 seconds
   ```

2. **Offline Test**:
   ```bash
   # 1. Visit site and browse several articles
   # 2. Open browser DevTools > Network tab
   # 3. Check "Offline" checkbox
   # 4. Navigate to previously visited pages
   # 5. Verify content loads from cache
   ```

3. **Cache Inspection**:
   ```bash
   # Chrome DevTools > Application > Storage
   # Check Cache Storage for:
   # - wordpress-api
   # - images
   # - static-resources
   # - posts
   # - homepage
   ```

### Automated Testing

```bash
# Test PWA functionality
bun test AddToHomeScreen.test.tsx
bun test OfflineIndicator.test.tsx

# Lighthouse PWA audit
npx lighthouse http://localhost:3000 --only-categories=pwa
```

### Browser Compatibility

| Browser | Installation | Offline | Service Worker |
|---------|-------------|---------|----------------|
| Chrome (Android) | ✅ Native | ✅ Full | ✅ Full |
| Safari (iOS) | ⚠️ Manual | ✅ Full | ✅ Full |
| Firefox | ✅ Native | ✅ Full | ✅ Full |
| Edge | ✅ Native | ✅ Full | ✅ Full |
| Samsung Internet | ✅ Native | ✅ Full | ✅ Full |

## Troubleshooting

### Common Issues

1. **Service Worker Not Updating**:
   ```bash
   # Clear browser cache and hard refresh
   # Or use DevTools > Application > Service Workers > Update
   ```

2. **Installation Prompt Not Showing**:
   ```javascript
   // Check browser console for errors
   // Verify HTTPS (required for PWA)
   // Check manifest.json validity
   ```

3. **Offline Content Not Loading**:
   ```bash
   # Verify cache in DevTools > Application > Cache Storage
   # Check Network tab for failed requests
   # Ensure content was previously visited while online
   ```

4. **iOS Installation Issues**:
   ```bash
   # Ensure apple-touch-icon.png exists
   # Verify apple-mobile-web-app meta tags
   # Check Safari > Share > Add to Home Screen
   ```

### Debug Mode

Enable PWA debugging in development:

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  disable: false, // Enable in development
  // ... other options
});
```

### Cache Management

```javascript
// Clear specific cache
caches.delete('wordpress-api');

// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Performance

### Metrics

Our PWA implementation targets these performance metrics:

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to Interactive (TTI)**: < 3.5s

### Optimization Strategies

1. **Intelligent Caching**: Different strategies for different content types
2. **Resource Prioritization**: Critical resources cached with longer TTL
3. **Image Optimization**: Next.js Image component with caching
4. **Code Splitting**: Dynamic imports for non-critical components
5. **Compression**: Gzip/Brotli compression for all assets

### Cache Storage Limits

- **Chrome**: ~6% of free disk space
- **Firefox**: ~10% of free disk space  
- **Safari**: ~50MB per origin
- **Our Usage**: ~10-20MB for typical user

## Future Enhancements

### Planned Features

1. **🔔 Push Notifications**:
   ```javascript
   // Notify users of new articles
   // Breaking news alerts
   // Weekly digest notifications
   ```

2. **🔄 Background Sync**:
   ```javascript
   // Queue comments when offline
   // Sync when connection restored
   // Background content updates
   ```

3. **📊 Analytics Integration**:
   ```javascript
   // Track offline usage
   // Cache hit rates
   // Installation metrics
   ```

4. **🎨 Advanced Caching**:
   ```javascript
   // Predictive caching
   // User behavior-based caching
   // Category-specific strategies
   ```

### Implementation Roadmap

- **Phase 1**: ✅ Basic PWA with offline reading
- **Phase 2**: 🔄 Push notifications and background sync
- **Phase 3**: 📊 Advanced analytics and caching
- **Phase 4**: 🤖 AI-powered content prefetching

## Best Practices

### Development

1. **Always test offline functionality** during development
2. **Monitor cache sizes** to avoid storage quota issues
3. **Update service worker** when changing caching strategies
4. **Test on real devices** with poor connections
5. **Validate manifest.json** using online tools

### Production

1. **Monitor cache hit rates** through analytics
2. **Update TTL values** based on content update frequency
3. **Implement cache versioning** for major updates
4. **Provide clear offline indicators** to users
5. **Graceful degradation** for unsupported browsers

### User Experience

1. **Clear installation prompts** with value proposition
2. **Visible offline indicators** to set expectations
3. **Fast cache loading** for instant perceived performance
4. **Helpful error messages** when content unavailable
5. **Seamless online/offline transitions**

## Resources

### Documentation
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Guide](https://developers.google.com/web/tools/workbox)
- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)

### Testing
- [PWA Testing Guide](https://web.dev/pwa-checklist/)
- [Service Worker Testing](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Medialternatives Development Team