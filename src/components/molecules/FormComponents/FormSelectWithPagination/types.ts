/**
 * FormSelectWithPagination Types
 * Reusable Select component with built-in pagination
 */

import type { SelectProps } from 'antd';
import type { ReactNode } from 'react';

export interface PaginationData<T = unknown> {
	data: T[];
	totalCount: number;
	currentPage?: number;
	pageSize?: number;
}

export interface FormSelectWithPaginationProps<T = unknown> extends Omit<SelectProps, 'dropdownRender'> {
	// Data & Pagination
	data: T[];
	totalCount: number;
	currentPage: number;
	pageSize?: number;
	onPageChange: (page: number) => void;
	loading?: boolean;

	// Rendering
	renderOption: (item: T) => ReactNode;
	getOptionKey: (item: T) => string | number;
	getOptionValue: (item: T) => unknown;
	optionClassName?: string;

	// Optional search
	searchable?: boolean;
	onSearch?: (value: string) => void;

	// Dropdown customization
	dropdownClassName?: string;
	paginationClassName?: string;
	showTotal?: boolean;
	hidePaginationOnSinglePage?: boolean;
}

export interface AdminListItem {
	id: string;
	profile?: {
		firstName?: string;
		lastName?: string;
		imageUrl?: string;
		avatarColor?: string;
	};
}

export interface PlanOption {
	id: string;
	planType: string;
	plan: string;
	title: string;
}

export interface TagOption {
	id: string;
	name: string;
}
