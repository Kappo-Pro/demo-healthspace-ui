/**
 * RTK Query API for Settings
 *
 * This is a proof-of-concept migration from createAsyncThunk to RTK Query.
 * Demonstrates the benefits and reduced boilerplate.
 *
 * BENEFITS:
 * - Auto-generated hooks (useGetSettingsQuery, etc.)
 * - Built-in caching & cache invalidation
 * - Automatic loading/error states
 * - Request deduplication
 * - Better TypeScript inference
 * - Optimistic updates support
 * - Polling/refetching capabilities
 *
 * BEFORE (createAsyncThunk): ~449 lines
 * AFTER (RTK Query): ~220 lines
 * SAVINGS: ~51% reduction in code
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	FunctionalGoals,
	Plans,
	PreExistingConditions,
	SelfRegistration,
	TagsDetails,
} from '@types';
import {
	STORAGE_KEY_TOKEN,
	STORAGE_KEY_TYPE,
} from '@constants/authContants';

// Types
export interface PostSettingApiKeyPayload {
	openaiApiKey: string;
	openaiApiKeyActive?: boolean;
}

export interface ThemePayload {
	name: string;
	locked: boolean;
}

export interface ThemeResponse {
	id: string;
	name: string;
	clientId: string;
	createdAt: string;
	updatedAt: string;
	locked: boolean;
}

export interface TemplateResponse {
	templateBody: string;
}

export interface ConsentFormResponse {
	content: string;
}

export interface PlanByUserIdParams {
	userId: string;
	planType: string;
}

export interface PlanByClientIdParams {
	clientId: string;
	planType: string;
}

/**
 * Settings API - RTK Query Implementation
 *
 * Usage:
 *   const { data, isLoading, error } = useGetSettingsQuery();
 *   const [updateTheme] = usePostThemeMutation();
 */
export const settingsApi = createApi({
	reducerPath: 'settingsApi',
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_ADMIN_HOST || '/api',
		prepareHeaders: headers => {
			// Auto-inject auth token from localStorage (matching axios interceptor)
			// Using the same keys as axios interceptor in src/utils/Api.ts
			const token = localStorage.getItem(STORAGE_KEY_TOKEN);
			const tokenType = localStorage.getItem(STORAGE_KEY_TYPE);

			if (token && tokenType) {
				headers.set('Authorization', `${tokenType} ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: [
		'Settings',
		'Theme',
		'EmailTemplate',
		'RomTemplate',
		'InviteTemplate',
		'ConsentForm',
		'Plans',
		'FunctionalGoals',
		'PreExistingConditions',
		'SelfRegistration',
		'Bandwidth',
		'Tags',
	],
	endpoints: builder => ({
		// ============ Settings API Key ============
		getSettings: builder.query<unknown, void>({
			query: () => '/settings',
			providesTags: ['Settings'],
		}),

		postSettings: builder.mutation<unknown, string>({
			query: openaiApiKey => ({
				url: '/settings',
				method: 'POST',
				body: openaiApiKey,
			}),
			invalidatesTags: ['Settings'],
		}),

		patchSettings: builder.mutation<
			unknown,
			{ settingsId: string; payload: PostSettingApiKeyPayload }
		>({
			query: ({ settingsId, payload }) => ({
				url: `/settings/${settingsId}`,
				method: 'PATCH',
				body: payload,
			}),
			invalidatesTags: ['Settings'],
		}),

		// ============ Theme ============
		getTheme: builder.query<ThemeResponse, void>({
			query: () => '/settings/themes',
			providesTags: ['Theme'],
		}),

		postTheme: builder.mutation<ThemeResponse, ThemePayload>({
			query: payload => ({
				url: '/settings/themes',
				method: 'POST',
				body: payload,
			}),
			invalidatesTags: ['Theme'],
		}),

		// ============ Email Templates ============
		getEmailTemplate: builder.query<TemplateResponse, void>({
			query: () => '/settings/templates/email',
			providesTags: ['EmailTemplate'],
		}),

		postEmailTemplate: builder.mutation<unknown, string>({
			query: template => ({
				url: '/settings/templates/email',
				method: 'POST',
				body: { templateBody: template },
			}),
			invalidatesTags: ['EmailTemplate'],
		}),

		// ============ ROM Email Template ============
		getRomEmailTemplate: builder.query<TemplateResponse, void>({
			query: () => '/settings/templates/email/rom',
			providesTags: ['RomTemplate'],
		}),

		postRomEmailTemplate: builder.mutation<TemplateResponse, string>({
			query: template => ({
				url: '/settings/templates/email/rom',
				method: 'POST',
				body: { templateBody: template },
			}),
			invalidatesTags: ['RomTemplate'],
		}),

		// ============ Invite Template ============
		getInviteTemplate: builder.query<TemplateResponse, void>({
			query: () => '/settings/templates/invite',
			providesTags: ['InviteTemplate'],
		}),

		postInviteTemplate: builder.mutation<unknown, string>({
			query: template => ({
				url: '/settings/templates/invite',
				method: 'POST',
				body: { templateBody: template },
			}),
			invalidatesTags: ['InviteTemplate'],
		}),

		// ============ Consent Form ============
		getConsentForm: builder.query<ConsentFormResponse, void>({
			query: () => '/settings/consent-policy',
			providesTags: ['ConsentForm'],
		}),

		postConsentForm: builder.mutation<ConsentFormResponse, string>({
			query: template => ({
				url: '/settings/consent-policy',
				method: 'POST',
				body: { content: template },
			}),
			invalidatesTags: ['ConsentForm'],
		}),

		// ============ Bandwidth ============
		getBandwidth: builder.query<{ networkIssue: boolean }, void>({
			query: () => '/settings/network',
			providesTags: ['Bandwidth'],
		}),

		postBandwidth: builder.mutation<unknown, { networkIssue: boolean }>({
			query: payload => ({
				url: '/settings/network',
				method: 'POST',
				body: payload,
			}),
			invalidatesTags: ['Bandwidth'],
		}),

		// ============ Self Registration ============
		getSelfRegistration: builder.query<SelfRegistration, void>({
			query: () => '/settings/self-registration/status',
			providesTags: ['SelfRegistration'],
		}),

		postSelfRegistration: builder.mutation<unknown, { active: boolean }>({
			query: payload => ({
				url: '/settings/self-registration/status',
				method: 'POST',
				body: payload,
			}),
			invalidatesTags: ['SelfRegistration'],
		}),

		// ============ Plans ============
		getPlanByPlanType: builder.query<Plans, string>({
			query: planType => `/settings/plans/templates?plan=${planType}`,
			providesTags: (result, error, planType) => [
				{ type: 'Plans', id: planType },
			],
		}),

		getPlansByUserId: builder.query<Plans, string>({
			query: userId => `/plans/users/${userId}`,
			providesTags: (result, error, userId) => [
				{ type: 'Plans', id: `user-${userId}` },
			],
		}),

		postPlan: builder.mutation<Plans, FormData>({
			query: formData => ({
				url: '/settings/plans/templates',
				method: 'POST',
				body: formData,
			}),
			invalidatesTags: ['Plans'],
		}),

		postPlanByUserId: builder.mutation<unknown, PlanByUserIdParams>({
			query: ({ userId, planType }) => ({
				url: `/plans/users/${userId}`,
				method: 'POST',
				body: { planType },
			}),
			invalidatesTags: (result, error, { userId }) => [
				{ type: 'Plans', id: `user-${userId}` },
			],
		}),

		updatePlanByUserId: builder.mutation<unknown, PlanByUserIdParams>({
			query: ({ userId, planType }) => ({
				url: `/plans/users/${userId}`,
				method: 'PATCH',
				body: { planType },
			}),
			invalidatesTags: (result, error, { userId }) => [
				{ type: 'Plans', id: `user-${userId}` },
			],
		}),

		getPlansByClientId: builder.query<Plans, void>({
			query: () => 'settings/plans/client',
			providesTags: [{ type: 'Plans', id: 'client' }],
		}),

		postPlanByClientId: builder.mutation<unknown, PlanByClientIdParams>({
			query: ({ clientId, planType }) => ({
				url: 'settings/plans/client',
				method: 'POST',
				body: { clientId, planType },
			}),
			invalidatesTags: [{ type: 'Plans', id: 'client' }],
		}),

		// ============ Functional Goals ============
		getFunctionalGoalById: builder.query<FunctionalGoals, number>({
			query: id => `/settings/functional-goals?functionalGoalId=${id}`,
			providesTags: (result, error, id) => [{ type: 'FunctionalGoals', id }],
		}),

		postFunctionalGoal: builder.mutation<FunctionalGoals, FormData>({
			query: formData => ({
				url: '/settings/functional-goals',
				method: 'POST',
				body: formData,
			}),
			invalidatesTags: ['FunctionalGoals'],
		}),

		// ============ Pre-Existing Conditions ============
		getPreExistingConditions: builder.query<PreExistingConditions, void>({
			query: () => '/settings/pre-existing-conditions',
			providesTags: ['PreExistingConditions'],
		}),

		postPreExistingConditions: builder.mutation<
			PreExistingConditions,
			FormData
		>({
			query: formData => ({
				url: '/settings/pre-existing-conditions',
				method: 'POST',
				body: formData,
			}),
			invalidatesTags: ['PreExistingConditions'],
		}),

		// ============ Tags ============
		getTags: builder.query<TagsDetails[], void>({
			query: () => '/settings/tags',
			providesTags: result =>
				result
					? [
							...result.map(({ id }) => ({ type: 'Tags' as const, id })),
							{ type: 'Tags', id: 'LIST' },
						]
					: [{ type: 'Tags', id: 'LIST' }],
		}),

		postTag: builder.mutation<unknown, { name: string }>({
			query: payload => ({
				url: '/settings/tags',
				method: 'POST',
				body: payload,
			}),
			invalidatesTags: [{ type: 'Tags', id: 'LIST' }],
		}),

		deleteTag: builder.mutation<unknown, string>({
			query: tagId => ({
				url: `/settings/tags/${tagId}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, tagId) => [
				{ type: 'Tags', id: tagId },
				{ type: 'Tags', id: 'LIST' },
			],
		}),
	}),
});

// Export auto-generated hooks
export const {
	useGetSettingsQuery,
	usePostSettingsMutation,
	usePatchSettingsMutation,
	useGetThemeQuery,
	usePostThemeMutation,
	useGetEmailTemplateQuery,
	usePostEmailTemplateMutation,
	useGetRomEmailTemplateQuery,
	usePostRomEmailTemplateMutation,
	useGetInviteTemplateQuery,
	usePostInviteTemplateMutation,
	useGetConsentFormQuery,
	usePostConsentFormMutation,
	useGetBandwidthQuery,
	usePostBandwidthMutation,
	useGetSelfRegistrationQuery,
	usePostSelfRegistrationMutation,
	useGetPlanByTypeQuery,
	useGetPlansByUserIdQuery,
	usePostPlanMutation,
	usePostPlanByUserIdMutation,
	useUpdatePlanByUserIdMutation,
	useGetPlansByClientIdQuery,
	usePostPlanByClientIdMutation,
	useGetFunctionalGoalByIdQuery,
	usePostFunctionalGoalMutation,
	useGetPreExistingConditionsQuery,
	usePostPreExistingConditionsMutation,
	useGetTagsQuery,
	usePostTagMutation,
	useDeleteTagMutation,
} = settingsApi;

/**
 * MIGRATION GUIDE:
 *
 * Before (Thunk):
 * ```typescript
 * const dispatch = useTypedDispatch();
 * const settings = useTypedSelector(state => state.settings);
 *
 * useEffect(() => {
 *   dispatch(getSettings());
 * }, [dispatch]);
 *
 * if (settings.loading) return <Loading />;
 * if (settings.error) return <Error />;
 * ```
 *
 * After (RTK Query):
 * ```typescript
 * const { data, isLoading, error } = useGetSettingsQuery();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * ```
 *
 * Mutations Before:
 * ```typescript
 * const handleSubmit = async () => {
 *   try {
 *     await dispatch(postTheme({ name, locked })).unwrap();
 *     message.success('Theme saved');
 *   } catch (error) {
 *     message.error('Failed to save');
 *   }
 * };
 * ```
 *
 * Mutations After:
 * ```typescript
 * const [postTheme, { isLoading }] = usePostThemeMutation();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await postTheme({ name, locked }).unwrap();
 *     message.success('Theme saved');
 *   } catch (error) {
 *     message.error('Failed to save');
 *   }
 * };
 * ```
 */
