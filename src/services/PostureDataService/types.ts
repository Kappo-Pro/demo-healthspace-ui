/**
 * Posture Data Service Types
 *
 * Type definitions for the Posture Data Service Layer (FR24).
 * Backend-agnostic interface supporting both mock and API implementations.
 *
 * @module services/PostureDataService/types
 */

import type {
	PostureSession,
	PostureStatus,
	AdminFilter,
	ExerciseRecommendation,
} from '@types/posture';
import type {
	OrganizationalMetricsData,
	OrganizationalMetricsFilter,
	ExportTemplate,
	ExecutiveSummary,
} from '@types/organizationalMetrics';

/**
 * Pagination parameters for list operations
 */
export interface PaginationParams {
	/** Page number (1-indexed) */
	page: number;

	/** Items per page */
	pageSize: number;
}

/**
 * Paginated response wrapper
 */
export interface PostureSessionPage {
	/** Session data */
	data: PostureSession[];

	/** Pagination metadata */
	pagination: {
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

/**
 * Detailed session with additional context
 * Used for session detail view (FR7)
 */
export interface PostureSessionDetail extends PostureSession {
	/** Related sessions for comparison */
	relatedSessions: PostureSession[];

	/** AI-generated treatment recommendations */
	recommendations: ExerciseRecommendation[];

	/** Clinical notes (if any) */
	clinicalNotes?: string;

	/** Admin review status */
	reviewStatus: 'pending' | 'reviewed' | 'flagged';
}

/**
 * Admin dashboard aggregated data
 * Used by admin triage dashboard (FR11)
 */
export interface AdminDashboardData {
	/** Filtered session list */
	sessions: PostureSession[];

	/** Summary statistics */
	summary: {
		totalPatients: number;
		totalSessions: number;
		criticalCases: number;
		avgScore: number;
	};

	/** Status breakdown */
	statusBreakdown: Record<PostureStatus, number>;

	/** Pagination metadata */
	pagination: {
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

/**
 * Bulk update result
 */
export interface BulkUpdateResult {
	/** Number of sessions updated */
	updatedCount: number;

	/** Failed session IDs */
	failedIds: string[];

	/** Error messages by session ID */
	errors: Record<string, string>;
}

/**
 * Clinical outcomes data
 * Used for patient progress tracking (FR6, FR17)
 */
export interface ClinicalOutcomes {
	/** Patient identifier */
	patientId: string;

	/** Overall progress summary */
	progress: {
		/** First assessment date */
		startDate: string;

		/** Latest assessment date */
		lastAssessmentDate: string;

		/** Total assessments completed */
		totalAssessments: number;

		/** Average score across all assessments */
		averageScore: number;

		/** Score improvement from first to latest (%) */
		scoreImprovement: number;

		/** Trend direction */
		trend: 'improving' | 'stable' | 'declining';
	};

	/** Metric-specific outcomes */
	metricOutcomes: {
		headAlignment: MetricOutcome;
		shoulderSymmetry: MetricOutcome;
		spineCurvature: MetricOutcome;
		hipAlignment: MetricOutcome;
		balance: MetricOutcome;
	};

	/** Achieved milestones */
	milestones: Array<{
		id: string;
		title: string;
		achievedAt: string;
		description: string;
	}>;

	/** Clinical outcome measures (FR17) */
	measures?: Array<unknown>; // Imported from @types/clinicalOutcomes

	/** Correlations with posture scores (FR17) */
	correlations?: Record<string, unknown>; // Imported from @types/clinicalOutcomes

	/** Clinical insights (FR17) */
	insights?: Array<unknown>; // Imported from @types/clinicalOutcomes

	/** Outcome goals (FR17) */
	goals?: Array<unknown>; // Imported from @types/clinicalOutcomes
}

/**
 * Outcome data for a specific metric
 */
export interface MetricOutcome {
	/** Current value (0-100) */
	current: number;

	/** Initial baseline value */
	baseline: number;

	/** Improvement percentage */
	improvement: number;

	/** Trend direction */
	trend: 'improving' | 'stable' | 'declining';

	/** Target value (if goal exists) */
	target?: number;

	/** Progress to target (%) */
	progressToTarget?: number;
}

/**
 * Service error with user-friendly message
 */
export interface ServiceError extends Error {
	/** HTTP status code (if applicable) */
	statusCode?: number;

	/** User-friendly error message */
	userMessage: string;

	/** Original error (for logging) */
	originalError?: Error;

	/** Retry-able flag */
	retryable: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
	/** Maximum retry attempts */
	maxAttempts: number;

	/** Initial delay (ms) */
	initialDelay: number;

	/** Backoff multiplier */
	backoffMultiplier: number;

	/** Maximum delay (ms) */
	maxDelay: number;
}

/**
 * Posture Data Service Interface
 *
 * Backend-agnostic interface for posture analytics data operations.
 * Supports both mock and real API implementations.
 *
 * Design Principles:
 * - Promise-based async operations
 * - Type-safe request/response contracts
 * - User-friendly error handling
 * - Pagination support for list operations
 * - Retry logic for transient failures
 */
export interface IPostureDataService {
	/**
	 * Get paginated session history for a patient
	 *
	 * @param patientId - Patient identifier
	 * @param params - Pagination parameters
	 * @returns Paginated session list
	 * @throws {ServiceError} On network failure or invalid patient
	 */
	getPatientSessions(
		patientId: string,
		params: PaginationParams,
	): Promise<PostureSessionPage>;

	/**
	 * Get detailed session data with recommendations
	 *
	 * @param sessionId - Session identifier
	 * @returns Detailed session data
	 * @throws {ServiceError} On network failure or session not found
	 */
	getSessionDetail(sessionId: string): Promise<PostureSessionDetail>;

	/**
	 * Get admin dashboard data with filters
	 *
	 * @param filters - Filter criteria
	 * @returns Aggregated dashboard data
	 * @throws {ServiceError} On network failure
	 */
	getAdminDashboard(filters: AdminFilter): Promise<AdminDashboardData>;

	/**
	 * Update session review status
	 *
	 * @param sessionId - Session identifier
	 * @param status - New review status
	 * @throws {ServiceError} On network failure or invalid status
	 */
	updateSessionStatus(
		sessionId: string,
		status: PostureSessionDetail['reviewStatus'],
	): Promise<void>;

	/**
	 * Bulk update multiple sessions
	 *
	 * @param sessionIds - Array of session identifiers
	 * @param updates - Partial session updates
	 * @returns Update results with error details
	 * @throws {ServiceError} On complete failure (partial failures returned in result)
	 */
	bulkUpdate(
		sessionIds: string[],
		updates: Partial<PostureSession>,
	): Promise<BulkUpdateResult>;

	/**
	 * Get exercise recommendations for a session
	 *
	 * @param sessionId - Session identifier
	 * @returns Personalized exercise recommendations
	 * @throws {ServiceError} On network failure
	 */
	getExerciseRecommendations(
		sessionId: string,
	): Promise<ExerciseRecommendation[]>;

	/**
	 * Get clinical outcomes for a patient
	 *
	 * @param patientId - Patient identifier
	 * @returns Clinical outcome metrics and milestones
	 * @throws {ServiceError} On network failure or invalid patient
	 */
	getClinicalOutcomes(patientId: string): Promise<ClinicalOutcomes>;

	/**
	 * Get organizational metrics for multi-clinic analytics
	 *
	 * @param filters - Filter criteria for metrics (date range, cohort grouping, etc.)
	 * @returns Organizational metrics data (aggregate, cohorts, ROI, visualizations)
	 * @throws {ServiceError} On network failure
	 */
	getOrganizationalMetrics(
		filters: OrganizationalMetricsFilter,
	): Promise<OrganizationalMetricsData>;

	/**
	 * Generate executive summary for organizational report
	 *
	 * @param metrics - Organizational metrics data
	 * @returns Executive summary with highlights and recommendations
	 * @throws {ServiceError} On generation failure
	 */
	generateExecutiveSummary(
		metrics: OrganizationalMetricsData,
	): Promise<ExecutiveSummary>;

	/**
	 * Export organizational report to PDF or PowerPoint
	 *
	 * @param template - Export template configuration
	 * @param metrics - Organizational metrics data
	 * @param summary - Executive summary
	 * @returns Report file as Blob
	 * @throws {ServiceError} On export failure
	 */
	exportReport(
		template: ExportTemplate,
		metrics: OrganizationalMetricsData,
		summary: ExecutiveSummary,
	): Promise<Blob>;
}
