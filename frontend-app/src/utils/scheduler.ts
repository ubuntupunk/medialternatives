/**
 * Scheduler utilities for automated dead link checking
 */

/**
 * Schedule settings for automated dead link checking
 * @interface ScheduleSettings
 * @property {boolean} enabled - Whether scheduling is enabled
 * @property {'daily' | 'weekly' | 'monthly'} frequency - How often to run checks
 * @property {string} time - Time to run checks (HH:MM format)
 * @property {number} [dayOfWeek] - Day of week for weekly checks (0-6, 0 = Sunday)
 * @property {number} [dayOfMonth] - Day of month for monthly checks (1-31)
 * @property {number} postsToCheck - Number of posts to check per run
 * @property {string} [lastRun] - ISO timestamp of last run
 * @property {string} [nextRun] - ISO timestamp of next scheduled run
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

/**
 * Results of a scheduled check execution
 * @interface ScheduledCheckResults
 * @property {string} type - Type of check performed
 * @property {number} postsChecked - Number of posts checked
 * @property {LinkCheckResult} result - Detailed link check results
 * @property {ScheduledCheckSummary} summary - Summary of the check
 */
export interface ScheduledCheckResults {
  type: string;
  postsChecked: number;
  result: LinkCheckResult;
  summary: ScheduledCheckSummary;
}

/**
 * Summary of scheduled check results
 * @interface ScheduledCheckSummary
 * @property {number} totalPosts - Total posts processed
 * @property {number} totalLinks - Total links found
 * @property {number} deadLinks - Number of dead links found
 * @property {number} workingLinks - Number of working links
 * @property {number} processingTimeMs - Processing time in milliseconds
 * @property {number} [processingTimeMinutes] - Processing time in minutes
 */
export interface ScheduledCheckSummary {
  totalPosts: number;
  totalLinks: number;
  deadLinks: number;
  workingLinks: number;
  processingTimeMs: number;
  processingTimeMinutes?: number;
}

/**
 * Result of checking multiple links
 * @interface LinkCheckResult
 * @property {number} totalLinks - Total number of links found
 * @property {number} checkedLinks - Number of links successfully checked
 * @property {DeadLink[]} deadLinks - Array of dead/broken links found
 * @property {number} workingLinks - Number of working links
 * @property {number} skippedLinks - Number of links skipped due to errors
 * @property {number} processingTime - Time taken to process in milliseconds
 * @property {number} retryableErrors - Number of retryable errors
 * @property {number} forbiddenErrors - Number of 403 forbidden errors
 * @property {number} timeoutErrors - Number of timeout errors
 */
export interface LinkCheckResult {
  totalLinks: number;
  checkedLinks: number;
  deadLinks: DeadLink[];
  workingLinks: number;
  skippedLinks: number;
  processingTime: number;
  retryableErrors: number;
  forbiddenErrors: number;
  timeoutErrors: number;
}

/**
 * Dead link information structure
 * @interface DeadLink
 * @property {string} url - The broken URL
 * @property {number | null} status - HTTP status code or null if unreachable
 * @property {string | null} error - Error message or null if successful
 * @property {string} context - Surrounding text for context
 * @property {number} postId - WordPress post ID containing the link
 * @property {string} postTitle - Title of the post containing the link
 * @property {string} postSlug - Slug of the post containing the link
 * @property {string} [archiveUrl] - Internet Archive Wayback Machine URL
 * @property {string[]} [suggestions] - Alternative suggestions for the broken link
 * @property {boolean} [retryable] - Whether the error is retryable
 * @property {string} [checkedAt] - ISO timestamp when the link was checked
 */
export interface DeadLink {
  url: string;
  status: number | null;
  error: string | null;
  context: string;
  postId: number;
  postTitle: string;
  postSlug: string;
  archiveUrl?: string;
  suggestions?: string[];
  retryable?: boolean;
  checkedAt?: string;
}

/**
 * Scheduled check information
 * @interface ScheduledCheck
 * @property {string} id - Unique identifier for the scheduled check
 * @property {string} timestamp - ISO timestamp when check was created
 * @property {'pending' | 'running' | 'completed' | 'failed'} status - Current status of the check
 * @property {ScheduleSettings} settings - Settings used for this check
 * @property {ScheduledCheckResults} [results] - Results of the completed check
 * @property {string} [error] - Error message if check failed
 */
export interface ScheduledCheck {
  id: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  settings: ScheduleSettings;
  results?: ScheduledCheckResults;
  error?: string;
}

/**
 * Calculate next run time based on schedule settings
 * @param {ScheduleSettings} settings - Schedule settings
 * @returns {Date} Next scheduled run time
 */
export function calculateNextRun(settings: ScheduleSettings): Date {
  const now = new Date();
  const [hours, minutes] = settings.time.split(':').map(Number);
  
  const nextRun = new Date();
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
 * @param {ScheduleSettings} settings - Schedule settings
 * @returns {boolean} True if check should run now
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
 * @param {ScheduleSettings} settings - Schedule settings for the check
 * @returns {Promise<ScheduledCheck>} Created scheduled check
 */
export async function createScheduledCheck(settings: ScheduleSettings): Promise<ScheduledCheck> {
  const check: ScheduledCheck = {
    id: `check_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
 * @param {string} checkId - ID of the scheduled check to execute
 * @returns {Promise<any>} Results of the executed check
 */
export async function executeScheduledCheck(checkId: string): Promise<ScheduledCheck> {
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
 * @returns {Promise<ScheduledCheck[]>} Array of scheduled checks
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
 * @param {ScheduleSettings} settings - New schedule settings
 * @returns {Promise<void>}
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
 * @returns {ScheduleSettings} Default schedule configuration
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
 * @returns {ScheduleSettings} Loaded or default schedule settings
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
 * @param {ScheduleSettings} settings - Settings to save
 * @returns {void}
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
 * @param {ScheduleSettings} settings - Schedule settings
 * @returns {string} Formatted next run time string
 */
export function formatNextRun(settings: ScheduleSettings): string {
  if (!settings.enabled) {
    return 'Disabled';
  }
  
  const nextRun = settings.nextRun ? new Date(settings.nextRun) : calculateNextRun(settings);
  
  return nextRun.toLocaleString();
}