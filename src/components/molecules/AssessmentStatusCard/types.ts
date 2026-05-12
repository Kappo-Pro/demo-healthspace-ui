export type AssessmentType = 'rom' | 'posture' | 'survey';
export type AssessmentStatus = 'completed' | 'pending' | 'expired';

export interface AssessmentStatusCardProps {
	/**
	 * Type of assessment (ROM, Posture, or Survey)
	 */
	type: AssessmentType;

	/**
	 * Current status of the assessment
	 */
	status: AssessmentStatus;

	/**
	 * ISO date string of last update
	 */
	lastUpdated: string;

	/**
	 * Score value (0-100) or null if not available
	 */
	score: number | null;

	/**
	 * Callback when CTA button is clicked
	 */
	onAction: () => void;
}

export interface StatusBadgeConfig {
	text: string;
	color: 'success' | 'warning' | 'error';
	icon: React.ReactElement;
}
