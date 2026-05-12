/**
 * PlansSubTab Component
 *
 * Epic 3 - Story 3.3: Content Library - Plans Management
 *
 * Features:
 * - CRUD operations for service plans
 * - Table layout with edit/delete actions
 * - Modal for create/edit plan
 * - Manual save with unsaved changes detection
 * - Form validation
 */

import { ContentImageCard } from '@molecules/ContentImageCard';
import { SettingCard } from '@molecules/SettingCard';
import EditContentModal from '@pages/Settings/tabs/ContentLibrary/EditContentModal';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { selectContentLibraryTabData } from '@stores/settings/selectors';
import { fetchPlans } from '@stores/settings/settingsSlice';
import { postPlan } from '@stores/shared/settings/settings';
import { Plans } from '@types';
import { Col, Flex, Row, message } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { CONTENT_MANAGER_MOCK_DATA } from '../../pages/contentManagerMockData';
import './style.css';

/**
 * Build full image URL from relative or absolute path
 */
const getImageUrl = (thumbnail?: string): string => {
	if (!thumbnail) return '';
	// If already absolute URL, return as-is
	if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
		return thumbnail;
	}
	// If data URL (blob), return as-is
	if (thumbnail.startsWith('data:')) {
		return thumbnail;
	}
	// If path starts with /images/, it's from public folder (mock data)
	if (thumbnail.startsWith('/images/')) {
		return thumbnail;
	}
	// Prepend base URL for other relative paths (backend assets)
	const baseUrl = process.env.REACT_APP_ADMIN_HOST || '';
	return `${baseUrl}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
};

/**
 * PlansSubTab component for managing service plans content card
 *
 * Displays a single editable card with:
 * - Title
 * - Description (HTML content via WYSIWYG)
 * - Thumbnail image
 * - Always shows one card (uses default content if none exists)
 */
export const PlansSubTab: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	// Get content library data from Redux
	const {
		plans: serverPlans,
		loading,
		error,
	} = useTypedSelector(selectContentLibraryTabData);

	// Get loaded state (Story: Content Library Lazy Loading)
	const plansLoaded = useTypedSelector(
		state => state.settings.content._plansLoaded,
	);

	// Local state for CRUD operations
	const [localPlans, setLocalPlans] = useState<Plans[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);

	// Fetch data on mount if not already loaded (Story: Content Library Lazy Loading)
	useEffect(() => {
		if (!plansLoaded) {
			dispatch(fetchPlans());
		}
	}, [dispatch, plansLoaded]);

	// Sync server data to local state
	// Use mock data if server has no data
	useEffect(() => {
		if (
			!serverPlans ||
			(Array.isArray(serverPlans) && serverPlans.length === 0)
		) {
			// No data from server, use mock data
			setLocalPlans(CONTENT_MANAGER_MOCK_DATA.plans as Plans[]);
		} else {
			setLocalPlans(serverPlans as Plans[]);
		}
	}, [serverPlans]);

	// Get the plan being edited
	const currentPlan = useMemo((): Plans | null => {
		if (editingPlanIndex !== null && localPlans[editingPlanIndex]) {
			return localPlans[editingPlanIndex];
		}
		return null;
	}, [localPlans, editingPlanIndex]);

	// Dirty tracking: Compare local state to server state
	const isDirty = useMemo(() => {
		return JSON.stringify(localPlans) !== JSON.stringify(serverPlans);
	}, [localPlans, serverPlans]);

	// Navigation blocker: Warn user when leaving with unsaved changes
	useUnsavedChanges({
		hasChanges: isDirty,
		message:
			'You have unsaved changes to plans. Are you sure you want to leave?',
	});

	/**
	 * Handle card click - open edit modal
	 */
	const handleCardClick = (index: number) => {
		setEditingPlanIndex(index);
		setIsModalVisible(true);
	};

	/**
	 * Handle modal cancel
	 */
	const handleModalCancel = () => {
		setIsModalVisible(false);
		setEditingPlanIndex(null);
	};

	/**
	 * Handle save changes button click - saves specific plan
	 */
	const handleSave = async (planToSave: Plans) => {
		try {
			// Validate required fields
			if (!planToSave.title || planToSave.title.trim().length < 3) {
				message.error(
					t('Admin.settings.contentLibraryTab.plans.modal.titleMinLength') ||
						'Title must be at least 3 characters',
				);
				return;
			}

			// Prepare FormData for file upload
			const formData = new FormData();
			formData.append('title', planToSave.title);
			formData.append('description', planToSave.description);

			// Add planType if exists
			if (planToSave.planType) {
				formData.append('planType', planToSave.planType);
			}

			// Add image file if changed
			if (planToSave.imageFile) {
				formData.append('thumbnail', planToSave.imageFile);
			}

			// Call API endpoint
			await dispatch(postPlan(formData));

			message.success(
				t('Admin.settings.contentLibraryTab.plans.saveSuccess') ||
					'Changes saved successfully',
			);
		} catch (err) {
			const errorMessage = axios.isAxiosError(err)
				? err.response?.data?.message || 'Failed to save changes'
				: t('Admin.settings.contentLibraryTab.plans.saveError') ||
					'Failed to save changes';
			message.error(errorMessage);
			console.error('[PlansSubTab] Save failed:', err);
		}
	};

	/**
	 * Handle modal save - updates specific plan in array and saves to backend
	 */
	const handleModalSave = async (values: {
		title: string;
		description: string;
		imageFile?: File;
		thumbnail?: string;
	}) => {
		if (editingPlanIndex === null || !currentPlan) return;

		const updatedPlan: Plans = {
			...currentPlan,
			title: values.title,
			description: values.description,
			thumbnail: values.thumbnail || currentPlan.thumbnail,
			imageFile: values.imageFile,
		};

		// Save to backend first
		await handleSave(updatedPlan);

		// Update local state after successful save
		const updatedPlans = localPlans.map((plan, idx) =>
			idx === editingPlanIndex ? updatedPlan : plan,
		);
		setLocalPlans(updatedPlans);

		setIsModalVisible(false);
		setEditingPlanIndex(null);
	};

	return (
		<>
			<SettingCard
				label={t('Admin.settings.contentLibraryTab.plans.label')}
				description={t('Admin.settings.contentLibraryTab.plans.description')}
				loading={loading}
				error={error || undefined}>
				<Flex vertical gap={16}>
					{/* Content Cards - Display all plans */}
					<Row gutter={[16, 16]}>
						{localPlans.map((plan, index) => (
							<Col key={plan.id || index} xs={24} sm={12} md={8} lg={6}>
								<ContentImageCard
									title={plan.title}
									description={plan.description}
									thumbnail={getImageUrl(plan.thumbnail)}
									onClick={() => handleCardClick(index)}
									loading={loading}
								/>
							</Col>
						))}
					</Row>
				</Flex>
			</SettingCard>

			{/* Edit Modal */}
			{currentPlan && (
				<EditContentModal
					open={isModalVisible}
					title={
						t('Admin.settings.contentLibraryTab.plans.modal.editTitle') ||
						'Edit Service Plan'
					}
					initialValues={{
						title: currentPlan.title,
						description: currentPlan.description,
						thumbnail: currentPlan.thumbnail,
					}}
					onSave={handleModalSave}
					onCancel={handleModalCancel}
					loading={loading}
				/>
			)}
		</>
	);
};
