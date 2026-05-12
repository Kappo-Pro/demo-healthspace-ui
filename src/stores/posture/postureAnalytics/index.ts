/**
 * Posture Analytics Slice Barrel Export
 *
 * Re-exports all posture analytics slice components for clean imports.
 * Follows established Redux slice pattern from dashboard and activityStream.
 *
 * @module stores/posture/postureAnalytics
 */

// Slice reducer (default export)
export { default } from './postureAnalyticsSlice';

// Actions
export {
	setFilters,
	updateFilters,
	clearFilters,
	setSelectedSession,
	clearSelectedSession,
	clearError,
	clearAllErrors,
	resetPostureAnalytics,
} from './postureAnalyticsSlice';

// Thunks
export {
	fetchPatientSessions,
	fetchAdminSessions,
	updateSessionStatus,
	bulkUpdateSessions,
} from './postureAnalyticsSlice';

// Entity adapter selectors
export { sessionsSelectors } from './postureAnalyticsSlice';

// Memoized selectors
export {
	selectPostureAnalyticsState,
	selectSessionsState,
	selectAllSessions,
	selectSessionById,
	selectFilters,
	selectSelectedSessionId,
	selectSelectedSession,
	selectLoading,
	selectErrors,
	selectPagination,
	selectLastFetchedAt,
	selectFilteredSessions,
	selectPatientJourney,
	selectSessionMetrics,
	selectTotalSessionCount,
	selectIsAnyLoading,
	selectHasErrors,
	selectPaginatedSessions,
} from './selectors';

// Types
export type {
	PostureAnalyticsState,
	LoadingState,
	ErrorState,
	PaginationState,
	SessionListResponse,
	FetchPatientSessionsPayload,
	FetchAdminSessionsPayload,
	UpdateSessionStatusPayload,
	BulkUpdateSessionsPayload,
} from './types';
