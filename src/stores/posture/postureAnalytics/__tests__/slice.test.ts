/**
 * Posture Analytics Slice Tests
 *
 * Unit tests for Redux slice reducers, actions, and thunks.
 * Tests normalized state structure and async operations.
 *
 * @module stores/posture/postureAnalytics/__tests__/slice.test
 */

import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import type { PostureSession } from '@types/posture';
import postureAnalyticsReducer, {
	setFilters,
	updateFilters,
	clearFilters,
	setSelectedSession,
	clearSelectedSession,
	clearError,
	clearAllErrors,
	resetPostureAnalytics,
	fetchPatientSessions,
	fetchAdminSessions,
	updateSessionStatus,
	bulkUpdateSessions,
} from '../postureAnalyticsSlice';
import type { PostureAnalyticsState } from '../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<{
	get: typeof axios.get;
	patch: typeof axios.patch;
}>;

// Mock session data
const mockSession: PostureSession = {
	id: 'session-1',
	userId: 'patient-123',
	timestamp: '2025-10-24T10:00:00Z',
	duration: 300,
	poseData: [],
	analysis: {
		overallScore: 85,
		status: 'good',
		metrics: {
			headAlignment: 90,
			shoulderSymmetry: 80,
			spineCurvature: 85,
			hipAlignment: 82,
			balance: 88,
		},
		issues: [],
		insights: ['Good posture overall'],
	},
	metadata: {
		deviceType: 'desktop',
		cameraQuality: 'high',
		lighting: 'good',
	},
};

const mockSession2: PostureSession = {
	...mockSession,
	id: 'session-2',
	timestamp: '2025-10-23T10:00:00Z',
	analysis: {
		...mockSession.analysis,
		overallScore: 70,
		status: 'fair',
	},
};

describe('Posture Analytics Slice', () => {
	let store: ReturnType<typeof configureStore>;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				postureAnalytics: postureAnalyticsReducer,
			},
		});
		jest.clearAllMocks();
	});

	describe('Initial State', () => {
		it('should have correct initial state structure', () => {
			const state = store.getState().postureAnalytics;

			expect(state).toEqual({
				sessions: {
					ids: [],
					entities: {},
				},
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
			});
		});

		it('should use normalized state structure with createEntityAdapter', () => {
			const state = store.getState().postureAnalytics;

			expect(state.sessions).toHaveProperty('ids');
			expect(state.sessions).toHaveProperty('entities');
			expect(Array.isArray(state.sessions.ids)).toBe(true);
			expect(typeof state.sessions.entities).toBe('object');
		});
	});

	describe('Synchronous Actions', () => {
		describe('setFilters', () => {
			it('should set filters completely', () => {
				const filters = {
					status: ['good', 'excellent'] as const,
					dateRange: {
						start: '2025-10-01',
						end: '2025-10-24',
					},
					pagination: {
						page: 1,
						pageSize: 50,
					},
				};

				store.dispatch(setFilters(filters));
				const state = store.getState().postureAnalytics;

				expect(state.filters).toEqual(filters);
			});
		});

		describe('updateFilters', () => {
			it('should update partial filter fields', () => {
				store.dispatch(
					updateFilters({
						status: ['critical', 'poor'] as const,
					}),
				);

				const state = store.getState().postureAnalytics;

				expect(state.filters.status).toEqual(['critical', 'poor']);
				expect(state.filters.pagination).toEqual({
					page: 1,
					pageSize: 50,
				});
			});

			it('should merge with existing filters', () => {
				store.dispatch(
					setFilters({
						status: ['good'] as const,
						pagination: { page: 1, pageSize: 50 },
					}),
				);

				store.dispatch(
					updateFilters({
						scoreRange: { min: 50, max: 80 },
					}),
				);

				const state = store.getState().postureAnalytics;

				expect(state.filters.status).toEqual(['good']);
				expect(state.filters.scoreRange).toEqual({ min: 50, max: 80 });
			});
		});

		describe('clearFilters', () => {
			it('should reset filters to initial state', () => {
				store.dispatch(
					setFilters({
						status: ['critical'] as const,
						dateRange: {
							start: '2025-10-01',
							end: '2025-10-24',
						},
						pagination: { page: 1, pageSize: 50 },
					}),
				);

				store.dispatch(clearFilters());
				const state = store.getState().postureAnalytics;

				expect(state.filters).toEqual({
					pagination: { page: 1, pageSize: 50 },
				});
			});
		});

		describe('setSelectedSession', () => {
			it('should set selected session ID', () => {
				store.dispatch(setSelectedSession('session-1'));
				const state = store.getState().postureAnalytics;

				expect(state.selectedSessionId).toBe('session-1');
			});

			it('should allow null value', () => {
				store.dispatch(setSelectedSession('session-1'));
				store.dispatch(setSelectedSession(null));
				const state = store.getState().postureAnalytics;

				expect(state.selectedSessionId).toBeNull();
			});
		});

		describe('clearSelectedSession', () => {
			it('should clear selected session', () => {
				store.dispatch(setSelectedSession('session-1'));
				store.dispatch(clearSelectedSession());
				const state = store.getState().postureAnalytics;

				expect(state.selectedSessionId).toBeNull();
			});
		});

		describe('clearError', () => {
			it('should clear specific error', () => {
				// Set error state via rejected thunk (simulate)
				const errorState: PostureAnalyticsState = {
					...store.getState().postureAnalytics,
					error: {
						...store.getState().postureAnalytics.error,
						fetchPatientSessions: 'Test error',
					},
				};

				store = configureStore({
					reducer: {
						postureAnalytics: () => errorState,
					},
				});

				store.dispatch(clearError('fetchPatientSessions'));
				const state = store.getState().postureAnalytics;

				expect(state.error.fetchPatientSessions).toBeNull();
			});
		});

		describe('clearAllErrors', () => {
			it('should clear all errors', () => {
				store.dispatch(clearAllErrors());
				const state = store.getState().postureAnalytics;

				expect(state.error).toEqual({
					fetchPatientSessions: null,
					fetchAdminSessions: null,
					updateSessionStatus: null,
					bulkUpdateSessions: null,
				});
			});
		});

		describe('resetPostureAnalytics', () => {
			it('should reset entire state to initial', () => {
				// Modify state
				store.dispatch(setSelectedSession('session-1'));
				store.dispatch(updateFilters({ status: ['critical'] as const }));

				// Reset
				store.dispatch(resetPostureAnalytics());
				const state = store.getState().postureAnalytics;

				expect(state.selectedSessionId).toBeNull();
				expect(state.filters).toEqual({
					pagination: { page: 1, pageSize: 50 },
				});
				expect(state.sessions.ids).toEqual([]);
			});
		});
	});

	describe('Async Thunks', () => {
		describe('fetchPatientSessions', () => {
			it('should set loading state on pending', async () => {
				mockedAxios.get.mockImplementation(
					() =>
						new Promise(resolve =>
							setTimeout(
								() =>
									resolve({
										data: {
											data: [],
											pagination: {
												currentPage: 1,
												pageSize: 50,
												totalCount: 0,
												totalPages: 0,
											},
										},
									}),
								100,
							),
						),
				);

				store.dispatch(fetchPatientSessions({ patientId: 'patient-123' }));

				// Check immediate state
				const state = store.getState().postureAnalytics;
				expect(state.loading.fetchPatientSessions).toBe(true);
				expect(state.error.fetchPatientSessions).toBeNull();
			});

			it('should populate sessions on fulfilled', async () => {
				mockedAxios.get.mockResolvedValue({
					data: {
						data: [mockSession, mockSession2],
						pagination: {
							currentPage: 1,
							pageSize: 50,
							totalCount: 2,
							totalPages: 1,
						},
					},
				});

				await store.dispatch(
					fetchPatientSessions({ patientId: 'patient-123' }),
				);

				const state = store.getState().postureAnalytics;

				expect(state.loading.fetchPatientSessions).toBe(false);
				expect(state.sessions.ids).toHaveLength(2);
				expect(state.sessions.entities['session-1']).toEqual(mockSession);
				expect(state.sessions.entities['session-2']).toEqual(mockSession2);
				expect(state.pagination.totalCount).toBe(2);
				expect(state.lastFetchedAt).toBeTruthy();
			});

			it('should set error on rejected', async () => {
				mockedAxios.get.mockRejectedValue(new Error('Network error'));

				await store.dispatch(
					fetchPatientSessions({ patientId: 'patient-123' }),
				);

				const state = store.getState().postureAnalytics;

				expect(state.loading.fetchPatientSessions).toBe(false);
				expect(state.error.fetchPatientSessions).toContain('Network error');
			});

			it('should call correct API endpoint with params', async () => {
				mockedAxios.get.mockResolvedValue({
					data: {
						data: [],
						pagination: {
							currentPage: 2,
							pageSize: 25,
							totalCount: 0,
							totalPages: 0,
						},
					},
				});

				await store.dispatch(
					fetchPatientSessions({
						patientId: 'patient-123',
						page: 2,
						pageSize: 25,
					}),
				);

				expect(mockedAxios.get).toHaveBeenCalledWith(
					'/posture-analytics/patients/patient-123/sessions',
					{
						params: { page: 2, limit: 25 },
					},
				);
			});
		});

		describe('fetchAdminSessions', () => {
			it('should apply filters to API request', async () => {
				mockedAxios.get.mockResolvedValue({
					data: {
						data: [],
						pagination: {
							currentPage: 1,
							pageSize: 50,
							totalCount: 0,
							totalPages: 0,
						},
					},
				});

				await store.dispatch(
					fetchAdminSessions({
						filters: {
							status: ['critical', 'poor'],
							dateRange: {
								start: '2025-10-01',
								end: '2025-10-24',
							},
							scoreRange: {
								min: 0,
								max: 50,
							},
						},
					}),
				);

				expect(mockedAxios.get).toHaveBeenCalledWith(
					'/posture-analytics/sessions',
					{
						params: {
							page: 1,
							limit: 50,
							status: 'critical,poor',
							startDate: '2025-10-01',
							endDate: '2025-10-24',
							minScore: 0,
							maxScore: 50,
						},
					},
				);
			});

			it('should handle sort parameters', async () => {
				mockedAxios.get.mockResolvedValue({
					data: {
						data: [],
						pagination: {
							currentPage: 1,
							pageSize: 50,
							totalCount: 0,
							totalPages: 0,
						},
					},
				});

				await store.dispatch(
					fetchAdminSessions({
						filters: {
							sort: {
								field: 'score',
								order: 'desc',
							},
						},
					}),
				);

				expect(mockedAxios.get).toHaveBeenCalledWith(
					'/posture-analytics/sessions',
					expect.objectContaining({
						params: expect.objectContaining({
							sortField: 'score',
							sortOrder: 'desc',
						}),
					}),
				);
			});
		});

		describe('updateSessionStatus', () => {
			it('should update session in normalized state', async () => {
				// Pre-populate state
				mockedAxios.get.mockResolvedValue({
					data: {
						data: [mockSession],
						pagination: {
							currentPage: 1,
							pageSize: 50,
							totalCount: 1,
							totalPages: 1,
						},
					},
				});

				await store.dispatch(
					fetchPatientSessions({ patientId: 'patient-123' }),
				);

				// Update status
				const updatedSession = {
					...mockSession,
					analysis: { ...mockSession.analysis, status: 'excellent' as const },
				};

				mockedAxios.patch.mockResolvedValue({ data: updatedSession });

				await store.dispatch(
					updateSessionStatus({
						sessionId: 'session-1',
						status: 'excellent',
					}),
				);

				const state = store.getState().postureAnalytics;

				expect(state.loading.updateSessionStatus).toBe(false);
				expect(state.sessions.entities['session-1']?.analysis.status).toBe(
					'excellent',
				);
			});

			it('should call correct API endpoint', async () => {
				mockedAxios.patch.mockResolvedValue({ data: mockSession });

				await store.dispatch(
					updateSessionStatus({
						sessionId: 'session-1',
						status: 'good',
					}),
				);

				expect(mockedAxios.patch).toHaveBeenCalledWith(
					'/posture-analytics/sessions/session-1/status',
					{ status: 'good' },
				);
			});
		});

		describe('bulkUpdateSessions', () => {
			it('should update multiple sessions', async () => {
				// Pre-populate state
				mockedAxios.get.mockResolvedValue({
					data: {
						data: [mockSession, mockSession2],
						pagination: {
							currentPage: 1,
							pageSize: 50,
							totalCount: 2,
							totalPages: 1,
						},
					},
				});

				await store.dispatch(
					fetchPatientSessions({ patientId: 'patient-123' }),
				);

				// Bulk update
				const updates = {
					analysis: {
						...mockSession.analysis,
						insights: ['Updated insight'],
					},
				};

				const updatedSessions = [
					{ ...mockSession, ...updates },
					{ ...mockSession2, ...updates },
				];

				mockedAxios.patch.mockResolvedValue({ data: updatedSessions });

				await store.dispatch(
					bulkUpdateSessions({
						sessionIds: ['session-1', 'session-2'],
						updates,
					}),
				);

				const state = store.getState().postureAnalytics;

				expect(state.loading.bulkUpdateSessions).toBe(false);
				expect(
					state.sessions.entities['session-1']?.analysis.insights,
				).toContain('Updated insight');
				expect(
					state.sessions.entities['session-2']?.analysis.insights,
				).toContain('Updated insight');
			});

			it('should call correct API endpoint', async () => {
				const updates = { duration: 500 };

				mockedAxios.patch.mockResolvedValue({ data: [] });

				await store.dispatch(
					bulkUpdateSessions({
						sessionIds: ['session-1', 'session-2'],
						updates,
					}),
				);

				expect(mockedAxios.patch).toHaveBeenCalledWith(
					'/posture-analytics/sessions/bulk',
					{
						sessionIds: ['session-1', 'session-2'],
						updates,
					},
				);
			});
		});
	});

	describe('Entity Adapter Integration', () => {
		it('should maintain normalized state structure', async () => {
			mockedAxios.get.mockResolvedValue({
				data: {
					data: [mockSession, mockSession2],
					pagination: {
						currentPage: 1,
						pageSize: 50,
						totalCount: 2,
						totalPages: 1,
					},
				},
			});

			await store.dispatch(fetchPatientSessions({ patientId: 'patient-123' }));

			const state = store.getState().postureAnalytics;

			// Check normalized structure
			expect(Array.isArray(state.sessions.ids)).toBe(true);
			expect(state.sessions.ids).toContain('session-1');
			expect(state.sessions.ids).toContain('session-2');

			expect(state.sessions.entities['session-1']).toBeDefined();
			expect(state.sessions.entities['session-2']).toBeDefined();
		});

		it('should sort sessions by timestamp descending', async () => {
			const oldSession = {
				...mockSession,
				id: 'session-old',
				timestamp: '2025-10-20T10:00:00Z',
			};
			const newSession = {
				...mockSession,
				id: 'session-new',
				timestamp: '2025-10-25T10:00:00Z',
			};

			mockedAxios.get.mockResolvedValue({
				data: {
					data: [oldSession, newSession],
					pagination: {
						currentPage: 1,
						pageSize: 50,
						totalCount: 2,
						totalPages: 1,
					},
				},
			});

			await store.dispatch(fetchPatientSessions({ patientId: 'patient-123' }));

			const state = store.getState().postureAnalytics;

			// Most recent should be first
			expect(state.sessions.ids[0]).toBe('session-new');
			expect(state.sessions.ids[1]).toBe('session-old');
		});

		it('should prevent duplicate session IDs', async () => {
			mockedAxios.get.mockResolvedValue({
				data: {
					data: [mockSession, mockSession], // Duplicate
					pagination: {
						currentPage: 1,
						pageSize: 50,
						totalCount: 2,
						totalPages: 1,
					},
				},
			});

			await store.dispatch(fetchPatientSessions({ patientId: 'patient-123' }));

			const state = store.getState().postureAnalytics;

			// Should only have one entry
			expect(state.sessions.ids).toHaveLength(1);
			expect(state.sessions.ids[0]).toBe('session-1');
		});
	});

	describe('Pagination', () => {
		it('should update pagination state on fetch', async () => {
			mockedAxios.get.mockResolvedValue({
				data: {
					data: [mockSession],
					pagination: {
						currentPage: 3,
						pageSize: 25,
						totalCount: 100,
						totalPages: 4,
					},
				},
			});

			await store.dispatch(
				fetchPatientSessions({
					patientId: 'patient-123',
					page: 3,
					pageSize: 25,
				}),
			);

			const state = store.getState().postureAnalytics;

			expect(state.pagination).toEqual({
				currentPage: 3,
				pageSize: 25,
				totalCount: 100,
				totalPages: 4,
			});
		});

		it('should maintain pagination under 50 sessions per page', async () => {
			const sessions = Array.from({ length: 100 }, (_, i) => ({
				...mockSession,
				id: `session-${i}`,
			}));

			mockedAxios.get.mockResolvedValue({
				data: {
					data: sessions.slice(0, 50), // Only return first 50
					pagination: {
						currentPage: 1,
						pageSize: 50,
						totalCount: 100,
						totalPages: 2,
					},
				},
			});

			await store.dispatch(fetchPatientSessions({ patientId: 'patient-123' }));

			const state = store.getState().postureAnalytics;

			// Should only have 50 sessions in memory
			expect(state.sessions.ids).toHaveLength(50);
			expect(state.pagination.pageSize).toBe(50);
		});
	});
});
