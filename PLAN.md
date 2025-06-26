# WordPress.com to Headless CMS Migration Plan

## Overview

This document outlines the plan to recreate our WordPress site using WordPress.com's public API as the backend content provider, transitioning from the current self-hosted Blaskan-child theme to a modern headless architecture deployed on Vercel with Cloudflare as backup.

## Current Site Analysis

### Technology Stack
- **Current Framework**: Roots Bedrock (WordPress boilerplate)
- **Theme**: Blaskan parent theme with child theme customizations
- **CSS Framework**: Bootstrap (already implemented)
- **Custom Fonts**: Copse, Quattrocento, Revalia from Google Fonts
- **Layout**: Responsive grid (col-md-8/col-md-4 for main/sidebar)

### Key Features
- Custom post type 'advert' for AdSense management with Gutenberg blocks
- Custom author widget functionality with social menu integration
- Post view counting system
- Google Analytics integration (G-CZNQG5YM3Z)
- Header image support via WordPress customizer
- Social menu integration
- Search functionality
- Custom pagination styling
- AdSense integration with custom blocks
- **Media Activist's Handbook** - Static HTML documentation site

### Current Color Scheme
```css
--color-primary: #24221D;
--color-secondary: #BCBCBC;
--color-background: #e3e3e3; /* From additional.css */
--color-text: #333;
--color-link: #0031FF; /* From additional.css */
--color-link-visited: #B800FF; /* From additional.css */
--color-link-hover: blueviolet; /* From additional.css */
```

### Additional CSS Customizations
The project includes an `additional.css` file in the root directory that contains important customizations:
- Custom typography settings (Revalia for site title, Quattrocento for description, Copse for content)
- Background color (#e3e3e3)
- Link colors (blue, purple when visited)
- Button styling
- Widget formatting
- Tag cloud styling with colored tags
- Quote block styling
- AdSense styling

## Technology Stack Recommendation

### Frontend
- **Framework**: React with Next.js
- **CSS Framework**: Bootstrap (maintain consistency with current layout)
- **Styling**: CSS Modules + Global CSS
- **Fonts**: Google Fonts (Copse, Quattrocento, Revalia)

### Backend
- **CMS**: WordPress.com hosted service
- **API**: WordPress.com Public API
- **Limitations**: No custom endpoints, no plugin access, standard WordPress.com features only

### Deployment
- **Primary**: Vercel (with ISR support)
- **Backup**: Cloudflare Pages
- **Backend**: WordPress.com (davidrobertlewis5.wordpress.com)

## Project Structure

### Repository Structure (Subdirectory Deployment)
```
repo-root/
├── web/                    # Legacy WordPress (preserved for reference)
├── config/                 # Legacy Bedrock configuration  
├── composer.json          # Legacy PHP dependencies
├── frontend-app/           # 🆕 NEW Next.js Application (Vercel deploys from here)
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   │   ├── page.tsx    # Home page
│   │   │   ├── post/[slug]/page.tsx
│   │   │   ├── category/[slug]/page.tsx
│   │   │   ├── author/[slug]/page.tsx
│   │   │   └── handbook/   # Handbook integration
│   │   │       ├── page.tsx
│   │   │       └── [section]/page.tsx
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── SearchForm.tsx
│   │   │   │   └── SocialMenu.tsx
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── Posts/
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── PostCardBig.tsx
│   │   │   │   ├── PostGrid.tsx
│   │   │   │   └── PostMeta.tsx
│   │   │   ├── Widgets/
│   │   │   │   ├── AuthorWidget.tsx
│   │   │   │   ├── CategoryCloud.tsx
│   │   │   │   ├── RecentPosts.tsx
│   │   │   │   └── AdSenseWidget.tsx
│   │   │   ├── Handbook/
│   │   │   │   ├── HandbookLayout.tsx
│   │   │   │   ├── HandbookNav.tsx
│   │   │   │   └── HandbookContent.tsx
│   │   │   └── UI/
│   │   │       ├── Pagination.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── services/
│   │   │   └── wordpress-api.ts
│   │   ├── types/
│   │   │   ├── wordpress.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── helpers.ts
│   │   └── lib/
│   │       └── constants.ts
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── handbook/        # Handbook assets (Phase 1)
│   │       ├── images/
│   │       └── downloads/
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components/
│   │   └── handbook.module.css
│   ├── package.json
│   ├── next.config.js
│   ├── vercel.json
│   └── tsconfig.json
├── PLAN.md                 # Project documentation
├── TASK.md                 # Task management  
├── WORKFLOW.md             # Development workflow
├── .windsurfrules          # Development standards
└── README.md               # Updated project overview
```

### Vercel Deployment Configuration
**Root Directory**: `frontend-app` (configured in Vercel dashboard)
**Build Command**: `bun run build` (auto-detected)
**Output Directory**: `.next` (auto-detected)

## WordPress.com Public API Endpoints

### Available Endpoints
- `https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/posts` - Blog posts
- `https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/categories` - Categories
- `https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/tags` - Tags
- `https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/users` - Authors
- `https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/media` - Media files
- `https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/pages` - Static pages

### Limitations
- **No Custom Post Types**: AdSense management will need alternative approach
- **No Custom Endpoints**: Header image, site options must be handled differently
- **No Plugin Data**: Analytics, custom widgets need frontend implementation
- **Standard WordPress.com Features Only**: Limited to what WordPress.com provides

### Workarounds
- **Header Image**: Use WordPress.com's site info endpoint or hardcode
- **Site Options**: Fetch from site info or configure in frontend
- **AdSense**: Implement directly in React components
- **Analytics**: Use Vercel Analytics or Google Analytics 4 directly

## Handbook Integration Strategy

### Current Handbook Structure
The existing site includes a **Media Activist's Handbook** as a separate static HTML site located at `web/handbook/`:

```
web/handbook/
├── index.html              # Main handbook page
├── robots.txt              # SEO configuration
├── assets/
│   ├── css/theme.css       # Custom handbook styling
│   ├── fontawesome/        # FontAwesome icons (complete library)
│   ├── images/site-logo.svg # Handbook logo
│   ├── js/main.js          # Custom JavaScript
│   └── plugins/
│       ├── bootstrap/      # Bootstrap CSS/JS
│       ├── popper.min.js   # Bootstrap dependency
│       └── smoothscroll.min.js # Smooth scrolling
```

### Handbook Features
- **Typography**: Quicksand (headings) + Roboto (body text)
- **Framework**: Bootstrap-based layout
- **Icons**: FontAwesome complete library
- **Functionality**: Smooth scrolling, responsive design
- **Content**: Media activism resources and guides
- **Author**: David Robert Lewis at Medialternatives

### Integration Options

#### Option 1: Next.js Route Integration (Recommended)
Integrate handbook as Next.js pages within the main application:
- **Route**: `/handbook` and `/handbook/[section]`
- **Benefits**: Unified SEO, shared components, better performance
- **Implementation**: Create handbook components and migrate content

#### Option 2: Static Asset Integration
Keep handbook as static files within Next.js public directory:
- **Route**: `/handbook` (static files)
- **Benefits**: Minimal migration effort, preserves existing functionality
- **Drawbacks**: No Next.js optimizations, separate from main app

### Recommended Implementation

**Phase 1: Static Integration (Quick Win)**
1. Copy handbook assets to `frontend-app/public/handbook/`
2. Update internal links to work with Next.js routing
3. Ensure handbook accessible at `/handbook` route
4. Test FontAwesome and Bootstrap compatibility

**Phase 2: Next.js Integration (Long-term)**
1. Convert HTML to Next.js components
2. Integrate with main application styling
3. Add handbook content to WordPress.com as pages
4. Create dynamic handbook routing

## Typography and Styling Strategy

### Font Implementation
Current fonts from Google Fonts:
- **Main Site**: Copse (body), Quattrocento (headings), Revalia (display)
- **Handbook**: Quicksand (headings), Roboto (body)

```css
/* Main Site Fonts */
@import url('https://fonts.googleapis.com/css2?family=Copse&family=Quattrocento:wght@400;700&family=Revalia&display=swap');

/* Handbook Fonts */
@import url('https://fonts.googleapis.com/css?family=Quicksand:700|Roboto:400,400i,700&display=swap');

:root {
  /* Main Site */
  --font-body: 'Copse', serif;
  --font-heading: 'Quattrocento', serif;
  --font-display: 'Revalia', cursive;
  
  /* Handbook */
  --font-handbook-heading: 'Quicksand', sans-serif;
  --font-handbook-body: 'Roboto', sans-serif;
  
  /* Colors */
  --color-primary: #24221D;
  --color-secondary: #BCBCBC;
  --color-background: #fff;
  --color-text: #333;
}
```

### Responsive Design
- Maintain current breakpoints: col-md-8/col-md-4 for desktop
- col-sm-12 for mobile
- Mobile-first approach for new components
- Ensure header image is responsive

## Component Implementation Details

### Header Image Component
```jsx
// Option 1: Hardcoded header image (recommended for WordPress.com)
const CustomHeader = () => {
    const headerImage = {
        url: '/images/header-bg.jpg', // Store in public/images/
        height: 400
    };
    
    return (
        <div 
            className="custom-header"
            style={{
                backgroundImage: `url(${headerImage.url})`,
                height: `${headerImage.height}px`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        />
    );
};

// Option 2: Try to fetch from WordPress.com site info
const CustomHeaderDynamic = () => {
    const [siteInfo, setSiteInfo] = useState(null);
    
    useEffect(() => {
        fetch('https://public-api.wordpress.com/rest/v1.1/sites/davidrobertlewis5.wordpress.com')
            .then(res => res.json())
            .then(data => setSiteInfo(data));
    }, []);
    
    // Fallback to hardcoded if no header image available
    const headerImage = siteInfo?.header_image || '/images/header-bg.jpg';
    
    return (
        <div 
            className="custom-header"
            style={{
                backgroundImage: `url(${headerImage})`,
                height: '400px',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        />
    );
};
```

### Category Cloud Widget
```jsx
const CategoryCloud = () => {
    const [categories, setCategories] = useState([]);
    
    useEffect(() => {
        fetch('https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/categories?per_page=50')
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);
    
    return (
        <div className="widget category-cloud">
            <h3 className="widget-title">Categories</h3>
            <div className="tag-cloud">
                {categories.map(category => (
                    <Link 
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="tag-link"
                        style={{fontSize: `${Math.min(category.count * 2 + 12, 24)}px`}}
                    >
                        {category.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};
```

### Author Widget Component
```jsx
const AuthorWidget = ({ authorId, title = "About Author" }) => {
    const [author, setAuthor] = useState(null);
    
    useEffect(() => {
        if (authorId) {
            fetch(`https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com/users/${authorId}`)
                .then(res => res.json())
                .then(data => setAuthor(data));
        }
    }, [authorId]);
    
    if (!author) return null;
    
    return (
        <div className="widget author-widget">
            <h3 className="widget-title">{title}</h3>
            <div className="user-info">
                <img src={author.avatar_urls?.['96'] || author.avatar_url} alt={author.name} className="author-avatar" />
                <Link href={`/author/${author.slug}`} className="author-name">
                    {author.name}
                </Link>
                <p className="author-description">{author.description}</p>
            </div>
        </div>
    );
};
```

### AdSense Widget Component
```jsx
// Since we can't use custom post types, AdSense will be hardcoded in components
const AdSenseWidget = ({ 
    adSlot = "8018906534", 
    adClient = "ca-pub-1630578712653878",
    adFormat = "fluid",
    adLayout = "in-article"
}) => {
    useEffect(() => {
        // Load AdSense script
        if (typeof window !== 'undefined' && !window.adsbygoogle) {
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }
        
        // Push ad
        if (window.adsbygoogle) {
            window.adsbygoogle.push({});
        }
    }, []);
    
    return (
        <div className="widget adsense-widget">
            <ins 
                className="adsbygoogle"
                style={{display: 'block', textAlign: 'center'}}
                data-ad-layout={adLayout}
                data-ad-format={adFormat}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
            />
        </div>
    );
};

// Feed AdSense component (for in-content ads)
const AdSenseFeed = () => {
    return (
        <AdSenseWidget 
            adSlot="9120443942"
            adLayout="-5c+cv+44-et+57"
            adFormat="fluid"
        />
    );
};
```

### Post Components
```jsx
// Big featured post (first post)
const PostCardBig = ({ post }) => {
    return (
        <article className="big-post col-md-12">
            <header className="entry-header">
                <div className="entry-meta">
                    <time>{new Date(post.date).toLocaleDateString()}</time>
                    <span className="author">by {post._embedded?.author?.[0]?.name}</span>
                </div>
                <h2 className="entry-title">
                    <Link href={`/post/${post.slug}`}>{post.title.rendered}</Link>
                </h2>
                {post.featured_media && (
                    <div className="entry-thumbnail">
                        <Link href={`/post/${post.slug}`}>
                            <img src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url} alt={post.title.rendered} />
                        </Link>
                    </div>
                )}
            </header>
            <div className="entry-content" dangerouslySetInnerHTML={{__html: post.excerpt.rendered}} />
        </article>
    );
};

// Regular post cards
const PostCard = ({ post }) => {
    return (
        <article className="col-md-6 col-sm-12">
            <header className="entry-header">
                {post.featured_media && (
                    <div className="entry-thumbnail">
                        <Link href={`/post/${post.slug}`}>
                            <img src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url} alt={post.title.rendered} />
                        </Link>
                    </div>
                )}
                <div className="entry-meta">
                    <time>{new Date(post.date).toLocaleDateString()}</time>
                </div>
                <h2 className="entry-title">
                    <Link href={`/post/${post.slug}`}>{post.title.rendered}</Link>
                </h2>
            </header>
            <div className="entry-content" dangerouslySetInnerHTML={{__html: post.excerpt.rendered}} />
        </article>
    );
};
```

### Main Layout Component
```jsx
const Layout = ({ children }) => {
    return (
        <div id="page" className="site">
            <Header />
            <CustomHeader />
            <div id="content" className="site-content container">
                <div id="primary" className="content-area row">
                    <main id="main" className="site-main col-md-8 col-sm-12">
                        {children}
                    </main>
                    <Sidebar />
                </div>
            </div>
            <Footer />
        </div>
    );
};
```

## Implementation Timeline

### Phase 1: Setup and Core Structure (Week 1)
- [x] Create migration plan (PLAN.md)
- [x] Define development standards (.windsurfrules)
- [x] Project structure designed
- [x] Next.js project initialization
- [ ] WordPress.com content migration
- [ ] Handbook static integration

### Phase 2: Content Display (Week 2)
- [ ] Create PostCard and PostCardBig components
- [ ] Implement home page with post grid
- [ ] Add pagination component
- [ ] Create single post page
- [ ] Implement category and author pages

### Phase 3: Widgets and Features (Week 3)
- [ ] Create Sidebar component
- [ ] Implement CategoryCloud widget
- [ ] Create AuthorWidget component
- [ ] Add AdSense integration
- [ ] Implement other widgets (recent posts, tags, etc.)

### Phase 4: Advanced Features (Week 4)
- [ ] Add search functionality (client-side or Algolia)
- [ ] Implement post view tracking (Vercel Analytics)
- [ ] Add Google Analytics 4 directly
- [ ] Social media integration (hardcoded links)
- [ ] SEO optimization with Next.js

### Phase 5: Styling and Polish (Week 5)
- [ ] Fine-tune typography and spacing
- [ ] Ensure responsive design
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Deploy and go live

## WordPress.com Configuration

### Data Migration
1. **Export Current Site**: Use WordPress export tool to create XML file
2. **Upload to WordPress.com**: Import XML file to davidrobertlewis5.wordpress.com
3. **Verify Content**: Ensure all posts, pages, categories, and media are imported
4. **Test API Access**: Verify all endpoints are accessible

### WordPress.com Limitations
- **No Custom Code**: Cannot add custom PHP functions or plugins
- **No Custom Post Types**: AdSense management must be handled in frontend
- **No Custom Endpoints**: All data must come from standard WordPress.com API
- **No Analytics Plugins**: Must use external analytics (Vercel Analytics, GA4)
- **No Custom Themes**: Content styling handled entirely in frontend

### API Service Layer
```javascript
// services/wordpress-api.ts
const API_BASE = 'https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com';

export const wordpressApi = {
    // Posts
    getPosts: (params = {}) => {
        const queryString = new URLSearchParams({
            _embed: true,
            per_page: 10,
            ...params
        }).toString();
        return fetch(`${API_BASE}/posts?${queryString}`).then(res => res.json());
    },
    
    // Single post
    getPost: (slug) => {
        return fetch(`${API_BASE}/posts?slug=${slug}&_embed=true`)
            .then(res => res.json())
            .then(data => data[0]);
    },
    
    // Categories
    getCategories: () => {
        return fetch(`${API_BASE}/categories?per_page=100`).then(res => res.json());
    },
    
    // Tags
    getTags: () => {
        return fetch(`${API_BASE}/tags?per_page=100`).then(res => res.json());
    },
    
    // Users/Authors
    getUsers: () => {
        return fetch(`${API_BASE}/users`).then(res => res.json());
    },
    
    // Site info (for header image, title, etc.)
    getSiteInfo: () => {
        return fetch('https://public-api.wordpress.com/rest/v1.1/sites/davidrobertlewis5.wordpress.com')
            .then(res => res.json());
    }
};
```

## Migration Strategy

### Migration Approach
1. **Export and Import**: Export current site XML and import to WordPress.com
2. **Parallel Development**: Build new frontend while WordPress.com site is being set up
3. **Vercel Deployment**: Deploy to Vercel with preview URLs for testing
4. **Cloudflare Setup**: Configure Cloudflare as backup deployment option
5. **Domain Switch**: Point main domain to Vercel when ready
6. **Fallback Plan**: WordPress.com site can serve as backup if needed

### Deployment Strategy
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "env": {
    "WORDPRESS_API_URL": "https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com",
    "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID": "G-CZNQG5YM3Z",
    "NEXT_PUBLIC_ADSENSE_CLIENT_ID": "ca-pub-1630578712653878"
  }
}
```

### SEO Considerations
- Implement proper meta tags with Next.js Head component
- Maintain URL structure where possible
- Set up 301 redirects for any changed URLs
- Implement structured data (JSON-LD)
- Ensure proper sitemap generation

### Performance Optimizations
- Use Next.js ISR (Incremental Static Regeneration) for posts
- Implement image optimization with Next.js Image component
- Cache API responses appropriately
- Lazy load components and images
- Minimize bundle size

## Benefits of This Approach

### Performance
- **Static Generation**: Faster page loads with ISR
- **CDN Distribution**: Global content delivery
- **Optimized Images**: Automatic image optimization
- **Code Splitting**: Smaller bundle sizes

### Developer Experience
- **Modern Stack**: React, Next.js, modern JavaScript
- **Component Reusability**: Modular architecture
- **Hot Reloading**: Faster development cycles
- **TypeScript Support**: Better code quality

### Content Management
- **WordPress.com Interface**: Use WordPress.com admin for content creators
- **Limited Customization**: Standard WordPress.com features only
- **No Custom Post Types**: All content must use standard post/page structure
- **Media Management**: WordPress.com media library (with storage limits)

### Scalability
- **Decoupled Architecture**: Frontend and backend can scale independently
- **Multiple Frontends**: Can power mobile apps, other sites
- **API-First**: Easy integration with other services
- **Hosting Flexibility**: Frontend can be hosted anywhere

## Risk Mitigation

### Technical Risks
- **WordPress.com API Limitations**: Public API rate limits and feature restrictions
- **No Custom Endpoints**: Limited to standard WordPress.com API features
- **Build Failures**: Implement proper error handling and fallbacks
- **SEO Impact**: Careful implementation of meta tags and structured data

### Content Risks
- **WordPress.com Limitations**: Cannot extend functionality with plugins
- **Storage Limits**: WordPress.com has media storage restrictions
- **Feature Restrictions**: Limited to WordPress.com's available features
- **Migration Issues**: Ensure all content imports correctly to WordPress.com

### Business Risks
- **WordPress.com Dependency**: Reliant on WordPress.com service availability
- **Limited Control**: Cannot customize backend functionality
- **Subscription Costs**: WordPress.com may require paid plans for certain features
- **Performance**: WordPress.com API response times may vary

## Success Metrics

### Performance Metrics
- Page load time < 2 seconds
- Lighthouse score > 90
- Core Web Vitals in green
- 99.9% uptime

### SEO Metrics
- Maintain or improve search rankings
- Increase organic traffic
- Improve click-through rates
- Better mobile experience scores

### User Experience Metrics
- Reduced bounce rate
- Increased page views per session
- Improved mobile usability
- Faster content loading

## Conclusion

This migration plan provides a comprehensive roadmap for transitioning from the current self-hosted Blaskan-child WordPress theme to a modern headless architecture using WordPress.com's public API as the backend. While WordPress.com imposes certain limitations (no custom plugins, endpoints, or post types), the approach still provides significant improvements in performance and modern development practices.

**Key Adaptations for WordPress.com:**
- All custom functionality (AdSense, analytics, custom widgets) implemented in frontend
- Header images and site options handled via WordPress.com's standard API or hardcoded
- Post view tracking moved to Vercel Analytics
- Social media integration hardcoded in components
- Handbook integrated as Next.js routes or static assets

**Benefits Despite Limitations:**
- **Performance**: Static generation with Next.js and Vercel deployment
- **Reliability**: WordPress.com handles backend infrastructure
- **Simplicity**: Reduced complexity without custom backend code
- **Cost-Effective**: WordPress.com hosting + Vercel deployment

The component-based architecture ensures maintainability, and the Vercel + Cloudflare deployment strategy provides excellent performance and reliability.