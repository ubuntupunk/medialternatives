# WordPress.com OAuth Scope Debugging

## Error Encountered
```
Invalid request, please go back and try again.
Error Code: invalid_request
Error Message: Invalid "scope". See https://developer.wordpress.com/docs/oauth2/#token-scope.
```

## Current Scopes We Requested
```
read:stats,read:posts,read:media,read:site,read:notifications,write:posts,write:media,write:site
```

## WordPress.com Supported Scopes

According to https://developer.wordpress.com/docs/oauth2/#token-scope, WordPress.com supports these scopes:

### Basic Scopes
- `read` - Read access to user's sites and content
- `write` - Write access to user's sites and content

### Specific Scopes (if supported)
- `global` - Access to WordPress.com account information
- `auth` - Authentication only

## Debugging Strategy

### Step 1: Try Basic Scope
Start with just `read` scope to get OAuth working:
```
scope=read
```

### Step 2: Test Write Access
If read works, try adding write:
```
scope=read,write
```

### Step 3: Check Documentation
Visit https://developer.wordpress.com/docs/oauth2/#token-scope for current scope list.

### Step 4: Test Incremental Scopes
Add scopes one by one to identify which ones are invalid:
```
scope=read
scope=read,write
scope=read,global
```

## WordPress.com API Capabilities

With `read` scope, we should be able to access:
- Site statistics (Jetpack Stats)
- Posts and pages
- Media library
- Site information
- Comments

With `write` scope, we should be able to:
- Create/update posts
- Upload media
- Manage site settings

## Testing Plan

1. **Start Simple**: Use only `read` scope
2. **Test OAuth Flow**: Ensure authentication works
3. **Test API Access**: Verify we can access stats
4. **Add Write Scope**: If needed for future features
5. **Document Working Scopes**: Update our configuration

## Expected Working Configuration

```typescript
const scopes = ['read'].join(',');
```

This should provide access to:
- Jetpack analytics
- Post content
- Media library (read-only)
- Site information
```