/**
 * ProgressMetrics Molecule Component
 * Story 2.1: Patient Journey Timeline View (FR6, AC3)
 *
 * Displays patient progress metrics for the journey timeline:
 * - Overall posture score trend (0-100 scale)
 * - Number of scans completed
 * - Exercise adherence percentage (FR28)
 *
 * Features:
 * - Visual progress bars for each metric
 * - Trend indicators (improving/declining)
 * - Responsive layout (stacks on mobile)
 * - Accessible with ARIA labels
 *
 * @see PatientJourneyState.progress
 */

import React from 'react';
import { Typography, Progress, Row, Col, Statistic } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import './ProgressMetrics.css';

const { Title, Text } = Typography;

export interface ProgressMetricsProps {
	/** Total number of assessments completed */
	totalAssessments: number;

	/** Average posture score (0-100) */
	averageScore: number;

	/** Score improvement percentage (positive = improving) */
	scoreImprovement: number;

	/** Adherence rate percentage (0-100) */
	adherenceRate: number;

	/** Compact mode for smaller displays */
	compact?: boolean;

	/** Additional CSS class */
	className?: string;
}

/**
 * Get color for score-based metrics
 */
function getScoreColor(score: number): string {
	if (score >= 80) return 'var(--color-success-500)';
	if (score >= 60) return 'var(--color-warning-500)';
	return 'var(--color-error-500)';
}

/**
 * Get color for trend indicator
 */
function getTrendColor(improvement: number): string {
	if (improvement > 0) return 'var(--color-success-500)';
	if (improvement < 0) return 'var(--color-error-500)';
	return 'var(--color-neutral-500)';
}

/**
 * ProgressMetrics component
 */
export const ProgressMetrics: React.FC<ProgressMetricsProps> = ({
	totalAssessments,
	averageScore,
	scoreImprovement,
	adherenceRate,
	compact = false,
	className = '',
}) => {
	const trendIcon =
		scoreImprovement > 0 ? <UntitledIcon name="arrowUp" size={16} /> : <UntitledIcon name="arrowDown" size={16} />;
	const trendColor = getTrendColor(scoreImprovement);

	return (
		<div
			className={`
				progress-metrics
				${compact ? 'progress-metrics--compact' : ''}
				${className}
			`}
			role="region"
			aria-label="Progress Metrics">
			{!compact && (
				<Title level={4} className="progress-metrics__title">
					Your Progress
				</Title>
			)}

			<Row gutter={[16, 16]}>
				{/* Average Score */}
				<Col xs={24} sm={12} md={compact ? 24 : 6}>
					<div className="progress-metrics__card">
						<Statistic
							title="Average Score"
							value={averageScore.toFixed(1)}
							suffix="/ 100"
							valueStyle={{ color: getScoreColor(averageScore) }}
							prefix={<UntitledIcon name="trophy" size={16} />}
						/>
						<Progress
							percent={averageScore}
							strokeColor={getScoreColor(averageScore)}
							showInfo={false}
							size="small"
						/>
					</div>
				</Col>

				{/* Total Assessments */}
				<Col xs={24} sm={12} md={compact ? 24 : 6}>
					<div className="progress-metrics__card">
						<Statistic
							title="Scans Completed"
							value={totalAssessments}
							prefix={<UntitledIcon name="checkCircle" size={16} />}
							valueStyle={{ color: 'var(--color-primary-500)' }}
						/>
					</div>
				</Col>

				{/* Score Improvement */}
				<Col xs={24} sm={12} md={compact ? 24 : 6}>
					<div className="progress-metrics__card">
						<Statistic
							title="Score Improvement"
							value={Math.abs(scoreImprovement).toFixed(1)}
							suffix="%"
							prefix={trendIcon}
							valueStyle={{ color: trendColor }}
						/>
						{scoreImprovement > 0 && (
							<Text
								style={{
									color: 'var(--color-success-600)',
									fontSize: 'var(--font-size-xs)',
								}}>
								Great progress!
							</Text>
						)}
						{scoreImprovement < 0 && (
							<Text
								style={{
									color: 'var(--color-error-600)',
									fontSize: 'var(--font-size-xs)',
								}}>
								Keep trying!
							</Text>
						)}
					</div>
				</Col>

				{/* Adherence Rate */}
				<Col xs={24} sm={12} md={compact ? 24 : 6}>
					<div className="progress-metrics__card">
						<Statistic
							title="Exercise Adherence"
							value={adherenceRate.toFixed(0)}
							suffix="%"
							valueStyle={{ color: getScoreColor(adherenceRate) }}
						/>
						<Progress
							percent={adherenceRate}
							strokeColor={getScoreColor(adherenceRate)}
							showInfo={false}
							size="small"
						/>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default ProgressMetrics;
