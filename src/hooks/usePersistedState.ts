import { useEffect, useState } from 'react';

/**
 * Hook for persisting non-sensitive state to localStorage
 *
 * @security CRITICAL - Only use for non-PHI data
 * @hipaa Must not be used for Protected Health Information
 *
 * @example
 * ```typescript
 * // ✅ SAFE: UI preferences
 * const [theme, setTheme] = usePersistedState('app-theme', 'light');
 *
 * // ❌ UNSAFE: Patient data
 * const [patient, setPatient] = usePersistedState('patient-data', {}); // NEVER DO THIS
 * ```
 *
 * @param key - Storage key (use namespaced keys like 'app-theme')
 * @param initialValue - Default value if nothing stored
 * @param storage - Storage type (localStorage or sessionStorage)
 * @returns Tuple of [state, setState] similar to useState
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  storage: Storage = localStorage
): [T, (value: T | ((prev: T) => T)) => void] {
  // Hydrate from storage on initial mount
  const [state, setStateInternal] = useState<T>(() => {
    try {
      const stored = storage.getItem(key);
      if (stored === null) {
        return initialValue;
      }
      return JSON.parse(stored) as T;
    } catch (error) {
      return initialValue;
    }
  });

  // Create setState wrapper that handles function updates
  const setState = (value: T | ((prev: T) => T)) => {
    setStateInternal((prevState) => {
      const nextState = typeof value === 'function'
        ? (value as (prev: T) => T)(prevState)
        : value;
      return nextState;
    });
  };

  // Persist on change
  useEffect(() => {
    try {
      storage.setItem(key, JSON.stringify(state));
    } catch (error) {
      // Handle quota exceeded errors gracefully
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('[usePersistedState] localStorage quota exceeded - cannot persist state');
      } else {
        console.error('[usePersistedState] Failed to persist to storage:', error);
      }
    }
  }, [key, state, storage]);

  return [state, setState];
}

/**
 * Hook for session-only state (cleared on browser close)
 *
 * @security More secure than localStorage - automatically cleared
 * @recommended Use for temporary UI state that doesn't need persistence
 *
 * @example
 * ```typescript
 * // ✅ GOOD: Temporary filters
 * const [filters, setFilters] = useSessionState('contacts-filters', {});
 *
 * // ✅ GOOD: Temporary sort state
 * const [sortBy, setSortBy] = useSessionState('table-sort', 'name');
 * ```
 */
export function useSessionState<T>(key: string, initialValue: T) {
  return usePersistedState(key, initialValue, sessionStorage);
}

/**
 * Clear all persisted state (useful for testing/debugging)
 *
 * @security Does NOT clear auth tokens (handled by react-auth-kit)
 */
export function clearPersistedState() {
  const keysToPreserve = [
    '_auth_storage',
    '_auth_state',
    '_auth_type',
    '_auth_refresh',
  ];

  Object.keys(localStorage).forEach((key) => {
    if (!keysToPreserve.includes(key)) {
      localStorage.removeItem(key);
    }
  });

  sessionStorage.clear();
}

/**
 * Get all persisted keys (for debugging/auditing)
 */
export function getPersistedKeys(): { localStorage: string[]; sessionStorage: string[] } {
  return {
    localStorage: Object.keys(localStorage),
    sessionStorage: Object.keys(sessionStorage),
  };
}
