/**
 * Milestone Type Definitions
 *
 * Defines types for patient progress milestones and celebrations
 * Used for gamification and positive reinforcement in therapy adherence
 */

/**
 * Milestone type categories
 */
export type MilestoneType =
	| 'first_scan'
	| 'one_week_consistency'
	| 'one_month_consistency'
	| 'first_improvement'
	| 'exercise_streak_7'
	| 'exercise_streak_14'
	| 'exercise_streak_30';

/**
 * Milestone achievement data
 */
export interface Milestone {
	/** Unique identifier for milestone */
	id: string;

	/** Type of milestone achieved */
	type: MilestoneType;

	/** Display name for milestone */
	name: string;

	/** Description of achievement */
	description: string;

	/** Date milestone was achieved (ISO format) */
	dateAchieved: string;

	/** URL to badge icon */
	badgeIconUrl: string;

	/** URL to shareable card image */
	shareableCardUrl?: string;

	/** Badge color theme (maps to design system semantic colors) */
	// eslint-disable-next-line vitalflow/no-hardcoded-colors
	badgeColor: 'gold' | 'silver' | 'bronze' | 'blue' | 'green';
}

/**
 * Progress toward a milestone
 */
export interface MilestoneProgress {
	/** Type of milestone being tracked */
	milestoneType: MilestoneType;

	/** Current progress value */
	current: number;

	/** Target value for completion */
	target: number;

	/** Percentage complete (0-100) */
	percentComplete: number;

	/** Display name */
	name: string;

	/** Short description */
	description: string;
}

/**
 * Milestone state in Redux store
 */
export interface MilestoneState {
	/** Milestones earned by user */
	earned: Milestone[];

	/** Progress toward unearned milestones */
	progress: MilestoneProgress[];

	/** Last time milestones were evaluated (ISO format) */
	lastChecked: string;

	/** Loading state */
	loading: boolean;

	/** Error message if evaluation fails */
	error: string | null;
}

/**
 * Milestone evaluation result
 */
export interface MilestoneEvaluationResult {
	/** Newly earned milestones */
	newMilestones: Milestone[];

	/** Updated progress for unearned milestones */
	updatedProgress: MilestoneProgress[];

	/** Evaluation timestamp */
	evaluatedAt: string;
}

/**
 * Milestone criteria definition
 */
export interface MilestoneCriteria {
	type: MilestoneType;
	name: string;
	description: string;
	target: number;
	// Maps to design system semantic colors
	// eslint-disable-next-line vitalflow/no-hardcoded-colors
	badgeColor: 'gold' | 'silver' | 'bronze' | 'blue' | 'green';
	badgeIconUrl: string;
}

/**
 * Predefined milestone criteria
 * Note: badgeColor values are semantic names that map to design system tokens
 * These are not hardcoded color values, but keys used in CONFETTI_COLORS mapping
 */
/* eslint-disable vitalflow/no-hardcoded-colors */
export const MILESTONE_DEFINITIONS: Record<MilestoneType, MilestoneCriteria> = {
	first_scan: {
		type: 'first_scan',
		name: 'First Steps',
		description: 'Completed your first posture scan',
		target: 1,
		badgeColor: 'bronze',
		badgeIconUrl: '/assets/badges/first-scan.svg',
	},
	one_week_consistency: {
		type: 'one_week_consistency',
		name: 'One Week Streak',
		description: 'Completed 3+ scans in one week',
		target: 3,
		badgeColor: 'silver',
		badgeIconUrl: '/assets/badges/one-week.svg',
	},
	one_month_consistency: {
		type: 'one_month_consistency',
		name: 'Monthly Champion',
		description: 'Completed 12+ scans in one month',
		target: 12,
		badgeColor: 'gold',
		badgeIconUrl: '/assets/badges/one-month.svg',
	},
	first_improvement: {
		type: 'first_improvement',
		name: 'Making Progress',
		description: 'Improved posture score by 5+ points',
		target: 5,
		badgeColor: 'green',
		badgeIconUrl: '/assets/badges/improvement.svg',
	},
	exercise_streak_7: {
		type: 'exercise_streak_7',
		name: 'Week Warrior',
		description: 'Completed exercises for 7 consecutive days',
		target: 7,
		badgeColor: 'blue',
		badgeIconUrl: '/assets/badges/streak-7.svg',
	},
	exercise_streak_14: {
		type: 'exercise_streak_14',
		name: 'Two Week Champion',
		description: 'Completed exercises for 14 consecutive days',
		target: 14,
		badgeColor: 'silver',
		badgeIconUrl: '/assets/badges/streak-14.svg',
	},
	exercise_streak_30: {
		type: 'exercise_streak_30',
		name: 'Monthly Legend',
		description: 'Completed exercises for 30 consecutive days',
		target: 30,
		badgeColor: 'gold',
		badgeIconUrl: '/assets/badges/streak-30.svg',
	},
};
/* eslint-enable vitalflow/no-hardcoded-colors */

/**
 * Notification preferences for milestones
 */
export interface MilestoneNotificationPreferences {
	/** Show in-app toast notifications */
	inApp: boolean;

	/** Send push notifications */
	push: boolean;

	/** Send email notifications */
	email: boolean;

	/** Play sound effects */
	sound: boolean;
}
