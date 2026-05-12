/**
 * useFuzzySearch Hook
 *
 * Shared fuzzy search logic for CommandPalette and UserDetailsModal.
 * Provides memoized filtering with configurable match scoring.
 */

import { useMemo } from 'react';

export interface FuzzySearchable {
	label?: string;
	keywords?: string[];
	[key: string]: unknown;
}

export interface UseFuzzySearchOptions<T> {
	/** Items to search through */
	items: T[];
	/** Current search query */
	query: string;
	/** Field to use as primary match target (default: 'label') */
	labelField?: keyof T;
	/** Field containing keywords array (default: 'keywords') */
	keywordsField?: keyof T;
	/** Minimum score to include in results (default: 0) */
	minScore?: number;
}

export interface FuzzySearchResult<T> {
	/** Filtered items matching the query */
	results: T[];
	/** Whether there are any results */
	hasResults: boolean;
	/** Number of results */
	count: number;
}

/**
 * Fuzzy match implementation with scoring
 *
 * @param query - Search query string
 * @param text - Text to match against
 * @param keywords - Additional keywords to check
 * @returns Match score (0 = no match, 10 = exact match, 8 = keyword match)
 */
export function fuzzyMatch(
	query: string,
	text: string,
	keywords: string[] = [],
): number {
	if (!query) return 1;

	const lowerQuery = query.toLowerCase();
	const lowerText = text.toLowerCase();

	// Exact substring match gets highest score
	if (lowerText.includes(lowerQuery)) return 10;

	// Check keywords
	for (const keyword of keywords) {
		if (keyword.toLowerCase().includes(lowerQuery)) return 8;
	}

	// Character-by-character fuzzy matching
	let queryIndex = 0;
	let score = 0;

	for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
		if (lowerText[i] === lowerQuery[queryIndex]) {
			score++;
			queryIndex++;
		}
	}

	// Only return score if all query characters were matched
	return queryIndex === lowerQuery.length ? score : 0;
}

/**
 * Hook for fuzzy searching through a list of items
 *
 * @example
 * ```tsx
 * const { results, hasResults } = useFuzzySearch({
 *   items: commands,
 *   query: searchQuery,
 *   labelField: 'label',
 *   keywordsField: 'keywords',
 * });
 * ```
 */
export function useFuzzySearch<T extends FuzzySearchable>({
	items,
	query,
	labelField = 'label' as keyof T,
	keywordsField = 'keywords' as keyof T,
	minScore = 0,
}: UseFuzzySearchOptions<T>): FuzzySearchResult<T> {
	const results = useMemo(() => {
		if (!query.trim()) return items;

		return items.filter(item => {
			const label = String(item[labelField] || '');
			const keywords = (item[keywordsField] as string[] | undefined) || [];
			const score = fuzzyMatch(query, label, keywords);
			return score > minScore;
		});
	}, [items, query, labelField, keywordsField, minScore]);

	return {
		results,
		hasResults: results.length > 0,
		count: results.length,
	};
}

/**
 * Simple fuzzy filter function for one-off usage
 *
 * @example
 * ```tsx
 * const filtered = fuzzyFilter(items, query, item => item.name, item => item.tags);
 * ```
 */
export function fuzzyFilter<T>(
	items: T[],
	query: string,
	getLabel: (item: T) => string,
	getKeywords?: (item: T) => string[],
): T[] {
	if (!query.trim()) return items;

	return items.filter(item => {
		const label = getLabel(item);
		const keywords = getKeywords?.(item) || [];
		return fuzzyMatch(query, label, keywords) > 0;
	});
}

export default useFuzzySearch;
