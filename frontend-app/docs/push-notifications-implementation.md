# Push Notifications Implementation Guide

## Overview

This guide outlines the implementation of push notifications for Medialternatives, enabling real-time engagement with our Global South audience even when they're not actively browsing the site.

## Features to Implement

### 📢 **Notification Types**
1. **New Article Alerts** - Notify when new posts are published
2. **Breaking News** - Urgent updates for important stories
3. **Weekly Digest** - Summary of top articles from the week
4. **Category Updates** - Notifications for specific topics users follow

### 🎯 **Target Benefits**
- **Increased Engagement** - Bring users back to the site
- **Timely Updates** - Important news reaches users immediately
- **Personalization** - Users choose what notifications they want
- **Global South Focus** - Works even with intermittent connectivity

## Technical Architecture

### Core Technologies
- **Web Push API** - Browser-native push notifications
- **Service Worker** - Background message handling (already implemented)
- **VAPID Keys** - Voluntary Application Server Identification
- **Firebase Cloud Messaging (FCM)** - Reliable message delivery
- **Notification API** - Display notifications to users

### Implementation Steps

#### Phase 1: Basic Infrastructure
1. **Generate VAPID Keys** for secure communication
2. **Set up FCM** for message delivery
3. **Create Notification Service** for managing subscriptions
4. **Add Permission Request UI** for user consent

#### Phase 2: Notification Management
1. **Subscription Management** - Store user preferences
2. **Notification Composer** - Admin interface for sending notifications
3. **Automated Triggers** - Send notifications when new content published
4. **User Preferences** - Allow users to customize notification types

#### Phase 3: Advanced Features
1. **Rich Notifications** - Images, actions, and custom styling
2. **Analytics Integration** - Track notification performance
3. **A/B Testing** - Optimize notification content and timing
4. **Offline Queuing** - Queue notifications when user is offline

## Implementation Plan

### 1. Environment Setup

```bash
# Install required dependencies
bun add web-push firebase-admin
bun add -d @types/web-push
```

### 2. Generate VAPID Keys

```javascript
// scripts/generate-vapid-keys.js
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

### 3. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@medialternatives.com
FCM_SERVER_KEY=your_fcm_server_key_here
```

### 4. Service Worker Updates

```javascript
// public/sw.js (auto-generated, but we'll add push event handling)
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/images/android-chrome-192x192.png',
    badge: '/images/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Read Article',
        icon: '/images/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/android-chrome-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Medialternatives', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the article
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

### 5. Push Notification Service

```typescript
// src/services/pushNotifications.ts
class PushNotificationService {
  private vapidPublicKey: string;
  
  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    return await Notification.requestPermission();
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
    });

    return subscription;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
```

### 6. Notification Permission Component

```tsx
// src/components/UI/NotificationPermission.tsx
"use client";

import React, { useState, useEffect } from 'react';

const NotificationPermission: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        // Subscribe to push notifications
        await subscribeUser();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const subscribeUser = async () => {
    // Implementation for subscribing user
  };

  if (permission === 'granted' && isSubscribed) {
    return null; // Don't show if already subscribed
  }

  return (
    <div className="notification-permission-banner">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <strong>Stay Updated</strong>
            <p className="mb-0">Get notified when we publish new articles</p>
          </div>
          <button 
            onClick={requestPermission}
            className="btn btn-primary btn-sm"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 7. API Routes for Push Management

```typescript
// src/app/api/push/subscribe/route.ts
export async function POST(request: Request) {
  const subscription = await request.json();
  
  // Store subscription in database
  // Associate with user preferences
  
  return Response.json({ success: true });
}

// src/app/api/push/send/route.ts
export async function POST(request: Request) {
  const { title, body, url, subscriptions } = await request.json();
  
  const webpush = require('web-push');
  
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const promises = subscriptions.map((subscription: any) => {
    return webpush.sendNotification(subscription, JSON.stringify({
      title,
      body,
      url,
      icon: '/images/android-chrome-192x192.png'
    }));
  });

  await Promise.all(promises);
  
  return Response.json({ success: true });
}
```

## User Experience Flow

### 1. Permission Request
- Show notification permission banner after user engagement
- Clear value proposition: "Get notified of breaking news"
- Respect user choice and don't spam with requests

### 2. Subscription Management
- Allow users to choose notification types
- Easy unsubscribe option
- Frequency controls (immediate, daily digest, weekly)

### 3. Notification Display
- Rich notifications with article images
- Clear call-to-action buttons
- Relevant content based on user interests

## Best Practices

### 📱 **Mobile Optimization**
- Test on actual mobile devices
- Ensure notifications work with app installed
- Handle different Android/iOS behaviors

### 🔒 **Privacy & Consent**
- Clear opt-in process
- Easy unsubscribe mechanism
- Transparent about data usage
- GDPR compliance for international users

### ⚡ **Performance**
- Minimal impact on page load
- Efficient subscription management
- Graceful fallbacks for unsupported browsers

### 🌍 **Global South Considerations**
- Work with intermittent connectivity
- Efficient data usage
- Offline notification queuing
- Multiple language support

## Testing Strategy

### Manual Testing
1. **Permission Flow** - Test on different browsers/devices
2. **Notification Display** - Verify appearance and actions
3. **Subscription Management** - Test subscribe/unsubscribe
4. **Cross-Platform** - iOS Safari, Android Chrome, Desktop

### Automated Testing
```typescript
// Test notification service
describe('PushNotificationService', () => {
  it('should request permission correctly', async () => {
    // Test implementation
  });
  
  it('should handle subscription errors gracefully', async () => {
    // Test implementation
  });
});
```

## Analytics & Monitoring

### Key Metrics
- **Subscription Rate** - % of users who enable notifications
- **Click-Through Rate** - % who click notification to visit site
- **Unsubscribe Rate** - % who disable notifications
- **Engagement Impact** - Return visits from notifications

### Implementation
```typescript
// Track notification events
analytics.track('notification_permission_requested');
analytics.track('notification_subscribed');
analytics.track('notification_clicked', { articleId, notificationType });
```

## Security Considerations

### VAPID Keys
- Store private keys securely (environment variables)
- Never expose private keys in client-side code
- Rotate keys periodically

### Subscription Data
- Encrypt stored subscription data
- Implement proper access controls
- Regular security audits

## Deployment Checklist

- [ ] VAPID keys generated and stored securely
- [ ] FCM project configured
- [ ] Service worker updated with push event handlers
- [ ] API routes implemented and tested
- [ ] Permission UI components created
- [ ] Database schema for subscriptions
- [ ] Analytics tracking implemented
- [ ] Cross-browser testing completed
- [ ] Mobile device testing completed
- [ ] Privacy policy updated

## Future Enhancements

### Phase 2 Features
- **Rich Media Notifications** - Include article images
- **Action Buttons** - "Read Later", "Share", "Dismiss"
- **Personalization** - AI-powered content recommendations
- **Scheduling** - Send at optimal times for each user

### Phase 3 Features
- **Two-Way Communication** - Users can reply to notifications
- **Location-Based** - Regional news for Global South users
- **Offline Sync** - Queue notifications when offline
- **Multi-Language** - Notifications in user's preferred language

---

**Next Steps**: Ready to implement Phase 1 - Basic Infrastructure