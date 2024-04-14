// TrustKey Timeout Hook

import { useEffect, useRef } from 'react';

export function useTimeout(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setTimeout(tick, delay);
    return () => clearTimeout(id);
  }, [delay]);
}
