/**
 * Dashboard Redux Slice
 * Manages dashboard-specific state including assessment statuses, metrics, and loading states
 */

import {
	createSlice,
	createAsyncThunk,
	PayloadAction,
	createSelector,
	nanoid,
} from '@reduxjs/toolkit';
import {
	selectLatestROM,
	selectROMScore,
} from '@stores/clinical/rom/selectors';
import {
	selectLatestPosture,
	selectPostureScore,
} from '@stores/posture/postures/selectors';
import { ReduxState } from '@stores/index';
import { DashboardState, AssessmentStatus, LastSession } from './types';
import { MovrProgram, LetsMoveCustomProgram } from '@types';
import { alertRules } from './alertRules';
import { DashboardAlert } from './alertTypes';

/**
 * EPIC-009-S4: ROM Score Metric Display Logic
 * Selects ROM metric with current score and mock trend
 *
 * ⚠️ PHASE 2 MOCK DATA IMPLEMENTATION
 * TODO: Phase 3 - Implement real trend calculation from historical ROM sessions
 * Real trend will be calculated by comparing current score to previous sessions average
 *
 * @returns Object with romScore (number | null) and romTrend (number | undefined)
 * @see selectLatestROM - Source of ROM session data
 * @see selectROMScore - Source of ROM score data
 */
export const selectROMMetric = createSelector(
	[(state: ReduxState) => selectROMScore(state)],
	romScore => ({
		romScore: romScore?.value ?? null,
		romTrend: romScore?.value ? 5 : undefined, // Mock: +5% placeholder for UI development
	}),
);

/**
 * EPIC-009-S5: Sessions Completed Metric Logic
 * Selects sessions completed metric with mock trend
 *
 * ⚠️ PHASE 2 MOCK DATA IMPLEMENTATION
 * TODO: Phase 3 - Count from state.patientDetail.program.completedExercises array
 * Real count will aggregate all completed sessions across user's programs
 *
 * @returns Object with sessionsCompleted (number) and sessionsTrend (number | undefined)
 */
export const selectSessionsMetric = createSelector(
	[(state: ReduxState) => state.patientDetail?.program?.completedExercises],
	completedExercises => {
		const sessionsCompleted = completedExercises?.length ?? 0;
		return {
			sessionsCompleted,
			sessionsTrend: sessionsCompleted > 0 ? 3 : undefined, // Mock: +3% placeholder for UI development
		};
	},
);

/**
 * EPIC-009-S6: Current Streak Metric Logic
 * Selects current streak metric with mock trend
 *
 * ⚠️ PHASE 2 MOCK DATA IMPLEMENTATION
 * TODO: Phase 3 - Calculate from historical activity data (streak history not yet available in state)
 * Real streak will be calculated from consecutive days of completed activities
 *
 * @returns Object with currentStreak (number) and streakTrend (number | undefined)
 */
export const selectStreakMetric = createSelector(
	[(state: ReduxState) => state.user?.profile],
	() => {
		// Mock streak calculation - Phase 3 will use real historical data
		const currentStreak = 0; // TODO: Phase 3 - Calculate from activity history
		return {
			currentStreak,
			streakTrend: currentStreak > 0 ? 2 : undefined, // Mock: +2% placeholder for UI development
		};
	},
);

/**
 * EPIC-010-S2: Active Program Selector for Hero Section
 * Finds the most recently active incomplete program for "Continue Session" button
 *
 * ⚠️ PHASE 2 SIMPLIFIED IMPLEMENTATION
 * Currently returns the first active program with history as a mock implementation.
 * Phase 3 will implement proper session completion tracking when schema is updated
 * to include completed/updatedAt fields on LetsMoveProgramHistory.
 *
 * Current logic:
 * - Filters for active programs (active=true)
 * - Checks for programs with movrProgramHistory entries
 * - Returns most recent session from first active program
 *
 * TODO Phase 3: Update when LetsMoveProgramHistory includes:
 * - completed: boolean flag
 * - updatedAt: Date field
 * Then implement proper incomplete session filtering and sorting
 *
 * @returns LastSession object { programId, programName, sessionId, lastUpdated } or null
 * @see LetsMoveProgramHistory - Current structure: { id, movrProgramId, movrPerformancePatientResultId, createdAt }
 */
export const selectActiveProgramForHero = createSelector(
	[
		(state: ReduxState) =>
			state.patientDetail?.program?.data as
				| (MovrProgram | LetsMoveCustomProgram)[]
				| undefined,
	],
	(programs): LastSession | null => {
		if (!programs || programs.length === 0) {
			return null;
		}

		// Filter for active programs only
		const activePrograms = programs.filter(p => p.active);

		if (activePrograms.length === 0) {
			return null;
		}

		// Phase 2: Find first active program with session history
		// Phase 3 will filter by incomplete sessions when schema supports it
		for (const program of activePrograms) {
			if (program.movrProgramHistory && program.movrProgramHistory.length > 0) {
				// Sort by createdAt descending to get most recent session
				const sortedSessions = [...program.movrProgramHistory].sort((a, b) => {
					const dateA = new Date(a.createdAt);
					const dateB = new Date(b.createdAt);
					return dateB.getTime() - dateA.getTime();
				});

				const mostRecentSession = sortedSessions[0];
				const sessionDate = new Date(mostRecentSession.createdAt);

				return {
					programId: program.id,
					programName: program.name,
					sessionId: mostRecentSession.id,
					lastUpdated: sessionDate,
				};
			}
		}

		return null;
	},
);

/**
 * Fetch dashboard data from Redux state
 * Reads ROM and Posture data from existing slices and transforms into dashboard-friendly format
 * Integrates metric selectors (EPIC-009-S4, S5, S6) to provide complete dashboard data
 * EPIC-010-S2: Added lastSession from selectActiveProgramForHero selector
 * EPIC-014-S4: Added alerts from evaluateAlerts function
 *
 * @returns Object containing assessment statuses, metrics with mock trends, lastSession, and alerts
 * @throws Error if data transformation fails
 */
export const fetchDashboardData = createAsyncThunk<
	{
		assessmentStatuses: {
			rom: AssessmentStatus | null;
			posture: AssessmentStatus | null;
			survey: AssessmentStatus | null;
		};
		metrics: {
			romScore: number | null;
			romTrend?: number;
			sessionsCompleted: number;
			sessionsTrend?: number;
			currentStreak: number;
			streakTrend?: number;
		};
		lastSession: LastSession | null; // EPIC-010-S2
		alerts: DashboardAlert[]; // EPIC-014-S4
	},
	void,
	{ state: ReduxState }
>('dashboard/fetchDashboardData', async (_, { getState }) => {
	try {
		const state = getState();

		// Fetch ROM data using selectors
		const romSession = selectLatestROM(state);
		const romScore = selectROMScore(state);

		// Transform ROM data into AssessmentStatus
		const romStatus: AssessmentStatus | null = romSession
			? {
					type: 'rom',
					status: 'completed', // Simplified status logic for Phase 1
					lastUpdated: romSession.createdAt,
					score: romScore?.value ?? undefined,
				}
			: null;

		// Fetch Posture data using selectors
		const postureData = selectLatestPosture(state);
		const postureScore = selectPostureScore(state);

		// Transform Posture data into AssessmentStatus
		// Only create status if both postureData and postureScore exist
		const postureStatus: AssessmentStatus | null =
			postureData && postureScore
				? {
						type: 'posture',
						status: 'completed', // Simplified status logic for Phase 1
						lastUpdated: postureData.createdAt,
						score: postureScore?.overallScore ?? undefined,
					}
				: null;

		// Use metric selectors to get current values and mock trends
		// EPIC-009-S4, S5, S6 implementation
		const romMetric = selectROMMetric(state);
		const sessionsMetric = selectSessionsMetric(state);
		const streakMetric = selectStreakMetric(state);

		// EPIC-010-S2: Fetch last active session for hero section
		const lastSession = selectActiveProgramForHero(state);

		// EPIC-014-S4: Evaluate alert rules and generate active alerts
		const alerts = evaluateAlerts(state);

		return {
			assessmentStatuses: {
				rom: romStatus,
				posture: postureStatus,
				survey: null, // TODO: Phase 2 - Implement survey status
			},
			metrics: {
				romScore: romMetric.romScore,
				romTrend: romMetric.romTrend,
				sessionsCompleted: sessionsMetric.sessionsCompleted,
				sessionsTrend: sessionsMetric.sessionsTrend,
				currentStreak: streakMetric.currentStreak,
				streakTrend: streakMetric.streakTrend,
			},
			lastSession, // EPIC-010-S2
			alerts, // EPIC-014-S4
		};
	} catch (error: unknown) {
		// Re-throw with more context for error handling
		const message = error instanceof Error ? error.message : 'Unknown error';
		throw new Error(`Failed to fetch dashboard data: ${message}`);
	}
});

/**
 * EPIC-014-S3: Alert Evaluation Engine
 *
 * Evaluates all alert rules against current Redux state, generates alerts for
 * triggered rules, sorts by priority, and returns maximum 3 highest-priority alerts.
 *
 * **Algorithm:**
 * 1. Iterate through all rules in alertRules array
 * 2. For each rule, evaluate condition(state)
 * 3. If condition returns true, generate alert via generateAlert(state)
 * 4. Add unique ID (nanoid) and createdAt timestamp to each alert
 * 5. Sort alerts by priority descending (High=10 → Medium=5 → Low=1)
 * 6. Return top 3 alerts
 *
 * **Error Handling:**
 * - Individual rule failures are caught and logged, but don't break evaluation
 * - This ensures one bad rule doesn't prevent other alerts from showing
 * - Returns empty array if state is null/undefined
 *
 * **Priority Sorting:**
 * - Alerts sorted by numeric priority (b.priority - a.priority)
 * - High (10) appears before Medium (5) appears before Low (1)
 *
 * **Max 3 Alerts:**
 * - Dashboard UI displays maximum 3 alerts to prevent clutter
 * - Only the 3 highest-priority triggered alerts are returned
 *
 * @param state - Full Redux state object to evaluate rules against
 * @returns Array of 0-3 DashboardAlert objects, sorted by priority descending
 *
 * @example
 * ```typescript
 * // In a component or selector
 * const alerts = evaluateAlerts(state);
 * // Returns: [
 * //   { id: 'abc123', type: 'streak-at-risk', priority: 10, ... },
 * //   { id: 'def456', type: 'assessment-due', priority: 10, ... },
 * //   { id: 'ghi789', type: 'program-expiring', priority: 5, ... },
 * // ]
 * ```
 *
 * @see alertRules - Source of rule definitions
 * @see DashboardAlert - Alert object structure
 * @see AlertPriority - Priority enum (1=Low, 5=Medium, 10=High)
 */
export const evaluateAlerts = (state: ReduxState): DashboardAlert[] => {
	// Guard against null/undefined state
	if (!state) {
		return [];
	}

	const triggeredAlerts: DashboardAlert[] = [];

	// Evaluate all rules
	for (const rule of alertRules) {
		try {
			// Check if rule condition is met
			if (rule.condition(state)) {
				// Generate alert data from rule
				const alertData = rule.generateAlert(state);

				// Create complete alert with unique ID and timestamp
				const alert: DashboardAlert = {
					...alertData,
					id: nanoid(), // Generate unique ID
					createdAt: new Date(), // Add creation timestamp
				};

				triggeredAlerts.push(alert);
			}
		} catch (error: unknown) {
			// Log error but continue evaluation - one bad rule shouldn't break all alerts
			console.warn(`Failed to evaluate alert rule ${rule.id}:`, error);
		}
	}

	// Sort by priority descending (High → Medium → Low)
	const sortedAlerts = triggeredAlerts.sort((a, b) => b.priority - a.priority);

	// Return max 3 alerts (highest priority)
	return sortedAlerts.slice(0, 3);
};

/**
 * EPIC-014-S4: Active Alerts Selector
 *
 * Memoized selector that evaluates alert rules and returns active alerts.
 * Uses createSelector for performance optimization - only recalculates when
 * dependent state slices change.
 *
 * **Memoization Strategy:**
 * - Depends on: rom state, dashboard.metrics, patientDetail
 * - Recalculates only when these slices change
 * - Prevents unnecessary alert evaluation on unrelated state updates
 *
 * **Return Value:**
 * - Array of 0-3 DashboardAlert objects
 * - Sorted by priority descending (High → Medium → Low)
 * - Empty array if state is null/undefined
 *
 * **Usage:**
 * ```typescript
 * const alerts = useTypedSelector(selectActiveAlerts);
 * ```
 *
 * @returns Array of active alerts (max 3, sorted by priority)
 * @see evaluateAlerts - Core alert evaluation logic
 * @see DashboardAlert - Alert object structure
 */
export const selectActiveAlerts = createSelector(
	[
		// Dependencies: state slices that affect alert conditions
		(state: ReduxState) => state.rom,
		(state: ReduxState) => state.dashboard?.metrics,
		(state: ReduxState) => state.patientDetail,
	],
	// Selector function: receives dependent values, returns alerts
	(_rom, _metrics, _patientDetail, ...args) => {
		// Extract full state from args (createSelector passes it)
		const state = args[args.length - 1] as ReduxState;

		// Evaluate all alert rules against current state
		return evaluateAlerts(state);
	},
);

/**
 * Initial state for the dashboard slice
 * All assessment statuses are null by default, metrics are zeroed
 * EPIC-010-S2: Added lastSession field (null by default)
 * EPIC-014-S4: Added alerts array (empty by default)
 */
const initialState: DashboardState = {
	assessmentStatuses: {
		rom: null,
		posture: null,
		survey: null,
	},
	metrics: {
		romScore: null,
		sessionsCompleted: 0,
		streak: 0,
	},
	lastSession: null, // EPIC-010-S2
	alerts: [], // EPIC-014-S4: Alert system integration
	loading: false,
	error: null,
};

/**
 * Dashboard Slice
 * Contains basic reducers for managing loading states and errors
 */
const dashboardSlice = createSlice({
	name: 'dashboard',
	initialState,
	reducers: {
		/**
		 * Set loading state
		 * @param state - Current dashboard state
		 * @param action - PayloadAction containing boolean loading state
		 */
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},

		/**
		 * Set error message
		 * @param state - Current dashboard state
		 * @param action - PayloadAction containing error string
		 */
		setError(state, action: PayloadAction<string>) {
			state.error = action.payload;
			state.loading = false;
		},

		/**
		 * Clear error message
		 * @param state - Current dashboard state
		 */
		clearError(state) {
			state.error = null;
		},

		/**
		 * Set dashboard state (for testing/demo purposes)
		 * Allows manually setting any dashboard state fields
		 * @param state - Current dashboard state
		 * @param action - PayloadAction containing partial dashboard state
		 */
		setDashboardState(state, action: PayloadAction<Partial<DashboardState>>) {
			return { ...state, ...action.payload };
		},

		/**
		 * Reset dashboard to initial state
		 * @param state - Current dashboard state
		 */
		resetDashboard() {
			return initialState;
		},

		/**
		 * EPIC-015-S2: Dismiss Alert
		 * Removes an alert from the dashboard alerts array
		 * @param state - Current dashboard state
		 * @param action - PayloadAction containing alert ID to dismiss
		 */
		dismissAlert(state, action: PayloadAction<string>) {
			state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
		},
	},
	extraReducers: builder => {
		builder
			// Handle fetchDashboardData pending state
			.addCase(fetchDashboardData.pending, state => {
				state.loading = true;
				state.error = null;
			})
			// Handle fetchDashboardData success
			// Updated in EPIC-009-S4, S5, S6 to include metrics with trends
			// Updated in EPIC-010-S2 to include lastSession
			// Updated in EPIC-014-S4 to include alerts
			.addCase(fetchDashboardData.fulfilled, (state, action) => {
				state.loading = false;
				// Update assessment statuses
				state.assessmentStatuses.rom = action.payload.assessmentStatuses.rom;
				state.assessmentStatuses.posture =
					action.payload.assessmentStatuses.posture;
				state.assessmentStatuses.survey =
					action.payload.assessmentStatuses.survey;
				// Update metrics with trends (EPIC-009-S4, S5, S6)
				state.metrics.romScore = action.payload.metrics.romScore;
				state.metrics.romTrend = action.payload.metrics.romTrend;
				state.metrics.sessionsCompleted =
					action.payload.metrics.sessionsCompleted;
				state.metrics.sessionsTrend = action.payload.metrics.sessionsTrend;
				state.metrics.streak = action.payload.metrics.currentStreak;
				state.metrics.streakTrend = action.payload.metrics.streakTrend;
				// Update lastSession (EPIC-010-S2)
				state.lastSession = action.payload.lastSession;
				// Update alerts (EPIC-014-S4)
				state.alerts = action.payload.alerts;
			})
			// Handle fetchDashboardData failure
			.addCase(fetchDashboardData.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || 'Failed to fetch dashboard data';
			});
	},
});

export const {
	setLoading,
	setError,
	clearError,
	setDashboardState,
	resetDashboard,
	dismissAlert,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
