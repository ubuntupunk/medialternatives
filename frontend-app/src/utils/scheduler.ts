/**
 * Scheduler utilities for automated dead link checking
 */

export interface ScheduleSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  postsToCheck: number;
  lastRun?: string;
  nextRun?: string;
}

export interface ScheduledCheck {
  id: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  settings: ScheduleSettings;
  results?: any;
  error?: string;
}

/**
 * Calculate next run time based on schedule settings
 */
export function calculateNextRun(settings: ScheduleSettings): Date {
  const now = new Date();
  const [hours, minutes] = settings.time.split(':').map(Number);
  
  let nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);
  
  switch (settings.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
      
    case 'weekly':
      const targetDay = settings.dayOfWeek || 0;
      const currentDay = nextRun.getDay();
      let daysUntilTarget = targetDay - currentDay;
      
      if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextRun <= now)) {
        daysUntilTarget += 7;
      }
      
      nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      break;
      
    case 'monthly':
      const targetDate = settings.dayOfMonth || 1;
      nextRun.setDate(targetDate);
      
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(targetDate);
      }
      break;
  }
  
  return nextRun;
}

/**
 * Check if a scheduled check should run now
 */
export function shouldRunCheck(settings: ScheduleSettings): boolean {
  if (!settings.enabled) {
    return false;
  }
  
  const now = new Date();
  const nextRun = settings.nextRun ? new Date(settings.nextRun) : calculateNextRun(settings);
  
  return now >= nextRun;
}

/**
 * Create a scheduled check
 */
export async function createScheduledCheck(settings: ScheduleSettings): Promise<ScheduledCheck> {
  const check: ScheduledCheck = {
    id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
    settings: {
      ...settings,
      nextRun: calculateNextRun(settings).toISOString()
    }
  };
  
  try {
    const response = await fetch('/api/scheduled-checks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(check)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create scheduled check');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating scheduled check:', error);
    throw error;
  }
}

/**
 * Execute a scheduled check
 */
export async function executeScheduledCheck(checkId: string): Promise<any> {
  try {
    const response = await fetch(`/api/scheduled-checks/${checkId}/execute`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to execute scheduled check');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error executing scheduled check:', error);
    throw error;
  }
}

/**
 * Get all scheduled checks
 */
export async function getScheduledChecks(): Promise<ScheduledCheck[]> {
  try {
    const response = await fetch('/api/scheduled-checks');
    
    if (!response.ok) {
      throw new Error('Failed to fetch scheduled checks');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching scheduled checks:', error);
    return [];
  }
}

/**
 * Update schedule settings
 */
export async function updateScheduleSettings(settings: ScheduleSettings): Promise<void> {
  try {
    const response = await fetch('/api/scheduled-checks/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update schedule settings');
    }
  } catch (error) {
    console.error('Error updating schedule settings:', error);
    throw error;
  }
}

/**
 * Get default schedule settings
 */
export function getDefaultScheduleSettings(): ScheduleSettings {
  return {
    enabled: false,
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 1, // Monday
    postsToCheck: 10
  };
}

/**
 * Load schedule settings from localStorage
 */
export function loadScheduleSettings(): ScheduleSettings {
  if (typeof window === 'undefined') {
    return getDefaultScheduleSettings();
  }

  try {
    const stored = localStorage.getItem('deadlink-schedule-settings');
    if (stored) {
      const settings = { ...getDefaultScheduleSettings(), ...JSON.parse(stored) };
      // Recalculate next run time
      settings.nextRun = calculateNextRun(settings).toISOString();
      return settings;
    }
  } catch (error) {
    console.error('Failed to load schedule settings:', error);
  }

  return getDefaultScheduleSettings();
}

/**
 * Save schedule settings to localStorage
 */
export function saveScheduleSettings(settings: ScheduleSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Calculate next run before saving
    const settingsWithNextRun = {
      ...settings,
      nextRun: calculateNextRun(settings).toISOString()
    };
    
    localStorage.setItem('deadlink-schedule-settings', JSON.stringify(settingsWithNextRun));
  } catch (error) {
    console.error('Failed to save schedule settings:', error);
  }
}

/**
 * Format next run time for display
 */
export function formatNextRun(settings: ScheduleSettings): string {
  if (!settings.enabled) {
    return 'Disabled';
  }
  
  const nextRun = settings.nextRun ? new Date(settings.nextRun) : calculateNextRun(settings);
  
  return nextRun.toLocaleString();
}