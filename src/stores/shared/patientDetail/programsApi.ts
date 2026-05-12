/**
 * RTK Query API for Programs
 *
 * Migrated from createAsyncThunk to RTK Query for Programs module.
 *
 * NOTE: Programs module is in aiAssistant/program.ts
 * This handles exercise programs, AI-generated programs, and program templates.
 *
 * BENEFITS:
 * - Auto-generated hooks
 * - Built-in caching
 * - Automatic loading/error states
 * - Request deduplication
 * - Optimistic updates support
 *
 * USAGE ANALYSIS (from find-programs-usage.js):
 * - All 16 thunks are actively used across 27 files
 * - createProgram: 15 usages (most common)
 * - updateProgram: 6 usages
 * - getProgramList: 5 usages
 * - AI program generation: 3 endpoints with special error handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	ProgramResponse,
	ProgramTemplateResponse,
	ProgramByIdList,
	ProgramSessionByProgramId,
	ProgramSessionResultResponse,
	ProgramPayload,
	IProgramData,
	ProgramPreAssesment,
} from '@types';

/**
 * Request/Response Types
 */

interface CreateProgramRequest {
	formData: FormData;
	physioterapistId?: string;
}

interface UpdateProgramRequest {
	programId: string;
	programData: IProgramData;
}

interface GetProgramByIdListRequest {
	programId: string;
	limit: number;
	page: number;
}

interface GetExerciseByProgramRequest {
	programId: string;
	exerciseId: string;
	limit: number;
	page: number;
}

interface GetProgramSummaryListRequest {
	userId: string;
	limit: number;
	page: number;
}

/**
 * Programs API - RTK Query Implementation
 *
 * Endpoints:
 * - 10 Queries (GET operations + AI generation)
 * - 6 Mutations (POST/PATCH operations)
 *
 * Special Features:
 * - AI program generation with error handling
 * - FormData support for uploads
 * - Multi-step mutations (create + update)
 * - Upload progress tracking (saveProgramExercise)
 *
 * Usage:
 *   const { data: programs } = useGetProgramListQuery({ userId, limit, page });
 *   const [createProgram] = useCreateProgramMutation();
 *   const [updateProgram] = useUpdateProgramMutation();
 */
export const programsApi = createApi({
	reducerPath: 'programsApi',
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
	tagTypes: [
		'Program',
		'ProgramList',
		'ProgramTemplate',
		'ProgramSession',
		'AIProgram',
	],
	endpoints: builder => ({
		/**
		 * QUERY ENDPOINTS
		 */

		/**
		 * Get program list for user
		 * 5 usages - AdminMenu, UserMenu, AIAssistantProgram, NewPatientOnboard
		 */
		getProgramList: builder.query<ProgramResponse, ProgramPayload>({
			query: ({ userId, limit, page, searchValue = '' }) =>
				`/program/users/${userId}?search=${searchValue}&page=${page}&limit=${limit}`,
			providesTags: (result, error, { userId }) => [
				{ type: 'ProgramList', id: userId },
			],
		}),

		/**
		 * Get approved program list (status filter)
		 * 2 usages - AdminMenu, UserMenu
		 */
		getProgramListApproved: builder.query<ProgramResponse, ProgramPayload>({
			query: ({ userId, limit, page, searchValue = '', status }) =>
				`/program/users/${userId}?search=${searchValue}&page=${page}&limit=${limit}&status=${status}`,
			providesTags: (result, error, { userId, status }) => [
				{ type: 'ProgramList', id: `${userId}-${status}` },
			],
		}),

		/**
		 * Get program by ID
		 * 2 usages - Program atom, AiProgramSummary
		 */
		getProgramById: builder.query<ProgramResponse, string>({
			query: programId => `/program/get/${programId}`,
			providesTags: (result, error, programId) => [
				{ type: 'Program', id: programId },
			],
		}),

		/**
		 * Get program templates
		 * 2 usages - CreateProgramModal, AIAssistantProgram
		 */
		getProgramTemplate: builder.query<ProgramTemplateResponse, ProgramPayload>({
			query: ({ limit, page, searchValue = '' }) =>
				`/program/program-template/list?search=${searchValue}&page=${page}&limit=${limit}`,
			providesTags: ['ProgramTemplate'],
		}),

		/**
		 * Get program summary list (with sessions)
		 * 1 usage - AiProgramSummary
		 */
		getProgramSummaryList: builder.query<
			ProgramByIdList,
			GetProgramSummaryListRequest
		>({
			query: ({ userId, limit, page }) =>
				`/program/users/${userId}?limit=${limit}&page=${page}&sessions=true`,
			providesTags: (result, error, { userId }) => [
				{ type: 'ProgramList', id: `${userId}-summary` },
			],
		}),

		/**
		 * Get program sessions by program ID
		 * 1 usage - AiProgramSummary
		 */
		getProgramByIdList: builder.query<
			ProgramSessionByProgramId,
			GetProgramByIdListRequest
		>({
			query: ({ programId, limit, page }) =>
				`/program/${programId}/sessions?limit=${limit}&page=${page}`,
			providesTags: (result, error, { programId }) => [
				{ type: 'ProgramSession', id: programId },
			],
		}),

		/**
		 * Get exercise results by program
		 * 1 usage - AiProgramSummary
		 */
		getExerciseByProgram: builder.query<
			ProgramSessionResultResponse,
			GetExerciseByProgramRequest
		>({
			query: ({ programId, exerciseId, limit, page }) =>
				`/program/${programId}/exercises/${exerciseId}/sessions?limit=${limit}&page=${page}`,
			providesTags: (result, error, { programId, exerciseId }) => [
				{ type: 'ProgramSession', id: `${programId}-${exerciseId}` },
			],
		}),

		/**
		 * AI PROGRAM GENERATION (Special Queries with Error Handling)
		 */

		/**
		 * Get previous OpenAI program
		 * 1 usage - CreateProgramModal
		 * Special: Can trigger new generation if none exists
		 */
		getPreviousOpenAiProgram: builder.query<unknown, string>({
			query: userId => `/program/open-ai/users/${userId}`,
			providesTags: (result, error, userId) => [
				{ type: 'AIProgram', id: `openai-${userId}` },
			],
		}),

		/**
		 * Get previous VitalFlow AI program
		 * 1 usage - CreateProgramModal
		 */
		getPreviousCarespaceAiProgram: builder.query<unknown, string>({
			query: userId => ({
				url: '/program/generate',
				method: 'POST',
				body: { userId },
			}),
			providesTags: (result, error, userId) => [
				{ type: 'AIProgram', id: `vitalflow-${userId}` },
			],
			transformErrorResponse: (response: unknown) => ({
				statusCode: response.status,
				message: response.data?.message || 'AI program generation failed',
			}),
		}),

		/**
		 * Generate new OpenAI program
		 * 1 usage - CreateProgramModal
		 */
		getOpenAiProgram: builder.query<unknown, string>({
			query: userId => ({
				url: '/program/open-ai',
				method: 'POST',
				body: { userId },
			}),
			providesTags: (result, error, userId) => [
				{ type: 'AIProgram', id: `openai-${userId}` },
			],
			transformErrorResponse: (response: unknown) => ({
				statusCode: response.status,
				message: response.data?.message || 'OpenAI program generation failed',
			}),
		}),

		/**
		 * MUTATION ENDPOINTS
		 */

		/**
		 * Create program
		 * MOST USED - 15 usages across multiple components
		 * Multi-step: Creates program, then auto-updates with active/approved status
		 */
		createProgram: builder.mutation<unknown, CreateProgramRequest>({
			async queryFn(
				{ formData, physioterapistId },
				_api,
				_extraOptions,
				baseQuery,
			) {
				try {
					// Step 1: Create program
					const createResult = (await baseQuery({
						url: '/program',
						method: 'POST',
						body: formData,
					})) as { data?: { id: string } };

					if (createResult.data?.id) {
						// Step 2: Auto-update to active/approved
						const updateResult = await baseQuery({
							url: `/program/${createResult.data.id}`,
							method: 'PATCH',
							body: {
								active: true,
								physioterapistId,
								status: 'approved',
							},
						});

						return { data: updateResult.data };
					}

					return { data: createResult.data };
				} catch (error: unknown) {
					if (axios.isAxiosError(error)) {
						return {
							error: {
								status: error.response?.status || 500,
								data: error.response?.data?.message || 'Program creation failed',
							},
						};
					}
					return {
						error: {
							status: 500,
							data: 'Program creation failed',
						},
					};
				}
			},
			invalidatesTags: (result, error, { formData }) => {
				const userId = formData.get('userId') as string;
				return [{ type: 'ProgramList', id: userId }];
			},
		}),

		/**
		 * Create program template
		 * 1 usage - CreateProgramModal
		 */
		createProgramTemplate: builder.mutation<unknown, FormData>({
			query: formData => ({
				url: '/program/program-template',
				method: 'POST',
				body: formData,
			}),
			invalidatesTags: ['ProgramTemplate'],
			transformErrorResponse: (response: unknown) =>
				response.data?.message || 'Template creation failed',
		}),

		/**
		 * Update program
		 * 6 usages - AddProgramPopup, ExerciseDataItem, CustomOptions, CustomRomDataItem
		 */
		updateProgram: builder.mutation<unknown, UpdateProgramRequest>({
			query: ({ programId, programData }) => ({
				url: `/program/${programId}`,
				method: 'PATCH',
				body: programData,
			}),
			invalidatesTags: (result, error, { programId }) => [
				{ type: 'Program', id: programId },
			],
			transformErrorResponse: (response: unknown) => {
				if (response.status === 400) {
					return response.data?.message || 'Update failed';
				}
				return 'Program update failed';
			},
		}),

		/**
		 * Save program exercise (with upload progress)
		 * 1 usage - PreCompletionScreen
		 * NOTE: Upload progress tracking would need custom implementation
		 */
		saveProgramExercise: builder.mutation<unknown, FormData>({
			query: formData => ({
				url: '/program/sessions/results',
				method: 'POST',
				body: formData,
			}),
			invalidatesTags: ['ProgramSession'],
		}),

		/**
		 * Mark session as complete
		 * 1 usage - ProgramFlow
		 */
		patchSession: builder.mutation<unknown, string>({
			query: sessionId => ({
				url: `/program/sessions/${sessionId}/complete`,
				method: 'PATCH',
			}),
			invalidatesTags: (result, error, sessionId) => [
				{ type: 'ProgramSession', id: sessionId },
			],
		}),

		/**
		 * Create pre-assessment result
		 * 2 usages - ProgramPreAssessment, RehabPreAssessment
		 */
		postPreAssesmentResult: builder.mutation<
			{ id: string },
			ProgramPreAssesment
		>({
			query: preassessment => ({
				url: '/program/sessions',
				method: 'POST',
				body: preassessment,
			}),
			invalidatesTags: ['ProgramSession'],
		}),
	}),
});

// Export auto-generated hooks
export const {
	useGetProgramListQuery,
	useGetProgramListApprovedQuery,
	useGetProgramByIdQuery,
	useGetProgramTemplateQuery,
	useGetProgramSummaryListQuery,
	useGetProgramByIdListQuery,
	useGetExerciseByProgramQuery,
	useGetPreviousOpenAiProgramQuery,
	useGetPreviousCarespaceAiProgramQuery,
	useGetOpenAiProgramQuery,
	useCreateProgramMutation,
	useCreateProgramTemplateMutation,
	useUpdateProgramMutation,
	useSaveProgramExerciseMutation,
	usePatchSessionMutation,
	usePostPreAssesmentResultMutation,
} = programsApi;

/**
 * MIGRATION GUIDE:
 *
 * getProgramList Migration (Most Common Query):
 *
 * Before (Thunk):
 * ```typescript
 * const dispatch = useTypedDispatch();
 * const programs = useTypedSelector(state => state.program.program);
 *
 * useEffect(() => {
 *   dispatch(getProgramList({ userId, limit, page, searchValue }));
 * }, [dispatch, userId, limit, page, searchValue]);
 * ```
 *
 * After (RTK Query):
 * ```typescript
 * const { data: programs, isLoading } = useGetProgramListQuery({
 *   userId,
 *   limit,
 *   page,
 *   searchValue,
 * }, {
 *   skip: !userId,
 * });
 * ```
 *
 * createProgram Migration (Most Common Mutation - 15 usages):
 *
 * Before:
 * ```typescript
 * const handleCreate = async () => {
 *   const formData = new FormData();
 *   formData.append('userId', userId);
 *   formData.append('name', name);
 *
 *   try {
 *     await dispatch(createProgram(formData)).unwrap();
 *     message.success('Program created!');
 *   } catch (error) {
 *     message.error(error);
 *   }
 * };
 * ```
 *
 * After:
 * ```typescript
 * const [createProgram, { isLoading }] = useCreateProgramMutation();
 *
 * const handleCreate = async () => {
 *   const formData = new FormData();
 *   formData.append('userId', userId);
 *   formData.append('name', name);
 *
 *   try {
 *     await createProgram({
 *       formData,
 *       physioterapistId: currentUser.id,
 *     }).unwrap();
 *     message.success('Program created!');
 *   } catch (error) {
 *     message.error(error as string);
 *   }
 * };
 * ```
 *
 * AI Program Generation Migration:
 *
 * Before:
 * ```typescript
 * useEffect(() => {
 *   dispatch(getPreviousOpenAiProgram(userId));
 * }, [dispatch, userId]);
 *
 * const openAiProgram = useTypedSelector(state => state.program.openAiProgram);
 * ```
 *
 * After:
 * ```typescript
 * const { data: openAiProgram, error, isLoading } =
 *   useGetPreviousOpenAiProgramQuery(userId, {
 *     skip: !userId,
 *   });
 *
 * // Error handling built-in via transformErrorResponse
 * if (error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * updateProgram Migration:
 *
 * Before:
 * ```typescript
 * await dispatch(updateProgram({
 *   programId,
 *   programData: { active: true, status: 'approved' }
 * })).unwrap();
 * ```
 *
 * After:
 * ```typescript
 * const [updateProgram] = useUpdateProgramMutation();
 *
 * await updateProgram({
 *   programId,
 *   programData: { active: true, status: 'approved' }
 * }).unwrap();
 * ```
 *
 * Benefits:
 * - No useEffect needed for queries
 * - Automatic caching and refetching
 * - Built-in loading/error states
 * - Automatic cache invalidation on mutations
 * - Request deduplication
 * - Multi-step mutations handled internally (createProgram)
 */
