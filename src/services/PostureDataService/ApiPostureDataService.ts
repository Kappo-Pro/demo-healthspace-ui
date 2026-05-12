/**
 * API Posture Data Service
 *
 * Real backend integration using Axios.
 * Features:
 * - Auth interceptor integration with @utils/Api
 * - Exponential backoff retry logic
 * - User-friendly error handling
 * - Request/response logging for debugging
 *
 * @module services/PostureDataService/ApiPostureDataService
 */

import axios from '@utils/Api';
import type {
	PostureSession,
	AdminFilter,
	ExerciseRecommendation,
} from '@types/posture';
import type {
	IPostureDataService,
	PaginationParams,
	PostureSessionPage,
	PostureSessionDetail,
	AdminDashboardData,
	BulkUpdateResult,
	ClinicalOutcomes,
	ServiceError,
	RetryConfig,
} from './types';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxAttempts: 3,
	initialDelay: 1000, // 1 second
	backoffMultiplier: 2,
	maxDelay: 10000, // 10 seconds
};

/**
 * Retryable HTTP status codes (transient errors)
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * API Posture Data Service
 *
 * Production-ready API client with:
 * - Automatic authentication via axios interceptors
 * - Exponential backoff retry for transient failures
 * - User-friendly error messages
 * - Debug logging in development
 */
export class ApiPostureDataService implements IPostureDataService {
	/** API base path */
	private basePath: string;

	/** Retry configuration */
	private retryConfig: RetryConfig;

	/** Debug logging flag */
	private debug: boolean;

	constructor(options?: {
		basePath?: string;
		retryConfig?: Partial<RetryConfig>;
		debug?: boolean;
	}) {
		this.basePath = options?.basePath ?? '/api/posture-analytics';
		this.retryConfig = {
			...DEFAULT_RETRY_CONFIG,
			...options?.retryConfig,
		};
		this.debug = options?.debug ?? process.env.NODE_ENV === 'development';
	}

	/**
	 * Log debug messages
	 */
	private log(_message: string, _data?: unknown): void {
		if (this.debug) {
			// Intentionally empty - logging disabled in production
		}
	}

	/**
	 * Convert axios error to ServiceError
	 */
	private handleError(error: unknown, operation: string): ServiceError {
		this.log(`Error in ${operation}:`, error);

		const serviceError: ServiceError = new Error(
			`Operation failed: ${operation}`,
		) as ServiceError;

		// Extract error details from axios error
		if (axios.isAxiosError(error)) {
			const status = error.response?.status ?? 0;
			const message = error.response?.data?.message ?? error.message;

			serviceError.statusCode = status;
			serviceError.originalError = error;
			serviceError.retryable = RETRYABLE_STATUS_CODES.includes(status);

			// User-friendly messages based on status code
			switch (status) {
				case 400:
					serviceError.userMessage =
						'Invalid request. Please check your input.';
					break;
				case 401:
					serviceError.userMessage =
						'Authentication required. Please log in again.';
					break;
				case 403:
					serviceError.userMessage =
						'You do not have permission to access this resource.';
					break;
				case 404:
					serviceError.userMessage = 'Resource not found.';
					break;
				case 408:
					serviceError.userMessage =
						'Request timeout. Please check your connection and try again.';
					break;
				case 429:
					serviceError.userMessage =
						'Too many requests. Please wait a moment and try again.';
					break;
				case 500:
					serviceError.userMessage = 'Server error. Please try again later.';
					break;
				case 502:
				case 503:
				case 504:
					serviceError.userMessage =
						'Service temporarily unavailable. Please try again in a few moments.';
					break;
				default:
					serviceError.userMessage =
						message || 'An unexpected error occurred. Please try again.';
			}
		} else {
			// Network error or unknown error
			serviceError.statusCode = 0;
			serviceError.userMessage =
				'Network error. Please check your connection and try again.';
			serviceError.retryable = true;
		}

		return serviceError;
	}

	/**
	 * Retry wrapper with exponential backoff
	 */
	private async withRetry<T>(
		operation: string,
		fn: () => Promise<T>,
	): Promise<T> {
		let lastError: ServiceError | null = null;
		let delay = this.retryConfig.initialDelay;

		for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
			try {
				this.log(
					`${operation} - Attempt ${attempt}/${this.retryConfig.maxAttempts}`,
				);
				const result = await fn();
				this.log(`${operation} - Success`);
				return result;
			} catch (error) {
				lastError = this.handleError(error, operation);

				// Don't retry if error is not retryable
				if (!lastError.retryable) {
					this.log(`${operation} - Non-retryable error, aborting`);
					throw lastError;
				}

				// Don't retry if max attempts reached
				if (attempt >= this.retryConfig.maxAttempts) {
					this.log(`${operation} - Max attempts reached, aborting`);
					throw lastError;
				}

				// Wait before retry (exponential backoff)
				this.log(`${operation} - Retrying in ${delay}ms`);
				await new Promise(resolve => setTimeout(resolve, delay));

				delay = Math.min(
					delay * this.retryConfig.backoffMultiplier,
					this.retryConfig.maxDelay,
				);
			}
		}

		// Should never reach here, but TypeScript needs this
		throw (
			lastError ??
			new Error(`${operation} - Unknown error after retry exhaustion`)
		);
	}

	/**
	 * Get paginated patient sessions
	 */
	async getPatientSessions(
		patientId: string,
		params: PaginationParams,
	): Promise<PostureSessionPage> {
		return this.withRetry('getPatientSessions', async () => {
			const { data } = await axios.get<PostureSessionPage>(
				`${this.basePath}/patients/${patientId}/sessions`,
				{
					params: {
						page: params.page,
						limit: params.pageSize,
					},
				},
			);
			return data;
		});
	}

	/**
	 * Get session detail
	 */
	async getSessionDetail(sessionId: string): Promise<PostureSessionDetail> {
		return this.withRetry('getSessionDetail', async () => {
			const { data } = await axios.get<PostureSessionDetail>(
				`${this.basePath}/sessions/${sessionId}`,
			);
			return data;
		});
	}

	/**
	 * Get admin dashboard data
	 */
	async getAdminDashboard(filters: AdminFilter): Promise<AdminDashboardData> {
		return this.withRetry('getAdminDashboard', async () => {
			// Build query params from filters
			const params: Record<string, unknown> = {};

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

			if (filters.pagination) {
				params.page = filters.pagination.page;
				params.limit = filters.pagination.pageSize;
			}

			const { data } = await axios.get<AdminDashboardData>(
				`${this.basePath}/admin/dashboard`,
				{ params },
			);
			return data;
		});
	}

	/**
	 * Update session status
	 */
	async updateSessionStatus(
		sessionId: string,
		status: PostureSessionDetail['reviewStatus'],
	): Promise<void> {
		return this.withRetry('updateSessionStatus', async () => {
			await axios.patch(`${this.basePath}/sessions/${sessionId}/status`, {
				reviewStatus: status,
			});
		});
	}

	/**
	 * Bulk update sessions
	 */
	async bulkUpdate(
		sessionIds: string[],
		updates: Partial<PostureSession>,
	): Promise<BulkUpdateResult> {
		return this.withRetry('bulkUpdate', async () => {
			const { data } = await axios.post<BulkUpdateResult>(
				`${this.basePath}/sessions/bulk-update`,
				{
					sessionIds,
					updates,
				},
			);
			return data;
		});
	}

	/**
	 * Get exercise recommendations
	 */
	async getExerciseRecommendations(
		sessionId: string,
	): Promise<ExerciseRecommendation[]> {
		return this.withRetry('getExerciseRecommendations', async () => {
			const { data } = await axios.get<{ data: ExerciseRecommendation[] }>(
				`${this.basePath}/sessions/${sessionId}/recommendations`,
			);
			return data.data;
		});
	}

	/**
	 * Get clinical outcomes
	 */
	async getClinicalOutcomes(patientId: string): Promise<ClinicalOutcomes> {
		return this.withRetry('getClinicalOutcomes', async () => {
			const { data } = await axios.get<ClinicalOutcomes>(
				`${this.basePath}/patients/${patientId}/outcomes`,
			);
			return data;
		});
	}
}
