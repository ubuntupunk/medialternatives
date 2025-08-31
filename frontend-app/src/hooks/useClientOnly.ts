import { useEffect, useState } from 'react';

/**
 * Hook to safely handle client-side only operations
 * Prevents hydration mismatches by ensuring consistent server/client rendering
 * @returns {boolean} True when running on client-side, false during SSR
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for client-side only state that doesn't cause hydration issues
 * @template T - Type of the state value
 * @param {T} initialValue - Initial value for SSR compatibility
 * @param {() => T} [clientValue] - Function to get client-specific initial value
 * @returns {[T, (value: T | ((prev: T) => T)) => void, boolean]} Tuple of [value, setValue, isClient]
 */
export function useClientState<T>(initialValue: T, clientValue?: () => T) {
  const [value, setValue] = useState<T>(initialValue);
  const isClient = useClientOnly();

  useEffect(() => {
    if (isClient && clientValue) {
      setValue(clientValue());
    }
  }, [isClient, clientValue]);

  return [value, setValue, isClient] as const;
}