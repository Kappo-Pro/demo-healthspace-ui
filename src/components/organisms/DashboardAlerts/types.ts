/**
 * DashboardAlerts Types
 *
 * Type definitions for the DashboardAlerts organism component
 */

/**
 * DashboardAlerts Props Interface
 *
 * Props for rendering the dashboard alerts container
 */
export interface DashboardAlertsProps {
	/** Optional CSS class for styling */
	className?: string;

	/** Maximum number of alerts to display (default: 3) */
	maxAlerts?: number;
}
