// TrustKey Page Enter Hook

import { useEffect } from 'react';

export function usePageEnter(
  handler: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleMouseEnter = (event: MouseEvent) => {
      if (event.clientY >= 0) {
        handler();
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [handler, enabled]);
}
