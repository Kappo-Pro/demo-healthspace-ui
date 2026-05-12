/**
 * OAdminTriageDashboard Organism Component
 *
 * Admin triage dashboard with smart filtering, risk stratification, and bulk operations.
 * Implements FR11 (Admin Triage Dashboard), FR13 (Bulk Operations), FR14 (Smart Filters), FR16 (Keyboard Shortcuts).
 *
 * Story 3.1: Admin Triage Dashboard with Smart Filtering
 * Story 3.3: Bulk Operations for Workflow Efficiency
 * Story 3.4: Desktop Optimization with Keyboard Shortcuts
 * @module components/organisms/OAdminTriageDashboard
 */

import React, {
	useEffect,
	useState,
	useCallback,
	useMemo,
	useRef} from 'react';
import {
	Table,
	Space,
	Button,
	Input,
	Tag,
	Typography,
	Flex,
	message,
	Tooltip,
	Switch} from 'antd';
import type { TableProps, TableColumnType } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useSearchParams } from 'react-router-dom';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import {
	useAdminTriageShortcuts,
	ADMIN_TRIAGE_SHORTCUTS} from '@hooks/useAdminTriageShortcuts';
import { ShortcutHelpModal } from '@atoms/ShortcutHelpModal';
import { useCommandPalette } from '@contexts/CommandPaletteContext';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	fetchAdminDashboardPatients,
	calculateRiskLevels,
	updateFilters,
	setQuickFilter,
	clearFilters,
	setSortConfig,
	setPagination,
	togglePatientSelection,
	clearSelection,
	selectPatients,
	selectFilters,
	selectPagination,
	selectSelectedPatientIds,
	selectLoading,
	selectFilteredSortedPatients} from '@stores/posture/postureAnalytics/adminDashboard';
import type {
	PatientPostureData,
	QuickFilter} from '@stores/posture/postureAnalytics/adminDashboard';
import {
	bulkUpdateStatus,
	bulkAssignClinician,
	bulkExportPatients,
	undoBulkOperation,
	clearActiveUndo,
	cancelUndo,
	selectActiveUndo,
	selectExportProgress,
	selectBulkLoading} from '@stores/posture/postureAnalytics/bulkOperations';
import type { PostureStatus } from '@types/posture';
import type { ExportFormat } from '@stores/posture/postureAnalytics/bulkOperations';
import RiskBadge from '@atoms/RiskBadge';
import { format, formatDistanceToNow } from 'date-fns';
import { useDebouncedValue } from '@hooks/useDebounce';
import {
	markPerformanceStart,
	PERFORMANCE_BUDGETS} from '@utils/performance/benchmark';
import { BulkStatusUpdateModal } from './BulkStatusUpdateModal';
import { BulkClinicianAssignModal } from './BulkClinicianAssignModal';
import { BulkExportModal } from './BulkExportModal';
import { BulkOperationUndoToast } from './BulkOperationUndoToast';
import VirtualizedPatientTable from './VirtualizedPatientTable';
import './OAdminTriageDashboard.css';

const { Title, Text } = Typography;
const { Search } = Input;

interface QuickFilterButtonProps {
	filter: QuickFilter;
	label: string;
	count?: number;
	active: boolean;
	onClick: () => void;
}

const QuickFilterButton: React.FC<QuickFilterButtonProps> = ({
	label,
	count,
	active,
	onClick,
}) => (
	<Button
		type={active ? 'primary' : 'default'}
		onClick={onClick}
		aria-pressed={active}
		role="button">
		{label}
		{count !== undefined && count > 0 && (
			<Tag color={active ? 'processing' : 'default'} style={{ marginLeft: 8 }}>
				{count}
			</Tag>
		)}
	</Button>
);

export const OAdminTriageDashboard: React.FC = () => {
	const { t } = useTypedTranslation();
	const dispatch = useTypedDispatch();
	const [searchParams, setSearchParams] = useSearchParams();
	const { open: openCommandPalette } = useCommandPalette();

	const patients = useTypedSelector(selectPatients);
	const filters = useTypedSelector(selectFilters);
	const pagination = useTypedSelector(selectPagination);
	const selectedPatientIds = useTypedSelector(selectSelectedPatientIds);
	const loading = useTypedSelector(selectLoading);
	const filteredSortedPatients = useTypedSelector(selectFilteredSortedPatients);
	const activeUndo = useTypedSelector(selectActiveUndo);
	const exportProgress = useTypedSelector(selectExportProgress);
	const bulkLoading = useTypedSelector(selectBulkLoading);

	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
	const [statusModalVisible, setStatusModalVisible] = useState(false);
	const [clinicianModalVisible, setClinicianModalVisible] = useState(false);
	const [exportModalVisible, setExportModalVisible] = useState(false);
	const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
	const [focusedRowIndex, setFocusedRowIndex] = useState(0);

	// Story 3.8: Performance optimization - virtualization toggle
	const [useVirtualization, setUseVirtualization] = useState(false);
	const [localSearchQuery, setLocalSearchQuery] = useState(
		filters.searchQuery || '',
	);

	// Story 3.8: Debounced search query (300ms delay per AC2)
	const debouncedSearchQuery = useDebouncedValue(
		localSearchQuery,
		PERFORMANCE_BUDGETS.SEARCH_DEBOUNCE,
	);

	// Refs for focus management
	const searchInputRef = useRef<HTMLInputElement>(null);
	const tableRef = useRef<HTMLDivElement>(null);

	// Story 3.8: Cleanup on unmount (AC4 - Memory Management)
	useEffect(() => {
		return () => {
			// Clear selections to free memory
			dispatch(clearSelection());
			// Clear any pending timeouts/intervals if needed
		};
	}, [dispatch]);

	// Story 3.8: Performance tracking
	useEffect(() => {
		const endMeasure = markPerformanceStart('AdminTriageDashboard:initialLoad');

		const urlFilters = searchParams.get('filters');
		if (urlFilters) {
			try {
				const parsed = JSON.parse(decodeURIComponent(urlFilters));
				dispatch(updateFilters(parsed));
				setLocalSearchQuery(parsed.searchQuery || '');
			} catch (error) {
				// Intentionally silent - invalid URL params are ignored
				console.warn('Failed to parse URL filters:', error);
			}
		}

		const page = parseInt(searchParams.get('page') || '1', 10);
		const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
		dispatch(setPagination({ page, pageSize }));

		// Enable virtualization automatically for large datasets
		const shouldVirtualize = pageSize >= 100 || patients.length >= 100;
		setUseVirtualization(shouldVirtualize);

		fetchData().then(() => {
			endMeasure();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const newParams = new URLSearchParams(searchParams);

		if (filters.quickFilter !== 'all' || Object.keys(filters).length > 1) {
			newParams.set('filters', encodeURIComponent(JSON.stringify(filters)));
		} else {
			newParams.delete('filters');
		}

		newParams.set('page', pagination.page.toString());
		newParams.set('pageSize', pagination.pageSize.toString());

		setSearchParams(newParams, { replace: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters, pagination.page, pagination.pageSize]);

	const fetchData = useCallback(async () => {
		try {
			const result = await dispatch(
				fetchAdminDashboardPatients({
					filters,
					page: pagination.page,
					pageSize: pagination.pageSize,
					sortField: 'lastScanDate',
					sortOrder: 'desc',
				}),
			).unwrap();

			if (result.patients.length > 0) {
				const patientIds = result.patients.map(p => p.userId);
				dispatch(calculateRiskLevels(patientIds));
			}
		} catch (error) {
			message.error(t('Admin.data.triage.messages.loadError'));
		}
	}, [dispatch, filters, pagination.page, pagination.pageSize, t]);

	const handleQuickFilterChange = useCallback(
		(filter: QuickFilter) => {
			dispatch(setQuickFilter(filter));
			fetchData();
		},
		[dispatch, fetchData],
	);

	// Story 3.8: Debounced search effect
	useEffect(() => {
		if (debouncedSearchQuery !== filters.searchQuery) {
			const endMeasure = markPerformanceStart('AdminTriageDashboard:search');
			dispatch(updateFilters({ searchQuery: debouncedSearchQuery }));
			fetchData().then(() => {
				endMeasure();
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchQuery]);

	const handleSearch = useCallback((value: string) => {
		setLocalSearchQuery(value);
	}, []);

	const handleClearFilters = useCallback(() => {
		dispatch(clearFilters());
		dispatch(clearSelection());
		fetchData();
	}, [dispatch, fetchData]);

	// ========================================
	// Bulk Operations Handlers
	// ========================================

	const handleBulkStatusUpdate = useCallback(
		async (status: PostureStatus) => {
			try {
				await dispatch(
					bulkUpdateStatus({
						patientIds: selectedPatientIds,
						status,
					}),
				).unwrap();

				message.success(
					t('Admin.data.triage.bulkOperations.updateStatus.successMessage', {
						count: selectedPatientIds.length,
					}),
				);
				setStatusModalVisible(false);
				fetchData();
			} catch (error) {
				message.error(
					t('Admin.data.triage.bulkOperations.updateStatus.errorMessage'),
				);
			}
		},
		[dispatch, selectedPatientIds, fetchData, t],
	);

	const handleBulkClinicianAssign = useCallback(
		async (
			clinicianId: string,
			clinicianName: string,
			sendNotification: boolean,
		) => {
			try {
				await dispatch(
					bulkAssignClinician({
						patientIds: selectedPatientIds,
						clinicianId,
						clinicianName,
						sendNotification,
					}),
				).unwrap();

				message.success(
					t('Admin.data.triage.bulkOperations.assignClinician.successMessage', {
						clinicianName,
						count: selectedPatientIds.length,
					}),
				);
				setClinicianModalVisible(false);
				fetchData();
			} catch (error) {
				message.error(
					t('Admin.data.triage.bulkOperations.assignClinician.errorMessage'),
				);
			}
		},
		[dispatch, selectedPatientIds, fetchData, t],
	);

	const handleBulkExport = useCallback(
		async (format: ExportFormat) => {
			try {
				await dispatch(
					bulkExportPatients({
						patientIds: selectedPatientIds,
						format,
					}),
				).unwrap();

				message.success(
					t('Admin.data.triage.bulkOperations.export.successMessage', {
						count: selectedPatientIds.length,
						format: format.toUpperCase(),
					}),
				);
				setExportModalVisible(false);
			} catch (error) {
				message.error(
					t('Admin.data.triage.bulkOperations.export.errorMessage'),
				);
			}
		},
		[dispatch, selectedPatientIds, t],
	);

	const handleUndo = useCallback(async () => {
		if (!activeUndo) return;

		try {
			await dispatch(undoBulkOperation(activeUndo.id)).unwrap();
			message.success(t('Admin.data.triage.bulkOperations.undo.undoSuccess'));
			fetchData();
		} catch (error) {
			message.error(t('Admin.data.triage.bulkOperations.undo.undoError'));
		}
	}, [dispatch, activeUndo, fetchData, t]);

	const handleCancelUndo = useCallback(() => {
		dispatch(cancelUndo());
		if (activeUndo) {
			dispatch(clearActiveUndo(activeUndo.id));
		}
	}, [dispatch, activeUndo]);

	// ========================================
	// Keyboard Shortcut Handlers (Story 3.4)
	// ========================================

	const handleNavigateNext = useCallback(() => {
		setFocusedRowIndex(prev =>
			Math.min(prev + 1, filteredSortedPatients.length - 1),
		);
	}, [filteredSortedPatients.length]);

	const handleNavigatePrevious = useCallback(() => {
		setFocusedRowIndex(prev => Math.max(prev - 1, 0));
	}, []);

	const handleToggleSelection = useCallback(() => {
		if (filteredSortedPatients[focusedRowIndex]) {
			const patientId = filteredSortedPatients[focusedRowIndex].id;
			dispatch(togglePatientSelection(patientId));
		}
	}, [dispatch, filteredSortedPatients, focusedRowIndex]);

	const handleSelectAll = useCallback(() => {
		filteredSortedPatients.forEach(patient => {
			if (!selectedPatientIds.includes(patient.id)) {
				dispatch(togglePatientSelection(patient.id));
			}
		});
		message.success(
			t('Admin.data.triage.selection.selectAll', {
				count: filteredSortedPatients.length,
			}),
		);
	}, [dispatch, filteredSortedPatients, selectedPatientIds, t]);

	const handleDeselectAll = useCallback(() => {
		dispatch(clearSelection());
		message.success(t('Admin.data.triage.selection.selectionCleared'));
	}, [dispatch, t]);

	const handleFocusSearch = useCallback(() => {
		searchInputRef.current?.focus();
	}, []);

	const handleCloseModals = useCallback(() => {
		setStatusModalVisible(false);
		setClinicianModalVisible(false);
		setExportModalVisible(false);
		setShowShortcutsHelp(false);
		setShowAdvancedFilters(false);
	}, []);

	const handleOpenStatusModal = useCallback(() => {
		if (selectedPatientIds.length >= 2) {
			setStatusModalVisible(true);
		} else {
			message.warning(
				t('Admin.data.triage.bulkOperations.updateStatus.minSelectionWarning'),
			);
		}
	}, [selectedPatientIds.length, t]);

	const handleOpenClinicianModal = useCallback(() => {
		if (selectedPatientIds.length >= 2) {
			setClinicianModalVisible(true);
		} else {
			message.warning(
				t(
					'Admin.data.triage.bulkOperations.assignClinician.minSelectionWarning',
				),
			);
		}
	}, [selectedPatientIds.length, t]);

	const handleOpenExportModal = useCallback(() => {
		if (selectedPatientIds.length >= 2) {
			setExportModalVisible(true);
		} else {
			message.warning(
				t('Admin.data.triage.bulkOperations.export.minSelectionWarning'),
			);
		}
	}, [selectedPatientIds.length, t]);

	const handleToggleFilters = useCallback(() => {
		setShowAdvancedFilters(prev => !prev);
	}, []);

	const handleShowShortcutsHelp = useCallback(() => {
		setShowShortcutsHelp(true);
	}, []);

	// Register keyboard shortcuts (Story 3.4 AC 1)
	useAdminTriageShortcuts({
		handlers: {
			onNavigateNext: handleNavigateNext,
			onNavigatePrevious: handleNavigatePrevious,
			onToggleSelection: handleToggleSelection,
			onSelectAll: handleSelectAll,
			onDeselectAll: handleDeselectAll,
			onFocusSearch: handleFocusSearch,
			onClose: handleCloseModals,
			onUpdateStatus: handleOpenStatusModal,
			onAssignClinician: handleOpenClinicianModal,
			onExport: handleOpenExportModal,
			onRefresh: fetchData,
			onToggleFilters: handleToggleFilters,
			onOpenCommandPalette: openCommandPalette,
			onShowShortcutsHelp: handleShowShortcutsHelp,
		},
		enabled: true,
		hasSelection: selectedPatientIds.length >= 2,
	});

	// ========================================

	const handleTableChange: TableProps<PatientPostureData>['onChange'] =
		useCallback(
			(newPagination, _filters, sorter) => {
				if (newPagination.current && newPagination.pageSize) {
					dispatch(
						setPagination({
							page: newPagination.current,
							pageSize: newPagination.pageSize,
						}),
					);
				}

				if (sorter && !Array.isArray(sorter) && sorter.field && sorter.order) {
					dispatch(
						setSortConfig({
							field: sorter.field as keyof PatientPostureData,
							order: sorter.order === 'ascend' ? 'asc' : 'desc',
						}),
					);
				}

				fetchData();
			},
			[dispatch, fetchData],
		);

	const rowSelection = useMemo(
		() => ({
			selectedRowKeys: selectedPatientIds,
			onChange: (selectedKeys: React.Key[]) => {
				selectedKeys.forEach(key => {
					dispatch(togglePatientSelection(key as string));
				});
			},
			getCheckboxProps: (record: PatientPostureData) => ({
				'aria-label': `Select patient ${record.name}`,
			}),
		}),
		[selectedPatientIds, dispatch],
	);

	const columns: TableColumnType<PatientPostureData>[] = useMemo(
		() => [
			{
				title: t('Admin.data.triage.table.columns.patientName'),
				dataIndex: 'name',
				key: 'name',
				sorter: true,
				render: (name: string, record: PatientPostureData) => (
					<div>
						<div style={{ fontWeight: 'var(--font-weight-medium)' }}>{name}</div>
						<div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
							{record.email}
						</div>
					</div>
				),
			},
			{
				title: t('Admin.data.triage.table.columns.lastScan'),
				dataIndex: 'lastScanDate',
				key: 'lastScanDate',
				sorter: true,
				render: (date: string) => (
					<div>
						<div>{format(new Date(date), 'MMM d, yyyy')}</div>
						<div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
							{formatDistanceToNow(new Date(date), { addSuffix: true })}
						</div>
					</div>
				),
			},
			{
				title: t('Admin.data.triage.table.columns.riskLevel'),
				dataIndex: 'riskLevel',
				key: 'riskLevel',
				sorter: true,
				render: (riskLevel: PatientPostureData['riskLevel']) => (
					<RiskBadge riskLevel={riskLevel} />
				),
			},
			{
				title: t('Admin.data.triage.table.columns.postureScore'),
				dataIndex: 'postureScore',
				key: 'postureScore',
				sorter: true,
				render: (score: number) => (
					<div>
						<div style={{ fontWeight: 'var(--font-weight-medium)' }}>{score}%</div>
						<div
							style={{
								width: 60,
								height: 4,
								backgroundColor: 'var(--color-border)',
								borderRadius: 2,
								overflow: 'hidden',
								marginTop: 4,
							}}>
							<div
								style={{
									width: `${score}%`,
									height: '100%',
									backgroundColor:
										score >= 70
											? 'var(--color-success)'
											: score >= 50
												? 'var(--color-warning)'
												: 'var(--color-danger)',
								}}
							/>
						</div>
					</div>
				),
			},
			{
				title: t('Admin.data.triage.table.columns.status'),
				dataIndex: 'status',
				key: 'status',
				sorter: true,
				render: (status: PatientPostureData['status']) => {
					const statusConfig = {
						excellent: {
							color: 'success',
							label: t('Admin.data.triage.status.excellent'),
						},
						good: {
							color: 'success',
							label: t('Admin.data.triage.status.good'),
						},
						fair: {
							color: 'warning',
							label: t('Admin.data.triage.status.fair'),
						},
						poor: { color: 'error', label: t('Admin.data.triage.status.poor') },
						critical: {
							color: 'error',
							label: t('Admin.data.triage.status.critical'),
						},
					};
					const config = statusConfig[status];
					return <Tag color={config.color}>{config.label}</Tag>;
				},
			},
			{
				title: t('Admin.data.triage.table.columns.assignedClinician'),
				dataIndex: 'assignedClinician',
				key: 'assignedClinician',
				render: (clinician: string | undefined) =>
					clinician || t('Admin.data.triage.table.unassigned'),
			},
		],
		[t],
	);

	const filterCounts = useMemo(() => {
		return {
			all: patients.length,
			'high-risk': patients.filter(p => p.riskLevel === 'high').length,
			'needs-review': patients.filter(
				p => p.status === 'fair' || p.status === 'poor',
			).length,
			overdue: patients.filter(p => {
				const daysSince = Math.floor(
					(Date.now() - new Date(p.lastScanDate).getTime()) /
						(1000 * 60 * 60 * 24),
				);
				return daysSince > 30;
			}).length,
		};
	}, [patients]);

	return (
		<div
			className="admin-triage-dashboard"
			role="region"
			aria-label={t('Admin.data.triage.dashboard.patientTriageDashboard')}
			ref={tableRef}>
			<Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
				<Title level={3} style={{ margin: 0 }}>
					Triage Dashboard
				</Title>
				<Space>
					{/* Story 3.8: Virtualization toggle */}
					<Tooltip
						title={
							useVirtualization
								? t('Admin.data.triage.dashboard.virtualScrollingTooltip')
								: t('Admin.data.triage.dashboard.standardTableView')
						}
						placement="bottom">
						<Space>
							<UntitledIcon
								name="lightning"
								size={16}
								style={{
									color: useVirtualization
										? 'var(--color-primary)'
										: 'var(--color-text-tertiary)',
								}}
							/>
							<Switch
								checked={useVirtualization}
								onChange={setUseVirtualization}
								size="small"
								aria-label={t(
									'Admin.data.triage.dashboard.toggleVirtualScrolling',
								)}
							/>
							<Text
								type="secondary"
								style={{ fontSize: 'var(--font-size-xs)', userSelect: 'none' }}>
								Virtual Scrolling
							</Text>
						</Space>
					</Tooltip>
					<Tooltip
						title={t('Admin.data.triage.dashboard.refreshWithShortcut')}
						placement="bottom">
						<Button
							icon={<UntitledIcon name="refresh" size={16} />}
							onClick={fetchData}
							loading={loading}
							aria-label={t('Admin.data.triage.dashboard.refreshPatientData')}
							aria-keyshortcuts="r">
							Refresh
						</Button>
					</Tooltip>
					<Tooltip
						title={t('Admin.data.triage.dashboard.keyboardShortcuts')}
						placement="bottom">
						<Button
							icon={<UntitledIcon name="help" size={16} />}
							onClick={handleShowShortcutsHelp}
							aria-label={t(
								'Admin.data.triage.dashboard.showKeyboardShortcuts',
							)}
							aria-keyshortcuts="?">
							Shortcuts
						</Button>
					</Tooltip>
				</Space>
			</Flex>

			<Space
				size="middle"
				style={{ marginBottom: 16 }}
				role="group"
				aria-label={t('Admin.data.triage.filters.quickFiltersAriaLabel')}>
				<QuickFilterButton
					filter="all"
					label={t('Admin.data.triage.filters.allPatients')}
					count={filterCounts.all}
					active={filters.quickFilter === 'all'}
					onClick={() => handleQuickFilterChange('all')}
				/>
				<QuickFilterButton
					filter="high-risk"
					label={t('Admin.data.triage.filters.highRisk')}
					count={filterCounts['high-risk']}
					active={filters.quickFilter === 'high-risk'}
					onClick={() => handleQuickFilterChange('high-risk')}
				/>
				<QuickFilterButton
					filter="needs-review"
					label={t('Admin.data.triage.filters.needsReview')}
					count={filterCounts['needs-review']}
					active={filters.quickFilter === 'needs-review'}
					onClick={() => handleQuickFilterChange('needs-review')}
				/>
				<QuickFilterButton
					filter="overdue"
					label={t('Admin.data.triage.filters.overdueScan')}
					count={filterCounts.overdue}
					active={filters.quickFilter === 'overdue'}
					onClick={() => handleQuickFilterChange('overdue')}
				/>
			</Space>

			<Flex gap="middle" style={{ marginBottom: 16 }}>
				<Tooltip
					title={t('Admin.data.triage.filters.focusSearchTooltip')}
					placement="bottom">
					<Search
						ref={searchInputRef}
						placeholder={t('Admin.data.triage.filters.searchPlaceholder')}
						value={localSearchQuery}
						onChange={e => handleSearch(e.target.value)}
						onSearch={handleSearch}
						style={{ width: 380 }}
						enterButton
						allowClear
						aria-label={t('Admin.data.triage.filters.searchPatients')}
						aria-keyshortcuts="/"
					/>
				</Tooltip>
				<Tooltip
					title={t('Admin.data.triage.filters.toggleFilters')}
					placement="bottom">
					<Button
						icon={<UntitledIcon name="filter" size={16} />}
						onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
						aria-label={t('Admin.data.triage.filters.toggleAdvancedFilters')}
						aria-expanded={showAdvancedFilters}
						aria-keyshortcuts="f">
						Advanced Filters
					</Button>
				</Tooltip>
				<Button
					onClick={handleClearFilters}
					aria-label={t('Admin.data.triage.filters.clearAllFilters')}>
					Clear Filters
				</Button>
			</Flex>

			{selectedPatientIds.length >= 2 && (
				<div
					style={{
						marginBottom: 'var(--spacing-4)',
						padding: 'var(--spacing-3) var(--spacing-4)',
						backgroundColor: 'var(--color-primary-bg)',
						borderRadius: 'var(--spacing-1)',
						border: '1px solid var(--color-primary-border)',
					}}
					role="alert"
					aria-live="polite">
					<Flex justify="space-between" align="center">
						<span>
							{t('Admin.data.triage.selection.patientsSelected', {
								count: selectedPatientIds.length,
							})}
							<Text type="secondary" style={{ marginLeft: 8, fontSize: 'var(--font-size-xs)' }}>
								{t('Admin.data.triage.selection.keyboardHint')}
							</Text>
						</span>
						<Space>
							<Tooltip
								title={t(
									'Admin.data.triage.bulkOperations.updateStatus.buttonWithShortcut',
								)}
								placement="bottom">
								<Button
									type="primary"
									icon={<UntitledIcon name="edit" size={16} />}
									onClick={() => setStatusModalVisible(true)}
									aria-label={t(
										'Admin.data.triage.bulkOperations.updateStatus.buttonAria',
									)}
									aria-keyshortcuts="u">
									Update Status
								</Button>
							</Tooltip>
							<Tooltip
								title={t(
									'Admin.data.triage.bulkOperations.assignClinician.buttonWithShortcut',
								)}
								placement="bottom">
								<Button
									icon={<UntitledIcon name="userPlus" size={16} />}
									onClick={() => setClinicianModalVisible(true)}
									aria-label={t(
										'Admin.data.triage.bulkOperations.assignClinician.buttonAria',
									)}
									aria-keyshortcuts="c">
									Assign Clinician
								</Button>
							</Tooltip>
							<Tooltip
								title={t(
									'Admin.data.triage.bulkOperations.export.buttonWithShortcut',
								)}
								placement="bottom">
								<Button
									icon={<UntitledIcon name="download" size={16} />}
									onClick={() => setExportModalVisible(true)}
									aria-label={t(
										'Admin.data.triage.bulkOperations.export.buttonAria',
									)}
									aria-keyshortcuts="e">
									Export
								</Button>
							</Tooltip>
							<Tooltip
								title={t('Admin.data.triage.selection.clearSelectionTooltip')}
								placement="bottom">
								<Button
									onClick={() => dispatch(clearSelection())}
									aria-label={t(
										'Admin.data.triage.selection.clearSelectionAria',
									)}
									aria-keyshortcuts="meta+shift+a ctrl+shift+a">
									Clear Selection
								</Button>
							</Tooltip>
						</Space>
					</Flex>
				</div>
			)}

			{/* Story 3.8: Conditional rendering - virtualized vs standard table */}
			{useVirtualization ? (
				<>
					<VirtualizedPatientTable
						patients={filteredSortedPatients}
						selectedPatientIds={selectedPatientIds}
						onSelectionChange={patientId =>
							dispatch(togglePatientSelection(patientId))
						}
						height={600}
						rowHeight={72}
						focusedRowIndex={focusedRowIndex}
						loading={loading}
					/>
					<div
						style={{
							marginTop: 'var(--spacing-4)',
							padding: 'var(--spacing-2) var(--spacing-4)',
							backgroundColor: 'var(--color-fill-quaternary)',
							borderRadius: 'var(--spacing-1)',
							fontSize: 'var(--font-size-xs)',
							color: 'var(--color-text-secondary)',
						}}>
						{t('Admin.data.triage.table.virtualScrollStatus', {
							showing: filteredSortedPatients.length,
							total: pagination.total,
						})}
					</div>
				</>
			) : (
				<Table<PatientPostureData>
					columns={columns}
					dataSource={filteredSortedPatients}
					rowKey="id"
					loading={loading}
					pagination={{
						current: pagination.page,
						pageSize: pagination.pageSize,
						total: pagination.total,
						showSizeChanger: true,
						showTotal: (total, range) =>
							t('Admin.data.triage.table.paginationText', {
								from: range[0],
								to: range[1],
								total,
							}),
						pageSizeOptions: ['10', '20', '50', '100'],
					}}
					rowSelection={rowSelection}
					onChange={handleTableChange}
					rowClassName={(_record, index) =>
						index === focusedRowIndex ? 'keyboard-focused-row' : ''
					}
					aria-label={t('Admin.data.triage.table.patientListTable')}
					role="table"
				/>
			)}

			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{filters.quickFilter !== 'all' &&
					t('Admin.data.triage.filters.filteredResults', {
						count: filteredSortedPatients.length,
						filter: filters.quickFilter,
					})}
			</div>

			{/* Bulk Operation Modals */}
			<BulkStatusUpdateModal
				visible={statusModalVisible}
				selectedCount={selectedPatientIds.length}
				onConfirm={handleBulkStatusUpdate}
				onCancel={() => setStatusModalVisible(false)}
				loading={bulkLoading.statusUpdate}
			/>

			<BulkClinicianAssignModal
				visible={clinicianModalVisible}
				selectedCount={selectedPatientIds.length}
				onConfirm={handleBulkClinicianAssign}
				onCancel={() => setClinicianModalVisible(false)}
				loading={bulkLoading.clinicianAssignment}
			/>

			<BulkExportModal
				visible={exportModalVisible}
				selectedCount={selectedPatientIds.length}
				onConfirm={handleBulkExport}
				onCancel={() => setExportModalVisible(false)}
				loading={bulkLoading.export}
				progress={exportProgress.progress}
			/>

			{/* Undo Toast */}
			<BulkOperationUndoToast
				visible={!!activeUndo}
				description={activeUndo?.description || ''}
				onUndo={handleUndo}
				onCancel={handleCancelUndo}
				duration={10}
			/>

			{/* Keyboard Shortcuts Help Modal (Story 3.4 AC 3) */}
			<ShortcutHelpModal
				visible={showShortcutsHelp}
				onClose={() => setShowShortcutsHelp(false)}
				shortcuts={ADMIN_TRIAGE_SHORTCUTS}
				title={t('Admin.data.triage.dashboard.keyboardShortcutsTitle')}
			/>
		</div>
	);
};

OAdminTriageDashboard.displayName = 'OAdminTriageDashboard';

export default OAdminTriageDashboard;
