# WordPress.com Comprehensive OAuth Application Setup

## 🎯 Dashboard Features Requiring WordPress.com API Access

Based on audit of the codebase, here are all the areas where we need WordPress.com API integration:

### 📊 **Analytics & Stats** (Currently Implementing)
- **Jetpack Analytics**: Views, visitors, top posts, referrers
- **Real-time stats**: Live visitor tracking
- **Historical data**: Period comparisons, trends
- **Required Scopes**: `read:stats`

### 🖼️ **Media Management** (Unimplemented)
**Files Found**: 
- `src/app/api/update-post-image/route.ts` - "WordPress.com media upload not implemented"
- `src/app/api/generate-post-image/route.ts` - "WordPress.com API call to update featured image"

**Features Needed**:
- Upload generated images to WordPress.com media library
- Set featured images for posts
- Manage media files
- **Required Scopes**: `write:media`, `read:media`

### ✍️ **Content Management** (Partially Implemented)
**Current**: Read-only access via public API
**Missing**: 
- Create/update posts
- Manage drafts
- Schedule posts
- Update post metadata
- **Required Scopes**: `write:posts`, `read:posts`

### 🔍 **SEO & Search** (Unimplemented)
**Files Found**:
- `src/app/dashboard/seo/page.tsx` - "Schema Markup not implemented"
- Search functionality improvements

**Features Needed**:
- Site verification
- Meta tag management
- Schema markup
- **Required Scopes**: `read:site`, `write:site`

### 🎨 **Image Generation Integration** (Unimplemented)
**Files Found**:
- `src/app/dashboard/image-generator/debug/page.tsx` - "WordPress integration not implemented"
- `docs/image-generation-troubleshooting.md` - "WordPress.com API integration not implemented"

**Features Needed**:
- Auto-generate featured images for posts
- Upload AI-generated images
- Update post images automatically
- **Required Scopes**: `write:media`, `write:posts`

### 📈 **Performance Monitoring** (Unimplemented)
**Files Found**:
- `src/app/api/uptime/route.ts` - Mock data only

**Features Needed**:
- Site health monitoring
- Performance metrics
- **Required Scopes**: `read:stats`, `read:site`

### 🔗 **URL & Redirect Management** (Unimplemented)
**Files Found**:
- `src/utils/deadLinkChecker.ts` - Dead link detection
- `docs/legacy-url-handling.md` - URL management

**Features Needed**:
- Manage redirects
- Fix broken links
- URL optimization
- **Required Scopes**: `write:site`

### 📧 **Notifications & Webhooks** (Unimplemented)
**Files Found**:
- `docs/wordpress-webhooks-setup.md`
- `src/app/api/notifications/webhook/route.ts`

**Features Needed**:
- Real-time content updates
- Comment notifications
- Site activity alerts
- **Required Scopes**: `read:notifications`, `write:webhooks`

## 🔐 **Comprehensive OAuth Scopes Needed**

### **Read Permissions**
```
read:stats          # Analytics and visitor data
read:posts          # Post content and metadata
read:media          # Media library access
read:site           # Site settings and configuration
read:notifications  # Activity and alerts
read:comments       # Comment management
read:users          # User information
```

### **Write Permissions**
```
write:posts         # Create/update posts and pages
write:media         # Upload and manage media files
write:site          # Site settings and configuration
write:webhooks      # Real-time notifications
write:comments      # Comment moderation
```

### **Special Permissions**
```
manage:options      # Advanced site management
edit:theme          # Theme customization (if needed)
```

## 📝 **WordPress.com OAuth Application Registration**

### **Application Details**
```
Application Name: Medialternatives Complete Dashboard
Description: Comprehensive analytics and content management dashboard for medialternatives.com with AI-powered features

Website URL: https://medialternatives.com

Redirect URLs (Add all of these):
  - http://localhost:3000
  - http://localhost:3000/dashboard/analytics
  - http://127.0.0.1:3000
  - http://127.0.0.1:3000/dashboard/analytics
  - https://medialternatives.com
  - https://medialternatives.com/dashboard/analytics
  - https://www.medialternatives.com
  - https://www.medialternatives.com/dashboard/analytics
  - https://medialternatives.vercel.app
  - https://medialternatives.vercel.app/dashboard/analytics

Javascript Origins (Add all of these):
  - http://localhost:3000
  - http://127.0.0.1:3000
  - https://medialternatives.com
  - https://www.medialternatives.com
  - https://medialternatives.vercel.app
```

### **Scope Request**
```
Requested Scopes: read:stats,read:posts,read:media,read:site,read:notifications,read:comments,write:posts,write:media,write:site,write:webhooks
```

### **Use Case Description**
```
This application provides a comprehensive dashboard for managing the medialternatives.com WordPress.com site, including:

1. Analytics Dashboard: Real-time visitor stats, popular content analysis
2. Content Management: AI-powered content creation and editing
3. Media Management: Automated image generation and featured image updates
4. SEO Optimization: Meta tag management and schema markup
5. Performance Monitoring: Site health and uptime tracking
6. Link Management: Dead link detection and redirect management

The dashboard enhances the WordPress.com experience with AI-powered features and advanced analytics.
```

## 🚀 **Implementation Priority**

### **Phase 1: Core Analytics** (Current)
- ✅ Basic stats reading
- ✅ Jetpack analytics integration
- **Scopes**: `read:stats`

### **Phase 2: Content & Media** (Next)
- 🔄 Image generation integration
- 🔄 Featured image updates
- 🔄 Post management
- **Scopes**: `read:posts`, `write:posts`, `read:media`, `write:media`

### **Phase 3: Advanced Features**
- 🔄 SEO management
- 🔄 Performance monitoring
- 🔄 Webhook integration
- **Scopes**: `read:site`, `write:site`, `write:webhooks`

### **Phase 4: Complete Dashboard**
- 🔄 Full content management
- 🔄 Advanced analytics
- 🔄 Automated workflows
- **All Scopes**

## 🔧 **Environment Variables Needed**

```bash
# WordPress.com OAuth
NEXT_PUBLIC_WORDPRESS_COM_CLIENT_ID=your-client-id
WORDPRESS_COM_CLIENT_SECRET=your-client-secret
WORDPRESS_COM_REDIRECT_URI=http://localhost:3000

# Site Configuration
WORDPRESS_COM_SITE_ID=medialternatives.wordpress.com
WORDPRESS_COM_SITE_URL=https://medialternatives.wordpress.com

# API Access
WORDPRESS_COM_ACCESS_TOKEN=your-access-token (after OAuth)
```

## 📋 **Next Steps**

1. **Register Comprehensive OAuth App** with all required scopes
2. **Update OAuth utilities** to handle multiple scopes
3. **Implement scope-based feature detection**
4. **Add permission checking** for each dashboard feature
5. **Create scope upgrade flow** for additional permissions

This comprehensive approach will future-proof our WordPress.com integration and enable all planned dashboard features.