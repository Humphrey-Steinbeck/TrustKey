// TrustKey Page Leave Hook

import { useEffect } from 'react';

export function usePageLeave(
  handler: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        handler();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handler, enabled]);
}
