/**
 * AlertCard - Molecule Component
 *
 * Displays a single dashboard alert using Ant Design Alert component.
 * Supports all alert variants (success, info, warning, error) with optional
 * action buttons and dismissal handling.
 *
 * EPIC-015-S1: Dashboard Alert Display
 */

import React from 'react';
import { Alert, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AlertCardProps } from './types';

/**
 * AlertCard Component
 *
 * Renders a single alert with optional action button and dismiss capability
 *
 * @component
 * @example
 * ```tsx
 * <AlertCard
 *   alert={alertData}
 *   onDismiss={(id) => handleDismiss(id)}
 * />
 * ```
 */
export const AlertCard: React.FC<AlertCardProps> = ({
	alert,
	onDismiss,
	className,
}) => {
	const navigate = useNavigate();

	/**
	 * Handle action button click
	 * Navigates to the URL specified in the alert
	 */
	const handleActionClick = () => {
		if (alert.actionUrl) {
			navigate(alert.actionUrl);
		}
	};

	/**
	 * Handle alert dismissal
	 * Calls parent onDismiss callback with alert ID
	 */
	const handleClose = () => {
		if (onDismiss) {
			onDismiss(alert.id);
		}
	};

	return (
		<Alert
			type={alert.variant}
			message={alert.title}
			description={alert.message}
			showIcon
			closable={alert.dismissible}
			onClose={handleClose}
			className={className}
			action={
				alert.actionLabel && alert.actionUrl ? (
					<Button
						size="small"
						type="primary"
						onClick={handleActionClick}
					>
						{alert.actionLabel}
					</Button>
				) : undefined
			}
		/>
	);
};

AlertCard.displayName = 'AlertCard';
