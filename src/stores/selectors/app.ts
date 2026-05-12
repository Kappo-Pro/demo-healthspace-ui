/**
 * Application Selectors
 *
 * @description Memoized selectors for app-level state (settings, reports, etc.)
 * @performance Prevents unnecessary re-renders with reselect
 */

import type { ReduxState } from '@stores/index';
import { createSelector } from 'reselect';

// ============================================================================
// BASE SELECTORS (Input Selectors)
// ============================================================================

/** Select settings slice */
export const selectSettingsSlice = (state: ReduxState) => state.settings;

/** Select reports slice */
export const selectReportsSlice = (state: ReduxState) => state.reports;

/** Select my library slice */
export const selectMyLibrarySlice = (state: ReduxState) => state.myLibrary;

/** Select onboard slice */
export const selectOnBoardSlice = (state: ReduxState) => state.onBoard;

/** Select survey slice */
export const selectSurveySlice = (state: ReduxState) => state.survey;

/** Select activity stream slice */
export const selectActivityStreamSlice = (state: ReduxState) =>
	state.activityStream;

// ============================================================================
// SETTINGS SELECTORS
// ============================================================================

/**
 * Select settings data
 * @memoized Returns settings configuration
 */
export const selectSettingsData = createSelector(
	[selectSettingsSlice],
	settings => settings,
);

/**
 * Select app theme
 * @memoized Returns current theme from settings
 */
export const selectAppTheme = createSelector(
	[selectSettingsData],
	settings => settings.appearance.theme,
);

/**
 * Select OpenAI API key status
 * @memoized Returns if API key is configured
 */
export const selectHasOpenAiKey = createSelector(
	[selectSettingsData],
	settings =>
		!!settings.integrations.openaiApiKey &&
		settings.integrations.openaiApiKey.length > 0,
);

/**
 * Select bandwidth setting
 * @memoized Returns network bandwidth preference
 */
export const selectBandwidthSetting = createSelector(
	[selectSettingsData],
	settings => settings.advanced.bandwidth,
);

/**
 * Select self-registration status
 * @memoized Returns self-registration config
 */
export const selectSelfRegistration = createSelector(
	[selectSettingsData],
	settings => settings.general.selfRegistration,
);

/**
 * Check if self-registration is active
 * @memoized Derived boolean
 */
export const selectIsSelfRegistrationActive = createSelector(
	[selectSelfRegistration],
	selfReg => selfReg?.active || false,
);

/**
 * Select saved tags
 * @memoized Returns available tags
 */
export const selectSavedTags = createSelector(
	[selectSettingsData],
	settings => settings.advanced.tags || [],
);

/**
 * Select saved user plans
 * @memoized Returns user's saved plans
 */
export const selectSavedUserPlans = createSelector(
	[selectSettingsData],
	settings => settings.plans.savedUserPlans,
);

// ============================================================================
// REPORTS SELECTORS
// ============================================================================

/**
 * Select all reports
 * @memoized Returns reports array
 */
export const selectAllReports = createSelector(
	[selectReportsSlice],
	reports => reports.reports || [],
);

/**
 * Select reports count
 * @memoized Derived count
 */
export const selectReportsCount = createSelector(
	[selectAllReports],
	reports => reports.length,
);

/**
 * Select reports by type
 * @param type Report type to filter
 * @memoized Filters reports by type
 */
export const selectReportsByType = (type: string) =>
	createSelector([selectAllReports], reports =>
		reports.filter((report: unknown) => report?.type === type),
	);

/**
 * Select recent reports
 * @param limit Number of recent reports
 * @memoized Returns most recent reports
 */
export const selectRecentReports = (limit = 5) =>
	createSelector([selectAllReports], reports => reports.slice(0, limit));

// ============================================================================
// MY LIBRARY SELECTORS
// ============================================================================

/**
 * Select library items
 * @memoized Returns library content
 */
export const selectLibraryItems = createSelector(
	[selectMyLibrarySlice],
	library => library.items || [],
);

/**
 * Select library count
 * @memoized Derived count
 */
export const selectLibraryItemsCount = createSelector(
	[selectLibraryItems],
	items => items.length,
);

/**
 * Select library items by category
 * @param category Category to filter
 * @memoized Filters library by category
 */
export const selectLibraryItemsByCategory = (category: string) =>
	createSelector([selectLibraryItems], items =>
		items.filter((item: unknown) => item?.category === category),
	);

// ============================================================================
// ONBOARDING SELECTORS
// ============================================================================

/**
 * Select onboarding data
 * @memoized Returns onboarding state
 */
export const selectOnBoardData = createSelector(
	[selectOnBoardSlice],
	onBoard => onBoard.onBoard,
);

/**
 * Check if onboarding is complete
 * @memoized Returns completion status
 */
export const selectIsOnBoardingComplete = createSelector(
	[selectOnBoardData],
	onBoard => onBoard.isComplete || false,
);

/**
 * Select current onboarding step
 * @memoized Returns active step
 */
export const selectOnBoardingCurrentStep = createSelector(
	[selectOnBoardData],
	onBoard => onBoard.currentStep || 0,
);

/**
 * Select total onboarding steps
 * @memoized Returns total steps count
 */
export const selectOnBoardingTotalSteps = createSelector(
	[selectOnBoardData],
	onBoard => onBoard.totalSteps || 0,
);

/**
 * Calculate onboarding progress percentage
 * @memoized Derived percentage
 */
export const selectOnBoardingProgress = createSelector(
	[selectOnBoardingCurrentStep, selectOnBoardingTotalSteps],
	(current, total) => {
		if (total === 0) return 0;
		return Math.round((current / total) * 100);
	},
);

// ============================================================================
// SURVEY SELECTORS
// ============================================================================

/**
 * Select survey data
 * @memoized Returns survey state
 */
export const selectSurveyData = createSelector(
	[selectSurveySlice],
	survey => survey.survey,
);

/**
 * Select active surveys
 * @memoized Filters active surveys
 */
export const selectActiveSurveys = createSelector([selectSurveyData], survey =>
	(survey?.surveys || []).filter((s: unknown) => s?.active),
);

/**
 * Select survey responses
 * @memoized Returns survey responses
 */
export const selectSurveyResponses = createSelector(
	[selectSurveyData],
	survey => survey?.responses || [],
);

/**
 * Select surveys count
 * @memoized Derived count
 */
export const selectActiveSurveysCount = createSelector(
	[selectActiveSurveys],
	surveys => surveys.length,
);

// ============================================================================
// ACTIVITY STREAM SELECTORS
// ============================================================================

/**
 * Select activity stream data
 * @memoized Returns activity stream state
 */
export const selectActivityStreamData = createSelector(
	[selectActivityStreamSlice],
	activityStream => activityStream.activityStream,
);

/**
 * Select recent activities
 * @memoized Returns recent activity items
 */
export const selectRecentActivities = createSelector(
	[selectActivityStreamData],
	activityStream =>
		(activityStream?.activities || []).slice(0, 10), // Get most recent 10
);

/**
 * Select unread activities count
 * @memoized Returns count of unread activities
 */
export const selectUnreadActivitiesCount = createSelector(
	[selectActivityStreamData],
	activityStream => activityStream?.unreadCount || 0,
);

// ============================================================================
// CROSS-APP SELECTORS
// ============================================================================

/**
 * Select app loading states
 * @memoized Combines loading states from multiple slices
 * @performance Useful for global loading indicators
 */
export const selectAppLoadingStates = createSelector(
	[selectReportsSlice, selectMyLibrarySlice],
	(reports, library) => ({
		reportsLoading: reports.loading || false,
		libraryLoading: library.loading || false,
	}),
);

/**
 * Check if any app resource is loading
 * @memoized Returns true if any loading state is active
 */
export const selectIsAnyResourceLoading = createSelector(
	[selectAppLoadingStates],
	loadingStates => {
		return Object.values(loadingStates).some(isLoading => isLoading);
	},
);

/**
 * Select app notification count
 * @memoized Combines notification counts
 */
export const selectAppNotificationCount = createSelector(
	[selectUnreadActivitiesCount],
	activitiesCount => {
		return activitiesCount;
	},
);
