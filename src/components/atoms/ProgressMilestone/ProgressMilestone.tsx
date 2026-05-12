/**
 * ProgressMilestone Atom Component
 *
 * Displays patient journey milestones with achievement status.
 * Used in timeline views and progress tracking.
 *
 * Features:
 * - Visual milestone markers (achieved/pending)
 * - Type-specific icons (assessment/improvement/goal/treatment)
 * - Achievement date display
 * - Metric improvement display
 * - Accessible with ARIA labels
 *
 * @example
 * ```tsx
 * <ProgressMilestone
 *   milestone={{
 *     id: '1',
 *     title: 'First Assessment',
 *     achievedAt: '2025-01-15',
 *     type: 'assessment'
 *   }}
 * />
 * ```
 */

import React from 'react';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import type { PatientMilestone } from '@types/posture';
import './ProgressMilestone.css';

export interface ProgressMilestoneProps {
	/** Milestone data */
	milestone: PatientMilestone;

	/** Show metric improvement (if available) */
	showMetricImprovement?: boolean;

	/** Compact mode (reduced spacing) */
	compact?: boolean;

	/** Additional CSS class */
	className?: string;
}

/**
 * Milestone type icon mapping
 */
const TYPE_ICONS: Record<PatientMilestone['type'], React.ReactNode> = {
	assessment: <UntitledIcon name="clipboardCheck" size={16} />,
	improvement: <UntitledIcon name="activity" size={16} />,
	goal: <UntitledIcon name="trophy" size={16} />,
	treatment: <UntitledIcon name="heart" size={16} />,
};

export const ProgressMilestone: React.FC<ProgressMilestoneProps> = ({
	milestone,
	showMetricImprovement = true,
	compact = false,
	className = '',
}) => {
	const { t } = useTranslation();
	const isAchieved = milestone.achievedAt !== null;

	const containerClass = [
		'progress-milestone',
		isAchieved ? 'progress-milestone--achieved' : 'progress-milestone--pending',
		compact ? 'progress-milestone--compact' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	// Format achievement date
	const formattedDate = milestone.achievedAt
		? new Date(milestone.achievedAt).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		: null;

	// Get type icon
	const typeIcon = TYPE_ICONS[milestone.type];

	// Calculate improvement percentage
	const improvementPercent = milestone.metricImprovement
		? (
				((milestone.metricImprovement.after -
					milestone.metricImprovement.before) /
					milestone.metricImprovement.before) *
				100
			).toFixed(0)
		: null;

	return (
		<div
			className={containerClass}
			role="listitem"
			aria-label={`${milestone.title} - ${isAchieved ? 'Achieved' : 'Pending'}`}>
			{/* Status Icon */}
			<div className="progress-milestone__status-icon">
				{isAchieved ? (
					<UntitledIcon name="checkCircleFilled" size={20} className="progress-milestone__status-icon--achieved" />
				) : (
					<UntitledIcon name="clock" size={20} className="progress-milestone__status-icon--pending" />
				)}
			</div>

			{/* Content */}
			<div className="progress-milestone__content">
				{/* Type Icon + Title */}
				<div className="progress-milestone__header">
					<span className="progress-milestone__type-icon">{typeIcon}</span>
					<h4 className="progress-milestone__title">{milestone.title}</h4>
				</div>

				{/* Description */}
				{milestone.description && (
					<p className="progress-milestone__description">
						{milestone.description}
					</p>
				)}

				{/* Achievement Date */}
				{formattedDate && (
					<p className="progress-milestone__date">
						<span className="progress-milestone__date-label">
							{t('Patient.data.progress.milestone.achieved')}
						</span>{' '}
						{formattedDate}
					</p>
				)}

				{/* Metric Improvement */}
				{showMetricImprovement &&
					milestone.metricImprovement &&
					improvementPercent && (
						<div className="progress-milestone__metric-improvement">
							<span className="progress-milestone__metric-name">
								{milestone.metricImprovement.metric}:
							</span>
							<span className="progress-milestone__metric-values">
								{milestone.metricImprovement.before} →{' '}
								{milestone.metricImprovement.after}
							</span>
							<span
								className={`progress-milestone__metric-change ${
									Number(improvementPercent) > 0 ? 'positive' : 'negative'
								}`}>
								({improvementPercent > '0' ? '+' : ''}
								{improvementPercent}%)
							</span>
						</div>
					)}
			</div>
		</div>
	);
};

export default ProgressMilestone;
