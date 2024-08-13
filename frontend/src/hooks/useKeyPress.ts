// TrustKey Key Press Hook

import { useEffect, useCallback } from 'react';

export function useKeyPress(
  targetKey: string | string[],
  callback: (event: KeyboardEvent) => void,
  options: {
    target?: EventTarget;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  } = {}
): void {
  const { target = window, preventDefault = false, stopPropagation = false } = options;

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const keys = Array.isArray(targetKey) ? targetKey : [targetKey];
      
      if (keys.includes(event.key) || keys.includes(event.code)) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callback(event);
      }
    },
    [targetKey, callback, preventDefault, stopPropagation]
  );

  useEffect(() => {
    target.addEventListener('keydown', handleKeyPress);
    return () => {
      target.removeEventListener('keydown', handleKeyPress);
    };
  }, [target, handleKeyPress]);
}
