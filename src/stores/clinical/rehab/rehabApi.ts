/**
 * RTK Query API for Rehab
 *
 * Migrated from createAsyncThunk to RTK Query for Rehab module.
 *
 * NOTE: Focused approach - only implementing actively used endpoints.
 * Out of 12 thunks, only 6 are used in components.
 *
 * BENEFITS:
 * - Auto-generated hooks
 * - Built-in caching
 * - Automatic loading/error states
 * - Request deduplication
 * - Upload progress support
 *
 * USAGE ANALYSIS (from find-rehab-usage.js):
 * - fetchSession: 8 usages (50% of all calls) - HIGHEST PRIORITY
 * - fetchExercises: 2 usages (12.5%)
 * - savePhysioterapistVideo: 1 usage (6.25%)
 * - savePatientVideo: 1 usage (6.25%)
 * - savePatientEvaluation: 1 usage (6.25%)
 * - deleteCurrentSession: 1 usage (6.25%)
 * - Other 6 library thunks: 0 usages - DEFERRED
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	RehabCreatePatientResultExercise,
	RehabCreateLibraryExercises,
	RehabPatientListExercise,
	RehabExerciseListSession,
	RehabExerciseLibrary,
} from '@types';

/**
 * Request/Response Types
 */

/**
 * Rehab API - RTK Query Implementation
 *
 * Priority endpoints based on actual usage:
 * 1. fetchSession - Most critical (8 calls, needs caching)
 * 2. fetchExercises - Moderate usage (2 calls)
 * 3. Session/Exercise operations - Low usage (1 call each)
 *
 * Deferred endpoints (0 usages):
 * - savePhysioterapistVideoToPatient
 * - getVideosFromPersonalLibrary
 * - deleteVideoFromPersonalLibrary
 * - updateVideoFromPersonalLibrary
 * - getVideosFromGeneralLibrary
 * - fetchExercisesEffort
 *
 * Usage:
 *   const { data: session } = useFetchSessionQuery(patientId);
 *   const { data: exercises } = useFetchExercisesQuery(patientId);
 *   const [savePatientVideo] = useSavePatientVideoMutation();
 */
export const rehabApi = createApi({
	reducerPath: 'rehabApi',
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_ADMIN_HOST || '/api',
		prepareHeaders: headers => {
			// Auto-inject auth token from localStorage
			const token = localStorage.getItem('sessionToken');
			const tokenType = localStorage.getItem('token');
			if (token && tokenType) {
				headers.set('Authorization', `${tokenType} ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['RehabSession', 'RehabExercises', 'RehabLibrary'],
	endpoints: builder => ({
		/**
		 * QUERY ENDPOINTS
		 */

		/**
		 * Fetch rehab session (open session)
		 * HIGHEST PRIORITY - Called 8 times across multiple components
		 * Caching provides massive performance improvement
		 */
		fetchSession: builder.query<RehabExerciseListSession[], string>({
			query: patientId => `/rehab/patients/${patientId}/sessions?open=true`,
			providesTags: (result, error, patientId) => [
				{ type: 'RehabSession', id: patientId },
			],
			transformResponse: (response: { data?: RehabExerciseListSession[] }) => {
				return response?.data ?? [];
			},
		}),

		/**
		 * Fetch patient exercises
		 * 2 usages - AiAssistantStartScan, CarespaceLibraryData
		 */
		fetchExercises: builder.query<RehabPatientListExercise, string>({
			query: patientId => `/rehab/patients/${patientId}/exercises`,
			providesTags: (result, error, patientId) => [
				{ type: 'RehabExercises', id: patientId },
			],
		}),

		/**
		 * MUTATION ENDPOINTS
		 */

		/**
		 * Save physioterapist video (exercise recording)
		 * 1 usage - RehabFlow
		 * Handles FormData with upload progress events
		 */
		savePhysioterapistVideo: builder.mutation<
			RehabExerciseLibrary,
			RehabCreateLibraryExercises
		>({
			async queryFn(formData, _api, _extraOptions, baseQuery) {
				try {
					// Note: Upload progress would need custom implementation
					// EventEmitter.emit('UPLOAD_PROGRESS', progress)
					const result = await baseQuery({
						url: '/program/exercises/library',
						method: 'POST',
						body: formData,
					});

					return { data: result.data as RehabExerciseLibrary };
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
			invalidatesTags: ['RehabLibrary'],
		}),

		/**
		 * Save patient video (patient exercise result)
		 * 1 usage - RehabFlow
		 * Handles FormData with upload progress events
		 */
		savePatientVideo: builder.mutation<
			RehabExerciseLibrary,
			RehabCreatePatientResultExercise
		>({
			async queryFn(formData, _api, _extraOptions, baseQuery) {
				try {
					// Note: Upload progress would need custom implementation
					// EventEmitter.emit('UPLOAD_PROGRESS', progress)
					const result = await baseQuery({
						url: '/rehab/patients/exercises',
						method: 'POST',
						body: formData,
					});

					return { data: result.data as RehabExerciseLibrary };
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
			invalidatesTags: (_result, _error, _formData) => {
				// FormData doesn't have direct access to patientId in type
				// Will invalidate all exercises - consider more specific invalidation
				return ['RehabExercises'];
			},
		}),

		/**
		 * Complete patient evaluation (mark session complete)
		 * 1 usage - RehabFlow CompletionScreen
		 */
		savePatientEvaluation: builder.mutation<string, string>({
			query: sessionId => ({
				url: `/rehab/sessions/${sessionId}/complete`,
				method: 'PATCH',
			}),
			invalidatesTags: (result, error, sessionId) => [
				{ type: 'RehabSession', id: sessionId },
			],
		}),

		/**
		 * Delete current session
		 * 1 usage - RehabFlow
		 */
		deleteCurrentSession: builder.mutation<unknown, string>({
			query: sessionId => ({
				url: `/rehab/sessions/${sessionId}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, sessionId) => [
				{ type: 'RehabSession', id: sessionId },
			],
		}),
	}),
});

// Export auto-generated hooks
export const {
	useFetchSessionQuery,
	useFetchExercisesQuery,
	useSavePhysioterapistVideoMutation,
	useSavePatientVideoMutation,
	useSavePatientEvaluationMutation,
	useDeleteCurrentSessionMutation,
} = rehabApi;

/**
 * MIGRATION GUIDE:
 *
 * fetchSession Migration (Most Common Pattern - 8 usages):
 *
 * Before (Thunk):
 * ```typescript
 * const dispatch = useTypedDispatch();
 * const session = useTypedSelector(state => state.rehab.main.session);
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
 * - Automatic caching (8 components → 1 API call)
 * - Request deduplication across components
 * - Automatic refetch on patientId change
 * - Built-in loading state
 *
 * fetchExercises Migration:
 *
 * Before:
 * ```typescript
 * useEffect(() => {
 *   dispatch(fetchExercises(patientId));
 * }, [dispatch, patientId]);
 *
 * const exercises = useTypedSelector(state => state.rehab.main.exercises);
 * ```
 *
 * After:
 * ```typescript
 * const { data: exerciseData } = useFetchExercisesQuery(patientId, {
 *   skip: !patientId,
 * });
 *
 * const exercises = exerciseData?.rehabExerciseToPatient || [];
 * ```
 *
 * savePhysioterapistVideo Migration:
 *
 * Before:
 * ```typescript
 * const handleSave = async () => {
 *   const formData = new FormData();
 *   // ... append fields
 *
 *   await dispatch(savePhysioterapistVideo(formData)).unwrap();
 * };
 * ```
 *
 * After:
 * ```typescript
 * const [saveVideo, { isLoading }] = useSavePhysioterapistVideoMutation();
 *
 * const handleSave = async () => {
 *   const formData = new FormData();
 *   // ... append fields
 *
 *   await saveVideo(formData).unwrap();
 * };
 * ```
 *
 * savePatientVideo Migration:
 *
 * Before:
 * ```typescript
 * await dispatch(savePatientVideo(formData)).unwrap();
 * ```
 *
 * After:
 * ```typescript
 * const [saveVideo] = useSavePatientVideoMutation();
 * await saveVideo(formData).unwrap();
 * ```
 *
 * savePatientEvaluation Migration:
 *
 * Before:
 * ```typescript
 * await dispatch(savePatientEvaluation(sessionId));
 * ```
 *
 * After:
 * ```typescript
 * const [completeEvaluation] = useSavePatientEvaluationMutation();
 * await completeEvaluation(sessionId).unwrap();
 * ```
 *
 * deleteCurrentSession Migration:
 *
 * Before:
 * ```typescript
 * await dispatch(deleteCurrentSession(sessionId));
 * ```
 *
 * After:
 * ```typescript
 * const [deleteSession] = useDeleteCurrentSessionMutation();
 * await deleteSession(sessionId).unwrap();
 * ```
 *
 * Upload Progress Note:
 * The original thunks use EventEmitter for upload progress.
 * RTK Query doesn't have built-in upload progress support.
 * Options:
 * 1. Implement custom progress tracking in queryFn
 * 2. Use onQueryStarted lifecycle for progress events
 * 3. Keep using EventEmitter pattern in queryFn
 */

/**
 * DEFERRED ENDPOINTS (0 usages - not migrated):
 *
 * Library Management (from library.ts):
 * - savePhysioterapistVideoToPatient (POST /rehab/patients/:userId/exercises/add)
 * - getVideosFromPersonalLibrary (GET /rehab/library/physioterapists/:id)
 * - deleteVideoFromPersonalLibrary (DELETE /rehab/library/videos/:id)
 * - updateVideoFromPersonalLibrary (PATCH /rehab/library/exercises)
 * - getVideosFromGeneralLibrary (GET /rehab/library/strapi)
 * - fetchExercisesEffort (GET /rehab/exercises/efforts)
 *
 * These can be added when/if components need them. No point in migrating unused code.
 *
 * Rationale: Following the pragmatic approach from Contacts (RTK-006),
 * where we only implemented 3 of 17 thunks that were actually used.
 */
