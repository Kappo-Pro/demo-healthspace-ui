import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { CanvasState } from '@pages/ImageAnnotation/types';
import { Dispatch, ReactNode, SetStateAction } from 'react';
export enum BodyRegion {
	full = 'full',
	upperBody = 'upperBody',
	upperRight = 'upperRight',
	upperLeft = 'upperLeft',
	lowerBody = 'lowerBody',
	lowerRight = 'lowerRight',
	lowerLeft = 'lowerLeft',
}
export interface TFormDataType {
	userId: string;
	strapiBodyPointId: number;
	strapiAggravatingFactorsIds: [];
	strapiRelievingFactorsIds: [];
	strapiPainCausesIds: [];
	strapiPainDurationId: number;
	strapiPainFrequencyId: number;
	strapiPainStatusId: number;
}

export interface TProfileData {
	firstName: string;
	lastName: string;
	email: string;
	imageUrl: string;
	birthDate?: string;
	gender: string;
	imperialHeight: number;
	imperialWeight: number;
	metricWeight: number;
	metricHeight: number;
	isPregnant: boolean;
	consentPolicyRead: boolean;
	patientId: string;
	role?: string;
}

export interface FunctionalGoalsProps {
	functionalGoalsIds: number[];
}

export type IBodyRegionNormalized = Record<BodyRegion, string>;
export interface FeatureProps {
	title: string;
	description: string;
	buttonText: string;
	imageSrc: string;
	onClick: () => void;
	logoSrc: string;
	disabled: boolean;
}

export enum Status {
	newPatients = 'newPatients',
	outOfParams = 'outOfParams',
	pendingReview = 'pendingReview',
	reviewed = 'reviewed',
	escalationRequired = 'escalationRequired',
	followUpRequired = 'followUpRequired',
}

export enum StatusPatients {
	unAssignedPatients = 'unAssignedPatients',
	pendingInvites = 'pendingInvites',
	registeredPatients = 'registeredPatients',
	consentFormPatients = 'consentFormPatients',
}

export type IStatusNormalized = Record<Status, string>;

export type IStatusNormalizedPatients = Record<StatusPatients, string>;

export interface Session {
	userId: string;
	surveyResult: SurveyResult[];
	programSession: SurveyResult[];
	strapiOmniRomExerciseGroup: IStrapiOmniRomExerciseGroup;
	id: string;
	createdAt: Date;
	bodyRegion?: BodyRegion;
	status: Status;
	questionList?: SurveyResultQuestionList[];
	surveyId?: string;
	programId?: string;
	customRomId: string;
	customRomExerciseId: string;
	customRomSessionExercise: CustomRomSessionExercise[];
}

export interface IStrapiOmniRomExerciseGroup {
	id: number;
	name: string;
}

export interface UserWithSession {
	profile: userData;
	id: string;
	romSessions?: Session[];
	program?: Session[];
	evaluationSession?: Session[];
	survey?: Session[];
}

export interface UserPaginationDefaultResponse
	extends IPaginationPluginDefaultResponse {
	total?: number;
}

export interface UserRegisterdPatientResponse
	extends IPaginationPluginDefaultResponse {
	total?: number;
	userId?: string;
	name?: string;
	role?: string;
	tags?: string[];
}
interface IRomRehab {
	users: UserWithSession[];
	pagination: UserPaginationDefaultResponse;
	statusToRefresh: Status[];
}
export type IOminiRom = IRomRehab;

export type IRehab = IRomRehab;

export type IEvaluationData = IRomRehab;

export type ISurveyData = IRomRehab;

export type IPostureDataStatus = IRomRehab;

export interface StatusStoreState {
	vitalscan-rom: IOminiRom;
	rehab: IRehab;
	evaluation: IEvaluationData;
	survey: ISurveyData;
	postures: IPostureDataStatus;
}

export interface AdminPatientData {
	data: [];
	pagination: UserPaginationDefaultResponse;
}

export interface NewAdminPatientsList {
	unAssignedPatients: AdminPatientData;
	pendingInvites: AdminPatientData;
	registeredPatients: AdminPatientData;
	consentFormPatients: AdminPatientData;
	allAdminList: ResponseDataNewDashoard;
	loading: boolean;
	adminLoader: boolean;
	unAssignedLoader: boolean;
	unAssignedCount: number;
	pendingCount: number;
	registeredCount: number;
	assignedCount: number;
	consentFormCount: number;
	statsCount: {
		newUsers: number;
		pendingReview: {
			evaluation: number;
			omniRom: number;
			letsMove: number;
			survey: number;
		};
		outOfParams: {
			evaluation: number;
			omniRom: number;
			letsMove: number;
			survey: number;
		};
		followUpRequired: {
			evaluation: number;
			omniRom: number;
			letsMove: number;
			survey: number;
		};
		escalationRequired: {
			evaluation: number;
			omniRom: number;
			letsMove: number;
			survey: number;
		};
		reviewed: {
			evaluation: number;
			omniRom: number;
			letsMove: number;
			survey: number;
		};
	};
}
export interface SessionResponsePayload {
	data: UserWithSession[];
	pagination: UserPaginationDefaultResponse;
}

interface IGeneralDetails {
	id: string;
	userId: string;
	bodyRegion?: BodyRegion;
	status: Status;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UpdateSessionStatusResponsePayload extends IGeneralDetails {
	rehabPatientListExercises?: {
		userId: string;
	};
}

export interface UpdateProgramStatusResponsePayload extends IGeneralDetails {
	program?: {
		userId: string;
	};
}

export interface UpdateEvaluationStatusResponsePayload extends IGeneralDetails {
	evaluation?: {
		userId: string;
	};
}

export interface UpdateStatusBody {
	sessionId: string;
	body: {
		status: Status;
	};
}

export enum FacingMode {
	USER = 'user',
	ENVIRONMENT = 'environment',
}

export enum RehabVideoState {
	START = 'START',
	READY = 'READY',
	SAVING = 'SAVING',
	RECORDING = 'RECORDING',
	STOPPED = 'STOPPED',
	REPLAYING = 'REPLAYING',
	RATING = 'RATING',
}

export interface RebhabProgramExercise {
	id: string | number;
	name: string;
	video: Blob;
	programSessionId: string;
	programExerciseId: string;
	exerciseDifficultyLevel: string | number;
}

export interface FunctionalGoals {
	id: number;
	attributes: {
		name: string;
		createdAt: Date;
		updatedAt: Date;
		publishedAt: Date;
	};
}

export interface DiagnosisCode {
	id: number;
	code: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
	publishedAt: Date;
	locale: string;
}

export interface ClientCreate {
	name: string;
	domain: string;
	fusionAuthAppId: string;
	fusionAuthTenantId: string;
	inviteCode: string;
}

export interface IClient extends ClientCreate {
	id: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
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

export interface AllAdminPayload {
	limit?: number;
	page?: number;
	name?: string;
}

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

export enum UserToolStatusEnum {
	assignRehab,
	assignedRehab,
}

export enum OverallConditionEnum {
	improving,
	noChange,
	worsening,
}

export interface EvaluationBodyPoint {
	id: number;
	attributes: {
		name: string;
		position: string;
	};
}

export interface IEvaluation {
	id: string;
	user?: User;
	userId: string;
	active: boolean;
	painAssessments?: EvaluationPainAssessment[];
	healthSigns?: EvaluationHealthSigns;
	medicalHistories?: EvaluationMedicalHistory;
	createdAt: Date;
	updatedAt: Date;
}

export interface EvaluationPaginated {
	data: IEvaluation[];
	pagination: PaginationDefaultResponse;
}
export interface StrapiGeneral {
	id: number;
	name: string;
	locale?: string;
}
export type IStrapiHealthSign = StrapiGeneral;

export type IStrapiMedicalHistory = StrapiGeneral;

interface Evaluation {
	id: string;
	user?: User;
	userId: string;
	notes?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface EvaluationHealthSigns extends Evaluation {
	strapiHealthSignsIds: number[];
	strapiHealthSigns?: IStrapiHealthSign[];
}

export interface EvaluationMedicalHistory extends Evaluation {
	strapiMedicalHistoriesIds: number[];
	strapiMedicalHistories?: IStrapiMedicalHistory[];
}
interface IIds {
	strapiBodyPointId: number;
	strapiAggravatingFactorsIds: number[];
	strapiRelievingFactorsIds: number[];
	strapiPainCausesIds: number[];
	strapiPainDurationId: number;
	strapiPainFrequencyId: number;
	strapiPainStatusId: number;
}
export interface EvaluationPainAssessment extends Evaluation, IIds {
	strapiBodyPoint?: EvaluationBodyPoint;
}

interface IOptions {
	id: number;
	attributes: {
		name: string;
		bodyPoint: EvaluationBodyPoint;
	};
}

export interface EvaluationPainAssessmentOptions {
	aggravatingFactors: IOptions[];
	relievingFactors: IOptions[];
	painCauses: IOptions[];
	painDurations: IOptions[];
	painFrequencies: IOptions[];
	painStatuses: IOptions[];
}
interface IExerciseDetails {
	id: string;
	key: string;
	label: string;
	sample: string;
	neutralAngle: number;
	acceptableAngle: number;
	minAcceptableAngle: number;
	wfl: number;
	order: number;
	createdAt: Date;
	updatedAt: Date;
	active: boolean;
}
export interface MovrExercise extends IExerciseDetails {
	movrId: number;
	movrExerciseGroupId: string;
}

export interface LetsMoveExercise {
	id: string;
	name: string;
	side: Side;
	createdAt: Date;
	updatedAt: Date;
	movrExercise: MovrRomExercise[];
	styles: IBodyPointsStyle;
}

interface IGeneralProgram {
	id: string;
	userId: string;
	name: string;
	active: boolean;
	score: number;
	movrRomCompleted: boolean;
	movrRomPatientResults?: LetsMovePatientResult[];
	movrProgramHistory?: LetsMoveProgramHistory[];
	startedAt?: Date;
	expirationAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	closedAt?: Date;
	days?: Days;
}
export interface LetsMoveCustomProgram extends IGeneralProgram {
	movrPrescribedExercises?: LetsMovePrescribedExercisesApi[];
	reasons?: string[];
}
export interface MovrProgram extends IGeneralProgram {
	movrPrescribedExercises?: LetsMovePrescribedExercisesApi[];
	bodyRegion?: string;
}

export interface LetsMovePerformanceExercises {
	id: string;
	name: string;
	videoUrl: string;
	imageUrl: string;
	movrExerciseId: number;
	createdAt: Date;
	updatedAt: Date;
}
interface IPrescribeStrpiExe {
	id: number;
	description: string;
	name: string;
	is_bilateral: boolean;
	recommended_duration: number;
}
export type PrescribedExercise = {
	id: number;
	description: string;
	name: string;
	is_bilateral: boolean;
	recommended_duration: number;
	exercise_video?: string;
	exercise_image?: string;
};

export interface LetsMovePrescribedExercisesApi {
	id: string;
	prescribedExercise: PrescribedExercise;
	movrProgramId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface LetsMoveProgramHistory {
	id: string;
	movrProgramId: string;
	movrPerformancePatientResultId: string;
	createdAt: Date;
}
export interface Days {
	[key: string]: boolean;
}

export interface LetsMovePatientResult {
	id: string;
	userId: string;
	movrExercise?: LetsMoveExercise;
	movrExerciseId: string;
	value: number;
	screenshot: string;
	movrProgramId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface LetsMovePerformancePatientResults {
	id: string;
	userId: string;
	movrPerformanceExerciseId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface LetsMovePrescribedExercises {
	success: string;
	result: [];
}

export interface ReportsFindAllSearch extends DefaultPagination {
	readonly search?: string;
}

export enum ReportsResources {
	romSessions = 'romSessions',
	romResults = 'romResults',
	rehabSessions = 'rehabSessions',
	evaluationSessions = 'evaluationSessions',
}

export enum Sort {
	name = 'name',
	createdAt = 'createdAt',
}
export interface PaginationAndSort extends DefaultPagination {
	sort?: Sort;
}

export interface ReportNotes {
	createdAt: Date;
	notes: string;
	image: string;
	video: string;
	jobId: string;
}

export interface Report {
	id: string;
	user?: User;
	userId: string;
	name: string;
	romSessionsIds?: IRomSession[];
	romSessionsNotes?: ReportNotes[];
	surveyResultNotes?: ReportNotes[];
	romResultsIds?: RomPatientResult[];
	romResultsNotes?: ReportNotes[];
	programSessionsIds?: RehabExerciseListSession[];
	programSessionsNotes?: ReportNotes[];
	evaluationSessionsIds?: IEvaluation[];
	surveyResultIds?: SurveyResult[];
	evaluationSessionsNotes?: ReportNotes[];
	assessmentNotes?: ReportNotes[];
	diagnosisCode?: number[];
	planNotes?: ReportNotes[];
	startDate?: Date;
	endDate?: Date;
	createdAt: Date;
	updatedAt: Date;
	postureSessionsIds?: Posture[];
	postureSessionsNotes?: ReportNotes[];
}

export interface ReportPaginatedResponse {
	data: Report[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface ReportData {
	reports: ReportPaginatedResponse;
	report: Report | null;
	loading: boolean;
	reportIds: ReportIdsInterface;
	searchTextForReports: string;
}

interface IAssets {
	image: {
		url: string;
	};
	video: {
		url: string;
	};
}

export interface IProgramExercise {
	assets: IAssets[];
	exerciseLibrary: ExerciseLibrary | null;
	exerciseLibraryId: string;
	active: boolean;
	createdAt: Date;
	dailyReps: number;
	reps: number;
	sets: number;
	weeklyReps: number;
	strapiExerciseId: number | StrapiExercises;
	strapiOmniRomExerciseId?: number | StrapiExercises;
	id: number;
	programId: string;
	updatedAt: Date;
	name: string;
	description: string;
	image: string;
	video: string;
	order: number;
	uploadProgress?: number;
}

export interface StrapiExercises {
	id: number;
	name: string;
	description: string;
	is_bilateral: boolean;
	recommended_duration?: unknown;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	locale: string;
	movementTitle?: string;
	bodySideTitle?: string;
	instructions: string;
	contraindications: string;
	therapist_notes: string;
	breathing: string;
	supportive_surfaces: string;
	alignment_tips: string;
	frequency: string;
	equipment_alternatives: string;
	precautions: string;
	functional_applications: string;
	exercise_video: StrapiExercisevideo[];
	exercise_image: StrapiExerciseImage[];
	video?: StrapiExercisesAssets;
	image?: StrapiExercisesAssets;
}

interface StrapiExercisesAssets {
	id: number;
	url: string;
}
type StrapiExerciseImage = StrapiExercisesAssets;
type StrapiExercisevideo = StrapiExercisesAssets;

export interface OpenAiProgramExercises {
	id: number;
	name: string;
	justify: string;
	provider: string;
	weeklyReps: number;
	dailyReps: number;
	sets: number;
	reps: number;
}

export interface OpenAiProgram {
	duration: number;
	durationType: string;
	exercises: OpenAiProgramExercises[];
	programName: string;
}

export interface IProgramData {
	active: boolean;
	createdAt: Date;
	duration: number;
	durationType: string;
	status: string;
	exercises: IProgramExercise[];
	programTemplateId: string;
	startAt: Date;
	originType: string;
	deletedAt: Date;
	finishAt: Date;
	id: string;
	name: string;
	userId: string;
	updatedAt: Date;
}

export interface ExerciseDataItemProps {
	index: number;
	refresh: boolean;
	isEdit: boolean;
	program: IProgramData;
	programExercises: IProgramExercise[];
	isLoading: boolean;
	setLoading: (isLoading: boolean) => void;
	updateIsEditAtIndex: (index: number, value: boolean) => void;
	updateIsApprovedAtIndex: (index: number, value: boolean) => void;
	setRefresh: (refresh: boolean) => void;
	session: boolean;
	setSession: (value: boolean) => void;
}

export interface IProgram {
	id: string;
	userId: string;
	name: string;
	active: boolean;
	duration: number;
	durationType: string;
	startAt: string;
	finishAt: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	status: string;
	originType: string;
	programTemplateId: string | null;
}
export interface ProgramResponse {
	data: IProgramData[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface ProgramTemplateResponse {
	data: IProgramTemplate[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface Exercise {
	id: string;
	programId: string;
	strapiExerciseId: number;
	name: string;
	weeklyReps: number;
	dailyReps: number;
	sets: number;
	reps: number;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	order: number;
	description: string;
	video: string;
	image: string;
}

export interface IProgram {
	id: string;
	userId: string;
	name: string;
	active: boolean;
	duration: number;
	durationType: string;
	startAt: string;
	finishAt: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	status: string;
	originType: string;
	programTemplateId: string | null;
	exercises: Exercise[];
}
export interface ProgramByIdList {
	data: IProgram[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface ExerciseLibary {
	id: string;
	physioterapistId: string;
	videoUrl: string;
	title: string;
	description: string;
	reps: number;
	sets: number;
	dailyReps: number;
	weeklyReps: number;
	visibility: boolean;
	processing: boolean;
	jobId: string;
	createdAt: string;
	updatedAt: string;
	active: true;
	rehabExerciseLibraryId: string;
}

export interface StrapiExerciseProps {
	id: string;
	programId: string;
	strapiExerciseId: number;
	name: string;
	weeklyReps: number;
	dailyReps: number;
	sets: number;
	reps: number;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	order: number;
	strapiExercise: {
		id: number;
		attributes: Attributes;
	};
}

export interface Attributes {
	name: string;
	description: string;
	is_bilateral: boolean;
	recommended_duration: number | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	locale: string;
	instructions: string;
	contraindications: string;
	therapist_notes: string;
	breathing: string;
	supportive_surfaces: string;
	alignment_tips: string;
	frequency: string;
	equipment_alternatives: string;
	precautions: string;
	functional_applications: string;
	assets: {
		id: number;
		gender: string;
		sideBody: string;
		video: {
			data: {
				id: number;
				attributes: {
					url: string;
				};
			};
		};
		image: {
			data: {
				id: number;
				attributes: {
					url: string;
				};
			};
		};
	}[];
	reasons: {
		data: {
			id: number;
			attributes: {
				name: string;
			};
		}[];
	};
}

export interface ProgramSessionResult {
	id: string;
	programSessionId: string;
	programExerciseId: string;
	video: string;
	processing: boolean;
	jobId: string;
	exerciseDifficultyLevel: string;
	createdAt: string;
	programExercise: StrapiExerciseProps | ExerciseLibary;
}

export interface ProgramSession {
	id: string;
	programId: string;
	createdAt: string;
	overallCondition: string;
	painLevel: number;
	program: {
		id: string;
		userId: string;
		name: string;
		active: boolean;
		duration: number;
		durationType: string;
		startAt: string;
		finishAt: string;
		createdAt: string;
		updatedAt: string;
		deletedAt: string | null;
		status: string;
		originType: string;
		programTemplateId: string | null;
	};
	programSessionResult: ProgramSessionResult[];
}

export interface ProgramSessionByProgramId {
	data: ProgramSession[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface ProgramSessionResult {
	id: string;
	programSessionId: string;
	programExerciseId: string;
	video: string;
	processing: boolean;
	jobId: string;
	exerciseDifficultyLevel: string;
	createdAt: string;
}
export interface ProgramSessionResultResponse {
	data: ProgramSessionResult[] | null;
	pagination: IPaginationPluginDefaultResponse | null;
}
export interface IProgramTemplate {
	id: string;
	clientId?: string;
	name: string;
	duration: number;
	durationType: string;
	createdAt?: Date;
	startAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
	exercises: IProgramExercise[];
	description?: string;
	thumbnail?: string | ThumbnailProps;
}

export interface ThumbnailProps {
	url: string;
}

export interface ProgramExerciseUpload {
	sessionId: string;
	user: User | null;
	exercises: IProgramExercise[];
	program: IProgramData | null;
	progress: number[];
}
export interface ProgramState {
	isSessionClicked: boolean;
	latestUpdatedProgram: IProgramData | null;
	programApproved: ProgramResponse;
	program: ProgramResponse;
	openAiProgram: {
		data: IProgramData | null;
		errorMessage: string;
		statusCode: number;
		loading: boolean;
	};
	vitalflowAiProgram: {
		data: IProgramData | null;
		errorMessage: string;
		statusCode: number;
		loading: boolean;
	};
	programTemplate: ProgramTemplateResponse;
	programSummary: ProgramByIdList;
	programByIdList: ProgramSessionByProgramId;
	exerciseByProgram: ProgramSessionResultResponse;
	main: {
		sessionId: string;
		program: IProgramData | null;
		exercises: IProgramExercise[];
		completedExercises: IProgramExercise[];
		currentExercise: IProgramExercise | null;
		transitionTime: number;
		isAuto: boolean;
		uploadProgress: ProgramExerciseUpload[];
		isCompleted: boolean;
	};
	blockNavigation: {
		isBlocked: boolean;
		config: unknown;
		nextLocation: string | null;
		callBack: unknown;
	};
	isProgramPaused: boolean;
}

export interface MovrPerformancePatientResult {
	createdAt: Date;
	id: string;
	jobId: string;
	movrPerformanceExercise: LetsMovePerformanceExercises;
	movrPerformanceExerciseId: string;
	updatedAt: Date;
	userId: string;
	videoUrl: string;
}
export interface MovrStateScore {
	bodyPoints: MovrRomPatientResult[];
}
export interface IPerformance extends PerformanceSaveUserProgress {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PerformanceExercises extends ISetRepexercise {
	id: string;
	label: string;
	videoUrl: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface RehabCreateOrUpdateExerciseListSession {
	userId: string;
	patientResultsExercisesId?: string;
	rehabPatientListExercisesId?: string;
	rehabExerciseToPatientId?: string;
}

export interface RehabExerciseEffort {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface RehabExerciseLibrary extends ISetRepexercise, IProcessId {
	physioterapistId: string;
	videoUrl: string;
	title: string;
	description: string;
	visible: boolean;
	export: boolean;
	active: boolean;
}

export interface RehabPagination extends DefaultPagination {
	title?: string;
}

export interface RehabExerciseLibraryPaginationReturn {
	videos: RehabExerciseLibrary[];
	pagination: PaginationDefaultResponse;
}
interface ISetRepexercise {
	frequencyPerWeek?: number;
	repetitions?: number;
	setsPerDay?: number;
	setsPerSession?: number;
}
export interface RehabExerciseLibraryUpdate extends ISetRepexercise {
	ids: string[];
	title?: string;
	description?: string;
}

export interface RehabExerciseListSession {
	id: string;
	rehabPatientListExercises?: RehabPatientListExercise;
	rehabPatientListExercisesId: string;
	patientResultsExercises?: RehabPatientResultExercise[];
	rehabEvaluation?: RehabPatientEvaluation;
	rehabEvaluationId?: string;
	status: string;
	painLevel?: number;
	overallCondition?: string;
	newInjury?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface SurveyQuestionOptions {
	id?: string | undefined;
	option: string;
	score: number;
	questionId?: string;
	order?: number;
	isDeleted?: boolean;
}

export interface NewOptionProps {
	id: string;
	option: string;
	score: number;
}

export interface SurveyQuestion {
	deletedOptionList: never[];
	id: string;
	title: string;
	description: string;
	ratingOptions: string[];
	questionType: string;
	surveyId: string | null;
	optionList?: SurveyQuestionOptions[];
	surveyTemplateId: string | null;
	order: number;
	scored?: boolean;
}
export interface SurveyQuestionItemProps {
	survey: Survey;
	question: QuestionListPayload;
	index: number;
	handleQuestionDelete: (index: number) => void;
	updateOptionByIndex: (index: number, option: SurveyQuestionOptions[]) => void;
	addOptionsByIndex: (index: number, option: SurveyQuestionOptions) => void;
	deleteOptionByIndex: (index: number, optionIndex: number) => void;
	addRatingOptionByIndex: (index: number, ratingOptions: string[]) => void;
	handleQuestionTitle: (index: number, title: string) => void;
	updateOptionTitle: (
		index: number,
		optionIndex: number,
		title: string,
		score: number,
	) => void;
}

export interface SurveyOpenItemProps {
	isQuestionEdit: boolean;
	questionTitle: string;
	setQuestionTitle: (value: string) => void;
	setQuestionEdit: (value: boolean) => void;
	question: QuestionListPayload;
	validateQuestion: () => void;
	handleQuestionDelete: (index: number) => void;
	index: number;
}

export interface SurveyRateDataProps {
	survey: Survey;
	question: QuestionListPayload;
	isEdit: boolean;
	ratingOptions: SurveyQuestionOptions[];
	handleDragEnd: (event: {
		active: { id: string };
		over: { id: string };
	}) => void;
	index: number;
	setIsEdit: (value: boolean) => void;
	handleInputChange: (index: number, value: string) => void;
	handleScoreChange: (index: number, score: number) => void;
	updateOptionTitle: (
		index: number,
		optionIndex: number,
		title: string,
		score: number,
	) => void;
	addOptionsByIndex: (index: number, option: SurveyQuestionOptions) => void;
	deleteOptionByIndex: (index: number, optionIndex: number) => void;
	addRatingOptionByIndex: (index: number, ratingOptions: string[]) => void;
	updateOptionByIndex: (index: number, option: SurveyQuestionOptions[]) => void;
	handleDeleteRate: (index: number) => void;
	handleReset: () => void;
}

export interface Survey {
	id: string;
	userId: string;
	clinicallyValidated: boolean;
	image: string;
	title: string;
	description: string;
	instructions: string;
	resultFeedback: string;
	active: boolean;
	startAt: Date | null;
	finishAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	status: string;
	originType: string;
	isFinished: boolean;
	questionList?: SurveyQuestion[];
	surveyTemplateId: string | null;
	surveyTemplateQuestion?: SurveyQuestion[];
}

export interface SurveyTemplate {
	id: string;
	userId: string;
	image: string;
	title: string;
	description: string;
	instructions: string;
	resultFeedback: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	originType: string;
	surveyTemplateQuestion?: SurveyQuestion[];
	surveyTemplateId: string | null;
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

export interface SurveyQuestion {
	id: string;
	surveyResultId: string;
	questionType: string;
	ratingLevel: number;
	selectedAnswer: string | null;
	score: number | null;
	question: string;
	questionDescription: string;
	answerList: string[];
}

export interface SurveyResult {
	id: string;
	title: string | undefined;
	description: string | undefined;
	userId: string | undefined;
	reportsId: string;
	createdAt: string;
	updatedAt: string;
	questionList: { create: SurveyResultQuestionList[] };
	status: string;
}

export interface SurveyResultQuestionList {
	id?: string;
	surveyResult?: SurveyResult;
	surveyResultId?: string;
	questionType: string;
	ratingLevel?: number | null;
	selectedAnswer?: string | null;
	score?: number | null;
	question: string;
	questionDescription: string;
	answerList?: string[];
}

export interface RehabExerciseRequestParam extends DefaultPagination {
	patientId: string;
}

export interface RehabExerciseListSessionPaginated {
	data: RehabExerciseListSession[];
	pagination: IPaginationPluginDefaultResponse;
}

export interface RehabListSessionParam extends DefaultPagination {
	open?: string;
}

export interface RehabExerciseToPatient extends ISetRepexercise {
	id: string;
	rehabExercisesLibrary?: RehabExerciseLibrary;
	rehabExercisesLibraryId?: string;
	strapiExerciseId?: number;
	strapiExercise?: IStrapiExercise;
	bodySide?: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface RehabExerciseEffort {
	createdAt: Date;
	id: string;
	name: string;
	updatedAt: Date;
}

export interface RehabPatientEvaluation {
	id: string;
	painLevel?: number;
	progress?: number;
	rehabExerciseEffortId: string;
	rehabPatientListExercisesId: string;
	rehabExerciseEffort: RehabExerciseEffort;
	createdAt: Date;
	updatedAt: Date;
}

export interface PatientListExerciseQueryParams {
	all?: string;
}

export interface RehabPatientListExercise {
	id: string;
	userId: string;
	user?: User;
	physioterapistId: string;
	title: string;
	rehabExerciseToPatient?: RehabExerciseToPatient[];
	createdAt: Date;
	updatedAt: Date;
}

export interface RehabPatientResultExercise extends IProcessId {
	rehabExerciseToPatient?: RehabExerciseToPatient;
	rehabExerciseToPatientId: string;
	video: string;
	RehabExerciseListSession?: RehabExerciseListSession;
	rehabExerciseListSessionId: string;
	exerciseDifficultyLevel?: number;
}

export interface RehabRequestEnrollmentResponsePaginatedByUser {
	data: Partial<User>[];
	pagination: IPaginationPluginDefaultResponse;
}

export interface RehabSessionResponsePaginated {
	data: UserWithSession[];
	pagination: IPaginationPluginDefaultResponse;
}

interface IAssetsAttributes {
	url: string;
}

interface IAssetsData {
	id: number;
	attributes: IAssetsAttributes;
}

interface IAssets {
	data: IAssetsData;
}

interface IStrapiExerciseAssets {
	id: number;
	gender: string;
	sideBody: string;
	video: IAssets;
	image: IAssets;
}

export interface IStrapiExercise extends IPrescribeStrpiExe {
	assets: IStrapiExerciseAssets[];
	video?: string;
	image?: string;
}

export interface StrapiApiExercise {
	id: number;
	attributes: IStrapiExercise;
}

export interface StrapiExercisePaginated {
	videos: IStrapiExercise[];
	pagination: StrapiPagination;
}

interface UserToolStatus {
	id: string;
	user?: User;
	userId: string;
	status: UserToolStatusEnum;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface RomBodyPoint extends RomPainFrequency {
	romStyle: IBodyPointsStyle;
	romPosition: string;
}

export interface RomExercise extends IExerciseDetails {
	romExerciseGroupId?: string;
	result?: number;
	screenshot?: string;
}

type Styles = {
	[key: string]: string;
};

export interface RomExerciseGroup extends RomPainFrequency {
	side: string;
	romExercise: RomExercise[];
	styles: Styles;
}

export interface RomPainFrequency {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

export type IRomPainStart = RomPainFrequency;

export enum ExerciseKey {
	lShoulder = 'lShoulder',
	lElbow = 'lElbow',
	rElbow = 'rElbow',
	rShoulder = 'rShoulder',
	rShoulderInternal = 'rShoulderInternal',
	rShoulderExternal = 'rShoulderExternal',
	lShoulderInternal = 'lShoulderInternal',
	lShoulderExternal = 'lShoulderExternal',
	legs = 'legs',
	lHip = 'lHip',
	rHip = 'rHip',
	rKnee = 'rKnee',
	lKnee = 'lKnee',
	lHipInternal = 'lHipInternal',
	rHipInternal = 'rHipInternal',
	lHipExternal = 'lHipExternal',
	rHipExternal = 'rHipExternal',
}

export interface RomPatientResult {
	id: string;
	userId: string;
	romExerciseId: string;
	value: number;
	score?: number;
	min?: number;
	max?: number;
	normal?: number;
	wfl?: number;
	title?: string;
	mobilityMapper?: string;
	screenshot: string;
	outOfRange?: boolean;
	createdAt: Date;
	updatedAt: Date;
	romPatientResultId: string;
	romProgramExerciseId: string;
	romProgramExercise: CustomRomBodyPoints;
	strapiOmniRomExercise: {
		name: string;
	};
}

export interface IRomSession {
	id: string;
	userId: string;
	bodyRegion: BodyRegion;
	romPatientResults?: RomPatientResult[];
	completed: boolean;
	status: Status;
	strapiOmniRomExerciseGroupId: number;
	strapiOmniRomExerciseGroup: StrapiOmniRomExerciseGroup;
	createdAt: Date;
	updatedAt: Date;
}

export interface IRomSession {
	id: string;
	userId: string;
	bodyRegion: BodyRegion;
	romPatientResults?: RomPatientResult[];
	completed: boolean;
	status: Status;
	strapiOmniRomExerciseGroupId: number;
	strapiOmniRomExerciseGroup: StrapiOmniRomExerciseGroup;
	createdAt: Date;
	updatedAt: Date;
}

export interface RomSessionResponsePaginated {
	data: IRomSession[];
	pagination: IPaginationPluginDefaultResponse;
}

export interface RomUserSessionResponsePaginated {
	data: UserWithSession[];
	pagination: IPaginationPluginDefaultResponse;
}

export interface UserFunctionalGoal {
	id: string;
	userId: string;
	functionalGoalIds?: number[];
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export enum UserRole {
	user = 'user',
	admin = 'admin',
}

export interface UserProfile {
	email: string;
	firstName?: string;
	fullName?: string;
	lastName?: string;
	imageUrl?: string;
	preferredLanguages?: string[];
	birthDate?: string;
	role: UserRole;
	gender?: string;
	isPregnant?: boolean;
	height?: number;
	weight?: number;
	consentPolicyRead?: boolean;
	patientId?: string;
	avatarColor: string;
}
interface IDBUser {
	id: string;
	clientId: string;
	fusionAuthUserId: string;
	client: IClient;
	active: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	profile?: UserProfile;

	functionalGoals?: UserFunctionalGoal[];
	userToolStatus?: UserToolStatus[];
}

export interface ProfileData {
	active: boolean;
	birthDate: string;
	data: userData;
	email: string;
	firstName: string;
	fullName: string;
	id: string;
	lastName: string;
	fusionAuthUserId: string;
	createdAt: string;
	preferredLanguages?: string[];
	functionalGoals: FunctionalGoal[] | undefined;
	role: string;
}

interface userData {
	email: string;
	imageUrl: string;
	firstName: string;
	lastName: string;
	fullName: string;
	consentPolicyRead: boolean;
	gender: string;
	height: number;
	imperialHeight: number;
	imperialWeight: number;
	isPregnant: boolean;
	metricHeight: number;
	metricWeight: number;
	patientId: string;
	weight: number;
	avatarColor: string;
	userId: string;
}

interface FunctionalGoal {
	id: string;
	userId: string;
	functionalGoalsIds: number[];
	active: boolean;
	createdAt: string;
	updatedAt: string;
}
export interface SelectedPhysiotherapists {
	patientId: string;
	physiotherapistId: string;
	physiotherapist: Physiotherapist;
}
export interface Physiotherapist {
	id: string;
	clientId: string;
	fusionAuthUserId: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
	profile: ProfileAdmin;
}

export interface PhysiotherapistPatientAssociation {
	id: string;
	physiotherapistId: string;
	patientId: string;
	showPopup: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	physiotherapist: Physiotherapist;
}

export interface User extends IDBUser {
	isPhysioterapist: boolean;
	active: boolean;
	id: string;
	fusionAuthUserId: string;
	physiotherapistPatientAssociationPatientIdRelation: PhysiotherapistPatientAssociation[];
}
interface ILibExercise {
	visible?: boolean;
	default?: boolean;
	physioterapistId: string;
	title: string;
	description?: string;
}
export interface RehabCreateLibraryExercises
	extends ISetRepexercise,
		ILibExercise {
	get: (value: string) => string;
	video: string;
	userId?: string;
}
type Body = {
	libraryId: string;
	repetitions: number;
	setsPerSession: number;
	setsPerDay: number;
	frequencyPerWeek: number;
};
export interface SavePhysioterapistVideoToPatient {
	userId: string;
	body: Body;
}

type Pagination = {
	currentPage: number;
	from: number;
	pageCount: number;
	perPage: number;
	to: number;
	total: number;
};
interface IProcessId {
	processing: boolean;
	createdAt: Date;
	updatedAt: Date;
	id: string;
}
export interface PersonalExercise
	extends Partial<ISetRepexercise>,
		ILibExercise,
		IProcessId {
	videoUrl: string;
	jobId: string;
	active: true;
}

interface IPersonalLibrary {
	videos: PersonalExercise[];
	pagination: Pagination;
}

export interface IStrapiExercises extends IPrescribeStrpiExe {
	assets: IStrapiExerciseAssets[];
}

export interface StrapiPagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface GeneralLibrary {
	videos?: IStrapiExercises[];
	exercises: IStrapiExercises[];
	pagination: StrapiPagination;
}

export interface SelectedExercise extends Partial<ISetRepexercise> {
	libraryId?: string;
	strapiExerciseId?: number;
	bodySide?: string;
	name?: string;
	description?: string;
	videoUrl?: string;
}

export interface RehabInitialState {
	personal: IPersonalLibrary;
	general: GeneralLibrary;
	noExercises: boolean;
	videoSettings: ISetRepexercise;
	selectedExercises: SelectedExercise[];
	errorMessages: [];
	complete: boolean;
}
export interface RehabCreatePatientResultExercise {
	userId: string;
	rehabPatientListExerciseId: string;
	rehabExerciseToPatientId: string;
	video: string;
	exerciseDifficultyLevel?: string;
}
export type IRehabCreatePatientEvaluation = RehabCreatePatientResultExercise;
export interface IRehabExercisesLibrary
	extends RehabCreateLibraryExercises,
		IProcessId {
	active: boolean;
	jobId: string;
	videoUrl: string;
}

export interface RehabPatientResultsPaginated {
	data: RehabPatientResultExercise[];
	pagination: IPaginationPluginDefaultResponse;
}

export interface NewExercisesResults {
	find(arg0: (itemData: NewExercisesResults) => boolean): NewExercisesResults;
	createdAt: Date;
	exerciseEffort: string;
	id: string;
	painLevel: string;
	patientResultsExercises: RehabPatientResultExercise[];
	progress: string;
	rehabEvaluation: RehabPatientEvaluation | null;
	rehabEvaluationId: string;
	rehabPatientListExercisesId: string;
	updatedAt: Date;
}
export interface ExercisesSelectedRows {
	length: number;
	map(arg0: (item: unknown, index: unknown) => JSX.Element): React.ReactNode;
	createdAt: Date;
	id: string;
	patientResultsExercises: RehabCreatePatientResultExercise;
	rehabEvaluation: RehabPatientEvaluation;
	rehabEvaluationId: string;
	rehabPatientListExercisesId: string;
	updatedAt: Date;
}
export interface CreatePatientResult {
	userId: string;
	romExerciseId: string;
	value: number;
	screenshot: string;
}
type RangeDate = {
	start: string;
	end: string;
};

export interface GetPatientResults {
	userId: string;
	exerciseId: string;
	rangeDate: RangeDate;
}
export interface RomPainAssessment extends RomCreatePainAssessment {
	find(arg0: (itemData: RomPainAssessment) => boolean): RomPainAssessment;
	createdAt: Date;
	updatedAt: Date;
	romBodyPoint?: RomBodyPoint;
	romPainFrequency?: RomPainFrequency;
	romPainStart?: IRomPainStart;
}
export interface PainScale {
	whenPainStart: string;
	painCause: string;
	painFrequencies: string;
	painLevel: number;
	relievePainLevel: string;
}
export interface RomPainAssessmentInitialState extends PainAssessmentsHelpers {
	selectedBodyPoint: RomBodyPoint;
	bodyPointsSaved: RomBodyPoint[];
	bodyPointsFromLastSession: RomBodyPoint[];
	preAssesmentsSaved: number;
	painScale: PainScale;
}
export interface RomCreatePainAssessment {
	id?: string;
	userId: string;
	romBodyPointId: string;
	romPainStartId: string;
	romPainFrequencyId: string;
	painCause: string;
	painLevel: number;
	relievePainLevel: string;
}
export interface PainAssessmentsHelpers {
	bodyPoints: RomBodyPoint[];
	painFrequencies: RomPainFrequency[];
	painStart: IRomPainStart[];
}

interface IBodyPointsStyle {
	top?: string;
	left?: string;
	right?: string;
	bottom?: string;
}

export enum Side {
	LEFT = 'left',
	RIGHT = 'right',
}
export interface MovrRomExercise extends IExerciseDetails {
	movrId: number;
	movrExerciseGroup?: MovrExercise;
	movrExerciseGroupId?: string;
	result?: number;
	screenshot?: string;
}

export interface MovrRomCreatePatientResult {
	userId: string;
	movrExerciseId: string;
	value: string;
	screenshot: string;
}
type Tutorial = {
	watched: string | null | boolean;
	isOpened: boolean;
};

type Splash = {
	isOpened: boolean;
};

type Image = {
	id: string;
	exercise: string;
	src: string;
	thumbnail: string;
	thumbnailWidth: number;
	thumbnailHeight: number;
	isSelected: boolean;
	date: string;
	result: number;
};

type Gallery = {
	isOpened: boolean;
	images: Image[];
	imagesToCompare: Image[];
	rangeDate: RangeDate;
};

type Progress = {
	total: number;
	completed: number;
	current: number;
};

type Assessment = {
	isOpened: boolean;
};

type Menu = {
	isOpened: boolean;
};

type FinishedExercises = {
	finished: boolean;
	isOpened: boolean;
};

type Pose = {
	angleResult: number;
	angleResults: number[];
	coordinates: NormalizedLandmark[];
	multiCoordinates: NormalizedLandmark[][];
	dualAngles: { [key: string]: number };
};
interface IGeneralRomInitialState {
	user: User | null;
	goToExercise: null;
	pose: Pose;
	progress: Progress;
	gallery: Gallery;
	tutorial: Tutorial;
	splash: Splash;
	assessment: Assessment;
	menu: Menu;
	paused: boolean;
	finishedExercises: FinishedExercises;
	loading: boolean;
	isRepetingExercise: boolean;
	selfieMode: boolean;
	metricsData: CaptureData;
	enableToSendResult: boolean;
	waitSavedPhysicalAssessmentsMetrics: null;
	resultIndex: number | null;
	incorrectSide: boolean;
	facingMode: FacingMode;
	cameraId: string | null;
	bodyRegion: BodyRegion | null;
}
export interface MovrRomInitialState extends IGeneralRomInitialState {
	exercises: MovrRomExercise[];
	currentExercise: MovrRomExercise | null;
	sequence: [];
	bodyPartsNotVisible: boolean;
	currentTransition: number;
	resultsExercises: MovrRomExercise;
	resultExerciseValidation: MovrRomExercise | null;
}
export interface MovrRomPatientResult {
	id: string;
	userId: string;
	movrExerciseId: string;
	movrProgramId: string;
	value: number;
	screenshot: string;
	createdAt: Date;
	updatedAt: Date;
	movrExercise: MovrRomExercise;
}
export interface MovrPerformanceCreatePatientResult {
	video: File;
	userId: string;
	name: string;
	videoUrl: string;
	imageUrl: string;
	movrExerciseId: string;
}

interface IGeneralPerformanceInitialState {
	user: User | null;
	isMenuOpened: boolean;
	isHiddenMenu: boolean;
	shouldRedirect: boolean;
	isInvertVideo: boolean;
	progress: Progress;
}
export interface MovrPerformanceInitialState
	extends IGeneralPerformanceInitialState {
	completed: boolean;
	physioterapist: null;
	isPhysioterapist: boolean;
	exercises: LetsMovePerformanceExercises[];
	exercisesCompleted: LetsMovePerformanceExercises[];
	painLevel: number;
	evaluationProgress: number;
	currentExercise: LetsMovePerformanceExercises | null;
	isInvertCam: boolean;
	facingMode: string;
	continueWhereLeftOff: boolean;
	session: null;
}
export interface PerformanceSaveUserProgress {
	userId: string;
	performanceExerciseId: string;
	time: number;
}

type AspectArea = {
	width: number;
	height: number;
};

type ExerciseProgress = {
	total: number;
	totalSets: number;
	current: number;
	sets: number;
};

export interface PerformanceInitialState
	extends IGeneralPerformanceInitialState {
	exercises: PerformanceExercises[];
	exercisesCompleted: [];
	currentExercise: PerformanceExercises;
	exerciseProgress: ExerciseProgress;
	complete: boolean;
	aspectArea: AspectArea;
}
export interface CoachPerformanceInitialState {
	coach: ICoachPerformance | null;
	exercises: CoachPerformanceExercises | null;
	result: Record<string, unknown>;
}
export type ICoachPerformance = IPerformance;

export interface CoachPerformanceExercises extends ISetRepexercise {
	id: string;
	label: string;
	videoUrl: string;
	createdAt: Date;
	updatedAt: Date;
}
export interface CoachRehabInitialState {
	coach: CoachRehabCoach | null;
	exercises: CoachRehabExercises | null;
	result: [];
}
export interface CoachRehabCoach {
	id: string;
	userId: string;
	rehabExerciseId: string;
	time: number;
	createdAt: Date;
	updatedAt: Date;
}
export interface CoachRehabExercises extends ISetRepexercise {
	id: string;
	label: string;
	videoUrl: string;
	createdAt: Date;
	updatedAt: Date;
}
export interface CoachRomInitialState {
	coach: ICoachRomCoach | null;
	exercises: ICoachRomExercises | null;
	result: [];
}
export type ICoachRomCoach = CoachRehabCoach;
export type ICoachRomExercises = CoachRehabExercises;
type PatientResultsExercises = {
	id: string;
	rehabExerciseToPatientId: string;
	video: string;
	processing: boolean;
	jobId: string;
	createdAt: Date;
	updatedAt: Date;
	rehabExerciseListSessionId: string;
	rehabExerciseToPatient: ContactsRehabExerciseToPatient;
};
export interface ContactsSessions {
	id: string;
	rehabPatientListExercisesId: string;
	rehabEvaluationId: null;
	createdAt: Date;
	updatedAt: Date;
	rehabEvaluation: null;
	patientResultsExercises: PatientResultsExercises;
}
export type IContactsExercises = IExerciseDetails;

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
export interface Users {
	active: boolean;
	email: string;
	firstName: string;
	fullName: string;
	fusionAuthUserId: string;
	id: string;
}
export interface RehabAssignedExercisesForPatient {
	id: string;
	userId: string;
	physioterapistId: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	rehabExerciseToPatient: ContactsRehabExerciseToPatient;
}
type RehabExercisesLibrary = {
	id: string;
	physioterapistId: string;
	videoUrl: string;
	title: string;
	description: string;
	repetitions: number;
	setsPerSession: number;
	setsPerDay: number;
	frequencyPerWeek: number;
	visible: boolean;
	default: false;
	processing: false;
	jobId: string;
	createdAt: Date;
	updatedAt: Date;
	active: boolean;
};
export interface ContactsRehabExerciseToPatient extends ISetRepexercise {
	id: string;
	rehabExercisesLibraryId: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
	rehabPatientListExercisesId: string;
	rehabExercisesLibrary: RehabExercisesLibrary;
}
export type SelectedUser = {
	active: boolean;
	profile: {
		email: string;
		firstName: string;
		lastName: string;
		fullName: string;
	};
	id: string;
	fusionAuthUserId: string;
};

type Galery = {
	exerciseImages: [];
	images: [];
	imagesToCompare: [];
};

type Performance = {
	exercises: [];
	results: [];
};

type CreateAccount = {
	status: boolean;
	fieldErrors: [];
};
export interface ContactsInitialState {
	userDropDownList: Users[] | null;
	users: Users[] | null;
	selectedUsers: Users[] | null;
	rehabSelectedUsers: [];
	backList: boolean;
	rehabAction: null;
	selectedUser: SelectedUser | null;
	pagination: IPagination;
	contacts: [];
	isContactsListLoaded: boolean;
	wasActionExecuted: boolean | null;
	coach: ContactsRomPatientsResults | null;
	exercises: StrapiOmniRomExercises[] | null;
	preAssessment: [];
	weeklyAssessment: [];
	gallery: Galery;
	coachUserExercisesResults: [];
	performance: Performance;
	createAccount: CreateAccount;
	startUserSession: boolean;
	rehabExercisesFromUser: boolean;
	rehabPatientExercises: [];
	rehabPatientEvaluations: [];
	rehabAssignedExercisesForPatient: RehabAssignedExercisesForPatient | null;
	sessions: ContactsSessions | null;
	rehabSessions: ContactsSessions | null;
	graphSessionData: GraphSessionData | null;
	ptDashboard: {
		userId: string;
		activeTab: string;
	};
}
export interface ContactsRomPatientsResults {
	createdAt: Date;
	id: string;
	romExercise: IContactsExercises;
	romExerciseId: string;
	screenshot: string;
	updatedAt: Date;
	userId: string;
	value: number;
}

export interface TStrapiBodyPointAttributes extends TStrapiAttributes {
	position: string;
}

export interface TStrapiBodyPoint {
	id: number;
	attributes: TStrapiBodyPointAttributes;
}
export interface TStrapiAttributes {
	name: string;
	locale: string;
}
export interface TStrapiFactors {
	id: number;
	name: string;
	locale: string;
}

export interface TPainAssessmentProps extends IIds {
	evaluationSessionId: string;
	createdAt: Date;
	id: string;
	userId: string;
	notes: string;
	painLevel: string;
	strapiAggravatingFactors: TStrapiFactors[];
	strapiBodyPoint: TStrapiBodyPoint;
	strapiPainCauses: TStrapiFactors[];
	strapiPainDuration: TStrapiFactors;
	strapiPainFrequency: TStrapiFactors;
	strapiPainStatus: TStrapiFactors;
	strapiRelievingFactors: TStrapiFactors[];
	updatedAt: Date;
}

export type TStrapiMedicalHistoryProps = TStrapiAttributes;

export interface TStrapiMedicalHistories {
	id: number;
	attributes: TStrapiMedicalHistoryProps;
}

export interface TMedicalHistoryProps {
	createdAt: Date;
	evaluationSessionId: string;
	id: string;
	notes: string;
	strapiMedicalHistories: TStrapiMedicalHistories[];
	strapiMedicalHistoriesIds: number[];
}

export type TStrapiHealthSignsAttributes = TStrapiAttributes;

export interface TStrapiHealthSigns {
	id: number;
	attributes: TStrapiHealthSignsAttributes;
}

export interface THealthSignsProps {
	createdAt: Date;
	evaluationSessionId: string;
	id: string;
	notes: string;
	strapiHealthSigns: TStrapiHealthSigns[];
	strapiHealthSignsIds: number[];
}

export interface TDataProps {
	active: boolean;
	createdAt: Date;
	healthSigns: THealthSignsProps;
	medicalHistories: TMedicalHistoryProps;
	painAssessments: TPainAssessmentProps[];
	updatedAt: Date;
	userId: string;
	id: string;
	isSelected?: boolean;
}

export interface TCoachSummary {
	data: TDataProps[];
	pagination: PaginationDefaultResponse;
}

export interface ROMExercise extends IExerciseDetails {
	romExerciseGroupId: string;
}

export interface ROMPatientResult extends RomPatientResult {
	romSessionId: string;
	strapiOmniRomExercise: StrapiOmniRomExercises;

	strapiOmniRomExerciseId?: number;
}

export interface UserExerciseResult extends IGeneralDetails {
	romPatientResults: GroupedData;
}
export interface GroupedData {
	leftShoulder: ROMPatientResult[];
	rightShoulder: ROMPatientResult[];
	leftHip: ROMPatientResult[];
	rightHip: ROMPatientResult[];
	leftElbow: ROMPatientResult[];
	rightElbow: ROMPatientResult[];
	leftKnee: ROMPatientResult[];
	rightKnee: ROMPatientResult[];
	squat: ROMPatientResult[];
}

export interface PositionList {
	name: string;
	key: string;
}

export interface RomeRequestParam extends DefaultPagination {
	patientId: string;
}
export interface SurveyResult {
	id: string;
}
export interface OnchangeStatus {
	sessionId: Session;
	status: Status;
	userId: string;
}

export interface IstatusIcon {
	outOfParams: React.ReactNode;
	pendingReview: React.ReactNode;
	reviewed: React.ReactNode;
	escalationRequired: React.ReactNode;
	followUpRequired: React.ReactNode;
}
export interface MovrStateResults {
	groups: MovrExercise[] | null;
	resultsExercises: MovrRomPatientResult[] | null;
	resetExercisesLoading: boolean;
}

export interface ResultExerciseValidation extends StrapiOmniRomExercises {
	result?: number;
	results?: number[];
	screenshot: string;
}

export enum ETransitions {
	INTRO = 'intro',
	CALIBRATION = 'calibration',
	READYSETGO = 'readySetGo',
	CLOSING = 'closing',
	RESULT = 'result',
	OPENNING = 'openning',
}
export type TTransitions = {
	next: TTransitions | null;
	value: ETransitions;
};
export interface RomInitialState extends IGeneralRomInitialState {
	videoSizeState: string;
	exercises: CustomRomExercise[] | null;
	uploadProgress: number;
	currentExercise: CustomRomExercise | null;
	transition: TTransitions | null;
	bodyPointsVisible: boolean;
	resultsExercises: CustomRomExercise[];
	loading: boolean;
	isRepetingExercise: boolean;
	aspectArea: AspectArea;
	resultExerciseValidation: ResultExerciseValidation | null;
	session: Session | null;
	omniRomExerciseGroups: StrapiOmniRomExerciseGroup[] | null;
	strapiOmniRomExerciseGroupId: string | number | null;
	fetchFullScanExercise: CustomRomExercise[] | null;
	isCustom: boolean;
	editRecord: CustomRomExercise | null;
}

export interface rehabExercisesLibraryProp
	extends ISetRepexercise,
		ILibExercise,
		IProcessId {
	videoUrl: string;
	jobId: string;
	active: boolean;
}

export interface rehabExerciseToPatientProp extends ISetRepexercise {
	id: string;
	rehabExercisesLibraryId: string;
	strapiExerciseId: string;
	bodySide: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
	rehabPatientListExercisesId: string;
	rehabExercisesLibrary: rehabExercisesLibraryProp[] | [];
}

export interface exercisePropType {
	id?: string;
	userId?: string;
	physioterapistId?: string;
	title?: string;
	createdAt?: Date;
	updatedAt?: Date;
	rehabExerciseToPatient?: rehabExerciseToPatientProp[] | [];
}

export interface NewUserPaginated {
	data: NewUserData[];
	pagination: UserPaginationDefaultResponse;
}
export interface NewUserData {
	active: boolean;
	email: string;
	firstName: string;
	id: string;
	lastName: string;
	preferredLanguages?: string[];
	fusionAuthUserId: string;
	userToolStatus: UserToolStatus[];
}
export interface SaveVideoToRehab {
	strapiExerciseId: number;
	repetitions: number;
	setsPerSession: number;
	setsPerDay: number;
	frequencyPerWeek: number;
}
export interface SavePhysioterapistVideoToPatient {
	userId: string;
	body: SaveVideoToRehab[];
}

export interface RehabPreAssesment {
	userId: string;
	painLevel: number;
	overallCondition: string;
	newInjury: boolean;
	rehabPatientListExercisesId: string;
}

export interface ProgramPreAssesment {
	programId: string;
	painLevel: number;
	overallCondition: string;
}

export interface CustomModalProps {
	name?: string | null;
	description?: string | null;
	video?: string | null;
}

export interface GraphSessionData {
	data: RehabPatientResultExercise[];
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface GraphSessionRequestParam {
	patientId: string;
	rehabExerciseToPatientId: string;
}

export interface ActivityStreamPost {
	id: string;
	userId: string;
	activityStreamId: string;
	physioterapistId: string;
	message: string;
	createdAt: string;
	updatedAt: string;
	activityStreamPostMedia: ActivitySTreamPostMedia[];
}
export interface ActivitySTreamPostMedia {
	id: string;
	activityStreamPostId: string;
	image: string | null;
	video: string | null;
	jobId: string;
	processing: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ActivityStream {
	id: string;
	userId: string;
	postureAnalysisSessionId: string | null;
	romSessionId: string | null;
	programSessionId: string | null;
	programId: string | null;
	evaluationSessionId: string;
	rehabSessionId: string | null;
	surveyResultId: string | null;
	surveyId: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ActivityStreamData {
	id: string;
	userId: string;
	activityStreamId: string | null;
	activityStreamFeedbackId: string | null;
	activityStreamEvaluationId: string | null;
	activityStreamPostId: string | null;
	createdAt: string;
	activityStream: ActivityStream | null;
	activityStreamFeedback: string | null;
	activityStreamEvaluation: string | null;
	activityStreamPost: ActivityStreamPost | null;
	physioterapistId: string;
}

export interface EvaluationItem {
	title: string;
	subtitle: string;
	data: ActivityStreamData;
	value: boolean;
}

// Activity Stream API Response Types
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

export enum PatientDetailTabs {
	home = 'home',
	activity = 'activity',
	virtualEvaluation = 'virtualEvaluation',
	startScan = 'startScan',
	exercises = 'exercises',
	startSession = 'startSession',
	myReport = 'myReport',
	createReport = 'createReport',
	listEvaluation = 'listEvaluation',
	romSummary = 'romSummary',
	captures = 'captures',
	listSessions = 'listSessions',
	programs = 'programs',
	startSurvey = 'startSurvey',
	newPatients = 'newPatients',
	pendingReview = 'pendingReview',
	outOfParams = 'outOfParams',
	reviewed = 'reviewed',
	escalationRequired = 'escalationRequired',
	followUpRequired = 'followUpRequired',
	noComponentFound = 'noComponentFound',
	notUnderstandQuestion = 'notUnderstandQuestion',
	surveySummary = 'surveySummary',
	startSurveyUser = 'startSurveyUser',
	generateProgram = 'generateProgram',
	createSurvey = 'createSurvey',
	assignSurvey = 'assignSurvey',
	program = 'program',
	postureScan = 'postureScan',
	startRomScan = 'startRomScan',
	romProgram = 'romProgram',
	postureCaptures = 'postureCaptures',
	postureSummary = 'postureSummary',
	postureResult = 'postureResult',
	romResult = 'romResult',
}

export interface StrapiOmniRomExercises {
	id: number;
	vitalflowId: number;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	name?: string;
	title?: string;
	order?: number;
	function?: string;
	description?: unknown;
	transitionTime?: number;
	locale?: string;
	video?: StrapiOmniRomExercisesVideo;
	pointsToCalculateAngle?: StrapiOmniPointsToCalculateAngle;
	pointsToValidatePosition?: StrapiOmniPointsToCalculateAngle;
	omniRomExerciseGroups?: StrapiOmniRomExerciseGroup[];
	reference: StrapiOmniRomExerciseReference;
	bodyPoint?: CustomRomBodyPoints[];
	image?: {
		url: string;
	};
}

export type Frontend = {
	styles?: unknown;
};
export interface StrapiOmniRomExerciseGroup {
	id: number;
	name: string;
	key: BodyRegion;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	frontend?: Frontend;
	locale: string;
}
export interface StrapiOmniPointsToCalculateAngle {
	id: number;
	a: StrapiOmniPoints;
	b: StrapiOmniPoints;
	c: StrapiOmniPoints;
	d: StrapiOmniPoints;
}
export interface StrapiOmniPoints {
	id: number;
	value: number;
	name: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	locale: string;
}
export interface StrapiOmniRomExercisesVideo {
	id: number;
	url: string;
}

export interface StrapiOmniRomExerciseReference {
	max: number;
	id: number;
	name: string;
	min: number;
	normal: number;
	wfl: number;
}

export interface CreateRomSession {
	id?: string;
	customRomId?: string;
	strapiOmniRomExerciseGroupId?: string | number;
	userId: string;
}

export interface ProgramPayload {
	userId?: string;
	limit: number;
	page: number;
	searchValue?: string;
	status?: string;
}

export interface StrapiExercise {
	id: number;
	attributes: Attributes;
}

export interface ExerciseLibrary {
	id: string;
	physioterapistId: string;
	videoUrl: string;
	video?: string;
	thumbnail: string;
	title: string;
	description: string;
	reps: number;
	sets: number;
	dailyReps: number;
	weeklyReps: number;
	visibility: boolean;
	processing: boolean;
	jobId: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
}

export interface ProgramExercise {
	id: string;
	programId: string;
	strapiExerciseId: number | null;
	exerciseLibraryId: string | null;
	weeklyReps: number;
	dailyReps: number;
	sets: number;
	reps: number;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	order: number;
	exerciseLibrary: ExerciseLibrary | null;
	strapiExercise: StrapiExercise | null;
}

export interface ProgramSessionResult {
	id: string;
	programSessionId: string;
	programExerciseId: string;
	video: string;
	thumbnail: string;
	processing: boolean;
	jobId: string;
	exerciseDifficultyLevel: string;
	createdAt: string;
	reportsId: string | null;
	programExercise: StrapiExerciseProps | ExerciseLibary;
}

export interface Program {
	id: string;
	userId: string;
	name: string;
	active: boolean;
	duration: number;
	durationType: string;
	startAt: string | null;
	finishAt: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	status: string;
	originType: string;
	strapiProgramTemplateId: string | null;
	programTemplateId: string | null;
}

export interface ProgramSessionActivity {
	id: string;
	programId: string;
	createdAt: string;
	updatedAt: string;
	overallCondition: string;
	painLevel: number;
	status: string;
	completed: boolean;
	reportsId: string | null;
	programSessionResult: ProgramSessionResult[];
	program: Program;
}

interface IOnSubmitVideo {
	size: number;
	type: string;
}
export interface ReactVideorRecordRef {
	handleStartRecording: () => void;
	handleStopRecording: () => void;
	handleStopReplaying: () => void;
	handleRating: () => void;
	recordedBlobs: IOnSubmitVideo[];
}

export interface UpdateData {
	data: ActivityStreamData[];
	pagination: {
		endCursor: string;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		startCursor: string;
	};
}

export interface ActivityType {
	isHeader?: boolean;
}

export interface AddProgramPopupProps {
	isVisible: boolean;
	onCancel: () => void;
	selectedExercises: IProgramExercise[];
	setSelectedExercises: (
		selectedExercises: IProgramExercise[],
	) => void | Dispatch<SetStateAction<never[]>>;
	program?: IProgramTemplate | null;
	refresh: boolean;
	setRefresh: (refresh: boolean) => void;
	onOk: () => void;
	isEdit?: boolean;
	deleteProgram?: (program: IProgramData) => void;
	isSaveTemplateVisible?: boolean;
	programId: string;
	strapiId: number;
	activeKey: string;
	thumbnailValue: string;
	setSearchValue?: (value: string) => void;
}

export interface DeleteExerciseIds {
	id: string;
}

export interface AddProgramItemProps {
	selectedExercises: unknown;
	isSaveTemplateVisible: boolean | undefined;
	isSaveTemplate: boolean;
	setSelectedExercises: unknown;
	validateProgram: () => void;
	handleRemoveExercise: unknown;
	setSaveTemplate: (value: boolean) => void;
	SetLibraryModalVisible: (value: boolean) => void;
	programName: string;
	setProgramName: (item: string) => void;
	setProgramStartDate: (item: string) => void;
	programStartDate: string;
	duration: number;
	setDuration: (value: number) => void;
	setDurationType: (value: string) => void;
	durationType: string;
	programDescription: string;
	setProgramDescription: (item: string) => void;
	imgFile: string | null;
	openCoverImage: boolean;
	setOpenCoverImage: (value: boolean) => void;
	previewImage: string | null;
	setImgFile: (value: string) => void;
	previewUnSplashedImage: string | null;
	setPreviewImage: (value: string | null) => void;
	setPreviewUnSplashedImage: (value: string | null) => void;
}

export interface ReportIdsInterface {
	romSessionsIds?: string[];
	romResultsIds?: string[];
	programSessionsIds?: string[];
	evaluationSessionsIds?: string[];
	exercisesSelectedRows?: string[];
	surveyResultIds?: string[];
	postureSessionsIds?: string[];
}

export interface TDataSetProps {
	key: string;
	patterns: string[];
	extraResponse?: string[];
	component: React.ReactNode;
}

export interface FilteredList {
	list: SearchItem[];
	name: string;
	id: string;
}
export interface SearchBarProps {
	dataset: TDataSetProps[];
	setRenderedComponent(component: React.ReactNode | null): void;
	newRecentSearch: string;
	setNewRecentSearch: (value: string) => void;
	inputText: string;
	setInputText: (value: string) => void;
	setOpenSurveyModal: (value: boolean) => void;
	openDropdown: boolean;
	setOpenDropdown: (value: boolean) => void;
}
export interface SearchItem {
	key: string;
	icon: React.ReactNode;
	name: string;
}

export interface RomSummaryDataProps {
	isAssistant?: boolean;
	groupData?: [];
	isLoading: boolean;
	currentPage: number;
	onPageChange: (page: number) => void;
	totalPage: number;
}

export interface AiAssiantProps {
	isAssistant?: boolean;
}
export interface VideoModalProps {
	value?: string;
	onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	isReport?: boolean;
	videoBlob: null | Blob;
	isVideoModalVisible: boolean;
	handleClose: () => void;
	onStartRecord: () => void;
	onStopRecord: () => void;
	onDiscardRecord: () => void;
	onEndedTimer: () => void;
	onRecordFinished: (videoBlob: Blob) => void;
	isStartingTimer: boolean;
	videoRef: React.RefObject<unknown>;
	messageDescription: string;
	setMessageDescription: React.Dispatch<React.SetStateAction<string>>;
	sendMessage: () => void;
	videoState: RehabVideoState;
	facingMode: string;
	isImageModal: boolean;
	imgFile: File[] | undefined;
	openImgInput: () => void;
	handleKeyPress: (e: unknown) => void;
}

export interface ActivityStreamDataProps {
	isHeader: boolean | undefined;
	evaluationData: EvaluationItem[];
	isLoading: boolean;
	handleLoad: () => void;
	functionalData: undefined | [];
	eventData: ActivityStreamData[];
	isReply: boolean;
	lastMessageRef: unknown;
	handleShare: (item: EvaluationItem) => void;
	updateVitalScan ROMData: (newDate: Date) => void;
	isFilter: boolean;
	clearFilter: () => void;
	updateData: UpdateData | undefined;
	handleScrollTo: (e: string | null) => void;
	scrollEnabled: boolean;
	calendarView?: 'weekly' | 'full';
	onToggleCalendarView?: () => void;
}

export interface FooterProps {
	isReply: boolean;
	shareItem: EvaluationItem[];
	setIsReply: (value: boolean) => void;
	showVideoModal: () => void;
	showImageModal: () => void;
	microphoneRef: unknown;
	sendMessage: () => void;
	imgInputRef: unknown;
	handleImgChange: (e: unknown) => void;
	messages: string;
	setMessage: (value: string) => void;
	handleKeyPress: (e: unknown) => void;
	handleScrollTo: (e: string | null) => void;
	inputRef: unknown;
	setShareItem: (value: EvaluationItem[]) => void;
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
export interface AddSurveyPopupProps {
	imgFile?: File[] | undefined;
	setImgFile: (value: File[] | undefined) => void;
	setQuestionList: (
		value:
			| QuestionListPayload[]
			| ((prev: QuestionListPayload[]) => QuestionListPayload[]),
	) => void;
	questionList: QuestionListPayload[];
	surveyTitle: string;
	setSurveyTitle: (val: string) => void;
	surveyInstructions: string;
	setSurveyInstructions: (val: string) => void;
	surveyResultFeedback: string;
	setSurveyResultFeedback: (val: string) => void;
	surveyDescription: string;
	setSurveyDescription: (val: string) => void;
	questionValue?: string;
	setQuestionValue?: (val: string) => void;
	setQuestionType?: (val: string | undefined) => void;
	questionType?: string | undefined;
	onCancel: () => void;
	selectedQuestion?: SurveyQuestion[];
	setSelectedQuestion?: (selectedQuestion: SurveyQuestion[]) => void;
	survey?: Survey | null;
	refresh: boolean;
	setRefresh: (refresh: boolean) => void;
	onOk: () => void;
	isEdit?: boolean;
	cancelTriggered?: boolean;
	setSelectedSurvey: (selectedSurvey: Survey | null) => void;
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

export interface IExerciseProps {
	setSelectedSurvey: (selectedSurvey: Survey | null) => void;
	searchValue: string;
	setSearchValue: (value: string) => void;
	setActiveKey: (value: string) => void;
}

export interface MySurveysModalDataProps {
	setSelectedQuestion: (selectedQuestion: SurveyQuestion[]) => void;
	selectedQuestion: SurveyQuestion[];
	isGrid: boolean;
	setGrid: (isGrid: boolean) => void;
	selectedSurvey: Survey;
	setSelectedSurvey: (value: Survey | null) => void;
	setPreviousQuestion: (selectedQuestion: SurveyQuestion[]) => void;
	setModalVisible: (value: boolean) => void;
	fetchHomeData: (page: number) => void;
	searchValue: string;
	setSearchValue: (value: string) => void;
	refresh: boolean;
}

export interface SurevyPopupFormProps {
	survey?: Survey | null;
	isEdit?: boolean;
	surveyTitle: string;
	setSurveyTitle: (val: string) => void;
	surveyInstructions: string;
	setSurveyInstructions: (val: string) => void;
	surveyResultFeedback: string;
	setSurveyResultFeedback: (val: string) => void;
	surveyDescription: string;
	setSurveyDescription: (val: string) => void;
	questionValue: string;
	setQuestionValue: (val: string) => void;
	setQuestionType: (val: string | undefined) => void;
	questionType: string | undefined;
	setQuestionList: (item: QuestionListPayload[]) => void;
	questionList: QuestionListPayload[];
	imgFile: File[] | undefined;
	setImgFile: (img: File[] | undefined) => void;
}

export interface Item {
	key: string;
	id: unknown;
	active: boolean;
	title: string;
	description: string;
	repetitions: number;
	setsPerSession: number;
	setsPerDay: number;
	frequencyPerWeek: number;
}

export interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
	editing: boolean;
	dataIndex: string;
	title: unknown;
	inputType: Text;
	record: Item;
	index: number;
	children: React.ReactNode;
}

export interface ReportModalProps {
	isModalVisible: boolean;
	onOk: () => void;
	onCancel: () => void;
	copyToClipboard: () => void;
	downloadPdf2: () => void;
	reportModalLoading: boolean;
	setReportModalLoading: (value: boolean) => void;
}

export interface ActivityStreamPanel {
	item: EvaluationItem;
	index: number;
	evaluationData: EvaluationItem[];
	lastMessageRef: unknown;
	handleScrollTo: (e: string | null) => void;
	scrollEnabled: boolean;
}

export interface CreateProgramModalProps {
	isVisible: boolean;
	onCancel: () => void;
	fetchData: (pageNumber: number) => void;
	refresh: boolean;
	setRefresh: (refresh: boolean) => void;
	searchValue: string;
	setSearchValue: (searchValue: string) => void;
}

export interface CreateSurveyModalProps {
	surveyEdit: boolean;
	setSurveyEdit: (value: boolean) => void;
	isEdit?: boolean;
	onOk?: () => void;
	survey?: Survey;
	isVisible: boolean;
	onCancel: () => void;
	refresh: boolean;
	setRefresh: (refresh: boolean) => void;
	fetchData: (pageNumber: number, value: string) => void;
	previousQuestion: SurveyQuestion[];
	setPreviousQuestion: (val: SurveyQuestion[]) => void;
	fetchHomeData: (pageNumber: number) => void;
	activeTab?: string;
	selectedSurvey: Survey | null;
	setSelectedSurvey: (saveSurvey: Survey | null) => void;
}

export interface SurveyOptionList {
	saveSurvey: () => void;
	selectedOptionList: SurveyResultQuestionList[];
	setSelectedSurvey: (saveSurvey: Survey | null) => void;
	setSelectedOptionList: (
		selectedOptionList: SurveyResultQuestionList[],
	) => void;
	item: SurveyQuestion;
	index: number;
	selectedSurveyData: SurveyQuestion[];
	selectedSurvey: Survey | null;
	setSelectedSurveyData: (selectedSurveyData: SurveyQuestion[]) => void;
	fetchSurveyData: (value: number) => void;
}

export interface SummaryContentProps {
	handlePanelChange: (key: string | string[]) => void;
	handleClick: (surveyId: string) => void;
	item: SurveyResult;
	activePanelKey: string | string[] | undefined;
	index: number;
	selectedCollapse: string[] | string | undefined;
	setSelectedCollapse: (value: string[] | string | undefined) => void;
	isLoading: boolean;
	surveySessionData: SurveyResult[];
	getPainLevel: (
		painLevel: number,
		question: SurveyResultQuestionList,
	) => unknown;
	totalCount: number;
	currentCount: number;
	pageHandle: (page: number) => void;
	fetchSurveyByIdData: (surveyId: string, page: number) => void;
	surveyIdData: string;
	setSurveyIdData: (value: string) => void;
}
export interface ProgramSummaryProps {
	antIcon: ReactNode;
	CustomModalInfo: (value: CustomModalProps) => void;
}

export interface AiProgramSummaryContent {
	item: IProgram;
	programSessionData: unknown;
	isLoading: boolean;
	antIcon: ReactNode;
	CustomModalInfo: (value: CustomModalProps) => void;
	setSessionClicked: (value: boolean) => void;
	setRehabExerciseToPatientId: (value: string | undefined) => void;
	setProgramuTutorialVideo: (value: string) => void;
	setProgramDescription: (value: string) => void;
	setExerciseTitle: (value: string | undefined) => void;
	programIdData: string;
	currentCount: number;
	fetchProgramByIdList: (programId: string, page: number) => void;
}

export interface RomCaptureResultProps {
	aiAssistant?: boolean;
	extraContentCaptureCollapse: (exerciseId: string, total: number) => ReactNode;
	config: unknown;
	onSelectImage: (index: number, id: string) => void;
}

export interface ProfileModalProps {
	isModalOpen: boolean;
	setIsModalOpen: (isModalOpen: boolean) => void;
	setPolicyModalOpen: (policyModalOpen: boolean) => void;
	policyModalOpen: boolean;
	closable: boolean;
	onEdit: boolean;
}
export interface ProfileFormProps {
	policyModalOpen: boolean;
	onEdit?: boolean;
	onFinish?: () => void;
	setIsModalOpen: (value: boolean) => void;
	userFormData?: TProfileData;
	setUserFormData?: (item: TProfileData) => void;
	isBirthDateError?: boolean;
	setPolicyModalOpen: (value: boolean) => void;
	handleCheck?: (value: boolean) => void;
}
export interface RehabVideoHeaderProps {
	isFullscreen: boolean;
	flipCamera: boolean;
	videoState: RehabVideoState;
	isStartingTimer: boolean;
	onFullscreen: () => void;
	onToggleMenu: () => void;
	onToggleInfo: () => void;
	onStartRecord: () => void;
	autoStopRecord: () => void;
	onStopRecord: () => void;
	onDiscardRecord: () => void;
	onSubmitRecord: () => void;
	onEndedTimer: () => void;
	onStopRating: () => void;
	selectedRating: number;
	setSelectedRating: (value: number) => void;
	savedVoice: string;
	switchCamera: () => void;
}

export interface RehabVideoHeaderDataProps {
	isFullscreen: boolean;
	flipCamera?: boolean;
	videoState: RehabVideoState;
	isStartingTimer: boolean;
	onFullscreen: () => void;
	toogleFacingMode?: () => void;
	onToggleMenu?: () => void;
	onToggleInfo?: () => void;
	onStartRecord: () => void;
	onStopRecord: () => void;
	onDiscardRecord: () => void;
	onSubmitRecord: () => void;
	onEndedTimer: () => void;
	onStopRating: () => void;
	selectedRating: number;
	setSelectedRating: (value: number) => void;
	isGestureEnabled?: boolean;
	savedVoice: string;
}

export interface RowDataProps {
	setCompletionLoader: (val: boolean) => void;
	completionLoader: boolean;
	isDashboard: boolean;
	isSplashOpened: boolean;
	onToggleMenu: () => void;
	onFullscreen: () => void;
	onToggleTutorial: () => void;
	onTogglesSwitchMode: () => void;
	onTogglesSplashPage: () => void;
	onExerciseValueAndCoordinates: (
		value: number,
		coordinates: NormalizedLandmark[],
	) => void;
	onBodyPointsVisible: (value: boolean) => void;
	switchCamera: () => void;
	onTogglePauseVideo: () => void;
	onFullscreen: () => void;
	isValidResult: boolean | null;
	onSavePhysicalAssessmentsMetrics: () => void;
	isVideoPause: boolean;
	isFullscreen: boolean;
	flipCamera: boolean;
	isSwitchMode: boolean;
	isMenuOpened: boolean;
	isTutorialOpened: boolean;
	onNextTransition: (transition: TTransitions) => void;
	fullscreenRef: unknown;
	isCompleted: boolean;
	setIsManual: (val: boolean) => void;
	setCompleted: (val: boolean) => void;
	isManual: boolean;
	onToggleInfo: () => void;
	isInfoOpened: boolean;
}

export interface RomResultDataProps {
	transitionTime: number;
	isValidResult: boolean | null;
	onSavePhysicalAssessmentsMetrics: () => void;
	onFullscreen: () => void;
	onTogglesSwitchMode: () => void;
	flipCamera: boolean;
	switchCamera: () => void;
	isSwitchMode: boolean;
	isSplashOpened: boolean;
	isVideoPause: boolean;
	onTogglePauseVideo: () => void;
	onNextTransition: (transition: TTransitions) => void;
	onToggleTutorial: () => void;
	isFullscreen: boolean;
	isManual: boolean;
	isCompleted: boolean;
}

export interface ReportContentProps {
	reportModalLoading: boolean;
	isEditMode: boolean;
}

export interface ReportOjectiveProps {
	romSummaryData: IRomSession[];
	romCapturesData: RomPatientResult[];
	rehabCapturesData: RehabExerciseListSession[];
	surveyData: SurveyResult[] | undefined;
	romSesssionNotes: string;
	romResultsNotes: string;
	programSessionsNotes: string;
	surveyResultNotes: string;
	setEvaluationNotes: (notes: string) => void;
	setRomSessionNotes: (notes: string) => void;
	setRomResultsNotes: (notes: string) => void;
	setProgramSessionsNotes: (notse: string) => void;
	setSurveyResultNotes: (notes: string) => void;
	isEditMode: boolean;
	report: unknown;
	handleSubmit: (notes: string) => void;
	setActiveComponent: (value: AddButtonItemsProps) => void;
	setIsVisible: (val: boolean) => void;
}

export interface TPainAssessmentDataProps {
	apiData: TCoachSummary;
	fetchData: (limit: number, page: number) => void;
	perPage?: number;
	currentPage: number;
}

export interface SubMenuAdmin {
	label: string;
	key: string;
	icon: ReactNode;
	status?: Status | 'newPatients';
}

export interface SubMenuAdminPatients {
	label: string;
	key: string;
	icon: ReactNode;
	status?: StatusPatients | 'unAssignedPatients';
}

export interface AdminMenuProps {
	onClick: (key: string) => void;
}

export interface AdminSideBarProps {
	selectedItem: SelectedUser | null;
	onChangeHome: (value: string) => void;
	activeMenu: string;
	setActiveMenu: (value: string) => void;
	setSearchQuery: (value: string) => void;
	setSelectedItem: (value: SelectedUser | null) => void;
	onClick: (value: string) => void;
}

export interface AdminMenuContentProps {
	inboxLoading: boolean;
	activeMenu: string;
	setActiveMenu: (value: string) => void;
	setSearchQuery: (value: string) => void;
	selectedItem: SelectedUser | null;
	handleSelectChange: (Selected: SelectedUser) => void;
	isModalOpen: boolean;
	setIsModalOpen: (value: boolean) => void;
	profileData: Record<string, unknown>;
	functionalData: [] | undefined;
	handleInboxChange: (selected: SelectedUser) => void;
	searchQuery: string;
	activeSubMenu: string;
	setActiveSubMenu: (value: string) => void;
	inboxData: unknown;
	onClick: (value: string) => void;
	activeSubPatients: string;
	setActiveSubPatients: (value: string) => void;
}

export interface InboxDataMessage {
	id: string;
	profile: {
		firstName: string;
		lastName: string;
		email: string;
		fullName: string;
	};
	unread: number;
	lastMessage: string;
}
interface UserData {
	avatarColor: string;
}

export interface PatientListDataProps {
	active: boolean;
	data: UserData;
	email: string;
	firstName: string;
	id: string;
	fusionAuthUserId: string;
	createdAt: string;
}
interface Client {
	inviteCode: string;
}

export interface APIKeyData {
	id: string;
	clientId: string;
	openaiApiKey: string;
	openaiApiKeyActive: boolean;
	createdAt: string;
	updatedAt: string;
	client?: Client;
}

export interface MenuAdminProps {
	label: string;
	key: string;
	icon: ReactNode;
}

interface Reference {
	id: number;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	name: string;
	locale: string;
	min: number;
	normal: number;
	wfl: number;
}
interface StrapiOmniRomExercise {
	id: number;
	name: string;
	description: string | null;
	order: number;
	reference: Reference;
	video?: StrapiExercisesAssets;
	image?: StrapiExercisesAssets;
}
interface RomSession {
	id: string;
	userId: string;
	bodyRegion: string;
	strapiOmniRomExerciseGroupId: number;
	completed: boolean;
	createdAt: string;
	updatedAt: string;
	status: string;
	reportsId: string | null;
	strapiOmniRomExerciseGroup: Record<string, unknown>;
}
export interface ProgramData {
	id: string;
	userId: string;
	romExerciseId: string | null;
	strapiOmniRomExerciseId: number;
	value: number;
	screenshot: string;
	outOfRange: boolean;
	createdAt: string;
	updatedAt: string;
	romSessionId: string;
	reportsId: string | null;
	romSession: RomSession;
	activityStreamEvaluation: unknown[];
	activityStreamFeedback: unknown[];
	strapiOmniRomExercise: StrapiOmniRomExercise;
}

export interface IProgramData {
	id: string;
	userId: string;
	name: string;
	active: boolean;
	duration: number;
	durationType: string;
	startAt: Date;
	finishAt: Date;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
	status: string;
	originType: string;
	programTemplateId: string;
	rehabPatientListExercisesId: string | null;
}
export interface ProgramCompletionData {
	id: string;
	programId: string;
	createdAt: string;
	updatedAt: string;
	overallCondition: string;
	painLevel: number;
	status: string;
	completed: boolean;
	reportsId: string | null;
	rehabExerciseListSessionId: string | null;
	program: IProgramData;
}

export interface AddButtonItemsProps {
	key: string;
	label: string;
	icon: React.ReactNode;
}

export type NamedAssessment = {
	[key: string]: boolean;
};

export type AngleBasedAssessment = {
	angle: number;
	assessment: NamedAssessment;
};

export type LegBasedAssessment = {
	leftLeg: AngleBasedAssessment;
	rightLeg: AngleBasedAssessment;
};

export type KneeBackAssessment = {
	kneeToHipRatio: number;
	assessment: NamedAssessment;
};

export interface FrontPostureAssessment {
	roundedShoulders: AngleBasedAssessment;
	kneeValgus: LegBasedAssessment;
	kneeVarus: LegBasedAssessment;
}

export interface SidePostureAssessment {
	roundedShoulders: AngleBasedAssessment;
	kyphosis: AngleBasedAssessment;
	lordosis: AngleBasedAssessment;
	forwardHead: AngleBasedAssessment;
	flatBack: AngleBasedAssessment;
	anteriorPelvicTilt: AngleBasedAssessment;
	posteriorPelvicTilt: AngleBasedAssessment;
}
export interface BackPostureAssessment {
	kneeValgus: KneeBackAssessment;
	scoliosis: AngleBasedAssessment;
}

export interface PostureReportItem {
	id: string;
	clientId: string;
	userId: string;
	sessionId: string;
	front?: FrontPostureAssessment;
	left?: SidePostureAssessment;
	right?: SidePostureAssessment;
	back?: BackPostureAssessment;
	createdAt: string;
	updatedAt: string;
	report: PostureReportItem;
}

export interface ProgramTemplateAttributes {
	name: string;
	duration: number;
	durationType: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	description: string;
	experienceLevel: string;
	workoutType: string;
	timeAvailability: string;
	locale: string;
	subgoal: string;
}
export interface Thumbnail {
	id: number;
	documentId: string;
	url: string;
}

export interface ProgramTemplate {
	id: number;
	documentId: string;
	name: string;
	duration: number;
	durationType: string;
	description: string | null;
	thumbnail: Thumbnail | null;
	exercises: Exercise[];
}

export interface ProgramTemplates {
	data: ProgramTemplate[];
}

export interface PostureAlignmentAttributes {
	name: string;
	programTemplates: ProgramTemplates;
}

export interface PostureAlignment {
	id: number;
	documentId: string;
	name: string;
	programTemplates: ProgramTemplate[];
}

export interface PaginationMeta {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface Meta {
	pagination: PaginationMeta;
}

export interface StrapiPostureReportResponse {
	data: PostureAlignment[];
	meta: Meta;
}

export interface IPostureData {
	data: Posture[];
	strapiPostureReport: PostureAlignment[] | null;
	pagination: UserPaginationDefaultResponse | null;
	uploadProgress: number;
	selectedScan: Posture | null;
	tempSelectedScan: Posture | null;
	postureReport?: {
		data: PostureReportItem[];
		pagination: UserPaginationDefaultResponse | null;
	} | null;
}
export interface PostureData {
	coordinates: Coordinates[];
	id: string;
	userId: string;
	view: 'front' | 'back' | 'left' | 'right';
	head: number | null;
	ear: number | null;
	shoulder: number;
	elbow: number;
	hip: number;
	knee: number;
	ankle: number | null;
	screenshot: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: null;
	postureAnalysisSessionId: string;
	report: {
		data: PostureReportItem;
	} | null;
	key?: string;
}

export interface Posture {
	id: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
	postureAnalysis: PostureAnalysisItem[];
	report: PostureReportItem;
}

export type PostureView = 'front' | 'back' | 'left' | 'right';

export type PostureIssues = {
	[view in PostureView]: string[];
};

interface Coordinates {
	x: number;
	y: number;
	z: number;
	visibility: number;
}

export interface PostureAnalysisItem {
	id: string;
	userId: string;
	view: 'front' | 'back' | 'left' | 'right';
	head: number;
	ear: number;
	shoulder: number;
	elbow: number;
	hip: number;
	knee: number;
	ankle: number;
	screenshot: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	postureAnalysisSessionId: string;
	coordinates: Coordinates[];
}

export interface PostNewInviteUserData {
	createdById: string;
	firstName: string;
	lastName: string;
	email: string;
	inviteUrl: string;
	invitedRole: string;
	inviteCode: string;
	deletedAt: string;
}

export interface BodyPoint {
	id: string;
	customRomTemplateExerciseId: string;
	name: string;
	kinematics: string;
	normal: number;
	wfl: number;
	min: number;
	max: number;
	createdAt: string;
	updatedAt: string;
	strapiOmniRomExerciseId: number;
	function: string;
	pointsToValidatePosition: SimplifiedPoints;
	pointsToCalculateAngle: SimplifiedPoints;
}

export interface RomTemplateExercise {
	id: string;
	customRomTemplateId: string;
	name: string;
	description: string;
	transitionTime: number;
	video: string;
	title: string;
	order: number;
	createdAt: string;
	updatedAt: string;
	bodyPoint: BodyPoint[];
	image: string;
	strapiOmniRomExercise: StrapiOmniRomExercises;
	exerciseLibrary: ExerciseLibrary | null;
	OmniRomExerciseId: {
		image: {
			url: string;
		};
		video: {
			url: string;
		};
		name: string;
		description: string;
	};
}

export interface CustomRomTemplate {
	id: string;
	clientId: string | null;
	title: string;
	description: string;
	active: boolean;
	finishAt: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	exercises: RomTemplateExercise[];
}

export interface CustomRomBodyPoints {
	id: string;
	name: string;
	kinematics: string;
	normal: number;
	wfl: number;
	min: number;
	max: number;
	createdAt: Date;
	updatedAt: Date;
	value: number;
	function: string;
	strapiOmniRomExerciseId: number;
	romProgramExercise: CustomRomBodyPoints;
	strapiOmniRomExercise: StrapiExercises;
	exerciseLibrary: ExerciseLibrary | null;
	pointsToCalculateAngle: StrapiOmniPointsToCalculateAngle;
	pointsToValidatePosition: StrapiOmniPointsToCalculateAngle;
}

export interface CustomRomExercise extends StrapiOmniRomExercises {
	id: string;
	customRomId: string;
	title: string;
	exercises: RomProgramExercise[];
	description: string;
	transitionTime: number;
	video: string;
	thumbnail: string;
	image: string;
	screenshot: string;
	order: number;
	bodyPoints: CustomRomBodyPoints[];
	romProgramExercise: CustomRomBodyPoints;
	romProgramexercise: CustomRomBodyPoints;
	createdAt: Date;
	strapiOmniRomExercise: StrapiOmniRomExercises;
	exerciseLibrary: ExerciseLibrary | null;
	value: number;
	updatedAt: Date;
	customRomExerciseLibraryId: string;
}

export interface CustomRom {
	id: string;
	userId: string;
	openSessionId: string;
	title: string;
	description: string;
	active: boolean;
	originType: string;
	finishAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	exercises: CustomRomExercise[];
	customRomSession: CustomRomSession[];
}

export interface CustomRomSession {
	id: string;
	title?: string;
	userId: string;
	finishAt: Date;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
	customRomId: string;
	customRomExerciseId: string;
	strapiOmniRomProgramId: number;
	romProgram: {
		title: string;
	};
	romProgramId: string;
	romPatientResults: CustomRomSessionExercise[];
	customRomSessionExercise: CustomRomSessionExercise[];
	persona: {
		color: string;
	};
}

export interface CustomRomSessionExercise {
	id: string;
	customRomSessionId: string;
	screenshot: string;
	customRomExercise: CustomRomExercise;
	customRomExerciseId: string;
	createdAt: Date;
	updatedAt: Date;
	results?: RomPatientResult[];
	coordinates: Coordinates[];
	image: string;
	value: number;
	bodyPoints: CustomRomBodyPoints[];
	description: string;
	title: string;
	transitionTime: number;
}

export interface CustonRomPaginated {
	data: CustomRom[];
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface CustonRomSessionPaginated {
	data: CustomRomSession[];
	pagination: IPaginationPluginDefaultResponse | null;
	romPatientResults: CustomRomSessionExercise[];
}

interface CaptureData {
	userId: string;
	strapiOmniRomExerciseId: string;
	romSessionId: string;
	value: unknown | null;
	coordinates: string;
	screenshot: string;
}

export interface CustomRomState {
	sendingMail: boolean;
	customRom: CustonRomPaginated;
	customRomSession: CustomRomSession | null;
	data: CustomRom[];
	pagination: IPaginationPluginDefaultResponse | null;
	romUploadDetails: unknown | null;
	pdfLink: string;
	customRomSessionData: CustonRomPaginated;
	selectedRom: CustomRomSession | null;
}

interface Point {
	id: number;
	value: number;
	name: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	locale: string;
}

export interface ExercisePoints {
	a: Point;
	b: Point;
	c: Point;
}

interface SimplifiedPoint {
	value: number;
	name: string;
}

export interface SimplifiedPoints {
	a: SimplifiedPoint;
	b: SimplifiedPoint;
	c: SimplifiedPoint;
}

export interface RomExerciseLibrary {
	id: string;
	physioterapistId: string;
	title: string;
	description: string;
	video: string;
	thumbnail: string;
	processing: boolean;
	jobId: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
	transitionTime?: number;
	exercises?: IStrapiExercises[];
}

export interface RomProgramExercise {
	id: string;
	vitalflowId: number;
	programId: string;
	transitionTime: number;
	strapiOmniRomExerciseId: number;
	exerciseLibraryId: string;
	normal: number;
	wfl: number;
	min: number;
	max: number;
	active: boolean;
	order: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: null;
	exerciseLibrary: RomExerciseLibrary;
	strapiOmniRomExercise: StrapiOmniRomExercises;
	strapiLibraryId: string;
	OmniRomExerciseId: {
		id: number | string;
		reference: StrapiOmniRomExerciseReference;
	};
}

interface TemplateExercise {
	id: number;
	order: number;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	OmniRomExerciseId: StrapiOmniRomExercises;
	video: string;
	name: string;
	description: string;
	transitionTime: number;
}

export interface TemplateExerciseProgram {
	id: number;
	title: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	exercises: TemplateExercise[];
}
export interface ProfileAdmin {
	id: string;
	userId: string;
	phone: ReactI18NextChildren | Iterable<ReactI18NextChildren>;
	email: string;
	firstName: string | null;
	lastName: string | null;
	fullName: string | null;
	imageUrl: string | null;
	preferredLanguages: string[] | null;
	birthDate: string | null;
	gender: string | null;
	isPregnant: boolean | null;
	imperialHeight: number | null;
	metricHeight: number | null;
	height: number | null;
	weight: number | null;
	imperialWeight: number | null;
	metricWeight: number | null;
	consentPolicyRead: boolean;
	patientId: string | null;
	role: string;
	avatarColor: string;
	mobilePhone?: string;
	invitedRole?: string;
	isActive?: boolean;
	consentPolicyAcceptedAt: string;
}

export interface AdminDashboardPatient {
	profile: ProfileAdmin;
	id: string;
	clientId: string;
	fusionAuthUserId: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
	isSelected?: boolean;
	physiotherapistPatientAssociationPatientIdRelation: PhysiotherapistPatientAssociation[];
}

export interface ResponseDataNewDashoard {
	data: AdminDashboardPatient[];
	pagination: UserPaginationDefaultResponse;
}
export interface Feature {
	id: string;
	name: string;
	description: string;
	path: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	userInviteId: string;
}
export interface InvitePatientModalProps {
	isInvitePatientModalOpen: boolean;
	handleUserUpdate?: (data: RegisteredPatientsProps) => void;
	setIsInvitePatientModalOpen: (val: boolean) => void;
	closable: boolean;
	fullRowDetails?: ProfileAdmin;
	rowData?: ProfileAdmin;
	isRegistered?: boolean;
	currentPage?: number;
	searchValue?: string;
	filterButton?: string;
	isBulkInvite?: boolean;
	isPending?: boolean;
	fetchDataList?: (page: number, filterButton: string) => void;
	savedTags?: TagsItem[];
	isLoading?: boolean;
}
export interface AllFeatureFlagsInterface {
	id: string;
	clientId: string;
	featureId?: string;
	default: boolean;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	feature: Feature;
}

interface CreatedBy {
	id: string;
	clientId: string;
	fusionAuthUserId: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
}

export interface InviteUserProps {
	id: string;
	createdById: string;
	firstName: string;
	lastName: string;
	email: string;
	inviteUrl: string;
	invitedRole: string;
	inviteCode: string;
	createdAt: string;
	deletedAt: string | null;
	createdBy: CreatedBy;
}

export interface UserFeatureProps {
	id: string;
	userId: string;
	featureId: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	feature: Feature;
}

export interface RegisteredPatientsProps {
	id: string;
	clientId: string;
	fusionAuthUserId: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
	profile: ProfileAdmin;
	physiotherapistPatientAssociationPatientIdRelation: PhysiotherapistPatientAssociation[];
}

export interface ShowPopStatus {
	showPopup: boolean;
}

export interface ProgramFilterOptions {
	goalSelection: string | null;
	bodyRegions: string[];
	workoutType: string | null;
	experienceLevel: string | null;
	timeAvailability: string | null;
	bodyRegionIds: number[];
	exerciseCategoriesIds: number[];
	jointsIds: string | number[];
	functionalGoalsIds: number[];
	sideIds: number[];
}

export interface ProgramExerciseLibrary extends StrapiExercises {
	physioterapistId: string;
	videoUrl: string;
	thumbnail: string;
	title: string;
	description: string;
	reps: number;
	sets: number;
	dailyReps: number;
	weeklyReps: number;
	visibility: boolean;
	processing: boolean;
	jobId: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
}

export interface ExerciseProps {
	setSelectedExercises: (selectedExercises: IExerciseDetails[]) => void;
	selectedExercises: IExerciseDetails[];
	isGrid: boolean;
	setGrid: (isGrid: boolean) => void;
	open: boolean;
	setOpen: (value: boolean) => void;
}

export interface AddCoverImageProps {
	openCoverImage: boolean;
	setOpenCoverImage: (value: boolean) => void;
	previewImage: string | null;
	setImgFile: (value: string) => void;
	previewUnSplashedImage: string | null;
	setPreviewImage: (value: string | null) => void;
	setPreviewUnSplashedImage: (value: string | null) => void;
}

export interface ExerciseDetailsModalData {
	strapiExerciseId: string;
	exerciseLibraryId: string;
	id: string;
	physioterapistId: string;
	videoUrl: string;
	thumbnail: string | null;
	title: string;
	description: string;
	reps: number;
	sets: number;
	dailyReps: number;
	weeklyReps: number;
	visibility: boolean;
	processing: boolean;
	jobId: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
	bodyRegionIds: string[];
	exerciseCategoriesIds: string[];
	jointsIds: string[];
	functionalGoalsIds: string[];
}

export interface TOnBoardSymptomsProps {
	setActiveStep: (value: number) => void;
	setProgressPercent: (value: number) => void;
	navigatorDirection?: 'forward' | 'backward';
	setNavigatorDirection: (val: 'forward' | 'backward') => void;
}

export interface TOnBoardPostureProps {
	setProgressPercent: (value: number) => void;
	onComplete: () => void;
}

export interface TOnBoardPostureProps {
	setActiveStepLocal?: (value: number) => void;
	setActiveStep?: (value: number) => void;
	setProgressPercent: (value: number) => void;
	onComplete: () => void;
}

export interface WholeDayActivity {
	[key: string]: number;
}

export interface TSideFilters {
	id: string;
	attributes: {
		name: string;
	};
}

export interface InvitationData {
	password: string;
	mobilePhone: string;
	adminIds: unknown;
	firstName?: string;
	lastName?: string;
	email?: string;
	invitedRole: string | undefined;
	message: string;
	planType: string;
}

export interface UploadedFile {
	uid: string;
	lastModified: number;
	lastModifiedDate: Date;
	name: string;
	size: number;
	type: string;
	webkitRelativePath: string;
}

export interface BulkInviteUser {
	message: string;
	invitedRole: string;
	users: {
		firstName: string;
		lastName: string;
		email: string;
		mobilePhone: string;
		adminIds: string[];
	}[];
	password: string;
}

export interface StrapNewiOmniRomExercise {
	id: number;
	name: string;
	description: string;
	order: number;
	function: string;
	bodySideTitle: string;
	movementTitle: string;
}

export interface NewRomProgramExercise {
	id: string;
	title: string;
	programId: string;
	transitionTime: number;
	strapiOmniRomExerciseId: number;
	exerciseLibraryId: string | null;
	normal: number;
	wfl: number;
	min: number;
	max: number | null;
	active: boolean;
	order: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	exerciseLibrary: string | null;
	strapiOmniRomExercise: StrapNewiOmniRomExercise;
	title: string | null;
}

export interface OmniRomResult {
	id: string;
	outOfRange: boolean;
	value: number;
	normal: number;
	wfl: number;
	min: number;
	max: number;
	createdAt: string;
	updatedAt: string;
	romProgramExerciseId: string;
	romPatientResultId: string;
	score: number;
	mobilityMapper: string;
	romProgramExercise: NewRomProgramExercise;
}

export interface OmniRomRomPatientResult {
	id: number;
	coordinates: PoseLandmark[];
	userId: string;
	romProgramExerciseId: string;
	title: string;
	screenshot: string;
	value: number;
	outOfRange: boolean;
	createdAt: string;
	updatedAt: string;
	romSessionId: string;
	reportsId: string | null;
	strapiOmniRomExerciseId: string | null;
	results: OmniRomResult[];
	normal: number;
	wfl: number;
	min: number;
	max: number;
	romPatientResultId: string;
	score: number;
	mobilityMapper: string;
	romProgramExercise: NewRomProgramExercise;
}

export interface TOmniromSelectedExercise {
	createdAt: string;
	estimatedMinutes: number;
	estimatedSeconds: number;
	id: number;
	title: string;
	updatedAt: string;
}

export interface Plans {
	id?: string;
	title: string;
	description: string;
	thumbnail: string;
	planType?: string;
	imageFile?: File;
	clientId?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IFunctionalGoals {
	id?: string;
	title: string;
	description: string;
	thumbnail: string;
	functionalGoalId: number;
	imageFile?: File;
	clientId?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface PreExistingConditions {
	id?: string;
	title: string;
	description: string;
	thumbnail: string;
	imageFile?: File;
	clientId?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface SelfRegistration {
	id: string;
	active: boolean;
	clientId: string;
	createdAt: string;
	updatedAt: string;
}

export interface SettingsInitialState {
	clientId: string;
	savedUserPlans: TUserPlan;
	openaiApiKey: string;
	inviteCode: string;
	emailTemplate: string;
	inviteTemplate: string;
	consentFormTemplate: string;
	romTemplate: string;
	plans: Plans[];
	functionalGoals: IFunctionalGoals[];
	preExistingConditions: PreExistingConditions;
	selfRegistration: SelfRegistration;
	getTheme: {
		id: string;
		name: string;
		clientId: string;
		createdAt: string;
		updatedAt: string;
		locked: false;
	};
	getSavedTags: TagsDetails[];
	bandwidth: boolean | null;
}
export interface TUserPlan {
	id: string;
	userId: string;
	clientId: string;
	planType: string;
	createdAt: string;
	updatedAt: string;
}
export interface TUPdatedPlans {
	id: string;
	value: string;
	label: string;
	plan: string;
}

export interface TUPdatedPlans {
	id: string;
	value: string;
	label: string;
	plan: string;
}

export interface Invitation {
	firstName: string;
	lastName: string;
	email: string;
	invitedRole: string;
	adminIds?: string[];
	message?: string;
	mobilePhone?: string;
	password?: string;
	planType: string | undefined;
	phone?: string;
	tags: string[];
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

export interface InviteUser {
	id: string;
	physiotherapistPatientAssociationPatientIdRelation: {
		patientId: string;
		physiotherapistId: string;
		physiotherapist: Physiotherapist;
	}[];
	profile: {
		email: string;
		firstName: string;
		lastName: string;
		avatarColor?: string;
		phone: string | number;
	};
}

export interface ProgramOnBoard {
	id: string;
	userId: string;
	name: string;
	description: string;
	thumbnail: string;
	active: boolean;
	duration: number;
	durationType: 'days' | 'weeks' | string;
	startAt: string | null;
	finishAt: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	status: string;
	originType: string;
	programTemplateId: string | null;
	strapiProgramTemplateId: string | null;
	exercises: Exercise[];
}

export interface ProgramItem {
	id: string;
	thumbnail: string;
	exercises: {
		image?: string;
		exerciseLibrary?: {
			videoUrl?: string;
		};
	}[];
	name: string;
	updatedAt?: string;
	duration?: number;
	durationType?: string;
}

export interface ProgramPatient {
	programData: ProgramOnBoard[];
	fetchHomeData: (vlaue: number) => void;
	pagination: {
		pageCount: number;
		totalCount: number;
	};
}

export type FormDataType = {
	goalSelection: string | null;
	experienceLevel: string | null;
	timeAvailability: string | null;
	workoutPreference: string | null;
};

export interface TSuggestedProgram {
	id: string;
	exercises: TSuggestedProgrammExerciseItem[];
	name: string;
	thumbnail: {
		url: string;
	};
	functional_goals: {
		name: string;
	}[];
	duration: number;
	durationType: string;
	description: string;
}

export interface TSuggestedProgrammExerciseItem {
	strapiExerciseId: {
		id: string;
		exercise_image: {
			url: string;
		}[];
	};
	exerciseLibraryId: string | null;
	weeklyReps: number;
	dailyReps: number;
	sets: number;
	reps: number;
	thumbnail: {
		url?: string;
	};
}

export interface SelectedProgramProps {
	state?: {
		state?: {
			domain: string;
			selectedProgram: SuggestedProgramItem;
		};
	};
}

export interface SuggestedProgramItem {
	id: string;
	description: string;
	attributes: {
		exercise_video: {
			data: {
				attributes: {
					url: string;
				};
			}[];
		};
	};
	exercises?: {
		strapiExerciseId: {
			name: string;
			id: string;
			vitalflowId: string;
			exercise_image: {
				url: string;
			}[];
			exercise_video: {
				url: string;
			}[];
			description: string;
		};
		exerciseLibraryId: string | null;
		exerciseLibrary: {
			videoUrl: string | undefined;
		};
		weeklyReps: number;
		dailyReps: number;
		sets: number;
		reps: number;
		thumbnail: {
			url?: string;
		};
	}[];
	functional_goals?: {
		name: string;
	}[];
	thumbnail: {
		url?: string;
	};
	name: string;
	updatedAt: string;
	duration: number;
	durationType: string;
}

export interface SelectedProgramModalData {
	selectedProgram: SuggestedProgramItem;
	domain: string;
}

export interface IFunctionalGoal {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}
export interface SelectedProgram {
	id: string;
	name: string;
	description: string;
	duration: number;
	durationType: string;
	experienceLevel: string;
	functional_goals: FunctionalGoal[];
	subgoal: string;
	timeAvailability: string;
	workoutType: string;
	locale: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	thumbnail:
		| string
		| {
				id: number;
				name: string;
				alternativeText: string | null;
				caption: string | null;
				width: number;
				url: string;
		  };
	exercises: IProgramExercise[];
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

export interface SurevyEdit {
	id?: string;
	title?: string;
	description?: string;
	questionType?: string;
	order?: number;
	optionList?: SurveyOptionListOperations;
	userId?: string;
	physioterapistId?: string;
	active?: boolean;
	status?: string;
}

export interface SurveyOptionListOperations {
	create: SurveyOptionPayload[];
	update: SurveyOptionPayload[];
	delete?: { id: string }[];
}

export enum RomTransitions {
	INTRO = 'intro',
	CALIBRATION = 'calibration',
	READYSETGO = 'readySetGo',
	CLOSING = 'closing',
	RESULT = 'result',
	OPENNING = 'openning',
}

export interface RomScanProps {
	session: CustomRomSession | null;
	exercises: CustomRomExercise[];
	currentExercise: CustomRomExercise | null;
	outOfRangeExercises: CustomRomExercise[];
	selectedExercises: CustomRomExercise[];
	resultsExercises: CustomRomExercise[];
	strapiOmniRomExerciseGroupId: number | string | null;
	uploadProgress: number;
	bodyPointsVisible: boolean;
	transition: RomTransitionNode | null;
	metricsData: CaptureData | null;
	pose: {
		angleResults: number[];
		multiCoordinates: NormalizedLandmark[][];
	};
	cameraId: string;
	delete?: { id: string }[];
}
export type GroupedScanResult<T = unknown> = {
	sortedData: T[];
	groupedByView: Record<'front' | 'back' | 'left' | 'right', T[]>;
	front: T | null;
	back: T | null;
	left: T | null;
	right: T | null;
};

export interface TagsDetails {
	id: string;
	name: string;
	clientId: string;
	createdAt: string;
	updatedAt: string;
}
export interface TagsItem {
	id: string;
	clientId: string;
	userId: string;
	tagId: string;
	createdAt: string;
	updatedAt: string;
	tag: TagsDetails;
}

export interface ACanvasProps {
	canvasState: CanvasState;
	onStateChange: (updates: Partial<CanvasState>) => void;
	onMouseMove: (position: { x: number; y: number }) => void;
	onDimensionsChange: (width: number, height: number) => void;
	onCanvasClick?: (x: number, y: number) => void;
	hoveredLandmark: number | null;
	setHoveredLandmark: (index: number | null) => void;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	imageLayerCanvasRef: React.RefObject<HTMLCanvasElement | null>;
	aiLandMarks: { x: number; y: number }[];
}

export interface PoseLandmark {
	x: number;
	y: number;
	z?: number;
	visibility?: number;
}

export interface Annotation {
	id: string;
	landmarks: PoseLandmark[];
	timestamp: number;
	imageName: string;
}

export interface ContentRomResultProps {
	getColorForCategory: (score: number) => string;
	getCategoryName: (score: number) => string;
	selectedRom: CustomRomSession;
	isPdf?: boolean;
	fetchData: (value: string) => void;
}

export interface PostureAnalyticsItem {
	id: string;
	userId: string;
	view: 'front' | 'back' | 'left' | 'right';
	head: number;
	ear: number;
	shoulder: number;
	elbow: number;
	hip: number;
	knee: number;
	ankle: number;
	screenshot: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	postureAnalyticsSessionId: string;
	coordinates: Coordinates[];
}

export interface IPostureReportItem {
	id: string;
	clientId: string;
	userId: string;
	sessionId: string;
	front?: FrontPostureAssessment;
	left?: SidePostureAssessment;
	right?: SidePostureAssessment;
	back?: BackPostureAssessment;
	createdAt: string;
	updatedAt: string;
	report: IPostureReportItem;
}

export interface IPosture {
	id: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
	postureAnalytics: PostureAnalyticsItem[];
	report: IPostureReportItem;
}

export interface IPreExistingConditions {
	id?: string;
	title: string;
	description: string;
	thumbnail: string;
	imageFile?: File;
	clientId?: string;
	createdAt?: Date;
	updatedAt?: Date;
}
