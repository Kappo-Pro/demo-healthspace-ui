/**
 * useDebouncedValue Hook
 * Story 3.3: Performance optimization for search inputs
 *
 * Debounces a value with a configurable delay to reduce computation overhead.
 * Useful for search inputs, filters, and other frequently-changing values.
 *
 * @example
 * ```typescript
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(query, 300);
 *
 * // debouncedQuery updates 300ms after query stops changing
 * // Prevents excessive API calls or expensive computations
 * ```
 */

import { useState, useEffect } from 'react';

/**
 * Debounce a value with a delay
 *
 * Returns the debounced value after the specified delay. Useful for
 * optimizing expensive operations triggered by rapidly-changing values
 * (e.g., search inputs, filters).
 *
 * @template T - Type of the value to debounce
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (e.g., 300ms for search inputs)
 * @returns Debounced value
 *
 * @example
 * ```typescript
 * // Search input debouncing
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(searchQuery, 300);
 *
 * useEffect(() => {
 *   // Only runs 300ms after user stops typing
 *   fetchSearchResults(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 *
 * @example
 * ```typescript
 * // Command palette integration
 * const CommandPalette = () => {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebouncedValue(query, 300);
 *   const registry = useCommandRegistry();
 *
 *   const commands = useMemo(
 *     () => registry.getCommands({ query: debouncedQuery }),
 *     [registry, debouncedQuery]
 *   );
 *
 *   return <input onChange={(e) => setQuery(e.target.value)} />;
 * };
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timeout if value changes or component unmounts
    // This prevents stale updates and memory leaks
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
