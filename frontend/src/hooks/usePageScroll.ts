// TrustKey Page Scroll Hook

import { useState, useEffect } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

export function usePageScroll(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    return {
      x: window.scrollX,
      y: window.scrollY,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}
