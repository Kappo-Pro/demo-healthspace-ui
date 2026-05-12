/**
 * Posture Analytics Redux Slice Types
 *
 * State shape and type definitions for posture analytics slice.
 * Supports admin dashboard, patient journey view, and session management.
 *
 * @module stores/posture/postureAnalytics/types
 */

import type { PostureSession, AdminFilter } from '@types/posture';

/**
 * Loading state tracking for individual operations
 */
export interface LoadingState {
	fetchPatientSessions: boolean;
	fetchAdminSessions: boolean;
	updateSessionStatus: boolean;
	bulkUpdateSessions: boolean;
}

/**
 * Error state tracking for individual operations
 */
export interface ErrorState {
	fetchPatientSessions: string | null;
	fetchAdminSessions: string | null;
	updateSessionStatus: string | null;
	bulkUpdateSessions: string | null;
}

/**
 * Pagination state
 */
export interface PaginationState {
	currentPage: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

/**
 * Posture Analytics Slice State
 *
 * Normalized state structure using createEntityAdapter for sessions.
 * Separate loading/error states per operation for granular UI control.
 */
export interface PostureAnalyticsState {
	/** Normalized map of posture sessions (managed by createEntityAdapter) */
	sessions: {
		ids: string[];
		entities: Record<string, PostureSession>;
	};

	/** Admin filter state */
	filters: AdminFilter;

	/** Currently selected session ID */
	selectedSessionId: string | null;

	/** Loading states per operation */
	loading: LoadingState;

	/** Error states per operation */
	error: ErrorState;

	/** Pagination state */
	pagination: PaginationState;

	/** Last fetch timestamp for cache invalidation */
	lastFetchedAt: number | null;
}

/**
 * API Response for paginated session list
 */
export interface SessionListResponse {
	data: PostureSession[];
	pagination: {
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

/**
 * Fetch patient sessions payload
 */
export interface FetchPatientSessionsPayload {
	patientId: string;
	page?: number;
	pageSize?: number;
}

/**
 * Fetch admin sessions payload
 */
export interface FetchAdminSessionsPayload {
	filters?: AdminFilter;
	page?: number;
	pageSize?: number;
}

/**
 * Update session status payload
 */
export interface UpdateSessionStatusPayload {
	sessionId: string;
	status: PostureSession['analysis']['status'];
}

/**
 * Bulk update sessions payload
 */
export interface BulkUpdateSessionsPayload {
	sessionIds: string[];
	updates: Partial<PostureSession>;
}
