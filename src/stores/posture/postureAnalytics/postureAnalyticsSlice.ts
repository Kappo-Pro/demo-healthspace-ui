/**
 * Posture Analytics Redux Slice
 *
 * Centralized state management for posture analytics data.
 * Uses createEntityAdapter for normalized session storage.
 * Provides thunks for API operations and memoized selectors for derived state.
 *
 * @module stores/posture/postureAnalytics
 */

import {
	createSlice,
	createAsyncThunk,
	createEntityAdapter,
	PayloadAction,
} from '@reduxjs/toolkit';
import axios from 'axios';
import type { PostureSession } from '@types/posture';
import type {
	PostureAnalyticsState,
	SessionListResponse,
	FetchPatientSessionsPayload,
	FetchAdminSessionsPayload,
	UpdateSessionStatusPayload,
	BulkUpdateSessionsPayload,
} from './types';

/**
 * Entity adapter for normalized session storage
 * Sorts sessions by timestamp (most recent first)
 */
const sessionsAdapter = createEntityAdapter<PostureSession>({
	selectId: session => session.id,
	sortComparer: (a, b) =>
		new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
});

/**
 * Initial state with normalized structure
 */
const initialState: PostureAnalyticsState = {
	sessions: sessionsAdapter.getInitialState(),
	filters: {
		pagination: {
			page: 1,
			pageSize: 50,
		},
	},
	selectedSessionId: null,
	loading: {
		fetchPatientSessions: false,
		fetchAdminSessions: false,
		updateSessionStatus: false,
		bulkUpdateSessions: false,
	},
	error: {
		fetchPatientSessions: null,
		fetchAdminSessions: null,
		updateSessionStatus: null,
		bulkUpdateSessions: null,
	},
	pagination: {
		currentPage: 1,
		pageSize: 50,
		totalCount: 0,
		totalPages: 0,
	},
	lastFetchedAt: null,
};

/**
 * Thunk: Fetch patient's posture session history
 *
 * Loads paginated session data for a specific patient.
 * Used by patient journey view (FR6).
 *
 * @param patientId - Patient identifier
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 50)
 */
export const fetchPatientSessions = createAsyncThunk<
	SessionListResponse,
	FetchPatientSessionsPayload
>(
	'postureAnalytics/fetchPatientSessions',
	async ({ patientId, page = 1, pageSize = 50 }) => {
		const { data } = await axios.get<SessionListResponse>(
			`/posture-analytics/patients/${patientId}/sessions`,
			{
				params: { page, limit: pageSize },
			},
		);
		return data;
	},
);

/**
 * Thunk: Fetch admin dashboard sessions with filters
 *
 * Loads paginated session data with optional filters.
 * Used by admin triage dashboard (FR11).
 *
 * @param filters - Admin filter criteria
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 50)
 */
export const fetchAdminSessions = createAsyncThunk<
	SessionListResponse,
	FetchAdminSessionsPayload
>(
	'postureAnalytics/fetchAdminSessions',
	async ({ filters, page = 1, pageSize = 50 }) => {
		const params: Record<string, unknown> = {
			page,
			limit: pageSize,
		};

		// Build query params from filters
		if (filters) {
			if (filters.status && filters.status.length > 0) {
				params.status = filters.status.join(',');
			}
			if (filters.dateRange) {
				params.startDate = filters.dateRange.start;
				params.endDate = filters.dateRange.end;
			}
			if (filters.scoreRange) {
				params.minScore = filters.scoreRange.min;
				params.maxScore = filters.scoreRange.max;
			}
			if (filters.issueSeverity && filters.issueSeverity.length > 0) {
				params.severity = filters.issueSeverity.join(',');
			}
			if (filters.searchQuery) {
				params.search = filters.searchQuery;
			}
			if (filters.sort) {
				params.sortField = filters.sort.field;
				params.sortOrder = filters.sort.order;
			}
		}

		const { data } = await axios.get<SessionListResponse>(
			'/posture-analytics/sessions',
			{ params },
		);
		return data;
	},
);

/**
 * Thunk: Update session status
 *
 * Updates the status of a single session via dropdown.
 * Used by admin dashboard status dropdown (FR11b).
 *
 * @param sessionId - Session identifier
 * @param status - New status value
 */
export const updateSessionStatus = createAsyncThunk<
	PostureSession,
	UpdateSessionStatusPayload
>('postureAnalytics/updateSessionStatus', async ({ sessionId, status }) => {
	const { data } = await axios.patch<PostureSession>(
		`/posture-analytics/sessions/${sessionId}/status`,
		{ status },
	);
	return data;
});

/**
 * Thunk: Bulk update sessions
 *
 * Updates multiple sessions with the same changes.
 * Used by admin bulk actions (FR13).
 *
 * @param sessionIds - Array of session IDs to update
 * @param updates - Partial session updates to apply
 */
export const bulkUpdateSessions = createAsyncThunk<
	PostureSession[],
	BulkUpdateSessionsPayload
>('postureAnalytics/bulkUpdateSessions', async ({ sessionIds, updates }) => {
	const { data } = await axios.patch<PostureSession[]>(
		'/posture-analytics/sessions/bulk',
		{ sessionIds, updates },
	);
	return data;
});

/**
 * Posture Analytics Slice
 */
const postureAnalyticsSlice = createSlice({
	name: 'postureAnalytics',
	initialState,
	reducers: {
		/**
		 * Set admin filters
		 */
		setFilters: (state, action: PayloadAction<typeof state.filters>) => {
			state.filters = action.payload;
		},

		/**
		 * Update specific filter fields
		 */
		updateFilters: (
			state,
			action: PayloadAction<Partial<typeof state.filters>>,
		) => {
			state.filters = { ...state.filters, ...action.payload };
		},

		/**
		 * Clear all filters
		 */
		clearFilters: state => {
			state.filters = initialState.filters;
		},

		/**
		 * Set selected session ID
		 */
		setSelectedSession: (state, action: PayloadAction<string | null>) => {
			state.selectedSessionId = action.payload;
		},

		/**
		 * Clear selected session
		 */
		clearSelectedSession: state => {
			state.selectedSessionId = null;
		},

		/**
		 * Clear error state for specific operation
		 */
		clearError: (state, action: PayloadAction<keyof typeof state.error>) => {
			state.error[action.payload] = null;
		},

		/**
		 * Clear all errors
		 */
		clearAllErrors: state => {
			state.error = initialState.error;
		},

		/**
		 * Reset entire slice to initial state
		 */
		resetPostureAnalytics: () => initialState,
	},
	extraReducers: builder => {
		// ========================================
		// fetchPatientSessions
		// ========================================
		builder.addCase(fetchPatientSessions.pending, state => {
			state.loading.fetchPatientSessions = true;
			state.error.fetchPatientSessions = null;
		});
		builder.addCase(fetchPatientSessions.fulfilled, (state, action) => {
			state.loading.fetchPatientSessions = false;
			sessionsAdapter.setAll(state.sessions, action.payload.data);
			state.pagination = action.payload.pagination;
			state.lastFetchedAt = Date.now();
		});
		builder.addCase(fetchPatientSessions.rejected, (state, action) => {
			state.loading.fetchPatientSessions = false;
			state.error.fetchPatientSessions =
				action.error.message || 'Failed to load patient sessions';
		});

		// ========================================
		// fetchAdminSessions
		// ========================================
		builder.addCase(fetchAdminSessions.pending, state => {
			state.loading.fetchAdminSessions = true;
			state.error.fetchAdminSessions = null;
		});
		builder.addCase(fetchAdminSessions.fulfilled, (state, action) => {
			state.loading.fetchAdminSessions = false;
			sessionsAdapter.setAll(state.sessions, action.payload.data);
			state.pagination = action.payload.pagination;
			state.lastFetchedAt = Date.now();
		});
		builder.addCase(fetchAdminSessions.rejected, (state, action) => {
			state.loading.fetchAdminSessions = false;
			state.error.fetchAdminSessions =
				action.error.message || 'Failed to load admin sessions';
		});

		// ========================================
		// updateSessionStatus
		// ========================================
		builder.addCase(updateSessionStatus.pending, state => {
			state.loading.updateSessionStatus = true;
			state.error.updateSessionStatus = null;
		});
		builder.addCase(updateSessionStatus.fulfilled, (state, action) => {
			state.loading.updateSessionStatus = false;
			sessionsAdapter.updateOne(state.sessions, {
				id: action.payload.id,
				changes: action.payload,
			});
		});
		builder.addCase(updateSessionStatus.rejected, (state, action) => {
			state.loading.updateSessionStatus = false;
			state.error.updateSessionStatus =
				action.error.message || 'Failed to update session status';
		});

		// ========================================
		// bulkUpdateSessions
		// ========================================
		builder.addCase(bulkUpdateSessions.pending, state => {
			state.loading.bulkUpdateSessions = true;
			state.error.bulkUpdateSessions = null;
		});
		builder.addCase(bulkUpdateSessions.fulfilled, (state, action) => {
			state.loading.bulkUpdateSessions = false;
			const updates = action.payload.map(session => ({
				id: session.id,
				changes: session,
			}));
			sessionsAdapter.updateMany(state.sessions, updates);
		});
		builder.addCase(bulkUpdateSessions.rejected, (state, action) => {
			state.loading.bulkUpdateSessions = false;
			state.error.bulkUpdateSessions =
				action.error.message || 'Failed to bulk update sessions';
		});
	},
});

/**
 * Action exports
 */
export const {
	setFilters,
	updateFilters,
	clearFilters,
	setSelectedSession,
	clearSelectedSession,
	clearError,
	clearAllErrors,
	resetPostureAnalytics,
} = postureAnalyticsSlice.actions;

/**
 * Entity adapter selectors
 * Provides: selectAll, selectById, selectIds, selectEntities, selectTotal
 */
export const sessionsSelectors = sessionsAdapter.getSelectors();

/**
 * Reducer export
 */
export default postureAnalyticsSlice.reducer;
