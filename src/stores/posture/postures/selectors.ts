import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '@stores/index';
import { PatientJourneyState, PatientMilestone, PostureStatus } from '@types';

/**
 * Base selector to access the postures state
 * @param state - The Redux root state
 * @returns The postures state slice
 */
export const selectPosturesState = (state: ReduxState) =>
	state.postures.postures;

/**
 * Memoized selector that returns the latest posture scan
 * Sorts postures by createdAt in descending order and returns the most recent one
 * @returns The most recent posture or null if no postures exist
 */
export const selectLatestPosture = createSelector(
	[selectPosturesState],
	posturesState => {
		const postures = posturesState.data;

		// Handle empty or missing data gracefully
		if (!postures || postures.length === 0) {
			return null;
		}

		// Sort by createdAt DESC and return first item
		// Create a shallow copy to avoid mutating the original array
		const sortedPostures = [...postures].sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return dateB - dateA; // DESC order
		});

		return sortedPostures[0];
	},
);

/**
 * Memoized selector that extracts the score/report from the latest posture
 * @returns The report object from the most recent posture or null
 */
export const selectPostureScore = createSelector(
	[selectLatestPosture],
	latestPosture => {
		if (!latestPosture || !latestPosture.report) {
			return null;
		}

		return latestPosture.report;
	},
);

/**
 * Memoized selector that builds patient journey data for timeline visualization (FR6)
 * Aggregates posture sessions, calculates progress metrics, and identifies milestones
 *
 * @returns PatientJourneyState with sessions, milestones, and progress metrics
 */
export const selectPatientJourney = createSelector(
	[selectPosturesState, (state: ReduxState) => state.user?.user?.id],
	(posturesState, userId): PatientJourneyState | null => {
		const postures = posturesState.data;

		// No data available
		if (!userId || !postures || postures.length === 0) {
			return null;
		}

		// Sort sessions chronologically (oldest first for journey view)
		const sortedSessions = [...postures].sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return dateA - dateB; // ASC order for timeline
		});

		// Map posture data to PostureSession format
		const sessions = sortedSessions.map((posture): unknown => ({
			id: posture.id,
			userId: userId,
			timestamp: posture.createdAt,
			duration: 0, // Not available in current data structure
			poseData: [], // Not available in current data structure
			analysis: {
				overallScore: posture.report?.overallScore || 0,
				status: derivePostureStatus(posture.report?.overallScore || 0),
				metrics: {
					headAlignment: 0,
					shoulderSymmetry: 0,
					spineCurvature: 0,
					hipAlignment: 0,
					balance: 0,
				},
				issues: [],
				insights: [],
			},
			metadata: {
				deviceType: 'desktop' as const,
				cameraQuality: 'medium' as const,
				lighting: 'fair' as const,
			},
		}));

		// Calculate progress metrics
		const totalAssessments = sessions.length;
		const scores = sessions.map(s => s.analysis.overallScore);
		const averageScore =
			scores.reduce((sum, score) => sum + score, 0) / totalAssessments;
		const firstScore = scores[0] || 0;
		const latestScore = scores[scores.length - 1] || 0;
		const scoreImprovement =
			firstScore > 0 ? ((latestScore - firstScore) / firstScore) * 100 : 0;

		// Calculate adherence rate (simplified - assume weekly assessments expected)
		const startDate = new Date(sessions[0].timestamp);
		const endDate = new Date(sessions[sessions.length - 1].timestamp);
		const weeksSinceStart = Math.max(
			1,
			Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
			),
		);
		const adherenceRate = Math.min(
			100,
			(totalAssessments / weeksSinceStart) * 100,
		);

		// Identify milestones
		const milestones: PatientMilestone[] = [];

		// Baseline assessment milestone
		milestones.push({
			id: 'milestone-baseline',
			title: 'Baseline Assessment',
			description: 'Initial posture evaluation completed',
			achievedAt: sessions[0].timestamp,
			type: 'assessment',
		});

		// 1 week consistency milestone
		if (totalAssessments >= 1) {
			const oneWeekDate = new Date(startDate);
			oneWeekDate.setDate(oneWeekDate.getDate() + 7);
			const hasOneWeek = sessions.some(
				s => new Date(s.timestamp) >= oneWeekDate,
			);

			milestones.push({
				id: 'milestone-1week',
				title: '1 Week Streak',
				description: 'Completed 1 week of consistent tracking',
				achievedAt: hasOneWeek ? oneWeekDate.toISOString() : null,
				type: 'improvement',
			});
		}

		// 1 month consistency milestone
		if (totalAssessments >= 4) {
			const oneMonthDate = new Date(startDate);
			oneMonthDate.setDate(oneMonthDate.getDate() + 30);
			const hasOneMonth = sessions.some(
				s => new Date(s.timestamp) >= oneMonthDate,
			);

			milestones.push({
				id: 'milestone-1month',
				title: '1 Month Milestone',
				description: 'Completed 1 month of posture tracking',
				achievedAt: hasOneMonth ? oneMonthDate.toISOString() : null,
				type: 'improvement',
			});
		}

		// Score improvement milestone (10% improvement)
		if (scoreImprovement >= 10) {
			milestones.push({
				id: 'milestone-improvement',
				title: '10% Improvement',
				description: 'Posture score improved by 10% or more',
				achievedAt: sessions[sessions.length - 1].timestamp,
				type: 'goal',
				metricImprovement: {
					metric: 'Overall Score',
					before: firstScore,
					after: latestScore,
				},
			});
		}

		return {
			patientId: userId,
			startDate: sessions[0].timestamp,
			sessions,
			milestones,
			progress: {
				totalAssessments,
				averageScore,
				scoreImprovement,
				adherenceRate,
			},
		};
	},
);

/**
 * Helper function to derive posture status from score
 * @param score - Posture score (0-100)
 * @returns PostureStatus classification
 */
function derivePostureStatus(score: number): PostureStatus {
	if (score >= 90) return 'excellent';
	if (score >= 70) return 'good';
	if (score >= 50) return 'fair';
	if (score >= 30) return 'poor';
	return 'critical';
}

/**
 * Selector for exercise recommendations (Story 2.3)
 * @param state - Redux state
 * @returns Array of exercise recommendations
 */
export const selectExerciseRecommendations = createSelector(
	[selectPosturesState],
	posturesState => {
		return posturesState.exerciseRecommendations || [];
	},
);

/**
 * Selector for exercise tracking data (Story 2.3)
 * @param state - Redux state
 * @param userId - User ID
 * @returns Exercise tracking data for user
 */
export const selectExerciseTracking = createSelector(
	[selectPosturesState, (_state: ReduxState, userId: string) => userId],
	(posturesState, userId) => {
		const tracking = posturesState.exerciseTracking;
		if (!tracking || tracking.userId !== userId) {
			return null;
		}
		return tracking;
	},
);

/**
 * Selector for exercise streak (Story 2.3)
 * @param state - Redux state
 * @param exerciseId - Exercise ID
 * @returns Current streak for the exercise
 */
export const selectExerciseStreak = createSelector(
	[
		selectPosturesState,
		(_state: ReduxState, _exerciseId: string) => _exerciseId,
	],
	(posturesState, exerciseId) => {
		const tracking = posturesState.exerciseTracking;
		if (!tracking || !tracking.exercises[exerciseId]) {
			return 0;
		}
		return tracking.exercises[exerciseId].currentStreak;
	},
);

/**
 * Selector for overall adherence percentage (Story 2.3)
 * @param state - Redux state
 * @returns Adherence percentage across all exercises
 */
export const selectAdherencePercentage = createSelector(
	[selectPosturesState],
	posturesState => {
		const tracking = posturesState.exerciseTracking;
		if (!tracking || Object.keys(tracking.exercises).length === 0) {
			return 0;
		}

		// Calculate adherence as average of completion rates
		const exerciseIds = Object.keys(tracking.exercises);
		const totalCompletions = exerciseIds.reduce((sum, id) => {
			return sum + tracking.exercises[id].completions.length;
		}, 0);

		// Simplified: assume 7 exercises per week expected
		const expectedCompletions = exerciseIds.length * 7;
		return Math.min(100, (totalCompletions / expectedCompletions) * 100);
	},
);

// ============================================================================
// POSTURE COMPARISON SELECTORS (Story 2.2)
// ============================================================================

/**
 * Selector for posture comparison data by session ID (Story 2.2)
 * Returns baseline and current scan images with annotations for side-by-side comparison
 * @param state - Redux state
 * @param sessionId - Session ID for the comparison
 * @returns PostureAnalysis object or null
 */
export const selectPostureComparison = createSelector(
	[
		selectPosturesState,
		(_state: ReduxState, sessionId: string | undefined) => sessionId,
	],
	(posturesState, sessionId) => {
		// Return null if no session ID provided
		if (!sessionId) {
			return null;
		}

		// Find the posture data by session ID
		const posture = posturesState.data?.find(p => p.id === sessionId);

		if (!posture) {
			return null;
		}

		// Construct PostureAnalysis from posture data
		// This will be populated by the backend API
		return posture;
	},
);

/**
 * Memoized selector for improvement summary (Story 2.2)
 * Calculates the summary of improvements, attention areas, and overall progress
 * @param state - Redux state
 * @param sessionId - Session ID for the comparison
 * @returns PostureComparisonSummary object or null
 */
export const selectImprovementSummary = createSelector(
	[selectPostureComparison],
	comparison => {
		if (!comparison) {
			return null;
		}

		// Extract improvements and attention areas from the report
		const improvements = comparison.report?.improvements || [];
		const attentionAreas = comparison.report?.attentionAreas || [];

		const improvedCount = improvements.filter(
			i => i.direction === 'improved',
		).length;
		const attentionCount = attentionAreas.length;
		const stableCount = improvements.filter(
			i => i.direction === 'stable',
		).length;

		// Determine overall progress
		let overallProgress: 'improved' | 'stable' | 'declined' = 'stable';
		if (improvedCount > attentionCount) {
			overallProgress = 'improved';
		} else if (attentionCount > improvedCount) {
			overallProgress = 'declined';
		}

		return {
			totalAreas: improvements.length,
			improvedCount,
			attentionCount,
			stableCount,
			overallProgress,
		};
	},
);

/**
 * Memoized selector for annotation data (Story 2.2)
 * Extracts annotations for rendering overlay on comparison images
 * @param state - Redux state
 * @param sessionId - Session ID for the comparison
 * @returns Array of PostureAnnotation objects
 */
export const selectAnnotationData = createSelector(
	[selectPostureComparison],
	comparison => {
		if (!comparison || !comparison.report) {
			return [];
		}

		return comparison.report.annotations || [];
	},
);

// ============================================================================
// MILESTONE SELECTORS (Story 2.4)
// ============================================================================

/**
 * Select earned milestones
 */
export const selectEarnedMilestones = createSelector(
	[selectPosturesState],
	posturesState => {
		return (posturesState.milestones?.earned || []) as unknown[];
	},
);

/**
 * Select milestone progress
 */
export const selectMilestoneProgress = createSelector(
	[selectPosturesState],
	posturesState => {
		return (posturesState.milestones?.progress || []) as unknown[];
	},
);

/**
 * Select milestones loading state
 */
export const selectMilestonesLoading = createSelector(
	[selectPosturesState],
	posturesState => posturesState.milestones?.loading || false,
);

/**
 * Select milestone error
 */
export const selectMilestoneError = createSelector(
	[selectPosturesState],
	posturesState => posturesState.milestones?.error || null,
);

/**
 * Select total earned milestones count
 */
export const selectTotalMilestonesEarned = createSelector(
	[selectEarnedMilestones],
	milestones => milestones.length,
);

/**
 * Select recently earned milestones (last 7 days)
 */
export const selectRecentMilestones = createSelector(
	[selectEarnedMilestones],
	milestones => {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		return milestones.filter((m: unknown) => {
			const milestone = m as { dateAchieved: string };
			return new Date(milestone.dateAchieved) >= sevenDaysAgo;
		});
	},
);

/**
 * Select milestones grouped by badge color
 */
export const selectMilestonesByColor = createSelector(
	[selectEarnedMilestones],
	milestones => {
		return milestones.reduce(
			(acc, m: unknown) => {
				const milestone = m as { badgeColor: string };
				const color = milestone.badgeColor;
				if (!acc[color]) {
					acc[color] = [];
				}
				acc[color].push(m);
				return acc;
			},
			{} as Record<string, unknown[]>,
		);
	},
);

/**
 * Select undismissed milestones (for celebration display)
 */
export const selectUndismissedMilestones = createSelector(
	[selectEarnedMilestones],
	milestones => {
		const dismissed = JSON.parse(
			localStorage.getItem('dismissedMilestones') || '[]',
		);
		return milestones.filter((m: unknown) => {
			const milestone = m as { id: string };
			return !dismissed.includes(milestone.id);
		});
	},
);

/**
 * Select next milestone progress (closest to completion)
 */
export const selectNextMilestone = createSelector(
	[selectMilestoneProgress],
	progress => {
		if (progress.length === 0) return null;

		return progress.reduce((closest: unknown, current: unknown) => {
			const closestProgress = closest as { percentComplete: number };
			const currentProgress = current as { percentComplete: number };
			return currentProgress.percentComplete > closestProgress.percentComplete
				? current
				: closest;
		});
	},
);
