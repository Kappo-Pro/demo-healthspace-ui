import { useState, useMemo, useCallback } from 'react';

function normalizeValue(value: unknown) {
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
    ? String(value)
    : JSON.stringify(value);
}

const useLocalStorage = (key: string, defaultValue: unknown) => {
  const [localStorageValue, setLocalStorageValue] = useState(() => {
    try {
      const value = localStorage.getItem(key);

      if (value !== null) {
        try {
          return JSON.parse(value);
        } catch {
          return value as unknown;
        }
      }
      const initialValue = normalizeValue(defaultValue);

      localStorage.setItem(key, initialValue);
      return defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // FIX: Remove localStorageValue from dependencies to prevent infinite loops
  // Use functional setState form to access previous value without closure
  const setLocalStorageStateValue = useCallback((valueOrFn: unknown) => {
    setLocalStorageValue((prevValue) => {
      try {
        const newValue =
          typeof valueOrFn === 'function'
            ? valueOrFn(prevValue)  // Use prevValue instead of closure over localStorageValue
            : valueOrFn;

        const valueToStore = normalizeValue(newValue);

        localStorage.setItem(key, valueToStore);
        return newValue;
      } catch (error) {
        // localStorage quota exceeded or access denied - fail silently
        console.error('[useLocalStorage] Failed to save to localStorage:', error);
        return prevValue;  // Return previous value on error
      }
    });
  }, [key]);  // Only depend on key (stable reference)

  // Memoize return array to prevent infinite re-renders
  return useMemo(
    () => [localStorageValue, setLocalStorageStateValue] as const,
    [localStorageValue, setLocalStorageStateValue]
  );
};

export default useLocalStorage;
