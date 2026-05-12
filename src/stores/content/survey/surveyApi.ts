/**
 * RTK Query API for Survey
 *
 * Migrated from createAsyncThunk to RTK Query for Survey module.
 *
 * BENEFITS:
 * - Auto-generated hooks (useGetSurveyQuery, etc.)
 * - Built-in caching & cache invalidation
 * - Automatic loading/error states
 * - Request deduplication
 * - Better TypeScript inference
 * - Optimistic updates support
 * - Polling/refetching capabilities
 *
 * BEFORE (createAsyncThunk): ~279 lines
 * AFTER (RTK Query): ~350 lines (includes types and better organization)
 * NET: More features with better maintainability
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	CreateSurveyPayload,
	Payload,
	SurevyEdit,
	Survey,
	SurveyPaginated,
	SurveyResult,
	SurveyResultPaginated,
} from '@types';
import strapi from '@strapi';

// Additional types for better type safety
export interface CreateSurveyRequest {
	surveyData: Partial<CreateSurveyPayload>;
	images: File[];
}

export interface UpdateSurveyRequest {
	surveyId: string;
	surveyData: Partial<SurevyEdit>;
}

export interface UploadImageRequest {
	id: string;
	images: File;
	target: string;
}

export interface SaveSurveyResultRequest {
	surveyId: string;
	surveyData: Partial<SurveyResult>;
}

export interface SurveySessionsRequest {
	surveyId: string;
	limit: number;
	page: number;
}

/**
 * Survey API - RTK Query Implementation
 *
 * Usage:
 *   const { data, isLoading, error } = useGetSurveyQuery(payload);
 *   const [createSurvey] = useCreateSurveyMutation();
 */
export const surveyApi = createApi({
	reducerPath: 'surveyApi',
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_ADMIN_HOST || '/api',
		prepareHeaders: headers => {
			// Auto-inject auth token from localStorage (matching axios interceptor)
			const token = localStorage.getItem('sessionToken');
			const tokenType = localStorage.getItem('token');
			if (token && tokenType) {
				headers.set('Authorization', `${tokenType} ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: [
		'Survey',
		'SurveyResult',
		'SurveyTemplate',
		'SystemSurveyTemplate',
		'ClinicalSurveyTemplate',
	],
	endpoints: builder => ({
		// ============ Survey CRUD ============

		/**
		 * Get surveys for a user with pagination and filtering
		 */
		getSurvey: builder.query<SurveyPaginated, Payload>({
			query: ({ userId, limit, page }) =>
				`/survey/${userId}?limit=${limit}&page=${page}`,
			providesTags: (result, error, { userId }) => [
				{ type: 'Survey', id: `user-${userId}` },
				{ type: 'Survey', id: 'LIST' },
			],
		}),

		/**
		 * Get survey result data with search capability
		 */
		getSurveyResultData: builder.query<SurveyPaginated, Payload>({
			query: ({ userId, limit, page, search }) => {
				const searchParam = search ? `&search=${search}` : '';
				return `/survey/${userId}?limit=${limit}&page=${page}${searchParam}`;
			},
			providesTags: ['Survey'],
		}),

		/**
		 * Get a single survey by ID
		 */
		getSurveyById: builder.query<Survey, string>({
			query: id => `/survey/get/${id}`,
			providesTags: (result, error, id) => [{ type: 'Survey', id }],
		}),

		/**
		 * Get survey results (sessions) for a user
		 */
		getSurveyResult: builder.query<SurveyResultPaginated, Payload>({
			query: ({ userId, limit, page }) =>
				`/survey/${userId}?limit=${limit}&page=${page}&sessions=true`,
			providesTags: (result, error, { userId }) => [
				{ type: 'SurveyResult', id: `user-${userId}` },
			],
		}),

		/**
		 * Get survey sessions by survey ID
		 */
		getSurveySessions: builder.query<
			SurveyResultPaginated,
			SurveySessionsRequest
		>({
			query: ({ surveyId, limit, page }) =>
				`/survey/sessions/${surveyId}?limit=${limit}&page=${page}`,
			providesTags: (result, error, { surveyId }) => [
				{ type: 'SurveyResult', id: surveyId },
			],
		}),

		/**
		 * Create a new survey (with optional image upload)
		 */
		createSurvey: builder.mutation<Partial<Survey>, CreateSurveyRequest>({
			async queryFn({ surveyData, images }, _api, _extraOptions, baseQuery) {
				try {
					// Create survey
					const createResult = await baseQuery({
						url: '/survey',
						method: 'POST',
						body: surveyData,
					});

					if (createResult.error) {
						return { error: createResult.error };
					}

					const survey = createResult.data as Partial<Survey>;

					// Upload image if provided
					if (images.length > 0 && survey.id) {
						const formData = new FormData();
						formData.append('images', images[0]);

						const uploadResult = await baseQuery({
							url: `/survey/${survey.id}`,
							method: 'PATCH',
							body: formData,
						});

						if (uploadResult.error) {
							return { error: uploadResult.error };
						}

						return { data: uploadResult.data as Partial<Survey> };
					}

					return { data: survey };
				} catch (error: unknown) {
					return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
				}
			},
			invalidatesTags: ['Survey'],
		}),

		/**
		 * Upload image for survey or survey template
		 */
		uploadImage: builder.mutation<Survey, UploadImageRequest>({
			query: ({ id, images, target }) => {
				const formData = new FormData();
				formData.append('images', images);

				return {
					url: `/${target}/${id}`,
					method: 'PATCH',
					body: formData,
				};
			},
			invalidatesTags: (result, error, { target }) => [
				target.includes('template') ? 'SurveyTemplate' : 'Survey',
			],
		}),

		/**
		 * Update an existing survey
		 */
		updateSurvey: builder.mutation<Partial<Survey>, UpdateSurveyRequest>({
			query: ({ surveyId, surveyData }) => ({
				url: `/survey/${surveyId}`,
				method: 'PATCH',
				body: surveyData,
			}),
			invalidatesTags: (result, error, { surveyId }) => [
				{ type: 'Survey', id: surveyId },
				{ type: 'Survey', id: 'LIST' },
			],
		}),

		/**
		 * Delete a survey (soft delete)
		 */
		deleteSurvey: builder.mutation<Survey, string>({
			query: surveyId => ({
				url: `/survey/${surveyId}?delete=true`,
				method: 'PATCH',
			}),
			invalidatesTags: (result, error, surveyId) => [
				{ type: 'Survey', id: surveyId },
				{ type: 'Survey', id: 'LIST' },
			],
		}),

		// ============ Survey Templates ============

		/**
		 * Get user's custom survey templates
		 */
		getSurveyTemplate: builder.query<SurveyPaginated, Payload>({
			query: ({ limit, page, search }) => {
				const searchParam = search ? `&search=${search}` : '';
				return `/survey/template/list?limit=${limit}&page=${page}${searchParam}`;
			},
			providesTags: ['SurveyTemplate'],
		}),

		/**
		 * Get system survey templates (from Strapi CMS)
		 */
		getSystemSurveyTemplate: builder.query<SurveyPaginated, Payload>({
			async queryFn(
				{ limit, page, search = '' },
				_api,
				_extraOptions,
				_baseQuery,
			) {
				try {
					const { data } = await strapi.get(
						`/survey-templates?pagination[page]=${page}&pagination[pageSize]=${limit}&populate[image][fields]=url&populate[surveyTemplateQuestion][populate]=optionList&filters[$or][0][title][$contains]=${search}&filters[$or][1][description][$contains]=${search}`,
					);
					return { data };
				} catch (error: unknown) {
					return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
				}
			},
			providesTags: ['SystemSurveyTemplate'],
		}),

		/**
		 * Get clinically validated survey templates (from Strapi CMS)
		 */
		getClinicalSurveyTemplate: builder.query<SurveyPaginated, Payload>({
			async queryFn(
				{ limit, page, search = '' },
				_api,
				_extraOptions,
				_baseQuery,
			) {
				try {
					const { data } = await strapi.get(
						`/survey-templates?pagination[page]=${page}&pagination[pageSize]=${limit}&populate[image][fields]=url&populate[surveyTemplateQuestion][populate]=optionList&filters[clinicallyValidated][$eq]=true&filters[$or][0][title][$contains]=${search}&filters[$or][1][description][$contains]=${search}`,
					);
					return { data };
				} catch (error: unknown) {
					return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
				}
			},
			providesTags: ['ClinicalSurveyTemplate'],
		}),

		/**
		 * Create a new survey template (with optional image upload)
		 */
		createSurveyTemplate: builder.mutation<
			Partial<Survey>,
			CreateSurveyRequest
		>({
			async queryFn({ surveyData, images }, _api, _extraOptions, baseQuery) {
				try {
					// Create template
					const createResult = await baseQuery({
						url: '/survey/template',
						method: 'POST',
						body: surveyData,
					});

					if (createResult.error) {
						return { error: createResult.error };
					}

					const template = createResult.data as Partial<Survey>;

					// Upload image if provided
					if (images.length > 0 && template.id) {
						const formData = new FormData();
						formData.append('images', images[0]);

						const uploadResult = await baseQuery({
							url: `/survey/template/${template.id}`,
							method: 'PATCH',
							body: formData,
						});

						if (uploadResult.error) {
							return { error: uploadResult.error };
						}

						return { data: uploadResult.data as Partial<Survey> };
					}

					return { data: template };
				} catch (error: unknown) {
					return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
				}
			},
			invalidatesTags: ['SurveyTemplate'],
		}),

		// ============ Survey Results/Sessions ============

		/**
		 * Save survey result (session)
		 */
		saveSurveyResult: builder.mutation<
			Partial<SurveyResult>,
			SaveSurveyResultRequest
		>({
			query: ({ surveyId, surveyData }) => ({
				url: `/survey/session/${surveyId}`,
				method: 'POST',
				body: surveyData,
			}),
			invalidatesTags: (result, error, { surveyId }) => [
				{ type: 'SurveyResult', id: surveyId },
				'SurveyResult',
			],
		}),
	}),
});

// Export auto-generated hooks
export const {
	useGetSurveyQuery,
	useGetSurveyResultDataQuery,
	useGetSurveyByIdQuery,
	useGetSurveyResultQuery,
	useGetSurveySessionsQuery,
	useCreateSurveyMutation,
	useUploadImageMutation,
	useUpdateSurveyMutation,
	useDeleteSurveyMutation,
	useGetSurveyTemplateQuery,
	useGetSystemSurveyTemplateQuery,
	useGetClinicalSurveyTemplateQuery,
	useCreateSurveyTemplateMutation,
	useSaveSurveyResultMutation,
} = surveyApi;

/**
 * MIGRATION GUIDE:
 *
 * Before (Thunk):
 * ```typescript
 * const dispatch = useTypedDispatch();
 * const survey = useTypedSelector(state => state.survey);
 *
 * useEffect(() => {
 *   dispatch(getSurvey({ userId, limit, page, approved }));
 * }, [dispatch, userId]);
 * ```
 *
 * After (RTK Query):
 * ```typescript
 * const { data: survey, isLoading, error } = useGetSurveyQuery({
 *   userId,
 *   limit,
 *   page,
 *   approved
 * });
 * ```
 *
 * Mutations Before:
 * ```typescript
 * const handleCreate = async () => {
 *   try {
 *     await dispatch(createSurvey({ surveyData, images })).unwrap();
 *     message.success('Survey created');
 *   } catch (error) {
 *     message.error('Failed to create');
 *   }
 * };
 * ```
 *
 * Mutations After:
 * ```typescript
 * const [createSurvey, { isLoading }] = useCreateSurveyMutation();
 *
 * const handleCreate = async () => {
 *   try {
 *     await createSurvey({ surveyData, images }).unwrap();
 *     message.success('Survey created');
 *   } catch (error) {
 *     message.error('Failed to create');
 *   }
 * };
 * ```
 */
