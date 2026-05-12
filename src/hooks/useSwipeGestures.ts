import { useSwipeable, SwipeableHandlers, SwipeEventData } from 'react-swipeable';

export interface SwipeGestureHandlers {
  /** Callback when user swipes left */
  onSwipeLeft?: () => void;
  /** Callback when user swipes right */
  onSwipeRight?: () => void;
  /** Callback when user swipes up */
  onSwipeUp?: () => void;
  /** Callback when user swipes down */
  onSwipeDown?: () => void;
  /** Whether to prevent default touch behavior */
  preventDefaultTouchmoveEvent?: boolean;
  /** Minimum swipe distance in pixels (default: 50) */
  delta?: number;
}

/**
 * useSwipeGestures - Hook for handling touch swipe gestures
 *
 * Features:
 * - Left/right swipes for navigation
 * - Down swipe for refresh/close
 * - Up swipe for additional actions
 * - Configurable swipe threshold
 * - Mobile-optimized
 *
 * Usage:
 * ```tsx
 * const handlers = useSwipeGestures({
 *   onSwipeLeft: () => navigateNext(),
 *   onSwipeRight: () => navigatePrevious(),
 *   onSwipeDown: () => refreshData(),
 * });
 *
 * return <div {...handlers}>Content</div>;
 * ```
 */
export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  preventDefaultTouchmoveEvent = false,
  delta = 50,
}: SwipeGestureHandlers): SwipeableHandlers {
  return useSwipeable({
    onSwipedLeft: (eventData: SwipeEventData) => {
      if (onSwipeLeft && Math.abs(eventData.deltaX) > delta) {
        onSwipeLeft();
      }
    },
    onSwipedRight: (eventData: SwipeEventData) => {
      if (onSwipeRight && Math.abs(eventData.deltaX) > delta) {
        onSwipeRight();
      }
    },
    onSwipedUp: (eventData: SwipeEventData) => {
      if (onSwipeUp && Math.abs(eventData.deltaY) > delta) {
        onSwipeUp();
      }
    },
    onSwipedDown: (eventData: SwipeEventData) => {
      if (onSwipeDown && Math.abs(eventData.deltaY) > delta) {
        onSwipeDown();
      }
    },
    preventDefaultTouchmoveEvent,
    trackMouse: false, // Only track touch, not mouse
    delta, // Minimum distance (in px) before a swipe starts
  });
}

/**
 * useCalendarSwipeGestures - Specialized hook for calendar navigation
 *
 * Features:
 * - Left swipe: Next period
 * - Right swipe: Previous period
 * - Down swipe: Refresh data
 * - Optimized for calendar views
 */
export function useCalendarSwipeGestures({
  onNavigateNext,
  onNavigatePrevious,
  onRefresh,
}: {
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  onRefresh?: () => void;
}): SwipeableHandlers {
  return useSwipeGestures({
    onSwipeLeft: onNavigateNext,
    onSwipeRight: onNavigatePrevious,
    onSwipeDown: onRefresh,
    preventDefaultTouchmoveEvent: false,
    delta: 75, // Larger threshold for calendar to prevent accidental swipes
  });
}
