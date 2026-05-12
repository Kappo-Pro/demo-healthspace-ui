/**
 * Bulk Status Update Modal
 *
 * Allows admins to update status for multiple patients at once.
 * Includes confirmation modal and optimistic update with rollback.
 *
 * Story 3.3: Bulk Operations for Workflow Efficiency (FR13)
 * @module components/organisms/OAdminTriageDashboard/BulkStatusUpdateModal
 */

import React, { useState } from 'react';
import { Modal, Select, Alert, Typography } from 'antd';
import type { PostureStatus } from '@types/posture';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

const { Text } = Typography;

interface BulkStatusUpdateModalProps {
	visible: boolean;
	selectedCount: number;
	onConfirm: (status: PostureStatus) => Promise<void>;
	onCancel: () => void;
	loading?: boolean;
}

export const BulkStatusUpdateModal: React.FC<BulkStatusUpdateModalProps> = ({
	visible,
	selectedCount,
	onConfirm,
	onCancel,
	loading = false,
}) => {
	const { t } = useTypedTranslation();
	const [selectedStatus, setSelectedStatus] = useState<PostureStatus | null>(
		null,
	);

	const STATUS_OPTIONS: Array<{ value: PostureStatus; label: string }> = [
		{ value: 'excellent', label: t('Admin.data.triage.status.excellent') },
		{ value: 'good', label: t('Admin.data.triage.status.good') },
		{ value: 'fair', label: t('Admin.data.triage.status.fair') },
		{ value: 'poor', label: t('Admin.data.triage.status.poor') },
		{ value: 'critical', label: t('Admin.data.triage.status.critical') },
	];

	const handleConfirm = async () => {
		if (!selectedStatus) return;
		await onConfirm(selectedStatus);
		setSelectedStatus(null);
	};

	const handleCancel = () => {
		setSelectedStatus(null);
		onCancel();
	};

	return (
		<Modal
			title={t('Admin.data.triage.bulkOperations.updateStatus.title')}
			open={visible}
			onOk={handleConfirm}
			onCancel={handleCancel}
			okText={t('Admin.data.triage.bulkOperations.updateStatus.button')}
			cancelText={t('Admin.data.triage.bulkOperations.common.cancel')}
			confirmLoading={loading}
			okButtonProps={{ disabled: !selectedStatus }}
			destroyOnClose>
			<Alert
				message={t('Admin.data.triage.bulkOperations.updateStatus.confirmMessage', {
					count: selectedCount,
				})}
				type="info"
				showIcon
				style={{ marginBottom: 16 }}
			/>

			<div style={{ marginBottom: 8 }}>
				<Text strong>{t('Admin.data.triage.bulkOperations.updateStatus.label')}</Text>
			</div>
			<Select
				style={{ width: '100%' }}
				placeholder={t('Admin.data.triage.bulkOperations.updateStatus.placeholder')}
				value={selectedStatus}
				onChange={setSelectedStatus}
				options={STATUS_OPTIONS}
				aria-label={t('Admin.data.triage.bulkOperations.updateStatus.ariaLabel')}
			/>

			<Alert
				message={t('Admin.data.triage.bulkOperations.updateStatus.undoWarning')}
				type="warning"
				showIcon
				style={{ marginTop: 16 }}
			/>
		</Modal>
	);
};

BulkStatusUpdateModal.displayName = 'BulkStatusUpdateModal';

export default BulkStatusUpdateModal;
