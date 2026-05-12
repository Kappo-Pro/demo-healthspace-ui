/**
 * BulkUploadModal - Modal wrapper for bulk ROM image upload
 *
 * Provides a modal interface for uploading multiple ROM images for a specific user.
 * Includes user header with avatar, name, and demographics.
 */

import { TriageUserHeader } from '@organisms/TriageResultModal/TriageUserHeader';
import { BulkUpload } from '@pages/StartScan/BulkUpload';
import { AdminDashboardPatient, UserWithSession } from '@types';
import { Modal } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './BulkUploadModal.module.css';

export interface BulkUploadModalProps {
	/** Whether the modal is open */
	open: boolean;
	/** Callback when modal is closed */
	onClose: () => void;
	/** The user ID to upload images for */
	userId: string;
	/** User data for displaying header info */
	userData: AdminDashboardPatient | UserWithSession;
	/** Callback when modal is fully closed (animation finished) */
	afterClose?: () => void;
	/** Optional callback after successful upload */
	onSuccess?: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
	open,
	onClose,
	afterClose,
	userId,
	userData,
	onSuccess,
}) => {
	const { t } = useTranslation();

	// Normalize userData to UserWithSession format for TriageUserHeader
	const normalizedUser: UserWithSession = {
		id: userId,
		profile: userData.profile,
		// Include any additional fields if available
		...('physiotherapistPatientAssociationPatientIdRelation' in userData && {
			physiotherapistPatientAssociationPatientIdRelation:
				userData.physiotherapistPatientAssociationPatientIdRelation,
		}),
	} as UserWithSession;

	const handleSuccess = () => {
		onSuccess?.();
		onClose();
	};

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			width={640}
			centered
			destroyOnClose
			afterClose={afterClose}
			className={styles.bulkUploadModal}
			title={t(
				'Patient.data.vitalscan-rom.bulkUpload.modalTitle',
				'Quick Upload ROM Images',
			)}>
			<div className={styles.content}>
				{/* User Header */}
				<TriageUserHeader user={normalizedUser} />

				{/* Upload Content */}
				<div className={styles.uploadSection}>
					<BulkUpload
						userId={userId}
						onSuccess={handleSuccess}
						showCard={false}
						shouldNavigate={true}
					/>
				</div>
			</div>
		</Modal>
	);
};

export default BulkUploadModal;
