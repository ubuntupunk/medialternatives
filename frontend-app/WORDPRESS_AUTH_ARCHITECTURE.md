# WordPress.com Centralized Authentication Architecture

## 🎯 Problem Statement

Currently we have authentication scattered across:
- ✅ **Jetpack Analytics** - Working with OAuth
- ❌ **AuthorWidget** - Failing with 401 errors
- ❌ **Recent Posts widgets** - Using public API (limited)
- ❌ **Popular Posts widgets** - No analytics integration
- ❌ **Dashboard content management** - No write access
- ❌ **Media uploads** - Not implemented

**Goal**: Single OAuth flow that enables authenticated access across the entire application.

## 🏗️ Proposed Architecture

### **1. Global WordPress.com Authentication Context**

```typescript
// src/contexts/WordPressAuthContext.tsx
interface WordPressAuthState {
  isAuthenticated: boolean;
  token: WordPressToken | null;
  user: WordPressUser | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
}

interface WordPressAuthActions {
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkPermissions: (scope: string) => boolean;
}
```

### **2. Centralized Authentication Service**

```typescript
// src/services/wordpressAuthService.ts
class WordPressAuthService {
  // OAuth flow management
  initiateOAuth(): void
  handleCallback(): AuthResult
  
  // Token management
  getToken(): WordPressToken | null
  refreshToken(): Promise<WordPressToken>
  clearToken(): void
  
  // Authenticated API calls
  makeAuthenticatedRequest(endpoint: string): Promise<Response>
  
  // Permission checking
  hasPermission(scope: string): boolean
  getAvailableScopes(): string[]
}
```

### **3. Enhanced WordPress API Service**

```typescript
// src/services/wordpress-api.ts (Enhanced)
class WordPressAPI {
  // Automatic authentication detection
  private useAuthentication(): boolean
  
  // Authenticated vs public API routing
  async getUser(id: number): Promise<WordPressUser>
  async getPosts(params: PostParams): Promise<Post[]>
  async getPopularPosts(): Promise<Post[]> // Uses analytics if authenticated
  
  // Write operations (requires auth)
  async createPost(post: CreatePostData): Promise<Post>
  async uploadMedia(file: File): Promise<MediaItem>
  async updatePost(id: number, updates: UpdatePostData): Promise<Post>
}
```

## 🔐 Authentication Flow

### **1. Initial Authentication (Dashboard)**
```
User visits /dashboard → Check auth status → If not authenticated:
1. Show "Connect WordPress.com" button
2. Initiate OAuth flow
3. Redirect to WordPress.com
4. Return with token
5. Store in context + localStorage
6. Enable authenticated features across app
```

### **2. Widget Authentication Check**
```
Widget loads → Check global auth context → If authenticated:
- Use authenticated API calls
- Access private data (analytics, user info)
- Enable write operations

If not authenticated:
- Use public API with fallbacks
- Show limited data
- Display "Connect for more features" prompts
```

### **3. Dashboard Tab Authentication**
```
All dashboard tabs share the same authentication:
- Analytics: ✅ Already working
- Content: Uses same token for post management
- Media: Uses same token for uploads
- SEO: Uses same token for site settings
```

## 📁 File Structure

```
src/
├── contexts/
│   └── WordPressAuthContext.tsx          # Global auth state
├── services/
│   ├── wordpressAuthService.ts           # Centralized auth logic
│   └── wordpress-api.ts                  # Enhanced API with auth
├── hooks/
│   ├── useWordPressAuth.ts               # Auth context hook
│   ├── useAuthenticatedAPI.ts            # Authenticated API calls
│   └── useWordPressPermissions.ts        # Permission checking
├── components/
│   ├── auth/
│   │   ├── WordPressConnectButton.tsx    # Reusable connect button
│   │   ├── AuthenticationStatus.tsx      # Status indicator
│   │   └── PermissionGate.tsx            # Conditional rendering
│   └── widgets/
│       ├── AuthorWidget.tsx              # Enhanced with auth
│       ├── RecentPostsWidget.tsx         # Enhanced with auth
│       └── PopularPostsWidget.tsx        # Enhanced with analytics
└── app/
    ├── layout.tsx                        # Wrap with auth provider
    └── dashboard/
        └── layout.tsx                    # Dashboard-specific auth
```

## 🎯 Implementation Plan

### **Phase 1: Core Authentication Infrastructure**
1. **Create WordPressAuthContext** - Global state management
2. **Enhance wordpressAuthService** - Centralized auth logic
3. **Update App Layout** - Wrap with auth provider
4. **Create useWordPressAuth hook** - Easy access to auth state

### **Phase 2: Dashboard Integration**
1. **Update Dashboard Layout** - Single auth check for all tabs
2. **Enhance Analytics Tab** - Use centralized auth
3. **Update Content Tab** - Add write operations
4. **Add Media Tab** - File upload capabilities

### **Phase 3: Widget Enhancement**
1. **AuthorWidget** - Use authenticated user data
2. **RecentPostsWidget** - Enhanced with analytics
3. **PopularPostsWidget** - Real popularity from analytics
4. **Add Permission Gates** - Show/hide features based on auth

### **Phase 4: Advanced Features**
1. **Content Management** - Create/edit posts
2. **Media Management** - Upload/manage files
3. **SEO Management** - Site settings and meta
4. **Real-time Updates** - Webhooks and live data

## 🔧 Key Components

### **1. WordPressAuthProvider**
```tsx
<WordPressAuthProvider>
  <App />
</WordPressAuthProvider>
```

### **2. useWordPressAuth Hook**
```tsx
const { isAuthenticated, token, login, logout, hasPermission } = useWordPressAuth();
```

### **3. PermissionGate Component**
```tsx
<PermissionGate requires="write:posts">
  <CreatePostButton />
</PermissionGate>
```

### **4. Enhanced API Calls**
```tsx
const api = useAuthenticatedAPI();
const posts = await api.getPosts({ popular: true }); // Uses analytics if authenticated
```

## 🎉 Benefits

### **User Experience**
- ✅ **Single OAuth flow** - Authenticate once, use everywhere
- ✅ **Progressive enhancement** - Works without auth, better with auth
- ✅ **Consistent UI** - Same auth status across all components
- ✅ **Clear permissions** - Users know what they can/can't do

### **Developer Experience**
- ✅ **Centralized auth logic** - No duplication across components
- ✅ **Type-safe API calls** - Authenticated vs public clearly defined
- ✅ **Easy permission checking** - Simple hooks and components
- ✅ **Automatic fallbacks** - Graceful degradation when not authenticated

### **Technical Benefits**
- ✅ **Token reuse** - Single token for all WordPress.com operations
- ✅ **Consistent error handling** - Centralized auth error management
- ✅ **Performance** - Cached authentication state
- ✅ **Security** - Proper token storage and refresh

## 🚀 Expected Outcome

After implementation:
- **Dashboard**: Single "Connect WordPress.com" enables all features
- **Widgets**: Automatically enhanced when user is authenticated
- **API Calls**: Seamlessly switch between public and authenticated
- **User Experience**: Clear, consistent authentication across the app
- **No More 401 Errors**: Proper fallbacks and auth checking everywhere

This architecture will transform the app from scattered auth attempts to a cohesive, authenticated WordPress.com experience.