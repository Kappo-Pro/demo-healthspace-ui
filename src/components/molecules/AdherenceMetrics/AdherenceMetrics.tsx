/**
 * AdherenceMetrics Molecule Component
 *
 * Displays patient exercise adherence metrics using metric cards.
 * Shows completion rate, consistency streak, and last activity.
 *
 * Story 3.7: Patient Adherence Tracking (FR28)
 * @module components/molecules/AdherenceMetrics
 */

import React from 'react';
import { Row, Col, Typography, Tooltip } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { EnhancedMetricCard } from '@molecules/PostureMetricCard/EnhancedMetricCard';
import type { AdherenceMetrics as AdherenceMetricsType } from '@stores/posture/postureAnalytics/exerciseTracking';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './AdherenceMetrics.css';

const { Text } = Typography;

export interface AdherenceMetricsProps {
	/** Adherence metrics data */
	metrics: AdherenceMetricsType;
	/** Loading state */
	loading?: boolean;
	/** Show comparison to previous period */
	showComparison?: boolean;
	/** Previous period metrics for comparison */
	previousMetrics?: AdherenceMetricsType;
}

/**
 * Calculate trend from previous metrics
 */
const calculateTrend = (
	current: number,
	previous: number | undefined,
): 'up' | 'down' | undefined => {
	if (previous === undefined) return undefined;
	if (current > previous) return 'up';
	if (current < previous) return 'down';
	return undefined;
};

/**
 * Get status color based on adherence level
 */
const getAdherenceStatus = (
	completionRate: number,
): 'success' | 'warning' | 'error' => {
	if (completionRate >= 70) return 'success';
	if (completionRate >= 50) return 'warning';
	return 'error';
};

/**
 * Get streak status color
 */
const getStreakStatus = (streak: number): 'success' | 'warning' | 'default' => {
	if (streak >= 7) return 'success';
	if (streak >= 3) return 'warning';
	return 'default';
};

/**
 * Get activity status color
 */
const getActivityStatus = (
	daysSinceLastActivity: number,
): 'success' | 'warning' | 'error' => {
	if (daysSinceLastActivity === 0) return 'success';
	if (daysSinceLastActivity <= 3) return 'warning';
	return 'error';
};

export const AdherenceMetrics: React.FC<AdherenceMetricsProps> = ({
	metrics,
	loading = false,
	showComparison = false,
	previousMetrics,
}) => {
	const { t } = useTypedTranslation();
	const adherenceStatus = getAdherenceStatus(metrics.completionRate);
	const streakStatus = getStreakStatus(metrics.consistencyStreak);
	const activityStatus = getActivityStatus(metrics.daysSinceLastActivity);

	return (
		<div
			className="adherence-metrics"
			role="region"
			aria-label={t('patient.adherence.metrics.ariaLabel')}>
			<Row gutter={[16, 16]}>
				{/* Completion Rate */}
				<Col xs={24} sm={12} lg={6}>
					<EnhancedMetricCard
						title={t('patient.adherence.metrics.completionRate.title')}
						value={`${metrics.completionRate}%`}
						icon={<UntitledIcon name="checkCircle" size={16} />}
						status={adherenceStatus}
						loading={loading}
						trend={
							showComparison
								? calculateTrend(
										metrics.completionRate,
										previousMetrics?.completionRate,
									)
								: undefined
						}
						subtitle={
							<Text type="secondary">
								{t('patient.adherence.metrics.completionRate.subtitle', {
									completed: metrics.completedThisWeek,
									expected: metrics.expectedThisWeek,
								})}
							</Text>
						}
						tooltip={t('patient.adherence.metrics.completionRate.tooltip')}
						aria-label={t('patient.adherence.metrics.completionRate.ariaLabel', {
							rate: metrics.completionRate,
							completed: metrics.completedThisWeek,
							expected: metrics.expectedThisWeek,
						})}
					/>
				</Col>

				{/* Consistency Streak */}
				<Col xs={24} sm={12} lg={6}>
					<Tooltip
						title={
							metrics.consistencyStreak >= 7
								? t('patient.adherence.metrics.consistencyStreak.excellentConsistency')
								: metrics.consistencyStreak >= 3
									? t('patient.adherence.metrics.consistencyStreak.goodConsistency')
									: t('patient.adherence.metrics.consistencyStreak.encourageDaily')
						}>
						<EnhancedMetricCard
							title={t('patient.adherence.metrics.consistencyStreak.title')}
							value={`${metrics.consistencyStreak}`}
							icon={<UntitledIcon name="fire" size={16} />}
							status={streakStatus}
							loading={loading}
							trend={
								showComparison
									? calculateTrend(
											metrics.consistencyStreak,
											previousMetrics?.consistencyStreak,
										)
									: undefined
							}
							subtitle={<Text type="secondary">{t('patient.adherence.metrics.consistencyStreak.subtitle')}</Text>}
							tooltip={t('patient.adherence.metrics.consistencyStreak.tooltip')}
							aria-label={t('patient.adherence.metrics.consistencyStreak.ariaLabel', {
								streak: metrics.consistencyStreak,
							})}
						/>
					</Tooltip>
				</Col>

				{/* Last Activity */}
				<Col xs={24} sm={12} lg={6}>
					<EnhancedMetricCard
						title={t('patient.adherence.metrics.lastActivity.title')}
						value={
							metrics.daysSinceLastActivity === 0
								? t('patient.adherence.metrics.lastActivity.today')
								: t('patient.adherence.metrics.lastActivity.daysAgo', {
										days: metrics.daysSinceLastActivity,
									})
						}
						icon={
							metrics.daysSinceLastActivity > 7 ? (
								<UntitledIcon name="warning" size={16} />
							) : (
								<UntitledIcon name="clock" size={16} />
							)
						}
						status={activityStatus}
						loading={loading}
						subtitle={
							metrics.daysSinceLastActivity > 7 ? (
								<Text type="danger">{t('patient.adherence.metrics.lastActivity.inactive')}</Text>
							) : metrics.daysSinceLastActivity === 0 ? (
								<Text type="success">{t('patient.adherence.metrics.lastActivity.activeToday')}</Text>
							) : (
								<Text type="secondary">{t('patient.adherence.metrics.lastActivity.recentlyActive')}</Text>
							)
						}
						tooltip={t('patient.adherence.metrics.lastActivity.tooltip')}
						aria-label={t('patient.adherence.metrics.lastActivity.ariaLabel', {
							activity:
								metrics.daysSinceLastActivity === 0
									? t('patient.adherence.metrics.lastActivity.today')
									: t('patient.adherence.metrics.lastActivity.daysAgo', {
											days: metrics.daysSinceLastActivity,
										}),
							status:
								metrics.daysSinceLastActivity > 7
									? t('patient.adherence.metrics.lastActivity.inactive')
									: metrics.daysSinceLastActivity === 0
										? t('patient.adherence.metrics.lastActivity.activeToday')
										: t('patient.adherence.metrics.lastActivity.recentlyActive'),
						})}
					/>
				</Col>

				{/* Adherence Status */}
				<Col xs={24} sm={12} lg={6}>
					<EnhancedMetricCard
						title={t('patient.adherence.metrics.adherenceStatus.title')}
						value={
							metrics.isAdherent
								? t('patient.adherence.metrics.adherenceStatus.adherent')
								: t('patient.adherence.metrics.adherenceStatus.nonAdherent')
						}
						icon={
							metrics.isAdherent ? <UntitledIcon name="checkCircle" size={16} /> : <UntitledIcon name="warning" size={16} />
						}
						status={metrics.isAdherent ? 'success' : 'error'}
						loading={loading}
						subtitle={
							metrics.isAdherent ? (
								<Text type="success">{t('patient.adherence.metrics.adherenceStatus.meetingGoals')}</Text>
							) : (
								<Text type="danger">{t('patient.adherence.metrics.adherenceStatus.belowThreshold')}</Text>
							)
						}
						tooltip={t('patient.adherence.metrics.adherenceStatus.tooltip')}
						aria-label={t('patient.adherence.metrics.adherenceStatus.ariaLabel', {
							status: metrics.isAdherent
								? `${t('patient.adherence.metrics.adherenceStatus.adherent')} - ${t('patient.adherence.metrics.adherenceStatus.meetingGoals')}`
								: `${t('patient.adherence.metrics.adherenceStatus.nonAdherent')} - ${t('patient.adherence.metrics.adherenceStatus.belowThreshold')}`,
						})}
					/>
				</Col>
			</Row>
		</div>
	);
};

AdherenceMetrics.displayName = 'AdherenceMetrics';
