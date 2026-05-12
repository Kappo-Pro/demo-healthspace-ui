/**
 * RTK Query API for Reports
 *
 * Migrated from createAsyncThunk to RTK Query for Reports module.
 *
 * BENEFITS:
 * - Auto-generated hooks
 * - Built-in caching
 * - Automatic loading/error states
 * - Request deduplication
 * - Optimistic updates support
 *
 * USAGE ANALYSIS (from find-reports-usage.js):
 * - updateReport: 9 usages (32%)
 * - createReport: 8 usages (29%)
 * - updateReportNotes: 6 usages (21%)
 * - getUserReports: 2 usages (7%)
 * - getReport: 2 usages (7%)
 * - createSelectedReport: 1 usage (4%)
 *
 * All 6 thunks are actively used and migrated.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	Report,
	ReportPaginatedResponse,
} from '@types';

/**
 * Request/Response Types
 */

interface GetUserReportsRequest {
	userId: string;
	limit: number;
	page: number;
	search?: string;
	sort?: string;
}

interface CreateReportRequest {
	userId: string;
	reportName?: string;
	romSessionsIds?: string[];
	romResultsIds?: string[];
	postureSessionsIds?: string[];
	programSessionsIds?: string[];
	surveyResultIds?: string[];
	evaluationSessionsIds?: string[];
	exercisesSelectedRows?: string[];
}

interface CreateSelectedReportRequest {
	userId: string;
	reportName?: string;
	romSessionsIds?: string[];
	romResultsIds?: string[];
	postureSessionsIds?: string[];
	programSessionsIds?: string[];
	surveyResultIds?: string[];
	evaluationSessionsIds?: string[];
	exercisesSelectedRows?: string[];
}

interface UpdateReportRequest {
	reportId: string;
	payload: {
		reportName?: string;
		romSessionsIds?: string[];
		romResultsIds?: string[];
		postureSessionsIds?: string[];
		programSessionsIds?: string[];
		surveyResultIds?: string[];
		evaluationSessionsIds?: string[];
		exercisesSelectedRows?: string[];
	};
}

interface UpdateReportNotesRequest {
	reportId: string;
	payload: FormData;
}

/**
 * Reports API - RTK Query Implementation
 *
 * Endpoints:
 * - 3 Queries (GET operations)
 * - 4 Mutations (POST/PATCH operations)
 *
 * Usage:
 *   const { data: reports } = useGetUserReportsQuery({ userId, limit, page });
 *   const [createReport] = useCreateReportMutation();
 *   const [updateReport] = useUpdateReportMutation();
 */
export const reportsApi = createApi({
	reducerPath: 'reportsApi',
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
	tagTypes: ['Report', 'UserReports'],
	endpoints: (builder) => ({
		/**
		 * Get user reports (paginated, with search/sort)
		 * Used in MMainMenu, CoachReport
		 */
		getUserReports: builder.query<ReportPaginatedResponse, GetUserReportsRequest>({
			query: ({ userId, limit, page, search = '', sort = '' }) => {
				const searchParam = search ? `search=${search}` : '';
				return `/reports/users/${userId}?limit=${limit}&page=${page}&sort=${sort}${searchParam ? `&${searchParam}` : ''}`;
			},
			providesTags: (result, error, { userId }) => [
				{ type: 'UserReports', id: userId },
			],
		}),

		/**
		 * Get single report by ID
		 * Used in AddToReports, CoachReport
		 */
		getReport: builder.query<Report, string>({
			query: (reportId) => `/reports/${reportId}`,
			providesTags: (result, error, reportId) => [
				{ type: 'Report', id: reportId },
			],
		}),

		/**
		 * Create report (primary creation endpoint)
		 * Used in Admin/User menus, CreateReportForm, AI Assistant, Contacts
		 * Handles 409 conflict errors for duplicate reports
		 */
		createReport: builder.mutation<Report, CreateReportRequest>({
			query: (payload) => ({
				url: '/reports/create',
				method: 'POST',
				body: payload,
			}),
			invalidatesTags: (result, error, { userId }) => [
				{ type: 'UserReports', id: userId },
			],
			// Transform error to handle 409 conflicts
			transformErrorResponse: (response: unknown) => {
				if (response.status === 409) {
					return response.data?.message || 'Report already exists';
				}
				return 'Something Went Wrong !';
			},
		}),

		/**
		 * Create selected report (alternate creation endpoint)
		 * Used in AddToReports
		 * Handles 409 conflict errors
		 */
		createSelectedReport: builder.mutation<Report, CreateSelectedReportRequest>({
			query: (payload) => ({
				url: '/reports',
				method: 'POST',
				body: payload,
			}),
			invalidatesTags: (result, error, { userId }) => [
				{ type: 'UserReports', id: userId },
			],
			transformErrorResponse: (response: unknown) => {
				if (response.status === 409) {
					return response.data?.message || 'Report already exists';
				}
				return 'Something Went Wrong !';
			},
		}),

		/**
		 * Update report data
		 * MOST USED - 9 usages across Report*Data components
		 * Used in AddToReports, ROM Captures, Report content components
		 */
		updateReport: builder.mutation<Report, UpdateReportRequest>({
			query: ({ reportId, payload }) => ({
				url: `/reports/${reportId}`,
				method: 'PATCH',
				body: payload,
			}),
			invalidatesTags: (result, error, { reportId }) => [
				{ type: 'Report', id: reportId },
			],
		}),

		/**
		 * Update report notes (with multipart/form-data for images)
		 * Used in Report*Data components for notes with image uploads
		 * 6 usages - second most common mutation
		 */
		updateReportNotes: builder.mutation<Report, UpdateReportNotesRequest>({
			query: ({ reportId, payload }) => ({
				url: `/reports/notes/${reportId}`,
				method: 'PATCH',
				body: payload,
				// FormData automatically sets Content-Type with boundary
			}),
			invalidatesTags: (result, error, { reportId }) => [
				{ type: 'Report', id: reportId },
			],
		}),
	}),
});

// Export auto-generated hooks
export const {
	useGetUserReportsQuery,
	useGetReportQuery,
	useCreateReportMutation,
	useCreateSelectedReportMutation,
	useUpdateReportMutation,
	useUpdateReportNotesMutation,
} = reportsApi;

/**
 * MIGRATION GUIDE:
 *
 * getUserReports Migration:
 *
 * Before (Thunk):
 * ```typescript
 * const dispatch = useTypedDispatch();
 * const reports = useTypedSelector(state => state.reports.reports);
 *
 * useEffect(() => {
 *   dispatch(getUserReports({ userId, limit, page, search, sort }));
 * }, [dispatch, userId, limit, page, search, sort]);
 * ```
 *
 * After (RTK Query):
 * ```typescript
 * const { data: reports, isLoading } = useGetUserReportsQuery({
 *   userId,
 *   limit,
 *   page,
 *   search,
 *   sort,
 * }, {
 *   skip: !userId, // Only fetch when userId exists
 * });
 * ```
 *
 * getReport Migration:
 *
 * Before:
 * ```typescript
 * useEffect(() => {
 *   if (reportId) {
 *     dispatch(getReport(reportId));
 *   }
 * }, [dispatch, reportId]);
 * ```
 *
 * After:
 * ```typescript
 * const { data: report } = useGetReportQuery(reportId, {
 *   skip: !reportId,
 * });
 * ```
 *
 * createReport Migration:
 *
 * Before:
 * ```typescript
 * const handleCreate = async () => {
 *   try {
 *     await dispatch(createReport({ userId, reportName })).unwrap();
 *     message.success('Report created!');
 *   } catch (error) {
 *     message.error(error);
 *   }
 * };
 * ```
 *
 * After:
 * ```typescript
 * const [createReport] = useCreateReportMutation();
 *
 * const handleCreate = async () => {
 *   try {
 *     await createReport({ userId, reportName }).unwrap();
 *     message.success('Report created!');
 *   } catch (error) {
 *     message.error(error as string); // transformErrorResponse provides string
 *   }
 * };
 * ```
 *
 * updateReport Migration (Most Common):
 *
 * Before:
 * ```typescript
 * const handleUpdate = async () => {
 *   await dispatch(updateReport({
 *     reportId,
 *     payload: { romSessionsIds }
 *   }));
 * };
 * ```
 *
 * After:
 * ```typescript
 * const [updateReport] = useUpdateReportMutation();
 *
 * const handleUpdate = async () => {
 *   await updateReport({
 *     reportId,
 *     payload: { romSessionsIds }
 *   }).unwrap();
 * };
 * ```
 *
 * updateReportNotes Migration:
 *
 * Before:
 * ```typescript
 * const formData = new FormData();
 * formData.append('notes', notes);
 * formData.append('image', image);
 *
 * await dispatch(updateReportNotes({
 *   reportId,
 *   payload: formData
 * }));
 * ```
 *
 * After:
 * ```typescript
 * const [updateReportNotes] = useUpdateReportNotesMutation();
 *
 * const formData = new FormData();
 * formData.append('notes', notes);
 * formData.append('image', image);
 *
 * await updateReportNotes({
 *   reportId,
 *   payload: formData
 * }).unwrap();
 * ```
 *
 * Benefits:
 * - No useEffect needed for queries
 * - Automatic caching and refetching
 * - Built-in loading/error states
 * - Automatic cache invalidation on mutations
 * - Request deduplication
 * - Better TypeScript support
 */
