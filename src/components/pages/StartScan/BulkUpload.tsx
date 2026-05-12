'use client';

import { UntitledIcon } from '@atoms/Icon';
import { router } from '@routers/routers';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { uploadPoseEstimation } from '@stores/scan/poseEstimation';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { Button, Checkbox, Image, Input, message, Space, Tag, Upload } from 'antd';
import type { InputRef } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Dragger } = Upload;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export interface BulkUploadProps {
	/** Explicit userId - if not provided, falls back to Redux state */
	userId?: string;
	/** Callback after successful upload */
	onSuccess?: () => void;
	/** Whether to show the card wrapper (default: true for standalone, false in modal) */
	showCard?: boolean;
	/** Whether to navigate after upload (default: true) */
	shouldNavigate?: boolean;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({
	userId: propUserId,
	onSuccess,
	showCard = true,
	shouldNavigate = true,
}) => {
	const { t } = useTranslation();
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState('');
	const [closeAfterUpload, setCloseAfterUpload] = useState(true);
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const titleInputRef = useRef<InputRef>(null);

	// Auto-focus title input when component mounts (modal opens)
	useEffect(() => {
		if (!showCard) {
			// Small delay to ensure modal animation completes
			const timer = setTimeout(() => {
				titleInputRef.current?.focus();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [showCard]);

	// Use prop userId if provided, otherwise fall back to Redux logic
	const reduxUserId = user?.isPhysioterapist ? selectedUser?.id : user?.id;
	const userId = propUserId || reduxUserId;

	const handlePreview = async (file: UploadFile) => {
		if (!file.url && !file.preview) {
			const reader = new FileReader();
			reader.readAsDataURL(file.originFileObj as FileType);
			reader.onload = () => setPreviewImage(reader.result as string);
		} else {
			setPreviewImage(file.url || (file.preview as string));
		}
		setPreviewOpen(true);
	};

	const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
		setFileList(newFileList);
	};

	const handleBeforeUpload = (file: FileType) => {
		const isAllowedType = ['image/png', 'image/jpeg', 'image/jpg'].includes(
			file.type,
		);
		if (!isAllowedType) {
			message.error('Only PNG, JPEG, and JPG formats are allowed.');
			return Upload.LIST_IGNORE;
		}
		if (file.size / 1024 / 1024 > 4) {
			message.error('Each image must be smaller than 4MB.');
			return Upload.LIST_IGNORE;
		}
		return true;
	};

	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleSave = async () => {
	if (!userId) {
		message.error(
			t('Patient.data.vitalscan-rom.bulkUpload.errors.noUserId', 'User ID is not available.')
		);
		return;
	}

	if (fileList.length === 0) {
		message.error(
			t('Patient.data.vitalscan-rom.bulkUpload.errors.noFiles', 'Please upload at least one image.')
		);
		return;
	}

	const formData = new FormData();
	formData.append('userId', userId);
	formData.append('title', title);

	fileList.forEach(file => {
		if (file.originFileObj) {
			formData.append('images', file.originFileObj);
		}
	});

	try {
		setLoading(true);

		const response = await dispatch(uploadPoseEstimation(formData)).unwrap();

		if (response.status === 201) {
			setFileList([]);
			setTitle('');

			// optional callback
			if (onSuccess && closeAfterUpload) {
				onSuccess();
			}

			// ⏳ SIMPLE WAIT before navigating
			if (shouldNavigate && closeAfterUpload) {
				message.info(
					t(
						'Patient.data.vitalscan-rom.bulkUpload.processing',
						'Processing images. Please wait...'
					)
				);

				await delay(3000); // ⏱ wait 3 seconds (adjust if needed)
				message.success(response.data.message);

				navigate(`/${userId}${router.AIASSISTANT_ROM_SUMMARY}`, {
					state: { fromBulkUpload: true },
				});
			}
		} else {
			message.warning(
				t(
					'Patient.data.vitalscan-rom.bulkUpload.errors.unexpected',
					'Unexpected response received.'
				)
			);
		}
	} catch (error) {
		console.error('Upload failed:', error);
		message.error(
			t('Patient.data.vitalscan-rom.bulkUpload.errors.failed', 'Upload failed. Please try again.')
		);
	} finally {
		setLoading(false);
	}
};


	const content = (
		<Space direction="vertical" style={{ width: '100%' }} size="large">
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					marginBottom: 'calc(-1 * var(--spacing-2))',
				}}>
				<Tag>BETA RELEASE (V1.0)</Tag>
			</div>
			<Input
				ref={titleInputRef}
				placeholder={t('Patient.data.vitalscan-rom.bulkUpload.titlePlaceholder', 'Enter Title')}
				value={title}
				onChange={e => setTitle(e.target.value)}
				maxLength={100}
				style={{
					width: '100%',
					height: 45,
					borderRadius: 8,
				}}
			/>

			<Dragger
				multiple
				className="bulk-upload"
				listType="picture-card"
				fileList={fileList}
				onPreview={handlePreview}
				onChange={handleChange}
				beforeUpload={handleBeforeUpload}
				customRequest={({ onSuccess: onUploadSuccess }) =>
					setTimeout(() => onUploadSuccess && onUploadSuccess('ok'), 0)
				}
				style={{
					padding: 20,
					borderRadius: 12,
				}}>
				<p className="ant-upload-drag-icon">
					<UntitledIcon
						name="upload"
						style={{ color: 'var(--button-color-primary)' }}
						size={36}
					/>
				</p>
				<p className="ant-upload-text">
					{t('Patient.data.vitalscan-rom.bulkUpload.dragText', 'Click or drag files to upload')}
				</p>
				<p className="ant-upload-hint">
					{t('Patient.data.vitalscan-rom.bulkUpload.hint', 'Hover on an image to preview or delete it.')}
				</p>
			</Dragger>

			{!showCard && (
				<Checkbox
					checked={closeAfterUpload}
					onChange={e => setCloseAfterUpload(e.target.checked)}
				>
					{t('Patient.data.vitalscan-rom.bulkUpload.closeAfterUpload', 'Close after upload')}
				</Checkbox>
			)}

			<Button
				type="primary"
				icon={<UntitledIcon name="upload" size={16} />}
				size="large"
				block
				loading={loading}
				onClick={handleSave}
				disabled={!userId || fileList.length === 0 || title.trim() === ''}>
				{loading
					? t('Patient.data.vitalscan-rom.bulkUpload.uploading', 'Uploading...')
					: t('Patient.data.vitalscan-rom.bulkUpload.saveButton', 'Save All Images')}
			</Button>
		</Space>
	);

	return (
		<>
			{showCard ? (
				<div
					style={{
						maxWidth: '70%',
						margin: 'var(--spacing-10) auto',
						padding: 'var(--spacing-6)',
						borderRadius: 'var(--radius-lg)',
						boxShadow: 'var(--shadow-sm)',
						border: '1px solid var(--border-color)',
						backgroundColor: 'var(--bg-primary)',
					}}>
					{content}
				</div>
			) : (
				content
			)}

			{previewImage && (
				<Image
					wrapperStyle={{ display: 'none' }}
					preview={{
						visible: previewOpen,
						onVisibleChange: visible => setPreviewOpen(visible),
						afterOpenChange: visible => !visible && setPreviewImage(''),
					}}
					src={previewImage}
				/>
			)}
		</>
	);
};

export default BulkUpload;
