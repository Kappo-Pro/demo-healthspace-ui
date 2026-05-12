/**
 * api.ts
 *
 * API request/response and pagination types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 25
 */

// ============================================================================
// API TYPES (25 declarations)
// ============================================================================

export interface UpdateStatusBody {
	sessionId: string;
	body: {
		status: Status;
	};
}

export type IPaginationPluginDefaultResponse = {
	isFirstPage: boolean;
	isLastPage: boolean;
	currentPage: number;
	previousPage: number | null;
	nextPage: number | null;
	pageCount: number;
	totalCount: number;
};

export interface DefaultPagination {
	limit?: number;
	page?: number;
}

export interface PaginationDefaultResponse {
	total: number;
	pageCount: number;
	currentPage: number;
	perPage: number;
	from: number;
	to: number;
}

export interface ReportsFindAllSearch extends DefaultPagination {
	readonly search?: string;
}

export interface PaginationAndSort extends DefaultPagination {
	sort?: Sort;
}

export interface ReportPaginatedResponse {
	data: Report[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface SurveyPaginated {
	data: Survey[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface SurveyTemplatePaginated {
	data: SurveyTemplate[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface SurveyResultPaginated {
	data: SurveyResult[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface SurveyResponse {
	survey: SurveyPaginated;
	surveyTemplate: {
		myTemplate: {
			data: Survey[] | null;
			pagination: IPaginationPluginDefaultResponse | null;
		};
		systemTemplate: {
			data: Survey[] | null;
			pagination: IPaginationPluginDefaultResponse | null;
		};
		clinicalTemplate: {
			data: Survey[] | null;
			pagination: IPaginationPluginDefaultResponse | null;
		};
	};
	surveyResult: SurveyResultPaginated;
}

export interface StrapiPagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface IPagination extends DefaultPagination {
	totalDocs: number;
	offset: number;
	totalPages: number;
	pagingCounter: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
	prevPage: number | null;
	nextPage: number;
}

export interface PaginationMeta {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	startCursor: string | null;
	endCursor: string | null;
}

export interface ActivityStreamResponse {
	data: ActivityStreamData[];
	pagination: PaginationMeta;
}

export interface ActivityStreamHistoryResponse {
	unreadCount: number;
	activities: ActivityStreamData[];
}

export interface ActivityStreamPostResponse {
	success: boolean;
	activityStream: ActivityStreamData;
}

export interface Payload {
	userId?: string;
	limit: number;
	page: number;
	searchValue?: string;
	search?: string;
	session?: boolean;
	approved?: boolean;
}

export interface QuestionListPayload {
	id: string;
	title: string;
	description?: string;
	questionType?: string;
	scored?: boolean;
	optionList?: SurveyQuestionOptions[];
	deletedOptionList?: { id: string }[];
	order?: number;
}

export interface PaginationMeta {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface ResponseDataNewDashoard {
	data: AdminDashboardPatient[];
	pagination: UserPaginationDefaultResponse;
}

export interface PayloadInterface {
	invitedRole: string;
	users: {
		firstName: string;
		lastName: string;
		email: string;
		mobilePhone: string;
		adminIds: string[];
	}[];
	message: string;
	password: string;
	planType: string;
	tags: string[];
	mustSendEmail: boolean;
}

export interface CreateSurveyPayload {
	userId?: string | number | undefined;
	physioterapistId?: string | number | undefined;
	title: string;
	image: string;
	clinicallyValidated?: boolean;
	description: string;
	instructions: string;
	resultFeedback: string;
	questionList?: {
		create: SurveyQuestionPayload[];
	};
	surveyTemplateQuestion?: {
		create: SurveyQuestionPayload[];
	};
}

export interface SurveyQuestionPayload {
	title: string;
	description: string | undefined;
	questionType: string | undefined;
	scored: boolean | undefined;
	order?: number;
	optionList: {
		create: SurveyOptionPayload[];
	};
}

export interface SurveyOptionPayload {
	id?: string;
	option: string;
	score?: number;
	order?: number;
}
