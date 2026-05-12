/**
 * useAutosave Hook Unit Tests
 *
 * Epic 1 - Story 1.5: Test Suite for useAutosave Hook
 *
 * Coverage Target: 100%
 *
 * Test Strategy:
 * 1. Test circuit breaker (queue full)
 * 2. Test debounce timing (2 seconds default)
 * 3. Test cleanup on unmount
 * 4. Test content change detection
 * 5. Test error handling
 */

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/settings/settingsSlice';
import { useAutosave } from '../useAutosave';

// ============================================================================
// MOCK STORE SETUP
// ============================================================================

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        ...initialState,
      },
    } as any,
  });
};

// ============================================================================
// WRAPPER COMPONENT
// ============================================================================

const createWrapper = (store: ReturnType<typeof createMockStore>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return Wrapper;
};

// ============================================================================
// TESTS
// ============================================================================

describe('useAutosave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should return initial state', () => {
    const store = createMockStore();
    const onSave = jest.fn();

    const { result } = renderHook(
      () =>
        useAutosave({
          content: 'test',
          onSave,
          queueKey: 'test',
        }),
      { wrapper: createWrapper(store) }
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should debounce saves by 2 seconds (default)', async () => {
    const store = createMockStore();
    const onSave = jest.fn().mockResolvedValue(undefined);

    renderHook(
      () =>
        useAutosave({
          content: 'test content',
          onSave,
          queueKey: 'test',
        }),
      { wrapper: createWrapper(store) }
    );

    // Should not call onSave immediately
    expect(onSave).not.toHaveBeenCalled();

    // Fast-forward time by 1 second (not enough)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onSave).not.toHaveBeenCalled();

    // Fast-forward time by another 1 second (total 2 seconds)
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('test content');
    });
  });

  it('should use custom debounce time', async () => {
    const store = createMockStore();
    const onSave = jest.fn().mockResolvedValue(undefined);

    renderHook(
      () =>
        useAutosave({
          content: 'test',
          onSave,
          queueKey: 'test',
          debounce: 500, // Custom 500ms debounce
        }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('should not save when content has not changed', async () => {
    const store = createMockStore();
    const onSave = jest.fn();

    const { rerender } = renderHook(
      ({ content }) =>
        useAutosave({
          content,
          onSave,
          queueKey: 'test',
        }),
      {
        wrapper: createWrapper(store),
        initialProps: { content: 'initial' },
      }
    );

    // Clear any initial calls
    onSave.mockClear();

    // Rerender with same content
    rerender({ content: 'initial' });

    // Advance time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should NOT call onSave (content unchanged)
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should save when content changes', async () => {
    const store = createMockStore();
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ content }) =>
        useAutosave({
          content,
          onSave,
          queueKey: 'test',
        }),
      {
        wrapper: createWrapper(store),
        initialProps: { content: 'initial' },
      }
    );

    // Rerender with different content
    rerender({ content: 'changed' });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('changed');
    });
  });

  it('should not save when enabled=false', async () => {
    const store = createMockStore();
    const onSave = jest.fn();

    renderHook(
      () =>
        useAutosave({
          content: 'test',
          onSave,
          queueKey: 'test',
          enabled: false,
        }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('should activate circuit breaker when queue is full', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');

    // Create store with full queue
    const store = createMockStore({
      autosaveQueue: {
        pending: new Array(10).fill({ queueKey: 'other', timestamp: Date.now() }),
        maxQueueSize: 10,
        errors: [],
      },
    });

    const onSave = jest.fn();

    renderHook(
      () =>
        useAutosave({
          content: 'test',
          onSave,
          queueKey: 'test',
        }),
      { wrapper: createWrapper(store) }
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Circuit breaker activated')
      );
    });

    // Should NOT call onSave
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should cleanup on unmount', async () => {
    const store = createMockStore();
    const onSave = jest.fn();

    const { unmount } = renderHook(
      () =>
        useAutosave({
          content: 'test',
          onSave,
          queueKey: 'test',
        }),
      { wrapper: createWrapper(store) }
    );

    // Unmount before debounce completes
    unmount();

    // Advance time after unmount
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should NOT call onSave (cleanup cleared timer)
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should update lastSaved after successful save', async () => {
    const store = createMockStore();
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useAutosave({
          content: 'test',
          onSave,
          queueKey: 'test',
        }),
      { wrapper: createWrapper(store) }
    );

    expect(result.current.lastSaved).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });
  });

  it('should handle save errors gracefully', async () => {
    const store = createMockStore();
    const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error');

    renderHook(
      () =>
        useAutosave({
          content: 'test',
          onSave,
          queueKey: 'test',
        }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error saving'),
        expect.any(Error)
      );
    });
  });

  it('should work with complex object content', async () => {
    const store = createMockStore();
    const onSave = jest.fn().mockResolvedValue(undefined);

    const complexContent = {
      name: 'John',
      settings: {
        theme: 'dark',
        notifications: true,
      },
    };

    renderHook(
      () =>
        useAutosave({
          content: complexContent,
          onSave,
          queueKey: 'test',
        }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(complexContent);
    });
  });

  it('should reset timer when content changes rapidly', async () => {
    const store = createMockStore();
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ content }) =>
        useAutosave({
          content,
          onSave,
          queueKey: 'test',
        }),
      {
        wrapper: createWrapper(store),
        initialProps: { content: 'v1' },
      }
    );

    // Change content rapidly
    act(() => {
      jest.advanceTimersByTime(500);
    });
    rerender({ content: 'v2' });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    rerender({ content: 'v3' });

    // Only save after final change settles
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith('v3');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('useAutosave - Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should work with real Redux store and async operations', async () => {
    const store = createMockStore();
    const onSave = jest.fn(async (content: string) => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 100));
      return content;
    });

    renderHook(
      () =>
        useAutosave({
          content: 'test',
          onSave,
          queueKey: 'integration-test',
        }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });
});
