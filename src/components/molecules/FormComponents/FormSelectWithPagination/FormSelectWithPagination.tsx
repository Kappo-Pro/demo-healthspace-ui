/**
 * FormSelectWithPagination
 *
 * Reusable Select component with built-in pagination in dropdown.
 * Extracted from Default.tsx admin selection pattern.
 *
 * @example
 * ```tsx
 * <FormSelectWithPagination
 *   mode="multiple"
 *   data={adminList.data}
 *   totalCount={adminList.totalCount}
 *   currentPage={currentPage}
 *   onPageChange={setCurrentPage}
 *   getOptionKey={item => item.id}
 *   getOptionValue={item => item.id}
 *   renderOption={item => (
 *     <Flex align="center" gap={8}>
 *       <Avatar src={item.imageUrl}>{item.name[0]}</Avatar>
 *       <span>{item.name}</span>
 *     </Flex>
 *   )}
 * />
 * ```
 */

import { Flex, Pagination, Select } from 'antd';
import type { FormSelectWithPaginationProps } from './types';

const { Option } = Select;

export function FormSelectWithPagination<T = unknown>({
	// Data & Pagination
	data,
	totalCount,
	currentPage,
	pageSize = 10,
	onPageChange,
	loading = false,

	// Rendering
	renderOption,
	getOptionKey,
	getOptionValue,
	optionClassName,

	// Optional
	searchable = false,
	onSearch,
	dropdownClassName,
	paginationClassName,
	showTotal = false,
	hidePaginationOnSinglePage = true,

	// Select props
	...selectProps
}: FormSelectWithPaginationProps<T>) {
	const totalPages = Math.ceil(totalCount / pageSize);
	const shouldShowPagination = !hidePaginationOnSinglePage || totalPages > 1;

	return (
		<Select
			{...selectProps}
			loading={loading}
			showSearch={searchable}
			onSearch={onSearch}
			filterOption={searchable ? false : undefined}
			popupMatchSelectWidth={false}
			dropdownClassName={dropdownClassName}
			dropdownRender={menu => (
				<div className="w-full">
					{menu}
					{shouldShowPagination && (
						<Flex className="p-1 border-t w-full" justify="center">
							<Flex justify="center" className="w-full">
								<Pagination
									className={paginationClassName}
									current={currentPage}
									onChange={onPageChange}
									total={totalCount}
									pageSize={pageSize}
									showSizeChanger={false}
									showTotal={showTotal ? (total, range) => `${range[0]}-${range[1]} of ${total}` : undefined}
									size="small"
								/>
							</Flex>
						</Flex>
					)}
				</div>
			)}
		>
			{data.map(item => {
				const key = getOptionKey(item);
				const value = getOptionValue(item);

				return (
					<Option key={key} value={value} className={optionClassName}>
						{renderOption(item)}
					</Option>
				);
			})}
		</Select>
	);
}

FormSelectWithPagination.displayName = 'FormSelectWithPagination';

export default FormSelectWithPagination;
