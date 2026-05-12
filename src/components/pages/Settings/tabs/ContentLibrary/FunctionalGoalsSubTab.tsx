/**
 * FunctionalGoalsSubTab Component
 *
 * Epic 3 - Story 3.3: Content Library - Functional Goals Management
 *
 * Features:
 * - CRUD operations for functional rehabilitation goals
 * - List layout with cards
 * - Modal for create/edit goal
 * - Category-based organization
 * - Manual save with unsaved changes detection
 */

import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { ContentImageCard } from '@molecules/ContentImageCard';
import { SettingCard } from '@molecules/SettingCard';
import EditContentModal from '@pages/Settings/tabs/ContentLibrary/EditContentModal';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { selectContentLibraryTabData } from '@stores/settings/selectors';
import { fetchFunctionalGoals } from '@stores/settings/settingsSlice';
import { postFunctionalGoal } from '@stores/shared/settings/settings';
import { IFunctionalGoals } from '@types';
import { Col, Flex, Form, Input, Row, Select, Typography, message } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { CONTENT_MANAGER_MOCK_DATA } from '../../pages/contentManagerMockData';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Paragraph } = Typography;

type GoalCategory = 'mobility' | 'strength' | 'balance' | 'pain' | 'other';

interface GoalFormValues {
	title: string;
	description?: string;
	category: GoalCategory;
}

/**
 * Category configuration with colors and labels
 * Using Ant Design semantic color presets
 */
const CATEGORY_CONFIG: Record<GoalCategory, { label: string; color: string }> =
	{
		mobility: { label: 'Mobility', color: 'processing' },
		strength: { label: 'Strength', color: 'success' },
		balance: { label: 'Balance', color: 'geekblue' },
		pain: { label: 'Pain Management', color: 'error' },
		other: { label: 'Other', color: 'default' },
	};

/**
 * FunctionalGoalsSubTab component for managing rehabilitation goals
 *
 * Allows admins to:
 * - Create new functional goals
 * - Edit existing goals
 * - Delete goals (with confirmation)
 * - Organize goals by category
 */
export const FunctionalGoalsSubTab: React.FC = () => {
	const { t } = useTypedTranslation();
	const [form] = Form.useForm<GoalFormValues>();
	const dispatch = useTypedDispatch();

	// Get content library data from Redux
	const {
		functionalGoals: serverGoals,
		loading,
		error,
	} = useTypedSelector(selectContentLibraryTabData);

	// Get loaded state (Story: Content Library Lazy Loading)
	const goalsLoaded = useTypedSelector(
		state => state.settings.content._goalsLoaded,
	);

	// Local state for CRUD operations
	const [localGoals, setLocalGoals] = useState<IFunctionalGoals[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingGoal, setEditingGoal] = useState<IFunctionalGoals | null>(null);

	// Fetch data on mount if not already loaded (Story: Content Library Lazy Loading)
	useEffect(() => {
		if (!goalsLoaded) {
			dispatch(fetchFunctionalGoals());
		}
	}, [dispatch, goalsLoaded]);

	// Sync server data to local state
	// Use mock data if server has no data
	useEffect(() => {
		if (!serverGoals || (Array.isArray(serverGoals) && serverGoals.length === 0)) {
			// No data from server, use mock data
			setLocalGoals(CONTENT_MANAGER_MOCK_DATA.goals as IFunctionalGoals[]);
		} else {
			// Filter out any undefined/null items and ensure category exists
			const validGoals = (serverGoals as IFunctionalGoals[])
				.filter(Boolean)
				.map(goal => ({
					...goal,
					// Ensure category exists, default to 'other' if missing
					category:
						(goal as unknown as { category?: GoalCategory }).category || 'other',
				})) as IFunctionalGoals[];
			setLocalGoals(validGoals);
		}
	}, [serverGoals]);

	// Dirty tracking: Compare local state to server state
	const isDirty = useMemo(() => {
		return JSON.stringify(localGoals) !== JSON.stringify(serverGoals);
	}, [localGoals, serverGoals]);

	// Navigation blocker: Warn user when leaving with unsaved changes
	useUnsavedChanges({
		hasChanges: isDirty,
		message:
			'You have unsaved changes to functional goals. Are you sure you want to leave?',
	});

	/**
	 * Handle create goal button click
	 */
	const handleCreate = () => {
		setEditingGoal(null);
		form.resetFields();
		setIsModalVisible(true);
	};

	/**
	 * Handle edit goal button click
	 */
	const handleEdit = (goal: IFunctionalGoals) => {
		setEditingGoal(goal);
		form.setFieldsValue({
			title: goal.title,
			description: goal.description,
			category:
				(goal as unknown as { category?: GoalCategory }).category || 'other',
		});
		setIsModalVisible(true);
	};

	/**
	 * Handle delete goal
	 */
	const handleDelete = (goalId: string) => {
		setLocalGoals(prev => prev.filter(g => g.id !== goalId));
		message.success(t('Admin.settings.contentLibraryTab.goals.deleteSuccess'));
	};

	/**
	 * Handle modal OK (create or update)
	 */
	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();

			if (editingGoal) {
				// Update existing goal
				setLocalGoals(prev =>
					prev.map(g => (g.id === editingGoal.id ? { ...g, ...values } : g)),
				);
				message.success(
					t('Admin.settings.contentLibraryTab.goals.updateSuccess'),
				);
			} else {
				// Create new goal
				const newGoal: IFunctionalGoals = {
					id: `goal-${Date.now()}`, // Temporary ID
					...values,
				};
				setLocalGoals(prev => [...prev, newGoal]);
				message.success(
					t('Admin.settings.contentLibraryTab.goals.createSuccess'),
				);
			}

			setIsModalVisible(false);
			form.resetFields();
			setEditingGoal(null);
		} catch (err) {
			// Form validation failed - Ant Design Form handles display of errors
			console.error('[FunctionalGoalsSubTab] Form validation error:', err);
		}
	};

	/**
	 * Handle modal cancel
	 */
	const handleModalCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
		setEditingGoal(null);
	};

	/**
	 * Handle save changes button click
	 */
	const handleSave = async (planToSave: Plans) => {
		try {
			// Validate required fields
			if (!planToSave.title || planToSave.title.trim().length < 3) {
				message.error(
					t('Admin.settings.contentLibraryTab.goals.modal.titleMinLength') ||
						'Title must be at least 3 characters',
				);
				return;
			}

			// Prepare FormData for file upload
			const formData = new FormData();
			formData.append('functionalGoalId', planToSave.functionalGoalId);
			formData.append('title', planToSave.title);
			formData.append('description', planToSave.description);

			// Add image file if changed
			if (planToSave.imageFile) {
				formData.append('thumbnail', planToSave.imageFile);
			}

			// Call API endpoint
			await dispatch(postFunctionalGoal(formData));

			message.success(
				t('Admin.settings.contentLibraryTab.goals.saveSuccess') ||
					'Changes saved successfully',
			);
		} catch (err) {
			const errorMessage = axios.isAxiosError(err)
				? err.response?.data?.message || 'Failed to save changes'
				: t('Admin.settings.contentLibraryTab.goals.saveError') ||
					'Failed to save changes';
			message.error(errorMessage);
			console.error('[PlansSubTab] Save failed:', err);
		}
	};
	const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);

	const handleCardClick = (index: number) => {
		setEditingPlanIndex(index);
		setIsModalVisible(true);
	};
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
		// Prepend base URL for relative paths
		const baseUrl = location.origin || '';
		return `${baseUrl}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
	};

	const currentPlan = useMemo((): unknown => {
		if (editingPlanIndex !== null && localGoals[editingPlanIndex]) {
			return localGoals[editingPlanIndex];
		}
		return null;
	}, [localGoals, editingPlanIndex]);

	const handleModalSave = async (values: {
		title: string;
		description: string;
		imageFile?: File;
		thumbnail?: string;
	}) => {
		if (editingPlanIndex === null || !currentPlan) return;

		const updatedPlan: unknown = {
			...currentPlan,
			title: values.title,
			description: values.description,
			thumbnail: values.thumbnail || currentPlan.thumbnail,
			imageFile: values.imageFile,
		};

		// Save to backend first
		await handleSave(updatedPlan);

		// Update local state after successful save
		const updatedPlans = localGoals.map((plan, idx) =>
			idx === editingPlanIndex ? updatedPlan : plan,
		);
		setLocalGoals(updatedPlans);

		setIsModalVisible(false);
		setEditingPlanIndex(null);
	};

	return (
		<>
			<SettingCard
				label={t('Admin.settings.contentLibraryTab.goals.label')}
				description={t('Admin.settings.contentLibraryTab.goals.description')}
				loading={loading}
				error={error || undefined}>
				<Flex vertical gap={16}>
					{/* Content Cards - Display all plans */}
					<Row gutter={[16, 16]}>
						{localGoals.map((plan, index) => (
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
						t('Admin.settings.contentLibraryTab.goals.modal.editTitle') ||
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
