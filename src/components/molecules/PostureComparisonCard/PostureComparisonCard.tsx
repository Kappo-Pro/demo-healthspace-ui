/**
 * PostureComparisonCard Molecule Component
 *
 * Displays side-by-side comparison of current vs baseline posture metrics.
 * Composes PostureStatusBadge and TrendIndicator atoms.
 *
 * Features:
 * - Side-by-side metric comparison
 * - Visual trend indicators
 * - Percentage change calculations
 * - Responsive grid layout
 * - Interactive metric selection
 *
 * @example
 * ```tsx
 * <PostureComparisonCard
 *   comparison={{
 *     current: { sessionId: '1', score: 85, ... },
 *     baseline: { sessionId: '0', score: 72, ... },
 *     improvements: { overallChange: 18, ... }
 *   }}
 * />
 * ```
 */

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { PostureStatusBadge } from '@atoms/PostureStatusBadge';
import { TrendIndicator } from '@atoms/TrendIndicator/TrendIndicator';
import type { PostureComparison, PostureStatus } from '@types/posture';
import './PostureComparisonCard.css';

export interface PostureComparisonCardProps {
	/** Comparison data */
	comparison: PostureComparison;

	/** Show all metric details */
	showMetricDetails?: boolean;

	/** Card title */
	title?: string;

	/** Additional CSS class */
	className?: string;
}

/**
 * Derive status from score
 */
const getStatusFromScore = (score: number): PostureStatus => {
	if (score >= 90) return 'excellent';
	if (score >= 70) return 'good';
	if (score >= 50) return 'fair';
	if (score >= 30) return 'poor';
	return 'critical';
};

/**
 * Format date for display
 */
const formatDate = (isoDate: string): string => {
	return new Date(isoDate).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

export const PostureComparisonCard: React.FC<PostureComparisonCardProps> = ({
	comparison,
	showMetricDetails = true,
	title = 'Posture Comparison',
	className = '',
}) => {
	const currentStatus = getStatusFromScore(comparison.current.score);
	const baselineStatus = getStatusFromScore(comparison.baseline.score);

	return (
		<Card
			className={`posture-comparison-card ${className}`.trim()}
			title={title}>
			{/* Overall Score Comparison */}
			<div className="posture-comparison-card__header">
				<Row gutter={24}>
					<Col xs={24} sm={11}>
						<div className="posture-comparison-card__session">
							<h4 className="posture-comparison-card__session-title">
								Current
							</h4>
							<p className="posture-comparison-card__session-date">
								{formatDate(comparison.current.timestamp)}
							</p>
							<div className="posture-comparison-card__score">
								<Statistic
									value={comparison.current.score}
									suffix="/ 100"
									valueStyle={{ fontSize: '32px', fontWeight: 'bold' }}
								/>
							</div>
							<PostureStatusBadge status={currentStatus} size="large" />
						</div>
					</Col>

					<Col xs={24} sm={2} className="posture-comparison-card__divider-col">
						<div className="posture-comparison-card__divider">
							<TrendIndicator value={comparison.improvements.overallChange} />
						</div>
					</Col>

					<Col xs={24} sm={11}>
						<div className="posture-comparison-card__session posture-comparison-card__session--baseline">
							<h4 className="posture-comparison-card__session-title">
								Baseline
							</h4>
							<p className="posture-comparison-card__session-date">
								{formatDate(comparison.baseline.timestamp)}
							</p>
							<div className="posture-comparison-card__score">
								<Statistic
									value={comparison.baseline.score}
									suffix="/ 100"
									valueStyle={{
										fontSize: '32px',
										fontWeight: 'bold',
										color: 'var(--text-secondary)',
									}}
								/>
							</div>
							<PostureStatusBadge status={baselineStatus} size="large" />
						</div>
					</Col>
				</Row>
			</div>

			{/* Individual Metric Comparisons */}
			{showMetricDetails && (
				<div className="posture-comparison-card__metrics">
					<h4 className="posture-comparison-card__metrics-title">
						Individual Metrics
					</h4>

					<div className="posture-comparison-card__metrics-grid">
						{Object.entries(comparison.improvements.metricChanges).map(
							([metric, change]) => {
								const currentValue =
									comparison.current.metrics[
										metric as keyof typeof comparison.current.metrics
									];
								const baselineValue =
									comparison.baseline.metrics[
										metric as keyof typeof comparison.baseline.metrics
									];

								return (
									<div
										key={metric}
										className="posture-comparison-card__metric-row">
										<div className="posture-comparison-card__metric-name">
											{metric.replace(/([A-Z])/g, ' $1').trim()}
										</div>
										<div className="posture-comparison-card__metric-values">
											<span className="posture-comparison-card__metric-current">
												{currentValue}
											</span>
											<span className="posture-comparison-card__metric-separator">
												vs
											</span>
											<span className="posture-comparison-card__metric-baseline">
												{baselineValue}
											</span>
										</div>
										<div className="posture-comparison-card__metric-change">
											<TrendIndicator value={change} />
										</div>
									</div>
								);
							},
						)}
					</div>
				</div>
			)}
		</Card>
	);
};

export default PostureComparisonCard;
