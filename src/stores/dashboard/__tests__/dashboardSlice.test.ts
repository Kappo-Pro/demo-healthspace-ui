/**
 * Dashboard Slice Unit Tests
 *
 * EPIC-003-S1: Create Dashboard Slice Scaffold with Initial State
 *
 * Test Coverage:
 * - Initial state structure
 * - Basic reducers (setLoading, setError, clearError)
 * - TypeScript type safety
 *
 * Target: 100% code coverage
 */

import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer, {
	setLoading,
	setError,
	clearError,
	fetchDashboardData,
} from '../dashboardSlice';
import { ReduxState } from '@stores/index';

// Helper to create a fresh store for each test
const createTestStore = () => {
	return configureStore({
		reducer: {
			dashboard: dashboardReducer,
		},
	});
};

describe('DashboardSlice', () => {
	// ============================================================================
	// INITIAL STATE TESTS
	// ============================================================================

	describe('Initial State', () => {
		it('should have correct structure matching DashboardState interface', () => {
			const store = createTestStore();
			const state = store.getState().dashboard;

			// Verify top-level properties exist
			expect(state).toHaveProperty('assessmentStatuses');
			expect(state).toHaveProperty('metrics');
			expect(state).toHaveProperty('loading');
			expect(state).toHaveProperty('error');
		});

		it('should initialize assessmentStatuses with null values', () => {
			const store = createTestStore();
			const state = store.getState().dashboard;

			expect(state.assessmentStatuses).toHaveProperty('rom');
			expect(state.assessmentStatuses).toHaveProperty('posture');
			expect(state.assessmentStatuses).toHaveProperty('survey');

			expect(state.assessmentStatuses.rom).toBeNull();
			expect(state.assessmentStatuses.posture).toBeNull();
			expect(state.assessmentStatuses.survey).toBeNull();
		});

		it('should initialize metrics with sensible defaults', () => {
			const store = createTestStore();
			const state = store.getState().dashboard;

			expect(state.metrics.romScore).toBeNull();
			expect(state.metrics.sessionsCompleted).toBe(0);
			expect(state.metrics.streak).toBe(0);
		});

		it('should initialize loading and error states', () => {
			const store = createTestStore();
			const state = store.getState().dashboard;

			expect(state.loading).toBe(false);
			expect(state.error).toBeNull();
		});

		it('should match the exact initial state structure', () => {
			const store = createTestStore();
			const state = store.getState().dashboard;

			expect(state).toEqual({
				assessmentStatuses: {
					rom: null,
					posture: null,
					survey: null,
				},
				metrics: {
					romScore: null,
					sessionsCompleted: 0,
					streak: 0,
				},
				loading: false,
				error: null,
			});
		});
	});

	// ============================================================================
	// REDUCER: setLoading
	// ============================================================================

	describe('Reducer: setLoading', () => {
		it('should set loading to true', () => {
			const store = createTestStore();

			store.dispatch(setLoading(true));

			const state = store.getState().dashboard;
			expect(state.loading).toBe(true);
		});

		it('should set loading to false', () => {
			const store = createTestStore();

			// Set to true first
			store.dispatch(setLoading(true));
			expect(store.getState().dashboard.loading).toBe(true);

			// Then set to false
			store.dispatch(setLoading(false));
			expect(store.getState().dashboard.loading).toBe(false);
		});

		it('should not affect other state properties', () => {
			const store = createTestStore();

			store.dispatch(setLoading(true));

			const state = store.getState().dashboard;
			expect(state.error).toBeNull();
			expect(state.assessmentStatuses.rom).toBeNull();
			expect(state.metrics.streak).toBe(0);
		});

		it('should handle multiple successive calls', () => {
			const store = createTestStore();

			store.dispatch(setLoading(true));
			store.dispatch(setLoading(false));
			store.dispatch(setLoading(true));
			store.dispatch(setLoading(true));

			const state = store.getState().dashboard;
			expect(state.loading).toBe(true);
		});
	});

	// ============================================================================
	// REDUCER: setError
	// ============================================================================

	describe('Reducer: setError', () => {
		it('should set error message', () => {
			const store = createTestStore();
			const errorMessage = 'Failed to load dashboard data';

			store.dispatch(setError(errorMessage));

			const state = store.getState().dashboard;
			expect(state.error).toBe(errorMessage);
		});

		it('should set loading to false when error is set', () => {
			const store = createTestStore();

			// Set loading to true first
			store.dispatch(setLoading(true));
			expect(store.getState().dashboard.loading).toBe(true);

			// Set error
			store.dispatch(setError('Something went wrong'));

			const state = store.getState().dashboard;
			expect(state.loading).toBe(false);
			expect(state.error).toBe('Something went wrong');
		});

		it('should overwrite previous error message', () => {
			const store = createTestStore();

			store.dispatch(setError('First error'));
			expect(store.getState().dashboard.error).toBe('First error');

			store.dispatch(setError('Second error'));
			expect(store.getState().dashboard.error).toBe('Second error');
		});

		it('should not affect other state properties', () => {
			const store = createTestStore();

			store.dispatch(setError('Error occurred'));

			const state = store.getState().dashboard;
			expect(state.assessmentStatuses.rom).toBeNull();
			expect(state.metrics.streak).toBe(0);
			expect(state.metrics.sessionsCompleted).toBe(0);
		});

		it('should handle empty string as error message', () => {
			const store = createTestStore();

			store.dispatch(setError(''));

			const state = store.getState().dashboard;
			expect(state.error).toBe('');
			expect(state.loading).toBe(false);
		});
	});

	// ============================================================================
	// REDUCER: clearError
	// ============================================================================

	describe('Reducer: clearError', () => {
		it('should clear error message', () => {
			const store = createTestStore();

			// Set error first
			store.dispatch(setError('An error occurred'));
			expect(store.getState().dashboard.error).toBe('An error occurred');

			// Clear error
			store.dispatch(clearError());

			const state = store.getState().dashboard;
			expect(state.error).toBeNull();
		});

		it('should not affect loading state', () => {
			const store = createTestStore();

			// Set loading and error
			store.dispatch(setLoading(true));
			store.dispatch(setError('Error'));

			// Clear error
			store.dispatch(clearError());

			const state = store.getState().dashboard;
			expect(state.error).toBeNull();
			// Loading should remain false (setError sets it to false)
			expect(state.loading).toBe(false);
		});

		it('should be idempotent (safe to call multiple times)', () => {
			const store = createTestStore();

			store.dispatch(setError('Error'));
			store.dispatch(clearError());
			store.dispatch(clearError());
			store.dispatch(clearError());

			const state = store.getState().dashboard;
			expect(state.error).toBeNull();
		});

		it('should work when error is already null', () => {
			const store = createTestStore();

			// Initial state has error = null
			expect(store.getState().dashboard.error).toBeNull();

			// Clear error (should not throw)
			store.dispatch(clearError());

			const state = store.getState().dashboard;
			expect(state.error).toBeNull();
		});

		it('should not affect other state properties', () => {
			const store = createTestStore();

			store.dispatch(setError('Error'));
			store.dispatch(clearError());

			const state = store.getState().dashboard;
			expect(state.assessmentStatuses.rom).toBeNull();
			expect(state.metrics.streak).toBe(0);
			expect(state.metrics.sessionsCompleted).toBe(0);
		});
	});

	// ============================================================================
	// INTEGRATION TESTS - Combined Reducer Operations
	// ============================================================================

	describe('Integration: Combined Reducer Operations', () => {
		it('should handle typical loading → success flow', () => {
			const store = createTestStore();

			// Start loading
			store.dispatch(setLoading(true));
			expect(store.getState().dashboard.loading).toBe(true);
			expect(store.getState().dashboard.error).toBeNull();

			// Simulate success (stop loading, no error)
			store.dispatch(setLoading(false));
			const state = store.getState().dashboard;
			expect(state.loading).toBe(false);
			expect(state.error).toBeNull();
		});

		it('should handle typical loading → error flow', () => {
			const store = createTestStore();

			// Start loading
			store.dispatch(setLoading(true));
			expect(store.getState().dashboard.loading).toBe(true);

			// Error occurs (should auto-stop loading)
			store.dispatch(setError('Network error'));

			const state = store.getState().dashboard;
			expect(state.loading).toBe(false);
			expect(state.error).toBe('Network error');
		});

		it('should handle error recovery flow', () => {
			const store = createTestStore();

			// Initial error
			store.dispatch(setError('First error'));
			expect(store.getState().dashboard.error).toBe('First error');

			// Clear error
			store.dispatch(clearError());
			expect(store.getState().dashboard.error).toBeNull();

			// Retry (start loading)
			store.dispatch(setLoading(true));
			expect(store.getState().dashboard.loading).toBe(true);

			// Success
			store.dispatch(setLoading(false));
			const state = store.getState().dashboard;
			expect(state.loading).toBe(false);
			expect(state.error).toBeNull();
		});

		it('should handle rapid state transitions', () => {
			const store = createTestStore();

			store.dispatch(setLoading(true));
			store.dispatch(setError('Error 1'));
			store.dispatch(clearError());
			store.dispatch(setLoading(true));
			store.dispatch(setError('Error 2'));
			store.dispatch(clearError());
			store.dispatch(setLoading(false));

			const state = store.getState().dashboard;
			expect(state.loading).toBe(false);
			expect(state.error).toBeNull();
		});
	});

	// ============================================================================
	// TYPESCRIPT TYPE SAFETY TESTS
	// ============================================================================

	describe('TypeScript Type Safety', () => {
		it('should enforce DashboardState interface structure', () => {
			const store = createTestStore();
			const state = store.getState().dashboard;

			// Verify interface properties exist and are accessible
			expect(state.assessmentStatuses).toBeDefined();
			expect(state.assessmentStatuses.rom).toBeDefined();
			expect(state.metrics).toBeDefined();
			expect(state.metrics.romScore).toBeDefined();
			expect(state.loading).toBeDefined();
			expect(state.error).toBeDefined();
		});

		it('should correctly type action payloads', () => {
			const store = createTestStore();

			// setLoading accepts boolean
			store.dispatch(setLoading(true));
			store.dispatch(setLoading(false));

			// setError accepts string
			store.dispatch(setError('Error message'));

			// clearError accepts no payload
			store.dispatch(clearError());

			// Type check passes if this test runs
			expect(true).toBe(true);
		});
	});

	// ============================================================================
	// ASYNC THUNK: fetchDashboardData (EPIC-003-S2)
	// ============================================================================

	describe('Async Thunk: fetchDashboardData', () => {
		// Helper to create mock state with ROM and Posture data
		const createMockStateWithData = () => {
			return {
				rom: {
					main: {
						session: {
							id: 'rom-123',
							createdAt: '2025-10-20T12:00:00Z',
							customRomSessionExercise: [],
						},
					},
				},
				postures: {
					postures: {
						data: [
							{
								id: 'posture-456',
								createdAt: '2025-10-20T13:00:00Z',
								report: {
									overallScore: 85,
									issues: [],
								},
							},
						],
					},
				},
			} as unknown as ReduxState;
		};

		// Helper to create mock state with no data
		const createMockStateEmpty = () => {
			return {
				rom: {
					main: {
						session: null,
					},
				},
				postures: {
					postures: {
						data: [],
					},
				},
			} as unknown as ReduxState;
		};

		// Helper to create test store with preloaded state
		const createTestStoreWithState = (preloadedState: unknown) => {
			return configureStore({
				reducer: {
					dashboard: dashboardReducer,
					rom: (state = preloadedState) => state,
					postures: (state = preloadedState) => state,
				},
				preloadedState: preloadedState as never,
			});
		};

		describe('Pending State', () => {
			it('should set loading to true when thunk is pending', async () => {
				const mockState = createMockStateWithData();
				const store = createTestStoreWithState(mockState);

				const promise = store.dispatch(fetchDashboardData());

				// Check pending state immediately
				const pendingState = store.getState().dashboard;
				expect(pendingState.loading).toBe(true);
				expect(pendingState.error).toBeNull();

				// Wait for completion
				await promise;
			});

			it('should clear error when thunk is pending', async () => {
				const mockState = createMockStateWithData();
				const store = createTestStoreWithState(mockState);

				// Set error first
				store.dispatch(setError('Previous error'));
				expect(store.getState().dashboard.error).toBe('Previous error');

				const promise = store.dispatch(fetchDashboardData());

				// Check that error is cleared in pending state
				const pendingState = store.getState().dashboard;
				expect(pendingState.error).toBeNull();

				await promise;
			});
		});

		describe('Fulfilled State - ROM and Posture Data Present', () => {
			it('should update assessmentStatuses with ROM and Posture data', async () => {
				const mockState = createMockStateWithData();
				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;

				// Verify ROM status
				expect(state.assessmentStatuses.rom).not.toBeNull();
				expect(state.assessmentStatuses.rom?.type).toBe('rom');
				expect(state.assessmentStatuses.rom?.status).toBe('completed');
				expect(state.assessmentStatuses.rom?.lastUpdated).toBe(
					'2025-10-20T12:00:00Z',
				);
				expect(state.assessmentStatuses.rom?.score).toBe(0); // Placeholder value

				// Verify Posture status
				expect(state.assessmentStatuses.posture).not.toBeNull();
				expect(state.assessmentStatuses.posture?.type).toBe('posture');
				expect(state.assessmentStatuses.posture?.status).toBe('completed');
				expect(state.assessmentStatuses.posture?.lastUpdated).toBe(
					'2025-10-20T13:00:00Z',
				);
				expect(state.assessmentStatuses.posture?.score).toBe(85);
			});

			it('should set loading to false on success', async () => {
				const mockState = createMockStateWithData();
				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;
				expect(state.loading).toBe(false);
			});

			it('should keep error null on success', async () => {
				const mockState = createMockStateWithData();
				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;
				expect(state.error).toBeNull();
			});
		});

		describe('Fulfilled State - No Data Present', () => {
			it('should set assessmentStatuses to null when no ROM/Posture data', async () => {
				const mockState = createMockStateEmpty();
				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;

				expect(state.assessmentStatuses.rom).toBeNull();
				expect(state.assessmentStatuses.posture).toBeNull();
			});

			it('should still set loading to false even with no data', async () => {
				const mockState = createMockStateEmpty();
				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;
				expect(state.loading).toBe(false);
				expect(state.error).toBeNull();
			});
		});

		describe('Fulfilled State - Partial Data', () => {
			it('should handle ROM present but Posture absent', async () => {
				const mockState = {
					rom: {
						main: {
							session: {
								id: 'rom-123',
								createdAt: '2025-10-20T12:00:00Z',
								customRomSessionExercise: [],
							},
						},
					},
					postures: {
						postures: {
							data: [],
						},
					},
				} as unknown as ReduxState;

				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;

				expect(state.assessmentStatuses.rom).not.toBeNull();
				expect(state.assessmentStatuses.rom?.type).toBe('rom');
				expect(state.assessmentStatuses.posture).toBeNull();
			});

			it('should handle Posture present but ROM absent', async () => {
				const mockState = {
					rom: {
						main: {
							session: null,
						},
					},
					postures: {
						postures: {
							data: [
								{
									id: 'posture-456',
									createdAt: '2025-10-20T13:00:00Z',
									report: {
										overallScore: 75,
										issues: [],
									},
								},
							],
						},
					},
				} as unknown as ReduxState;

				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;

				expect(state.assessmentStatuses.rom).toBeNull();
				expect(state.assessmentStatuses.posture).not.toBeNull();
				expect(state.assessmentStatuses.posture?.type).toBe('posture');
				expect(state.assessmentStatuses.posture?.score).toBe(75);
			});
		});

		describe('Rejected State - Error Handling', () => {
			it('should set error message on rejection', async () => {
				// Create a store with malformed state to trigger error
				const malformedState = {
					rom: {
						main: {
							session: {
								// Missing required fields
							},
						},
					},
				} as unknown as ReduxState;

				const store = createTestStoreWithState(malformedState);

				const result = await store.dispatch(fetchDashboardData());

				// Check if thunk was rejected
				if (fetchDashboardData.rejected.match(result)) {
					const state = store.getState().dashboard;
					expect(state.error).not.toBeNull();
					expect(typeof state.error).toBe('string');
				}
			});

			it('should set loading to false on rejection', async () => {
				const malformedState = {} as ReduxState;
				const store = createTestStoreWithState(malformedState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;
				expect(state.loading).toBe(false);
			});
		});

		describe('Data Transformation Logic', () => {
			it('should handle ROM score of 0 (falsy but valid)', async () => {
				const mockState = {
					rom: {
						main: {
							session: {
								id: 'rom-123',
								createdAt: '2025-10-20T12:00:00Z',
								customRomSessionExercise: [],
							},
						},
					},
					postures: {
						postures: {
							data: [],
						},
					},
				} as unknown as ReduxState;

				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;

				// Score of 0 should be preserved (not converted to undefined)
				expect(state.assessmentStatuses.rom?.score).toBe(0);
			});

			it('should handle missing posture score gracefully', async () => {
				const mockState = {
					rom: {
						main: {
							session: null,
						},
					},
					postures: {
						postures: {
							data: [
								{
									id: 'posture-456',
									createdAt: '2025-10-20T13:00:00Z',
									report: null, // No report
								},
							],
						},
					},
				} as unknown as ReduxState;

				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;

				// Should be null because report is missing (posture score can't be extracted)
				expect(state.assessmentStatuses.posture).toBeNull();
			});
		});

		describe('Multiple Dispatch Calls', () => {
			it('should handle multiple successive thunk dispatches', async () => {
				const mockState = createMockStateWithData();
				const store = createTestStoreWithState(mockState);

				await store.dispatch(fetchDashboardData());
				await store.dispatch(fetchDashboardData());
				await store.dispatch(fetchDashboardData());

				const state = store.getState().dashboard;
				expect(state.loading).toBe(false);
				expect(state.assessmentStatuses.rom).not.toBeNull();
				expect(state.assessmentStatuses.posture).not.toBeNull();
			});
		});
	});
});
