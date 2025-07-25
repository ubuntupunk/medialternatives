# Development Workflow Guide

## Overview

This document outlines the development workflow, commit standards, and project management processes for the WordPress.com headless CMS migration project.

---

## 🔄 Git Workflow

### Branch Strategy

#### Branch Types
- **`main`** - Production-ready code, always deployable
- **`develop`** - Integration branch for features (if needed)
- **`feature/[component-name]`** - New features and components
- **`fix/[issue-description]`** - Bug fixes
- **`refactor/[area-name]`** - Code refactoring without new features
- **`docs/[update-description]`** - Documentation updates
- **`chore/[task-description]`** - Maintenance tasks

#### Branch Naming Examples
```bash
feature/header-component
feature/wordpress-api-service
fix/pagination-overflow
fix/mobile-navigation-issue
refactor/post-card-optimization
docs/update-readme-setup
chore/update-dependencies
```

### Commit Message Standards

#### Format
Use **Conventional Commits** format:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

#### Examples
```bash
feat: add post card component with featured image support

fix: resolve API caching issue causing stale data

docs: update README with WordPress.com setup instructions

refactor: optimize wordpress api service for better error handling

perf: implement lazy loading for post images

test: add unit tests for category cloud widget

chore: update dependencies to latest versions

style: fix ESLint warnings in header component
```

#### Detailed Commit Message
```bash
feat(api): add WordPress.com API service with caching

- Implement base API service for WordPress.com public API
- Add request caching to prevent rate limiting
- Include error handling with graceful fallbacks
- Support for posts, categories, tags, and users endpoints

Closes #123
```

---

## 📋 Task Management Workflow

### TASK.md Updates

#### After Each Work Session
1. **Update task status** (⏳ Pending → 🔄 In Progress → ✅ Done)
2. **Record actual time spent** vs estimates
3. **Add notes** about challenges or decisions
4. **Update blockers** if any new issues arise

#### Task Status Icons
- ⏳ **Pending** - Not started
- 🔄 **In Progress** - Currently working on
- ✅ **Done** - Completed
- ❌ **Cancelled** - No longer needed
- 🚫 **Blocked** - Cannot proceed due to dependencies

#### Example Task Update
```markdown
| Create WordPress.com API service | 🔄 In Progress | Dev Team | 3h | 2h | Working on error handling |
```

### Daily Workflow

#### Start of Day
1. **Review TASK.md** for today's priorities
2. **Check for blockers** and dependencies
3. **Update task status** to "In Progress"
4. **Create feature branch** if starting new work

#### During Development
1. **Make small, focused commits** (every 30-60 minutes)
2. **Update TASK.md** with progress notes
3. **Document decisions** and challenges
4. **Test changes** before committing

#### End of Day
1. **Update actual time spent** in TASK.md
2. **Commit and push** current work
3. **Update task status** (Done/In Progress)
4. **Note any blockers** for next day

---

## 🔍 Code Review Process

### Pull Request Guidelines

#### Before Creating PR
- [ ] All tests pass locally
- [ ] ESLint and Prettier checks pass
- [ ] TypeScript compiles without errors
- [ ] Manual testing completed
- [ ] TASK.md updated with completion status

#### PR Title Format
```
[Type]: Brief description of changes

Examples:
feat: Add responsive post card component
fix: Resolve mobile navigation overflow issue
docs: Update API integration guide
```

#### PR Description Template
```markdown
## What Changed
Brief description of the changes made.

## Why
Explanation of why these changes were necessary.

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Responsive design tested
- [ ] Cross-browser testing done

## Screenshots
[Include screenshots for UI changes]

## Checklist
- [ ] Code follows .windsurfrules standards
- [ ] TypeScript types are properly defined
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Accessibility guidelines followed
- [ ] TASK.md updated

## Related Tasks
Closes #[task-number]
Related to #[task-number]
```

#### Review Requirements
- **At least 1 approval** required before merging
- **All CI checks** must pass
- **No merge conflicts** with target branch
- **TASK.md must be updated** with completion

### Code Review Checklist

#### Reviewer Responsibilities
- [ ] **Code Quality**: Follows established standards
- [ ] **TypeScript**: Proper typing and no `any` usage
- [ ] **Performance**: No obvious performance issues
- [ ] **Security**: Input validation and error handling
- [ ] **Accessibility**: Semantic HTML and ARIA labels
- [ ] **Testing**: Adequate test coverage
- [ ] **Documentation**: Code is self-documenting or commented

---

## 🚀 Deployment Workflow

### Development Environment

#### Local Development Setup
```bash
# Clone repository
git clone [repository-url]
cd [project-name]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

#### Environment Variables
```bash
# .env.local (development)
WORDPRESS_API_URL=WORDPRESS_API_URL=https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-CZNQG5YM3Z
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1630578712653878
NODE_ENV=development
```

### Staging Deployment

#### Vercel Preview Deployments
- **Automatic**: Every pull request gets a preview deployment
- **URL Format**: `https://[branch-name]-[project-name].vercel.app`
- **Testing**: Use preview URLs for stakeholder review
- **Environment**: Uses staging environment variables

#### Staging Checklist
- [ ] Preview deployment successful
- [ ] All pages load correctly
- [ ] WordPress.com API connectivity verified
- [ ] Responsive design tested
- [ ] Performance metrics acceptable
- [ ] SEO meta tags present

### Production Deployment

#### Deployment Process
1. **Merge to main** branch after PR approval
2. **Automatic deployment** to Vercel production
3. **Smoke testing** on production URL
4. **Monitor** for errors and performance issues
5. **Update TASK.md** with deployment notes

#### Production Checklist
- [ ] All tests passing in CI
- [ ] Lighthouse scores > 90
- [ ] No console errors
- [ ] WordPress.com API working
- [ ] Google Analytics tracking
- [ ] AdSense ads displaying
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility

---

## 📊 Quality Gates

### Pre-Commit Hooks (Husky)

#### Automated Checks
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test:unit
```

#### Manual Checks
- [ ] **Code Review**: Self-review changes before committing
- [ ] **Testing**: Manual testing of changed functionality
- [ ] **Documentation**: Update relevant docs if needed

### Pre-Merge Requirements

#### Automated Gates
- ✅ **ESLint**: No linting errors
- ✅ **TypeScript**: No type errors
- ✅ **Tests**: All tests passing
- ✅ **Build**: Production build successful

#### Manual Gates
- ✅ **Code Review**: Approved by team member
- ✅ **TASK.md**: Updated with completion status
- ✅ **Testing**: Manual testing completed
- ✅ **Documentation**: Updated if needed

### Pre-Deployment Requirements

#### Performance Gates
- ✅ **Lighthouse Performance**: > 90
- ✅ **Bundle Size**: < 1MB initial load
- ✅ **Build Time**: < 5 minutes
- ✅ **API Response Time**: < 500ms average

#### Quality Gates
- ✅ **Accessibility**: WCAG 2.1 AA compliance
- ✅ **SEO**: Proper meta tags and structure
- ✅ **Security**: No exposed secrets or vulnerabilities
- ✅ **Cross-browser**: Works in major browsers

---

## 🔧 Development Tools

### Required Tools

#### Code Editor Setup
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens

#### Browser Tools
- **Chrome DevTools** for debugging
- **React Developer Tools** extension
- **Lighthouse** for performance auditing
- **WAVE** for accessibility testing

### Recommended Workflow Tools

#### Time Tracking
- **Manual tracking** in TASK.md
- **Pomodoro technique** for focused work sessions
- **Daily time logs** for accuracy improvement

#### Communication
- **Daily standups** (async or sync)
- **Weekly sprint reviews** 
- **Slack/Discord** for quick questions
- **GitHub Issues** for bug tracking

---

## 📈 Metrics and Monitoring

### Development Metrics

#### Code Quality
- **ESLint Errors**: 0 tolerance
- **TypeScript Errors**: 0 tolerance
- **Test Coverage**: > 80%
- **Code Duplication**: < 5%

#### Performance Metrics
- **Build Time**: Track and optimize
- **Bundle Size**: Monitor growth
- **Lighthouse Scores**: Weekly audits
- **API Response Times**: Monitor WordPress.com API

#### Team Metrics
- **Velocity**: Story points per sprint
- **Cycle Time**: Feature completion time
- **Bug Rate**: Bugs per feature
- **Review Time**: PR review turnaround

### Production Monitoring

#### Performance Monitoring
- **Vercel Analytics**: Built-in performance tracking
- **Google Analytics**: User behavior and performance
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Error Tracking**: Console errors and API failures

#### Business Metrics
- **Page Load Times**: User experience impact
- **Bounce Rate**: Content engagement
- **Mobile Performance**: Mobile user experience
- **SEO Rankings**: Search visibility

---

## 🆘 Troubleshooting

### Common Issues

#### Development Issues
- **Build Failures**: Check TypeScript errors and dependencies
- **API Issues**: Verify WordPress.com site status and API limits
- **Styling Issues**: Check Bootstrap classes and CSS conflicts
- **Performance Issues**: Use React DevTools profiler

#### Deployment Issues
- **Vercel Build Failures**: Check build logs and environment variables
- **Environment Variables**: Verify all required vars are set
- **Domain Issues**: Check DNS configuration and SSL certificates
- **API Connectivity**: Test WordPress.com API from production

### Getting Help

#### Internal Resources
1. **Check TASK.md** for known issues and solutions
2. **Review .windsurfrules** for coding standards
3. **Consult PLAN.md** for architecture decisions
4. **Search commit history** for similar issues

#### External Resources
1. **Next.js Documentation** - Framework issues
2. **WordPress.com API Docs** - API-related problems
3. **Vercel Documentation** - Deployment issues
4. **Bootstrap Documentation** - Styling problems

#### Escalation Process
1. **Self-troubleshooting** (30 minutes max)
2. **Team member consultation** (Slack/Discord)
3. **Create GitHub issue** for tracking
4. **Update TASK.md** with blocker status

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Next Review**: [Next Review Date]
