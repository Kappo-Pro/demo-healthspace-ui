/**
 * Dashboard Slice Barrel Export
 * Re-exports all dashboard slice components for clean imports
 * Updated in EPIC-009 to include metric selectors
 * Updated in EPIC-010-S2 to include lastSession selector and type
 * Updated in EPIC-014-S1 to include alert types
 * Updated in EPIC-014-S2 to include alert rules
 * Updated in EPIC-014-S3 to include evaluateAlerts function
 * Updated in EPIC-014-S4 to include selectActiveAlerts selector
 * Updated in EPIC-015-S2 to include dismissAlert action
 * Updated in EPIC-020-S1 to include selectUserFunctionalGoalIds selector
 */

export { default } from './dashboardSlice';
export {
	setLoading,
	setError,
	clearError,
	setDashboardState,
	resetDashboard,
	dismissAlert, // EPIC-015-S2
	fetchDashboardData,
	selectROMMetric,
	selectSessionsMetric,
	selectStreakMetric,
	selectActiveProgramForHero, // EPIC-010-S2
	evaluateAlerts, // EPIC-014-S3
	selectActiveAlerts, // EPIC-014-S4
} from './dashboardSlice';
export type {
	DashboardState,
	DashboardMetrics,
	AssessmentStatus,
	LastSession, // EPIC-010-S2
} from './types';

// EPIC-014-S1: Alert System Types
export {
	AlertType,
	AlertPriority,
} from './alertTypes';
export type {
	DashboardAlert,
	AlertRule,
	AlertRuleset,
} from './alertTypes';

// EPIC-014-S2: Alert Rules
export { alertRules } from './alertRules';

// EPIC-020-S1: User Functional Goals Selectors
// EPIC-020-S2: User Persona/Audience Selectors
// EPIC-021-S3: ROM History Selector
// EPIC-022-S3: Session History Selector
// EPIC-023-S3: Goal Progress Selector
export {
	selectUserFunctionalGoalIds,
	selectUserPersonaId,
	selectUserAudienceId,
	selectROMHistoryLast3Months, // EPIC-021-S3
	selectSessionHistoryLast90Days, // EPIC-022-S3
	selectGoalProgress, // EPIC-023-S3
} from './selectors';

// EPIC-023-S3: Goal Progress Data Type
export type { GoalProgressData } from './selectors';

// EPIC-027-S1: Dashboard Preferences Slice
export {
	loadPreferences,
	savePreferences,
	updateLayoutOrder,
	toggleSectionVisibility,
	setLayoutType,
	setWeeklySessionGoal,
	resetPreferences,
	clearPreferencesError,
	selectDashboardPreferences,
	selectPreferencesLoading,
	selectPreferencesError,
	selectLayoutOrder,
	selectSectionVisibility,
	selectLayoutType,
	selectWeeklySessionGoal,
	defaultPreferences,
} from './dashboardPreferencesSlice';

export type {
	DashboardPreferences,
	DashboardPreferencesState,
} from './dashboardPreferencesSlice';
