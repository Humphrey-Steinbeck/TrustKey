// TrustKey Before Unload Hook

import { useEffect } from 'react';

export function useBeforeUnload(
  handler: (event: BeforeUnloadEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      handler(event);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handler, enabled]);
}
