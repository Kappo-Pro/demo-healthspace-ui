 
/**
 * API Posture Data Service Tests
 *
 * Test suite for ApiPostureDataService implementation.
 * Validates API integration, retry logic, and error handling.
 */

import axios from 'axios';
import { ApiPostureDataService } from '../ApiPostureDataService';
import type { AdminFilter } from '@types/posture';
import type { PostureSessionPage, PostureSessionDetail } from '../types';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('ApiPostureDataService', () => {
	let service: ApiPostureDataService;

	beforeEach(() => {
		jest.clearAllMocks();
		service = new ApiPostureDataService({
			basePath: '/api/posture-analytics',
			retryConfig: {
				maxAttempts: 3,
				initialDelay: 10, // Fast retries for tests
				backoffMultiplier: 2,
				maxDelay: 100,
			},
			debug: false, // Disable debug logs in tests
		});
	});

	describe('getPatientSessions', () => {
		it('should fetch patient sessions successfully', async () => {
			const mockResponse: PostureSessionPage = {
				data: [
					{
						id: 'session-1',
						userId: 'patient-1',
						timestamp: '2025-10-24T14:00:00Z',
						duration: 120,
						poseData: [],
						analysis: {
							overallScore: 75,
							status: 'good',
							metrics: {
								headAlignment: 80,
								shoulderSymmetry: 75,
								spineCurvature: 70,
								hipAlignment: 72,
								balance: 78,
							},
							issues: [],
							insights: [],
						},
						metadata: {
							deviceType: 'mobile',
							cameraQuality: 'high',
							lighting: 'good',
						},
					},
				],
				pagination: {
					currentPage: 1,
					pageSize: 20,
					totalCount: 45,
					totalPages: 3,
				},
			};

			mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

			const result = await service.getPatientSessions('patient-1', {
				page: 1,
				pageSize: 20,
			});

			expect(result).toEqual(mockResponse);
			expect(mockedAxios.get).toHaveBeenCalledWith(
				'/api/posture-analytics/patients/patient-1/sessions',
				{
					params: {
						page: 1,
						limit: 20,
					},
				},
			);
		});

		it('should retry on transient failure and succeed', async () => {
			const mockResponse: PostureSessionPage = {
				data: [],
				pagination: {
					currentPage: 1,
					pageSize: 20,
					totalCount: 0,
					totalPages: 0,
				},
			};

			// First call fails with 503, second succeeds
			mockedAxios.get
				.mockRejectedValueOnce({
					response: { status: 503, data: { message: 'Service unavailable' } },
					isAxiosError: true,
				})
				.mockResolvedValueOnce({ data: mockResponse });

			const result = await service.getPatientSessions('patient-1', {
				page: 1,
				pageSize: 20,
			});

			expect(result).toEqual(mockResponse);
			expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Initial + 1 retry
		});

		it('should throw ServiceError after max retry attempts', async () => {
			// All attempts fail with 500
			mockedAxios.get.mockRejectedValue({
				response: { status: 500, data: { message: 'Server error' } },
				isAxiosError: true,
			});

			await expect(
				service.getPatientSessions('patient-1', {
					page: 1,
					pageSize: 20,
				}),
			).rejects.toMatchObject({
				userMessage: 'Server error. Please try again later.',
				statusCode: 500,
				retryable: true,
			});

			expect(mockedAxios.get).toHaveBeenCalledTimes(3); // Initial + 2 retries
		});

		it('should not retry on non-retryable error (404)', async () => {
			mockedAxios.get.mockRejectedValueOnce({
				response: { status: 404, data: { message: 'Patient not found' } },
				isAxiosError: true,
			});

			await expect(
				service.getPatientSessions('non-existent-patient', {
					page: 1,
					pageSize: 20,
				}),
			).rejects.toMatchObject({
				userMessage: 'Resource not found.',
				statusCode: 404,
				retryable: false,
			});

			expect(mockedAxios.get).toHaveBeenCalledTimes(1); // No retry
		});
	});

	describe('getSessionDetail', () => {
		it('should fetch session detail successfully', async () => {
			const mockDetail: PostureSessionDetail = {
				id: 'session-1',
				userId: 'patient-1',
				timestamp: '2025-10-24T14:00:00Z',
				duration: 120,
				poseData: [],
				analysis: {
					overallScore: 75,
					status: 'good',
					metrics: {
						headAlignment: 80,
						shoulderSymmetry: 75,
						spineCurvature: 70,
						hipAlignment: 72,
						balance: 78,
					},
					issues: [],
					insights: [],
				},
				metadata: {
					deviceType: 'mobile',
					cameraQuality: 'high',
					lighting: 'good',
				},
				relatedSessions: [],
				recommendations: [],
				reviewStatus: 'pending',
			};

			mockedAxios.get.mockResolvedValueOnce({ data: mockDetail });

			const result = await service.getSessionDetail('session-1');

			expect(result).toEqual(mockDetail);
			expect(mockedAxios.get).toHaveBeenCalledWith(
				'/api/posture-analytics/sessions/session-1',
			);
		});
	});

	describe('getAdminDashboard', () => {
		it('should fetch admin dashboard with filters', async () => {
			const mockDashboard = {
				sessions: [],
				summary: {
					totalPatients: 150,
					totalSessions: 450,
					criticalCases: 12,
					avgScore: 65.5,
				},
				statusBreakdown: {
					excellent: 50,
					good: 120,
					fair: 150,
					poor: 80,
					critical: 50,
				},
				pagination: {
					currentPage: 1,
					pageSize: 20,
					totalCount: 450,
					totalPages: 23,
				},
			};

			mockedAxios.get.mockResolvedValueOnce({ data: mockDashboard });

			const filters: AdminFilter = {
				status: ['critical', 'poor'],
				dateRange: {
					start: '2025-10-01T00:00:00Z',
					end: '2025-10-31T23:59:59Z',
				},
				scoreRange: { min: 0, max: 50 },
				sort: { field: 'score', order: 'asc' },
				pagination: { page: 1, pageSize: 20 },
			};

			const result = await service.getAdminDashboard(filters);

			expect(result).toEqual(mockDashboard);
			expect(mockedAxios.get).toHaveBeenCalledWith(
				'/api/posture-analytics/admin/dashboard',
				{
					params: {
						status: 'critical,poor',
						startDate: '2025-10-01T00:00:00Z',
						endDate: '2025-10-31T23:59:59Z',
						minScore: 0,
						maxScore: 50,
						sortField: 'score',
						sortOrder: 'asc',
						page: 1,
						limit: 20,
					},
				},
			);
		});

		it('should handle empty filters', async () => {
			mockedAxios.get.mockResolvedValueOnce({
				data: {
					sessions: [],
					summary: {
						totalPatients: 0,
						totalSessions: 0,
						criticalCases: 0,
						avgScore: 0,
					},
					statusBreakdown: {
						excellent: 0,
						good: 0,
						fair: 0,
						poor: 0,
						critical: 0,
					},
					pagination: {
						currentPage: 1,
						pageSize: 50,
						totalCount: 0,
						totalPages: 0,
					},
				},
			});

			await service.getAdminDashboard({});

			expect(mockedAxios.get).toHaveBeenCalledWith(
				'/api/posture-analytics/admin/dashboard',
				{
					params: {},
				},
			);
		});
	});

	describe('updateSessionStatus', () => {
		it('should update session status successfully', async () => {
			mockedAxios.patch.mockResolvedValueOnce({ data: {} });

			await service.updateSessionStatus('session-1', 'reviewed');

			expect(mockedAxios.patch).toHaveBeenCalledWith(
				'/api/posture-analytics/sessions/session-1/status',
				{ reviewStatus: 'reviewed' },
			);
		});

		it('should retry on transient failure', async () => {
			mockedAxios.patch
				.mockRejectedValueOnce({
					response: { status: 503 },
					isAxiosError: true,
				})
				.mockResolvedValueOnce({ data: {} });

			await service.updateSessionStatus('session-1', 'reviewed');

			expect(mockedAxios.patch).toHaveBeenCalledTimes(2);
		});
	});

	describe('bulkUpdate', () => {
		it('should bulk update sessions successfully', async () => {
			const mockResult = {
				updatedCount: 2,
				failedIds: [],
				errors: {},
			};

			mockedAxios.post.mockResolvedValueOnce({ data: mockResult });

			const result = await service.bulkUpdate(['session-1', 'session-2'], {
				metadata: {
					deviceType: 'desktop',
					cameraQuality: 'high',
					lighting: 'good',
				},
			});

			expect(result).toEqual(mockResult);
			expect(mockedAxios.post).toHaveBeenCalledWith(
				'/api/posture-analytics/sessions/bulk-update',
				{
					sessionIds: ['session-1', 'session-2'],
					updates: {
						metadata: {
							deviceType: 'desktop',
							cameraQuality: 'high',
							lighting: 'good',
						},
					},
				},
			);
		});

		it('should handle partial failures', async () => {
			const mockResult = {
				updatedCount: 1,
				failedIds: ['session-2'],
				errors: {
					'session-2': 'Session not found',
				},
			};

			mockedAxios.post.mockResolvedValueOnce({ data: mockResult });

			const result = await service.bulkUpdate(['session-1', 'session-2'], {});

			expect(result.updatedCount).toBe(1);
			expect(result.failedIds).toContain('session-2');
		});
	});

	describe('getExerciseRecommendations', () => {
		it('should fetch exercise recommendations', async () => {
			const mockRecommendations = {
				data: [
					{
						id: 'rec-1',
						title: 'Chin Tucks',
						description: 'Strengthen neck muscles',
						targetAreas: ['head'],
						difficulty: 'beginner' as const,
						duration: 5,
						relevanceScore: 85,
					},
				],
			};

			mockedAxios.get.mockResolvedValueOnce({ data: mockRecommendations });

			const result = await service.getExerciseRecommendations('session-1');

			expect(result).toEqual(mockRecommendations.data);
			expect(mockedAxios.get).toHaveBeenCalledWith(
				'/api/posture-analytics/sessions/session-1/recommendations',
			);
		});
	});

	describe('getClinicalOutcomes', () => {
		it('should fetch clinical outcomes', async () => {
			const mockOutcomes = {
				patientId: 'patient-1',
				progress: {
					startDate: '2025-08-01T00:00:00Z',
					lastAssessmentDate: '2025-10-24T14:00:00Z',
					totalAssessments: 15,
					averageScore: 72.5,
					scoreImprovement: 25.5,
					trend: 'improving' as const,
				},
				metricOutcomes: {
					headAlignment: {
						current: 80,
						baseline: 60,
						improvement: 33.3,
						trend: 'improving' as const,
					},
					shoulderSymmetry: {
						current: 75,
						baseline: 65,
						improvement: 15.4,
						trend: 'improving' as const,
					},
					spineCurvature: {
						current: 70,
						baseline: 68,
						improvement: 2.9,
						trend: 'stable' as const,
					},
					hipAlignment: {
						current: 72,
						baseline: 70,
						improvement: 2.9,
						trend: 'stable' as const,
					},
					balance: {
						current: 78,
						baseline: 75,
						improvement: 4.0,
						trend: 'stable' as const,
					},
				},
				milestones: [],
			};

			mockedAxios.get.mockResolvedValueOnce({ data: mockOutcomes });

			const result = await service.getClinicalOutcomes('patient-1');

			expect(result).toEqual(mockOutcomes);
			expect(mockedAxios.get).toHaveBeenCalledWith(
				'/api/posture-analytics/patients/patient-1/outcomes',
			);
		});
	});

	describe('error handling', () => {
		it('should handle 401 Unauthorized', async () => {
			mockedAxios.get.mockRejectedValueOnce({
				response: { status: 401, data: { message: 'Unauthorized' } },
				isAxiosError: true,
			});

			await expect(
				service.getPatientSessions('patient-1', { page: 1, pageSize: 20 }),
			).rejects.toMatchObject({
				userMessage: 'Authentication required. Please log in again.',
				statusCode: 401,
				retryable: false,
			});
		});

		it('should handle 403 Forbidden', async () => {
			mockedAxios.get.mockRejectedValueOnce({
				response: { status: 403, data: { message: 'Forbidden' } },
				isAxiosError: true,
			});

			await expect(
				service.getPatientSessions('patient-1', { page: 1, pageSize: 20 }),
			).rejects.toMatchObject({
				userMessage: 'You do not have permission to access this resource.',
				statusCode: 403,
				retryable: false,
			});
		});

		it('should handle 429 Rate Limit', async () => {
			mockedAxios.get.mockRejectedValueOnce({
				response: { status: 429, data: { message: 'Too many requests' } },
				isAxiosError: true,
			});

			await expect(
				service.getPatientSessions('patient-1', { page: 1, pageSize: 20 }),
			).rejects.toMatchObject({
				userMessage: 'Too many requests. Please wait a moment and try again.',
				statusCode: 429,
				retryable: true,
			});
		});

		it('should handle network errors', async () => {
			mockedAxios.get.mockRejectedValueOnce({
				request: {},
				message: 'Network Error',
			});

			await expect(
				service.getPatientSessions('patient-1', { page: 1, pageSize: 20 }),
			).rejects.toMatchObject({
				userMessage:
					'Network error. Please check your connection and try again.',
				statusCode: 0,
				retryable: true,
			});
		});

		it('should handle unknown errors', async () => {
			mockedAxios.get.mockRejectedValueOnce(new Error('Unknown error'));

			await expect(
				service.getPatientSessions('patient-1', { page: 1, pageSize: 20 }),
			).rejects.toMatchObject({
				userMessage:
					'Network error. Please check your connection and try again.',
				retryable: true,
			});
		});
	});

	describe('exponential backoff', () => {
		it('should apply exponential backoff between retries', async () => {
			const delays: number[] = [];
			const originalSetTimeout = global.setTimeout;

			// Mock setTimeout to track delays
			jest.spyOn(global, 'setTimeout').mockImplementation(((
				cb: any,
				delay: number,
			) => {
				delays.push(delay);
				return originalSetTimeout(cb, 0); // Execute immediately
			}) as unknown as typeof setTimeout);

			mockedAxios.get
				.mockRejectedValueOnce({
					response: { status: 503 },
					isAxiosError: true,
				})
				.mockRejectedValueOnce({
					response: { status: 503 },
					isAxiosError: true,
				})
				.mockRejectedValueOnce({
					response: { status: 503 },
					isAxiosError: true,
				});

			try {
				await service.getPatientSessions('patient-1', {
					page: 1,
					pageSize: 20,
				});
			} catch {
				// Expected to fail
			}

			// Verify exponential backoff: 10ms, 20ms (10 * 2)
			expect(delays).toEqual([10, 20]);

			// Restore setTimeout
			jest.restoreAllMocks();
		});
	});
});
