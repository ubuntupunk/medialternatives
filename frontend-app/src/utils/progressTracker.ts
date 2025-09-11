/**
/**
 * Progress update interface
 */
export interface ProgressUpdate {
  current: number;
  total: number;
  percentage: number;
  currentItem?: string;
  status: 'checking' | 'completed' | 'error';
  timeElapsed: number;
  estimatedTimeRemaining?: number;
}

/**
 * Progress callback function type
 */
export type ProgressCallback = (update: ProgressUpdate) => void;

/**
 * Progress Tracker Class
 *
 * Utility class for tracking progress of long-running operations.
 * Provides real-time progress updates, time estimates, and completion tracking.
 * Used primarily by the dead link checker for user feedback during processing.
 *
 * @class
 * @example
 * ```typescript
 * const tracker = new ProgressTracker(100, (update) => {
 *   console.log(`${update.percentage}% complete`);
 * });
 *
 * // Update progress
 * tracker.update(50, 'Processing item 50');
 *
 * // Mark as complete
 * tracker.complete();
 * ```
 */
export class ProgressTracker {
  private startTime: number;
  private current: number = 0;
  private total: number = 0;
  private callback?: ProgressCallback;

  /**
   * Create a new progress tracker
   * @param {number} total - Total number of items to process
   * @param {ProgressCallback} [callback] - Optional progress callback function
   */
  constructor(total: number, callback?: ProgressCallback) {
    this.total = total;
    this.callback = callback;
    this.startTime = Date.now();
  }

  /**
   * Update progress with current item being processed
   * @param {number} current - Current number of items processed
   * @param {string} [currentItem] - Name of currently processing item
   * @param {'checking' | 'completed' | 'error'} [status='checking'] - Current processing status
   * @returns {ProgressUpdate} Progress update information
   */
  update(current: number, currentItem?: string, status: 'checking' | 'completed' | 'error' = 'checking') {
    this.current = current;
    const timeElapsed = Date.now() - this.startTime;
    const percentage = Math.round((current / this.total) * 100);
    
    let estimatedTimeRemaining: number | undefined;
    if (current > 0 && status === 'checking') {
      const averageTimePerItem = timeElapsed / current;
      const remainingItems = this.total - current;
      estimatedTimeRemaining = Math.round(averageTimePerItem * remainingItems);
    }

    const update: ProgressUpdate = {
      current,
      total: this.total,
      percentage,
      currentItem,
      status,
      timeElapsed,
      estimatedTimeRemaining
    };

    if (this.callback) {
      this.callback(update);
    }

    return update;
  }

  /**
   * Mark progress as completed
   * @returns {ProgressUpdate} Final progress update
   */
  complete() {
    return this.update(this.total, undefined, 'completed');
  }

  /**
   * Mark progress as error
   * @param {string} [currentItem] - Name of item that caused the error
   * @returns {ProgressUpdate} Error progress update
   */
  error(currentItem?: string) {
    return this.update(this.current, currentItem, 'error');
  }

  /**
   * Get current progress without updating
   * @returns {ProgressUpdate} Current progress information
   */
  getProgress(): ProgressUpdate {
    const timeElapsed = Date.now() - this.startTime;
    const percentage = Math.round((this.current / this.total) * 100);

    return {
      current: this.current,
      total: this.total,
      percentage,
      status: 'checking',
      timeElapsed
    };
  }
}

/**
 * Format time duration in human readable format
 *
 * Converts milliseconds to a human-readable time format (ms, seconds, minutes, hours).
 *
 * @param {number} ms - Time duration in milliseconds
 * @returns {string} Formatted time string
 *
 * @example
 * ```typescript
 * formatDuration(500);     // "500ms"
 * formatDuration(65000);   // "1m 5s"
 * formatDuration(3661000); // "1h 1m"
 * ```
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.round((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

/**
 * Calculate processing speed (items per second)
 * @param {number} itemsProcessed - Number of items processed
 * @param {number} timeElapsed - Time elapsed in milliseconds
 * @returns {number} Processing speed in items per second
 */
export function calculateSpeed(itemsProcessed: number, timeElapsed: number): number {
  if (timeElapsed === 0) return 0;
  return Math.round((itemsProcessed / timeElapsed) * 1000 * 100) / 100;
}