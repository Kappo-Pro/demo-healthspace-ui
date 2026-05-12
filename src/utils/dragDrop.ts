/**
 * Drag-and-Drop Utility Functions
 * EPIC-026-S7: Reusable drag-drop logic for dashboard reordering
 *
 * This utility provides pure functions for array reordering and section order updates.
 * Extracted from dashboard implementation for better testability and reusability.
 */

import type { DashboardSection } from '../types/dashboard';

/**
 * Reorder an array by moving an item from one index to another
 *
 * @param list - The array to reorder
 * @param startIndex - The index of the item to move
 * @param endIndex - The index to move the item to
 * @returns A new array with the item moved to the new position
 *
 * @example
 * ```typescript
 * const items = ['A', 'B', 'C', 'D', 'E'];
 * const reordered = reorderArray(items, 0, 4);
 * // Result: ['B', 'C', 'D', 'E', 'A']
 * ```
 */
export function reorderArray<T>(
	list: T[],
	startIndex: number,
	endIndex: number,
): T[] {
	// Create a new array to avoid mutating the original
	const result = Array.from(list);

	// Remove the item from the start index
	const [removed] = result.splice(startIndex, 1);

	// Insert the item at the end index
	result.splice(endIndex, 0, removed);

	return result;
}

/**
 * Reorder dashboard sections and update their order property
 *
 * @param sections - Array of dashboard sections to reorder
 * @param startIndex - The index of the section to move
 * @param endIndex - The index to move the section to
 * @returns A new array with sections reordered and order property updated
 *
 * @example
 * ```typescript
 * const sections = [
 *   { id: 'hero', order: 0, ... },
 *   { id: 'assessments', order: 1, ... },
 *   { id: 'programs', order: 2, ... },
 * ];
 * const reordered = updateSectionOrder(sections, 0, 2);
 * // Result: [
 * //   { id: 'assessments', order: 0, ... },
 * //   { id: 'programs', order: 1, ... },
 * //   { id: 'hero', order: 2, ... },
 * // ]
 * ```
 */
export function updateSectionOrder(
	sections: DashboardSection[],
	startIndex: number,
	endIndex: number,
): DashboardSection[] {
	// Reorder the sections array
	const reordered = reorderArray(sections, startIndex, endIndex);

	// Update the order property to match the new indices
	return reordered.map((section, index) => ({
		...section,
		order: index,
	}));
}
