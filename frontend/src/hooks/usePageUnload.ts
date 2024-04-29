// TrustKey Page Unload Hook

import { useEffect } from 'react';

export function usePageUnload(
  handler: (event: BeforeUnloadEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleUnload = (event: BeforeUnloadEvent) => {
      handler(event);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [handler, enabled]);
}