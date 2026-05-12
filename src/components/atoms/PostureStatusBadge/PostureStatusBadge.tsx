/**
 * PostureStatusBadge Atom Component
 *
 * Displays posture assessment status with color-coded badges.
 * Supports 5 status levels with semantic colors and icons.
 *
 * Features:
 * - Color-coded status indicators (excellent/good/fair/poor/critical)
 * - Optional icon display
 * - Responsive sizing
 * - Accessible with ARIA labels
 * - Theme-aware (light/dark mode)
 *
 * @example
 * ```tsx
 * <PostureStatusBadge status="excellent" />
 * <PostureStatusBadge status="poor" showIcon={false} />
 * <PostureStatusBadge status="critical" size="large" />
 * ```
 */

import React from 'react';
import { UntitledIcon } from '@atoms/Icon';
import type { PostureStatus } from '@types/posture';
import './PostureStatusBadge.css';

export interface PostureStatusBadgeProps {
	/** Posture status level */
	status: PostureStatus;

	/** Show icon next to text */
	showIcon?: boolean;

	/** Badge size variant */
	size?: 'small' | 'default' | 'large';

	/** Additional CSS class */
	className?: string;
}

/**
 * Status configuration mapping
 */
const STATUS_CONFIG: Record<
	PostureStatus,
	{
		color: string;
		label: string;
		icon: React.ReactNode;
		ariaLabel: string;
	}
> = {
	excellent: {
		color: 'var(--color-success-600)',
		label: 'Excellent',
		icon: <UntitledIcon name="checkCircle" size={16} />,
		ariaLabel: 'Excellent posture - no issues detected',
	},
	good: {
		color: 'var(--color-success-500)',
		label: 'Good',
		icon: <UntitledIcon name="smile" size={16} />,
		ariaLabel: 'Good posture - minor improvements possible',
	},
	fair: {
		color: 'var(--color-warning-600)',
		label: 'Fair',
		icon: <UntitledIcon name="smile" size={16} />,
		ariaLabel: 'Fair posture - moderate issues detected',
	},
	poor: {
		color: 'var(--color-error-500)',
		label: 'Poor',
		icon: <UntitledIcon name="smile" size={16} />,
		ariaLabel: 'Poor posture - significant issues detected',
	},
	critical: {
		color: 'var(--color-error-600)',
		label: 'Critical',
		icon: <UntitledIcon name="warning" size={16} />,
		ariaLabel: 'Critical posture - immediate attention required',
	},
};

export const PostureStatusBadge: React.FC<PostureStatusBadgeProps> = ({
	status,
	showIcon = true,
	size = 'default',
	className = '',
}) => {
	const config = STATUS_CONFIG[status];

	const sizeClass = `posture-status-badge--${size}`;
	const containerClass =
		`posture-status-badge ${sizeClass} ${className}`.trim();

	return (
		<span
			className={containerClass}
			style={{ color: config.color }}
			role="status"
			aria-label={config.ariaLabel}>
			{showIcon && (
				<span className="posture-status-badge__icon">{config.icon}</span>
			)}
			<span className="posture-status-badge__label">{config.label}</span>
		</span>
	);
};

export default PostureStatusBadge;
