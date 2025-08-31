/**
 * Debug utilities for conditional logging
 */

const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development';

/**
 * Debug logging function - only logs in debug mode
 * @param {...any[]} args - Arguments to log
 * @returns {void}
 */
export const debugLog = (...args: any[]) => {
  if (isDebugMode) {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Debug error logging function - only logs in debug mode
 * @param {...any[]} args - Arguments to log as error
 * @returns {void}
 */
export const debugError = (...args: any[]) => {
  if (isDebugMode) {
    console.error('[DEBUG ERROR]', ...args);
  }
};

/**
 * Debug warning logging function - only logs in debug mode
 * @param {...any[]} args - Arguments to log as warning
 * @returns {void}
 */
export const debugWarn = (...args: any[]) => {
  if (isDebugMode) {
    console.warn('[DEBUG WARN]', ...args);
  }
};

/**
 * Debug info logging function - only logs in debug mode
 * @param {...any[]} args - Arguments to log as info
 * @returns {void}
 */
export const debugInfo = (...args: any[]) => {
  if (isDebugMode) {
    console.info('[DEBUG INFO]', ...args);
  }
};

/**
 * Whether debug mode is enabled
 * @constant {boolean} isDebugMode
 */
export { isDebugMode };