/**
 * RTK Query API for Recommendations
 *
 * Fetches personalized recommendations from Strapi CMS for the dashboard.
 *
 * BENEFITS:
 * - Auto-generated hooks (useGetRecommendationsQuery, etc.)
 * - Built-in caching & cache invalidation
 * - Automatic loading/error states
 * - Request deduplication
 * - Better TypeScript inference
 * - Polling/refetching capabilities
 *
 * USAGE:
 *   const { data, isLoading, error } = useGetRecommendationsQuery(userId);
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type {
	RecommendationFilters,
	StrapiRecommendationResponse,
} from '@services/api/types/recommendations';

/**
 * Base Query Configuration
 */
const baseQuery = fetchBaseQuery({
	baseUrl: process.env.REACT_APP_STRAPI_HOST || '/api',
	prepareHeaders: headers => {
		// Use the same Strapi API key as the existing Strapi client
		const apiKey = process.env.REACT_APP_STRAPI_KEY;
		if (apiKey) {
			headers.set('authorization', `Bearer ${apiKey}`);
		}
		headers.set('Content-Type', 'application/json');
		return headers;
	},
});

/**
 * Base Query with Enhanced Error Handling
 *
 * EPIC-018-S4: Comprehensive error handling for Strapi API
 *
 * Handles:
 * - Network errors (offline, timeout)
 * - Authentication errors (401, 403)
 * - Not found errors (404)
 * - Server errors (500, 503)
 * - Provides user-friendly error messages
 */
const baseQueryWithErrorHandling: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const result = await baseQuery(args, api, extraOptions);

	if (result.error) {
		const error = result.error as FetchBaseQueryError;

		// Network errors (FETCH_ERROR, TIMEOUT_ERROR)
		if ('error' in error && typeof error.error === 'string') {
			return {
				error: {
					status: 'FETCH_ERROR',
					data: {
						message:
							'Unable to connect to server. Please check your internet connection.',
					},
				},
			};
		}

		// HTTP errors with status codes
		if ('status' in error) {
			let userMessage = 'An unexpected error occurred.';

			switch (error.status) {
				case 401:
					userMessage = 'Your session has expired. Please log in again.';
					break;
				case 403:
					userMessage = 'You do not have permission to access this resource.';
					break;
				case 404:
					userMessage = 'Recommendations not found.';
					break;
				case 500:
				case 503:
					userMessage = 'Server error. Please try again later.';
					break;
				default:
			}

			return {
				error: {
					status: error.status,
					data: {
						message: userMessage,
						originalError: error.data,
					},
				},
			};
		}
	}

	return result;
};

/**
 * Recommendations API - RTK Query Implementation
 *
 * This API slice fetches personalized recommendations from Strapi CMS.
 *
 * Authentication:
 * - Uses REACT_APP_STRAPI_KEY environment variable (same as existing Strapi client)
 * - API key is automatically injected in prepareHeaders
 *
 * Base URL:
 * - Uses REACT_APP_STRAPI_HOST environment variable
 * - Points to Strapi CMS instance
 *
 * Error Handling:
 * - Network errors: User-friendly messages
 * - Auth errors (401/403): Session/permission messages
 * - Not found (404): Resource not found
 * - Server errors (500/503): Server unavailable messages
 */
export const recommendationsApi = createApi({
	reducerPath: 'recommendationsApi',
	baseQuery: baseQueryWithErrorHandling,
	tagTypes: ['Recommendations'],

	// EPIC-018-S5: Cache Configuration
	// CMS content changes infrequently - 5 minute cache is appropriate
	keepUnusedDataFor: 300, // 5 minutes (300 seconds)

	// Refetch Strategies: Disabled for stable CMS content
	// Manual refetch() available when force refresh needed
	refetchOnFocus: false,
	refetchOnReconnect: false,
	refetchOnMountOrArgChange: false,

	endpoints: builder => ({
		/**
		 * Get Recommendations Query
		 *
		 * Fetches recommendations from Strapi with optional filtering.
		 *
		 * @param filters - Optional filtering and pagination parameters
		 * @returns StrapiRecommendationResponse with data and meta
		 *
		 * @example
		 * ```typescript
		 * // Fetch all recommendations
		 * const { data } = useGetRecommendationsQuery();
		 *
		 * // Filter by functional goals
		 * const { data } = useGetRecommendationsQuery({
		 *   functionalGoalIds: [1, 3, 5],
		 *   page: 1,
		 *   pageSize: 10
		 * });
		 *
		 * // Filter by persona and type
		 * const { data } = useGetRecommendationsQuery({
		 *   personaId: 2,
		 *   recommendationType: "Exercise"
		 * });
		 * ```
		 */
		getRecommendations: builder.query<
			StrapiRecommendationResponse,
			RecommendationFilters | void
		>({
			query: filters => {
				const params = new URLSearchParams();

				// Populate relations (Strapi v4 explicit field population)
				// EPIC-018-S3: Optimized population strategy
				const populateFields = [
					'media',
					'functionalGoals',
					'recommendationTypes',
					'recommendationCategories',
				];

				populateFields.forEach(field => {
					params.append('populate[]', field);
				});

				// Apply filters if provided
				if (filters) {
					// Filter by functional goal IDs (many-to-many relation)
					if (
						filters.functionalGoalIds &&
						filters.functionalGoalIds.length > 0
					) {
						filters.functionalGoalIds.forEach((id, index) => {
							params.append(
								`filters[functionalGoals][id][$in][${index}]`,
								id.toString(),
							);
						});
					}

					// Filter by persona ID
					if (filters.personaId) {
						params.append(
							'filters[persona][id][$eq]',
							filters.personaId.toString(),
						);
					}

					// Filter by audience ID
					if (filters.audienceId) {
						params.append(
							'filters[audience][id][$eq]',
							filters.audienceId.toString(),
						);
					}

					// Filter by recommendation type name
					if (filters.recommendationType) {
						params.append(
							'filters[recommendationTypes][name][$eq]',
							filters.recommendationType,
						);
					}

					// Pagination parameters
					const page = filters.page || 1;
					const pageSize = filters.pageSize || 25;
					params.append('pagination[page]', page.toString());
					params.append('pagination[pageSize]', pageSize.toString());
				} else {
					// Default pagination when no filters provided
					params.append('pagination[page]', '1');
					params.append('pagination[pageSize]', '25');
				}

				return `/recommendations?${params.toString()}`;
			},

			// EPIC-018-S5: Tag-based cache invalidation
			// Provides tags for each recommendation + list tag for bulk invalidation
			providesTags: result => {
				if (!result?.data) {
					return ['Recommendations'];
				}

				return [
					{ type: 'Recommendations', id: 'LIST' },
					...result.data.map(recommendation => ({
						type: 'Recommendations' as const,
						id: recommendation.id,
					})),
				];
			},
		}),
	}),
});

// Export auto-generated hooks
export const { useGetRecommendationsQuery } = recommendationsApi;

/**
 * MIGRATION GUIDE (for future endpoint implementation):
 *
 * Query Example:
 * ```typescript
 * const { data: recommendations, isLoading, error } = useGetRecommendationsQuery(userId);
 * ```
 *
 * Mutation Example:
 * ```typescript
 * const [updateRecommendation] = useUpdateRecommendationMutation();
 * await updateRecommendation({ id, data }).unwrap();
 * ```
 */
