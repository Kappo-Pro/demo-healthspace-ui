import { Table, Empty, Flex } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { tableDataType, tablePropsType } from '@atoms/TableList/TableIterfaces';
import { Edit01 } from '@vitalflow-icons/general/edit01';
import { Trash01 } from '@vitalflow-icons/general/trash01';
import { getUserById } from '@stores/activity/contacts/contacts';
import moment from 'moment';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import Avatar from '@atoms/Avatar/Avatar';
import { useTypedDispatch } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { router } from '@routers/routers';
import { getPlansByUserId } from '@stores/shared/settings/settings';
import { PLANS } from '@stores/constants';
import './style.css';

const TableList = (props: tablePropsType) => {
	const { t } = useTypedTranslation();
	const { tableData, header, rowSelect, onSelect, onSort, onActionClick } =
		props;

	const [tableListData, setTableListData] = useState<tableDataType[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();

	useEffect(() => {
		setTableListData(tableData || []);
		// Reset selection when data changes
		setSelectedRowKeys([]);
	}, [tableData]);

	const handleUserChange = useCallback(
		async (userId: string) => {
			try {
				await dispatch(getUserById(userId));
				const { payload } = await dispatch(getPlansByUserId(userId));
				const planType = payload?.planType;
				const isScreeningOrIntervention =
					planType === PLANS.SCREENING || planType === PLANS.EARLYINTERVENTION;
				if (isScreeningOrIntervention) {
					navigate(`/${userId}${router.AIASSISTANT_START_SCAN}`);
					dispatch(setActiveTab('startScan'));
				} else {
					navigate(`/${userId}${router.AIASSISTANT_PROGRAMS}`);
					dispatch(setActiveTab('programs'));
				}
			} catch (error) {
				// Silently handle navigation errors - user remains on current page
				// This prevents crashes when navigation fails due to network issues or missing data
				console.error('Failed to navigate to user details:', error);
			}
		},
		[dispatch, navigate],
	);

	const onClickDelete = useCallback(
		(obj: tableDataType) => {
			onActionClick && onActionClick('delete', [obj]);
		},
		[onActionClick],
	);

	const onClickEdit = useCallback(
		(obj: tableDataType) => {
			onActionClick && onActionClick('edit', [obj]);
		},
		[onActionClick],
	);

	// Define columns for Ant Design Table with useMemo to prevent unnecessary re-renders
	const columns: ColumnsType<tableDataType> = useMemo(
		() => [
			{
				title: t('Patient.data.name'),
				dataIndex: 'profile',
				key: 'name',
				sorter: header?.find(h => h.key === 'name')?.sort,
				render: (profile, record) => (
					<Flex align="center" gap={12}>
						<Avatar user={record} />
						<span className="align-middle">
							<span className="table-list-name-text">
								<strong>
									{profile?.firstName} {profile?.lastName}
								</strong>
							</span>
							<span className="table-list-email-text">{profile?.email}</span>
						</span>
					</Flex>
				),
			},
			{
				title:
					header?.find(h => h.key === 'status')?.name ||
					t('Admin.data.table.status'),
				dataIndex: 'userToolStatus',
				key: 'status',
				sorter: header?.find(h => h.key === 'status')?.sort,
				render: userToolStatus => {
					if (userToolStatus && userToolStatus.length > 0) {
						return (
							<Flex
								align="center"
								gap={4}
								className="table-list-status-badge table-list-status-assigned">
								<span className="table-list-bullet">&bull;</span>
								{t('Patient.data.rehab.assignLetsMove')}
							</Flex>
						);
					}
					return (
						<Flex
							align="center"
							gap={4}
							className="table-list-status-badge table-list-status-new">
							<span className="table-list-bullet">&bull;</span>
							<span className="table-list-date-badge-offset">
								{t('Patient.data.rehab.new')}
							</span>
						</Flex>
					);
				},
			},
			{
				title:
					header?.find(h => h.key === 'date')?.name ||
					t('Admin.data.table.date'),
				dataIndex: 'createdAt',
				key: 'date',
				sorter: header?.find(h => h.key === 'date')?.sort,
				render: (createdAt, record) => {
					const dateToShow =
						record?.userToolStatus && record.userToolStatus.length > 0
							? record.userToolStatus[0].createdAt
							: createdAt;
					return (
						<span className="table-list-date-offset">
							{moment(dateToShow).fromNow()}
						</span>
					);
				},
			},
			{
				title: t('Patient.data.actions'),
				key: 'actions',
				width: 100,
				render: (_, record) => (
					<Flex align="center" gap={8}>
						{record.delete && (
							<Flex
								align="center"
								justify="center"
								className="table-list-action-icon table-list-action-icon-delete"
								onClick={e => {
									e.stopPropagation();
									onClickDelete(record);
								}}>
								<Trash01 color="stroke-gray-600" width={15} height={16} />
							</Flex>
						)}
						{record.edit && (
							<Flex
								align="center"
								justify="center"
								className="table-list-action-icon"
								onClick={e => {
									e.stopPropagation();
									onClickEdit(record);
								}}>
								<Edit01 color="stroke-gray-600" width={15} height={16} />
							</Flex>
						)}
					</Flex>
				),
			},
		],
		[header, t, onClickDelete, onClickEdit],
	);

	// Row selection configuration
	const rowSelection = rowSelect
		? {
				selectedRowKeys,
				onChange: (
					selectedKeys: React.Key[],
					selectedRows: tableDataType[],
				) => {
					setSelectedRowKeys(selectedKeys);
					onSelect && onSelect(selectedRows);
				},
				getCheckboxProps: (record: tableDataType) => ({
					id: record.id,
				}),
			}
		: undefined;

	// Handle table changes (sorting, etc.)
	const handleTableChange: TableProps<tableDataType>['onChange'] = (
		pagination,
		filters,
		sorter,
	) => {
		if (sorter && !Array.isArray(sorter) && sorter.field) {
			onSort && onSort(sorter.field as string);
		}
	};

	return (
		<div>
			<Table<tableDataType>
				className="table-list-table"
				columns={columns}
				dataSource={tableListData}
				rowKey="id"
				rowSelection={rowSelection}
				onChange={handleTableChange}
				onRow={record => ({
					onClick: () => handleUserChange(record.id),
					style: { cursor: 'pointer' },
				})}
				pagination={false}
				locale={{
					emptyText: (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={t('Admin.data.newPatients.noPatientsFound')}
						/>
					),
				}}
			/>
		</div>
	);
};

export default TableList;
