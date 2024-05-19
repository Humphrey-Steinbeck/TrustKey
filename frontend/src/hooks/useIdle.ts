// TrustKey Idle Hook

import { useState, useEffect, useRef } from 'react';

interface UseIdleOptions {
  timeout?: number;
  events?: string[];
  initialState?: boolean;
}

export function useIdle(options: UseIdleOptions = {}): boolean {
  const {
    timeout = 1000,
    events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
    initialState = false,
  } = options;

  const [isIdle, setIsIdle] = useState(initialState);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleEvent = () => {
      setIsIdle(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, timeout);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsIdle(true);
      } else {
        handleEvent();
      }
    };

    // Set initial timeout
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, timeout);

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleEvent, true);
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      events.forEach((event) => {
        document.removeEventListener(event, handleEvent, true);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeout, events]);

  return isIdle;
}
