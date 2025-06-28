# Authentication Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Set Admin Password
```bash
# Create .env.local file
echo "ADMIN_PASSWORD=your_secure_password_here" >> .env.local
```

### 2. Test Authentication
1. Start the development server: `npm run dev`
2. Visit `/profile` or `/avatar-demo`
3. You'll be redirected to `/auth/login`
4. Enter your admin password
5. Access granted!

## 🔐 What's Protected

### Automatically Protected Routes:
- `/profile` - User profile management
- `/avatar-demo` - Avatar upload demo
- `/api/avatars/upload` - Avatar upload API

### How to Protect More Routes:
Add routes to `middleware.ts`:
```typescript
const protectedRoutes = [
  '/profile',
  '/avatar-demo',
  '/admin',           // Add new routes here
  '/dashboard',       // Add new routes here
];
```

## 🎯 Usage in Components

### Check Authentication Status:
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Welcome, {user?.username}!</div>;
}
```

### Require Authentication:
```tsx
import { useAuth } from '@/hooks/useAuth';

function ProtectedComponent() {
  const { requireAuth } = useAuth();
  
  requireAuth(); // Automatically redirects if not authenticated
  
  return <div>Protected content</div>;
}
```

### Add Auth Status to Header:
```tsx
import AuthStatus from '@/components/UI/AuthStatus';

function Header() {
  return (
    <header>
      <nav>
        {/* Your navigation */}
        <AuthStatus showAvatar={true} />
      </nav>
    </header>
  );
}
```

## 🛡️ Security Features

### Current Implementation:
- ✅ Password-based authentication
- ✅ Session management (24-hour expiry)
- ✅ Automatic logout on session expiry
- ✅ Route protection via middleware
- ✅ Brute force protection (1-second delay)
- ✅ Secure cookie settings

### Security Best Practices:
- Use a strong admin password (12+ characters)
- Change password regularly
- Monitor login attempts
- Use HTTPS in production

## 🔄 Migration Path

### Phase 1: Current (Simple Password)
- Single admin password
- Session-based authentication
- Basic but secure

### Phase 2: NextAuth.js (Future)
- Multiple users
- OAuth providers
- Advanced session management
- Password reset functionality

### Phase 3: WordPress.com Integration (Future)
- Single sign-on with WordPress.com
- Leverage existing author data
- Seamless integration

## 🚨 Troubleshooting

### Common Issues:

1. **"Access Denied" after login**
   - Check if `ADMIN_PASSWORD` is set correctly
   - Clear browser cookies and try again

2. **Redirected to login repeatedly**
   - Check browser console for errors
   - Verify middleware configuration

3. **Session expires too quickly**
   - Check system clock
   - Verify cookie settings

### Debug Mode:
```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG_AUTH=true
```

## 📱 Mobile Considerations

- Login page is fully responsive
- Touch-friendly interface
- Proper viewport settings
- Accessible form controls

## 🎨 Customization

### Styling the Login Page:
Edit `/app/auth/login/page.tsx`:
- Change colors to match your brand
- Add custom logo
- Modify layout

### Custom Authentication Logic:
Edit `/api/auth/login/route.ts`:
- Add user validation
- Implement rate limiting
- Add logging

## 🔒 Production Checklist

- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Monitor login attempts
- [ ] Regular password rotation
- [ ] Backup authentication data

## 💡 Tips

1. **Strong Password**: Use a password manager
2. **Regular Updates**: Change password monthly
3. **Monitor Access**: Check login logs
4. **Backup Plan**: Have password recovery method
5. **Test Regularly**: Verify authentication works

This simple authentication system provides immediate protection while allowing for future upgrades to more sophisticated solutions!