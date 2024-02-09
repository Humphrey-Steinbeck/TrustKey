// TrustKey Page Focus Hook

import { useState, useEffect } from 'react';

export function usePageFocus(): boolean {
  const [isFocused, setIsFocused] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.hasFocus();
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isFocused;
}
