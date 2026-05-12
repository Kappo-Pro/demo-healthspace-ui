/**
 * OPostureJourneyView Organism Component
 * Patient journey timeline with milestones
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProgressMilestone } from '@atoms/ProgressMilestone';
import type { PatientJourneyState } from '@types/posture';
import './OPostureJourneyView.css';

export interface OPostureJourneyViewProps {
	journeyState: PatientJourneyState;
	className?: string;
}

export const OPostureJourneyView: React.FC<OPostureJourneyViewProps> = ({
	journeyState,
	className = '',
}) => {
	const { t } = useTranslation();

	return (
		<div className={`o-posture-journey-view ${className}`.trim()}>
			<h2>{t('Patient.data.postures.patientJourney')}</h2>
			<div role="list">
				{journeyState.milestones.map(milestone => (
					<ProgressMilestone key={milestone.id} milestone={milestone} />
				))}
			</div>
		</div>
	);
};

export default OPostureJourneyView;
