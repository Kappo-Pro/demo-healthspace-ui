/**
 * ANTD-046 Task 2: Select Configuration
 *
 * Standardized select configurations, option builders, and filter functions
 * to ensure consistent dropdown behavior across the application.
 */

import type { SelectProps } from 'antd';

// ============================================================================
// SELECT CONFIGURATIONS
// ============================================================================

// Type-safe select option interface
export interface SelectOption {
	label: string;
	value: string | number | boolean;
	disabled?: boolean;
	[key: string]: unknown; // Allow additional custom fields
}

export interface SelectConfig extends SelectProps {
	placeholder?: string;
	allowClear?: boolean;
	showSearch?: boolean;
	filterOption?: boolean | ((input: string, option: SelectOption) => boolean);
	maxTagCount?: number | 'responsive';
	mode?: 'multiple' | 'tags';
}

export const SELECT_CONFIGS = {
	/**
	 * Standard single select
	 * - Default placeholder
	 * - Allows clearing selection
	 * - No search by default
	 */
	standard: {
		placeholder: 'Select an option',
		allowClear: true,
		showSearch: false,
	} as SelectConfig,

	/**
	 * Searchable single select
	 * - Case-insensitive search
	 * - Filters by label
	 * - Best for long option lists
	 */
	searchable: {
		placeholder: 'Search and select',
		allowClear: true,
		showSearch: true,
		filterOption: (input: string, option: SelectOption) =>
			option.label.toLowerCase().includes(input.toLowerCase()),
	} as SelectConfig,

	/**
	 * Multiple select
	 * - Select multiple options
	 * - Tags display with responsive sizing
	 * - Max 3 tags shown, rest collapsed
	 */
	multiple: {
		mode: 'multiple' as const,
		placeholder: 'Select multiple options',
		allowClear: true,
		showSearch: true,
		maxTagCount: 'responsive' as const,
		filterOption: (input: string, option: SelectOption) =>
			option.label.toLowerCase().includes(input.toLowerCase()),
	} as SelectConfig,

	/**
	 * Tags select (create new options)
	 * - Users can add custom values
	 * - Good for dynamic tagging
	 */
	tags: {
		mode: 'tags' as const,
		placeholder: 'Add tags',
		allowClear: true,
		showSearch: true,
		maxTagCount: 'responsive' as const,
	} as SelectConfig,

	/**
	 * Large searchable select (for long lists)
	 * - Virtual scrolling support
	 * - Optimized for 100+ options
	 */
	largeList: {
		placeholder: 'Search...',
		allowClear: true,
		showSearch: true,
		filterOption: (input: string, option: SelectOption) =>
			option.label.toLowerCase().includes(input.toLowerCase()),
		virtual: true,
		listHeight: 400,
	} as SelectConfig,

	/**
	 * Small compact select
	 * - For tight spaces (tables, filters)
	 * - Smaller height
	 */
	compact: {
		placeholder: 'Select',
		allowClear: true,
		showSearch: false,
		size: 'small' as const,
	} as SelectConfig,

	/**
	 * Required select (no clear button)
	 * - Cannot be cleared
	 * - Forces user selection
	 */
	required: {
		placeholder: 'Select (required)',
		allowClear: false,
		showSearch: false,
	} as SelectConfig,
};

// ============================================================================
// COMMON OPTION BUILDERS
// ============================================================================

/**
 * Build options from a simple array of strings
 */
export function buildOptionsFromArray(
	items: string[],
): Array<{ label: string; value: string }> {
	return items.map(item => ({
		label: item,
		value: item,
	}));
}

/**
 * Build options from an array of objects
 */
export function buildOptionsFromObjects<T extends Record<string, unknown>>(
	items: T[],
	labelKey: keyof T,
	valueKey: keyof T,
): SelectOption[] {
	return items.map(item => ({
		label: String(item[labelKey]),
		value: item[valueKey] as string | number | boolean,
	}));
}

/**
 * Build grouped options (option groups)
 */
export interface OptionGroup {
	label: string;
	options: SelectOption[];
}

export function buildGroupedOptions(
	groups: Array<{ label: string; items: SelectOption[] }>,
): OptionGroup[] {
	return groups.map(group => ({
		label: group.label,
		options: group.items,
	}));
}

/**
 * Note: For options with custom rendering (icons, etc.), create them directly in your component.
 * Example patterns are available in the Storybook stories.
 */

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================

/**
 * Case-insensitive filter (default)
 */
export function defaultFilter(input: string, option: SelectOption): boolean {
	return option.label.toLowerCase().includes(input.toLowerCase());
}

/**
 * Starts-with filter (more strict)
 */
export function startsWithFilter(input: string, option: SelectOption): boolean {
	return option.label.toLowerCase().startsWith(input.toLowerCase());
}

/**
 * Word boundary filter (matches whole words)
 */
export function wordBoundaryFilter(
	input: string,
	option: SelectOption,
): boolean {
	const label = option.label.toLowerCase();
	const search = input.toLowerCase();
	const words = label.split(/\s+/);
	return words.some(word => word.startsWith(search));
}

/**
 * Multi-field filter (searches across multiple fields)
 */
export function multiFieldFilter(
	input: string,
	option: SelectOption,
	fields: string[] = ['label', 'description'],
): boolean {
	const search = input.toLowerCase();
	return fields.some(field => {
		const value = option[field];
		return value && String(value).toLowerCase().includes(search);
	});
}

/**
 * Fuzzy filter (allows typos and partial matches)
 * Simple implementation - can be replaced with a library like fuse.js
 */
export function fuzzyFilter(input: string, option: SelectOption): boolean {
	const label = option.label.toLowerCase();
	const search = input.toLowerCase();

	// Simple fuzzy logic: all characters must appear in order
	let searchIndex = 0;
	for (let i = 0; i < label.length && searchIndex < search.length; i++) {
		if (label[i] === search[searchIndex]) {
			searchIndex++;
		}
	}
	return searchIndex === search.length;
}

// ============================================================================
// COMMON OPTION SETS
// ============================================================================

/**
 * Yes/No options
 */
export const YES_NO_OPTIONS = [
	{ label: 'Yes', value: true },
	{ label: 'No', value: false },
];

/**
 * Enabled/Disabled options
 */
export const ENABLED_DISABLED_OPTIONS = [
	{ label: 'Enabled', value: true },
	{ label: 'Disabled', value: false },
];

/**
 * Active/Inactive options
 */
export const ACTIVE_INACTIVE_OPTIONS = [
	{ label: 'Active', value: 'active' },
	{ label: 'Inactive', value: 'inactive' },
];

/**
 * Status options
 */
export const STATUS_OPTIONS = [
	{ label: 'Active', value: 'active' },
	{ label: 'Inactive', value: 'inactive' },
	{ label: 'Pending', value: 'pending' },
	{ label: 'Archived', value: 'archived' },
];

/**
 * Priority options
 */
export const PRIORITY_OPTIONS = [
	{ label: 'High', value: 'high' },
	{ label: 'Medium', value: 'medium' },
	{ label: 'Low', value: 'low' },
];

/**
 * Sort order options
 */
export const SORT_ORDER_OPTIONS = [
	{ label: 'Ascending', value: 'asc' },
	{ label: 'Descending', value: 'desc' },
];

/**
 * Gender options
 */
export const GENDER_OPTIONS = [
	{ label: 'Male', value: 'male' },
	{ label: 'Female', value: 'female' },
	{ label: 'Other', value: 'other' },
	{ label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

/**
 * Age range options
 */
export const AGE_RANGE_OPTIONS = [
	{ label: 'Under 18', value: '0-17' },
	{ label: '18-24', value: '18-24' },
	{ label: '25-34', value: '25-34' },
	{ label: '35-44', value: '35-44' },
	{ label: '45-54', value: '45-54' },
	{ label: '55-64', value: '55-64' },
	{ label: '65+', value: '65+' },
];

/**
 * Pagination size options
 */
export const PAGE_SIZE_OPTIONS = [
	{ label: '10 per page', value: 10 },
	{ label: '20 per page', value: 20 },
	{ label: '50 per page', value: 50 },
	{ label: '100 per page', value: 100 },
];

/**
 * Duration type options (from AddProgramItem usage)
 */
export const DURATION_TYPE_OPTIONS = [
	{ label: 'Days', value: 'days' },
	{ label: 'Weeks', value: 'weeks' },
	{ label: 'Months', value: 'months' },
	{ label: 'Years', value: 'years' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get option label by value
 */
export function getOptionLabel(
	options: SelectOption[],
	value: string | number | boolean,
): string | undefined {
	return options.find(opt => opt.value === value)?.label;
}

/**
 * Get option value by label
 */
export function getOptionValue(
	options: SelectOption[],
	label: string,
): string | number | boolean | undefined {
	return options.find(opt => opt.label === label)?.value;
}

/**
 * Sort options alphabetically by label
 */
export function sortOptionsByLabel(options: SelectOption[]): SelectOption[] {
	return [...options].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Filter options by search term
 */
export function filterOptions(
	options: SelectOption[],
	searchTerm: string,
): SelectOption[] {
	const search = searchTerm.toLowerCase();
	return options.filter(opt => opt.label.toLowerCase().includes(search));
}

/**
 * Disable specific options
 */
export function disableOptions(
	options: SelectOption[],
	disabledValues: Array<string | number | boolean>,
): SelectOption[] {
	return options.map(opt => ({
		...opt,
		disabled: disabledValues.includes(opt.value),
	}));
}

/**
 * Add "All" option to beginning of options list
 */
export function addAllOption(
	options: SelectOption[],
	allValue: string | number | boolean | null = null,
): SelectOption[] {
	return [
		{ label: 'All', value: allValue as string | number | boolean },
		...options,
	];
}

/**
 * Create numeric range options
 */
export function createNumericRangeOptions(
	min: number,
	max: number,
	step = 1,
): Array<{ label: string; value: number }> {
	const options = [];
	for (let i = min; i <= max; i += step) {
		options.push({ label: String(i), value: i });
	}
	return options;
}

/**
 * Create options from enum
 */
export function createOptionsFromEnum<
	T extends Record<string, string | number>,
>(enumObj: T): Array<{ label: string; value: T[keyof T] }> {
	return Object.entries(enumObj).map(([key, value]) => ({
		label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
		value: value as T[keyof T],
	}));
}
