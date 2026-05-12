/**
 * Dashboard Selectors
 * EPIC-020-S1: User Functional Goals Selectors
 * EPIC-020-S2: User Persona/Audience Selectors
 * EPIC-021-S3: ROM History Selector
 * EPIC-022-S3: Session History Selector
 * EPIC-023-S3: Goal Progress Selector
 *
 * Provides memoized selectors for extracting user preferences,
 * ROM history data, session history data, and goal progress from Redux state.
 */

import { createSelector } from '@reduxjs/toolkit';
import { format, subDays, isAfter } from 'date-fns';
import type { ReduxState } from '@stores/index';
import type { ROMDataPoint } from '@molecules/ROMTrendChart/types';
import type { SessionData } from '@molecules/SessionCalendar';

/**
 * Goal progress data structure
 * Used by GoalProgressRing component
 */
export interface GoalProgressData {
	title: string;
	progress: number;
}

/**
 * Base selector for settings state
 * @param state - Redux root state
 * @returns Settings slice state
 */
const selectSettings = (state: ReduxState) => state.settings;

/**
 * Base selector for user profile
 * @param state - Redux root state
 * @returns User profile state
 */
const selectUserProfile = (state: ReduxState) => state.user?.profile;

/**
 * Base selector for ROM session list data
 * @param state - Redux root state
 * @returns ROM session list data or empty array
 */
const selectROMSessionListData = (state: ReduxState) =>
	state.rom?.results?.romSessionListData?.data || [];

/**
 * Base selector for program sessions data
 * @param state - Redux root state
 * @returns Program sessions data or empty array
 */
const selectProgramSessions = (state: ReduxState) =>
	state.aiAssistant?.programByIdList?.data || [];

/**
 * Select user's functional goal IDs for recommendation filtering
 *
 * EPIC-020-S1: Returns array of functional goal IDs from user's settings
 *
 * @returns Array of functional goal IDs (number[])
 * @returns Empty array if no functional goals selected
 *
 * @example
 * const goalIds = useTypedSelector(selectUserFunctionalGoalIds);
 * // goalIds: [1, 3, 5]
 */
export const selectUserFunctionalGoalIds = createSelector(
	[selectSettings],
	(settings) => {
		// Extract functional goal IDs from settings
		if (!settings?.functionalGoals || settings.functionalGoals.length === 0) {
			return [];
		}

		// Map IFunctionalGoals[] to number[]
		return settings.functionalGoals.map((goal) => goal.functionalGoalId);
	},
);

/**
 * Select user's persona ID for recommendation filtering
 *
 * EPIC-020-S2: Returns persona ID from user's profile
 *
 * @returns Persona ID (number) or undefined if not set
 * @returns undefined if profile missing
 *
 * @example
 * const personaId = useTypedSelector(selectUserPersonaId);
 * // personaId: 2 | undefined
 *
 * @note Persona field may not exist in current user profile schema.
 *       Returns undefined until user profile is updated with persona data.
 */
export const selectUserPersonaId = createSelector(
	[selectUserProfile],
	(profile): number | undefined => {
		// Note: personaId field doesn't currently exist in user profile
		// This selector is prepared for future profile schema updates
		return (profile as { personaId?: number })?.personaId;
	},
);

/**
 * Select user's audience ID for recommendation filtering
 *
 * EPIC-020-S2: Returns audience ID from user's profile
 *
 * @returns Audience ID (number) or undefined if not set
 * @returns undefined if profile missing
 *
 * @example
 * const audienceId = useTypedSelector(selectUserAudienceId);
 * // audienceId: 3 | undefined
 *
 * @note Audience field may not exist in current user profile schema.
 *       Returns undefined until user profile is updated with audience data.
 */
export const selectUserAudienceId = createSelector(
	[selectUserProfile],
	(profile): number | undefined => {
		// Note: audienceId field doesn't currently exist in user profile
		// This selector is prepared for future profile schema updates
		return (profile as { audienceId?: number })?.audienceId;
	},
);

/**
 * Select ROM history data for the last 3 months (90 days)
 *
 * EPIC-021-S3: Filters and formats ROM session data for ROMTrendChart.
 * Returns data points from the last 90 days, sorted chronologically.
 *
 * @returns Array of ROM data points formatted for chart display
 * @returns Empty array if no ROM history available
 *
 * @example
 * const romHistory = useTypedSelector(selectROMHistoryLast3Months);
 * // romHistory: [{ date: '2025-10-01', score: 85 }, ...]
 *
 * @note Data structure validated against state.rom.results.romSessionListData
 *       which contains CustomRomSession[] with createdAt and mobilityScore fields
 */
export const selectROMHistoryLast3Months = createSelector(
	[selectROMSessionListData],
	(sessionData): ROMDataPoint[] => {
		// Return empty array if no data
		if (!Array.isArray(sessionData) || sessionData.length === 0) {
			return [];
		}

		const threeMonthsAgo = subDays(new Date(), 90);

		return (
			sessionData
				// Filter to last 90 days
				.filter((session: { createdAt?: string; updatedAt?: string }) => {
					const sessionDate = new Date(
						session.createdAt || session.updatedAt || '',
					);
					return isAfter(sessionDate, threeMonthsAgo);
				})
				// Map to ROMDataPoint format
				.map(
					(session: {
						createdAt?: string;
						updatedAt?: string;
						mobilityScore?: number;
						overallScore?: number;
					}) => ({
						date: session.createdAt || session.updatedAt || '',
						score: session.mobilityScore || session.overallScore || 0,
					}),
				)
				// Sort chronologically (oldest to newest)
				.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				)
		);
	},
);

/**
 * Select session history data for the last 90 days
 *
 * EPIC-022-S3: Aggregates program sessions by date for SessionCalendar heatmap.
 * Groups sessions by date and counts occurrences for the last 90 days.
 *
 * @returns Array of session data points with date and count
 * @returns Empty array if no session history available
 *
 * @example
 * const sessionHistory = useTypedSelector(selectSessionHistoryLast90Days);
 * // sessionHistory: [{ date: '2025-10-01', count: 2 }, { date: '2025-10-02', count: 1 }, ...]
 *
 * @note Data structure validated against state.aiAssistant.programByIdList.data
 *       which contains ProgramSession[] with createdAt timestamps
 */
export const selectSessionHistoryLast90Days = createSelector(
	[selectProgramSessions],
	(sessions): SessionData[] => {
		// Return empty array if no data
		if (!Array.isArray(sessions) || sessions.length === 0) {
			return [];
		}

		const ninetyDaysAgo = subDays(new Date(), 90);

		// Filter to last 90 days
		const recentSessions = sessions.filter(
			(session: { createdAt?: string; updatedAt?: string }) => {
				const sessionDate = new Date(
					session.createdAt || session.updatedAt || '',
				);
				return isAfter(sessionDate, ninetyDaysAgo);
			},
		);

		// Group by date and count
		const sessionMap = new Map<string, number>();

		recentSessions.forEach(
			(session: { createdAt?: string; updatedAt?: string }) => {
				const dateStr = format(
					new Date(session.createdAt || session.updatedAt || ''),
					'yyyy-MM-dd',
				);
				sessionMap.set(dateStr, (sessionMap.get(dateStr) || 0) + 1);
			},
		);

		// Convert to array and sort chronologically
		return Array.from(sessionMap.entries())
			.map(([date, count]) => ({ date, count }))
			.sort((a, b) => a.date.localeCompare(b.date));
	},
);

/**
 * Base selector for functional goals from settings
 * @param state - Redux root state
 * @returns Functional goals array or empty array
 */
const selectFunctionalGoalsFromSettings = (state: ReduxState) =>
	state.settings?.functionalGoals || [];

/**
 * Base selector for program sessions data (for goal progress calculation)
 * @param state - Redux root state
 * @returns Program sessions data or empty array
 */
const selectProgramSessionsForGoals = (state: ReduxState) =>
	state.aiAssistant?.programByIdList?.data || [];

/**
 * Select goal progress data for user's functional goals
 *
 * EPIC-023-S3: Calculates progress percentage for each functional goal
 * based on completed sessions and target values. Progress is capped at 100%.
 *
 * @returns Array of goal progress data { title, progress }
 * @returns Empty array if no functional goals selected
 *
 * @example
 * const goalProgress = useTypedSelector(selectGoalProgress);
 * // goalProgress: [{ title: 'Improve Balance', progress: 75 }, ...]
 *
 * @note Currently returns calculated progress based on session completion.
 *       Progress calculation: (completed sessions / target) * 100, capped at 100%
 */
export const selectGoalProgress = createSelector(
	[selectFunctionalGoalsFromSettings, selectProgramSessionsForGoals],
	(functionalGoals, sessions): GoalProgressData[] => {
		// Return empty array if no functional goals
		if (!Array.isArray(functionalGoals) || functionalGoals.length === 0) {
			return [];
		}

		// Calculate progress for each functional goal
		return functionalGoals.map((goal) => {
			// Get goal title from the IFunctionalGoals interface
			const title = goal.title || 'Untitled Goal';

			// Calculate progress based on goal-specific sessions
			// This is a simplified calculation - in production, you would:
			// 1. Filter sessions by goal ID or related program
			// 2. Track actual completion metrics (ROM scores, exercise completion, etc.)
			// 3. Compare against personalized targets

			// For now, we'll calculate based on session count as a demonstration
			// Target: 30 sessions for 100% progress (example business logic)
			const targetSessions = 30;
			const completedSessions = sessions.filter((session) => {
				// In production: filter by goal-related programs
				// For now: count all sessions as contributing to all goals
				return session.createdAt || session.updatedAt;
			}).length;

			// Calculate progress percentage
			const rawProgress = (completedSessions / targetSessions) * 100;

			// Cap progress at 100% as per AC-003
			const cappedProgress = Math.min(rawProgress, 100);

			// Round to whole number for display
			const progress = Math.round(cappedProgress);

			return {
				title,
				progress,
			};
		});
	},
);
