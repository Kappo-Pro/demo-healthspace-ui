import { useEffect } from 'react';
import { useTypedSelector, useTypedDispatch, ReduxState } from '@stores/index';
import { AnyAction } from '@reduxjs/toolkit';

/**
 * Persist specific Redux state slices to localStorage
 *
 * @security CRITICAL - Only use for non-PHI data
 * @hipaa Must not be used for Protected Health Information
 *
 * @example
 * ```typescript
 * // ✅ SAFE: Theme preferences
 * usePersistedRedux(
 *   (state) => state.settings.theme,
 *   'app-theme',
 *   setTheme
 * );
 *
 * // ❌ UNSAFE: Patient data
 * usePersistedRedux(
 *   (state) => state.adminPatient.data,
 *   'patient-data',
 *   loadPatient
 * ); // NEVER DO THIS
 * ```
 *
 * @param selector - Redux selector function to extract state
 * @param storageKey - localStorage key (use namespaced keys)
 * @param hydrateAction - Action creator to hydrate state on mount
 * @param storage - Storage type (default: localStorage)
 */
export function usePersistedRedux<T>(
  selector: (state: ReduxState) => T,
  storageKey: string,
  hydrateAction: (data: T) => AnyAction,
  storage: Storage = localStorage
) {
  const dispatch = useTypedDispatch();
  const value = useTypedSelector(selector);

  // Hydrate on mount
  useEffect(() => {
    try {
      const stored = storage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored) as T;
        dispatch(hydrateAction(data));
      }
    } catch (error) {
      // Don't crash the app if hydration fails
      console.error('[usePersistedRedux] Failed to hydrate from storage:', error);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist on change
  useEffect(() => {
    try {
      storage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('[usePersistedRedux] localStorage quota exceeded - cannot persist state');
      } else {
        console.error('[usePersistedRedux] Failed to persist to storage:', error);
      }
    }
  }, [value, storageKey, storage]);
}

/**
 * Persist multiple Redux selectors to localStorage
 *
 * @deprecated This function cannot be safely implemented without violating React's Rules of Hooks.
 * Instead, call usePersistedRedux directly for each config.
 *
 * @security Useful for persisting multiple non-PHI preferences at once
 *
 * @example
 * ```typescript
 * // ❌ DON'T USE usePersistedReduxMulti:
 * usePersistedReduxMulti({
 *   theme: { selector: ..., storageKey: ..., hydrateAction: ... },
 *   language: { selector: ..., storageKey: ..., hydrateAction: ... },
 * });
 *
 * // ✅ DO THIS INSTEAD - Call usePersistedRedux for each config:
 * usePersistedRedux(
 *   (state) => state.settings.theme,
 *   'app-theme',
 *   setTheme
 * );
 * usePersistedRedux(
 *   (state) => state.settings.language,
 *   'app-language',
 *   setLanguage
 * );
 * ```
 */
export function usePersistedReduxMulti(
  configs: Record<string, {
    selector: (state: ReduxState) => unknown;
    storageKey: string;
    hydrateAction: (data: unknown) => AnyAction;
  }>
) {
  const dispatch = useTypedDispatch();

  // Hydrate all configs on mount
  useEffect(() => {
    Object.values(configs).forEach((config) => {
      try {
        const stored = localStorage.getItem(config.storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          dispatch(config.hydrateAction(data));
        }
      } catch (error) {
        // Don't crash the app if hydration fails
        console.error('[usePersistedReduxMulti] Failed to hydrate config:', error);
      }
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist all configs when any value changes
  // We need to select all values at once to avoid hooks in loops
  const allValues = useTypedSelector((state) => {
    const values: Record<string, unknown> = {};
    Object.entries(configs).forEach(([key, config]) => {
      values[key] = config.selector(state);
    });
    return values;
  });

  useEffect(() => {
    Object.entries(configs).forEach(([key, config]) => {
      try {
        localStorage.setItem(config.storageKey, JSON.stringify(allValues[key]));
      } catch (error) {
        console.error(`[usePersistedReduxMulti] Failed to persist config ${key}:`, error);
      }
    });
  }, [allValues, configs]);
}

/**
 * Selector-based persistence with debouncing
 *
 * @security Reduces localStorage writes for frequently changing state
 * @param selector - Redux selector function
 * @param storageKey - localStorage key
 * @param hydrateAction - Action to hydrate state
 * @param debounceMs - Debounce delay in milliseconds (default: 500ms)
 */
export function useDebouncedPersistedRedux<T>(
  selector: (state: ReduxState) => T,
  storageKey: string,
  hydrateAction: (data: T) => AnyAction,
  debounceMs = 500
) {
  const dispatch = useTypedDispatch();
  const value = useTypedSelector(selector);

  // Hydrate on mount (immediate, no debounce)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored) as T;
        dispatch(hydrateAction(data));
      }
    } catch (error) {
      // Don't crash the app if hydration fails
      console.error('[useDebouncedPersistedRedux] Failed to hydrate from storage:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch (error) {
        console.error('[useDebouncedPersistedRedux] Failed to persist to storage:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [value, storageKey, debounceMs]);
}
