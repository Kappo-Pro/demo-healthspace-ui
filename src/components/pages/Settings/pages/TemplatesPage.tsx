/**
 * TemplatesPage - Settings Templates section page wrapper
 *
 * Standalone page component for /settings/templates route
 * Renders the TemplatesTab content within the two-tier navigation layout
 */

import { SettingsTabSkeleton } from '@atoms/SettingsTabSkeleton';
import { Alert } from 'antd';
import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsData } from '../hooks/useSettingsData';

const TemplatesTab = lazy(() =>
	import('../tabs/TemplatesTab').then(module => ({
		default: module.TemplatesTab,
	})),
);

const TemplatesPage: React.FC = () => {
	const { t } = useTranslation();
	const { loading, error, refetch } = useSettingsData();

	if (loading) {
		return (
			<div className="setting-template-bg">
				<SettingsTabSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="setting-template-bg">
				<Alert
					message={t('Admin.settings.error.title', 'Error')}
					description={error}
					type="error"
					showIcon
					action={
						<button onClick={refetch} className="ant-btn ant-btn-default">
							{t('Admin.settings.error.retry', 'Retry')}
						</button>
					}
				/>
			</div>
		);
	}

	return (
		<div className="setting-template-bg">
			<Suspense fallback={<SettingsTabSkeleton />}>
				<TemplatesTab />
			</Suspense>
		</div>
	);
};

export default TemplatesPage;
