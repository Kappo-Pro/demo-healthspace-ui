/**
 * ExportReportsPage - Settings Export Reports section page wrapper
 *
 * Standalone page component for /settings/export-reports route
 * Renders the ExportReportsTab content within the two-tier navigation layout
 */

import React, { Suspense, lazy } from 'react';
import { SettingsTabSkeleton } from '@atoms/SettingsTabSkeleton';
import { useSettingsData } from '../hooks/useSettingsData';
import { Alert, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

const ExportReportsTab = lazy(() =>
	import('../tabs/ExportReportsTab').then(module => ({
		default: module.ExportReportsTab,
	})),
);

const ExportReportsPage: React.FC = () => {
	const { t } = useTranslation();
	const { loading, error, refetch } = useSettingsData();

	if (loading) {
		return (
			<div className="total-patient-main-div">
				<Spin size="large" tip={t('Admin.settings.loading', 'Loading...')} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="total-patient-main-div">
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
		<div className="total-patient-main-div">
			<Suspense fallback={<SettingsTabSkeleton />}>
				<ExportReportsTab />
			</Suspense>
		</div>
	);
};

export default ExportReportsPage;
