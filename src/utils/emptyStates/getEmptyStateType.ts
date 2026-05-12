/**
 * Empty State Type Detection Utility
 * Story 2.5: Empty States with Contextual Guidance
 *
 * Determines which empty state to display based on patient data.
 */

import type { PatientJourneyState } from '../../types/posture';
import type { EmptyStateType } from '../../config/emptyStates/postureAnalytics';

/**
 * Configuration for empty state detection thresholds
 */
const EMPTY_STATE_THRESHOLDS = {
	/** Days since last scan to show "no recent scans" state */
	DAYS_SINCE_LAST_SCAN: 14,
} as const;

/**
 * Calculate days since a given date
 */
function getDaysSince(dateString: string): number {
	const date = new Date(dateString);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - date.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}

/**
 * Determine which empty state to display
 *
 * Priority order:
 * 1. No scans ever (never completed any posture scan)
 * 2. No recent scans (last scan was > 14 days ago)
 * 3. No exercise adherence (no exercise completions tracked)
 *
 * @param journeyData - Patient journey state
 * @param exerciseCompletionCount - Number of exercise sessions completed
 * @returns Empty state type or null if data exists
 */
export function getEmptyStateType(
	journeyData: PatientJourneyState | null,
	exerciseCompletionCount = 0,
): { type: EmptyStateType; data?: Record<string, number> } | null {
	// No journey data = no scans ever
	if (!journeyData || journeyData.sessions.length === 0) {
		return { type: 'no_scans_ever' };
	}

	// Check for recent scans
	const lastSession = journeyData.sessions[journeyData.sessions.length - 1];
	const daysSinceLastScan = getDaysSince(lastSession.timestamp);

	if (daysSinceLastScan > EMPTY_STATE_THRESHOLDS.DAYS_SINCE_LAST_SCAN) {
		return {
			type: 'no_recent_scans',
			data: { days: daysSinceLastScan },
		};
	}

	// Check for exercise adherence
	if (exerciseCompletionCount === 0) {
		// TODO: Get actual recommended exercise count from Redux state
		// For now, use placeholder value
		const recommendedExerciseCount = 5;

		return {
			type: 'no_exercise_adherence',
			data: { count: recommendedExerciseCount },
		};
	}

	// No empty state needed - show normal journey view
	return null;
}

/**
 * Check if empty state should be displayed
 */
export function shouldShowEmptyState(
	journeyData: PatientJourneyState | null,
	exerciseCompletionCount = 0,
): boolean {
	return getEmptyStateType(journeyData, exerciseCompletionCount) !== null;
}

/**
 * Get days since last scan (used for empty state data)
 */
export { getDaysSince };
