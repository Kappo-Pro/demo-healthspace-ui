import React from 'react';
import ViewSection from './ViewSection';
import { useTranslation } from 'react-i18next';
import {
	GroupedScanResult,
	PostureData,
	PostureIssues,
	PostureAlignment} from '@types';

type Props = {
	postureScanData: GroupedScanResult<PostureData>;
	issues: PostureIssues;
	strapiPostureReport?: PostureAlignment[] | null;
};

const ScanData: React.FC<Props> = ({ postureScanData, issues, strapiPostureReport }) => {
	const { t } = useTranslation();

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(2, 1fr)',
				gap: 'var(--spacing-5)',
			}}>
			<ViewSection
				title={t('Patient.data.postures.Front')}
				data={postureScanData.front}
				tags={issues.front}
				strapiPostureReport={strapiPostureReport}
			/>
			<ViewSection
				title={t('Patient.data.postures.Back')}
				data={postureScanData.back}
				tags={issues.back}
				strapiPostureReport={strapiPostureReport}
			/>
			<ViewSection
				title={t('Patient.data.postures.Left')}
				data={postureScanData.left}
				tags={issues.left}
				strapiPostureReport={strapiPostureReport}
			/>
			<ViewSection
				title={t('Patient.data.postures.Right')}
				data={postureScanData.right}
				tags={issues.right}
				strapiPostureReport={strapiPostureReport}
			/>
		</div>
	);
};

export default ScanData;
