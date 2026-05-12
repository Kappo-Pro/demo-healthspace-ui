import { Flex, Skeleton, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

interface TableSkeletonProps {
	columns: number;
	rows?: number;
	hasAvatar?: boolean;
	hasActions?: boolean;
}

/**
 * TableSkeleton - Skeleton loader for table data
 *
 * Provides a better loading UX than spinners by showing
 * the table structure with animated skeleton placeholders
 */
const TableSkeleton = ({
	columns,
	rows = 5,
	hasAvatar = true,
	hasActions = true
}: TableSkeletonProps) => {
	const { t } = useTypedTranslation();
	// Generate skeleton data
	const skeletonData = Array.from({ length: rows }, (_, index) => ({
		key: `skeleton-${index}`,
		id: `skeleton-${index}`,
	}));

	// Generate skeleton columns
	const skeletonColumns: ColumnsType<unknown> = [];

	// First column with avatar and name (if applicable)
	if (hasAvatar) {
		skeletonColumns.push({
			title: <span style={{ visibility: 'visible', opacity: 1 }}>{t('Admin.data.table.name')}</span>,
			key: 'name',
			width: '35%',
			render: () => (
				<Flex align="center" gap={12} className="h-14">
					<Skeleton.Avatar active size={32} shape="circle" />
					<Flex vertical gap={6} className="flex-1">
						<Skeleton.Text active size="small" style={{ width: 140, height: 14 }} />
						<Skeleton.Text active size="small" style={{ width: 180, height: 12 }} />
					</Flex>
				</Flex>
			),
		});
	}

	// Middle columns (regular data)
	const middleColumns = hasAvatar ? columns - 1 : columns;
	const columnTitles = [
		t('Admin.data.table.role'),
		t('Admin.data.table.managedBy'),
		t('Admin.data.table.consentAcceptedDate')
	];
	const columnWidths = ['15%', '25%', '18%'];
	for (let i = 0; i < middleColumns; i++) {
		skeletonColumns.push({
			title: <span style={{ visibility: 'visible', opacity: 1 }}>{columnTitles[i] || `Column ${i + 1}`}</span>,
			key: `col-${i}`,
			width: columnWidths[i],
			render: () => (
				<Flex align="center" className="h-14">
					<Skeleton.Text
						active
						size="small"
						style={{
							width: i === 0 ? 100 : i === 1 ? 120 : 150,
							height: 16
						}}
					/>
				</Flex>
			),
		});
	}

	// Actions column (if applicable)
	if (hasActions) {
		skeletonColumns.push({
			title: '',
			key: 'actions',
			width: '7%',
			render: () => (
				<Flex align="center" gap={8} justify="center" className="h-14">
					<Skeleton.Button active size="small" shape="circle" style={{ width: 24, height: 24, minWidth: 24 }} />
					<Skeleton.Button active size="small" shape="circle" style={{ width: 24, height: 24, minWidth: 24 }} />
					<Skeleton.Button active size="small" shape="circle" style={{ width: 24, height: 24, minWidth: 24 }} />
				</Flex>
			),
		});
	}

	return (
		<div className="admin-table-skeleton min-h-150">
			<Table
				className="admin-table"
				columns={skeletonColumns}
				dataSource={skeletonData}
				pagination={false}
				showHeader={true}
				rowKey="id"
			/>
		</div>
	);
};

export default TableSkeleton;
