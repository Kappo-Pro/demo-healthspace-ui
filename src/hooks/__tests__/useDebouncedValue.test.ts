/**
 * useDebouncedValue Hook Tests
 * Story 3.3: Performance optimization hook for search inputs
 *
 * Test Coverage:
 * - AC5: useDebouncedValue debounces search input with 300ms delay
 * - AC6: useDebouncedValue uses useState and useEffect for debounce logic
 * - AC7: useDebouncedValue cleans up timeout on unmount or value change
 */

import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('AC5 & AC6: Basic Debouncing with useState and useEffect', () => {
    it('should return initial value immediately', () => {
      const { result: _result } = renderHook(() => useDebouncedValue('initial', 300));

      expect(result.current).toBe('initial');
    });

    it('should debounce value after delay (300ms)', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      );

      expect(result.current).toBe('initial');

      // Update value
      rerender({ value: 'updated', delay: 300 });

      // Should still be initial (not debounced yet)
      expect(result.current).toBe('initial');

      // Fast-forward 300ms
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should now be updated
      expect(result.current).toBe('updated');
    });

    it('should use specified delay time', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'updated', delay: 500 });

      // Fast-forward 300ms - should still be initial
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('initial');

      // Fast-forward another 200ms (total 500ms) - should be updated
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe('updated');
    });

    it('should work with different types (string)', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'hello' } }
      );

      rerender({ value: 'world' });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('world');
    });

    it('should work with different types (number)', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 0 } }
      );

      rerender({ value: 42 });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(42);
    });

    it('should work with different types (object)', () => {
      const initialObj = { foo: 'bar' };
      const updatedObj = { foo: 'baz' };

      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: initialObj } }
      );

      expect(result.current).toEqual(initialObj);

      rerender({ value: updatedObj });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toEqual(updatedObj);
    });
  });

  describe('AC7: Cleanup - Timeout Cancellation', () => {
    it('should cancel previous timeout on value change (rapid typing)', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'a' } }
      );

      // Rapid value changes
      rerender({ value: 'ab' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'abc' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'abcd' });

      // Only 200ms has passed, value should still be initial
      expect(result.current).toBe('a');

      // Fast-forward final 300ms from last change
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should only apply the last value
      expect(result.current).toBe('abcd');
    });

    it('should clean up timeout on unmount', () => {
      const { unmount, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // Unmount before timeout completes
      unmount();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // No errors should occur (cleanup successful)
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should reset timeout when delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      );

      rerender({ value: 'updated', delay: 300 });

      // Fast-forward 200ms
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Change delay
      rerender({ value: 'updated', delay: 500 });

      // Fast-forward 300ms (would have triggered with old delay)
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should still be initial (new delay hasn't completed)
      expect(result.current).toBe('initial');

      // Fast-forward remaining 200ms
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Now should be updated
      expect(result.current).toBe('updated');
    });

    it('should handle multiple rapid value changes correctly', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'a' } }
      );

      // Simulate typing: a -> ab -> abc -> abcd -> abcde
      const values = ['ab', 'abc', 'abcd', 'abcde'];
      values.forEach((value) => {
        rerender({ value });
        act(() => {
          jest.advanceTimersByTime(50); // Typing interval
        });
      });

      // Total time elapsed: 200ms (50ms * 4)
      // Value should still be initial
      expect(result.current).toBe('a');

      // Fast-forward remaining time (300ms - 200ms = 100ms + full 300ms for last)
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Should now have the last value
      expect(result.current).toBe('abcde');
    });
  });

  describe('Integration: Search Input Simulation', () => {
    it('should simulate search input debouncing (300ms delay)', () => {
      const { result, rerender } = renderHook(
        ({ query }) => useDebouncedValue(query, 300),
        { initialProps: { query: '' } }
      );

      // User starts typing
      rerender({ query: 'd' });
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current).toBe('');

      rerender({ query: 'da' });
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current).toBe('');

      rerender({ query: 'das' });
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current).toBe('');

      rerender({ query: 'dash' });

      // User stops typing - wait for debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Search triggers with debounced value
      expect(result.current).toBe('dash');
    });

    it('should prevent excessive API calls during typing', () => {
      let apiCallCount = 0;
      const mockApiCall = jest.fn(() => {
        apiCallCount++;
      });

      const { rerender } = renderHook(
        ({ query }) => {
          const debouncedQuery = useDebouncedValue(query, 300);

          // Simulate effect that triggers API call
          if (debouncedQuery && debouncedQuery.length > 0) {
            mockApiCall();
          }

          return debouncedQuery;
        },
        { initialProps: { query: '' } }
      );

      // User types 5 characters
      const queries = ['d', 'da', 'das', 'dash', 'dashb'];
      queries.forEach((query) => {
        rerender({ query });
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      // API should NOT have been called yet
      expect(apiCallCount).toBe(0);

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // API should only be called ONCE after debounce
      expect(apiCallCount).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: '' });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('');
    });

    it('should handle null value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' as string | null } }
      );

      rerender({ value: null });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBeNull();
    });

    it('should handle undefined value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' as string | undefined } }
      );

      rerender({ value: undefined });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBeUndefined();
    });

    it('should handle zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 0),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });

    it('should handle same value multiple times', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'same' } }
      );

      rerender({ value: 'same' });
      rerender({ value: 'same' });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('same');
    });
  });
});
