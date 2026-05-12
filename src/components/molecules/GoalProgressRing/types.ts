/**
 * GoalProgressRing Types
 *
 * Type definitions for the GoalProgressRing molecule component
 */

/**
 * GoalProgressRing Props Interface
 *
 * Props for rendering a circular progress ring with goal completion percentage
 */
export interface GoalProgressRingProps {
	/** Title/name of the goal being tracked */
	title: string;

	/** Progress percentage (0-100) */
	progress: number;

	/** Optional diameter size in pixels (default: 120) */
	size?: number;

	/** Optional loading state */
	loading?: boolean;

	/** Optional additional CSS class */
	className?: string;

	/** Optional ARIA label for accessibility */
	ariaLabel?: string;
}

/**
 * Progress Color Thresholds
 *
 * Defines color ranges based on progress percentage
 */
export type ProgressColorThreshold = 'warning' | 'primary' | 'success';
