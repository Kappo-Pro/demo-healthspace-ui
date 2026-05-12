/**
 * AlertCard Types
 *
 * Type definitions for the AlertCard molecule component
 */

import { DashboardAlert } from '@stores/dashboard/alertTypes';

/**
 * AlertCard Props Interface
 *
 * Props for rendering a single dashboard alert card
 */
export interface AlertCardProps {
	/** Alert data to display */
	alert: DashboardAlert;

	/** Optional callback when alert is dismissed */
	onDismiss?: (alertId: string) => void;

	/** Optional additional CSS class */
	className?: string;
}
