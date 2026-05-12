/**
 * Posture Analytics Selectors
 *
 * Memoized selectors for derived state from posture analytics slice.
 * Uses Reselect for performance optimization with large datasets.
 *
 * @module stores/posture/postureAnalytics/selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import type { ReduxState } from '@stores/index';
import type {
	PostureSession,
	PatientJourneyState,
	PatientMilestone,
} from '@types/posture';
import { sessionsSelectors } from './postureAnalyticsSlice';

/**
 * Base selector: Access posture analytics state
 */
export const selectPostureAnalyticsState = (state: ReduxState) =>
	state.postureAnalytics;

/**
 * Select sessions state (normalized)
 */
export const selectSessionsState = (state: ReduxState) =>
	state.postureAnalytics.sessions;

/**
 * Select all sessions (array)
 * Uses entity adapter selector
 */
export const selectAllSessions = createSelector(
	[selectSessionsState],
	sessionsState => sessionsSelectors.selectAll(sessionsState),
);

/**
 * Select session by ID
 * @param id - Session identifier
 */
export const selectSessionById = (id: string) =>
	createSelector([selectSessionsState], sessionsState =>
		sessionsSelectors.selectById(sessionsState, id),
	);

/**
 * Select current filters
 */
export const selectFilters = createSelector(
	[selectPostureAnalyticsState],
	state => state.filters,
);

/**
 * Select selected session ID
 */
export const selectSelectedSessionId = createSelector(
	[selectPostureAnalyticsState],
	state => state.selectedSessionId,
);

/**
 * Select selected session object
 */
export const selectSelectedSession = createSelector(
	[selectSessionsState, selectSelectedSessionId],
	(sessionsState, selectedId) => {
		if (!selectedId) return null;
		return sessionsSelectors.selectById(sessionsState, selectedId);
	},
);

/**
 * Select loading states
 */
export const selectLoading = createSelector(
	[selectPostureAnalyticsState],
	state => state.loading,
);

/**
 * Select error states
 */
export const selectErrors = createSelector(
	[selectPostureAnalyticsState],
	state => state.error,
);

/**
 * Select pagination state
 */
export const selectPagination = createSelector(
	[selectPostureAnalyticsState],
	state => state.pagination,
);

/**
 * Select last fetched timestamp
 */
export const selectLastFetchedAt = createSelector(
	[selectPostureAnalyticsState],
	state => state.lastFetchedAt,
);

/**
 * Memoized selector: Apply admin filters to sessions
 *
 * Filters sessions based on current filter criteria.
 * Optimized for large datasets (1000+ sessions).
 *
 * @returns Filtered session array
 */
export const selectFilteredSessions = createSelector(
	[selectAllSessions, selectFilters],
	(sessions, filters) => {
		let filtered = [...sessions];

		// Apply status filter
		if (filters.status && filters.status.length > 0) {
			const statusArray = filters.status;
			filtered = filtered.filter(session =>
				statusArray.includes(session.analysis.status),
			);
		}

		// Apply date range filter
		if (filters.dateRange) {
			const startDate = new Date(filters.dateRange.start).getTime();
			const endDate = new Date(filters.dateRange.end).getTime();

			filtered = filtered.filter(session => {
				const sessionDate = new Date(session.timestamp).getTime();
				return sessionDate >= startDate && sessionDate <= endDate;
			});
		}

		// Apply score range filter
		if (filters.scoreRange) {
			const { min, max } = filters.scoreRange;
			filtered = filtered.filter(
				session =>
					session.analysis.overallScore >= min &&
					session.analysis.overallScore <= max,
			);
		}

		// Apply issue severity filter
		if (filters.issueSeverity && filters.issueSeverity.length > 0) {
			const severityArray = filters.issueSeverity;
			filtered = filtered.filter(session =>
				session.analysis.issues.some(issue =>
					severityArray.includes(issue.severity),
				),
			);
		}

		// Apply search query filter
		if (filters.searchQuery && filters.searchQuery.trim()) {
			const query = filters.searchQuery.toLowerCase();
			filtered = filtered.filter(
				session =>
					session.userId.toLowerCase().includes(query) ||
					session.id.toLowerCase().includes(query),
			);
		}

		// Apply sorting
		if (filters.sort) {
			const { field, order } = filters.sort;
			const multiplier = order === 'asc' ? 1 : -1;

			filtered.sort((a, b) => {
				let aValue: string | number;
				let bValue: string | number;

				switch (field) {
					case 'timestamp':
						aValue = new Date(a.timestamp).getTime();
						bValue = new Date(b.timestamp).getTime();
						break;
					case 'score':
						aValue = a.analysis.overallScore;
						bValue = b.analysis.overallScore;
						break;
					case 'status':
						aValue = a.analysis.status;
						bValue = b.analysis.status;
						break;
					case 'patientName':
						// Note: patientName not in session data, use userId as fallback
						aValue = a.userId;
						bValue = b.userId;
						break;
					default:
						return 0;
				}

				if (typeof aValue === 'number' && typeof bValue === 'number') {
					return (aValue - bValue) * multiplier;
				}
				return aValue.toString().localeCompare(bValue.toString()) * multiplier;
			});
		}

		return filtered;
	},
);

/**
 * Memoized selector: Transform sessions into patient journey view data
 *
 * Aggregates session history into journey metrics and milestones.
 * Used by patient journey view (FR6).
 *
 * @param patientId - Patient identifier (optional, filters by patient)
 * @returns Patient journey state
 */
export const selectPatientJourney = createSelector(
	[selectAllSessions, (state: ReduxState, patientId?: string) => patientId],
	(sessions, patientId): PatientJourneyState | null => {
		// Filter sessions by patient if provided
		const patientSessions = patientId
			? sessions.filter(s => s.userId === patientId)
			: sessions;

		if (patientSessions.length === 0) {
			return null;
		}

		// Sort sessions chronologically
		const sortedSessions = [...patientSessions].sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);

		const firstSession = sortedSessions[0];
		const latestSession = sortedSessions[sortedSessions.length - 1];

		// Calculate progress metrics
		const totalAssessments = sortedSessions.length;
		const averageScore =
			sortedSessions.reduce(
				(sum, session) => sum + session.analysis.overallScore,
				0,
			) / totalAssessments;

		const scoreImprovement =
			((latestSession.analysis.overallScore -
				firstSession.analysis.overallScore) /
				firstSession.analysis.overallScore) *
			100;

		// Generate milestones based on score improvements
		const milestones: PatientMilestone[] = [];

		// First assessment milestone
		milestones.push({
			id: `milestone-first-${firstSession.id}`,
			title: 'First Posture Assessment',
			description: `Initial assessment completed with score of ${firstSession.analysis.overallScore}`,
			achievedAt: firstSession.timestamp,
			type: 'assessment',
		});

		// Score improvement milestones
		const significantImprovements = sortedSessions.filter((session, index) => {
			if (index === 0) return false;
			const prevSession = sortedSessions[index - 1];
			const improvement =
				session.analysis.overallScore - prevSession.analysis.overallScore;
			return improvement >= 10; // 10+ point improvement
		});

		significantImprovements.forEach(session => {
			milestones.push({
				id: `milestone-improvement-${session.id}`,
				title: 'Significant Improvement',
				description: `Posture score improved to ${session.analysis.overallScore}`,
				achievedAt: session.timestamp,
				type: 'improvement',
			});
		});

		// Status upgrade milestones
		const statusUpgrades = sortedSessions.filter((session, index) => {
			if (index === 0) return false;
			const prevSession = sortedSessions[index - 1];
			const statusOrder = ['critical', 'poor', 'fair', 'good', 'excellent'];
			const prevIndex = statusOrder.indexOf(prevSession.analysis.status);
			const currentIndex = statusOrder.indexOf(session.analysis.status);
			return currentIndex > prevIndex;
		});

		statusUpgrades.forEach(session => {
			milestones.push({
				id: `milestone-status-${session.id}`,
				title: `Status Upgraded to ${session.analysis.status.charAt(0).toUpperCase() + session.analysis.status.slice(1)}`,
				achievedAt: session.timestamp,
				type: 'improvement',
			});
		});

		// Adherence rate (placeholder - would need scheduled assessment data)
		const adherenceRate = 100; // Assume 100% for now

		return {
			patientId: patientId || sortedSessions[0].userId,
			startDate: firstSession.timestamp,
			sessions: sortedSessions,
			milestones: milestones.sort(
				(a, b) =>
					new Date(a.achievedAt || 0).getTime() -
					new Date(b.achievedAt || 0).getTime(),
			),
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
 * Memoized selector: Calculate aggregate metrics for dashboard
 *
 * Computes summary statistics across all sessions.
 * Used by admin dashboard metrics cards (FR11).
 *
 * @returns Dashboard metrics object
 */
export const selectSessionMetrics = createSelector(
	[selectFilteredSessions],
	sessions => {
		if (sessions.length === 0) {
			return {
				totalSessions: 0,
				averageScore: 0,
				statusDistribution: {
					excellent: 0,
					good: 0,
					fair: 0,
					poor: 0,
					critical: 0,
				},
				criticalIssuesCount: 0,
				recentSessions: [],
			};
		}

		// Total sessions
		const totalSessions = sessions.length;

		// Average score
		const averageScore =
			sessions.reduce(
				(sum, session) => sum + session.analysis.overallScore,
				0,
			) / totalSessions;

		// Status distribution
		const statusDistribution = sessions.reduce(
			(acc, session) => {
				acc[session.analysis.status]++;
				return acc;
			},
			{
				excellent: 0,
				good: 0,
				fair: 0,
				poor: 0,
				critical: 0,
			} as Record<PostureSession['analysis']['status'], number>,
		);

		// Critical issues count
		const criticalIssuesCount = sessions.reduce(
			(count, session) =>
				count +
				session.analysis.issues.filter(issue => issue.severity === 'critical')
					.length,
			0,
		);

		// Recent sessions (last 10)
		const recentSessions = sessions.slice(0, 10);

		return {
			totalSessions,
			averageScore,
			statusDistribution,
			criticalIssuesCount,
			recentSessions,
		};
	},
);

/**
 * Select total session count
 */
export const selectTotalSessionCount = createSelector(
	[selectSessionsState],
	sessionsState => sessionsSelectors.selectTotal(sessionsState),
);

/**
 * Select if any data is loading
 */
export const selectIsAnyLoading = createSelector([selectLoading], loading =>
	Object.values(loading).some(Boolean),
);

/**
 * Select if any errors exist
 */
export const selectHasErrors = createSelector([selectErrors], errors =>
	Object.values(errors).some(error => error !== null),
);

/**
 * Select sessions for current page (pagination)
 */
export const selectPaginatedSessions = createSelector(
	[selectFilteredSessions, selectPagination],
	(sessions, pagination) => {
		const start = (pagination.currentPage - 1) * pagination.pageSize;
		const end = start + pagination.pageSize;
		return sessions.slice(start, end);
	},
);
