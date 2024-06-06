// TrustKey Copy to Clipboard Hook

import { useState, useCallback } from 'react';

interface CopyToClipboardState {
  value: string | null;
  error: Error | null;
  copied: boolean;
}

export function useCopyToClipboard(): {
  copyToClipboard: (text: string) => Promise<void>;
  value: string | null;
  error: Error | null;
  copied: boolean;
  reset: () => void;
} {
  const [state, setState] = useState<CopyToClipboardState>({
    value: null,
    error: null,
    copied: false,
  });

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState({
        value: text,
        error: null,
        copied: true,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, copied: false }));
      }, 2000);
    } catch (error) {
      setState({
        value: null,
        error: error instanceof Error ? error : new Error('Failed to copy to clipboard'),
        copied: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      value: null,
      error: null,
      copied: false,
    });
  }, []);

  return {
    copyToClipboard,
    value: state.value,
    error: state.error,
    copied: state.copied,
    reset,
  };
}
