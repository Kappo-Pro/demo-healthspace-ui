/**
 * EditContentModal Component
 *
 * Modal for editing content cards (title, description, image)
 * with WYSIWYG editor and image upload functionality
 *
 * Features:
 * - Title input field
 * - WYSIWYG text editor for description (ReactQuill)
 * - Image upload with preview
 * - Form validation
 */

import { UntitledIcon } from '@atoms/Icon';
import { ResponsiveImage } from '@atoms/ResponsiveImage';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import type { UploadFile, UploadProps } from 'antd';
import {
	Flex,
	Form,
	Input,
	Modal,
	Spin,
	Typography,
	Upload,
	message,
} from 'antd';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import './style.css';

// Lazy load ReactQuill to reduce bundle size
const ReactQuill = lazy(() => import('react-quill'));

const { Text } = Typography;

// ReactQuill toolbar configuration
const toolbarOptions = [
	[{ font: [] }],
	[{ size: ['small', false, 'large', 'huge'] }],
	['bold', 'italic', 'underline', 'strike'],
	[{ color: [] }, { background: [] }],
	[{ align: [] }],
	[{ list: 'ordered' }, { list: 'bullet' }],
	['blockquote', 'link'],
	['clean'],
];

export interface EditContentModalProps {
	open: boolean;
	title: string;
	initialValues?: {
		title: string;
		description: string;
		thumbnail?: string;
	};
	onSave: (values: {
		title: string;
		description: string;
		imageFile?: File;
		thumbnail?: string;
	}) => void;
	onCancel: () => void;
	loading?: boolean;
}

export const EditContentModal: React.FC<EditContentModalProps> = ({
	open,
	title,
	initialValues,
	onSave,
	onCancel,
	loading = false,
}) => {
	const { t } = useTypedTranslation();
	const [form] = Form.useForm();

	// State for WYSIWYG content
	const [description, setDescription] = useState<string>('');

	// State for image upload
	const [imageFile, setImageFile] = useState<File | undefined>();
	const [imagePreview, setImagePreview] = useState<string | undefined>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	// Initialize form values
	useEffect(() => {
		if (open && initialValues) {
			form.setFieldsValue({
				title: initialValues.title,
			});
			setDescription(initialValues.description || '');
			setImagePreview(initialValues.thumbnail);
			setFileList([]);
			setImageFile(undefined);
		}
	}, [open, initialValues, form]);

	// Handle form submission
	const handleOk = async () => {
		try {
			const values = await form.validateFields();

			// Validate thumbnail
			if (!imagePreview && !imageFile) {
				message.error(
					t(
						'admin.settings.contentLibraryTab.conditions.modal.thumbnailRequired',
					) || 'Thumbnail is required',
				);
				return;
			}

			// Validate description
			if (!description || description.trim().length === 0) {
				message.error(
					t(
						'admin.settings.contentLibraryTab.conditions.modal.descriptionRequired',
					) || 'Description is required',
				);
				return;
			}

			onSave({
				title: values.title,
				description: description,
				imageFile: imageFile,
				thumbnail: imagePreview,
			});
		} catch (err) {
			console.error('[EditContentModal] Form validation error:', err);
		}
	};

	// Handle modal cancel
	const handleCancel = () => {
		form.resetFields();
		setDescription('');
		setImageFile(undefined);
		setImagePreview(undefined);
		setFileList([]);
		onCancel();
	};

	// Image upload configuration
	const uploadProps: UploadProps = {
		beforeUpload: file => {
			// Validate file type
			const isImage = file.type.startsWith('image/');
			if (!isImage) {
				message.error(
					t(
						'admin.settings.contentLibraryTab.conditions.modal.imageTypeError',
					) || 'You can only upload image files!',
				);
				return Upload.LIST_IGNORE;
			}

			// Validate file size (max 5MB)
			const isLt5M = file.size / 1024 / 1024 < 5;
			if (!isLt5M) {
				message.error(
					t(
						'admin.settings.contentLibraryTab.conditions.modal.imageSizeError',
					) || 'Image must be smaller than 5MB!',
				);
				return Upload.LIST_IGNORE;
			}

			// Create preview
			const reader = new FileReader();
			reader.onload = e => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);

			// Store file
			setImageFile(file);
			setFileList([file as unknown as UploadFile]);

			// Prevent auto upload
			return false;
		},
		onRemove: () => {
			setImageFile(undefined);
			setImagePreview(initialValues?.thumbnail);
			setFileList([]);
		},
		fileList: fileList,
		maxCount: 1,
		accept: 'image/*',
		listType: 'picture-card',
	};

	return (
		<Modal
			title={title}
			open={open}
			onOk={handleOk}
			onCancel={handleCancel}
			okText={
				t('Admin.settings.contentLibraryTab.conditions.modal.saveButton') ||
				'Save'
			}
			cancelText={
				t('Admin.settings.contentLibraryTab.conditions.modal.cancelButton') ||
				'Cancel'
			}
			width={800}
			confirmLoading={loading}
			style={{ top: 0 }}>
			<Form
				form={form}
				layout="vertical"
				style={{ marginTop: 'var(--spacing-4)' }}>
				{/* Title Input */}
				<Form.Item
					label={
						t('admin.settings.contentLibraryTab.conditions.modal.titleLabel') ||
						'Title'
					}
					name="title"
					rules={[
						{
							required: true,
							message:
								t(
									'admin.settings.contentLibraryTab.conditions.modal.titleRequired',
								) || 'Please enter a title',
						},
						{
							min: 3,
							message:
								t(
									'admin.settings.contentLibraryTab.conditions.modal.titleMinLength',
								) || 'Title must be at least 3 characters',
						},
					]}>
					<Input
						placeholder={
							t(
								'admin.settings.contentLibraryTab.conditions.modal.titlePlaceholder',
							) || 'Enter title'
						}
						size="large"
					/>
				</Form.Item>

				{/* Thumbnail Upload */}
				<Form.Item
					label={
						t(
							'admin.settings.contentLibraryTab.conditions.modal.thumbnailLabel',
						) || 'Thumbnail'
					}
					required>
					<Upload {...uploadProps} showUploadList={false}>
						<div
							style={{
								borderRadius: 'var(--radius-md)',
								overflow: 'hidden',
								border: '1px solid var(--border-color)',
								cursor: 'pointer',
								backgroundColor: 'var(--surface-secondary)',
								height: '100%',
							}}
							className="image-upload-container">
							{imagePreview ? (
								<div
									style={{
										position: 'relative',
										width: '100%',
										height: '100%',
									}}>
									<ResponsiveImage
										src={imagePreview}
										alt="Thumbnail"
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
										}}
									/>
									<div
										className="image-upload-overlay"
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											backgroundColor: 'var(--overlay-default)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											opacity: 0,
											transition: 'opacity 0.3s ease',
											pointerEvents: 'none',
										}}>
										<span
											style={{
												color: 'var(--color-white)',
												fontWeight: 'var(--font-weight-semibold)',
											}}>
											{t(
												'admin.settings.contentLibraryTab.conditions.modal.changeImage',
											) || 'Change Image'}
										</span>
									</div>
								</div>
							) : (
								<Flex
									vertical
									align="center"
									justify="center"
									style={{ height: '100%' }}
									gap={8}>
									<UntitledIcon
										name="upload"
										size="large"
										color="var(--text-secondary)"
									/>
									<Text type="secondary">
										{t(
											'admin.settings.contentLibraryTab.conditions.modal.uploadText',
										) || 'Click to upload'}
									</Text>
								</Flex>
							)}
						</div>
					</Upload>
				</Form.Item>

				{/* WYSIWYG Description Editor */}
				<Form.Item
					label={
						t(
							'admin.settings.contentLibraryTab.conditions.modal.descriptionLabel',
						) || 'Description'
					}
					required>
					<Suspense
						fallback={
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									minHeight: '200px',
								}}>
								<Spin size="large" />
							</div>
						}>
						<ReactQuill
							modules={{ toolbar: toolbarOptions }}
							theme="snow"
							value={description}
							onChange={setDescription}
							style={{ marginTop: 'var(--spacing-2-5)' }}
							className="custom-quill"
							placeholder={
								t(
									'admin.settings.contentLibraryTab.conditions.modal.descriptionPlaceholder',
								) || 'Enter description...'
							}
						/>
					</Suspense>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default EditContentModal;
