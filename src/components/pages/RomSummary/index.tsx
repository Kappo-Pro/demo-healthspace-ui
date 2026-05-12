import { AddToReports } from '@atoms/AddToReports';
import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { TriageResultModal } from '@organisms/TriageResultModal';
import '@pages/AdminUnassignedPatients/TableList.css';
import { SummaryResultReportDownloader } from '@pages/CustomRomSummary/SummaryResultReportDownloader';
import { setGalleryImages } from '@stores/activity/contacts/contacts';
import {
	getAllRomSessions,
	getRomSessionById,
	setSelectedRom,
} from '@stores/clinical/rom/customRom';
import { StatusNormalized } from '@stores/constants';
import { addReportId, deleteReportId } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusEscalationRequired } from '@stores/patients/triage/escalationRequired';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusFollowUpRequired } from '@stores/patients/triage/followUpRequired';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusOutOfParams } from '@stores/patients/triage/outOfParams';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusPendingReview } from '@stores/patients/triage/pendingReview';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusReviewed } from '@stores/patients/triage/reviewed';
import {
	CustomRomSession,
	IstatusIcon,
	Session,
	Status,
	UserWithSession,
} from '@types';
import type { InputRef, TableColumnType } from 'antd';
import {
	Badge,
	Button,
	Checkbox,
	Dropdown,
	Flex,
	Input,
	Space,
	Table,
	Tooltip,
	message,
} from 'antd';
import type {
	FilterDropdownProps,
	SorterResult,
} from 'antd/es/table/interface';
import { format } from 'date-fns';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

// Flattened row type for the table
interface RomSessionRow {
	id: string;
	sessionId: string;
	title: string;
	createdAt: Date;
	completed: boolean;
	status: Status;
	romPatientResults: unknown[];
	originalSession: CustomRomSession;
	parentRomId: string;
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

const updateOmniRomStatus: IUpdatePostureSessionStatus = {
	outOfParams: updateOmniRomSessionStatusOutOfParams,
	pendingReview: updateOmniRomSessionStatusPendingReview,
	reviewed: updateOmniRomSessionStatusReviewed,
	escalationRequired: updateOmniRomSessionStatusEscalationRequired,
	followUpRequired: updateOmniRomSessionStatusFollowUpRequired,
};

export default function AiAssistantRomSummary() {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const searchInput = useRef<InputRef>(null);

	const { user, selectedUser, coach, exercises } = useTypedSelector(state => ({
		user: state.user,
		selectedUser: state.contacts.main.selectedUser,
		coach: state.contacts.main.coach,
		exercises: state.contacts.main.exercises,
	}));
	const reportIds = useTypedSelector(state => state.reports.reportIds);
	const showAllResults = useTypedSelector(
		state => state.rom.results.showAllResults,
	);
	const isReportModal = useTypedSelector(
		state => state.patientDetail.patientDetail.isReportModal,
	);

	const id = user.isPhysioterapist ? selectedUser?.id : user?.id;
	const [loading, setLoading] = useState(false);
	const [allSessions, setAllSessions] = useState<RomSessionRow[]>([]);
	const [hoveredRow, setHoveredRow] = useState<string | null>(null);
	const [searchTitle, setSearchTitle] = useState('');
	const [completedFilter, setCompletedFilter] = useState<boolean | undefined>(
		undefined,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState<{
		totalCount: number;
		pageCount: number;
	} | null>(null);
	const [sorterState, setSorterState] = useState<{
		field?: string;
		order?: 'ascend' | 'descend';
	}>({});
	const lastSortRef = useRef<{
		field?: string;
		order?: 'ascend' | 'descend';
	}>({});

	// Modal state
	const [resultModalOpen, setResultModalOpen] = useState(false);
	const [selectedSession, setSelectedSession] =
		useState<CustomRomSession | null>(null);
	const [selectedSessionTitle, setSelectedSessionTitle] = useState<string>('');
	const [selectedCompletedStatus, setSelectedCompletedStatus] =
		useState<boolean>(false);

	// Full session data cache for edit modal (with complete romPatientResults)
	const [fullSessionCache, setFullSessionCache] = useState<
		Record<string, CustomRomSession>
	>({});

	// Fetch all ROM sessions with filters and pagination
	const fetchData = useCallback(
		async (
			page: number,
			title?: string,
			completed?: boolean,
			sorter?: { field?: string; order?: 'ascend' | 'descend' },
		) => {
			if (!id) return;
			setLoading(true);
			try {
				// Convert Ant Design sort order to API format
				const apiSort =
					sorter?.order === 'ascend'
						? 'asc'
						: sorter?.order === 'descend'
							? 'desc'
							: undefined;

				const data = await dispatch(
					getAllRomSessions({
						patientId: id,
						page,
						limit: 10,
						title,
						completed,
						sort: apiSort,
					}),
				);

				if (data.payload) {
					const rows: RomSessionRow[] = (data.payload.data || []).map(
						(session: CustomRomSession) => {
							const romProgram = (
								session as unknown as { romProgram?: { title: string } }
							).romProgram;
							const programTitle = romProgram?.title || '';

							return {
								id: session.id,
								sessionId: session.id,
								title: programTitle || session.title || '',
								createdAt: new Date(session.createdAt),
								completed:
									(session as unknown as { completed: boolean }).completed ||
									false,
								status:
									(session as unknown as { status: Status }).status ||
									'pendingReview',
								romPatientResults: session.romPatientResults || [],
								originalSession: session,
								parentRomId:
									(session as unknown as { programId: string }).programId || '',
							};
						},
					);

					setAllSessions(rows);
					setPagination(data.payload.pagination);
				}
			} catch (error) {
				console.error('Failed to fetch ROM sessions:', error);
				setAllSessions([]);
			} finally {
				setLoading(false);
			}
		},
		[dispatch, id],
	);

	// Wrapper for refreshing data from modal
	const fetchAllSessions = useCallback(() => {
		fetchData(
			currentPage,
			searchTitle || undefined,
			completedFilter,
			sorterState,
		);
	}, [fetchData, currentPage, searchTitle, completedFilter, sorterState]);

	useEffect(() => {
		if (id) {
			fetchData(
				currentPage,
				searchTitle || undefined,
				completedFilter,
				sorterState,
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		id,
		currentPage,
		searchTitle,
		completedFilter,
		sorterState.field,
		sorterState.order,
	]);

	useEffect(() => {
		dispatch(setGalleryImages({ exercises, coach }));
	}, [exercises, coach, dispatch]);

	// Fetch full session data with complete romPatientResults (for edit modal)
	const fetchFullSession = useCallback(
		async (sessionId: string) => {
			// Check cache first
			if (fullSessionCache[sessionId]) {
				return fullSessionCache[sessionId];
			}

			try {
				const response = await dispatch(
					getRomSessionById({ customRomId: sessionId }),
				).unwrap();

				// Cache the full session data
				setFullSessionCache(prev => ({
					...prev,
					[sessionId]: response,
				}));

				return response;
			} catch (error) {
				console.error('Failed to fetch full session:', error);
				return null;
			}
		},
		[dispatch, fullSessionCache],
	);

	// Handle status change
	const onChangeStatus = async (
		params: { sessionId: string; status: Status },
		session: RomSessionRow,
	) => {
		const { sessionId, status } = params;
		message.loading({
			content: t('Admin.data.menu.patientDetail.aiAssistantRomSummary.saving'),
			key: sessionId,
		});
		const statusKey = session.status as keyof IUpdatePostureSessionStatus;
		const updateFn = updateOmniRomStatus[statusKey];
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
		fetchData(currentPage, searchTitle || undefined, completedFilter);
	};

	// Get menu items for status dropdown
	const getMenuItems = (session: RomSessionRow) => ({
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
	const handleRowClick = (record: RomSessionRow) => {
		// Always open modal - RomResultContent will fetch full data and handle empty state
		dispatch(setSelectedRom(record.originalSession));
		setSelectedSession(record.originalSession);
		setSelectedSessionTitle(record.title);
		setSelectedCompletedStatus(record.completed);
		setResultModalOpen(true);
	};

	// Search functionality
	const handleSearch = (
		selectedKeys: string[],
		confirm: FilterDropdownProps['confirm'],
	) => {
		confirm();
		setSearchTitle(selectedKeys[0]);
		setCurrentPage(1); // Reset to first page on search
	};

	const handleReset = (
		clearFilters: () => void,
		confirm: FilterDropdownProps['confirm'],
	) => {
		clearFilters();
		setSearchTitle('');
		setCurrentPage(1);
		confirm();
	};

	const getColumnSearchProps = (): Partial<TableColumnType<RomSessionRow>> => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}) => (
			<div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
				<Input
					ref={searchInput}
					placeholder={t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.search',
					)}
					value={selectedKeys[0]}
					onChange={e =>
						setSelectedKeys(e.target.value ? [e.target.value] : [])
					}
					onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
					className="block"
					style={{ marginBottom: 8 }}
				/>
				<Flex gap={8}>
					<Button
						type="primary"
						onClick={() => handleSearch(selectedKeys as string[], confirm)}
						icon={<UntitledIcon name="search" size={14} />}
						size="small"
						style={{ flex: 1 }}>
						{t('Admin.data.menu.patientDetail.aiAssistantPrograms.search') ||
							'Search'}
					</Button>
					<Button
						type="default"
						onClick={() => clearFilters && handleReset(clearFilters, confirm)}
						size="small"
						style={{ flex: 1 }}>
						Reset
					</Button>
				</Flex>
			</div>
		),
		filterIcon: (filtered: boolean) => (
			<UntitledIcon
				name="search"
				size={14}
				style={{
					color: filtered ? 'var(--color-info-500)' : 'var(--text-secondary)',
				}}
			/>
		),
		filterDropdownProps: {
			onOpenChange(open) {
				if (open) {
					setTimeout(() => searchInput.current?.select(), 100);
				}
			},
		},
	});

	// Table columns
	const columns: TableColumnType<RomSessionRow>[] = useMemo(
		() => [
			{
				title: t(
					'Admin.data.menu.patientDetail.aiAssistantRomSummary.exercise',
					'Exercise',
				),
				key: 'title',
				width: '30%',
				...getColumnSearchProps(),
				render: (_: unknown, record: RomSessionRow) => (
					<span className="admin-table-name-text cursor-pointer">
						<strong>{record.title}</strong>
					</span>
				),
			},
			{
				title: t(
					'Admin.data.menu.patientDetail.aiAssistantRomSummary.sessionDate',
					'Session Date',
				),
				dataIndex: 'createdAt',
				key: 'createdAt',
				width: '25%',
				sorter: true,
				sortOrder:
					sorterState.field === 'createdAt' ? sorterState.order : undefined,
				render: (_: unknown, record: RomSessionRow) => (
					<span
						className="admin-table-date-text"
						style={{ fontSize: 'var(--font-size-sm)' }}>
						{format(record.createdAt, 'MMM dd, yyyy, hh:mm a')}
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
				filters: [
					{ text: 'All', value: 'all' },
					{ text: t('Admin.data.survey.completed'), value: 'true' },
					{ text: t('Admin.data.menu.userRoles.inCompleted'), value: 'false' },
				],
				filterMultiple: false,
				filteredValue:
					completedFilter === undefined ? ['all'] : [String(completedFilter)],
				onFilter: () => true, // Handled by API
				render: (_: unknown, record: RomSessionRow) => (
					<Tooltip
						title={
							record.completed
								? t('Admin.data.survey.completed')
								: t('Admin.data.menu.userRoles.inCompleted')
						}>
						<span>
							<UntitledIcon
								name={record.completed ? 'checkCircle' : 'warning'}
								size={20}
								color={
									record.completed
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
				width: '20%',
				render: (_: unknown, record: RomSessionRow) => (
					<div
						style={{
							visibility: hoveredRow === record.id ? 'visible' : 'hidden',
							opacity: hoveredRow === record.id ? 1 : 0,
							transition: 'opacity 0.2s',
						}}
						onClick={e => e.stopPropagation()}>
						<Flex gap={12}>
							{record.completed && (
								<>
									<Tooltip
										title={t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.edit',
										)}>
										<span>
											<SummaryResultReportDownloader
												selectedRom={
													fullSessionCache[record.id] || record.originalSession
												}
												completedStatus={record.completed}
												fetchSessionData={() =>
													fetchData(
														currentPage,
														searchTitle || undefined,
														completedFilter,
													)
												}
												user={user.isPhysioterapist ? selectedUser : user}
												reportType="edit"
												color="var(--text-primary)"
											/>
										</span>
									</Tooltip>
									<Tooltip
										title={t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.qrCode',
										)}>
										<span>
											<SummaryResultReportDownloader
												selectedRom={
													fullSessionCache[record.id] || record.originalSession
												}
												completedStatus={record.completed}
												user={user.isPhysioterapist ? selectedUser : user}
												reportType="qr"
												color="var(--text-primary)"
											/>
										</span>
									</Tooltip>
									<Tooltip
										title={t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.sendEmail',
										)}>
										<span>
											<SummaryResultReportDownloader
												selectedRom={
													fullSessionCache[record.id] || record.originalSession
												}
												completedStatus={record.completed}
												user={user.isPhysioterapist ? selectedUser : user}
												reportType="email"
												color="var(--text-primary)"
											/>
										</span>
									</Tooltip>
									<Tooltip
										title={t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.download',
										)}>
										<span>
											<SummaryResultReportDownloader
												selectedRom={
													fullSessionCache[record.id] || record.originalSession
												}
												user={user.isPhysioterapist ? selectedUser : user}
												reportType="download"
												color="var(--text-primary)"
												completedStatus={record.completed}
											/>
										</span>
									</Tooltip>
								</>
							)}
						</Flex>
					</div>
				),
			},
			{
				title: '',
				key: 'statusAndCheckbox',
				width: '10%',
				render: (_: unknown, record: RomSessionRow) => (
					<Flex
						gap={12}
						align="center"
						justify="flex-end"
						onClick={e => e.stopPropagation()}>
						{user.isPhysioterapist && (
							<div className="posture-dropdown-section">
								<Dropdown menu={getMenuItems(record)} trigger={['click']}>
									<a onClick={e => e.stopPropagation()}>
										{statusIcons[record.status as keyof IstatusIcon]}
									</a>
								</Dropdown>
							</div>
						)}
						<Checkbox
							checked={reportIds?.romSessionsIds?.includes(record.sessionId)}
							disabled={!record.completed}
							className="report-checkbox"
							onChange={e => {
								if (e.target.checked) {
									dispatch(
										addReportId({
											type: 'romSessionsIds',
											id: record.sessionId,
										}),
									);
								} else {
									dispatch(
										deleteReportId({
											type: 'romSessionsIds',
											id: record.sessionId,
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
			selectedUser,
			t,
			dispatch,
			currentPage,
			searchTitle,
			completedFilter,
			sorterState.field,
			sorterState.order,
			fullSessionCache,
		],
	);

	// Handle table change (pagination, filters, sorter)
	const handleTableChange = (
		pag: { current?: number },
		filters: Record<string, unknown>,
		sorter: SorterResult<RomSessionRow> | SorterResult<RomSessionRow>[],
	) => {
		// Cast sorter to expected type
		const sort = Array.isArray(sorter) ? sorter[0] : sorter;

		// Handle pagination
		if (pag.current && pag.current !== currentPage) {
			setCurrentPage(pag.current);
		}

		// Handle sorting with 3-way toggle: ascend -> descend -> no sort
		const isSameField = lastSortRef.current.field === sort?.field;
		const isSameOrder = lastSortRef.current.order === sort?.order;

		// Reset if same field & same order clicked again
		if (isSameField && isSameOrder) {
			setSorterState({});
			lastSortRef.current = {};
		} else if (sort?.order) {
			setSorterState({
				field: sort.field as string,
				order: sort.order,
			});
			lastSortRef.current = {
				field: sort.field as string,
				order: sort.order,
			};
		} else {
			setSorterState({});
			lastSortRef.current = {};
		}

		// Handle completed filter
		if (filters.completed) {
			const filterValue = (filters.completed as string[])[0];
			if (filterValue === 'all') {
				setCompletedFilter(undefined);
			} else {
				setCompletedFilter(filterValue === 'true');
			}
		}
	};

	const listRomStyle: CSSProperties = {
		padding: 15,
		backgroundColor: 'var(--surface-tertiary)',
		borderRadius: 'var(--radius-xl)',
		height: '100%',
	};

	const location = useLocation();
	const shouldOpenFirstTriage = location.state?.openFirstTriage;
	const navigate = useNavigate();
	useEffect(() => {
		if (shouldOpenFirstTriage && !loading && allSessions?.length > 0) {
			const firstSession = allSessions[0];

			handleRowClick(firstSession);

			// prevent reopening on re-render
			navigate(location.pathname, { replace: true });
		}
	}, [shouldOpenFirstTriage, loading, allSessions]);

	return (
		<div className="list-rom" style={listRomStyle}>
			<div className="lower-content-container">
				{!isReportModal && (
					<Flex justify="flex-end" gap={8}>
						<AddToReports />
					</Flex>
				)}
			</div>
			{loading ? (
				<ActivityFeedSkeleton count={6} />
			) : (
				<div className="admin-table-container admin-table-container-normal">
					<Table<RomSessionRow>
						columns={columns}
						dataSource={allSessions}
						rowKey="id"
						pagination={{
							current: currentPage,
							pageSize: 10,
							total: pagination?.totalCount || 0,
							showSizeChanger: false,
							position: ['bottomCenter'],
						}}
						onChange={handleTableChange}
						className="admin-table"
						onRow={record => ({
							onClick: () => handleRowClick(record),
							onMouseEnter: () => {
								setHoveredRow(record.id);
								// Prefetch full session data on hover for faster edit modal
								if (record.completed && !fullSessionCache[record.id]) {
									fetchFullSession(record.id);
								}
							},
							onMouseLeave: () => setHoveredRow(null),
							style: {
								cursor: 'pointer',
							},
						})}
					/>
				</div>
			)}

			{/* Result Modal - Bottom Sheet */}
			<TriageResultModal
				open={resultModalOpen}
				onClose={() => {
					setResultModalOpen(false);
					setSelectedSession(null);
					setSelectedSessionTitle('');
					setSelectedCompletedStatus(false);
				}}
				user={
					user.isPhysioterapist && selectedUser
						? (selectedUser as unknown as UserWithSession)
						: ({ id: user.id, profile: user } as unknown as UserWithSession)
				}
				session={selectedSession as unknown as Session}
				sessionTitle={selectedSessionTitle}
				completedStatus={selectedCompletedStatus}
				onRefreshData={fetchAllSessions}
				resultType="rom"
			/>
		</div>
	);
}
