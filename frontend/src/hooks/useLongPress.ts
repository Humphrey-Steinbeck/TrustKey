// TrustKey Long Press Hook

import { useState, useRef, useCallback } from 'react';

interface UseLongPressOptions {
  threshold?: number;
  onStart?: (event: React.MouseEvent | React.TouchEvent) => void;
  onFinish?: (event: React.MouseEvent | React.TouchEvent) => void;
  onCancel?: (event: React.MouseEvent | React.TouchEvent) => void;
}

export function useLongPress(
  onLongPress: (event: React.MouseEvent | React.TouchEvent) => void,
  options: UseLongPressOptions = {}
): {
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: () => void;
} {
  const { threshold = 400, onStart, onFinish, onCancel } = options;
  
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (onStart) {
        onStart(event);
      }
      target.current = event.target;
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, threshold);
    },
    [onLongPress, threshold, onStart]
  );

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && !longPressTriggered && onFinish && onFinish(event);
      setLongPressTriggered(false);
    },
    [onFinish, longPressTriggered]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => {
      clear(e, false);
      onCancel && onCancel(e);
    },
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  };
}
