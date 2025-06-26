# Project Guide for Developers

## Project Overview

This is a **headless CMS project** migrating from a WordPress site to a modern React/Next.js frontend consuming content from **WordPress.com** via their public API. The site is focused on media activism and will maintain the existing design and functionality while improving performance and developer experience.

## Special Instructions
Please read TASK.md, .windsurfrules, and .windsurfconfig for more information on the project.
When a task is complete, mark it as complete in TASK.md, if the task is not complete, mark it as in progress, add it if it is not in the list. 
After completing task, write a commit message and commit.
Add any blockers you encounter to the sprint.

### Key Technologies
- **Frontend**: React 18 + Next.js 14 + TypeScript
- **Styling**: Bootstrap 5 + CSS Modules
- **Backend**: WordPress.com (davidrobertlewis5.wordpress.com)
- **API**: WordPress.com Public REST API
- **Deployment**: Vercel (primary) + Cloudflare Pages (backup)
- **Analytics**: Google Analytics 4 + Vercel Analytics

## Project Structure

### Current Legacy Structure (Reference Only)
The existing WordPress Bedrock structure in this repository serves as reference for migration:
- `web/app/themes/blaskan-child/` - Current theme with customizations
- `PLAN.md` - Detailed migration plan and architecture
- `.windsurfrules` - Development standards and guidelines

### New Frontend Structure (Created)
```
frontend-app/
├── components/          # React components
│   ├── Header/         # Site header, navigation, search
│   ├── Layout/         # Main layout, sidebar, footer
│   ├── Posts/          # Post cards, grids, meta
│   ├── Widgets/        # Author, categories, AdSense
│   └── UI/             # Reusable UI components
├── pages/              # Next.js pages and routing
├── services/           # WordPress.com API integration
├── styles/             # Global and component styles
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
├── lib/                # Constants and configurations
└── public/             # Static assets
```

### WordPress.com Backend
- **Site**: davidrobertlewis5.wordpress.com
- **API Base**: https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com
- **Content**: Migrated from current site via XML export/import

## Migration Status

### Phase 1: Planning and Setup ✅
- [x] Migration plan created (PLAN.md)
- [x] Development standards defined (.windsurfrules)
- [x] Project structure designed
- [x] Next.js project initialization
- [x] WordPress.com content migration

### Phase 2: Core Components (In Progress)
- [x] Layout and Header components
- [x] WordPress.com API service layer
- [x] Post display components
- [ ] Navigation and routing

### Phase 3: Widgets and Features
- [ ] Sidebar widgets (Author, Categories, etc.)
- [ ] AdSense integration
- [ ] Search functionality
- [ ] Pagination

### Phase 4: Optimization and Deployment
- [ ] SEO implementation
- [ ] Performance optimization
- [ ] Vercel deployment setup
- [ ] Domain configuration

## Key Features to Migrate

### From Current Blaskan-Child Theme
- **Typography**: Copse, Quattrocento, Revalia fonts
- **Layout**: Bootstrap grid (col-md-8/col-md-4)
- **Header Image**: Custom header background
- **AdSense**: Two ad slots (8018906534, 9120443942)
- **Analytics**: Google Analytics (G-CZNQG5YM3Z)
- **Post View Tracking**: Custom implementation
- **Author Widget**: With social menu integration
- **Category Cloud**: Dynamic sizing based on post count
- **Custom Styling**: Additional CSS file with important customizations

### Additional CSS File
The project includes an `additional.css` file in the root directory with critical styling:
- Site title styling (Revalia font, 40px, italic)
- Site description styling (Quattrocento font, 18px)
- Background color (#e3e3e3)
- Link colors (#0031FF, blueviolet on hover, #B800FF when visited)
- Button styling (green background, cyan text)
- Widget formatting (centered titles, Cambria font)
- Tag cloud with multi-colored tags
- Footer customizations
- Quote block styling

### WordPress.com API Limitations
- **No Custom Post Types**: AdSense management in frontend
- **No Custom Endpoints**: Standard API only
- **No Plugins**: All functionality in React components
- **Rate Limits**: Implement proper caching

## Development Workflow

### Setup Requirements
1. **Node.js**: Version 22.x.x
2. **Package Manager**: npm or yarn
3. **WordPress.com Account**: Access to davidrobertlewis5.wordpress.com
4. **Vercel Account**: For deployment

### Environment Variables
```bash
# Development
WORDPRESS_API_URL=https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-CZNQG5YM3Z
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1630578712653878
NODE_ENV=development
```

### Git Workflow
- **Branch Naming**: `feature/component-name`, `fix/issue-description`
- **Commit Format**: Conventional commits (feat:, fix:, docs:, refactor:)
- **Pull Requests**: Small, focused changes with screenshots for UI
- **Code Review**: Required before merging

### Task Management
- **TASK.md**: Current sprint tasks and progress
- **Time Tracking**: Estimates vs actual time spent
- **Blockers**: Document dependencies and issues
- **Status Updates**: After each significant commit

## API Integration Guidelines

### WordPress.com Public API
```typescript
// Base configuration
const API_BASE = 'https://public-api.wordpress.com/wp/v2/sites/davidrobertlewis5.wordpress.com';

// Always include embedded data
const params = {
  _embed: true,
  per_page: 10
};
```

### Available Endpoints
- `/posts` - Blog posts with featured images and authors
- `/categories` - Category taxonomy
- `/tags` - Tag taxonomy  
- `/users` - Author information
- `/media` - Media files and images
- `/pages` - Static pages

### Error Handling
- Implement graceful fallbacks for API failures
- Cache responses to avoid rate limits
- Show loading states for all async operations
- Handle offline scenarios

## Component Guidelines

### React Best Practices
- **Functional Components**: Use hooks instead of class components
- **TypeScript**: Strict typing for all props and state
- **Error Boundaries**: Wrap API-dependent components
- **Performance**: Use React.memo for expensive renders

### Styling Approach
- **Bootstrap**: Primary framework for layout and utilities
- **CSS Modules**: Component-specific styles
- **Responsive**: Mobile-first design approach
- **Accessibility**: Semantic HTML and ARIA labels

### File Organization
- **Single Responsibility**: One component per file
- **Named Exports**: Prefer over default exports
- **Index Files**: Re-export components from folders
- **Co-location**: Keep related files together

## Testing Strategy

### Test Types
- **Unit Tests**: Utility functions and hooks
- **Integration Tests**: API service functions
- **Component Tests**: React Testing Library
- **E2E Tests**: Critical user journeys

### Coverage Requirements
- **Minimum 80%** code coverage
- **All API functions** must have tests
- **Critical components** require integration tests
- **User flows** need E2E coverage

## Performance Targets

### Core Web Vitals
- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds  
- **CLS**: < 0.1

### Lighthouse Scores
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 90

### Optimization Techniques
- **Next.js Image**: For all WordPress.com media
- **ISR**: Incremental Static Regeneration for posts
- **Code Splitting**: Dynamic imports for large components
- **Caching**: Aggressive caching of API responses

## Security Considerations

### Input Validation
- **Sanitize HTML**: From WordPress.com content
- **Validate API Responses**: Check data structure
- **Environment Variables**: Never expose secrets client-side
- **CSP Headers**: Implement Content Security Policy

### WordPress.com API Security
- **Public API**: No authentication required
- **Rate Limiting**: Respect API limits
- **HTTPS Only**: All API calls over SSL
- **Error Handling**: Don't expose internal errors

## Deployment Process

### Vercel Deployment
1. **Connect Repository**: Link GitHub repo to Vercel
2. **Environment Variables**: Configure in Vercel dashboard
3. **Build Settings**: Next.js automatic detection
4. **Domain Configuration**: Point custom domain to Vercel
5. **Preview Deployments**: Automatic for pull requests

### Cloudflare Backup
1. **Pages Setup**: Configure Cloudflare Pages
2. **Build Configuration**: Same as Vercel
3. **DNS Configuration**: Ready for failover
4. **Performance**: Additional CDN layer

### Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Error Tracking**: Console error monitoring
- **Uptime Monitoring**: External service checks

## Troubleshooting

### Common Issues
- **API Rate Limits**: Implement caching and request throttling
- **Build Failures**: Check TypeScript errors and dependencies
- **Image Loading**: Verify WordPress.com media URLs
- **SEO Issues**: Ensure proper meta tag implementation

### Debug Tools
- **Next.js DevTools**: Built-in debugging
- **React DevTools**: Component inspection
- **Network Tab**: API request monitoring
- **Lighthouse**: Performance auditing

### Support Resources
- **WordPress.com API Docs**: Official API documentation
- **Next.js Docs**: Framework documentation
- **Vercel Docs**: Deployment and hosting guides
- **Bootstrap Docs**: CSS framework reference

## Migration Checklist

### Pre-Migration
- [ ] Export WordPress content to XML
- [ ] Backup current site completely
- [ ] Set up WordPress.com account and site
- [ ] Import content to WordPress.com
- [ ] Verify API access and data structure

### During Migration
- [ ] Create Next.js project structure
- [ ] Implement core components
- [ ] Set up API service layer
- [ ] Migrate styling and typography
- [ ] Implement AdSense and analytics
- [ ] Test responsive design

### Post-Migration
- [ ] Performance optimization
- [ ] SEO validation
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Monitor for issues

## Success Metrics

### Technical Metrics
- **Page Load Time**: < 2 seconds
- **Build Time**: < 5 minutes
- **Bundle Size**: < 1MB initial load
- **API Response Time**: < 500ms average

### Business Metrics
- **SEO Rankings**: Maintain or improve
- **User Engagement**: Increase time on site
- **Conversion Rates**: Maintain ad performance
- **Mobile Experience**: Improve mobile scores

### Developer Experience
- **Development Speed**: Faster iteration cycles
- **Code Quality**: Improved maintainability
- **Deployment**: Automated and reliable
- **Monitoring**: Better error tracking and analytics