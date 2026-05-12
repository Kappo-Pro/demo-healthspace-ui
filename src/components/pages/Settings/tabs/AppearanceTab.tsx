/**
 * AppearanceTab Component
 *
 * Epic 1 - Story 1.6: Appearance tab with theme selector
 *
 * Features:
 * - Theme selector with 3 options: Default, Vibrant, Dark
 * - Auto-save on selection (no save button)
 * - Toast notification on successful save
 * - Uses SettingCard molecule
 * - Reads from Redux using selectAppearanceTabData selector
 */

import { SettingCard } from '@molecules/SettingCard';
import { useTheme } from '@providers/ThemeProvider';
import { useTypedDispatch } from '@stores/index';
import { setTabDirty } from '@stores/settings/settingsSlice';
import {
	useGetThemeQuery,
	usePostThemeMutation,
} from '@stores/shared/settings/settingsApi';
import { Button, Checkbox, Flex, Select, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

/**
 * Theme option values
 */
type ThemeOption = 'system' | 'default' | 'vibrant' | 'dark';

/**
 * AppearanceTab component for theme customization
 *
 * Allows admins to customize the look and feel of the VitalFlow portal.
 */
export const AppearanceTab: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	// Get theme from ThemeProvider (this is what's actually applied to UI)
	const { theme: currentTheme, setTheme } = useTheme();

	// RTK Query hooks
	const {
		data: themeData,
		isLoading: isLoadingTheme,
		error: errorTheme,
	} = useGetThemeQuery();

	const [postTheme, { isLoading: isSavingTheme }] = usePostThemeMutation();

	// Local state for selected theme (for optimistic UI)
	const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(
		(currentTheme as ThemeOption) || 'default',
	);

	// Local state for locked checkbox
	const [isLocked, setIsLocked] = useState<boolean>(false);

	// Track dirty state
	const [isDirty, setIsDirty] = useState(false);

	// Sync local state with API data when it loads
	useEffect(() => {
		if (themeData) {
			const themeName = themeData.name as ThemeOption;
			setSelectedTheme(themeName);
			setIsLocked(themeData.locked || false);
		}
	}, [themeData]);

	// Sync local state with ThemeProvider when it changes
	useEffect(() => {
		if (
			currentTheme &&
			['system', 'default', 'vibrant', 'dark'].includes(currentTheme)
		) {
			setSelectedTheme(currentTheme as ThemeOption);
		}
	}, [currentTheme]);

	// Track dirty state
	useEffect(() => {
		const themeChanged = selectedTheme !== (themeData?.name as ThemeOption);
		const lockedChanged = isLocked !== (themeData?.locked || false);
		const dirty = themeChanged || lockedChanged;
		setIsDirty(dirty);
		dispatch(setTabDirty({ tab: 'appearance', isDirty: dirty }));
	}, [selectedTheme, isLocked, themeData, dispatch]);

	/**
	 * Handle theme selection change
	 * Updates local state only (requires save button)
	 */
	const handleThemeChange = (newTheme: string) => {
		// Validate theme value
		if (!['system', 'default', 'vibrant', 'dark'].includes(newTheme)) {
			return;
		}

		const validTheme = newTheme as ThemeOption;
		setSelectedTheme(validTheme);
	};

	/**
	 * Handle locked checkbox change
	 */
	const handleLockedChange = (checked: boolean) => {
		setIsLocked(checked);
	};

	/**
	 * Handle save button click
	 * Calls postTheme API with changed values
	 */
	const handleSave = async () => {
		try {
			// Apply theme to UI via ThemeProvider
			setTheme(selectedTheme);

			// Save to backend (skip "system" as it's device-specific)
			if (selectedTheme !== 'system') {
				await postTheme({
					name: selectedTheme,
					locked: isLocked,
				}).unwrap();

				// Show success toast
				message.success(
					t('Admin.settings.appearanceTab.updateSuccess') ||
						'Theme saved successfully',
				);
			} else {
				// For system theme, just apply locally
				message.success(
					t('Admin.settings.appearanceTab.updateSuccess') ||
						'Theme applied successfully',
				);
			}
		} catch (err) {
			// Revert local state on error
			if (themeData) {
				setSelectedTheme(themeData.name as ThemeOption);
				setIsLocked(themeData.locked || false);
			}

			// Show error toast
			const errorMessage =
				err instanceof Error
					? err.message
					: t('Admin.settings.appearanceTab.updateError') ||
						'Failed to save theme';
			message.error(errorMessage);
		}
	};

	const loading = isLoadingTheme || isSavingTheme;
	const error = errorTheme ? String(errorTheme) : null;

	return (
		<div>
			<SettingCard
				label={t('Admin.settings.appearanceTab.theme.label')}
				description={t('Admin.settings.appearanceTab.theme.description')}
				loading={loading}
				error={error}>
				<Flex vertical gap={16}>
					<Flex vertical gap={8}>
						<label>{t('Admin.settings.appearanceTab.theme.label')}</label>
						<Select
							value={selectedTheme}
							className="theme-select-dropdown"
							onChange={handleThemeChange}
							style={{ width: 300 }}
							disabled={loading}>
							<Option key="default" value="default">
								{t('Admin.settings.appearanceTab.theme.default')}
							</Option>
							<Option key="dark" value="dark">
								{t('Admin.settings.appearanceTab.theme.dark')}
							</Option>
						</Select>
					</Flex>

					<Checkbox
						checked={isLocked}
						onChange={e => handleLockedChange(e.target.checked)}
						disabled={loading}>
						Lock theme (prevent users from changing)
					</Checkbox>
				</Flex>
			</SettingCard>

			{/* Save Button */}
			<Flex justify="flex-end" style={{ marginTop: 24 }}>
				<Button
					type="primary"
					size="large"
					onClick={handleSave}
					disabled={!isDirty}
					loading={loading}>
					{t('Admin.settings.plansTab.saveChanges')}
				</Button>
			</Flex>
		</div>
	);
};

export default AppearanceTab;
