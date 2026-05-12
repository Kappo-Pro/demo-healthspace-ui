/**
 * useDebounce Hook
 * EPIC-006-S2: Debounce functionality for action buttons
 * Story 3.8: Added trailing edge debounce for search inputs
 *
 * Debounces callback functions to prevent accidental double-tap submissions.
 * Uses leading edge behavior (first click executes immediately, subsequent clicks are ignored).
 *
 * @example
 * ```typescript
 * const handleSubmit = () => {
 *    * };
 *
 * const { debouncedCallback, isDebouncing } = useDebounce(handleSubmit, 300);
 *
 * return (
 *   <Button onClick={debouncedCallback} loading={isDebouncing}>
 *     Submit
 *   </Button>
 * );
 * ```
 */

import { useCallback, useRef, useState, useEffect } from 'react';

export interface UseDebounceReturn<T extends unknown[]> {
	debouncedCallback: (...args: T) => void;
	isDebouncing: boolean;
}

/**
 * Debounce a callback function with a delay (leading edge behavior)
 *
 * Returns a debounced callback and loading state. The first click executes immediately,
 * and subsequent clicks within the delay period are ignored. Useful for preventing
 * accidental double-taps on action buttons.
 *
 * @template T - Type of callback arguments
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Object with debouncedCallback and isDebouncing state
 *
 * @example
 * ```typescript
 * // Form submission with debounce (no parameters)
 * const handleSubmit = () => {
 *   submitForm();
 * };
 *
 * const { debouncedCallback, isDebouncing } = useDebounce(handleSubmit, 300);
 *
 * return (
 *   <Button onClick={debouncedCallback} loading={isDebouncing}>
 *     Submit Form
 *   </Button>
 * );
 * ```
 *
 * @example
 * ```typescript
 * // With parameters
 * const handleViewHistory = (item: ProgramItem) => {
 *   navigate(`/history/${item.id}`);
 * };
 *
 * const { debouncedCallback, isDebouncing } = useDebounce(handleViewHistory);
 *
 * return (
 *   <Button onClick={() => debouncedCallback(item)} loading={isDebouncing}>
 *     View History
 *   </Button>
 * );
 * ```
 */
export function useDebounce<T extends unknown[]>(
	callback: (...args: T) => void | Promise<void>,
	delay = 300,
): UseDebounceReturn<T> {
	const [isDebouncing, setIsDebouncing] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const mountedRef = useRef(true);

	// Track mount state to prevent updates after unmount
	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const debouncedCallback = useCallback(
		(...args: T) => {
			// If already debouncing, ignore the click
			if (isDebouncing) return;

			// Set debouncing state (shows loading spinner)
			setIsDebouncing(true);

			// Execute callback immediately (leading edge behavior)
			callback(...args);

			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Set timeout to reset debouncing state after delay
			timeoutRef.current = setTimeout(() => {
				// Only update state if component is still mounted
				if (mountedRef.current) {
					setIsDebouncing(false);
				}
			}, delay);
		},
		[callback, delay, isDebouncing],
	);

	return { debouncedCallback, isDebouncing };
}

/**
 * Debounce a value change (trailing edge behavior)
 *
 * Returns the debounced value after the delay period. Useful for search inputs
 * where you want to wait until the user stops typing before executing a search.
 *
 * @template T - Type of value to debounce
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 *
 * @example
 * ```typescript
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(searchQuery, 300);
 *
 * useEffect(() => {
 *   // This only runs after user stops typing for 300ms
 *   if (debouncedQuery) {
 *     fetchResults(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 *
 * return (
 *   <Input
 *     value={searchQuery}
 *     onChange={(e) => setSearchQuery(e.target.value)}
 *     placeholder="Search..."
 *   />
 * );
 * ```
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		// Set up timeout to update debounced value
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Cleanup: cancel timeout if value changes before delay completes
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}
