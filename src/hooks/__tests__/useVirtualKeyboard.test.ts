/**
 * useVirtualKeyboard Tests
 * Story 7.3: VirtualKeyboard Handler for Mobile Input
 *
 * Test Coverage:
 * - iOS visualViewport detection (AC 1, 9)
 * - Android resize event detection (AC 1, 9)
 * - Keyboard height calculation (AC 2)
 * - Content height adjustment (AC 2, 3)
 * - Minimum 40% viewport visible (AC 3)
 * - Debouncing (100ms)
 * - Desktop behavior (AC 8)
 * - Touch device detection (AC 8)
 */

import { renderHook, act } from '@testing-library/react';
import { useVirtualKeyboard } from '../useVirtualKeyboard';

describe('useVirtualKeyboard', () => {
  let mockVisualViewport: Partial<VisualViewport> & {
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    // Mock touch device
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: true,
    });

    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 1,
    });

    // Mock visualViewport
    mockVisualViewport = {
      height: 667,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('AC 1: Hook Initialization', () => {
    it('should return isOpen, height, and contentHeight', () => {
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(result.current).toHaveProperty('isOpen');
      expect(result.current).toHaveProperty('height');
      expect(result.current).toHaveProperty('contentHeight');
      expect(typeof result.current.isOpen).toBe('boolean');
      expect(typeof result.current.height).toBe('number');
      expect(typeof result.current.contentHeight).toBe('number');
    });

    it('should initialize with keyboard closed', () => {
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(result.current.isOpen).toBe(false);
      expect(result.current.height).toBe(0);
      expect(result.current.contentHeight).toBe(667 - 60 - 40); // viewport - header - padding
    });
  });

  describe('AC 1, 9: iOS visualViewport Detection', () => {
    it('should detect keyboard open via visualViewport.height change', () => {
      mockVisualViewport.height = 400; // Keyboard open (667 - 267 = 400)

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(result.current.isOpen).toBe(true);
      expect(result.current.height).toBe(267); // 667 - 400
      expect(result.current.contentHeight).toBeLessThan(400);
    });

    it('should attach visualViewport resize and scroll listeners', () => {
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('should clean up visualViewport listeners on unmount', () => {
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { unmount } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      unmount();

      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });

  describe('AC 1, 9: Android Resize Event Detection', () => {
    it('should detect keyboard via window.resize when visualViewport unavailable', () => {
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should calculate keyboard height from innerHeight delta', () => {
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const { result, rerender } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      // Initial: no keyboard
      expect(result.current.height).toBe(0);

      // Simulate keyboard open (innerHeight reduces)
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 400, // Keyboard reduced height by 267px
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      rerender();

      // Keyboard height detected (667 - 400 - 60 = 207px)
      expect(result.current.height).toBeGreaterThan(100);
    });
  });

  describe('AC 2: Keyboard Height Calculation', () => {
    it('should calculate keyboard height correctly on iOS', () => {
      mockVisualViewport.height = 400;

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(result.current.height).toBe(267); // 667 - 400 = 267px
    });

    it('should set keyboard height to 0 when closed', () => {
      mockVisualViewport.height = 667; // Full height (no keyboard)

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(result.current.height).toBe(0);
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('AC 2, 3: Content Height Adjustment', () => {
    it('should adjust content height when keyboard opens', () => {
      mockVisualViewport.height = 667; // Initial (keyboard closed)

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result, rerender } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      // Initial: full height minus header and padding
      const initialHeight = result.current.contentHeight;
      expect(initialHeight).toBe(667 - 60 - 40); // 567px

      // Simulate keyboard open
      act(() => {
        mockVisualViewport.height = 400;
        const resizeHandler = mockVisualViewport.addEventListener.mock.calls.find(
          call => call[0] === 'resize'
        )?.[1];
        if (resizeHandler) {
          resizeHandler();
        }
      });

      rerender();

      // Content height reduced
      expect(result.current.contentHeight).toBeLessThan(initialHeight);
      expect(result.current.contentHeight).toBe(400 - 60 - 40); // 300px
    });

    it('should restore content height when keyboard closes', () => {
      mockVisualViewport.height = 400; // Keyboard initially open

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result, rerender } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      // Initial: reduced height
      expect(result.current.contentHeight).toBe(300);

      // Simulate keyboard close
      act(() => {
        mockVisualViewport.height = 667;
        const resizeHandler = mockVisualViewport.addEventListener.mock.calls.find(
          call => call[0] === 'resize'
        )?.[1];
        if (resizeHandler) {
          resizeHandler();
        }
      });

      rerender();

      // Content height restored
      expect(result.current.contentHeight).toBe(667 - 60 - 40); // 567px
    });
  });

  describe('AC 3: Minimum Visible Space', () => {
    it('should maintain minimum 40% viewport visible', () => {
      mockVisualViewport.height = 100; // Very small (extreme case)

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
          minVisibleFraction: 0.4, // 40%
          minVisiblePixels: 300,
        })
      );

      // Should maintain at least 40vh (667 * 0.4 = 266.8) or 300px (whichever is larger)
      const minHeight = Math.max(667 * 0.4, 300);
      expect(result.current.contentHeight).toBeGreaterThanOrEqual(minHeight);
    });

    it('should respect custom minimum visible pixels', () => {
      mockVisualViewport.height = 200;

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
          minVisiblePixels: 350, // Custom minimum
        })
      );

      expect(result.current.contentHeight).toBeGreaterThanOrEqual(350);
    });

    it('should respect custom minimum visible fraction', () => {
      mockVisualViewport.height = 300;

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
          minVisibleFraction: 0.5, // 50% minimum
          minVisiblePixels: 100, // Low pixel minimum to test fraction
        })
      );

      // Should be at least 50% of initial viewport (667 * 0.5 = 333.5)
      expect(result.current.contentHeight).toBeGreaterThanOrEqual(333);
    });
  });

  describe('Debouncing (100ms)', () => {
    it('should debounce resize events with 100ms delay', () => {
      jest.useFakeTimers();

      mockVisualViewport.height = 667;

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      const resizeHandler = mockVisualViewport.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];

      // Trigger multiple resize events rapidly
      act(() => {
        mockVisualViewport.height = 600;
        resizeHandler?.();
        mockVisualViewport.height = 500;
        resizeHandler?.();
        mockVisualViewport.height = 400;
        resizeHandler?.();
      });

      // Height should not update immediately
      expect(result.current.height).toBe(0);

      // Advance timers by 100ms
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Now height should be updated (only final value)
      expect(result.current.height).toBe(267); // 667 - 400

      jest.useRealTimers();
    });
  });

  describe('AC 8: Desktop Behavior', () => {
    it('should not activate on non-touch devices', () => {
      // Remove touch support
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(result.current.isOpen).toBe(false);
      expect(result.current.height).toBe(0);
      expect(result.current.contentHeight).toBe(667 - 60); // Full height minus header only
    });

    it('should return full height on desktop (>= 768px width)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024, // Desktop width
      });

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(result.current.isOpen).toBe(false);
      expect(result.current.height).toBe(0);
      expect(result.current.contentHeight).toBe(667 - 60); // Full height minus header
    });

    it('should not attach listeners on desktop', () => {
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(mockVisualViewport.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Options', () => {
    it('should respect custom header height', () => {
      mockVisualViewport.height = 667;

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 80, // Custom header height
        })
      );

      expect(result.current.contentHeight).toBe(667 - 80 - 40); // 547px
    });

    it('should respect enabled flag', () => {
      mockVisualViewport.height = 400; // Keyboard open

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
          enabled: false, // Disabled
        })
      );

      // Should not detect keyboard when disabled
      expect(result.current.isOpen).toBe(false);
      expect(result.current.height).toBe(0);
    });

    it('should use default configuration when not specified', () => {
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() => useVirtualKeyboard());

      expect(result.current).toHaveProperty('isOpen');
      expect(result.current).toHaveProperty('height');
      expect(result.current).toHaveProperty('contentHeight');
    });
  });

  describe('Edge Cases', () => {
    it('should handle SSR (no window)', () => {
      const originalWindow = global.window;
      // @ts-expect-error Testing SSR scenario
      delete global.window;

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      expect(result.current.contentHeight).toBe(600); // Fallback value

      global.window = originalWindow;
    });

    it('should handle negative keyboard height (edge case)', () => {
      mockVisualViewport.height = 700; // Larger than innerHeight (shouldn't happen)

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      // Keyboard height should be clamped to 0 (not negative)
      expect(result.current.height).toBeGreaterThanOrEqual(0);
    });

    it('should handle rapid keyboard open/close cycles', () => {
      jest.useFakeTimers();

      mockVisualViewport.height = 667;

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: mockVisualViewport,
      });

      const { result } = renderHook(() =>
        useVirtualKeyboard({
          headerHeight: 60,
        })
      );

      const resizeHandler = mockVisualViewport.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];

      // Rapid cycles
      act(() => {
        mockVisualViewport.height = 400;
        resizeHandler?.();
        jest.advanceTimersByTime(50);

        mockVisualViewport.height = 667;
        resizeHandler?.();
        jest.advanceTimersByTime(50);

        mockVisualViewport.height = 400;
        resizeHandler?.();
        jest.advanceTimersByTime(100);
      });

      // Should settle on final state
      expect(result.current.height).toBe(267);
      expect(result.current.isOpen).toBe(true);

      jest.useRealTimers();
    });
  });
});
