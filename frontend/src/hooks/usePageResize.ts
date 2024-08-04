// TrustKey Page Resize Hook

import { useState, useEffect } from 'react';

interface PageSize {
  width: number;
  height: number;
}

export function usePageResize(): PageSize {
  const [size, setSize] = useState<PageSize>(() => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
