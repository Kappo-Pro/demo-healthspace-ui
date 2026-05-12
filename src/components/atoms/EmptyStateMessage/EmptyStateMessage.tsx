/**
 * EmptyStateMessage Atom Component
 *
 * Displays empty state messages with optional call-to-action buttons.
 * Used when no data is available or search returns no results.
 *
 * Features:
 * - Multiple empty state types (no-data, no-results, error, permission-denied)
 * - Optional icon display
 * - Optional call-to-action button
 * - Responsive layout
 * - Accessible with ARIA labels
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <EmptyStateMessage
 *   title={t('emptyState.noAssessmentsYet')}
 *   description={t('emptyState.completeFirstAssessment')}
 *   cta={{
 *     label: 'Start Assessment',
 *     onClick: () => navigate('/assessment')
 *   }}
 * />
 * ```
 */

import React from 'react';
import { Button } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { EmptyStateConfig } from '@types/posture';
import './EmptyStateMessage.css';

export interface EmptyStateMessageProps extends Omit<EmptyStateConfig, 'icon'> {
	/** Icon to display (custom or default based on type) */
	icon?: React.ReactNode;

	/** Empty state type (affects default icon and styling) */
	type?: 'no-data' | 'no-results' | 'error' | 'permission-denied';

	/** Additional CSS class */
	className?: string;
}

/**
 * Default icons for each empty state type
 */
const DEFAULT_ICONS: Record<
	NonNullable<EmptyStateMessageProps['type']>,
	React.ReactNode
> = {
	'no-data': <UntitledIcon name="project" size={48} />,
	'no-results': <UntitledIcon name="search" size={48} />,
	error: <UntitledIcon name="exclamationCircle" size={48} />,
	'permission-denied': <UntitledIcon name="lock" size={48} />,
};

export const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
	title,
	description,
	icon,
	cta,
	type = 'no-data',
	className = '',
}) => {
	// Use provided icon or default based on type
	const displayIcon = icon ?? DEFAULT_ICONS[type];

	const containerClass = [
		'empty-state-message',
		`empty-state-message--${type}`,
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div
			className={containerClass}
			role="status"
			aria-live="polite"
			aria-label={`${title}: ${description}`}>
			{/* Icon */}
			{displayIcon && (
				<div className="empty-state-message__icon">{displayIcon}</div>
			)}

			{/* Title */}
			<h3 className="empty-state-message__title">{title}</h3>

			{/* Description */}
			<p className="empty-state-message__description">{description}</p>

			{/* Call to Action */}
			{cta && (
				<Button
					type={cta.variant === 'secondary' ? 'default' : 'primary'}
					onClick={cta.onClick}
					className="empty-state-message__cta">
					{cta.label}
				</Button>
			)}
		</div>
	);
};

export default EmptyStateMessage;
