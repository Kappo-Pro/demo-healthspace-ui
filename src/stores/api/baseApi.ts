/**
 * Base API Configuration for RTK Query
 *
 * This module provides a reusable base query configuration that:
 * - Auto-injects authorization tokens from axios defaults
 * - Provides consistent error handling
 * - Supports all standard HTTP methods
 * - Can be extended for new API slices
 *
 * Usage:
 * ```typescript
 * import { createApi } from '@reduxjs/toolkit/query/react';
 * import { baseQueryWithAuth } from '@stores/api/baseApi';
 *
 * export const myApi = createApi({
 *   reducerPath: 'myApi',
 *   baseQuery: baseQueryWithAuth,
 *   tagTypes: ['MyEntity'],
 *   endpoints: (builder) => ({ ... }),
 * });
 * ```
 */

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import axios from 'axios';

/**
 * Base query with automatic authorization header injection
 */
export const baseQueryWithAuth = fetchBaseQuery({
	baseUrl: '/api',
	prepareHeaders: (headers) => {
		// Auto-inject auth token from axios defaults if configured
		const token = axios.defaults?.headers?.common?.['Authorization'];
		if (token) {
			headers.set('Authorization', token as string);
		}
		return headers;
	},
});

/**
 * Enhanced base query with error logging and retry logic (optional)
 */
export const baseQueryWithAuthAndLogging: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const result = await baseQueryWithAuth(args, api, extraOptions);

	if (result.error) {
		// Log API errors for debugging (development only)
		if (process.env.NODE_ENV === 'development') {
			console.error('[baseApi] API request failed:', result.error);
		}
	}

	return result;
};

/**
 * Common tag types used across multiple APIs
 */
export const COMMON_TAG_TYPES = [
	'User',
	'Patient',
	'Settings',
	'Assessment',
	'Report',
] as const;

/**
 * Helper to create optimistic cache updates
 */
export function createOptimisticUpdate<T>(
	id: string | number,
	changes: Partial<T>
) {
	return {
		type: 'optimistic' as const,
		id,
		changes,
	};
}

/**
 * Helper to invalidate multiple tag types at once
 */
export function invalidateMultipleTags(
	tagTypes: readonly string[],
	id?: string | number
) {
	return tagTypes.map((type) => ({ type: type as never, id }));
}
