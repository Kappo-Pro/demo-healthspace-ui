/**
 * IntegrationsTab Component
 *
 * Epic 2 - Story 2.3: Refactor IntegrationsTab with Manual Save Pattern
 *
 * Features:
 * - 2 settings: OpenAI API Key (password input), API Key Active (switch)
 * - Manual save pattern (explicit "Save Changes" button)
 * - Dirty field tracking (compares form state to Redux server state)
 * - Navigation blocker when unsaved changes exist
 * - Test Connection button placeholder (Story 3.5 will implement)
 * - Success/error toast notifications
 * - Uses SettingCard molecule for consistent UI
 * - Input.Password for masked API key with visibility toggle
 * - Copy button inside input field to copy API key to clipboard
 */

import { UntitledIcon } from '@atoms/Icon';
import { SettingCard } from '@molecules/SettingCard';
import { useTypedDispatch } from '@stores/index';
import { setTabDirty } from '@stores/settings/settingsSlice';
import {
	useGetSettingsQuery,
	usePatchSettingsMutation,
} from '@stores/shared/settings/settingsApi';
import { Button, Flex, Input, Switch, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

/**
 * Settings API response interface
 */
interface SettingsResponse {
	id: string;
	clientId: string;
	openaiApiKey: string;
	openaiApiKeyActive?: boolean;
	createdAt: string;
	updatedAt: string;
}

/**
 * Form state interface matching story context requirements
 */
interface IntegrationsFormState {
	apiKey: string;
	apiKeyActive: boolean;
}

/**
 * IntegrationsTab component for managing API integrations
 *
 * Allows admins to configure:
 * - OpenAI API Key (secure password input with visibility toggle + copy button)
 * - API Key Active (enable/disable integration without deleting key)
 */
export const IntegrationsTab: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	// RTK Query hooks
	const {
		data: settingsData,
		isLoading: isLoadingSettings,
		error: errorSettings,
	} = useGetSettingsQuery();

	const [patchSettings, { isLoading: isSaving }] = usePatchSettingsMutation();

	// Extract settings data from API response
	const settings = settingsData as SettingsResponse | undefined;
	const serverApiKey = settings?.openaiApiKey || '';
	const serverApiKeyActive = settings?.openaiApiKeyActive ?? false;
	const settingsId = settings?.id || '';

	// Local form state
	const [formValues, setFormValues] = useState<IntegrationsFormState>({
		apiKey: serverApiKey,
		apiKeyActive: serverApiKeyActive,
	});

	// Sync form state when server data changes (e.g., after successful save)
	useEffect(() => {
		if (settings) {
			setFormValues({
				apiKey: settings.openaiApiKey || '',
				apiKeyActive: settings.openaiApiKeyActive ?? false,
			});
		}
	}, [settings]);

	// Dirty tracking: Compare form state to server state
	const isDirty = useMemo(() => {
		const apiKeyChanged = formValues.apiKey !== serverApiKey;
		const apiKeyActiveChanged = formValues.apiKeyActive !== serverApiKeyActive;

		return apiKeyChanged || apiKeyActiveChanged;
	}, [formValues, serverApiKey, serverApiKeyActive]);

	// Combined loading state
	const loading = isLoadingSettings || isSaving;

	// Combined error
	const error = errorSettings ? String(errorSettings) : null;

	// Navigation blocker: Warn user when leaving with unsaved changes
	useUnsavedChanges({
		hasChanges: isDirty,
		message: t('Admin.settings.integrationsTab.unsavedChanges'),
	});

	// Sync dirty state to Redux for badge display (Story 2.6)
	React.useEffect(() => {
		dispatch(setTabDirty({ tab: 'integrations', isDirty }));
	}, [isDirty, dispatch]);

	/**
	 * Handle save button click
	 * Calls patchSettings API with changed values
	 */
	const handleSave = async () => {
		if (!settingsId) {
			message.error('Settings ID not found');
			return;
		}

		try {
			await patchSettings({
				settingsId,
				payload: {
					openaiApiKey: formValues.apiKey,
					openaiApiKeyActive: formValues.apiKeyActive,
				},
			}).unwrap();

			// Show success toast
			message.success(
				t('Admin.settings.integrationsTab.saveSuccess') ||
					'Settings saved successfully',
			);
		} catch (err) {
			// Show error toast
			const errorMessage =
				err instanceof Error
					? err.message
					: t('Admin.settings.integrationsTab.saveError') ||
						'Failed to save settings';
			message.error(errorMessage);
		}
	};

	/**
	 * Handle copy API key to clipboard
	 */
	const handleCopyApiKey = async () => {
		try {
			await navigator.clipboard.writeText(formValues.apiKey);
			message.success(
				t('Admin.data.menu.setting.openAi.copied') ||
					'API Key copied to clipboard',
			);
		} catch (err) {
			message.error(
				t('Admin.settings.integrationsTab.apiKey.copyError') ||
					'Failed to copy API Key',
			);
		}
	};

	/**
	 * Handle Test Connection button click
	 * Placeholder for Story 3.5 implementation
	 */
	const _handleTestConnection = () => {
		message.info(
			t('Admin.settings.integrationsTab.testConnection.placeholder'),
		);
	};

	return (
		<div>
			{/* OpenAI API Key Setting */}
			<SettingCard
				label={t('Admin.settings.integrationsTab.apiKey.label')}
				description={t('Admin.settings.integrationsTab.apiKey.description')}
				loading={loading}
				error={error}
				helpLink="https://platform.openai.com/api-keys"
				helpLinkText={t('Admin.settings.integrationsTab.apiKey.helpLinkText')}>
				<Input
					value={formValues.apiKey}
					onChange={e =>
						setFormValues(prev => ({ ...prev, apiKey: e.target.value }))
					}
					placeholder={t('Admin.settings.integrationsTab.apiKey.placeholder')}
					disabled={loading}
					style={{ width: 400 }}
					suffix={
						<UntitledIcon
							name="copy"
							size="small"
							onClick={handleCopyApiKey}
							style={{
								cursor: formValues.apiKey ? 'pointer' : 'not-allowed',
								opacity: formValues.apiKey ? 1 : 0.5,
								marginLeft: 8,
							}}
							aria-label="Copy API Key"
						/>
					}
				/>
			</SettingCard>

			{/* API Key Active Setting */}
			<SettingCard
				label={t('Admin.settings.integrationsTab.apiKeyActive.label')}
				description={t(
					'Admin.settings.integrationsTab.apiKeyActive.description',
				)}
				loading={loading}>
				<Flex align="center" gap={8}>
					<Switch
						checked={formValues.apiKeyActive}
						onChange={checked =>
							setFormValues(prev => ({ ...prev, apiKeyActive: checked }))
						}
						disabled={loading}
					/>
				</Flex>
			</SettingCard>

			{/* Action Buttons */}
			<Flex justify="flex-end" gap={12} style={{ marginTop: 24 }}>
				{/* Save Changes Button */}
				<Button
					type="primary"
					size="large"
					onClick={handleSave}
					disabled={!isDirty}
					loading={loading}>
					{t('Admin.settings.integrationsTab.saveChanges')}
				</Button>
			</Flex>
		</div>
	);
};

export default IntegrationsTab;
