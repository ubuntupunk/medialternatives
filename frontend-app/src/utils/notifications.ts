/**
 * Notification utilities for dead link checker
 */

export interface NotificationSettings {
  email?: string;
  webhookUrl?: string;
  enableBrowserNotifications: boolean;
  enableEmailNotifications: boolean;
  enableWebhookNotifications: boolean;
  threshold: number; // Minimum number of dead links to trigger notification
}

export interface DeadLinkNotification {
  timestamp: string;
  totalDeadLinks: number;
  postsAffected: number;
  summary: string;
  details: any[];
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Show browser notification
 */
export function showBrowserNotification(title: string, options: NotificationOptions = {}) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/images/favicon-32x32.png',
      badge: '/images/favicon-32x32.png',
      ...options
    });
  }
}

/**
 * Send email notification
 */
export async function sendEmailNotification(
  email: string, 
  notification: DeadLinkNotification
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        notification
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

/**
 * Send webhook notification
 */
export async function sendWebhookNotification(
  webhookUrl: string,
  notification: DeadLinkNotification
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookUrl,
        notification
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send webhook notification:', error);
    return false;
  }
}

/**
 * Process dead link results and send notifications if needed
 */
export async function processNotifications(
  results: any,
  settings: NotificationSettings
): Promise<void> {
  const deadLinksCount = results.summary?.deadLinks || results.summary?.totalDeadLinks || 0;
  
  if (deadLinksCount < settings.threshold) {
    return; // Don't notify if below threshold
  }

  const notification: DeadLinkNotification = {
    timestamp: new Date().toISOString(),
    totalDeadLinks: deadLinksCount,
    postsAffected: results.summary?.totalPosts || 1,
    summary: `Found ${deadLinksCount} dead links across ${results.summary?.totalPosts || 1} posts`,
    details: results.deadLinks || results.result?.deadLinks || []
  };

  // Browser notification
  if (settings.enableBrowserNotifications) {
    showBrowserNotification(
      '🔗 Dead Links Found',
      {
        body: notification.summary,
        tag: 'dead-links',
        requireInteraction: true
      }
    );
  }

  // Email notification
  if (settings.enableEmailNotifications && settings.email) {
    await sendEmailNotification(settings.email, notification);
  }

  // Webhook notification
  if (settings.enableWebhookNotifications && settings.webhookUrl) {
    await sendWebhookNotification(settings.webhookUrl, notification);
  }
}

/**
 * Get default notification settings
 */
export function getDefaultNotificationSettings(): NotificationSettings {
  return {
    enableBrowserNotifications: true,
    enableEmailNotifications: false,
    enableWebhookNotifications: false,
    threshold: 1
  };
}

/**
 * Load notification settings from localStorage
 */
export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return getDefaultNotificationSettings();
  }

  try {
    const stored = localStorage.getItem('deadlink-notification-settings');
    if (stored) {
      return { ...getDefaultNotificationSettings(), ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load notification settings:', error);
  }

  return getDefaultNotificationSettings();
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('deadlink-notification-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  }
}