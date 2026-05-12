/**
 * OPostureDetailView Organism Component
 * Detailed posture assessment results
 */

import React from 'react';
import { Tabs } from 'antd';
import type { PostureSession } from '@types/posture';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './OPostureDetailView.css';

export interface OPostureDetailViewProps {
	session: PostureSession;
	className?: string;
}

export const OPostureDetailView: React.FC<OPostureDetailViewProps> = ({
	className = '',
}) => {
	const { t } = useTypedTranslation();

	return (
		<div className={`o-posture-detail-view ${className}`.trim()}>
			<h2>{t('Patient.data.postures.detail.title')}</h2>
			<Tabs
				items={[
					{
						key: 'overview',
						label: t('Patient.data.postures.detail.overview.title'),
						children: <div>{t('Patient.data.postures.detail.overview.content')}</div>,
					},
					{
						key: 'metrics',
						label: t('Patient.data.postures.detail.metrics.title'),
						children: <div>{t('Patient.data.postures.detail.metrics.content')}</div>,
					},
					{
						key: 'recommendations',
						label: t('Patient.data.postures.detail.recommendations.title'),
						children: <div>{t('Patient.data.postures.detail.recommendations.content')}</div>,
					},
				]}
			/>
		</div>
	);
};

export default OPostureDetailView;
