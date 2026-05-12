/**
 * EnhancedMetricCard Molecule Component
 *
 * Advanced metric card with color gradients, trend arrows, and progress visualization.
 * Used in patient detail drawer for clinical analytics (FR12).
 *
 * Story 3.2: Clinical Analytics & Detailed Metrics
 * @module components/molecules/PostureMetricCard/EnhancedMetricCard
 */

import React from 'react';
import { Card, Progress, Typography } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './PostureMetricCard.css';

const { Text, Title } = Typography;

export interface EnhancedMetricCardProps {
	/** Metric title */
	title: string;

	/** Current value (0-100) */
	value: number;

	/** Trend indicator: +/- % change */
	trend?: number;

	/** Maximum value (default: 100) */
	max?: number;

	/** Custom CSS class */
	className?: string;

	/** Show detailed stats */
	showDetails?: boolean;

	/** Compact mode */
	compact?: boolean;
}

/**
 * Get color for posture score (0-100)
 * Matches PostureStatusBadge color scheme
 */
const getScoreColor = (score: number): string => {
	if (score >= 90) return 'var(--color-success)'; // excellent
	if (score >= 70) return 'var(--color-info)'; // good
	if (score >= 50) return 'var(--color-warning)'; // fair
	if (score >= 30) return 'var(--color-orange)'; // poor
	return 'var(--color-error)'; // critical
};

/**
 * Get trend icon and color based on change percentage
 */
const getTrendIndicator = (trend: number) => {
	if (trend > 0) {
		return {
			icon: <UntitledIcon name="arrowUp" size={14} />,
			color: 'var(--color-success)',
			label: `+${trend.toFixed(1)}%`,
		};
	}
	if (trend < 0) {
		return {
			icon: <UntitledIcon name="arrowDown" size={14} />,
			color: 'var(--color-error)',
			label: `${trend.toFixed(1)}%`,
		};
	}
	return {
		icon: <UntitledIcon name="close" size={14} />,
		color: 'var(--color-text-tertiary)',
		label: 'No change',
	};
};

export const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({
	title,
	value,
	trend,
	max = 100,
	className = '',
	showDetails = false,
	compact = false,
}) => {
	const { t } = useTypedTranslation();
	const percentage = (value / max) * 100;
	const scoreColor = getScoreColor(value);

	/**
	 * Get performance label based on score
	 */
	const getPerformanceLabel = (score: number): string => {
		if (score >= 90) return t('Patient.data.postures.detail.metrics.performance.excellent');
		if (score >= 70) return t('Patient.data.postures.detail.metrics.performance.good');
		if (score >= 50) return t('Patient.data.postures.detail.metrics.performance.fair');
		if (score >= 30) return t('Patient.data.postures.detail.metrics.performance.needsAttention');
		return t('Patient.data.postures.detail.metrics.performance.critical');
	};

	return (
		<Card
			className={`posture-metric-card enhanced-metric-card ${className}`.trim()}
			size={compact ? 'small' : 'default'}>
			<div className="posture-metric-card__header">
				<Title level={5} style={{ margin: 0 }}>
					{title}
				</Title>
				{trend !== undefined && (
					<div
						className="posture-metric-card__trend"
						style={{ color: getTrendIndicator(trend).color }}>
						{getTrendIndicator(trend).icon}
						<Text
							style={{
								color: getTrendIndicator(trend).color,
								marginLeft: 4,
								fontWeight: 'var(--font-weight-medium)',
							}}>
							{getTrendIndicator(trend).label}
						</Text>
					</div>
				)}
			</div>

			<div className="posture-metric-card__value">
				<Title level={compact ? 3 : 2} style={{ margin: 0, color: scoreColor }}>
					{value}
					<span style={{ fontSize: compact ? '1rem' : '1.5rem', opacity: 0.7 }}>
						/{max}
					</span>
				</Title>
			</div>

			<Progress
				percent={percentage}
				showInfo={false}
				strokeColor={scoreColor}
				trailColor="var(--color-border)"
				size={compact ? 'small' : 'default'}
				style={{ marginTop: 8 }}
			/>

			{showDetails && (
				<div className="posture-metric-card__details" style={{ marginTop: 12 }}>
					<Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
						{getPerformanceLabel(value)}
					</Text>
				</div>
			)}
		</Card>
	);
};

export default EnhancedMetricCard;
