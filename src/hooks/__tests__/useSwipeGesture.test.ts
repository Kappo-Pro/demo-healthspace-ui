/**
 * useSwipeGesture Tests
 * Story 7.2: SwipeGesture Hook for Mobile Close
 *
 * Test Coverage:
 * - Distance threshold tests (AC 2)
 * - Velocity threshold tests (AC 3)
 * - Visual feedback tests (AC 4, 5)
 * - Direction detection tests (AC 7)
 * - Scroll conflict tests (AC 8)
 * - State management tests (AC 9)
 * - Touch device detection tests (AC 10)
 */

import { renderHook, act } from '@testing-library/react';
import { useSwipeGesture } from '../useSwipeGesture';

// Mock touch event creator
const createTouchEvent = (
  type: string,
  clientY: number,
  clientX = 0,
  timestamp?: number
): TouchEvent => {
  const touch = {
    clientY,
    clientX,
    identifier: 0,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 1,
    target: document.createElement('div'),
  } as Touch;

  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [touch],
    writable: false,
  });
  Object.defineProperty(event, 'changedTouches', {
    value: [touch],
    writable: false,
  });

  if (timestamp) {
    Object.defineProperty(event, 'timeStamp', {
      value: timestamp,
      writable: false,
    });
  }

  return event;
};

describe('useSwipeGesture', () => {
  let container: HTMLDivElement;
  let onSwipe: jest.Mock;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    onSwipe = jest.fn();

    // Mock touch device
    Object.defineProperty(window, 'ontouchstart', {
      value: true,
      writable: true,
      configurable: true,
    });

    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      value: 667,
      writable: true,
      configurable: true,
    });

    // Mock Date.now for velocity calculations
    jest.spyOn(Date, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.restoreAllMocks();
  });

  describe('AC 1: Hook Initialization', () => {
    it('should return ref, swipeState, and translateY', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
          velocityThreshold: 0.3,
        })
      );

      expect(result.current).toHaveProperty('ref');
      expect(result.current).toHaveProperty('swipeState');
      expect(result.current).toHaveProperty('translateY');
      expect(result.current).toHaveProperty('isTouchDevice');
    });

    it('should initialize with idle state and 0 translateY', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      expect(result.current.swipeState).toBe('idle');
      expect(result.current.translateY).toBe(0);
    });
  });

  describe('AC 2: Distance Threshold (100px)', () => {
    it('should trigger close on swipe >100px', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      // Start swipe
      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(0);
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
      });

      // Swipe down 150px
      act(() => {
        container.dispatchEvent(createTouchEvent('touchmove', 150, 0));
      });

      expect(result.current.swipeState).toBe('closing');
      expect(result.current.translateY).toBe(150);

      // End swipe
      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(500); // 500ms elapsed
        container.dispatchEvent(createTouchEvent('touchend', 150, 0));
      });

      // Wait for callback timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(onSwipe).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should return to original position on swipe <100px', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(0);
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        jest.spyOn(Date, 'now').mockReturnValue(500);
        container.dispatchEvent(createTouchEvent('touchmove', 50, 0));
        container.dispatchEvent(createTouchEvent('touchend', 50, 0));
      });

      expect(onSwipe).not.toHaveBeenCalled();
      expect(result.current.translateY).toBe(0);
      expect(result.current.swipeState).toBe('idle');
    });

    it('should update translateY in real-time during swipe', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
      });

      // Progressive swipe updates
      act(() => {
        container.dispatchEvent(createTouchEvent('touchmove', 20, 0));
      });
      expect(result.current.translateY).toBe(20);

      act(() => {
        container.dispatchEvent(createTouchEvent('touchmove', 50, 0));
      });
      expect(result.current.translateY).toBe(50);

      act(() => {
        container.dispatchEvent(createTouchEvent('touchmove', 80, 0));
      });
      expect(result.current.translateY).toBe(80);
    });
  });

  describe('AC 3: Velocity Threshold (0.3px/ms)', () => {
    it('should trigger close on fast swipe (velocity >0.3px/ms) even if distance <100px', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
          velocityThreshold: 0.3,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      // Start swipe
      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(0);
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
      });

      // Fast swipe 60px in 100ms (velocity = 0.6px/ms, exceeds 0.3)
      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(100);
        container.dispatchEvent(createTouchEvent('touchmove', 60, 0));
        container.dispatchEvent(createTouchEvent('touchend', 60, 0));
      });

      // Wait for callback timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(onSwipe).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should not trigger on slow swipe with insufficient distance', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
          velocityThreshold: 0.3,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      // Slow swipe 60px in 1000ms (velocity = 0.06px/ms, below 0.3)
      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(0);
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        jest.spyOn(Date, 'now').mockReturnValue(1000);
        container.dispatchEvent(createTouchEvent('touchmove', 60, 0));
        container.dispatchEvent(createTouchEvent('touchend', 60, 0));
      });

      expect(onSwipe).not.toHaveBeenCalled();
      expect(result.current.swipeState).toBe('idle');
    });
  });

  describe('AC 4, 5: Visual Feedback & Spring Animation', () => {
    it('should update swipeState to "swiping" when distance >10px', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        container.dispatchEvent(createTouchEvent('touchmove', 15, 0));
      });

      expect(result.current.swipeState).toBe('swiping');
    });

    it('should update swipeState to "closing" when distance >threshold', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        container.dispatchEvent(createTouchEvent('touchmove', 150, 0));
      });

      expect(result.current.swipeState).toBe('closing');
    });

    it('should reset swipeState to "idle" after failed swipe', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        container.dispatchEvent(createTouchEvent('touchmove', 50, 0));
      });

      expect(result.current.swipeState).toBe('swiping');

      act(() => {
        container.dispatchEvent(createTouchEvent('touchend', 50, 0));
      });

      expect(result.current.swipeState).toBe('idle');
      expect(result.current.translateY).toBe(0);
    });
  });

  describe('AC 7: Direction Detection (Vertical Only)', () => {
    it('should ignore horizontal swipe (deltaX > deltaY)', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        // Horizontal swipe (deltaX = 100, deltaY = 20)
        container.dispatchEvent(createTouchEvent('touchmove', 20, 100));
        container.dispatchEvent(createTouchEvent('touchend', 20, 100));
      });

      expect(onSwipe).not.toHaveBeenCalled();
      expect(result.current.swipeState).toBe('idle');
    });

    it('should ignore upward swipe (deltaY < 0)', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 100, 0));
        // Upward swipe (deltaY = -50)
        container.dispatchEvent(createTouchEvent('touchmove', 50, 0));
        container.dispatchEvent(createTouchEvent('touchend', 50, 0));
      });

      expect(onSwipe).not.toHaveBeenCalled();
    });

    it('should detect vertical downward swipe', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(0);
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        jest.spyOn(Date, 'now').mockReturnValue(500);
        // Vertical swipe (deltaX = 5, deltaY = 150)
        container.dispatchEvent(createTouchEvent('touchmove', 150, 5));
        container.dispatchEvent(createTouchEvent('touchend', 150, 5));
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(onSwipe).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('AC 8: Scroll Conflict Resolution', () => {
    it('should ignore swipe when scrolled down (scrollTop > 0)', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      // Simulate scrolled container
      Object.defineProperty(container, 'scrollTop', {
        value: 100,
        writable: true,
        configurable: true,
      });

      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        container.dispatchEvent(createTouchEvent('touchmove', 150, 0));
        container.dispatchEvent(createTouchEvent('touchend', 150, 0));
      });

      expect(onSwipe).not.toHaveBeenCalled();
      expect(result.current.swipeState).toBe('idle');
    });

    it('should detect swipe when at top of scroll container (scrollTop === 0)', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 100,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      Object.defineProperty(container, 'scrollTop', {
        value: 0,
        writable: true,
        configurable: true,
      });

      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(0);
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        jest.spyOn(Date, 'now').mockReturnValue(500);
        container.dispatchEvent(createTouchEvent('touchmove', 150, 0));
        container.dispatchEvent(createTouchEvent('touchend', 150, 0));
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(onSwipe).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should only detect swipe from top detection zone', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          topDetectionZone: 50,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      // Mock container bounding box
      container.getBoundingClientRect = jest.fn(() => ({
        top: 100,
        bottom: 500,
        left: 0,
        right: 375,
        width: 375,
        height: 400,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      }));

      Object.defineProperty(container, 'scrollTop', {
        value: 0,
        writable: true,
        configurable: true,
      });

      // Touch outside top detection zone (relativeY = 80, zone = 50)
      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 180, 0)); // 180 - 100 (top) = 80px
        container.dispatchEvent(createTouchEvent('touchmove', 280, 0));
        container.dispatchEvent(createTouchEvent('touchend', 280, 0));
      });

      expect(result.current.swipeState).toBe('idle');
    });
  });

  describe('AC 9: State Management', () => {
    it('should provide current swipe state', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      // Idle state
      expect(result.current.swipeState).toBe('idle');

      // Swiping state
      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        container.dispatchEvent(createTouchEvent('touchmove', 20, 0));
      });
      expect(result.current.swipeState).toBe('swiping');

      // Closing state
      act(() => {
        container.dispatchEvent(createTouchEvent('touchmove', 150, 0));
      });
      expect(result.current.swipeState).toBe('closing');
    });
  });

  describe('AC 10: Touch Device Detection', () => {
    it('should not attach listeners on non-touch devices', () => {
      // Remove touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
        configurable: true,
      });

      const addEventListenerSpy = jest.spyOn(container, 'addEventListener');

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      expect(result.current.isTouchDevice).toBe(false);
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('should attach listeners on touch devices', () => {
      const addEventListenerSpy = jest.spyOn(container, 'addEventListener');

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      expect(result.current.isTouchDevice).toBe(true);
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true });
    });

    it('should clean up listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(container, 'removeEventListener');

      const { result, unmount } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });
  });

  describe('Configuration Options', () => {
    it('should respect custom distance threshold', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          distanceThreshold: 200, // Custom threshold
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        jest.spyOn(Date, 'now').mockReturnValue(0);
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        jest.spyOn(Date, 'now').mockReturnValue(500);
        container.dispatchEvent(createTouchEvent('touchmove', 150, 0)); // Below 200px
        container.dispatchEvent(createTouchEvent('touchend', 150, 0));
      });

      expect(onSwipe).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should respect enabled flag', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipe,
          enabled: false,
        })
      );

      act(() => {
        result.current.ref.current = container;
      });

      act(() => {
        container.dispatchEvent(createTouchEvent('touchstart', 0, 0));
        container.dispatchEvent(createTouchEvent('touchmove', 150, 0));
        container.dispatchEvent(createTouchEvent('touchend', 150, 0));
      });

      expect(onSwipe).not.toHaveBeenCalled();
      expect(result.current.swipeState).toBe('idle');
    });
  });
});
