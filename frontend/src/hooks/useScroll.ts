// TrustKey Scroll Hook

import { useState, useEffect } from 'react';

interface ScrollState {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  isScrolling: boolean;
}

export function useScroll(
  element?: HTMLElement | null
): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    x: 0,
    y: 0,
    direction: null,
    isScrolling: false,
  });

  useEffect(() => {
    const target = element || window;
    let lastX = 0;
    let lastY = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentX = target === window ? window.scrollX : (target as HTMLElement).scrollLeft;
      const currentY = target === window ? window.scrollY : (target as HTMLElement).scrollTop;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;
      
      if (currentY > lastY) {
        direction = 'down';
      } else if (currentY < lastY) {
        direction = 'up';
      } else if (currentX > lastX) {
        direction = 'right';
      } else if (currentX < lastX) {
        direction = 'left';
      }

      setScrollState({
        x: currentX,
        y: currentY,
        direction,
        isScrolling: true,
      });

      lastX = currentX;
      lastY = currentY;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setScrollState(prev => ({
          ...prev,
          isScrolling: false,
        }));
      }, 150);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      target.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [element]);

  return scrollState;
}
