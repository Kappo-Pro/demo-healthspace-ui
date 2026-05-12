/**
 * Empty State Configurations for Posture Analytics
 * Story 2.5: Empty States with Contextual Guidance
 *
 * Defines empty state scenarios, copy, CTAs, and illustrations
 * for posture analytics patient journey.
 */

export type EmptyStateType =
	| 'no_scans_ever'
	| 'no_recent_scans'
	| 'no_exercise_adherence';

export interface EmptyStateConfig {
	type: EmptyStateType;
	title: string;
	description: string;
	illustration: {
		src: string;
		alt: string;
	};
	primaryCTA: {
		text: string;
		action: 'navigate' | 'modal';
		target: string;
	};
	secondaryCTA?: {
		text: string;
		action: 'navigate' | 'modal';
		target: string;
	};
	contextInfo?: {
		timeCommitment?: string;
		privacyNote?: string;
	};
}

/**
 * Empty state configurations
 */
export const EMPTY_STATE_CONFIGS: Record<EmptyStateType, EmptyStateConfig> = {
	no_scans_ever: {
		type: 'no_scans_ever',
		title: 'Start Your Posture Journey',
		description:
			"Capture your first posture scan in just 5 minutes. We'll analyze your posture and provide personalized recommendations to help you feel better.",
		illustration: {
			src: '/illustrations/posture-scan.svg',
			alt: 'Illustration of a person standing in front of a camera for posture analysis',
		},
		primaryCTA: {
			text: 'Schedule Your First Scan',
			action: 'navigate',
			target: '/posture-scan',
		},
		secondaryCTA: {
			text: 'Learn About Posture Analysis',
			action: 'modal',
			target: 'posture-info',
		},
		contextInfo: {
			timeCommitment: '5 minutes',
			privacyNote:
				'Your posture data is private and secure. We never share your information without your permission.',
		},
	},

	no_recent_scans: {
		type: 'no_recent_scans',
		title: 'Time for Your Next Scan',
		description:
			"Regular scans help us track your progress and adjust your treatment plan. Schedule your next scan to keep moving forward!",
		illustration: {
			src: '/illustrations/calendar-reminder.svg',
			alt: 'Illustration of a calendar with a reminder notification',
		},
		primaryCTA: {
			text: 'Schedule Next Scan',
			action: 'navigate',
			target: '/posture-scan',
		},
		contextInfo: {
			timeCommitment: '5 minutes',
		},
	},

	no_exercise_adherence: {
		type: 'no_exercise_adherence',
		title: 'Ready to Start Improving?',
		description:
			"Based on your posture scan, we've recommended exercises that can help. Start with just 10 minutes a day!",
		illustration: {
			src: '/illustrations/exercise.svg',
			alt: 'Illustration of a person performing stretching exercises',
		},
		primaryCTA: {
			text: 'View My Exercises',
			action: 'navigate',
			target: '/exercises',
		},
	},
};

/**
 * Get empty state configuration by type
 */
export function getEmptyStateConfig(type: EmptyStateType): EmptyStateConfig {
	return EMPTY_STATE_CONFIGS[type];
}

/**
 * Get dynamic description with interpolated values
 */
export function getEmptyStateDescription(
	type: EmptyStateType,
	data?: { days?: number; count?: number },
): string {
	const config = EMPTY_STATE_CONFIGS[type];

	if (type === 'no_recent_scans' && data?.days) {
		return `It's been ${data.days} days since your last scan. Regular scans help us track your progress and adjust your treatment plan. Schedule your next scan to keep moving forward!`;
	}

	if (type === 'no_exercise_adherence' && data?.count) {
		return `Based on your posture scan, we've recommended ${data.count} exercises that can help. Start with just 10 minutes a day!`;
	}

	return config.description;
}
