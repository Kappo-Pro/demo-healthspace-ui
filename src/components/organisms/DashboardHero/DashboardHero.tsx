/**
 * DashboardHero Organism Component
 *
 * Main hero section at the top of the patient dashboard that combines:
 * - Time-based personalized greeting with user's first name
 * - Dashboard metrics (ROM score, sessions completed, current streak)
 * - Continue session button (conditional on active session availability)
 *
 * EPIC-010-S1: Component structure and UI layout
 * EPIC-010-S3: Redux integration with loading/error states
 *
 * Features:
 * - Personalized time-based greeting (Good morning/afternoon/evening)
 * - Displays user's first name from Redux state
 * - Shows key dashboard metrics via DashboardHeroMetrics molecule
 * - Conditionally renders ContinueSessionButton for incomplete sessions
 * - Responsive layout (stacks on mobile, side-by-side on desktop)
 * - Loading skeleton during data fetch
 * - Error alert with retry functionality
 *
 * @example
 * // Automatically connects to Redux - no props needed
 * <DashboardHero />
 */

import React, { useEffect } from 'react';
import { Row, Col, Typography, Skeleton, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTypedSelector, useTypedDispatch } from '@stores/index';
import { fetchDashboardData } from '@stores/dashboard';
import { DashboardHeroMetrics } from '@molecules/DashboardHeroMetrics';
import { ContinueSessionButton } from '@molecules/ContinueSessionButton';
import './DashboardHero.css';

const { Title, Text } = Typography;

/**
 * DashboardHero Component
 * Redux-connected organism - no props required
 */
export const DashboardHero: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	// EPIC-010-S3: Read dashboard data from Redux
	const { metrics, lastSession, loading, error } = useTypedSelector(
		(state) => state.dashboard
	);

	// EPIC-010-S3: Read user data for greeting
	const firstName = useTypedSelector(
		(state) => state.user?.firstName || 'there'
	);

	// EPIC-010-S3: Fetch dashboard data on mount
	useEffect(() => {
		dispatch(fetchDashboardData());
	}, [dispatch]);

	/**
	 * Get time-based greeting message
	 * EPIC-010-S1: Morning/Afternoon/Evening logic
	 */
	const getGreeting = (): string => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 18) return 'Good afternoon';
		return 'Good evening';
	};

	/**
	 * Retry handler for error state
	 * EPIC-010-S3: Re-dispatch thunk on retry
	 */
	const handleRetry = () => {
		dispatch(fetchDashboardData());
	};

	// EPIC-010-S3: Error state UI
	if (error) {
		return (
			<div className="dashboard-hero">
				<Alert
					message={t('Patient.data.errors.failedToLoadDashboard')}
					description={error}
					type="error"
					showIcon
					action={
						<Button size="small" danger onClick={handleRetry}>
							Retry
						</Button>
					}
				/>
			</div>
		);
	}

	// EPIC-010-S3: Loading state UI
	if (loading) {
		return (
			<div className="dashboard-hero">
				<Skeleton active paragraph={{ rows: 4 }} />
			</div>
		);
	}

	// EPIC-010-S1: Success state - Main hero section
	return (
		<div className="dashboard-hero">
			{/* Greeting and CTA Row */}
			<Row gutter={[16, 24]} align="middle">
				{/* Greeting Section */}
				<Col xs={24} md={lastSession ? 12 : 24}>
					<Title level={2} className="dashboard-hero-greeting">
						{getGreeting()}, {firstName}! 👋
					</Title>
					<Text className="dashboard-hero-subtitle">
						Here&apos;s your progress overview
					</Text>
				</Col>

				{/* Continue Session Button (Conditional) */}
				{lastSession && (
					<Col xs={24} md={12} className="dashboard-hero-cta">
						<ContinueSessionButton
							programName={lastSession.programName}
							programId={lastSession.programId}
							sessionId={lastSession.sessionId}
						/>
					</Col>
				)}
			</Row>

			{/* Metrics Section */}
			<div className="dashboard-hero-metrics">
				<DashboardHeroMetrics
					metrics={{
						romScore: metrics.romScore,
						romTrend: metrics.romTrend,
						sessionsCompleted: metrics.sessionsCompleted,
						sessionsTrend: metrics.sessionsTrend,
						currentStreak: metrics.streak,
						streakTrend: metrics.streakTrend,
					}}
				/>
			</div>
		</div>
	);
};

export default DashboardHero;
