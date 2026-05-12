/**
 * Assessment Status Banner Types
 *
 * Type definitions for the AssessmentStatusBanner organism component
 * that displays multiple assessment cards (ROM, Posture, Survey) in a responsive grid.
 */

/**
 * Individual assessment data structure
 */
export interface AssessmentData {
	/** Type of assessment */
	type: 'rom' | 'posture' | 'survey';

	/** Current status of the assessment */
	status: 'completed' | 'pending' | 'expired';

	/** Last time the assessment was updated (ISO 8601 string) */
	lastUpdated?: string;

	/** Assessment score (if completed) */
	score?: number;

	/** Additional assessment-specific data */
	data?: unknown;
}

/**
 * Props for AssessmentStatusBanner component
 */
export interface AssessmentStatusBannerProps {
	/** Array of assessment data to display as cards */
	assessments: AssessmentData[];

	/** Optional CSS class name for custom styling */
	className?: string;
}
