# API Governance Plan

## Overview

This document outlines the API governance framework for the Media Alternatives frontend application. The plan aims to establish OpenAPI standards, implement robust security measures, prevent API bloat, and minimize attack surfaces for unauthorized activity.

## Current State Assessment

### Identified Issues
- **API Bloat**: 50+ API routes with unclear purpose and lifecycle management
- **Security Vulnerabilities**:
  - Non-httpOnly session cookies
  - Plain JSON session storage
  - Missing rate limiting
  - Hardcoded URLs in OAuth flows
  - No CSRF protection in OAuth
- **Inconsistent Documentation**: Mixed JSDoc and no OpenAPI specs
- **No Versioning Strategy**: Breaking changes risk
- **Missing Monitoring**: No API usage tracking or alerting

### API Inventory
- **Authentication**: `/api/auth/*` (login, logout)
- **AdSense Integration**: `/api/adsense/*` (OAuth, data, status)
- **Analytics**: `/api/analytics/*`, `/api/jetpack-analytics/*`
- **Content Generation**: `/api/generate-image*`, `/api/charts/*`
- **WordPress Integration**: `/api/feed`, `/api/sitemap`
- **Utility**: `/api/search`, `/api/robots`, `/api/monitor/*`
- **Legacy/Test**: Multiple test and legacy routes

## Governance Framework

### 1. API Design Standards

#### OpenAPI Specification
- **Version**: OpenAPI 3.1.0
- **Tooling**: Use `@apidevtools/swagger-jsdoc` and `swagger-ui-express` for documentation
- **Location**: `/api/docs` endpoint for interactive documentation
- **Schema Validation**: Runtime validation using `express-openapi-validator`

#### API Structure Standards
```typescript
// Required structure for all API routes
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

#### Naming Conventions
- **Endpoints**: Use kebab-case for multi-word resources
- **HTTP Methods**: Follow RESTful conventions
- **Query Parameters**: camelCase for consistency with TypeScript
- **Response Fields**: snake_case for JSON compatibility

### 2. Security Framework

#### Authentication & Authorization
- **JWT Implementation**: Replace plain JSON cookies with signed JWTs
- **Session Management**:
  - HttpOnly, Secure, SameSite cookies
  - Server-side session storage (Redis/Vercel KV)
  - Automatic session rotation
- **Rate Limiting**: Implement using `express-rate-limit`
  - 100 requests per 15 minutes for public endpoints
  - 1000 requests per hour for authenticated endpoints
- **CORS Policy**: Strict origin validation

#### Input Validation & Sanitization
- **Schema Validation**: Use Zod or Joi for all inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Sanitize all user inputs with DOMPurify
- **File Upload Security**: Validate file types, sizes, and content

#### OAuth Security
- **State Parameter**: Implement CSRF protection in OAuth flows
- **PKCE**: Use Proof Key for Code Exchange for public clients
- **Token Storage**: Secure server-side storage with encryption
- **Scope Validation**: Minimal required scopes only

#### Security Headers
```typescript
// Required security headers for all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### 3. API Lifecycle Management

#### Versioning Strategy
- **URL Versioning**: `/api/v1/resource`
- **Header Versioning**: `Accept: application/vnd.api.v1+json`
- **Deprecation Policy**: 6-month deprecation period
- **Breaking Changes**: Major version increments only

#### API Review Process
1. **Design Review**: Architecture and security review before implementation
2. **Code Review**: Security and standards compliance
3. **Testing Review**: Unit, integration, and security tests
4. **Documentation Review**: OpenAPI spec completeness

#### Deprecation Workflow
1. Add `Deprecation` header to responses
2. Update OpenAPI spec with deprecation notices
3. Notify API consumers 30 days in advance
4. Remove endpoint after 6-month grace period

### 4. Monitoring & Auditing

#### API Metrics
- **Usage Tracking**: Request count, response times, error rates
- **Performance Monitoring**: 95th percentile response times < 500ms
- **Error Tracking**: Centralized logging with correlation IDs
- **Security Events**: Failed authentication, rate limit hits, suspicious patterns

#### Logging Standards
```typescript
interface APILogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  responseTime: number;
  error?: {
    message: string;
    stack?: string;
  };
}
```

#### Alerting Rules
- Response time > 5 seconds
- Error rate > 5% in 5 minutes
- Rate limit exceeded > 10 times per hour
- Unauthorized access attempts > 5 per minute

### 5. Documentation Requirements

#### OpenAPI Specification
- **Complete Coverage**: All endpoints documented
- **Request/Response Examples**: Real examples for all operations
- **Error Responses**: Document all possible error codes
- **Authentication**: Clear auth requirements per endpoint

#### Developer Documentation
- **Getting Started Guide**: Authentication and basic usage
- **API Reference**: Auto-generated from OpenAPI spec
- **Changelog**: Version changes and migration guides
- **Support**: Contact information and SLAs

### 6. Testing Strategy

#### Security Testing
- **Static Analysis**: ESLint security plugins
- **Dependency Scanning**: npm audit, Snyk
- **Penetration Testing**: Quarterly external assessments
- **Vulnerability Management**: Automated patching workflow

#### API Testing
- **Unit Tests**: Mock external dependencies
- **Integration Tests**: Full request/response cycles
- **Contract Tests**: Validate API contracts
- **Load Tests**: Performance under stress

### 7. Compliance & Regulatory

#### Data Protection
- **GDPR Compliance**: Data minimization, consent management
- **CCPA Compliance**: Data subject rights implementation
- **Data Retention**: Automatic cleanup of old data
- **Audit Trail**: All data access logged

#### Industry Standards
- **OWASP Top 10**: Address all security risks
- **REST API Standards**: Follow RFC 7231 guidelines
- **JSON API Spec**: Consistent JSON response format

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Audit all existing API routes
- [ ] Implement OpenAPI specification framework
- [ ] Set up API monitoring and logging
- [ ] Create security middleware

### Phase 2: Security Hardening (Week 3-4)
- [ ] Replace insecure authentication
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Secure OAuth flows

### Phase 3: Governance (Week 5-6)
- [ ] API versioning system
- [ ] Documentation automation
- [ ] Review and deprecation process
- [ ] Testing framework

### Phase 4: Optimization (Week 7-8)
- [ ] API consolidation (remove bloat)
- [ ] Performance optimization
- [ ] Compliance implementation
- [ ] Production deployment

## API Consolidation Plan

### Routes to Deprecate (Immediate Action Required)
- **Test Routes**: `/api/test-*` (15+ routes) - Move to test environment
  - `/api/test-hf-client`, `/api/test-hf-simple`, `/api/test-hf-token`
  - `/api/test-legacy-url`, `/api/test-model-direct`, `/api/test-performance`
  - `/api/test-redirects`, `/api/test-simple-image`, `/api/update-post-image`
  - `/api/legacy-redirect-test`, `/api/legacy-url-lookup`
- **Empty/Incomplete Routes**: `/api/generate-image` (empty file)
- **Legacy Routes**: `/api/legacy-*` - Consolidate or remove

### Routes to Consolidate (High Priority)

#### Image Generation Consolidation
**Current State**: 4 separate image generation routes
- `/api/generate-image` (empty)
- `/api/generate-image-hf` (HuggingFace)
- `/api/generate-image-v2` (version 2)
- `/api/generate-post-image` (post-specific)

**Recommendation**: Consolidate into single `/api/images/generate` with:
- Query parameter for model/version selection
- Unified error handling and rate limiting
- Single monitoring point for resource usage

#### Analytics Consolidation
**Current State**: 3 analytics routes
- `/api/analytics` (Google Analytics)
- `/api/jetpack-analytics` (WordPress.com)
- `/api/jetpack-auth` (Jetpack authentication)

**Recommendation**: Consolidate into `/api/analytics/*` namespace:
- `/api/analytics/data` - Unified analytics data endpoint
- `/api/analytics/auth` - Consolidated auth for all analytics services
- Single configuration for all analytics providers

#### Chart Generation Consolidation
**Current State**: 3 chart routes
- `/api/charts/generate`
- `/api/charts/test`
- `/api/charts` (main route)

**Recommendation**: Merge `/api/charts/test` into main route with environment flag

### Routes to Secure (Critical Priority)
- **Authentication**: `/api/auth/*` - JWT implementation, remove plain JSON cookies
- **OAuth**: `/api/adsense/auth/*` - CSRF protection, PKCE, remove hardcoded URLs
- **File Uploads**: `/api/avatars/upload/*` - Content validation, size limits
- **AdSense Data**: `/api/adsense/data/*` - API key protection

### Routes to Monitor Closely (Medium Priority)
- **Image Generation**: `/api/generate-image*` - Resource usage, API costs
- **Analytics**: `/api/analytics/*` - Data privacy compliance, rate limits
- **Search**: `/api/search` - Rate limiting, input sanitization
- **Feed/Sitemap**: `/api/feed`, `/api/sitemap` - Cache performance

### New Consolidated API Structure

```
/api/v1/
├── auth/
│   ├── login
│   ├── logout
│   └── status
├── analytics/
│   ├── data
│   ├── auth
│   └── export
├── images/
│   ├── generate
│   ├── upload
│   └── [userId]
├── content/
│   ├── search
│   ├── feed
│   └── sitemap
├── adsense/
│   ├── auth
│   ├── data
│   └── status
└── system/
    ├── health
    ├── monitor
    └── performance
```

### Migration Strategy

#### Phase 1 Consolidation (Week 1-2)
1. **Immediate Deprecation**: Mark all test routes as deprecated
2. **Route Consolidation**: Merge duplicate image generation routes
3. **Security Implementation**: Apply security middleware to all routes

#### Phase 2 Consolidation (Week 3-4)
1. **Analytics Unification**: Create unified analytics endpoint
2. **Versioning**: Implement `/api/v1/` namespace
3. **Documentation**: Update OpenAPI specs for consolidated routes

#### Phase 3 Consolidation (Week 5-6)
1. **Legacy Removal**: Remove deprecated routes after grace period
2. **Performance Optimization**: Implement caching and rate limiting
3. **Monitoring**: Set up comprehensive API monitoring

### Estimated Impact

#### Before Consolidation
- **Total Routes**: 50+ API endpoints
- **Test Routes**: 15+ (30% of total)
- **Duplicate Functionality**: 8+ routes
- **Security Issues**: 12+ vulnerabilities
- **Maintenance Cost**: High (multiple similar endpoints)

#### After Consolidation
- **Total Routes**: ~25 core endpoints
- **Test Routes**: 0 (moved to test environment)
- **Duplicate Functionality**: 0
- **Security Issues**: 0 (all addressed)
- **Maintenance Cost**: 60% reduction

### Success Metrics (Updated)

#### Consolidation Metrics
- **Route Reduction**: > 50% reduction in total routes
- **Test Route Elimination**: 100% of test routes moved/deprecated
- **Duplicate Removal**: 100% of duplicate functionality consolidated
- **Security Coverage**: 100% of routes with security middleware
- **Documentation Coverage**: 100% of consolidated endpoints documented

## Success Metrics

### Security Metrics
- **Zero Critical Vulnerabilities**: CVSS score > 9.0
- **Authentication Success Rate**: > 99.9%
- **Rate Limit Effectiveness**: < 0.1% successful attacks

### Performance Metrics
- **API Response Time**: P95 < 500ms
- **Error Rate**: < 1%
- **Uptime**: > 99.9%

### Governance Metrics
- **Documentation Coverage**: 100% of endpoints
- **Test Coverage**: > 90% of API code
- **Review Completion Rate**: 100% of changes

## Tools & Technologies

### Security Tools
- **API Security**: express-openapi-validator, helmet
- **Authentication**: jsonwebtoken, bcrypt
- **Rate Limiting**: express-rate-limit
- **Validation**: zod, joi

### Monitoring Tools
- **Logging**: Winston, Morgan
- **Metrics**: Prometheus, Grafana
- **Alerting**: PagerDuty, Slack

### Development Tools
- **OpenAPI**: swagger-jsdoc, swagger-ui
- **Testing**: Jest, Supertest
- **Linting**: ESLint security plugins

## Risk Mitigation

### High-Risk Areas
1. **Authentication Bypass**: Multi-factor validation
2. **Data Exposure**: Encryption at rest and in transit
3. **API Abuse**: Comprehensive rate limiting
4. **Third-party Dependencies**: Regular security audits

### Contingency Plans
- **Security Incident**: 24/7 response team, incident playbook
- **API Outage**: Circuit breakers, fallback responses
- **Data Breach**: Encryption, backup validation
- **Compliance Violation**: Legal review, remediation plan

## Maintenance & Evolution

### Quarterly Reviews
- Security assessment and penetration testing
- API usage analysis and optimization
- Documentation updates and user feedback
- Technology stack evaluation

### Annual Audits
- Full security audit by external firm
- Compliance certification renewal
- Architecture review and modernization
- Performance benchmarking

This governance plan provides a comprehensive framework for secure, maintainable, and well-documented APIs. Implementation should be phased to minimize disruption while maximizing security improvements.