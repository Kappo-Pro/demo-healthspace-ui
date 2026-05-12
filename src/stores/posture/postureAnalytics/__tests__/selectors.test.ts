/**
 * Posture Analytics Selectors Tests
 *
 * Unit tests for memoized selectors.
 * Tests filtering logic, performance, and derived state transformations.
 *
 * @module stores/posture/postureAnalytics/__tests__/selectors.test
 */

import { configureStore } from '@reduxjs/toolkit';
import type { PostureSession } from '@types/posture';
import postureAnalyticsReducer from '../postureAnalyticsSlice';
import {
	selectAllSessions,
	selectSessionById,
	selectFilters,
	selectSelectedSession,
	selectLoading,
	selectErrors,
	selectPagination,
	selectFilteredSessions,
	selectPatientJourney,
	selectSessionMetrics,
	selectTotalSessionCount,
	selectIsAnyLoading,
	selectHasErrors,
	selectPaginatedSessions,
} from '../selectors';
import type { ReduxState } from '@stores/index';

// Mock session factory
const createMockSession = (
	overrides: Partial<PostureSession> = {},
): PostureSession => ({
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
	...overrides,
});

describe('Posture Analytics Selectors', () => {
	let store: ReturnType<typeof configureStore>;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				postureAnalytics: postureAnalyticsReducer,
			},
		});
	});

	describe('Basic Selectors', () => {
		describe('selectAllSessions', () => {
			it('should return empty array initially', () => {
				const sessions = selectAllSessions(
					store.getState() as unknown as ReduxState,
				);
				expect(sessions).toEqual([]);
			});

			it('should return all sessions from normalized state', () => {
				const mockSessions = [
					createMockSession({ id: 'session-1' }),
					createMockSession({ id: 'session-2' }),
				];

				// Manually populate state
				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: ['session-1', 'session-2'],
							entities: {
								'session-1': mockSessions[0],
								'session-2': mockSessions[1],
							},
						},
					},
				};

				const sessions = selectAllSessions(state as unknown as ReduxState);
				expect(sessions).toHaveLength(2);
			});
		});

		describe('selectSessionById', () => {
			it('should return specific session by ID', () => {
				const mockSession = createMockSession({ id: 'session-1' });

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: ['session-1'],
							entities: {
								'session-1': mockSession,
							},
						},
					},
				};

				const session = selectSessionById('session-1')(
					state as unknown as ReduxState,
				);
				expect(session).toEqual(mockSession);
			});

			it('should return undefined for non-existent ID', () => {
				const session = selectSessionById('non-existent')(
					store.getState() as unknown as ReduxState,
				);
				expect(session).toBeUndefined();
			});
		});

		describe('selectSelectedSession', () => {
			it('should return null when no session selected', () => {
				const session = selectSelectedSession(
					store.getState() as unknown as ReduxState,
				);
				expect(session).toBeNull();
			});

			it('should return selected session object', () => {
				const mockSession = createMockSession({ id: 'session-1' });

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						selectedSessionId: 'session-1',
						sessions: {
							ids: ['session-1'],
							entities: {
								'session-1': mockSession,
							},
						},
					},
				};

				const session = selectSelectedSession(state as unknown as ReduxState);
				expect(session).toEqual(mockSession);
			});
		});

		describe('selectFilters', () => {
			it('should return current filters', () => {
				const filters = selectFilters(
					store.getState() as unknown as ReduxState,
				);
				expect(filters).toEqual({
					pagination: { page: 1, pageSize: 50 },
				});
			});
		});

		describe('selectLoading', () => {
			it('should return loading states', () => {
				const loading = selectLoading(
					store.getState() as unknown as ReduxState,
				);
				expect(loading).toEqual({
					fetchPatientSessions: false,
					fetchAdminSessions: false,
					updateSessionStatus: false,
					bulkUpdateSessions: false,
				});
			});
		});

		describe('selectErrors', () => {
			it('should return error states', () => {
				const errors = selectErrors(store.getState() as unknown as ReduxState);
				expect(errors).toEqual({
					fetchPatientSessions: null,
					fetchAdminSessions: null,
					updateSessionStatus: null,
					bulkUpdateSessions: null,
				});
			});
		});

		describe('selectPagination', () => {
			it('should return pagination state', () => {
				const pagination = selectPagination(
					store.getState() as unknown as ReduxState,
				);
				expect(pagination).toEqual({
					currentPage: 1,
					pageSize: 50,
					totalCount: 0,
					totalPages: 0,
				});
			});
		});
	});

	describe('Derived Selectors', () => {
		describe('selectFilteredSessions', () => {
			const sessions = [
				createMockSession({
					id: 'session-1',
					userId: 'patient-123',
					timestamp: '2025-10-24T10:00:00Z',
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
						insights: [],
					},
				}),
				createMockSession({
					id: 'session-2',
					userId: 'patient-456',
					timestamp: '2025-10-23T10:00:00Z',
					analysis: {
						overallScore: 45,
						status: 'poor',
						metrics: {
							headAlignment: 50,
							shoulderSymmetry: 40,
							spineCurvature: 45,
							hipAlignment: 42,
							balance: 48,
						},
						issues: [
							{
								id: 'issue-1',
								severity: 'critical',
								title: 'Forward head posture',
								description: 'Significant forward head position detected',
								affectedArea: 'head',
							},
						],
						insights: [],
					},
				}),
				createMockSession({
					id: 'session-3',
					userId: 'patient-789',
					timestamp: '2025-10-22T10:00:00Z',
					analysis: {
						overallScore: 95,
						status: 'excellent',
						metrics: {
							headAlignment: 95,
							shoulderSymmetry: 95,
							spineCurvature: 95,
							hipAlignment: 95,
							balance: 95,
						},
						issues: [],
						insights: [],
					},
				}),
			];

			const createStateWithSessions = (
				sessionList: PostureSession[],
				filters = {},
			) => ({
				...store.getState(),
				postureAnalytics: {
					...store.getState().postureAnalytics,
					sessions: {
						ids: sessionList.map(s => s.id),
						entities: sessionList.reduce(
							(acc, s) => ({ ...acc, [s.id]: s }),
							{},
						),
					},
					filters: {
						...store.getState().postureAnalytics.filters,
						...filters,
					},
				},
			});

			it('should return all sessions when no filters applied', () => {
				const state = createStateWithSessions(sessions);
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered).toHaveLength(3);
			});

			it('should filter by status', () => {
				const state = createStateWithSessions(sessions, {
					status: ['good', 'excellent'],
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered).toHaveLength(2);
				expect(filtered.map(s => s.analysis.status)).toEqual([
					'good',
					'excellent',
				]);
			});

			it('should filter by date range', () => {
				const state = createStateWithSessions(sessions, {
					dateRange: {
						start: '2025-10-23T00:00:00Z',
						end: '2025-10-24T23:59:59Z',
					},
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered).toHaveLength(2);
				expect(filtered.map(s => s.id)).toContain('session-1');
				expect(filtered.map(s => s.id)).toContain('session-2');
			});

			it('should filter by score range', () => {
				const state = createStateWithSessions(sessions, {
					scoreRange: { min: 80, max: 100 },
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered).toHaveLength(2);
				expect(filtered.every(s => s.analysis.overallScore >= 80)).toBe(true);
			});

			it('should filter by issue severity', () => {
				const state = createStateWithSessions(sessions, {
					issueSeverity: ['critical'],
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered).toHaveLength(1);
				expect(filtered[0].id).toBe('session-2');
			});

			it('should filter by search query', () => {
				const state = createStateWithSessions(sessions, {
					searchQuery: 'patient-123',
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered).toHaveLength(1);
				expect(filtered[0].userId).toBe('patient-123');
			});

			it('should apply multiple filters together', () => {
				const state = createStateWithSessions(sessions, {
					status: ['good', 'excellent'],
					scoreRange: { min: 80, max: 100 },
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered).toHaveLength(2);
			});

			it('should sort by score ascending', () => {
				const state = createStateWithSessions(sessions, {
					sort: { field: 'score', order: 'asc' },
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered[0].analysis.overallScore).toBe(45);
				expect(filtered[2].analysis.overallScore).toBe(95);
			});

			it('should sort by score descending', () => {
				const state = createStateWithSessions(sessions, {
					sort: { field: 'score', order: 'desc' },
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered[0].analysis.overallScore).toBe(95);
				expect(filtered[2].analysis.overallScore).toBe(45);
			});

			it('should sort by timestamp', () => {
				const state = createStateWithSessions(sessions, {
					sort: { field: 'timestamp', order: 'asc' },
				});
				const filtered = selectFilteredSessions(state as unknown as ReduxState);
				expect(filtered[0].timestamp).toBe('2025-10-22T10:00:00Z');
				expect(filtered[2].timestamp).toBe('2025-10-24T10:00:00Z');
			});

			it('should be memoized (return same reference for same input)', () => {
				const state = createStateWithSessions(sessions);
				const result1 = selectFilteredSessions(state as unknown as ReduxState);
				const result2 = selectFilteredSessions(state as unknown as ReduxState);
				expect(result1).toBe(result2);
			});
		});

		describe('selectPatientJourney', () => {
			it('should return null for empty sessions', () => {
				const journey = selectPatientJourney(
					store.getState() as unknown as ReduxState,
					'patient-123',
				);
				expect(journey).toBeNull();
			});

			it('should transform sessions into journey view data', () => {
				const sessions = [
					createMockSession({
						id: 'session-1',
						userId: 'patient-123',
						timestamp: '2025-10-20T10:00:00Z',
						analysis: {
							overallScore: 60,
							status: 'fair',
							metrics: {
								headAlignment: 60,
								shoulderSymmetry: 60,
								spineCurvature: 60,
								hipAlignment: 60,
								balance: 60,
							},
							issues: [],
							insights: [],
						},
					}),
					createMockSession({
						id: 'session-2',
						userId: 'patient-123',
						timestamp: '2025-10-22T10:00:00Z',
						analysis: {
							overallScore: 75,
							status: 'good',
							metrics: {
								headAlignment: 75,
								shoulderSymmetry: 75,
								spineCurvature: 75,
								hipAlignment: 75,
								balance: 75,
							},
							issues: [],
							insights: [],
						},
					}),
					createMockSession({
						id: 'session-3',
						userId: 'patient-123',
						timestamp: '2025-10-24T10:00:00Z',
						analysis: {
							overallScore: 85,
							status: 'good',
							metrics: {
								headAlignment: 85,
								shoulderSymmetry: 85,
								spineCurvature: 85,
								hipAlignment: 85,
								balance: 85,
							},
							issues: [],
							insights: [],
						},
					}),
				];

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: sessions.map(s => s.id),
							entities: sessions.reduce(
								(acc, s) => ({ ...acc, [s.id]: s }),
								{},
							),
						},
					},
				};

				const journey = selectPatientJourney(
					state as unknown as ReduxState,
					'patient-123',
				);

				expect(journey).not.toBeNull();
				expect(journey.patientId).toBe('patient-123');
				expect(journey.sessions).toHaveLength(3);
				expect(journey.progress.totalAssessments).toBe(3);
				expect(journey.progress.averageScore).toBeCloseTo(73.33, 1);
				expect(journey.progress.scoreImprovement).toBeCloseTo(41.67, 1);
			});

			it('should generate milestones', () => {
				const sessions = [
					createMockSession({
						id: 'session-1',
						userId: 'patient-123',
						timestamp: '2025-10-20T10:00:00Z',
						analysis: {
							overallScore: 60,
							status: 'fair',
							metrics: {
								headAlignment: 60,
								shoulderSymmetry: 60,
								spineCurvature: 60,
								hipAlignment: 60,
								balance: 60,
							},
							issues: [],
							insights: [],
						},
					}),
					createMockSession({
						id: 'session-2',
						userId: 'patient-123',
						timestamp: '2025-10-22T10:00:00Z',
						analysis: {
							overallScore: 85,
							status: 'good',
							metrics: {
								headAlignment: 85,
								shoulderSymmetry: 85,
								spineCurvature: 85,
								hipAlignment: 85,
								balance: 85,
							},
							issues: [],
							insights: [],
						},
					}),
				];

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: sessions.map(s => s.id),
							entities: sessions.reduce(
								(acc, s) => ({ ...acc, [s.id]: s }),
								{},
							),
						},
					},
				};

				const journey = selectPatientJourney(
					state as unknown as ReduxState,
					'patient-123',
				);

				expect(journey.milestones.length).toBeGreaterThan(0);
				expect(journey.milestones.some(m => m.title.includes('First'))).toBe(
					true,
				);
				expect(
					journey.milestones.some(m => m.title.includes('Improvement')),
				).toBe(true);
			});

			it('should filter by patient ID', () => {
				const sessions = [
					createMockSession({
						id: 'session-1',
						userId: 'patient-123',
					}),
					createMockSession({
						id: 'session-2',
						userId: 'patient-456',
					}),
				];

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: sessions.map(s => s.id),
							entities: sessions.reduce(
								(acc, s) => ({ ...acc, [s.id]: s }),
								{},
							),
						},
					},
				};

				const journey = selectPatientJourney(
					state as unknown as ReduxState,
					'patient-123',
				);

				expect(journey.sessions).toHaveLength(1);
				expect(journey.sessions[0].userId).toBe('patient-123');
			});
		});

		describe('selectSessionMetrics', () => {
			it('should return empty metrics for no sessions', () => {
				const metrics = selectSessionMetrics(
					store.getState() as unknown as ReduxState,
				);
				expect(metrics.totalSessions).toBe(0);
				expect(metrics.averageScore).toBe(0);
			});

			it('should calculate aggregate metrics', () => {
				const sessions = [
					createMockSession({
						id: 'session-1',
						analysis: {
							overallScore: 80,
							status: 'good',
							metrics: {
								headAlignment: 80,
								shoulderSymmetry: 80,
								spineCurvature: 80,
								hipAlignment: 80,
								balance: 80,
							},
							issues: [],
							insights: [],
						},
					}),
					createMockSession({
						id: 'session-2',
						analysis: {
							overallScore: 90,
							status: 'excellent',
							metrics: {
								headAlignment: 90,
								shoulderSymmetry: 90,
								spineCurvature: 90,
								hipAlignment: 90,
								balance: 90,
							},
							issues: [],
							insights: [],
						},
					}),
					createMockSession({
						id: 'session-3',
						analysis: {
							overallScore: 40,
							status: 'poor',
							metrics: {
								headAlignment: 40,
								shoulderSymmetry: 40,
								spineCurvature: 40,
								hipAlignment: 40,
								balance: 40,
							},
							issues: [
								{
									id: 'issue-1',
									severity: 'critical',
									title: 'Issue',
									description: 'desc',
									affectedArea: 'head',
								},
							],
							insights: [],
						},
					}),
				];

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: sessions.map(s => s.id),
							entities: sessions.reduce(
								(acc, s) => ({ ...acc, [s.id]: s }),
								{},
							),
						},
					},
				};

				const metrics = selectSessionMetrics(state as unknown as ReduxState);

				expect(metrics.totalSessions).toBe(3);
				expect(metrics.averageScore).toBeCloseTo(70, 0);
				expect(metrics.statusDistribution.good).toBe(1);
				expect(metrics.statusDistribution.excellent).toBe(1);
				expect(metrics.statusDistribution.poor).toBe(1);
				expect(metrics.criticalIssuesCount).toBe(1);
			});

			it('should return recent sessions', () => {
				const sessions = Array.from({ length: 15 }, (_, i) =>
					createMockSession({
						id: `session-${i}`,
						timestamp: `2025-10-${24 - i}T10:00:00Z`,
					}),
				);

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: sessions.map(s => s.id),
							entities: sessions.reduce(
								(acc, s) => ({ ...acc, [s.id]: s }),
								{},
							),
						},
					},
				};

				const metrics = selectSessionMetrics(state as unknown as ReduxState);

				expect(metrics.recentSessions).toHaveLength(10);
			});
		});

		describe('selectPaginatedSessions', () => {
			it('should return sessions for current page', () => {
				const sessions = Array.from({ length: 100 }, (_, i) =>
					createMockSession({
						id: `session-${i}`,
					}),
				);

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: sessions.map(s => s.id),
							entities: sessions.reduce(
								(acc, s) => ({ ...acc, [s.id]: s }),
								{},
							),
						},
						pagination: {
							currentPage: 2,
							pageSize: 25,
							totalCount: 100,
							totalPages: 4,
						},
					},
				};

				const paginated = selectPaginatedSessions(
					state as unknown as ReduxState,
				);

				expect(paginated).toHaveLength(25);
				expect(paginated[0].id).toBe('session-25');
			});
		});
	});

	describe('Utility Selectors', () => {
		describe('selectTotalSessionCount', () => {
			it('should return total count from entity adapter', () => {
				const sessions = [
					createMockSession({ id: 'session-1' }),
					createMockSession({ id: 'session-2' }),
				];

				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						sessions: {
							ids: sessions.map(s => s.id),
							entities: sessions.reduce(
								(acc, s) => ({ ...acc, [s.id]: s }),
								{},
							),
						},
					},
				};

				const count = selectTotalSessionCount(state as unknown as ReduxState);
				expect(count).toBe(2);
			});
		});

		describe('selectIsAnyLoading', () => {
			it('should return false when nothing loading', () => {
				const isLoading = selectIsAnyLoading(
					store.getState() as unknown as ReduxState,
				);
				expect(isLoading).toBe(false);
			});

			it('should return true when any operation loading', () => {
				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						loading: {
							...store.getState().postureAnalytics.loading,
							fetchPatientSessions: true,
						},
					},
				};

				const isLoading = selectIsAnyLoading(state as unknown as ReduxState);
				expect(isLoading).toBe(true);
			});
		});

		describe('selectHasErrors', () => {
			it('should return false when no errors', () => {
				const hasErrors = selectHasErrors(
					store.getState() as unknown as ReduxState,
				);
				expect(hasErrors).toBe(false);
			});

			it('should return true when any error exists', () => {
				const state = {
					...store.getState(),
					postureAnalytics: {
						...store.getState().postureAnalytics,
						error: {
							...store.getState().postureAnalytics.error,
							fetchPatientSessions: 'Network error',
						},
					},
				};

				const hasErrors = selectHasErrors(state as unknown as ReduxState);
				expect(hasErrors).toBe(true);
			});
		});
	});

	describe('Performance', () => {
		it('should execute selectFilteredSessions in <100ms with 1000 records', () => {
			const sessions = Array.from({ length: 1000 }, (_, i) =>
				createMockSession({
					id: `session-${i}`,
					userId: `patient-${i % 100}`,
					timestamp: `2025-10-${(i % 30) + 1}T10:00:00Z`,
					analysis: {
						overallScore: (i % 100) + 1,
						status: (
							['excellent', 'good', 'fair', 'poor', 'critical'] as const
						)[i % 5],
						metrics: {
							headAlignment: (i % 100) + 1,
							shoulderSymmetry: (i % 100) + 1,
							spineCurvature: (i % 100) + 1,
							hipAlignment: (i % 100) + 1,
							balance: (i % 100) + 1,
						},
						issues: [],
						insights: [],
					},
				}),
			);

			const state = {
				...store.getState(),
				postureAnalytics: {
					...store.getState().postureAnalytics,
					sessions: {
						ids: sessions.map(s => s.id),
						entities: sessions.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
					},
					filters: {
						status: ['good', 'excellent'] as const,
						scoreRange: { min: 70, max: 100 },
						pagination: { page: 1, pageSize: 50 },
					},
				},
			};

			const startTime = performance.now();
			selectFilteredSessions(state as unknown as ReduxState);
			const endTime = performance.now();

			const executionTime = endTime - startTime;
			expect(executionTime).toBeLessThan(100); // <100ms requirement
		});
	});
});
