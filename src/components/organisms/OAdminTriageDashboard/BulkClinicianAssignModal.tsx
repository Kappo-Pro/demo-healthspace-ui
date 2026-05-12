/**
 * Bulk Clinician Assignment Modal
 *
 * Allows admins to assign a clinician to multiple patients at once.
 * Includes option to send notification emails.
 *
 * Story 3.3: Bulk Operations for Workflow Efficiency (FR13)
 * @module components/organisms/OAdminTriageDashboard/BulkClinicianAssignModal
 */

import React, { useState, useEffect } from 'react';
import { Modal, Select, Checkbox, Alert, Typography, Spin } from 'antd';
import axios from 'axios';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

const { Text } = Typography;

interface Clinician {
	id: string;
	name: string;
	email: string;
	specialty?: string;
}

interface BulkClinicianAssignModalProps {
	visible: boolean;
	selectedCount: number;
	onConfirm: (
		clinicianId: string,
		clinicianName: string,
		sendNotification: boolean,
	) => Promise<void>;
	onCancel: () => void;
	loading?: boolean;
}

export const BulkClinicianAssignModal: React.FC<
	BulkClinicianAssignModalProps
> = ({ visible, selectedCount, onConfirm, onCancel, loading = false }) => {
	const { t } = useTypedTranslation();
	const [clinicians, setClinicians] = useState<Clinician[]>([]);
	const [fetchingClinicians, setFetchingClinicians] = useState(false);
	const [selectedClinicianId, setSelectedClinicianId] = useState<string | null>(
		null,
	);
	const [sendNotification, setSendNotification] = useState(true);

	useEffect(() => {
		if (visible) {
			fetchClinicians();
		}
	}, [visible]);

	const fetchClinicians = async () => {
		setFetchingClinicians(true);
		try {
			const { data } = await axios.get<{ clinicians: Clinician[] }>(
				'/team/clinicians',
			);
			setClinicians(data.clinicians);
		} catch (error) {
			// Intentionally silent - error is handled by showing empty list
			console.error('Failed to fetch clinicians:', error);
		} finally {
			setFetchingClinicians(false);
		}
	};

	const handleConfirm = async () => {
		if (!selectedClinicianId) return;
		const clinician = clinicians.find(c => c.id === selectedClinicianId);
		if (!clinician) return;

		await onConfirm(clinician.id, clinician.name, sendNotification);
		setSelectedClinicianId(null);
		setSendNotification(true);
	};

	const handleCancel = () => {
		setSelectedClinicianId(null);
		setSendNotification(true);
		onCancel();
	};

	return (
		<Modal
			title={t('Admin.data.triage.bulkOperations.assignClinician.title')}
			open={visible}
			onOk={handleConfirm}
			onCancel={handleCancel}
			okText={t('Admin.data.triage.bulkOperations.assignClinician.button')}
			cancelText={t('Admin.data.triage.bulkOperations.common.cancel')}
			confirmLoading={loading}
			okButtonProps={{ disabled: !selectedClinicianId }}
			destroyOnClose>
			<Alert
				message={t(
					'Admin.data.triage.bulkOperations.assignClinician.confirmMessage',
					{
						count: selectedCount,
					},
				)}
				type="info"
				showIcon
				style={{ marginBottom: 16 }}
			/>

			<div style={{ marginBottom: 8 }}>
				<Text strong>
					{t('Admin.data.triage.bulkOperations.assignClinician.label')}
				</Text>
			</div>
			<Spin spinning={fetchingClinicians}>
				<Select
					style={{ width: '100%', marginBottom: 16 }}
					placeholder={t(
						'Admin.data.triage.bulkOperations.assignClinician.placeholder',
					)}
					value={selectedClinicianId}
					onChange={setSelectedClinicianId}
					showSearch
					optionFilterProp="label"
					aria-label={t(
						'Admin.data.triage.bulkOperations.assignClinician.ariaLabel',
					)}
					options={clinicians.map(c => ({
						value: c.id,
						label: c.specialty ? `${c.name} (${c.specialty})` : c.name,
					}))}
				/>
			</Spin>

			<Checkbox
				checked={sendNotification}
				onChange={e => setSendNotification(e.target.checked)}>
				{t('Admin.data.triage.bulkOperations.assignClinician.sendNotification')}
			</Checkbox>

			<Alert
				message={t(
					'Admin.data.triage.bulkOperations.assignClinician.undoWarning',
				)}
				type="warning"
				showIcon
				style={{ marginTop: 16 }}
			/>
		</Modal>
	);
};

BulkClinicianAssignModal.displayName = 'BulkClinicianAssignModal';

export default BulkClinicianAssignModal;
