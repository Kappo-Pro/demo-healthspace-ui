/**
 * Bulk Export Modal
 *
 * Allows admins to export selected patient data to CSV or JSON.
 * Shows progress indicator for large exports.
 *
 * Story 3.3: Bulk Operations for Workflow Efficiency (FR13)
 * @module components/organisms/OAdminTriageDashboard/BulkExportModal
 */

import React, { useState } from 'react';
import { Modal, Radio, Alert, Typography, Progress, Space } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { ExportFormat } from '@stores/posture/postureAnalytics/bulkOperations';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

const { Text } = Typography;

interface BulkExportModalProps {
	visible: boolean;
	selectedCount: number;
	onConfirm: (format: ExportFormat) => Promise<void>;
	onCancel: () => void;
	loading?: boolean;
	progress?: number;
}

export const BulkExportModal: React.FC<BulkExportModalProps> = ({
	visible,
	selectedCount,
	onConfirm,
	onCancel,
	loading = false,
	progress = 0,
}) => {
	const { t } = useTypedTranslation();
	const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

	const handleConfirm = async () => {
		await onConfirm(selectedFormat);
		setSelectedFormat('csv');
	};

	const handleCancel = () => {
		if (!loading) {
			setSelectedFormat('csv');
			onCancel();
		}
	};

	return (
		<Modal
			title={t('Admin.data.triage.bulkOperations.export.title')}
			open={visible}
			onOk={handleConfirm}
			onCancel={handleCancel}
			okText={
				loading
					? t('Admin.data.triage.bulkOperations.export.buttonExporting')
					: t('Admin.data.triage.bulkOperations.export.button')
			}
			cancelText={t('Admin.data.triage.bulkOperations.common.cancel')}
			confirmLoading={loading}
			okButtonProps={{ disabled: loading }}
			cancelButtonProps={{ disabled: loading }}
			closable={!loading}
			maskClosable={!loading}
			destroyOnClose>
			<Alert
				message={t('Admin.data.triage.bulkOperations.export.confirmMessage', {
					count: selectedCount,
				})}
				type="info"
				showIcon
				style={{ marginBottom: 16 }}
			/>

			<div style={{ marginBottom: 8 }}>
				<Text strong>{t('Admin.data.triage.bulkOperations.export.formatLabel')}</Text>
			</div>
			<Radio.Group
				value={selectedFormat}
				onChange={e => setSelectedFormat(e.target.value)}
				style={{ marginBottom: 16 }}
				disabled={loading}>
				<Space direction="vertical">
					<Radio value="csv">
						<Space>
							<UntitledIcon name="fileText" size={16} />
							<span>{t('Admin.data.triage.bulkOperations.export.csvOption')}</span>
						</Space>
					</Radio>
					<Radio value="json">
						<Space>
							<UntitledIcon name="code" size={16} />
							<span>{t('Admin.data.triage.bulkOperations.export.jsonOption')}</span>
						</Space>
					</Radio>
				</Space>
			</Radio.Group>

			<Alert
				message={t('Admin.data.triage.bulkOperations.export.includesInfo')}
				type="info"
				style={{ marginBottom: 16 }}
			/>

			{loading && (
				<div style={{ marginTop: 16 }}>
					<Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
						{t('Admin.data.triage.bulkOperations.export.preparingExport')}
					</Text>
					<Progress percent={progress} status="active" />
				</div>
			)}
		</Modal>
	);
};

BulkExportModal.displayName = 'BulkExportModal';

export default BulkExportModal;
