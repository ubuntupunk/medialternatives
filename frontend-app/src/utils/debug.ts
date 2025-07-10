/**
 * Debug utilities for conditional logging
 */

const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development';

export const debugLog = (...args: any[]) => {
  if (isDebugMode) {
    console.log('[DEBUG]', ...args);
  }
};

export const debugError = (...args: any[]) => {
  if (isDebugMode) {
    console.error('[DEBUG ERROR]', ...args);
  }
};

export const debugWarn = (...args: any[]) => {
  if (isDebugMode) {
    console.warn('[DEBUG WARN]', ...args);
  }
};

export const debugInfo = (...args: any[]) => {
  if (isDebugMode) {
    console.info('[DEBUG INFO]', ...args);
  }
};

export { isDebugMode };