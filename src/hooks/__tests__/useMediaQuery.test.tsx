/**
 * useMediaQuery Hook Tests
 * Story 4.5: Tests for responsive media query detection hook
 */

import { renderHook } from '@testing-library/react';
import { useMediaQuery } from '../useMediaQuery';

describe('useMediaQuery', () => {
  let mockMediaQueryList: {
    matches: boolean;
    media: string;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    mockMediaQueryList = {
      matches: false,
      media: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    window.matchMedia = jest.fn().mockImplementation((query) => {
      mockMediaQueryList.media = query;
      return mockMediaQueryList;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns initial match state', () => {
    mockMediaQueryList.matches = true;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    mockMediaQueryList.matches = false;

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result.current).toBe(false);
  });

  it('registers event listener on mount', () => {
    renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    unmount();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('updates state when media query changes', () => {
    mockMediaQueryList.matches = false;

    const { result, rerender } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    // Simulate media query change
    mockMediaQueryList.matches = true;
    const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1];
    changeHandler({ matches: true } as MediaQueryListEvent);

    rerender();

    expect(result.current).toBe(true);
  });

  it('handles query string changes', () => {
    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    );

    expect(mockMediaQueryList.media).toBe('(min-width: 768px)');

    rerender({ query: '(max-width: 767px)' });

    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('returns false in SSR environment', () => {
    // Mock SSR by making window.matchMedia undefined
    const originalMatchMedia = window.matchMedia;
    // @ts-expect-error - Simulating SSR
    window.matchMedia = undefined;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    // Restore matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('handles multiple instances with different queries', () => {
    const { result: result1 } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    const { result: result2 } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
    expect(window.matchMedia).toHaveBeenCalledTimes(4); // 2 calls per hook (initial + effect)
  });
});
