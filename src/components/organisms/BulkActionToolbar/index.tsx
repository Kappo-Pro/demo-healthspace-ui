/**
 * BulkActionToolbar
 *
 * Toolbar for performing bulk operations on scheduled activities
 *
 * Features:
 * - Multi-select mode with checkboxes
 * - Bulk actions: Delete, Reschedule, Mark Complete, Mark Cancelled
 * - Progress indicator for bulk operations
 * - Undo capability
 * - Confirmation modals
 */

import React, { useState } from 'react';
import {
	Button,
	Space,
	Checkbox,
	Modal,
	Progress,
	message,
	DatePicker,
	Typography,
	InputNumber,
	Select,
	Divider} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import {
	ScheduledActivity,
	ScheduledActivityStatus} from '@services/mockSchedulingApi';
import { addDays, format } from 'date-fns';
import dayjs, { Dayjs } from 'dayjs';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './styles.css';

const { Text } = Typography;

export interface BulkActionToolbarProps {
	selectedActivities: ScheduledActivity[];
	onSelectionChange: (activityIds: string[]) => void;
	onBulkDelete: (activityIds: string[]) => Promise<void>;
	onBulkReschedule: (activityIds: string[], newDate: Date) => Promise<void>;
	onBulkShiftDays: (activityIds: string[], days: number) => Promise<void>;
	onBulkUpdateStatus: (
		activityIds: string[],
		status: ScheduledActivityStatus,
	) => Promise<void>;
	onUndo?: () => void;
	canUndo?: boolean;
}

type RescheduleMode = 'specific' | 'shift';

export default function BulkActionToolbar({
	selectedActivities,
	onSelectionChange,
	onBulkDelete,
	onBulkReschedule,
	onBulkShiftDays,
	onBulkUpdateStatus,
	onUndo,
	canUndo = false,
}: BulkActionToolbarProps) {
	const { t } = useTypedTranslation();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showRescheduleModal, setShowRescheduleModal] = useState(false);
	const [showProgress, setShowProgress] = useState(false);
	const [progressPercent, setProgressPercent] = useState(0);
	const [progressMessage, setProgressMessage] = useState('');
	const [rescheduleMode, setRescheduleMode] =
		useState<RescheduleMode>('specific');
	const [rescheduleDate, setRescheduleDate] = useState<Dayjs | null>(dayjs());
	const [shiftDays, setShiftDays] = useState<number>(1);

	const selectedCount = selectedActivities.length;
	const hasSelection = selectedCount > 0;

	// Clear selection
	const handleClearSelection = () => {
		onSelectionChange([]);
	};

	// Bulk delete
	const handleDeleteClick = () => {
		setShowDeleteConfirm(true);
	};

	const handleConfirmDelete = async () => {
		setShowDeleteConfirm(false);
		setShowProgress(true);
		setProgressPercent(0);
		setProgressMessage('Deleting activities...');

		try {
			const activityIds = selectedActivities.map(a => a.id);

			// Simulate progress
			const total = activityIds.length;
			for (let i = 0; i <= total; i++) {
				setProgressPercent(Math.round((i / total) * 100));
				await new Promise(resolve => setTimeout(resolve, 100));
			}

			await onBulkDelete(activityIds);
			message.success(
				`${total} ${total === 1 ? 'activity' : 'activities'} deleted`,
			);
			handleClearSelection();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to delete activities';
			message.error(errorMessage);
		} finally {
			setShowProgress(false);
		}
	};

	// Bulk reschedule
	const handleRescheduleClick = () => {
		setShowRescheduleModal(true);
	};

	const handleConfirmReschedule = async () => {
		if (rescheduleMode === 'specific' && !rescheduleDate) {
			message.warning('Please select a date');
			return;
		}

		if (rescheduleMode === 'shift' && !shiftDays) {
			message.warning('Please specify number of days');
			return;
		}

		setShowRescheduleModal(false);
		setShowProgress(true);
		setProgressPercent(0);
		setProgressMessage('Rescheduling activities...');

		try {
			const activityIds = selectedActivities.map(a => a.id);
			const total = activityIds.length;

			// Simulate progress
			for (let i = 0; i <= total; i++) {
				setProgressPercent(Math.round((i / total) * 100));
				await new Promise(resolve => setTimeout(resolve, 100));
			}

			if (rescheduleMode === 'specific' && rescheduleDate) {
				await onBulkReschedule(activityIds, rescheduleDate.toDate());
				message.success(
					`${total} ${total === 1 ? 'activity' : 'activities'} rescheduled to ${rescheduleDate.format('MMM D, YYYY')}`,
				);
			} else {
				await onBulkShiftDays(activityIds, shiftDays);
				const direction = shiftDays > 0 ? 'forward' : 'backward';
				message.success(
					`${total} ${total === 1 ? 'activity' : 'activities'} shifted ${Math.abs(shiftDays)} ${Math.abs(shiftDays) === 1 ? 'day' : 'days'} ${direction}`,
				);
			}

			handleClearSelection();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to reschedule activities';
			message.error(errorMessage);
		} finally {
			setShowProgress(false);
		}
	};

	// Bulk status update
	const handleStatusUpdate = async (status: ScheduledActivityStatus) => {
		setShowProgress(true);
		setProgressPercent(0);
		setProgressMessage(`Marking activities as ${status.toLowerCase()}...`);

		try {
			const activityIds = selectedActivities.map(a => a.id);
			const total = activityIds.length;

			// Simulate progress
			for (let i = 0; i <= total; i++) {
				setProgressPercent(Math.round((i / total) * 100));
				await new Promise(resolve => setTimeout(resolve, 100));
			}

			await onBulkUpdateStatus(activityIds, status);
			message.success(
				`${total} ${total === 1 ? 'activity' : 'activities'} marked as ${status.toLowerCase()}`,
			);
			handleClearSelection();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update activities';
			message.error(errorMessage);
		} finally {
			setShowProgress(false);
		}
	};

	return (
		<>
			<div className="bulk-action-toolbar">
				<div className="bulk-action-toolbar__selection">
					{hasSelection ? (
						<Space size="small">
							<Checkbox checked={true} onChange={handleClearSelection} />
							<Text strong>
								{selectedCount} {t('Admin.data.bulkActions.selected')}
							</Text>
							<Button type="link" size="small" onClick={handleClearSelection}>
								{t('Admin.data.bulkActions.clear')}
							</Button>
						</Space>
					) : (
						<Space size="small">
							<UntitledIcon name="check" size={16} />
							<Text type="secondary">
								{t('Admin.data.bulkActions.selectActivities')}
							</Text>
						</Space>
					)}
				</div>

				{hasSelection && (
					<div className="bulk-action-toolbar__actions">
						<Space size="middle">
							<Button
								icon={<UntitledIcon name="calendar" size={16} />}
								onClick={handleRescheduleClick}
								disabled={!hasSelection}>
								{t('Admin.data.bulkActions.reschedule')}
							</Button>

							<Button
								icon={<UntitledIcon name="checkCircle" size={16} />}
								onClick={() =>
									handleStatusUpdate(ScheduledActivityStatus.COMPLETED)
								}
								disabled={!hasSelection}>
								{t('Admin.data.bulkActions.markComplete')}
							</Button>

							<Button
								icon={<UntitledIcon name="xCircle" size={16} />}
								onClick={() =>
									handleStatusUpdate(ScheduledActivityStatus.CANCELLED)
								}
								disabled={!hasSelection}>
								{t('Admin.data.bulkActions.cancel')}
							</Button>

							<Button
								icon={<UntitledIcon name="delete" size={16} />}
								danger
								onClick={handleDeleteClick}
								disabled={!hasSelection}>
								{t('Admin.data.bulkActions.delete')}
							</Button>

							{canUndo && onUndo && (
								<Button icon={<UntitledIcon name="undo" size={16} />} onClick={onUndo}>
									{t('Admin.data.bulkActions.undo')}
								</Button>
							)}
						</Space>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			<Modal
				title={t('Admin.data.bulkActions.confirmDeleteTitle')}
				open={showDeleteConfirm}
				onOk={handleConfirmDelete}
				onCancel={() => setShowDeleteConfirm(false)}
				okText={t('Admin.data.bulkActions.delete')}
				okButtonProps={{ danger: true }}>
				<Text>
					Are you sure you want to delete {selectedCount}{' '}
					{selectedCount === 1 ? 'activity' : 'activities'}? This action cannot
					be undone.
				</Text>
			</Modal>

			{/* Reschedule Modal */}
			<Modal
				title={t('Admin.data.bulkActions.bulkRescheduleTitle')}
				open={showRescheduleModal}
				onOk={handleConfirmReschedule}
				onCancel={() => setShowRescheduleModal(false)}
				okText={t('Admin.data.bulkActions.reschedule')}
				width={500}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					<Text>
						Reschedule {selectedCount}{' '}
						{selectedCount === 1 ? 'activity' : 'activities'}
					</Text>

					<Select
						value={rescheduleMode}
						onChange={setRescheduleMode}
						style={{ width: '100%' }}>
						<Select.Option value="specific">
							{t('Admin.data.bulkActions.rescheduleSpecificDate')}
						</Select.Option>
						<Select.Option value="shift">
							{t('Admin.data.bulkActions.rescheduleShiftDays')}
						</Select.Option>
					</Select>

					{rescheduleMode === 'specific' ? (
						<div>
							<Text strong>{t('Admin.data.bulkActions.newDate')}</Text>
							<DatePicker
								value={rescheduleDate}
								onChange={setRescheduleDate}
								style={{ width: '100%', marginTop: 8 }}
								format="MMM D, YYYY"
							/>
						</div>
					) : (
						<div>
							<Text strong>{t('Admin.data.bulkActions.shiftByDays')}</Text>
							<InputNumber
								value={shiftDays}
								onChange={value => setShiftDays(value || 0)}
								style={{ width: '100%', marginTop: 8 }}
								placeholder={t('Admin.data.bulkActions.shiftPlaceholder')}
							/>
							<Text
								type="secondary"
								style={{ fontSize: 'var(--font-size-xs)', marginTop: 4, display: 'block' }}>
								Positive numbers shift forward, negative numbers shift backward
							</Text>
						</div>
					)}

					<Divider style={{ margin: 0 }} />

					<div>
						<Text strong>{t('Admin.data.bulkActions.preview')}</Text>
						<div style={{ marginTop: 8 }}>
							{selectedActivities.slice(0, 3).map(activity => {
								let newDate: Date;
								if (rescheduleMode === 'specific') {
									newDate = rescheduleDate?.toDate() || new Date();
								} else {
									newDate = addDays(new Date(activity.scheduledFor), shiftDays);
								}

								return (
									<div key={activity.id} style={{ marginBottom: 8 }}>
										<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
											{activity.title}
										</Text>
										<br />
										<Text style={{ fontSize: 'var(--font-size-xs)' }}>
											{format(new Date(activity.scheduledFor), 'MMM d, yyyy')} →{' '}
											{format(newDate, 'MMM d, yyyy')}
										</Text>
									</div>
								);
							})}
							{selectedActivities.length > 3 && (
								<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
									...and {selectedActivities.length - 3} more
								</Text>
							)}
						</div>
					</div>
				</Space>
			</Modal>

			{/* Progress Modal */}
			<Modal
				title={t('Admin.data.bulkActions.processingTitle')}
				open={showProgress}
				footer={null}
				closable={false}
				maskClosable={false}>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Text>{progressMessage}</Text>
					<Progress percent={progressPercent} status="active" />
				</Space>
			</Modal>
		</>
	);
}
