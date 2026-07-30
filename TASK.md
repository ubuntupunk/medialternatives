# Task Management - WordPress.com Headless CMS Migration

## ✅ Completed Sprint: Dashboard & Production Readiness  
**Sprint Duration**: Week 3
**Sprint Goal**: Complete dashboard implementation and prepare for production deployment.
**Status**: ✅ COMPLETED - Dashboard is now production-ready with real-time API integration
- [x] Fix AdSense refresh token error
- [x] Fix category page header duplication
- [x] Resolve CategoryCloud color cycling issue
- [x] Suppress 'Uncategorized' category from widgets
- [x] Complete handbook migration to Next.js

### Phase 6: Dashboard Implementation
| Task | Status | Assignee | Estimate | Actual | Notes |
|------|--------|----------|----------|--------|-------|
| Review Dashboard Checklist | ✅ Done | Dev Team | 0.5h | 0.25h | See /docs/dashboard-task-checklist.md |
| Implement Easy Wins | ✅ Done | Dev Team | 4h | 3.5h | API endpoints and real-time data integration |
| Google Analytics API Integration | ✅ Done | Dev Team | 2h | 1.5h | Mock API with real structure, ready for GA4 |
| PageSpeed Insights API Integration | ✅ Done | Dev Team | 1.5h | 1h | LIVE API integration with real data! |
| Real-time Dashboard Updates | ✅ Done | Dev Team | 2h | 1.5h | Auto-refresh and manual refresh functionality |
| Uptime Monitoring API | ✅ Done | Dev Team | 1h | 0.5h | Ready for integration with monitoring services |
| Admin Password Security | ✅ Done | Dev Team | 0.5h | 0.25h | Secure password configured, no default fallbacks |
| Fix AdSense Dashboard Error | ✅ Done | Dev Team | 0.5h | 0.5h | Resolved undefined cells error, added mock data fallback |
| AI Image Generator System | ✅ Done | Dev Team | 4h | 3.5h | Complete system with dashboard, hooks, and bulk processing |

### ✅ Phase 7: Handbook Migration (COMPLETED)
| Task | Status | Assignee | Estimate | Actual | Notes |
|------|--------|----------|----------|--------|-------|
| Migrate Handbook Static HTML to Next.js | ✅ Done | Dev Team | 3h | 2h | Created /handbook page with full content |
| Add Handbook Fonts (Quicksand, Roboto) | ✅ Done | Dev Team | 0.5h | 0.5h | Integrated into layout.tsx |
| Create Handbook CSS Modules | ✅ Done | Dev Team | 1h | 1h | Responsive design with modern styling |
| Test Handbook Navigation | ✅ Done | Dev Team | 0.5h | 0.25h | Links working in navbar and footer |

### Phase 8: Future Handbook Enhancements (Backlog)
| Task | Status | Assignee | Estimate | Actual | Notes |
|------|--------|----------|----------|--------|-------|
| Add Kagenna Zines Chapter | 📋 Planned | Content Team | 4h | - | New chapter on zine creation and distribution |
| Implement Handbook Search | 📋 Planned | Dev Team | 6h | - | Full-text search within handbook content |
| Add Chapter Navigation | 📋 Planned | Dev Team | 3h | - | Table of contents and chapter jumping |
| Create Downloadable PDF Version | 📋 Planned | Dev Team | 4h | - | Generate PDF from handbook content |
| Add Bookmark/Progress Tracking | 📋 Planned | Dev Team | 5h | - | User progress through handbook sections |
| Implement Handbook Comments | 📋 Planned | Dev Team | 8h | - | Community discussion on handbook sections |
| Add Interactive Elements | 📋 Planned | Dev Team | 6h | - | Quizzes, exercises, and interactive content |
| Mobile App Version | 📋 Planned | Dev Team | 20h | - | PWA or native app for offline reading |

## Sprint Completed: Project Setup and Planning

**Sprint Duration**: Week 1  
**Sprint Goal**: Complete project planning, setup development environment, and begin core component development

---

## 🚀 Current Status: Vercel Deployment Success ✅

### Recently Completed
- ✅ **Vercel Deployment**: Successful deployment with preview URLs
- ✅ **Font System**: Next.js font optimization (Copse, Quattrocento, Revalia)
- ✅ **Mobile Navigation**: Bootstrap JavaScript integration for burger menu
- ✅ **Linting Fixes**: Resolved TypeScript and ESLint errors
- ✅ **Suspense Boundaries**: Fixed useSearchParams() build errors

### 🎯 Next Priority: Testing & Quality Assurance

#### Phase 3A: Comprehensive Testing Suite
- [ ] **Unit Tests**: Component and utility function testing
- [ ] **Integration Tests**: API service and data flow testing  
- [ ] **E2E Tests**: Critical user journey testing
- [ ] **Visual Regression Tests**: Design consistency verification

#### Phase 3B: Widget Functionality Audit
- [ ] **Sidebar Widget Review**: Verify all widgets work correctly
  - [ ] Author Widget (with social links)
  - [x] Category Cloud (with proper styling)
  - [ ] Recent Posts widget
  - [ ] Determine final sidebar widget selection
- [x] **Search Widget**: Implement WordPress.com search functionality
  - [x] Search API integration
  - [x] Search widget component
  - [x] Search results page

#### Phase 3C: URGENT - PDF Content Migration 🚨
- [x] **Critical PDF Migration**: 32 legal documents with broken URLs
  - [x] Audit current PDF accessibility from broken URLs
  - [x] Download all accessible PDFs from current domains
  - [x] Choose storage solution (Vercel Blob/GitHub Releases/Cloudflare R2)
  - [x] Upload PDFs to new storage location
  - [x] Update case.md with new working URLs
  - [x] Test all download functionality
  - [x] Implement backup storage for redundancy
- [x] **PDF URLs Affected**:
  - 13 files: `https://newsite.medialternatives.com/app/uploads/...` (broken)
  - 18 files: `https://medialternatives.com/app/uploads/...` (may break)
  - 1 file: `https://medialternatives.com//app/uploads/...` (double slash)

#### Phase 3D: Content & Graphics Strategy
- [x] **Placeholder Image Issue**: Articles missing featured images
  - [ ] Research free LLM options for image generation
  - [ ] Implement automated image generation system
  - [ ] Create fallback image strategy
  - [ ] Ensure generated images match article content
- [ ] **Image Optimization**: Verify Next.js Image component
  - [ ] Test WordPress.com image loading
  - [ ] Implement proper sizing and optimization
  - [ ] Add loading states and error handling

---

## 🎯 Sprint Backlog

### Phase 1: Planning and Setup
| Task | Status | Assignee | Estimate | Actual | Notes |
|------|--------|----------|----------|--------|-------|
| Create migration plan (PLAN.md) | ✅ Done | Dev Team | 4h | 4h | Comprehensive plan created |
| Define development standards (.windsurfrules) | ✅ Done | Dev Team | 2h | 2h | Standards documented |
| Update project documentation (.agent.md) | ✅ Done | Dev Team | 1h | 1h | Documentation updated |
| Set up task management (TASK.md) | ✅ Done | Dev Team | 0.5h | 0.5h | Current file |
| Export WordPress content to XML | ✅ Done | Content Team | 1h | 1h | Successfully exported |
| Set up WordPress.com account and site | ✅ Done | Content Team | 1h | 1h | davidrobertlewis5.wordpress.com |
| Import content to WordPress.com | ✅ Done | Content Team | 2h | 1.5h | All content imported successfully |
| Verify WordPress.com API access | ✅ Done | Dev Team | 1h | 0.5h | API endpoints working correctly |

### Phase 2: Next.js Project Setup
| Task | Status | Assignee | Estimate | Actual | Notes |
|------|--------|----------|----------|--------|-------|
| Create frontend-app directory structure | ✅ Done | Dev Team | 0.5h | 0.25h | Subdirectory for Vercel |
| Initialize Next.js project with TypeScript | ✅ Done | Dev Team | 2h | 1.5h | Used bun create next-app with TypeScript |
| Configure Vercel deployment settings | ⏳ Pending | Dev Team | 1h | - | Root directory = frontend-app |
| Configure ESLint and Prettier | ✅ Done | Dev Team | 1h | 0.5h | Auto-configured by Next.js |
| Set up project structure | ✅ Done | Dev Team | 1h | 0.5h | Created all component folders |
| Install and configure Bootstrap | ✅ Done | Dev Team | 1h | 0.75h | Bootstrap 5 + custom CSS setup |
| Create environment configuration | ✅ Done | Dev Team | 0.5h | 0.25h | .env.local and .env.example |
| Set up Git hooks (Husky) | ⏳ Pending | Dev Team | 0.5h | - | Pre-commit linting |
| Update .gitignore for frontend-app | ✅ Done | Dev Team | 0.25h | 0.1h | Added bun, IDE, cache ignores |
| Create TypeScript types | ✅ Done | Dev Team | 1h | 1h | WordPress API types |
| Create API service layer | ✅ Done | Dev Team | 2h | 2h | Full WordPress.com API integration |
| Create utility functions | ✅ Done | Dev Team | 1h | 1h | Helpers for dates, text, etc. |
| Configure Next.js settings | ✅ Done | Dev Team | 0.5h | 0.5h | Image optimization, security headers |
| Integrate additional.css | ✅ Done | Dev Team | 0.5h | 0.5h | Custom styling from original site |

### Phase 3: Core API Integration
| Task | Status | Assignee | Estimate | Actual | Notes |
|------|--------|----------|----------|--------|-------|
| Create WordPress.com API service | ✅ Done | Dev Team | 3h | 2h | services/wordpress-api.ts with full CRUD |
| Define TypeScript interfaces | ✅ Done | Dev Team | 2h | 1h | Comprehensive WordPress types |
| Implement error handling | ✅ Done | Dev Team | 2h | 1h | Retry logic, graceful fallbacks |
| Add caching layer | ✅ Done | Dev Team | 2h | 1h | In-memory cache with TTL |
| Create API testing suite | ⏳ Pending | Dev Team | 2h | - | Unit tests for API service |

### Phase 4: Core Components and Widgets
| Task | Status | Assignee | Estimate | Actual | Notes |
|------|--------|----------|----------|--------|-------|
| Create Layout component | ✅ Done | Dev Team | 2h | 1h | Main layout structure |
| Create Header component | ✅ Done | Dev Team | 2h | 1.5h | With navigation and search |
| Create Custom Header component | ✅ Done | Dev Team | 1h | 0.5h | For header image |
| Create Post Card components | ✅ Done | Dev Team | 2h | 1.5h | Regular and featured posts |
| Create Post Grid component | ✅ Done | Dev Team | 1h | 0.5h | For displaying multiple posts |
| Create Sidebar component | ✅ Done | Dev Team | 1h | 0.5h | Widget container |
| Create Footer component | ✅ Done | Dev Team | 1h | 0.5h | With navigation |
| Create Pagination component | ✅ Done | Dev Team | 1h | 1h | With styling from additional.css |
| Create Category Cloud widget | ✅ Done | Dev Team | 1h | 0.75h | With colored tags |
| Create Author Widget | ✅ Done | Dev Team | 1h | 0.75h | With social menu |
| Create AdSense Widget | ✅ Done | Dev Team | 1h | 0.5h | Main and feed ad slots |
| Create sample pages | ✅ Done | Dev Team | 2h | 1h | Blog and components showcase |
| Reorganize site structure | ✅ Done | Dev Team | 1h | 0.5h | Blog as front page, about page created |
| Update site branding | ✅ Done | Dev Team | 0.5h | 0.5h | Hardcoded title and subtitle |
| Format about/page.tsx | ✅ Done | Dev Team | 2h | 2h | Extracted content to markdown, used react-markdown |

### Phase 5: Pagination Enhancement (Current Work)
| Task | Status | Assignee | Estimate | Actual | Notes |
|------|--------|----------|----------|--------|-------|
| Phase 1: API Enhancement | ✅ Done | Dev Team | 2h | 2h | Extract pagination headers from WordPress.com API |
| Phase 2: Dynamic Routing | ✅ Done | Dev Team | 2h | 2h | Create /page/[page] routes + single post pages |
| Phase 3: Bootstrap Styling | ⏳ Pending | Dev Team | 1h | - | Apply Bootstrap pagination classes |
| Phase 4: UX Enhancements | ⏳ Pending | Dev Team | 1h | - | Loading states and transitions |

---

## 🚀 Today's Focus

**Date**: 2025-06-26  
**Priority Tasks**:
-[x] Initialize Next.js project with proper configuration
-[x] Begin WordPress.com API service implementation

### Discovered During Work:
- Changed CustomHeader component logic to prioritize local image: public/images/header.jpg, fallback on wordpress.com [X]
- Fixed footer: "Proudly Powered by Netbones South Africa" on one line only [X]
- Fixed author component and used it for posts [X]
- Created Donate widget for PayPal donate button [X]
- Created Webring widget [X]
- Updated AdSense widget to match WordPress code [X]

**Blockers**:
- [x]Menu component,[x] Pagination,[x] Categories.

### Discovered During Work:
- Fix navigation menu centering issue

---

## 📋 Completed This Week

### ✅ Accomplishments
- **Planning Phase Complete**: Comprehensive migration plan created with handbook integration
- **Development Standards**: .windsurfrules file established with coding standards
- **Documentation**: Updated .agent.md with new project structure
- **Task Management**: TASK.md file created for workflow tracking
- **Next.js Project Setup**: Complete TypeScript + Bootstrap configuration
- **API Service Layer**: Full WordPress.com API integration with caching and error handling
- **TypeScript Types**: Comprehensive type definitions for WordPress.com API
- **Utility Functions**: Helper functions for dates, text processing, and data manipulation
- **Core Components**: Layout, Header, Post Cards, and Widgets implemented
- **Styling Integration**: additional.css integrated with custom styling
- **Sample Pages**: Blog and Components showcase pages created
- **Site Structure**: Reorganized with blog as front page, matching WordPress configuration
- **Formatted `about` page**: Extracted content to markdown, used react-markdown
- **Formatted `support` page**: Extracted content to markdown, used react-markdown
- **Formatted `case` page**: Extracted content to markdown, used react-markdown, handled download links and embeds
- **Formatted `republish` page**: Extracted content to markdown, used react-markdown, resolved routing issue
- **Formatted `environment` page**: Fetched blog content, displayed as cards with placeholder images, decoded HTML entities


---

## 📋 Completed This Week

### ✅ Accomplishments
- **Planning Phase Complete**: Comprehensive migration plan created with handbook integration
- **Development Standards**: .windsurfrules file established with coding standards
- **Documentation**: Updated .agent.md with new project structure
- **Task Management**: TASK.md file created for workflow tracking
- **Next.js Project Setup**: Complete TypeScript + Bootstrap configuration
- **API Service Layer**: Full WordPress.com API integration with caching and error handling
- **TypeScript Types**: Comprehensive type definitions for WordPress API
- **Utility Functions**: Helper functions for dates, text processing, and data manipulation
- **Core Components**: Layout, Header, Post Cards, and Widgets implemented
- **Styling Integration**: additional.css integrated with custom styling
- **Sample Pages**: Blog and Components showcase pages created
- **Site Structure**: Reorganized with blog as front page, matching WordPress configuration
- **Formatted `about` page**: Extracted content to markdown, used react-markdown
- **Formatted `support` page**: Extracted content to markdown, used react-markdown
- **Formatted `case` page**: Extracted content to markdown, used react-markdown, handled download links and embeds
- **Formatted `republish` page**: Extracted content to markdown, used react-markdown, resolved routing issue

### 📊 Time Tracking
- **Planned**: 32h
- **Actual**: 24.5h
- **Efficiency**: 76.6%

### 🎯 Goals Met
- [x] Project architecture defined
- [x] Development workflow established
- [x] Documentation framework created
- [x] Next.js project fully configured
- [x] WordPress.com API service implemented
- [x] TypeScript types and utilities created
- [x] Core components and widgets created
- [x] Sample pages implemented
- [x] WordPress.com migration completed

## Milestones
[] working pagination

---

## 🔄 Next Sprint Planning

### Upcoming Tasks (Week 2)
1. **Implement the site-specific pages**
   - Case page
    [x] -- Format `frontend-app/src/content/case.md`
    [] -- Hosting of pdf downloads need to be resolved.
   - Environment page
    [x]-- Format `frontend-app/src/content/environment.md`
    [] -- Cards for individual articles, we need to check links are available via our API
   - Support page
    [x]-- Format `frontend-app/src/content/support.md`
   - About page
    [x] -- Format `frontend-app/src/content/about.md`
   - Republish page
    [x]-- Format `frontend-app/src/content/republish.md`
   - [ ] Include header and footer on all pages

2. **Enhance WordPress.com API Integration**
   - [x] Implement pagination with headers
   - [x] Add category and tag filtering
   - [] Optimize data fetching

3. **Advanced Component Development**
   - [x] Single post page
   - [x] Category and tag pages
   - [] Author page
   - [] Search functionality

4. **Handbook Integration**
   - [x] Static handbook integration (Phase 1) ✅ COMPLETED
   - [x] Handbook navigation ✅ COMPLETED
   - [x] Handbook styling ✅ COMPLETED

5. **Deployment Setup**
   - [x] Vercel configuration
   - [x] Enironment variables
   - [] Cloudflare backup
   - [] Domain configuration

---

## 📝 Notes and Decisions

### Technical Decisions Made
- **Framework**: Next.js 14 with TypeScript for type safety
- **Styling**: Bootstrap 5 as primary framework (maintaining current design)
- **API**: WordPress.com public API (no custom endpoints available)
- **Deployment**: Vercel primary (subdirectory deployment), Cloudflare Pages backup
- **Project Structure**: frontend-app/ subdirectory to avoid legacy WordPress clutter

### Challenges Identified
- **WordPress.com Limitations**: No custom post types or endpoints
- **AdSense Integration**: Must be handled entirely in frontend
- **Analytics**: Need to implement tracking without WordPress plugins
- [x] **Header Image**: May need to hardcode or use WordPress.com site info API

### Solutions Implemented
- **AdSense**: Hardcoded React components with existing ad slots
- **Analytics**: Google Analytics 4 + Vercel Analytics
- **Custom Features**: All implemented as React components
- **Fallbacks**: Graceful degradation for API failures

---

## 🐛 Issues and Blockers

### Current Blockers
1. [x] Menu Component (we can used bootstrap prebuilt menu?) 

### Previous Blockers (Resolved)
1. ✅ **WordPress Content Export**: Successfully exported
2. ✅ **WordPress.com Setup**: Site created and content imported
3. ✅ **API Testing**: WordPress.com API working correctly

### Resolved Issues
- ✅ Project structure confusion - Clarified in documentation
- ✅ Technology stack decisions - Documented in PLAN.md
- ✅ Development standards - Established in .windsurfrules
- ✅ WordPress.com API errors - Added better error handling and mock data
- ✅ CategoryCloud color cycling issue resolved
- ✅ 'Uncategorized' category suppressed from widgets

---

## 📈 Metrics and KPIs

### Development Metrics
- **Code Coverage**: Target 80% (TBD when testing starts)
- **Build Time**: Target < 5 minutes
- **Bundle Size**: Target < 1MB initial load
- **Lighthouse Score**: Target > 90 for all categories

### Project Metrics
- **Tasks Completed**: 4/8 (50%)
- **Sprint Progress**: On track for planning phase
- **Blockers**: 3 active (content migration related)
- **Team Velocity**: TBD (first sprint)

---

## 🔗 Quick Links

- [Migration Plan](./PLAN.md) - Comprehensive project plan
- [Development Standards](./.windsurfrules) - Coding guidelines
- [Project Guide](./.agent.md) - Developer documentation
- [WordPress.com API Docs](https://developer.wordpress.com/docs/api/) - API reference
- [Adsense Plan](./frontend-app/docs/ADSENSE_TODO.md)
- [Dashboard Checklist](./frontend-app/docs/dashboard-task-checklist.md)

---

## 📞 Team Communication

### Daily Standup Format
1. **What did I complete yesterday?**
2. **What will I work on today?**
3. **Are there any blockers?**
4. **Any help needed from team members?**

### Weekly Review Format
1. **Sprint goals achieved?**
2. **Velocity and time tracking accuracy**
3. **Blockers and how they were resolved**
4. **Lessons learned and process improvements**
5. **Next sprint planning and priorities**

---

---

## 🎉 Latest Sprint: PWA & Mobile UX Enhancement (January 2025)

### ✅ Major Accomplishments Today

#### 📱 **Progressive Web App Implementation**
- **Complete PWA Setup**: Service worker with intelligent caching strategies
- **Offline Functionality**: WordPress API (24h), images (7-30 days), static resources (30 days)  
- **Add to Home Screen**: Smart installation prompts with platform detection (iOS/Android)
- **Offline Indicator**: Real-time connection status with visual notifications
- **PWA Manifest**: Complete app metadata with proper icons and standalone mode
- **Documentation**: Comprehensive PWA implementation guide created

#### 🎨 **Mobile UX Improvements**
- **Post Footer Redesign**: Horizontal social share layout with Back button on left
- **Share Buttons**: 5-platform sharing (Twitter, Facebook, LinkedIn, Reddit, Email)
- **Mobile Layout**: 2-column share button layout with proper horizontal sizing
- **Read More Links**: Added "Read Full Story" pill buttons to regular post cards
- **Typography**: Increased mobile headline font weight for better readability

#### 🔄 **Navigation & Pagination**
- **Modernized Pagination**: LoadMore component across all page types (category, author, tag)
- **Header Navigation**: Centered navbar, removed redundant Home link
- **Unique Images**: Post ID-based placeholder images for visual variety

### 🔄 Current Issues & Next Steps

#### 🐛 **PWA Installation Debugging**
- **Issue**: Add to Home Screen popup not appearing on mobile
- **Status**: Under investigation  
- **Next Steps**: Test production build, verify service worker registration

#### 📋 **Planned Features**
- **Push Notifications**: Implementation guide created, ready for Phase 1
- **Testing**: Comprehensive PWA testing across mobile browsers

### 📊 Current Progress Summary
**Estimated Completion**: 92%
**Major Features Complete**: PWA, Mobile UX, Pagination, Social Sharing, Offline Functionality
**Ready For**: Production testing and deployment

---

**Last Updated**: January 2025  
**Next Review**: PWA Testing & Push Notifications Planning  
**Sprint Status**: 🟢 PWA-Ready with Advanced Mobile Experience

---

## 🔧 TypeScript API Route Fixes (2025)

Fixed TypeScript errors in 6 API route files caused by aggressive `any` → `unknown` replacement:

| File | Fix |
|------|-----|
| `src/app/api/adsense/auth/route.ts` | Imported `CodeChallengeMethod` type; cast `'S256'` to it |
| `src/app/api/posts-with-placeholders/route.ts` | Cast `WordPressPost` → `Record<string, unknown>` at helper call sites |
| `src/app/api/privacy/route.ts` | Narrowed `unknown` `result.error` to expected APIError shape |
| `src/app/api/search/route.ts` | Cast `.name` access on `Record<string, unknown>` items to `string` |
| `src/app/api/v1/adsense/route.ts` | Same as adsense/auth — imported & cast `CodeChallengeMethod` |
| `src/app/api/v1/search/route.ts` | Same as search — cast `.name` to `string` |

**Note**: `src/app/dashboard/overview/page.tsx` has unrelated syntax errors (TS1005) that remain.

## 🔧 Dashboard Page TypeScript Fixes (2026)

Fixed TypeScript errors across 7 dashboard page files caused by `any` → `unknown` replacement:

| File | Fix |
|------|-----|
| `src/app/dashboard/adsense/page.tsx` | Added `catch (err)` parameter + `err instanceof Error` guard |
| `src/app/dashboard/analytics/page.tsx` | Added `JetpackData` interface, reordered `fetchJetpackData`/`fetchJetpackDataWithAuth` to resolve TDZ, added `lastUpdated` state, cast `AuthState` → `Record<string, unknown>` via `unknown`, used `Boolean(wpAuthStatus?.isAuthenticated)` for ReactNode-safe conditionals |
| `src/app/dashboard/charts/page.tsx` | Cast `chartData` accesses via `String()` and `as unknown as` for `D3Chart` props |
| `src/app/dashboard/content/page.tsx` | Aliased `postAny = post as Record<string, unknown>`; type-narrowed `title`, `views`, `date`, `id`, `slug`, `analyticsPath` via `typeof` checks |
| `src/app/dashboard/image-generator/debug/page.tsx` | Wrapped `debugInfo.X` reads with `Record<string, unknown>` casts; `Boolean(...)` for JSX conditionals; `String(debugInfo.timestamp)` |
| `src/app/dashboard/overview/page.tsx` | Cast `analyticsData` and `performanceData` to typed shapes via `Record<string, unknown> & {...}` intersections inside `getStats` |
| `src/app/dashboard/page.tsx` | Reordered `generateRecentActivity` above the `useEffect` that references it; collapsed duplicate `title?: ...` keys into `title?: { rendered?: string } | string`; `String(post.date)` for `new Date(...)` |

Pattern used: when a value is `unknown` but you know its shape, use `as Record<string, unknown>` for index access or `as unknown as SpecificType` for structured shapes; use `Boolean(...)` for JSX truthiness on `unknown`; use `String(...)`/`Number(...)` for primitive coercions.

**Result**: `pnpm exec tsc --noEmit` produces no errors in the 7 targeted dashboard files.
