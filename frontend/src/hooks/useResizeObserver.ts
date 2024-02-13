// TrustKey Resize Observer Hook

import { useState, useEffect, useRef } from 'react';

interface ResizeObserverEntry {
  contentRect: DOMRectReadOnly;
  target: Element;
}

export function useResizeObserver(): [
  React.RefObject<HTMLElement>,
  ResizeObserverEntry | null
] {
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      setEntry(entry);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return [ref, entry];
}
