# WordPress.com OAuth Redirect URLs

## 🔗 Complete List of Redirect URLs to Add

When registering your WordPress.com OAuth application, add **ALL** of these redirect URLs to ensure the OAuth flow works in all environments:

### **Development URLs**
```
http://localhost:3000
http://localhost:3000/dashboard/analytics
http://127.0.0.1:3000
http://127.0.0.1:3000/dashboard/analytics
```

### **Production URLs**
```
https://medialternatives.com
https://medialternatives.com/dashboard/analytics
https://www.medialternatives.com
https://www.medialternatives.com/dashboard/analytics
```

### **Vercel Deployment URLs**
```
https://medialternatives.vercel.app
https://medialternatives.vercel.app/dashboard/analytics
https://frontend-app-git-feature-grasshopper-oauth-your-username.vercel.app
https://frontend-app-git-feature-grasshopper-oauth-your-username.vercel.app/dashboard/analytics
```

### **Preview Deployment URLs** (Optional but Recommended)
```
https://frontend-app-*.vercel.app
https://frontend-app-*.vercel.app/dashboard/analytics
```

## 📝 **WordPress.com Application Registration Form**

### **Step 1: Basic Information**
- **Application Name**: `Medialternatives Complete Dashboard`
- **Description**: `Comprehensive analytics and content management dashboard for medialternatives.com with AI-powered features including analytics, content management, media uploads, and SEO optimization.`
- **Website URL**: `https://medialternatives.com`

### **Step 2: Redirect URLs** 
Copy and paste this entire list into the "Redirect URLs" field:
```
http://localhost:3000
http://localhost:3000/dashboard/analytics
http://127.0.0.1:3000
http://127.0.0.1:3000/dashboard/analytics
https://medialternatives.com
https://medialternatives.com/dashboard/analytics
https://www.medialternatives.com
https://www.medialternatives.com/dashboard/analytics
https://medialternatives.vercel.app
https://medialternatives.vercel.app/dashboard/analytics
```

### **Step 3: JavaScript Origins**
Copy and paste this list into the "JavaScript Origins" field:
```
http://localhost:3000
http://127.0.0.1:3000
https://medialternatives.com
https://www.medialternatives.com
https://medialternatives.vercel.app
```

### **Step 4: Scopes**
Request these scopes (copy and paste):
```
read:stats,read:posts,read:media,read:site,read:notifications,write:posts,write:media,write:site
```

## 🎯 **Why These URLs?**

### **Development Coverage**
- `localhost:3000` - Standard development server
- `127.0.0.1:3000` - Alternative localhost format
- Both root and `/dashboard/analytics` paths

### **Production Coverage**
- `medialternatives.com` - Main domain
- `www.medialternatives.com` - WWW subdomain
- `medialternatives.vercel.app` - Vercel deployment

### **Deployment Coverage**
- Vercel preview deployments
- Git branch deployments
- Multiple environment support

## ⚠️ **Important Notes**

1. **Add ALL URLs** - WordPress.com requires exact matches
2. **Include both HTTP and HTTPS** where applicable
3. **Include both root and specific paths**
4. **Don't forget www subdomain**
5. **Include Vercel deployment URLs**

## 🧪 **Testing Different URLs**

After registration, you can test OAuth with different redirect URIs by updating the code:

```typescript
// For localhost testing
const redirectUri = 'http://localhost:3000';

// For production testing  
const redirectUri = 'https://medialternatives.com';

// For specific path testing
const redirectUri = 'http://localhost:3000/dashboard/analytics';
```

## 🔧 **Environment Variables**

After registration, add to `.env.local`:
```bash
NEXT_PUBLIC_WORDPRESS_COM_CLIENT_ID=your-new-client-id
WORDPRESS_COM_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_WORDPRESS_COM_REDIRECT_URI=http://localhost:3000
```

For production, use:
```bash
NEXT_PUBLIC_WORDPRESS_COM_REDIRECT_URI=https://medialternatives.com
```