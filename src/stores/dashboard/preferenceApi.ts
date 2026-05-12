/**
 * Dashboard Preferences API - RTK Query Implementation
 * EPIC-030-S1: Create preferenceApi RTK Query Endpoints
 *
 * Provides GET and PUT endpoints for dashboard user preferences.
 * Replaces stubbed async thunks in dashboardPreferencesSlice.
 *
 * BENEFITS:
 * - Auto-generated hooks (useGetDashboardPreferencesQuery, useUpdateDashboardPreferencesMutation)
 * - Built-in caching
 * - Automatic loading/error states
 * - Request deduplication
 * - Optimistic updates support
 *
 * Created: EPIC-030-S1 (Phase 4: Customization)
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '@stores/api/baseApi';
import type { DashboardPreferences } from './dashboardPreferencesSlice';

/**
 * Request/Response Types
 */

interface UpdatePreferencesRequest {
	userId: string;
	preferences: Omit<DashboardPreferences, 'userId'>;
}

/**
 * Dashboard Preferences API - RTK Query Implementation
 *
 * Endpoints:
 * - getDashboardPreferences: GET /users/:userId/dashboard-preferences
 * - updateDashboardPreferences: PUT /users/:userId/dashboard-preferences
 *
 * Usage:
 *   const { data: preferences } = useGetDashboardPreferencesQuery(userId);
 *   const [updatePreferences] = useUpdateDashboardPreferencesMutation();
 */
export const preferenceApi = createApi({
	reducerPath: 'preferenceApi',
	baseQuery: baseQueryWithAuth,
	tagTypes: ['DashboardPreferences'],
	endpoints: (builder) => ({
		/**
		 * Get Dashboard Preferences
		 * AC-002: GET /api/users/:userId/dashboard-preferences
		 *
		 * @param userId - User ID to load preferences for
		 * @returns DashboardPreferences object
		 */
		getDashboardPreferences: builder.query<DashboardPreferences, string>({
			query: (userId) => `/users/${userId}/dashboard-preferences`,
			providesTags: (result, error, userId) => [
				{ type: 'DashboardPreferences', id: userId },
			],
		}),

		/**
		 * Update Dashboard Preferences
		 * AC-003: PUT /api/users/:userId/dashboard-preferences
		 *
		 * @param params.userId - User ID
		 * @param params.preferences - Updated preferences object
		 * @returns Updated DashboardPreferences
		 */
		updateDashboardPreferences: builder.mutation<
			DashboardPreferences,
			UpdatePreferencesRequest
		>({
			query: ({ userId, preferences }) => ({
				url: `/users/${userId}/dashboard-preferences`,
				method: 'PUT',
				body: preferences,
			}),
			invalidatesTags: (result, error, { userId }) => [
				{ type: 'DashboardPreferences', id: userId },
			],
			/**
			 * AC-005: Error handling for API failures
			 * Transforms error responses into user-friendly messages
			 */
			transformErrorResponse: (response: unknown) => {
				if (typeof response === 'object' && response !== null) {
					const errorResponse = response as { status?: number; data?: { message?: string } };
					if (errorResponse.status === 404) {
						return 'User preferences not found';
					}
					if (errorResponse.status === 400) {
						return errorResponse.data?.message || 'Invalid preferences data';
					}
				}
				return 'Failed to save preferences';
			},
		}),
	}),
});

// Export auto-generated hooks (AC-001)
export const {
	useGetDashboardPreferencesQuery,
	useUpdateDashboardPreferencesMutation,
} = preferenceApi;

/**
 * MIGRATION GUIDE:
 *
 * Replace loadPreferences thunk:
 *
 * Before (Thunk):
 * ```typescript
 * const dispatch = useTypedDispatch();
 * const preferences = useTypedSelector(selectDashboardPreferences);
 *
 * useEffect(() => {
 *   dispatch(loadPreferences(userId));
 * }, [dispatch, userId]);
 * ```
 *
 * After (RTK Query):
 * ```typescript
 * const { data: preferences, isLoading } = useGetDashboardPreferencesQuery(userId, {
 *   skip: !userId, // Only fetch when userId exists
 * });
 * ```
 *
 * Replace savePreferences thunk:
 *
 * Before:
 * ```typescript
 * const handleSave = async () => {
 *   await dispatch(savePreferences()).unwrap();
 *   message.success('Preferences saved!');
 * };
 * ```
 *
 * After:
 * ```typescript
 * const [updatePreferences] = useUpdateDashboardPreferencesMutation();
 *
 * const handleSave = async () => {
 *   try {
 *     await updatePreferences({
 *       userId,
 *       preferences: {
 *         layoutOrder,
 *         sectionVisibility,
 *         layoutType,
 *         weeklySessionGoal,
 *         updatedAt: new Date().toISOString(),
 *       },
 *     }).unwrap();
 *     message.success('Preferences saved!');
 *   } catch (error) {
 *     message.error(error as string); // transformErrorResponse provides string
 *   }
 * };
 * ```
 *
 * Benefits:
 * - No useEffect needed for queries
 * - Automatic caching (subsequent calls instant)
 * - Request deduplication
 * - Built-in loading state
 * - Automatic refetch on userId change
 * - Better TypeScript support
 */
