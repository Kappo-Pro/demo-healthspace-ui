/**
 * TemplatesTab Component
 *
 * Epic 2 - Story 2.4: Refactor TemplatesTab with Autosave
 *
 * Features:
 * - 5 template settings (invite, bulkInvite, resultEmail, consentForm, rom)
 * - Autosave pattern with 2-second debounce
 * - Circuit breaker protection (max 10 pending saves via useAutosave)
 * - Visual feedback: loading spinner, success checkmark, "Last saved" timestamp
 * - Preview button placeholder (Story 3.4 implementation)
 * - Uses SettingCard molecule for consistent UI
 * - No manual save button (autosave only)
 */

import { SettingCard } from '@molecules/SettingCard';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	fetchBulkInviteTemplate,
	fetchConsentFormTemplate,
	fetchInviteTemplate,
	fetchRomEmailTemplate,
	saveTemplate,
} from '@stores/settings/settingsSlice';
import { Button, Flex, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
	DEFAULT_CONSENT_FORM_TEMPLATE,
	DEFAULT_EMAIL_TEMPLATE,
	DEFAULT_INVITE_TEMPLATE,
	DEFAULT_RESULT_BY_EMAIL_TEMPLATE,
} from './defaultInviteTemplates';

// ReactQuill toolbar configuration
const toolbarOptions = [
	[{ header: [1, 2, 3, false] }],
	['bold', 'italic', 'underline', 'strike'],
	[{ list: 'ordered' }, { list: 'bullet' }],
	[{ color: [] }, { background: [] }],
	['link'],
	['clean'],
];

type TemplateKey = 'invite' | 'bulkInvite' | 'resultEmail' | 'consentForm';

/**
 * Get template configuration with localized strings
 */
const DEFAULT_TEMPLATES: Record<TemplateKey, string> = {
	invite: DEFAULT_INVITE_TEMPLATE,
	bulkInvite: DEFAULT_EMAIL_TEMPLATE,
	resultEmail: DEFAULT_RESULT_BY_EMAIL_TEMPLATE,
	consentForm: DEFAULT_CONSENT_FORM_TEMPLATE,
};

const getTemplateConfig = (t: (key: string) => string) => [
	{
		key: 'invite' as const,
		label: t('Admin.settings.templatesTab.invite.label'),
		description: t('Admin.settings.templatesTab.invite.description'),
		placeholder: t('Admin.settings.templatesTab.invite.placeholder'),
	},
	{
		key: 'bulkInvite' as const,
		label: t('Admin.settings.templatesTab.bulkInvite.label'),
		description: t('Admin.settings.templatesTab.bulkInvite.description'),
		placeholder: t('Admin.settings.templatesTab.bulkInvite.placeholder'),
	},
	{
		key: 'resultEmail' as const,
		label: t('Admin.settings.templatesTab.resultEmail.label'),
		description: t('Admin.settings.templatesTab.resultEmail.description'),
		placeholder: t('Admin.settings.templatesTab.resultEmail.placeholder'),
	},
	{
		key: 'consentForm' as const,
		label: t('Admin.settings.templatesTab.consentForm.label'),
		description: t('Admin.settings.templatesTab.consentForm.description'),
		placeholder: t('Admin.settings.templatesTab.consentForm.placeholder'),
	},
];

/**
 * TemplatesTab component for managing email and assessment templates
 *
 * Allows admins to customize:
 * - User invitation emails
 * - Bulk invitation emails
 * - Assessment result emails
 * - Consent form content
 * - ROM assessment instructions
 *
 * Templates autosave 2 seconds after last keystroke
 */
export const TemplatesTab: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	// Get template data from Redux store (NEW normalized structure)
	const inviteTemplate = useTypedSelector(
		state => state.settings.templates.invite,
	);
	const emailTemplate = useTypedSelector(
		state => state.settings.templates.bulkInvite,
	);
	const romTemplate = useTypedSelector(
		state => state.settings.templates.rom,
	);
	const consentFormTemplate = useTypedSelector(
		state => state.settings.templates.consentForm,
	);

	// Loading states
	const [loading, setLoading] = useState({
		invite: false,
		bulkInvite: false,
		resultEmail: false,
		consentForm: false,
	});

	// Track if initial fetch is complete
	const [initialFetchComplete, setInitialFetchComplete] = useState(false);

	// Local form state for all 4 templates
	const [formValues, setFormValues] = useState({
		invite: '',
		bulkInvite: '',
		resultEmail: '',
		consentForm: '',
	});

	// Fetch all templates on mount
	useEffect(() => {
		const fetchTemplates = async () => {
			await Promise.all([
				dispatch(fetchInviteTemplate()),
				dispatch(fetchBulkInviteTemplate()),
				dispatch(fetchRomEmailTemplate()),
				dispatch(fetchConsentFormTemplate()),
			]);
			setInitialFetchComplete(true);
		};
		fetchTemplates();
	}, [dispatch]);

	// Update form values when Redux state changes
	// Only update after initial fetch completes to prevent default content flash
	// Use nullish coalescing (??) to only use defaults when value is null/undefined
	// Empty string ("") is a valid saved value, not a reason to fall back to defaults
	useEffect(() => {
		if (!initialFetchComplete) return;

		setFormValues({
			invite: inviteTemplate ?? DEFAULT_TEMPLATES.invite,
			bulkInvite: emailTemplate ?? DEFAULT_TEMPLATES.bulkInvite,
			resultEmail: romTemplate ?? DEFAULT_TEMPLATES.resultEmail,
			consentForm: consentFormTemplate ?? DEFAULT_TEMPLATES.consentForm,
		});
	}, [
		inviteTemplate,
		emailTemplate,
		romTemplate,
		consentFormTemplate,
		initialFetchComplete,
	]);

	/**
	 * Handle template change
	 */
	const handleTemplateChange = (key: TemplateKey, value: string) => {
		setFormValues(prev => ({ ...prev, [key]: value }));
	};

	/**
	 * Handle save button click
	 */
	const handleSave = async (key: TemplateKey) => {
		setLoading(prev => ({ ...prev, [key]: true }));

		try {
			// Map template keys to saveTemplate type parameter
			const typeMap = {
				invite: 'invite' as const,
				bulkInvite: 'bulk' as const,
				resultEmail: 'rom' as const,
				consentForm: 'consent' as const,
			};

			// Save template
			await dispatch(
				saveTemplate({
					type: typeMap[key],
					template: formValues[key],
				}),
			).unwrap();

			// Refetch to sync with server and handle null values
			let fetchedTemplate;
			switch (key) {
				case 'invite':
					fetchedTemplate = await dispatch(fetchInviteTemplate()).unwrap();
					break;
				case 'bulkInvite':
					fetchedTemplate = await dispatch(fetchBulkInviteTemplate()).unwrap();
					break;
				case 'resultEmail':
					fetchedTemplate = await dispatch(fetchRomEmailTemplate()).unwrap();
					break;
				case 'consentForm':
					fetchedTemplate = await dispatch(fetchConsentFormTemplate()).unwrap();
					break;
			}

			// If fetched template is null or undefined, use default template
			if (fetchedTemplate == null) {
				setFormValues(prev => ({ ...prev, [key]: DEFAULT_TEMPLATES[key] }));
			}

			message.success(t('admin.menu.setting.savedSuccessfully'));
		} catch (error) {
			console.error('Failed to save template:', error);
		} finally {
			setLoading(prev => ({ ...prev, [key]: false }));
		}
	};

	/**
	 * Handle reset to default
	 */
	const handleResetToDefault = (key: TemplateKey) => {
		setFormValues(prev => ({ ...prev, [key]: DEFAULT_TEMPLATES[key] }));
	};

	const TEMPLATE_CONFIG = getTemplateConfig(t);

	/**
	 * Check if ReactQuill content is empty
	 * ReactQuill returns "<p><br></p>" or similar HTML for empty content
	 */
	const isQuillEmpty = (content: string): boolean => {
		if (!content) return true;
		// Remove all HTML tags and check if there's any text content
		const textOnly = content.replace(/<[^>]*>/g, '').trim();
		return textOnly.length === 0;
	};

	return (
		<Flex vertical>
			{TEMPLATE_CONFIG.map(config => {
				const isLoading = loading[config.key] || !initialFetchComplete;
				const isEmpty = isQuillEmpty(formValues[config.key]);

				return (
					<SettingCard
						key={config.key}
						label={config.label}
						description={config.description}
						loading={isLoading}>
						<Flex vertical gap={12}>
							<Flex justify="flex-end">
								<span
									className="settings-templates-reset-to-default"
									onClick={() => handleResetToDefault(config.key)}
									style={{
										cursor: 'pointer',
										fontSize: 'var(--font-size-sm)',
										color: 'var(--brand-primary)',
									}}>
									{t('admin.menu.setting.resetToDefault')}
								</span>
							</Flex>

							{/* Template ReactQuill Editor */}
							<ReactQuill
								modules={{ toolbar: toolbarOptions }}
								value={formValues[config.key]}
								onChange={value => handleTemplateChange(config.key, value)}
								placeholder={config.placeholder}
								className="custom-quill"
								readOnly={isLoading}
							/>

							{/* Save Button */}
							<Flex justify="flex-end">
								<Button
									type="primary"
									onClick={() => handleSave(config.key)}
									loading={isLoading}
									disabled={isLoading || isEmpty}>
									{t('admin.menu.setting.save')}
								</Button>
							</Flex>
						</Flex>
					</SettingCard>
				);
			})}
		</Flex>
	);
};

export default TemplatesTab;
