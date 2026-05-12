/**
 * MilestoneMarker Atom Component
 * Story 2.1: Patient Journey Timeline View (FR6, FR8)
 *
 * Displays a single milestone marker on the patient journey timeline.
 * Features:
 * - Date label and status indicator
 * - Achievement badges (1 week, 1 month, 3 months)
 * - Visual distinction between achieved/upcoming milestones
 * - Touch targets ≥44x44px (WCAG 2.5.5 AAA)
 * - Keyboard accessible and screen reader friendly
 *
 * @see PatientMilestone type definition
 */

import React from 'react';
import { Badge, Typography } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { PatientMilestone } from '@types';
import './MilestoneMarker.css';

const { Text } = Typography;

export interface MilestoneMarkerProps {
	/** Milestone data */
	milestone: PatientMilestone;

	/** Whether this is the current/active milestone */
	isActive?: boolean;

	/** Click handler (optional) */
	onClick?: (milestone: PatientMilestone) => void;

	/** Additional CSS class */
	className?: string;
}

/**
 * Icon mapping for milestone types
 */
const MILESTONE_ICONS = {
	assessment: <UntitledIcon name="calendar" size={16} />,
	improvement: <UntitledIcon name="trophy" size={16} />,
	goal: <UntitledIcon name="project" size={16} />,
	treatment: <UntitledIcon name="checkCircleFilled" size={16} />,
};

/**
 * Format date for display
 */
function formatMilestoneDate(timestamp: string | null): string {
	if (!timestamp) return 'Upcoming';

	const date = new Date(timestamp);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

/**
 * MilestoneMarker component
 */
export const MilestoneMarker: React.FC<MilestoneMarkerProps> = ({
	milestone,
	isActive = false,
	onClick,
	className = '',
}) => {
	const isAchieved = milestone.achievedAt !== null;
	const icon = MILESTONE_ICONS[milestone.type];

	const handleClick = () => {
		if (onClick) {
			onClick(milestone);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (onClick && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			onClick(milestone);
		}
	};

	return (
		<div
			className={`
				milestone-marker
				${isAchieved ? 'milestone-marker--achieved' : 'milestone-marker--upcoming'}
				${isActive ? 'milestone-marker--active' : ''}
				${onClick ? 'milestone-marker--clickable' : ''}
				${className}
			`}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role={onClick ? 'button' : 'article'}
			tabIndex={onClick ? 0 : undefined}
			aria-label={`${milestone.title}: ${isAchieved ? 'Achieved' : 'Upcoming'} on ${formatMilestoneDate(milestone.achievedAt)}`}>
			{/* Icon Badge */}
			<div className="milestone-marker__icon">
				<Badge
					status={isAchieved ? 'success' : 'default'}
					count={
						isAchieved ? (
							<UntitledIcon
								name="checkCircleFilled"
								size={16}
								style={{ color: 'var(--color-success-500)' }}
							/>
						) : (
							0
						)
					}>
					<div
						className="milestone-marker__icon-circle"
						style={{
							backgroundColor: isAchieved
								? 'var(--color-success-100)'
								: 'var(--color-neutral-200)',
							color: isAchieved
								? 'var(--color-success-600)'
								: 'var(--color-neutral-500)',
						}}>
						{icon}
					</div>
				</Badge>
			</div>

			{/* Content */}
			<div className="milestone-marker__content">
				<Text
					strong
					className="milestone-marker__title"
					style={{ color: 'var(--color-text-primary)' }}>
					{milestone.title}
				</Text>

				{milestone.description && (
					<Text
						type="secondary"
						className="milestone-marker__description"
						style={{ color: 'var(--color-text-secondary)' }}>
						{milestone.description}
					</Text>
				)}

				<Text
					className="milestone-marker__date"
					style={{ color: 'var(--color-text-tertiary)' }}>
					{formatMilestoneDate(milestone.achievedAt)}
				</Text>

				{/* Metric Improvement (if available) */}
				{milestone.metricImprovement && isAchieved && (
					<div className="milestone-marker__improvement">
						<Text
							style={{
								color: 'var(--color-success-600)',
								fontSize: 'var(--font-size-sm)',
							}}>
							{milestone.metricImprovement.metric}:{' '}
							{milestone.metricImprovement.before} →{' '}
							{milestone.metricImprovement.after}
							{' (+'}
							{(
								milestone.metricImprovement.after -
								milestone.metricImprovement.before
							).toFixed(1)}
							{')'}
						</Text>
					</div>
				)}
			</div>
		</div>
	);
};

export default MilestoneMarker;
