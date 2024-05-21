// TrustKey Drag Hook

import { useState, useRef, useCallback } from 'react';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

interface UseDragOptions {
  onDragStart?: (state: DragState) => void;
  onDrag?: (state: DragState) => void;
  onDragEnd?: (state: DragState) => void;
  threshold?: number;
}

export function useDrag(options: UseDragOptions = {}): {
  dragState: DragState;
  dragProps: {
    onMouseDown: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
  };
} {
  const { onDragStart, onDrag, onDragEnd, threshold = 0 } = options;
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      isDraggingRef.current = false;
      startPosRef.current = { x: clientX, y: clientY };
      
      setDragState({
        isDragging: false,
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        currentY: clientY,
        deltaX: 0,
        deltaY: 0,
      });
    },
    []
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const deltaX = clientX - startPosRef.current.x;
      const deltaY = clientY - startPosRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (!isDraggingRef.current && distance > threshold) {
        isDraggingRef.current = true;
        setDragState(prev => ({
          ...prev,
          isDragging: true,
        }));
        onDragStart?.(dragState);
      }

      if (isDraggingRef.current) {
        const newState = {
          isDragging: true,
          startX: startPosRef.current.x,
          startY: startPosRef.current.y,
          currentX: clientX,
          currentY: clientY,
          deltaX,
          deltaY,
        };
        
        setDragState(newState);
        onDrag?.(newState);
      }
    },
    [threshold, onDragStart, onDrag, dragState]
  );

  const handleEnd = useCallback(() => {
    if (isDraggingRef.current) {
      onDragEnd?.(dragState);
    }
    
    setDragState(prev => ({
      ...prev,
      isDragging: false,
    }));
    
    isDraggingRef.current = false;
  }, [onDragEnd, dragState]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      handleStart(event.clientX, event.clientY);
      
      const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      };
      
      const handleMouseUp = () => {
        handleEnd();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleStart, handleMove, handleEnd]
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      handleStart(touch.clientX, touch.clientY);
      
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      };
      
      const handleTouchEnd = () => {
        handleEnd();
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    },
    [handleStart, handleMove, handleEnd]
  );

  return {
    dragState,
    dragProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
  };
}
