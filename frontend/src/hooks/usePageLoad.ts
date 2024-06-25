// TrustKey Page Load Hook

import { useState, useEffect } from 'react';

export function usePageLoad(): boolean {
  const [isLoaded, setIsLoaded] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.readyState === 'complete';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleLoad = () => setIsLoaded(true);

    if (document.readyState === 'complete') {
      setIsLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return isLoaded;
}