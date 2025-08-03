import { useEffect, useState } from 'react';

/**
 * Hook to safely handle client-side only operations
 * Prevents hydration mismatches by ensuring consistent server/client rendering
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