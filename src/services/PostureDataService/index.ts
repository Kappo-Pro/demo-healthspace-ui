/**
 * Posture Data Service Factory
 *
 * Dependency injection container for PostureDataService.
 * Switches between mock and API implementations based on environment variable.
 *
 * Usage:
 *   import { postureDataService } from '@services/PostureDataService';
 *   const sessions = await postureDataService.getPatientSessions(patientId, params);
 *
 * Environment Configuration:
 *   REACT_APP_USE_MOCK_DATA=true  → Uses MockPostureDataService
 *   REACT_APP_USE_MOCK_DATA=false → Uses ApiPostureDataService (default)
 *
 * @module services/PostureDataService
 */

import { MockPostureDataService } from './MockPostureDataService';
import { ApiPostureDataService } from './ApiPostureDataService';
import type { IPostureDataService } from './types';

/**
 * Check if mock data should be used
 */
const shouldUseMockData = (): boolean => {
	const env = process.env.REACT_APP_USE_MOCK_DATA;

	// Explicitly check for 'true' string
	if (env === 'true') {
		return true;
	}

	// Explicitly check for 'false' string
	if (env === 'false') {
		return false;
	}

	// Default to API service in production, mock in development
	return process.env.NODE_ENV === 'development' && env !== 'false';
};

/**
 * Create service instance
 */
const createPostureDataService = (): IPostureDataService => {
	if (shouldUseMockData()) {
		return new MockPostureDataService({
			sessionCount: 120,
			errorRate: 0, // 0% error rate for stable development
			latency: { min: 200, max: 500 }, // Realistic API latency
		});
	}

	return new ApiPostureDataService({
		basePath: '/api/posture-analytics',
		debug: process.env.NODE_ENV === 'development',
	});
};

/**
 * Singleton service instance
 */
export const postureDataService = createPostureDataService();

/**
 * Re-export types for convenience
 */
export type {
	IPostureDataService,
	PaginationParams,
	PostureSessionPage,
	PostureSessionDetail,
	AdminDashboardData,
	BulkUpdateResult,
	ClinicalOutcomes,
	MetricOutcome,
	ServiceError,
	RetryConfig,
} from './types';

/**
 * Re-export implementation classes for testing
 */
export { MockPostureDataService } from './MockPostureDataService';
export { ApiPostureDataService } from './ApiPostureDataService';
