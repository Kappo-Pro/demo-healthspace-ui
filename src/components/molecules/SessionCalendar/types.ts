/**
 * SessionCalendar Types
 * EPIC-022-S1: Session Calendar Molecule
 */

/**
 * Session data point representing a day's session count
 */
export interface SessionData {
	/** Date in YYYY-MM-DD format */
	date: string;
	/** Number of sessions completed on this date */
	count: number;
}

/**
 * Props for SessionCalendar component
 */
export interface SessionCalendarProps {
	/** Array of session data points */
	data: SessionData[];
	/** Loading state indicator */
	loading?: boolean;
	/** Custom CSS class name */
	className?: string;
}
