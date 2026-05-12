import { Select, theme } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { CSSProperties } from 'react';

interface TableFilterSelectProps {
	value: string;
	onChange: (value: string) => void;
	options: Array<{ label: string; value: string; icon?: React.ReactNode }>;
	placeholder?: string;
	style?: CSSProperties;
	allowClear?: boolean;
}

/**
 * TableFilterSelect - Styled to match Ant Design's built-in table filter
 *
 * Features:
 * - Filter icon that changes color when active
 * - Highlighted state when filter is applied
 * - Matches table filter dropdown styling
 * - Supports clear functionality
 */
const TableFilterSelect = ({
	value,
	onChange,
	options,
	placeholder = 'Filter',
	style,
	allowClear = true,
}: TableFilterSelectProps) => {
	const { token } = theme.useToken();

	// Check if filter is active (not default/empty value)
	const hasActiveFilter = value && value !== 'filter' && value !== 'all';

	return (
		<Select
			size="small"
			style={{
				width: '160px',
				...style,
			}}
			value={value}
			placeholder={placeholder}
			allowClear={allowClear}
			suffixIcon={
				<UntitledIcon
					name="filter"
					size={12}
					style={{
						color: hasActiveFilter ? token.colorPrimary : token.colorTextQuaternary,
					}}
				/>
			}
			onChange={onChange}
			options={options.filter(opt => opt.value !== 'filter').map(item => ({
				label: item.label,
				value: item.value,
			}))}
			styles={{
				selector: {
					borderColor: hasActiveFilter ? token.colorPrimary : undefined,
					backgroundColor: hasActiveFilter ? token.colorPrimaryBg : undefined,
					transition: 'all 0.2s',
				},
			}}
			dropdownStyle={{
				minWidth: '160px',
			}}
			popupClassName="table-filter-dropdown"
		/>
	);
};

export default TableFilterSelect;
