/**
 * useAutosave Hook
 *
 * Epic 1 - Story 1.5: Custom hook for autosave with circuit breaker and debounce
 *
 * Features:
 * - Circuit breaker: checks queue size before adding (prevents memory leaks)
 * - Debounced saves: configurable delay (default 2 seconds)
 * - Cleanup on unmount: no memory leaks
 * - Generic type support: works with any content type
 * - Returns isSaving, lastSaved, error states
 */

import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
  addToAutosaveQueue,
  removeFromAutosaveQueue,
  flushAutosaveQueue,
} from '@stores/settings/settingsSlice';

export interface UseAutosaveOptions<T> {
  /** Content to autosave */
  content: T;
  /** Async function to save content (e.g., dispatch thunk) */
  onSave: (content: T) => Promise<void>;
  /** Debounce delay in milliseconds (default: 2000ms) */
  debounce?: number;
  /** Unique key for this autosave queue item */
  queueKey: string;
  /** Whether autosave is enabled (default: true) */
  enabled?: boolean;
}

export interface UseAutosaveReturn {
  /** Whether a save is currently in progress */
  isSaving: boolean;
  /** Timestamp of last successful save, or null if never saved */
  lastSaved: Date | null;
  /** Error message if save failed, or null */
  error: string | null;
}

/**
 * Custom hook for autosaving content with debounce and circuit breaker
 *
 * @param options - Configuration options
 * @returns Object containing isSaving, lastSaved, and error states
 *
 * @example
 * ```tsx
 * function APIKeySettings() {
 *   const [apiKey, setApiKey] = useState('');
 *   const dispatch = useTypedDispatch();
 *
 *   const { isSaving, lastSaved, error } = useAutosave({
 *     content: apiKey,
 *     onSave: async (key) => {
 *       await dispatch(updateApiKey(key)).unwrap();
 *     },
 *     queueKey: 'apiKey',
 *     debounce: 2000,
 *   });
 *
 *   return (
 *     <>
 *       <Input value={apiKey} onChange={e => setApiKey(e.target.value)} />
 *       {isSaving && <Spin />}
 *       {lastSaved && <Text>Saved at {lastSaved.toLocaleTimeString()}</Text>}
 *       {error && <Alert message={error} type="error" />}
 *     </>
 *   );
 * }
 * ```
 */
export function useAutosave<T>({
  content,
  onSave,
  debounce = 2000,
  queueKey,
  enabled = true,
}: UseAutosaveOptions<T>): UseAutosaveReturn {
  const dispatch = useTypedDispatch();

  // Refs for timer and previous content
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef<T>(content);
  const isMountedRef = useRef(true);

  // State for tracking save status
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Selectors for queue status
  const queueSize = useTypedSelector(
    (state) => state.settings?.autosaveQueue?.pending?.length ?? 0
  );
  const maxQueueSize = useTypedSelector(
    (state) => state.settings?.autosaveQueue?.maxQueueSize ?? 10
  );
  const queueItem = useTypedSelector((state) =>
    state.settings?.autosaveQueue?.pending?.find(
      (item) => item.queueKey === queueKey
    )
  );
  const autosaveError = useTypedSelector((state) =>
    state.settings?.autosaveQueue?.errors?.find(
      (err) => err.queueKey === queueKey
    )
  );

  // Derived states
  const isSaving = !!queueItem;
  const error = autosaveError?.error || null;

  /**
   * Debounced autosave effect
   * Triggers when content changes (and enabled=true)
   */
  useEffect(() => {
    if (!enabled) return;

    // Check if content has actually changed
    if (isEqual(content, previousContentRef.current)) {
      return;
    }

    // Update previous content ref
    previousContentRef.current = content;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Circuit breaker: check queue size
    if (queueSize >= maxQueueSize) {
      return;
    }

    // Add to queue immediately (optimistic UI)
    dispatch(
      addToAutosaveQueue({
        queueKey,
        timestamp: Date.now(),
        content,
      })
    );

    // Set debounced timer
    timerRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      try {
        // Execute save
        await onSave(content);

        // Remove from queue on success
        dispatch(removeFromAutosaveQueue({ queueKey }));

        // Update lastSaved timestamp
        setLastSaved(new Date());

      } catch (err) {

        // Error is already tracked in Redux queue errors
        // (handled by settingsSlice reducer)
      }
    }, debounce);

    // Cleanup function: clear timer
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    content,
    enabled,
    onSave,
    debounce,
    queueKey,
    dispatch,
    queueSize,
    maxQueueSize,
  ]);

  /**
   * Cleanup on unmount
   * Flush autosave queue and clear timer
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Clear timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Flush autosave queue for this key
      dispatch(flushAutosaveQueue({ queueKey }));

    };
  }, [dispatch, queueKey]);

  return {
    isSaving,
    lastSaved,
    error,
  };
}

export default useAutosave;
