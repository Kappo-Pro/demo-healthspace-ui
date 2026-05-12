/**
 * ImprovementSummary Molecule Component (Story 2.2)
 *
 * Displays summary of posture improvements, attention areas, and delta values
 *
 * Features:
 * - Visual progress indicators
 * - Color-coded improvements (green) and attention areas (yellow/orange)
 * - Delta values with arrows showing direction of change
 * - Responsive design (compact mode for mobile)
 *
 * @example
 * ```tsx
 * <ImprovementSummary
 *   summary={summaryData}
 *   improvements={improvementsArray}
 *   compact={false}
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { Card, Progress, Tag, Space, Row, Col } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import type { PostureComparisonSummary, ImprovementIndicator } from '@types';
import './styles.css';

export interface ImprovementSummaryProps {
	/** Summary data */
	summary: PostureComparisonSummary;

	/** Improvement indicators with delta values */
	improvements: ImprovementIndicator[];

	/** Optional CSS class name */
	className?: string;

	/** Compact mode for mobile */
	compact?: boolean;
}

export const ImprovementSummary: React.FC<ImprovementSummaryProps> = ({
	summary,
	improvements,
	className = '',
	compact = false,
}) => {
	const { t } = useTranslation();

	// Calculate overall progress percentage
	const progressPercentage = useMemo(() => {
		if (summary.totalAreas === 0) return 0;
		return Math.round((summary.improvedCount / summary.totalAreas) * 100);
	}, [summary.improvedCount, summary.totalAreas]);

	// Determine progress bar color
	const progressColor = useMemo(() => {
		if (summary.overallProgress === 'improved') {
			return 'var(--color-success-500)';
		} else if (summary.overallProgress === 'declined') {
			return 'var(--color-warning-500)';
		}
		return 'var(--color-neutral-400)';
	}, [summary.overallProgress]);

	// Get arrow icon based on direction
	const getDirectionIcon = (direction: ImprovementIndicator['direction']) => {
		switch (direction) {
			case 'improved':
				return <UntitledIcon name="arrowUp" size={16} style={{ color: 'var(--color-success-500)' }} />;
			case 'attention':
				return (
					<UntitledIcon name="arrowDown" size={16} style={{ color: 'var(--color-warning-500)' }} />
				);
			case 'stable':
				return <UntitledIcon name="close" size={16} style={{ color: 'var(--color-neutral-500)' }} />;
			default:
				return null;
		}
	};

	// Get tag color based on direction
	const getTagColor = (direction: ImprovementIndicator['direction']) => {
		switch (direction) {
			case 'improved':
				return 'success';
			case 'attention':
				return 'warning';
			case 'stable':
			default:
				return 'default';
		}
	};

	// Format delta value with sign
	const formatDelta = (value: number, unit: string): string => {
		const sign = value > 0 ? '+' : '';
		return `${sign}${value}${unit}`;
	};

	return (
		<Card
			className={`improvement-summary ${compact ? 'improvement-summary--compact' : ''} ${className}`}
			title={t('Patient.data.postures.progressSummary')}
			bordered={true}
		>
			{/* Overall progress */}
			<div className="improvement-summary__header">
				<Row gutter={[16, 16]}>
					<Col xs={24} md={12}>
						<div className="improvement-summary__progress">
							<p className="improvement-summary__progress-label">
								Overall Progress
							</p>
							<Progress
								percent={progressPercentage}
								strokeColor={progressColor}
								format={percent => `${percent}%`}
								size="small"
							/>
							<p className="improvement-summary__progress-status">
								<strong>{summary.overallProgress}</strong>
							</p>
						</div>
					</Col>
					<Col xs={24} md={12}>
						<Space
							direction="vertical"
							size="small"
							className="improvement-summary__stats"
						>
							<div className="improvement-summary__stat">
								<UntitledIcon
									name="checkCircle"
									size={16}
									style={{ color: 'var(--color-success-500)' }}
								/>
								<span>
									<strong>{summary.improvedCount}</strong> areas improved
								</span>
							</div>
							<div className="improvement-summary__stat">
								<UntitledIcon
									name="warning"
									size={16}
									style={{ color: 'var(--color-warning-500)' }}
								/>
								<span>
									<strong>{summary.attentionCount}</strong> need attention
								</span>
							</div>
							<div className="improvement-summary__stat">
								<UntitledIcon name="close" size={16} style={{ color: 'var(--color-neutral-500)' }} />
								<span>
									<strong>{summary.stableCount}</strong> stable
								</span>
							</div>
						</Space>
					</Col>
				</Row>
			</div>

			{/* Individual improvements */}
			{!compact && improvements.length > 0 && (
				<div className="improvement-summary__improvements">
					<h4 className="improvement-summary__improvements-title">
						Individual Metrics
					</h4>
					<div className="improvement-summary__improvements-list">
						{improvements.map(improvement => (
							<div
								key={improvement.id}
								className="improvement-summary__improvement-item"
							>
								<div className="improvement-summary__improvement-header">
									<span className="improvement-summary__body-part">
										{improvement.bodyPart}
									</span>
									<Tag color={getTagColor(improvement.direction)}>
										{improvement.direction}
									</Tag>
								</div>
								<div className="improvement-summary__improvement-value">
									{getDirectionIcon(improvement.direction)}
									<span className="improvement-summary__delta">
										{formatDelta(improvement.deltaValue, improvement.deltaUnit)}
									</span>
								</div>
								<p className="improvement-summary__description">
									{improvement.description}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Accessibility: Screen reader summary */}
			<div className="sr-only" role="status" aria-live="polite">
				{`Summary: ${summary.improvedCount} areas improved, ${summary.attentionCount} need attention, ${summary.stableCount} stable. Overall: ${summary.overallProgress}.`}
			</div>
		</Card>
	);
};

ImprovementSummary.displayName = 'ImprovementSummary';

export default ImprovementSummary;
