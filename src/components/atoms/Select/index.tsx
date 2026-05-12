/* eslint-disable react-refresh/only-export-components */

/**
 * ANTD-046 Task 2: Select Component Variants
 *
 * Reusable select components with standardized configurations.
 * All variants are built on Ant Design's Select with consistent behavior.
 */

import React from 'react';
import { Select as AntSelect, SelectProps as AntSelectProps } from 'antd';
import {
	SELECT_CONFIGS,
	startsWithFilter,
	wordBoundaryFilter,
	fuzzyFilter} from './selectConfig';

// Re-export Option for convenience
export const { Option } = AntSelect;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SelectProps extends AntSelectProps {
	/** Optional configuration override */
	config?: Partial<AntSelectProps>;
}

// ============================================================================
// STANDARD SELECT
// ============================================================================

/**
 * Standard Select with default configuration
 * - Single selection
 * - Clear button
 * - No search
 *
 * @example
 * ```tsx
 * <Select
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' },
 *   ]}
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
	placeholder = SELECT_CONFIGS.standard.placeholder,
	allowClear = SELECT_CONFIGS.standard.allowClear,
	showSearch = SELECT_CONFIGS.standard.showSearch,
	...props
}) => {
	return (
		<AntSelect
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			{...props}
		/>
	);
};

// ============================================================================
// SEARCHABLE SELECT
// ============================================================================

/**
 * Searchable Select for long option lists
 * - Case-insensitive search
 * - Filters by label
 * - Clear button
 *
 * @example
 * ```tsx
 * <SearchableSelect
 *   value={selectedCountry}
 *   onChange={setSelectedCountry}
 *   options={countryOptions}
 *   placeholder="Search countries..."
 * />
 * ```
 */
export const SearchableSelect: React.FC<SelectProps> = ({
	placeholder = SELECT_CONFIGS.searchable.placeholder,
	allowClear = SELECT_CONFIGS.searchable.allowClear,
	showSearch = SELECT_CONFIGS.searchable.showSearch,
	filterOption = SELECT_CONFIGS.searchable.filterOption,
	...props
}) => {
	return (
		<AntSelect
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			filterOption={filterOption}
			{...props}
		/>
	);
};

// ============================================================================
// MULTIPLE SELECT
// ============================================================================

/**
 * Multiple Select for multi-selection
 * - Select multiple options
 * - Responsive tag display
 * - Searchable
 *
 * @example
 * ```tsx
 * <MultipleSelect
 *   value={selectedTags}
 *   onChange={setSelectedTags}
 *   options={tagOptions}
 *   placeholder="Select tags..."
 * />
 * ```
 */
export const MultipleSelect: React.FC<SelectProps> = ({
	mode = SELECT_CONFIGS.multiple.mode,
	placeholder = SELECT_CONFIGS.multiple.placeholder,
	allowClear = SELECT_CONFIGS.multiple.allowClear,
	showSearch = SELECT_CONFIGS.multiple.showSearch,
	maxTagCount = SELECT_CONFIGS.multiple.maxTagCount,
	filterOption = SELECT_CONFIGS.multiple.filterOption,
	...props
}) => {
	return (
		<AntSelect
			mode={mode}
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			maxTagCount={maxTagCount}
			filterOption={filterOption}
			{...props}
		/>
	);
};

// ============================================================================
// TAGS SELECT
// ============================================================================

/**
 * Tags Select for creating custom tags
 * - Users can add new values
 * - Multiple selection
 * - Good for dynamic tagging
 *
 * @example
 * ```tsx
 * <TagsSelect
 *   value={userTags}
 *   onChange={setUserTags}
 *   placeholder="Add tags..."
 * />
 * ```
 */
export const TagsSelect: React.FC<SelectProps> = ({
	mode = SELECT_CONFIGS.tags.mode,
	placeholder = SELECT_CONFIGS.tags.placeholder,
	allowClear = SELECT_CONFIGS.tags.allowClear,
	showSearch = SELECT_CONFIGS.tags.showSearch,
	maxTagCount = SELECT_CONFIGS.tags.maxTagCount,
	...props
}) => {
	return (
		<AntSelect
			mode={mode}
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			maxTagCount={maxTagCount}
			{...props}
		/>
	);
};

// ============================================================================
// LARGE LIST SELECT
// ============================================================================

/**
 * Large List Select for 100+ options
 * - Virtual scrolling
 * - Optimized performance
 * - Searchable
 *
 * @example
 * ```tsx
 * <LargeListSelect
 *   value={selectedItem}
 *   onChange={setSelectedItem}
 *   options={largeDataset} // 1000+ items
 *   placeholder="Search..."
 * />
 * ```
 */
export const LargeListSelect: React.FC<SelectProps> = ({
	placeholder = SELECT_CONFIGS.largeList.placeholder,
	allowClear = SELECT_CONFIGS.largeList.allowClear,
	showSearch = SELECT_CONFIGS.largeList.showSearch,
	filterOption = SELECT_CONFIGS.largeList.filterOption,
	virtual = SELECT_CONFIGS.largeList.virtual,
	listHeight = SELECT_CONFIGS.largeList.listHeight,
	...props
}) => {
	return (
		<AntSelect
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			filterOption={filterOption}
			virtual={virtual}
			listHeight={listHeight}
			{...props}
		/>
	);
};

// ============================================================================
// COMPACT SELECT
// ============================================================================

/**
 * Compact Select for tight spaces
 * - Smaller size
 * - Good for tables and filters
 * - No search by default
 *
 * @example
 * ```tsx
 * <CompactSelect
 *   value={filterValue}
 *   onChange={setFilterValue}
 *   options={filterOptions}
 * />
 * ```
 */
export const CompactSelect: React.FC<SelectProps> = ({
	placeholder = SELECT_CONFIGS.compact.placeholder,
	allowClear = SELECT_CONFIGS.compact.allowClear,
	showSearch = SELECT_CONFIGS.compact.showSearch,
	size = SELECT_CONFIGS.compact.size,
	...props
}) => {
	return (
		<AntSelect
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			size={size}
			{...props}
		/>
	);
};

// ============================================================================
// REQUIRED SELECT
// ============================================================================

/**
 * Required Select (no clear button)
 * - Cannot be cleared
 * - Forces user selection
 * - Good for required form fields
 *
 * @example
 * ```tsx
 * <RequiredSelect
 *   value={requiredValue}
 *   onChange={setRequiredValue}
 *   options={options}
 *   placeholder="Select (required)"
 * />
 * ```
 */
export const RequiredSelect: React.FC<SelectProps> = ({
	placeholder = SELECT_CONFIGS.required.placeholder,
	allowClear = SELECT_CONFIGS.required.allowClear,
	showSearch = SELECT_CONFIGS.required.showSearch,
	...props
}) => {
	return (
		<AntSelect
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			{...props}
		/>
	);
};

// ============================================================================
// ADVANCED FILTER SELECTS
// ============================================================================

/**
 * Starts-With Filter Select
 * - Filters options that start with search term
 * - More strict than default
 *
 * @example
 * ```tsx
 * <StartsWithSelect
 *   value={value}
 *   onChange={setValue}
 *   options={options}
 * />
 * ```
 */
export const StartsWithSelect: React.FC<SelectProps> = ({
	placeholder = 'Search...',
	allowClear = true,
	showSearch = true,
	filterOption = startsWithFilter,
	...props
}) => {
	return (
		<AntSelect
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			filterOption={filterOption}
			{...props}
		/>
	);
};

/**
 * Word Boundary Filter Select
 * - Filters by word boundaries
 * - Good for multi-word options
 *
 * @example
 * ```tsx
 * <WordBoundarySelect
 *   value={value}
 *   onChange={setValue}
 *   options={options}
 * />
 * ```
 */
export const WordBoundarySelect: React.FC<SelectProps> = ({
	placeholder = 'Search...',
	allowClear = true,
	showSearch = true,
	filterOption = wordBoundaryFilter,
	...props
}) => {
	return (
		<AntSelect
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			filterOption={filterOption}
			{...props}
		/>
	);
};

/**
 * Fuzzy Filter Select
 * - Tolerates typos
 * - Flexible matching
 *
 * @example
 * ```tsx
 * <FuzzySelect
 *   value={value}
 *   onChange={setValue}
 *   options={options}
 * />
 * ```
 */
export const FuzzySelect: React.FC<SelectProps> = ({
	placeholder = 'Search...',
	allowClear = true,
	showSearch = true,
	filterOption = fuzzyFilter,
	...props
}) => {
	return (
		<AntSelect
			placeholder={placeholder}
			allowClear={allowClear}
			showSearch={showSearch}
			filterOption={filterOption}
			{...props}
		/>
	);
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Select;

// Re-export types, configurations, and utilities for convenience
export type { SelectProps as AntSelectProps } from 'antd';
export {
	SELECT_CONFIGS,
	YES_NO_OPTIONS,
	ENABLED_DISABLED_OPTIONS,
	ACTIVE_INACTIVE_OPTIONS,
	STATUS_OPTIONS,
	PRIORITY_OPTIONS,
	SORT_ORDER_OPTIONS,
	GENDER_OPTIONS,
	AGE_RANGE_OPTIONS,
	PAGE_SIZE_OPTIONS,
	DURATION_TYPE_OPTIONS,
	buildOptionsFromArray,
	buildOptionsFromObjects,
	buildGroupedOptions,
	buildOptionsWithIcons,
	defaultFilter,
	startsWithFilter,
	wordBoundaryFilter,
	multiFieldFilter,
	fuzzyFilter,
	getOptionLabel,
	getOptionValue,
	sortOptionsByLabel,
	filterOptions,
	disableOptions,
	addAllOption,
	createNumericRangeOptions,
	createOptionsFromEnum} from './selectConfig';
