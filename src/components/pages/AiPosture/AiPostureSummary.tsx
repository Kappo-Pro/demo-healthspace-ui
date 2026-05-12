import { AddToReports } from '@atoms/AddToReports';
import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { PostureSummaryReportDownloader } from '@pages/AiPosture/PostureSummaryReportDownloader';
import { TriageResultModal } from '@organisms/TriageResultModal';
import '@pages/AdminUnassignedPatients/TableList.css';
import { StatusNormalized } from '@stores/constants';
import { addReportId, deleteReportId } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { updatePostureSessionStatus as updatePostureSessionStatusEscalationRequired } from '@stores/patients/triage/escalationRequired';
import { updatePostureSessionStatus as updatePostureSessionStatusFollowUpRequired } from '@stores/patients/triage/followUpRequired';
import { updatePostureSessionStatus as updatePostureSessionStatusOutOfParams } from '@stores/patients/triage/outOfParams';
import { updatePostureSessionStatus as updatePostureSessionStatusPendingReview } from '@stores/patients/triage/pendingReview';
import { updatePostureSessionStatus as updatePostureSessionStatusReviewed } from '@stores/patients/triage/reviewed';
import { getPostureByPage } from '@stores/posture/postures/postures';
import {
	IstatusIcon,
	Posture,
	PostureAnalysisItem,
	Status,
	Session,
	UserWithSession,
} from '@types';
import type { TableColumnType } from 'antd';
import {
	Badge,
	Checkbox,
	Dropdown,
	Empty,
	Flex,
	Space,
	Table,
	Tooltip,
	message,
} from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { format } from 'date-fns';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

// Flattened row type for the table
interface PostureSessionRow {
	id: string;
	sessionId: string;
	createdAt: Date;
	status: Status;
	postureAnalytics: PostureAnalysisItem[];
	originalSession: Posture;
}

/* eslint-disable vitalflow/prefer-semantic-tokens */
const statusIcons: IstatusIcon = {
	outOfParams: <Badge color="var(--text-primary)" />,
	pendingReview: <Badge color="var(--color-warning-500)" />,
	reviewed: <Badge color="var(--color-success-500)" />,
	escalationRequired: <Badge color="var(--color-error-600)" />,
	followUpRequired: <Badge color="var(--color-warning-600)" />,
};
/* eslint-enable vitalflow/prefer-semantic-tokens */

type IUpdatePostureSessionStatus = Omit<Record<Status, unknown>, 'newPatients'>;

const updatePostureSession: IUpdatePostureSessionStatus = {
	outOfParams: updatePostureSessionStatusOutOfParams,
	pendingReview: updatePostureSessionStatusPendingReview,
	reviewed: updatePostureSessionStatusReviewed,
	escalationRequired: updatePostureSessionStatusEscalationRequired,
	followUpRequired: updatePostureSessionStatusFollowUpRequired,
};

const AiPostureSummary = () => {
	const reportIds = useTypedSelector(state => state.reports.reportIds);
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const postureData = useTypedSelector(state => state.postures.postures.data);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const totalPage = useTypedSelector(
		state => state?.postures?.postures?.pagination,
	);

	const perPage = useTypedSelector(
		state => state.patientDetail.patientDetail.perpage,
	);
	const [loading, setLoading] = useState(false);
	const isReportModal = useTypedSelector(
		state => state.patientDetail.patientDetail.isReportModal,
	);

	const [hoveredRow, setHoveredRow] = useState<string | null>(null);
	const [sorterState, setSorterState] = useState<{
		field?: string;
		order?: 'ascend' | 'descend';
	}>({});

	// Modal state
	const [resultModalOpen, setResultModalOpen] = useState(false);
	const [selectedSession, setSelectedSession] = useState<Posture | null>(null);

	const handlePostureGetApi = useCallback(
		async (page: number) => {
			await dispatch(
				getPostureByPage({
					userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
					page,
				}),
			);
			setLoading(false);
		},
		[dispatch, user.isPhysioterapist, selectedUser?.id, user?.id],
	);

	const onPageChange = (page: number) => {
		setCurrentPage(page);
		handlePostureGetApi(page);
	};

	useEffect(() => {
		setLoading(true);
		handlePostureGetApi(1);
	}, [user, selectedUser, handlePostureGetApi]);

	const onChangeStatus = async (
		params: { sessionId: string; status: Status },
		session: PostureSessionRow,
	) => {
		const { sessionId, status } = params;
		message.loading({
			content: t('Admin.data.menu.patientDetail.aiAssistantRomSummary.saving'),
			key: sessionId,
		});
		const statusKey = session.status as keyof IUpdatePostureSessionStatus;
		const updateFn = updatePostureSession[statusKey];
		if (updateFn && typeof updateFn === 'function') {
			await dispatch(
				updateFn({
					sessionId,
					body: { status },
				}) as never,
			);
		}
		message.success({
			content: t(
				'Admin.data.menu.patientDetail.aiAssistantRomSummary.statusSuccess',
			),
			key: sessionId,
			duration: 3,
		});
		// Refresh data
		handlePostureGetApi(currentPage);
	};

	// Get menu items for status dropdown
	const getMenuItems = (session: PostureSessionRow) => ({
		items: Object.entries(StatusNormalized)
			.filter(([key]) => key !== session.status)
			.map(([value, label]) => ({
				key: value,
				label: (
					<Space>
						<span className="dropdown-badge">
							{statusIcons[value as keyof IstatusIcon]}
						</span>
						<span>{label}</span>
					</Space>
				),
			})),
		onClick: (info: {
			domEvent: React.MouseEvent | React.KeyboardEvent;
			key: string;
		}) => {
			if ('stopPropagation' in info.domEvent) {
				info.domEvent.stopPropagation();
			}
			onChangeStatus(
				{ sessionId: session.sessionId, status: info.key as Status },
				session,
			);
		},
	});

	// Handle row click - open modal
	const handleRowClick = (record: PostureSessionRow) => {
		setSelectedSession(record.originalSession);
		setResultModalOpen(true);
	};

	// Transform postureData to table rows
	const allSessions: PostureSessionRow[] = useMemo(() => {
		return (
			postureData?.map((item: Posture) => ({
				id: item.id,
				sessionId: item.id,
				createdAt: new Date(item.createdAt),
				status: (item.status as Status) || 'pendingReview',
				postureAnalytics: item.postureAnalytics || [],
				originalSession: item,
			})) || []
		);
	}, [postureData]);

	// Table columns
	const columns: TableColumnType<PostureSessionRow>[] = useMemo(
		() => [
			{
				title: t(
					'Admin.data.menu.patientDetail.aiAssistantRomSummary.sessionDate',
					'Session Date',
				),
				dataIndex: 'createdAt',
				key: 'createdAt',
				width: '40%',
				sorter: true,
				sortOrder:
					sorterState.field === 'createdAt' ? sorterState.order : undefined,
				render: (_: unknown, record: PostureSessionRow) => (
					<span
						className="admin-table-name-text cursor-pointer"
						style={{ fontSize: 'var(--font-size-sm)' }}>
						<strong>{format(record.createdAt, 'MMM dd, yyyy, hh:mm a')}</strong>
					</span>
				),
			},
			{
				title: t(
					'Admin.data.menu.patientDetail.aiAssistantRomSummary.status',
					'Status',
				),
				key: 'completed',
				width: '15%',
				render: (_: unknown, record: PostureSessionRow) => (
					<Tooltip
						title={
							record.postureAnalytics?.length > 0
								? t('Admin.data.survey.completed')
								: t('Admin.data.menu.userRoles.inCompleted')
						}>
						<span>
							<UntitledIcon
								name={
									record.postureAnalytics?.length > 0
										? 'checkCircle'
										: 'warning'
								}
								size={20}
								color={
									record.postureAnalytics?.length > 0
										? 'var(--color-success-500)'
										: 'var(--color-warning-500)'
								}
							/>
						</span>
					</Tooltip>
				),
			},
			{
				title: t(
					'Admin.data.menu.patientDetail.aiAssistantRomSummary.actions',
					'Actions',
				),
				key: 'actions',
				width: '30%',
				render: (_: unknown, record: PostureSessionRow) => (
					<div
						style={{
							visibility: hoveredRow === record.id ? 'visible' : 'hidden',
							opacity: hoveredRow === record.id ? 1 : 0,
							transition: 'opacity 0.2s',
						}}
						onClick={e => e.stopPropagation()}>
						{record.postureAnalytics?.length > 0 && (
							<Flex gap={12}>
								<Tooltip
									title={t(
										'Admin.data.menu.patientDetail.aiAssistantRomSummary.qrCode',
									)}>
									<span>
										<PostureSummaryReportDownloader
											selectedPosture={record.originalSession}
											reportType="qr"
											color="var(--text-primary)"
										/>
									</span>
								</Tooltip>
								<Tooltip
									title={t(
										'Admin.data.menu.patientDetail.aiAssistantRomSummary.download',
									)}>
									<span>
										<PostureSummaryReportDownloader
											selectedPosture={record.originalSession}
											reportType="download"
											color="var(--text-primary)"
										/>
									</span>
								</Tooltip>
							</Flex>
						)}
					</div>
				),
			},
			{
				title: '',
				key: 'statusAndCheckbox',
				width: '15%',
				render: (_: unknown, record: PostureSessionRow) => (
					<Flex
						gap={12}
						align="center"
						justify="flex-end"
						onClick={e => e.stopPropagation()}>
						{user.isPhysioterapist && (
							<div className="posture-dropdown-section">
								<Dropdown menu={getMenuItems(record)} trigger={['click']}>
									<button
										type="button"
										onClick={e => e.stopPropagation()}
										aria-label={`Change status for scan from ${format(record.createdAt, 'MMM dd, yyyy, hh:mm a')} - current status: ${StatusNormalized[record.status]}`}
										aria-haspopup="menu"
										className="status-dropdown-trigger"
										style={{
											background: 'none',
											border: 'none',
											cursor: 'pointer',
											padding: 0,
										}}>
										{statusIcons[record.status as keyof IstatusIcon]}
									</button>
								</Dropdown>
							</div>
						)}
						<Checkbox
							checked={reportIds?.postureSessionsIds?.includes(record.id)}
							disabled={(record.postureAnalytics?.length ?? 0) === 0}
							className="report-checkbox"
							aria-label={
								(record.postureAnalytics?.length ?? 0) === 0
									? `Cannot add scan from ${format(record.createdAt, 'MMM dd, yyyy, hh:mm a')} - no analysis available`
									: `Add scan from ${format(record.createdAt, 'MMM dd, yyyy, hh:mm a')} to report`
							}
							onChange={e => {
								if (e.target.checked) {
									dispatch(
										addReportId({
											type: 'postureSessionsIds',
											id: record.id,
										}),
									);
								} else {
									dispatch(
										deleteReportId({
											type: 'postureSessionsIds',
											id: record.id,
										}),
									);
								}
							}}
						/>
					</Flex>
				),
			},
		],
		[
			hoveredRow,
			reportIds,
			user,
			t,
			dispatch,
			currentPage,
			sorterState.field,
			sorterState.order,
		],
	);

	// Handle table change (pagination, filters, sorter)
	const handleTableChange = (
		pag: { current?: number },
		_filters: Record<string, unknown>,
		sorter: SorterResult<PostureSessionRow> | SorterResult<PostureSessionRow>[],
	) => {
		// Cast sorter to expected type
		const sort = Array.isArray(sorter) ? sorter[0] : sorter;

		// Handle pagination
		if (pag.current && pag.current !== currentPage) {
			setCurrentPage(pag.current);
			handlePostureGetApi(pag.current);
		}

		// Handle sorting
		if (sort?.order) {
			setSorterState({
				field: sort.field as string,
				order: sort.order,
			});
		} else {
			setSorterState({});
		}
	};

	const listPostureStyle: CSSProperties = {
		padding: 15,
		backgroundColor: 'var(--surface-tertiary)',
		borderRadius: 'var(--radius-xl)',
		height: '100%',
	};

	return (
		<div className="posture-container" style={listPostureStyle}>
			{!isReportModal && (
				<div className="posture-add-to-reports">
					<AddToReports />
				</div>
			)}
			<div aria-live="polite" aria-busy={loading}>
				{loading ? (
					<div
						role="status"
						aria-label={t('Patient.data.postures.loadingScansLabel')}>
						<ActivityFeedSkeleton count={6} />
						<span className="sr-only">
							{t('Patient.data.postures.loadingScans')}
						</span>
					</div>
				) : (
					<>
						{(postureData?.length ?? 0) > 0 ? (
							<div className="admin-table-container admin-table-container-normal">
								<Table<PostureSessionRow>
									columns={columns}
									dataSource={allSessions}
									rowKey="id"
									pagination={{
										current: currentPage,
										pageSize: 10,
										total: totalPage?.totalCount || 0,
										showSizeChanger: false,
										position: ['bottomCenter'],
									}}
									onChange={handleTableChange}
									className="admin-table"
									onRow={record => ({
										onClick: () => handleRowClick(record),
										onMouseEnter: () => {
											setHoveredRow(record.id);
										},
										onMouseLeave: () => setHoveredRow(null),
										style: {
											cursor: 'pointer',
										},
									})}
								/>
							</div>
						) : (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={<span>{t('Admin.data.addToReports.noData')}</span>}
							/>
						)}
					</>
				)}
			</div>

			{/* Result Modal - Bottom Sheet */}
			<TriageResultModal
				open={resultModalOpen}
				onClose={() => {
					setResultModalOpen(false);
					setSelectedSession(null);
				}}
				user={
					user.isPhysioterapist && selectedUser
						? (selectedUser as unknown as UserWithSession)
						: ({ id: user.id, profile: user } as unknown as UserWithSession)
				}
				session={selectedSession as unknown as Session}
				sessionTitle=""
				completedStatus={(selectedSession?.postureAnalytics?.length ?? 0) > 0}
				onRefreshData={() => handlePostureGetApi(currentPage)}
				resultType="posture"
			/>
		</div>
	);
};

export default AiPostureSummary;
