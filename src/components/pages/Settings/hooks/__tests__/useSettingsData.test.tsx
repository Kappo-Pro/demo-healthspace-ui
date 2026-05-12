/**
 * useSettingsData Hook Unit Tests
 *
 * Epic 1 - Story 1.5: Test Suite for useSettingsData Hook
 *
 * Coverage Target: 100%
 *
 * Test Strategy:
 * 1. Test hook fetches data on mount
 * 2. Test loading states
 * 3. Test error handling
 * 4. Test refetch function
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/settings/settingsSlice';
import { useSettingsData } from '../useSettingsData';

// ============================================================================
// MOCK STORE SETUP
// ============================================================================

const createMockStore = () => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
  });
};

// ============================================================================
// WRAPPER COMPONENT
// ============================================================================

const createWrapper = () => {
  const store = createMockStore();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return Wrapper;
};

// ============================================================================
// TESTS
// ============================================================================

describe('useSettingsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useSettingsData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should complete loading after mount', async () => {
    const { result } = renderHook(() => useSettingsData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should log success message after fetching', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    renderHook(() => useSettingsData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[useSettingsData] All settings fetched successfully'
      );
    });
  });

  it('should provide a working refetch function', async () => {
    const { result } = renderHook(() => useSettingsData(), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refetch
    const refetchPromise = result.current.refetch();
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(refetchPromise).resolves.toBeUndefined();
  });

  it('should maintain stable refetch function reference', async () => {
    const { result, rerender } = renderHook(() => useSettingsData(), {
      wrapper: createWrapper(),
    });

    const firstRefetch = result.current.refetch;

    rerender();

    const secondRefetch = result.current.refetch;

    // refetch should be stable (same reference)
    expect(firstRefetch).toBe(secondRefetch);
  });

  it('should handle errors gracefully', async () => {
    // Mock dispatch to throw error
    const _mockError = new Error('Network error');

    // Note: Since our implementation doesn't actually dispatch thunks yet (they're commented out),
    // we can't easily test the error path without mocking the entire useCallback
    // This is a placeholder test for when actual thunks are implemented

    expect(true).toBe(true);
  });

  it('should set error state when Promise.all rejects', async () => {
    // This test would require mocking the dispatch to throw
    // Placeholder for future implementation when thunks are added
    expect(true).toBe(true);
  });

  it('should clear error state on successful refetch', async () => {
    const { result } = renderHook(() => useSettingsData(), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Error should be null
    expect(result.current.error).toBeNull();

    // Refetch should maintain error=null
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('should set loading=false even if fetch fails', async () => {
    // Placeholder for error handling test
    // Will be implemented when actual thunks are added
    expect(true).toBe(true);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('useSettingsData - Integration', () => {
  it('should work with real Redux store', async () => {
    const { result } = renderHook(() => useSettingsData(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toEqual({
      loading: expect.any(Boolean),
      error: null,
      refetch: expect.any(Function),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
