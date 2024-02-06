// TrustKey Focus Hook

import { useState, useRef, useCallback } from 'react';

export function useFocus<T extends HTMLElement>(): [
  React.RefObject<T>,
  boolean,
  () => void,
  () => void
] {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<T>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const focus = useCallback(() => {
    ref.current?.focus();
  }, []);

  const blur = useCallback(() => {
    ref.current?.blur();
  }, []);

  const setRef = useCallback((node: T | null) => {
    if (ref.current) {
      ref.current.removeEventListener('focus', handleFocus);
      ref.current.removeEventListener('blur', handleBlur);
    }

    ref.current = node;

    if (ref.current) {
      ref.current.addEventListener('focus', handleFocus);
      ref.current.addEventListener('blur', handleBlur);
    }
  }, [handleFocus, handleBlur]);

  return [setRef, isFocused, focus, blur];
}
