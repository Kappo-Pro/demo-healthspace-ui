/**
 * ConditionsSubTab Component
 *
 * Epic 3 - Story 3.3: Content Library - Pre-existing Conditions Management
 *
 * Features:
 * - Single image card display for pre-existing conditions content (always visible)
 * - Click to edit modal with WYSIWYG editor
 * - Image upload functionality
 * - Manual save with unsaved changes detection
 * - No "Add Content" button - card is always present with default content
 */

import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { ContentImageCard } from '@molecules/ContentImageCard';
import { SettingCard } from '@molecules/SettingCard';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { selectContentLibraryTabData } from '@stores/settings/selectors';
import {
	fetchConditions,
	updateContentLibrary,
} from '@stores/settings/settingsSlice';
import { PreExistingConditions } from '@types';
import { Col, Flex, Row, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { CONTENT_MANAGER_MOCK_DATA } from '../../pages/contentManagerMockData';
import EditContentModal from './EditContentModal';

/**
 * Default content for pre-existing conditions card
 * Used when no content exists in the database
 */
const DEFAULT_CONTENT: PreExistingConditions =
	CONTENT_MANAGER_MOCK_DATA.preExistingConditions;

/**
 * ConditionsSubTab component for managing pre-existing conditions content card
 *
 * Displays a single editable card with:
 * - Title
 * - Description (HTML content via WYSIWYG)
 * - Thumbnail image
 * - Always shows one card (uses default content if none exists)
 */
export const ConditionsSubTab: React.FC = () => {
	const { t } = useTypedTranslation();
	const dispatch = useTypedDispatch();

	// Get content library data from Redux
	const {
		preExistingConditions: serverContent,
		loading,
		error,
	} = useTypedSelector(selectContentLibraryTabData);

	// Get loaded state (Story: Content Library Lazy Loading)
	const conditionsLoaded = useTypedSelector(
		state => state.settings.content._conditionsLoaded,
	);

	// Local state for editing - initialized with default content
	const [localContent, setLocalContent] =
		useState<PreExistingConditions>(DEFAULT_CONTENT);
	const [isModalVisible, setIsModalVisible] = useState(false);

	// Fetch data on mount if not already loaded (Story: Content Library Lazy Loading)
	useEffect(() => {
		if (!conditionsLoaded) {
			dispatch(fetchConditions());
		}
	}, [dispatch, conditionsLoaded]);

	// Sync server data to local state, fallback to default content
	useEffect(() => {
		if (serverContent) {
			setLocalContent({
				id: serverContent.id,
				title: serverContent.title || DEFAULT_CONTENT.title,
				description: serverContent.description || DEFAULT_CONTENT.description,
				thumbnail: serverContent.thumbnail || DEFAULT_CONTENT.thumbnail,
				clientId: serverContent.clientId,
				createdAt: serverContent.createdAt,
				updatedAt: serverContent.updatedAt,
			});
		} else {
			// No server content, use default
			setLocalContent(DEFAULT_CONTENT);
		}
	}, [serverContent]);

	// Dirty tracking: Compare local state to server state (or default content)
	const isDirty = useMemo(() => {
		// If no server content, compare to default content
		const referenceContent = serverContent || DEFAULT_CONTENT;
		return (
			localContent.title !== referenceContent.title ||
			localContent.description !== referenceContent.description ||
			localContent.thumbnail !== referenceContent.thumbnail ||
			!!localContent.imageFile
		);
	}, [localContent, serverContent]);

	// Navigation blocker: Warn user when leaving with unsaved changes
	useUnsavedChanges({
		hasChanges: isDirty,
		message:
			'You have unsaved changes to pre-existing conditions. Are you sure you want to leave?',
	});

	/**
	 * Handle card click - open edit modal
	 */
	const handleCardClick = () => {
		setIsModalVisible(true);
	};

	/**
	 * Handle modal save
	 */
	const handleModalSave = (values: {
		title: string;
		description: string;
		imageFile?: File;
		thumbnail?: string;
	}) => {
		// Update local state
		setLocalContent({
			...localContent,
			title: values.title,
			description: values.description,
			thumbnail: values.thumbnail || localContent.thumbnail,
			imageFile: values.imageFile,
		});

		setIsModalVisible(false);

		// Pass values directly to handleSave to avoid state timing issues
		handleSave(values);
	};

	/**
	 * Handle modal cancel
	 */
	const handleModalCancel = () => {
		setIsModalVisible(false);
	};

	/**
	 * Handle save changes button click
	 * @param values - Optional values from modal (to avoid state timing issues)
	 */
	const handleSave = async (values?: {
		title: string;
		description: string;
		imageFile?: File;
		thumbnail?: string;
	}) => {
		try {
			// Use passed values if available, otherwise fall back to localContent
			const saveData = values || localContent;

			// Validate required fields
			if (!saveData.title || saveData.title.trim().length < 3) {
				message.error(
					t(
						'Admin.settings.contentLibraryTab.conditions.modal.titleMinLength',
					) || 'Title must be at least 3 characters',
				);
				return;
			}

			const formData = new FormData();

			formData.append('title', saveData.title);
			formData.append('description', saveData.description);

			// Only append image file if it exists
			if (saveData.imageFile) {
				formData.append('thumbnail', saveData.imageFile);
			}

			await dispatch(updateContentLibrary(formData)).unwrap();

			// Refetch data from server to get updated thumbnail URL
			await dispatch(fetchConditions());

			// Clear imageFile from local state to prevent dirty state
			setLocalContent(prev => ({ ...prev, imageFile: undefined }));

			message.success(
				t('Admin.settings.contentLibraryTab.conditions.saveSuccess') ||
					'Changes saved successfully',
			);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: t('Admin.settings.contentLibraryTab.conditions.saveError') ||
						'Failed to save changes';
			message.error(errorMessage);
			console.error('[ConditionsSubTab] Save failed:', err);
		}
	};

	return (
		<>
			<SettingCard
				label={
					t('Admin.settings.contentLibraryTab.conditions.label') ||
					'Pre-existing Conditions'
				}
				description={
					t('Admin.settings.contentLibraryTab.conditions.description') ||
					'Manage the pre-existing conditions content card shown during patient onboarding. Click the card to edit.'
				}
				loading={loading}
				error={error || undefined}>
				<Flex vertical gap={16}>
					{/* Content Card - Always Visible */}
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8} lg={6}>
							<ContentImageCard
								title={localContent.title}
								description={localContent.description}
								thumbnail={localContent.thumbnail}
								onClick={handleCardClick}
								loading={loading}
							/>
						</Col>
					</Row>
				</Flex>
			</SettingCard>

			{/* Edit Modal */}
			<EditContentModal
				open={isModalVisible}
				title={
					t('Admin.settings.contentLibraryTab.conditions.modal.editTitle') ||
					'Edit Pre-existing Conditions'
				}
				initialValues={{
					title: localContent.title,
					description: localContent.description,
					thumbnail: localContent.thumbnail,
				}}
				onSave={handleModalSave}
				onCancel={handleModalCancel}
				loading={loading}
			/>
		</>
	);
};
