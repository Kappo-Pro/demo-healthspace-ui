/**
 * Achievements Page
 *
 * Displays patient milestone achievements and progress.
 * Shows earned milestones grid and progress toward next milestones.
 *
 * Features:
 * - Milestone celebration hook integration
 * - Progress dashboard with earned milestones
 * - Filter and sort functionality
 * - Responsive mobile-first design
 * - Loading states
 *
 * @example
 * Route: /achievements or /patient/achievements
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypedSelector } from '@stores/index';
import { useAuth } from 'react-auth-kit';
import {
	selectEarnedMilestones,
	selectMilestoneProgress,
	selectMilestonesLoading} from '@stores/posture/postures/selectors';
import { useMilestoneCelebration } from '@hooks/milestones';
import { ProgressDashboard } from '@organisms/ProgressDashboard';
import './Achievements.css';

export const Achievements: React.FC = () => {
	const { t } = useTranslation();
	const auth = useAuth();
	const userId = auth()?.userId;

	// Redux selectors
	const earnedMilestones = useTypedSelector(selectEarnedMilestones);
	const milestoneProgress = useTypedSelector(selectMilestoneProgress);
	const loading = useTypedSelector(selectMilestonesLoading);

	// Milestone celebration hook
	const { celebrationModal, checkForMilestones } = useMilestoneCelebration({
		checkOnMount: true,
		showToastNotifications: false, // Don't show toast on achievements page
		userId: userId || undefined,
	});

	// Refresh milestones on mount
	useEffect(() => {
		if (userId) {
			checkForMilestones();
		}
	}, [userId, checkForMilestones]);

	return (
		<div className="achievements-page">
			{/* Celebration Modal */}
			{celebrationModal}

			{/* Page Header */}
			<div className="achievements-page__header">
				<h1 className="achievements-page__title">{t('Patient.data.achievements.pageTitle')}</h1>
				<p className="achievements-page__description">
					{t('Patient.data.achievements.pageDescription')}
				</p>
			</div>

			{/* Progress Dashboard */}
			<ProgressDashboard
				earnedMilestones={earnedMilestones}
				milestoneProgress={milestoneProgress}
				loading={loading}
				className="achievements-page__dashboard"
			/>
		</div>
	);
};

export default Achievements;
