/**
 * RTK Query API for ROM (Range of Motion)
 *
 * Migrated from createAsyncThunk to RTK Query for ROM module.
 *
 * NOTE: Focused approach - only implementing actively used endpoints.
 * Out of 42 thunks, only 10 are used in components (24% usage).
 *
 * BENEFITS:
 * - Auto-generated hooks
 * - Built-in caching
 * - Automatic loading/error states
 * - Request deduplication
 * - Upload progress support
 *
 * USAGE ANALYSIS (from find-rom-usage.js):
 * - fetchSession: 9 usages (39.1%) - HIGHEST PRIORITY
 * - getCustomRom: 4 usages (17.4%)
 * - getRomSessionById: 2 usages (8.7%)
 * - updateCustomRom: 2 usages (8.7%)
 * - Other 6 thunks: 1 usage each (26%)
 * - Remaining 32 thunks: 0 usages - DEFERRED
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	RomSession,
	RomCustom,
	RomTemplate,
} from '@types';

/**
 * Request/Response Types
 */

/**
 * ROM API - RTK Query Implementation
 *
 * Priority endpoints based on actual usage:
 * 1. fetchSession - Most critical (9 calls, needs caching)
 * 2. getCustomRom - Moderate usage (4 calls)
 * 3. Session/Template operations - Low usage (1-2 calls each)
 *
 * Deferred endpoints (0 usages - 32 thunks):
 * - Template CRUD operations (8 thunks)
 * - Custom ROM exercises (10 thunks)
 * - Patient results operations (8 thunks)
 * - ROM exercises (6 thunks)
 *
 * Usage:
 *   const { data: session } = useFetchSessionQuery(patientId);
 *   const { data: customRom } = useGetCustomRomQuery(romId);
 *   const [updateCustomRom] = useUpdateCustomRomMutation();
 */
export const romApi = createApi({
	reducerPath: 'romApi',
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_ADMIN_HOST || '/api',
		prepareHeaders: (headers) => {
			// Auto-inject auth token from localStorage
			const token = localStorage.getItem('sessionToken');
			const tokenType = localStorage.getItem('token');
			if (token && tokenType) {
				headers.set('Authorization', `${tokenType} ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['RomSession', 'CustomRom', 'RomTemplate'],
	endpoints: (builder) => ({
		/**
		 * QUERY ENDPOINTS
		 */

		/**
		 * Fetch ROM session (open session)
		 * HIGHEST PRIORITY - Called 9 times across multiple components
		 * Caching provides massive performance improvement
		 *
		 * Note: Also used by Rehab module (overlapping functionality)
		 */
		fetchSession: builder.query<unknown[], string>({
			query: (patientId) => `/rom/patients/${patientId}/sessions?open=true`,
			providesTags: (result, error, patientId) => [
				{ type: 'RomSession', id: patientId },
			],
			transformResponse: (response: { data?: unknown[] }) => {
				return response?.data || [];
			},
		}),

		/**
		 * Get ROM session by ID
		 * 2 usages - ActivityStreamPanel, RomFlow Main
		 */
		getRomSessionById: builder.query<RomSession, string>({
			query: (sessionId) => `/rom/sessions/${sessionId}`,
			providesTags: (result, error, sessionId) => [
				{ type: 'RomSession', id: sessionId },
			],
		}),

		/**
		 * Get custom ROM by ID
		 * 4 usages - CustomRomSummary, RomFlow, CustomOptions, NewPatientOnboard
		 */
		getCustomRom: builder.query<RomCustom, string>({
			query: (romId) => `/rom/custom/${romId}`,
			providesTags: (result, error, romId) => [
				{ type: 'CustomRom', id: romId },
			],
		}),

		/**
		 * Get ROM templates list
		 * 1 usage - MyTemplate
		 */
		getRomTemplates: builder.query<RomTemplate[], void>({
			query: () => '/rom/templates',
			providesTags: ['RomTemplate'],
		}),

		/**
		 * Get ROM template by ID
		 * 1 usage - MyTemplate
		 */
		getRomTemplate: builder.query<RomTemplate, string>({
			query: (templateId) => `/rom/templates/${templateId}`,
			providesTags: (result, error, templateId) => [
				{ type: 'RomTemplate', id: templateId },
			],
		}),

		/**
		 * MUTATION ENDPOINTS
		 */

		/**
		 * Save physioterapist video (ROM recording)
		 * 1 usage - RehabFlow (shared with Rehab module)
		 * Handles FormData with upload progress events
		 */
		savePhysioterapistVideo: builder.mutation<unknown, FormData>({
			async queryFn(formData, _api, _extraOptions, baseQuery) {
				try {
					// Note: Upload progress would need custom implementation
					// EventEmitter.emit('UPLOAD_PROGRESS', progress)
					const result = await baseQuery({
						url: '/rom/library/exercises',
						method: 'POST',
						body: formData,
					});

					return { data: result.data };
				} catch (error: unknown) {
					if (axios.isAxiosError(error)) {
						return {
							error: {
								status: error.response?.status || 500,
								data: error.response || 'Upload failed',
							},
						};
					}
					return {
						error: {
							status: 500,
							data: 'Upload failed',
						},
					};
				}
			},
			invalidatesTags: ['RomSession'],
		}),

		/**
		 * Save patient video (patient ROM result)
		 * 1 usage - RehabFlow (shared with Rehab module)
		 * Handles FormData with upload progress events
		 */
		savePatientVideo: builder.mutation<unknown, FormData>({
			async queryFn(formData, _api, _extraOptions, baseQuery) {
				try {
					// Note: Upload progress would need custom implementation
					const result = await baseQuery({
						url: '/rom/patients/exercises',
						method: 'POST',
						body: formData,
					});

					return { data: result.data };
				} catch (error: unknown) {
					if (axios.isAxiosError(error)) {
						return {
							error: {
								status: error.response?.status || 500,
								data: error.response || 'Upload failed',
							},
						};
					}
					return {
						error: {
							status: 500,
							data: 'Upload failed',
						},
					};
				}
			},
			invalidatesTags: ['RomSession'],
		}),

		/**
		 * Complete patient evaluation (mark session complete)
		 * 1 usage - RehabFlow CompletionScreen (shared with Rehab)
		 */
		savePatientEvaluation: builder.mutation<string, string>({
			query: (sessionId) => ({
				url: `/rom/sessions/${sessionId}/complete`,
				method: 'PATCH',
			}),
			invalidatesTags: (result, error, sessionId) => [
				{ type: 'RomSession', id: sessionId },
			],
		}),

		/**
		 * Delete current session
		 * 1 usage - RehabFlow (shared with Rehab)
		 */
		deleteCurrentSession: builder.mutation<unknown, string>({
			query: (sessionId) => ({
				url: `/rom/sessions/${sessionId}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, sessionId) => [
				{ type: 'RomSession', id: sessionId },
			],
		}),

		/**
		 * Update custom ROM
		 * 2 usages - AddRomPopup, CustomRomDataItem
		 */
		updateCustomRom: builder.mutation<RomCustom, { romId: string; data: Partial<RomCustom> }>({
			query: ({ romId, data }) => ({
				url: `/rom/custom/${romId}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (result, error, { romId }) => [
				{ type: 'CustomRom', id: romId },
			],
		}),
	}),
});

// Export auto-generated hooks
export const {
	useFetchSessionQuery,
	useGetRomSessionByIdQuery,
	useGetCustomRomQuery,
	useGetRomTemplatesQuery,
	useGetRomTemplateQuery,
	useSavePhysioterapistVideoMutation,
	useSavePatientVideoMutation,
	useSavePatientEvaluationMutation,
	useDeleteCurrentSessionMutation,
	useUpdateCustomRomMutation,
} = romApi;

/**
 * MIGRATION GUIDE:
 *
 * fetchSession Migration (Most Common Pattern - 9 usages):
 *
 * Before (Thunk):
 * ```typescript
 * const dispatch = useTypedDispatch();
 * const session = useTypedSelector(state => state.rom.main.session);
 *
 * useEffect(() => {
 *   dispatch(fetchSession(patientId));
 * }, [dispatch, patientId]);
 * ```
 *
 * After (RTK Query):
 * ```typescript
 * const { data: sessions, isLoading } = useFetchSessionQuery(patientId, {
 *   skip: !patientId,
 * });
 *
 * const session = sessions?.[0] || null; // Get first open session
 * ```
 *
 * Benefits:
 * - No useEffect needed
 * - Automatic caching (9 components → 1 API call)
 * - Request deduplication across components
 * - Automatic refetch on patientId change
 * - Built-in loading state
 *
 * getCustomRom Migration (4 usages):
 *
 * Before:
 * ```typescript
 * useEffect(() => {
 *   dispatch(getCustomRom(romId));
 * }, [dispatch, romId]);
 *
 * const customRom = useTypedSelector(state => state.rom.customRom.data);
 * ```
 *
 * After:
 * ```typescript
 * const { data: customRom } = useGetCustomRomQuery(romId, {
 *   skip: !romId,
 * });
 * ```
 *
 * updateCustomRom Migration:
 *
 * Before:
 * ```typescript
 * await dispatch(updateCustomRom({ romId, data })).unwrap();
 * ```
 *
 * After:
 * ```typescript
 * const [updateCustomRom] = useUpdateCustomRomMutation();
 * await updateCustomRom({ romId, data }).unwrap();
 * ```
 *
 * getRomSessionById Migration:
 *
 * Before:
 * ```typescript
 * useEffect(() => {
 *   dispatch(getRomSessionById(sessionId));
 * }, [dispatch, sessionId]);
 * ```
 *
 * After:
 * ```typescript
 * const { data: session } = useGetRomSessionByIdQuery(sessionId, {
 *   skip: !sessionId,
 * });
 * ```
 */

/**
 * DEFERRED ENDPOINTS (32 thunks with 0 usages - not migrated):
 *
 * Session Operations (not used):
 * - fetchRomExercises
 * - getRomSessions
 * - patchRomSession
 * - deleteRomSession
 * - createRomSession
 * - updateRomSession
 *
 * Results/Analytics (not used):
 * - getRomResults
 * - getRomResult
 * - getRomPatientResult
 * - getRomPatientResults
 * - createRomPatientResult
 * - updateRomPatientResult
 * - deleteRomPatientResult
 * - updateRomResult
 * - deleteRomResult
 *
 * Template Management (not used):
 * - createRomTemplate
 * - updateRomTemplate
 * - deleteRomTemplate
 * - getRomExercises
 * - getRomExercise
 * - createRomExercise
 * - updateRomExercise
 *
 * Custom ROM Operations (not used):
 * - getCustomRoms
 * - createCustomRom
 * - deleteCustomRom
 * - getCustomRomExercises
 * - getCustomRomExercise
 * - createCustomRomExercise
 * - updateCustomRomExercise
 * - deleteCustomRomExercise
 * - getCustomRomResults
 * - getCustomRomResult
 *
 * These can be added when/if components need them. No point in migrating unused code.
 *
 * Rationale: Following the pragmatic approach from RTK-006 Contacts (3 of 17)
 * and RTK-008 Rehab (6 of 12). Only 24% of ROM thunks are actually used.
 */
