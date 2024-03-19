// TrustKey Page Ready Hook

import { useState, useEffect } from 'react';

export function usePageReady(): boolean {
  const [isReady, setIsReady] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.readyState === 'interactive' || document.readyState === 'complete';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleReady = () => setIsReady(true);

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      setIsReady(true);
    } else {
      document.addEventListener('DOMContentLoaded', handleReady);
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', handleReady);
    };
  }, []);

  return isReady;
}
