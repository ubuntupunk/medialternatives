/*
  * Progress tracking utilities for dead link checker
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

export type ProgressCallback = (update: ProgressUpdate) => void;

export class ProgressTracker {
  private startTime: number;
  private current: number = 0;
  private total: number = 0;
  private callback?: ProgressCallback;

  constructor(total: number, callback?: ProgressCallback) {
    this.total = total;
    this.callback = callback;
    this.startTime = Date.now();
  }

  /*
    * Update progress with current item being processed
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

  /*
    * Mark progress as completed
    */
  complete() {
    return this.update(this.total, undefined, 'completed');
  }

  /*
    * Mark progress as error
    */
  error(currentItem?: string) {
    return this.update(this.current, currentItem, 'error');
  }

  /*
    * Get current progress without updating
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

/*
  * Format time duration in human readable format
  */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.round((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

/*
  * Calculate processing speed (items per second)
  */
export function calculateSpeed(itemsProcessed: number, timeElapsed: number): number {
  if (timeElapsed === 0) return 0;
  return Math.round((itemsProcessed / timeElapsed) * 1000 * 100) / 100;
}