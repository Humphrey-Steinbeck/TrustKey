// TrustKey Mutation Observer Hook

import { useEffect, useRef } from 'react';

interface UseMutationObserverOptions {
  attributes?: boolean;
  childList?: boolean;
  subtree?: boolean;
  characterData?: boolean;
  attributeOldValue?: boolean;
  characterDataOldValue?: boolean;
  attributeFilter?: string[];
}

export function useMutationObserver(
  callback: (mutations: MutationRecord[], observer: MutationObserver) => void,
  options: UseMutationObserverOptions = {}
): React.RefObject<HTMLElement> {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new MutationObserver(callback);
    observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
      ...options,
    });

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return ref;
}
