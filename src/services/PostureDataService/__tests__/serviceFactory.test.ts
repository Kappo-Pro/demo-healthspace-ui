/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Service Factory Tests
 *
 * Test suite for dependency injection and environment-based service selection.
 */

// Mock @utils/Api before imports
jest.mock('@utils/Api', () => ({
	__esModule: true,
	default: {
		get: jest.fn(),
		post: jest.fn(),
		patch: jest.fn(),
		delete: jest.fn(),
		isAxiosError: jest.fn(),
	},
}));

import { MockPostureDataService } from '../MockPostureDataService';
import { ApiPostureDataService } from '../ApiPostureDataService';

describe('PostureDataService Factory', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		// Clear module cache to force factory re-execution
		jest.resetModules();
		// Reset environment
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it('should create MockPostureDataService when REACT_APP_USE_MOCK_DATA=true', () => {
		process.env.REACT_APP_USE_MOCK_DATA = 'true';

		// Re-import to trigger factory logic
		const { postureDataService } = require('../index');

		expect(postureDataService).toBeInstanceOf(MockPostureDataService);
	});

	it('should create ApiPostureDataService when REACT_APP_USE_MOCK_DATA=false', () => {
		process.env.REACT_APP_USE_MOCK_DATA = 'false';

		const { postureDataService } = require('../index');

		expect(postureDataService).toBeInstanceOf(ApiPostureDataService);
	});

	it('should create MockPostureDataService in development when env var not set', () => {
		process.env.NODE_ENV = 'development';
		delete process.env.REACT_APP_USE_MOCK_DATA;

		const { postureDataService } = require('../index');

		expect(postureDataService).toBeInstanceOf(MockPostureDataService);
	});

	it('should create ApiPostureDataService in production when env var not set', () => {
		process.env.NODE_ENV = 'production';
		delete process.env.REACT_APP_USE_MOCK_DATA;

		const { postureDataService } = require('../index');

		expect(postureDataService).toBeInstanceOf(ApiPostureDataService);
	});

	it('should create singleton instance', () => {
		process.env.REACT_APP_USE_MOCK_DATA = 'true';

		const { postureDataService: instance1 } = require('../index');
		const { postureDataService: instance2 } = require('../index');

		expect(instance1).toBe(instance2); // Same instance
	});

	it('should export interface types', () => {
		const module = require('../index');

		expect(module.MockPostureDataService).toBe(MockPostureDataService);
		expect(module.ApiPostureDataService).toBe(ApiPostureDataService);
	});

	it('should work with both implementations using same interface', async () => {
		// Test that both implementations satisfy IPostureDataService interface
		const mockService = new MockPostureDataService({
			sessionCount: 5,
			latency: { min: 0, max: 0 },
		});

		const apiService = new ApiPostureDataService({
			retryConfig: {
				maxAttempts: 1,
				initialDelay: 0,
				backoffMultiplier: 1,
				maxDelay: 0,
			},
		});

		// Verify both have required methods
		expect(typeof mockService.getPatientSessions).toBe('function');
		expect(typeof mockService.getSessionDetail).toBe('function');
		expect(typeof mockService.getAdminDashboard).toBe('function');
		expect(typeof mockService.updateSessionStatus).toBe('function');
		expect(typeof mockService.bulkUpdate).toBe('function');
		expect(typeof mockService.getExerciseRecommendations).toBe('function');
		expect(typeof mockService.getClinicalOutcomes).toBe('function');

		expect(typeof apiService.getPatientSessions).toBe('function');
		expect(typeof apiService.getSessionDetail).toBe('function');
		expect(typeof apiService.getAdminDashboard).toBe('function');
		expect(typeof apiService.updateSessionStatus).toBe('function');
		expect(typeof apiService.bulkUpdate).toBe('function');
		expect(typeof apiService.getExerciseRecommendations).toBe('function');
		expect(typeof apiService.getClinicalOutcomes).toBe('function');
	});
});
