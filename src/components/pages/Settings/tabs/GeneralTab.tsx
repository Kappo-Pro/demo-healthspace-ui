/**
 * GeneralTab Component
 *
 * Epic 2 - Story 2.2: Build GeneralTab with Unsaved Changes Detection
 *
 * Features:
 * - 3 settings: Client ID, Invite Code, Self-Registration (with sub-settings)
 * - Manual save pattern (explicit "Save Changes" button)
 * - Dirty field tracking (compares form state to Redux server state)
 * - Navigation blocker when unsaved changes exist
 * - Success/error toast notifications
 * - Uses SettingCard molecule for consistent UI
 */

import { UntitledIcon } from '@atoms/Icon';
import { SettingCard } from '@molecules/SettingCard';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { selectGeneralTabData } from '@stores/settings/selectors';
import { setTabDirty } from '@stores/settings/settingsSlice';
import {
	useDeleteTagMutation,
	useGetBandwidthQuery,
	useGetSelfRegistrationQuery,
	useGetTagsQuery,
	usePostBandwidthMutation,
	usePostSelfRegistrationMutation,
	usePostTagMutation,
} from '@stores/shared/settings/settingsApi';
import { Button, Flex, Input, Select, Switch, Tag, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

const { Option } = Select;

/**
 * Form state interface matching story context requirements
 */
interface GeneralFormState {
	clientId: string;
	inviteCode: string;
	selfRegistration: {
		enabled: boolean;
		requireApproval: boolean;
		autoAssignTo?: string;
	};
}

/**
 * GeneralTab component for managing general application settings
 *
 * Allows admins to configure:
 * - Client ID (organization identifier)
 * - Invite Code (registration code requirement)
 * - Self-Registration (enable/disable, approval workflow, auto-assignment)
 */
export const GeneralTab: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	// RTK Query hooks for API calls
	const {
		data: selfRegistrationData,
		isLoading: isLoadingSelfReg,
		error: errorSelfReg,
	} = useGetSelfRegistrationQuery();

	const {
		data: bandwidthData,
		isLoading: isLoadingBandwidth,
		error: errorBandwidth,
	} = useGetBandwidthQuery();

	const {
		data: tagsData,
		isLoading: isLoadingTags,
		error: errorTags,
	} = useGetTagsQuery();

	const [postSelfRegistration, { isLoading: isSavingSelfReg }] =
		usePostSelfRegistrationMutation();
	const [postBandwidth, { isLoading: isSavingBandwidth }] =
		usePostBandwidthMutation();
	const [postTag, { isLoading: isAddingTag }] = usePostTagMutation();
	const [deleteTag, { isLoading: isDeletingTag }] = useDeleteTagMutation();

	// Get data from Redux (server state) - for backward compatibility
	const {
		clientId: serverClientId,
		inviteCode: serverInviteCode,
		loadingInviteCode,
	} = useTypedSelector(selectGeneralTabData);

	// Local state for tags input
	const [newTagName, setNewTagName] = useState('');

	// Local form state
	const [formValues, setFormValues] = useState<GeneralFormState>({
		clientId: serverClientId,
		inviteCode: serverInviteCode,
		selfRegistration: {
			enabled: selfRegistrationData?.active ?? false,
			requireApproval: false,
			autoAssignTo: undefined,
		},
	});

	// Sync form state when server data changes
	useEffect(() => {
		if (selfRegistrationData) {
			setFormValues(prev => ({
				...prev,
				selfRegistration: {
					...prev.selfRegistration,
					enabled: selfRegistrationData.active,
				},
			}));
		}
	}, [selfRegistrationData]);

	// Dirty tracking: Compare form state to server state
	const isDirty = useMemo(() => {
		const clientIdChanged = formValues.clientId !== serverClientId;
		const inviteCodeChanged = formValues.inviteCode !== serverInviteCode;
		const selfRegChanged =
			formValues.selfRegistration.enabled !==
			(selfRegistrationData?.active ?? false);

		return clientIdChanged || inviteCodeChanged || selfRegChanged;
	}, [
		formValues,
		serverClientId,
		serverInviteCode,
		selfRegistrationData?.active,
	]);

	// Navigation blocker: Warn user when leaving with unsaved changes
	useUnsavedChanges({
		hasChanges: isDirty,
		message: t('Admin.settings.generalTab.unsavedChanges'),
	});

	// Sync dirty state to Redux for badge display
	useEffect(() => {
		dispatch(setTabDirty({ tab: 'general', isDirty }));
	}, [isDirty, dispatch]);

	// Loading state: True if any setting is saving
	const isLoading =
		loadingInviteCode ||
		isSavingSelfReg ||
		isSavingBandwidth ||
		isAddingTag ||
		isDeletingTag;

	/**
	 * Handle self-registration toggle
	 */
	const handleSelfRegistrationToggle = async (checked: boolean) => {
		try {
			await postSelfRegistration({ active: checked }).unwrap();
			message.success(t('Admin.settings.generalTab.saveSuccess'));
			setFormValues(prev => ({
				...prev,
				selfRegistration: {
					...prev.selfRegistration,
					enabled: checked,
				},
			}));
		} catch (err) {
			message.error(
				t('Admin.settings.generalTab.saveError') ||
					'Failed to update self-registration',
			);
		}
	};

	/**
	 * Handle bandwidth toggle
	 */
	const handleBandwidthToggle = async (checked: boolean) => {
		try {
			await postBandwidth({ networkIssue: checked }).unwrap();
			message.success(t('Admin.settings.generalTab.saveSuccess'));
		} catch (err) {
			message.error(
				t('Admin.settings.generalTab.saveError') ||
					'Failed to update bandwidth',
			);
		}
	};

	/**
	 * Handle add tag
	 */
	const handleAddTag = async () => {
		if (!newTagName.trim()) {
			message.warning('Please enter a tag name');
			return;
		}

		try {
			await postTag({ name: newTagName.trim() }).unwrap();
			message.success('Tag added successfully');
			setNewTagName('');
		} catch (err) {
			message.error('Failed to add tag');
		}
	};

	/**
	 * Handle delete tag
	 */
	const handleDeleteTag = async (tagId: string) => {
		try {
			await deleteTag(tagId).unwrap();
			message.success('Tag deleted successfully');
		} catch (err) {
			message.error('Failed to delete tag');
		}
	};

	return (
		<Flex vertical gap={16}>
			{/* Self-Registration Setting with Sub-Settings */}
			<SettingCard
				label={t('Admin.settings.generalTab.selfRegistration.label')}
				description={t(
					'Admin.settings.generalTab.selfRegistration.description',
				)}
				loading={isLoadingSelfReg || isSavingSelfReg}
				error={errorSelfReg as string | null}>
				<Flex vertical gap={16}>
					{/* Enabled/Disabled Toggle */}
					<Flex align="center" gap={8}>
						<Switch
							checked={formValues.selfRegistration.enabled}
							onChange={handleSelfRegistrationToggle}
							disabled={isSavingSelfReg}
						/>
						<span>
							{formValues.selfRegistration.enabled
								? t('Admin.settings.generalTab.selfRegistration.enabled')
								: t('Admin.settings.generalTab.selfRegistration.disabled')}
						</span>
					</Flex>
				</Flex>
			</SettingCard>

			{/* Bandwidth Setting */}
			<SettingCard
				label="Bandwidth"
				description="Control network bandwidth usage for media uploads and downloads"
				loading={isLoadingBandwidth || isSavingBandwidth}
				error={errorBandwidth as string | null}>
				<Flex align="center" gap={8}>
					<Switch
						checked={bandwidthData?.networkIssue ?? false}
						onChange={handleBandwidthToggle}
						disabled={isSavingBandwidth}
					/>
					<span>
						{bandwidthData?.networkIssue
							? t('Admin.settings.advancedTab.bandwidth.networkIssue')
							: t('Admin.settings.advancedTab.bandwidth.networkOk')}
					</span>
				</Flex>
			</SettingCard>

			{/* Tags Management */}
			<SettingCard
				label="Tags"
				description="Manage tags for organizing patients and content"
				loading={isLoadingTags}
				error={errorTags as string | null}>
				<Flex vertical gap={16}>
					{/* Add tag input */}
					<Flex gap={8}>
						<Input
							placeholder="Enter tag name"
							value={newTagName}
							onChange={e => setNewTagName(e.target.value)}
							onPressEnter={handleAddTag}
							disabled={isAddingTag}
							style={{ flex: 1 }}
						/>
						<Button
							type="primary"
							onClick={handleAddTag}
							loading={isAddingTag}
							icon={<UntitledIcon name="plus" size="small" />}>
							Add Tag
						</Button>
					</Flex>

					{/* Tags list */}
					<Flex wrap gap={8}>
						{tagsData?.map(tag => (
							<Tag
								key={tag.id}
								closable
								onClose={() => handleDeleteTag(tag.id)}
								style={{
									padding: 'var(--spacing-1) var(--spacing-2)',
									fontSize: 'var(--font-size-sm)',
									display: 'flex',
									alignItems: 'center',
									gap: 'var(--spacing-1)',
								}}>
								{tag.name}
							</Tag>
						))}
						{(!tagsData || tagsData.length === 0) && (
							<span style={{ color: 'var(--text-tertiary)' }}>
								No tags yet. Add your first tag above.
							</span>
						)}
					</Flex>
				</Flex>
			</SettingCard>
		</Flex>
	);
};

export default GeneralTab;
