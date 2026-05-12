/**
 * MilestoneBadge Atom Component
 *
 * Displays milestone achievement badges with color coding and states.
 * Used in celebrations, progress dashboards, and achievement lists.
 *
 * Features:
 * - Color-coded by milestone type (gold/silver/bronze/blue/green)
 * - Earned/locked states with visual feedback
 * - Touch-friendly sizing (≥48px)
 * - Tooltip with milestone description
 * - Accessible with ARIA attributes
 * - Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <MilestoneBadge
 *   milestone={milestone}
 *   size="large"
 *   showTooltip
 * />
 * ```
 */

import React from 'react';
import { Tooltip } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { Milestone } from '@types/milestones';
import './MilestoneBadge.css';

export interface MilestoneBadgeProps {
	/** Milestone data (null for locked state) */
	milestone: Milestone | null;

	/** Badge size */
	size?: 'small' | 'medium' | 'large';

	/** Show tooltip with description */
	showTooltip?: boolean;

	/** Earned state (if milestone is null) */
	locked?: boolean;

	/** Additional CSS class */
	className?: string;

	/** Click handler */
	onClick?: () => void;
}

/**
 * Badge color to CSS class mapping
 */
const COLOR_CLASSES: Record<string, string> = {
	gold: 'milestone-badge--gold',
	silver: 'milestone-badge--silver',
	bronze: 'milestone-badge--bronze',
	blue: 'milestone-badge--blue',
	green: 'milestone-badge--green',
};

export const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
	milestone,
	size = 'medium',
	showTooltip = true,
	locked = false,
	className = '',
	onClick,
}) => {
	const isLocked = locked || !milestone;
	const badgeColor = milestone?.badgeColor || 'bronze';

	const containerClass = [
		'milestone-badge',
		`milestone-badge--${size}`,
		COLOR_CLASSES[badgeColor],
		isLocked ? 'milestone-badge--locked' : 'milestone-badge--earned',
		onClick ? 'milestone-badge--clickable' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	// Badge content
	const badgeContent = (
		<button
			className={containerClass}
			onClick={onClick}
			disabled={isLocked}
			aria-label={
				milestone
					? `${milestone.name} milestone - ${milestone.description}`
					: 'Locked milestone'
			}
			aria-pressed={!isLocked}
			type="button">
			{/* Badge Icon */}
			<div className="milestone-badge__icon">
				{isLocked ? (
					<UntitledIcon name="lock" size={20} className="milestone-badge__lock-icon" />
				) : (
					<UntitledIcon name="trophy" size={20} className="milestone-badge__trophy-icon" />
				)}
			</div>

			{/* Badge Name (for medium/large sizes) */}
			{size !== 'small' && (
				<div className="milestone-badge__label">
					{milestone ? milestone.name : 'Locked'}
				</div>
			)}
		</button>
	);

	// Wrap with tooltip if requested
	if (showTooltip && milestone) {
		return (
			<Tooltip
				title={
					<div className="milestone-badge__tooltip">
						<div className="milestone-badge__tooltip-title">
							{milestone.name}
						</div>
						<div className="milestone-badge__tooltip-description">
							{milestone.description}
						</div>
						{milestone.dateAchieved && (
							<div className="milestone-badge__tooltip-date">
								Achieved:{' '}
								{new Date(milestone.dateAchieved).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								})}
							</div>
						)}
					</div>
				}
				placement="top">
				{badgeContent}
			</Tooltip>
		);
	}

	return badgeContent;
};

export default MilestoneBadge;
