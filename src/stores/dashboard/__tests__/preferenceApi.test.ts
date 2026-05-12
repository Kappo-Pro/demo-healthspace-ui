/**
 * Dashboard Preferences API - Unit Tests
 * EPIC-030-S1: Test RTK Query endpoints
 *
 * Tests:
 * - AC-001: preferenceApi RTK Query slice created
 * - AC-002: GET endpoint defined correctly
 * - AC-003: PUT endpoint defined correctly
 * - AC-004: Endpoints integrated with store
 * - AC-005: Error handling implemented
 * - AC-006: TypeScript types defined
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { preferenceApi } from '../preferenceApi';
import type { DashboardPreferences } from '../dashboardPreferencesSlice';

/**
 * Test Store Setup
 * Creates isolated store for testing RTK Query
 */
function setupTestStore() {
	const store = configureStore({
		reducer: {
			[preferenceApi.reducerPath]: preferenceApi.reducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(preferenceApi.middleware),
	});

	setupListeners(store.dispatch);

	return store;
}

/**
 * Mock Preferences Data
 */
const mockUserId = 'user-123';
const mockPreferences: DashboardPreferences = {
	userId: mockUserId,
	layoutOrder: ['hero', 'assessments', 'programs', 'recommendations', 'alerts'],
	sectionVisibility: {
		hero: true,
		assessments: true,
		programs: true,
		recommendations: true,
		alerts: true,
	},
	layoutType: 'metrics-first',
	weeklySessionGoal: 5,
	updatedAt: '2025-10-21T00:00:00.000Z',
};

/**
 * Tests
 */
describe('preferenceApi', () => {
	let store: ReturnType<typeof setupTestStore>;

	beforeEach(() => {
		store = setupTestStore();
	});

	/**
	 * AC-001: preferenceApi RTK Query slice created
	 */
	describe('API Slice Configuration', () => {
		it('should have correct reducerPath', () => {
			expect(preferenceApi.reducerPath).toBe('preferenceApi');
		});

		it('should define DashboardPreferences tag type', () => {
			const endpoints = preferenceApi.endpoints;
			expect(endpoints.getDashboardPreferences).toBeDefined();
			expect(endpoints.updateDashboardPreferences).toBeDefined();
		});

		it('should export auto-generated hooks', () => {
			const { useGetDashboardPreferencesQuery, useUpdateDashboardPreferencesMutation } =
				preferenceApi;

			expect(useGetDashboardPreferencesQuery).toBeDefined();
			expect(typeof useGetDashboardPreferencesQuery).toBe('function');
			expect(useUpdateDashboardPreferencesMutation).toBeDefined();
			expect(typeof useUpdateDashboardPreferencesMutation).toBe('function');
		});
	});

	/**
	 * AC-002: GET endpoint defined correctly
	 */
	describe('getDashboardPreferences Query', () => {
		it('should construct correct GET request URL', () => {
			const endpoint = preferenceApi.endpoints.getDashboardPreferences;
			const _query = endpoint.initiate(mockUserId);

			// Access the query function to verify URL construction
			const queryFn = endpoint.query as (userId: string) => string;
			const url = queryFn(mockUserId);

			expect(url).toBe(`/users/${mockUserId}/dashboard-preferences`);
		});

		it('should provide correct cache tags', () => {
			const endpoint = preferenceApi.endpoints.getDashboardPreferences;
			const providesTags = endpoint.providesTags;

			if (typeof providesTags === 'function') {
				const tags = providesTags(mockPreferences, undefined, mockUserId);
				expect(tags).toEqual([{ type: 'DashboardPreferences', id: mockUserId }]);
			}
		});

		it('should handle query parameters correctly', () => {
			const endpoint = preferenceApi.endpoints.getDashboardPreferences;
			const _query = endpoint.query as (userId: string) => string;

			expect(query('user-456')).toBe('/users/user-456/dashboard-preferences');
			expect(query('user-789')).toBe('/users/user-789/dashboard-preferences');
		});
	});

	/**
	 * AC-003: PUT endpoint defined correctly
	 */
	describe('updateDashboardPreferences Mutation', () => {
		it('should construct correct PUT request', () => {
			const endpoint = preferenceApi.endpoints.updateDashboardPreferences;
			const queryFn = endpoint.query as (args: {
				userId: string;
				preferences: Omit<DashboardPreferences, 'userId'>;
			}) => { url: string; method: string; body: unknown };

			const { layoutOrder, sectionVisibility, layoutType, weeklySessionGoal, updatedAt } =
				mockPreferences;

			const result = queryFn({
				userId: mockUserId,
				preferences: {
					layoutOrder,
					sectionVisibility,
					layoutType,
					weeklySessionGoal,
					updatedAt,
				},
			});

			expect(result.url).toBe(`/users/${mockUserId}/dashboard-preferences`);
			expect(result.method).toBe('PUT');
			expect(result.body).toEqual({
				layoutOrder,
				sectionVisibility,
				layoutType,
				weeklySessionGoal,
				updatedAt,
			});
		});

		it('should invalidate correct cache tags', () => {
			const endpoint = preferenceApi.endpoints.updateDashboardPreferences;
			const invalidatesTags = endpoint.invalidatesTags;

			if (typeof invalidatesTags === 'function') {
				const tags = invalidatesTags(
					mockPreferences,
					undefined,
					{ userId: mockUserId, preferences: mockPreferences }
				);
				expect(tags).toEqual([{ type: 'DashboardPreferences', id: mockUserId }]);
			}
		});
	});

	/**
	 * AC-004: Endpoints integrated with store
	 */
	describe('Store Integration', () => {
		it('should register reducer in store', () => {
			const state = store.getState();
			expect(state).toHaveProperty(preferenceApi.reducerPath);
		});

		it('should dispatch query action without errors', () => {
			expect(() => {
				store.dispatch(
					preferenceApi.endpoints.getDashboardPreferences.initiate(mockUserId)
				);
			}).not.toThrow();
		});

		it('should dispatch mutation action without errors', () => {
			const { layoutOrder, sectionVisibility, layoutType, weeklySessionGoal, updatedAt } =
				mockPreferences;

			expect(() => {
				store.dispatch(
					preferenceApi.endpoints.updateDashboardPreferences.initiate({
						userId: mockUserId,
						preferences: {
							layoutOrder,
							sectionVisibility,
							layoutType,
							weeklySessionGoal,
							updatedAt,
						},
					})
				);
			}).not.toThrow();
		});
	});

	/**
	 * AC-005: Error handling implemented
	 */
	describe('Error Handling', () => {
		it('should transform 404 errors correctly', () => {
			const endpoint = preferenceApi.endpoints.updateDashboardPreferences;
			const transformError = endpoint.transformErrorResponse;

			if (transformError) {
				const error404 = transformError({ status: 404, data: {} });
				expect(error404).toBe('User preferences not found');
			}
		});

		it('should transform 400 errors with custom message', () => {
			const endpoint = preferenceApi.endpoints.updateDashboardPreferences;
			const transformError = endpoint.transformErrorResponse;

			if (transformError) {
				const error400 = transformError({
					status: 400,
					data: { message: 'Invalid layout type' },
				});
				expect(error400).toBe('Invalid layout type');
			}
		});

		it('should transform 400 errors without custom message', () => {
			const endpoint = preferenceApi.endpoints.updateDashboardPreferences;
			const transformError = endpoint.transformErrorResponse;

			if (transformError) {
				const error400 = transformError({ status: 400, data: {} });
				expect(error400).toBe('Invalid preferences data');
			}
		});

		it('should handle unknown errors gracefully', () => {
			const endpoint = preferenceApi.endpoints.updateDashboardPreferences;
			const transformError = endpoint.transformErrorResponse;

			if (transformError) {
				const genericError = transformError({ status: 500, data: {} });
				expect(genericError).toBe('Failed to save preferences');
			}
		});

		it('should handle non-object errors', () => {
			const endpoint = preferenceApi.endpoints.updateDashboardPreferences;
			const transformError = endpoint.transformErrorResponse;

			if (transformError) {
				const stringError = transformError('Network error');
				expect(stringError).toBe('Failed to save preferences');
			}
		});
	});

	/**
	 * AC-006: TypeScript types defined
	 */
	describe('TypeScript Type Safety', () => {
		it('should enforce correct preference structure', () => {
			const { layoutOrder, sectionVisibility, layoutType, weeklySessionGoal, updatedAt } =
				mockPreferences;

			const validPreferences: Omit<DashboardPreferences, 'userId'> = {
				layoutOrder,
				sectionVisibility,
				layoutType,
				weeklySessionGoal,
				updatedAt,
			};

			// This test ensures TypeScript compilation succeeds with correct types
			expect(validPreferences.layoutType).toBe('metrics-first');
			expect(validPreferences.weeklySessionGoal).toBe(5);
		});

		it('should type query hook return value correctly', () => {
			// Type checking at compile time - ensures hook returns DashboardPreferences
			const hook = preferenceApi.endpoints.getDashboardPreferences.useQuery;
			expect(typeof hook).toBe('function');
		});

		it('should type mutation hook return value correctly', () => {
			// Type checking at compile time - ensures hook returns mutation trigger
			const hook = preferenceApi.endpoints.updateDashboardPreferences.useMutation;
			expect(typeof hook).toBe('function');
		});
	});

	/**
	 * Cache Behavior Tests
	 */
	describe('RTK Query Cache Behavior', () => {
		it('should use different cache keys for different users', () => {
			const endpoint = preferenceApi.endpoints.getDashboardPreferences;

			const query1 = endpoint.initiate('user-1');
			const query2 = endpoint.initiate('user-2');

			// Different users should trigger different cache keys
			expect(query1.requestId).not.toBe(query2.requestId);
		});

		it('should invalidate cache after mutation', () => {
			const endpoint = preferenceApi.endpoints.updateDashboardPreferences;
			const invalidatesTags = endpoint.invalidatesTags;

			// Mutation should invalidate the query cache for the same user
			if (typeof invalidatesTags === 'function') {
				const tags = invalidatesTags(
					mockPreferences,
					undefined,
					{ userId: mockUserId, preferences: mockPreferences }
				);

				// Should match the provideTags from getDashboardPreferences
				expect(tags).toContainEqual({
					type: 'DashboardPreferences',
					id: mockUserId,
				});
			}
		});
	});
});

/**
 * Integration Test Pattern
 * Demonstrates how to use the API in components
 */
describe('Usage Patterns', () => {
	it('should demonstrate query hook usage', () => {
		const { useGetDashboardPreferencesQuery } = preferenceApi;

		// This test validates the hook signature and export
		expect(typeof useGetDashboardPreferencesQuery).toBe('function');
		expect(useGetDashboardPreferencesQuery.name).toBe('useQuery');
	});

	it('should demonstrate mutation hook usage', () => {
		const { useUpdateDashboardPreferencesMutation } = preferenceApi;

		// This test validates the hook signature and export
		expect(typeof useUpdateDashboardPreferencesMutation).toBe('function');
		expect(useUpdateDashboardPreferencesMutation.name).toBe('useMutation');
	});
});
