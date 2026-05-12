/**
 * clinical.ts
 *
 * Clinical assessment types (ROM, Rehab, Posture, Pain)
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 209
 */

import { Dispatch, ReactNode, SetStateAction } from 'react';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

// ============================================================================
// CLINICAL TYPES (209 declarations)
// ============================================================================

export enum BodyRegion {
	full = 'full',
	upperBody = 'upperBody',
	upperRight = 'upperRight',
	upperLeft = 'upperLeft',
	lowerBody = 'lowerBody',
	lowerRight = 'lowerRight',
	lowerLeft = 'lowerLeft',
}

export type IBodyRegionNormalized = Record<BodyRegion, string>;

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

export type IOminiRom = IRomRehab;

export type IRehab = IRomRehab;

export type IEvaluationData = IRomRehab;

export type IPostureDataStatus = IRomRehab;

export interface SessionResponsePayload {
	data: UserWithSession[];
	pagination: UserPaginationDefaultResponse;
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

export type IStrapiHealthSign = StrapiGeneral;

export type IStrapiMedicalHistory = StrapiGeneral;

export interface EvaluationHealthSigns extends Evaluation {
	strapiHealthSignsIds: number[];
	strapiHealthSigns?: IStrapiHealthSign[];
}

export interface EvaluationMedicalHistory extends Evaluation {
	strapiMedicalHistoriesIds: number[];
	strapiMedicalHistories?: IStrapiMedicalHistory[];
}

export interface EvaluationPainAssessment extends Evaluation, IIds {
	strapiBodyPoint?: EvaluationBodyPoint;
}

export interface EvaluationPainAssessmentOptions {
	aggravatingFactors: IOptions[];
	relievingFactors: IOptions[];
	painCauses: IOptions[];
	painDurations: IOptions[];
	painFrequencies: IOptions[];
	painStatuses: IOptions[];
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

export interface LetsMovePrescribedExercises {
	success: string;
	result: [];
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

export interface RehabExerciseEffort {
	createdAt: Date;
	id: string;
	name: string;
	updatedAt: Date;
}

export interface RehabSessionResponsePaginated {
	data: UserWithSession[];
	pagination: IPaginationPluginDefaultResponse;
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

export interface RomBodyPoint extends RomPainFrequency {
	romStyle: IBodyPointsStyle;
	romPosition: string;
}

export interface RomExercise extends IExerciseDetails {
	romExerciseGroupId?: string;
	result?: number;
	screenshot?: string;
}

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

export interface RehabCreateLibraryExercises
	extends ISetRepexercise,
		ILibExercise {
	get: (value: string) => string;
	video: string;
	userId?: string;
}

export interface PersonalExercise
	extends Partial<ISetRepexercise>,
		ILibExercise,
		IProcessId {
	videoUrl: string;
	jobId: string;
	active: true;
}

export interface IStrapiExercises extends IPrescribeStrpiExe {
	assets: IStrapiExerciseAssets[];
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

export interface IRehabExercisesLibrary
	extends RehabCreateLibraryExercises,
		IProcessId {
	active: boolean;
	jobId: string;
	videoUrl: string;
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

export interface MovrRomExercise extends IExerciseDetails {
	movrId: number;
	movrExerciseGroup?: MovrExercise;
	movrExerciseGroupId?: string;
	result?: number;
	screenshot?: string;
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

export interface TStrapiBodyPointAttributes extends TStrapiAttributes {
	position: string;
}

export interface TStrapiBodyPoint {
	id: number;
	attributes: TStrapiBodyPointAttributes;
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

export interface ROMExercise extends IExerciseDetails {
	romExerciseGroupId: string;
}

export interface RomeRequestParam extends DefaultPagination {
	patientId: string;
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

export interface exercisePropType {
	id?: string;
	userId?: string;
	physioterapistId?: string;
	title?: string;
	createdAt?: Date;
	updatedAt?: Date;
	rehabExerciseToPatient?: rehabExerciseToPatientProp[] | [];
}

export interface SaveVideoToRehab {
	strapiExerciseId: number;
	repetitions: number;
	setsPerSession: number;
	setsPerDay: number;
	frequencyPerWeek: number;
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

export interface GraphSessionData {
	data: RehabPatientResultExercise[];
	pagination: IPaginationPluginDefaultResponse | null;
}

export interface GraphSessionRequestParam {
	patientId: string;
	rehabExerciseToPatientId: string;
}

export interface EvaluationItem {
	title: string;
	subtitle: string;
	data: ActivityStreamData;
	value: boolean;
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
	isSaving: boolean;
}

export interface RomSummaryDataProps {
	isAssistant?: boolean;
	groupData?: [];
	isLoading: boolean;
	currentPage: number;
	onPageChange: (page: number) => void;
	totalPage: number;
}

export interface IExerciseProps {
	setSelectedSurvey: (selectedSurvey: Survey | null) => void;
	searchValue: string;
	setSearchValue: (value: string) => void;
	setActiveKey: (value: string) => void;
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

export interface ProgramSummaryProps {
	antIcon: ReactNode;
	CustomModalInfo: (value: CustomModalProps) => void;
}

export interface AiProgramSummaryContent {
	item: IProgram;
	activeInnerKey?: string;
	setActiveInnerKey?: (value: string) => void;
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

export interface RomResultDataProps {
	transitionTime: number;
	isValidResult: boolean | null;
	onSavePhysicalAssessmentsMetrics: () => void;
	isSaving: boolean;
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
	/** Hide control buttons when external control bar is used */
	hideControls?: boolean;
}

export interface TPainAssessmentDataProps {
	apiData: TCoachSummary;
	fetchData: (limit: number, page: number) => void;
	perPage?: number;
	currentPage: number;
	onEvaluationClick?: (evaluation: TDataProps) => void;
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
	whatMeans?: string;
	whatCause?: string;
	whatHelps?: string;
	programTemplates: ProgramTemplate[];
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
	exerciseRecommendations?: ExerciseLibrary[];
	exerciseTracking?: ExerciseTracking | null;
	exerciseRecommendationsLoading?: boolean;
	exerciseTrackingLoading?: boolean;
	// Milestone state (Story 2.4)
	milestones?: {
		earned: unknown[]; // Milestone[]
		progress: unknown[]; // MilestoneProgress[]
		lastChecked: string;
		loading: boolean;
		error: string | null;
	};
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
	postureAnalytics: PostureAnalysisItem[]; // API returns 'postureAnalytics' not 'postureAnalysis'
	report: PostureReportItem;
	status?: string; // Added from API response
	reportsId?: string | null; // Added from API response
}

export type PostureView = 'front' | 'back' | 'left' | 'right';

export type PostureIssues = {
	[view in PostureView]: string[];
};

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

export interface ExercisePoints {
	a: Point;
	b: Point;
	c: Point;
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

export interface TemplateExerciseProgram {
	id: number;
	title: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	exercises: TemplateExercise[];
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

export interface TOmniromSelectedExercise {
	createdAt: string;
	estimatedMinutes: number;
	estimatedSeconds: number;
	id: number;
	title: string;
	updatedAt: string;
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

export interface ContentRomResultProps {
	getColorForCategory: (score: number) => string;
	getCategoryName: (score: number) => string;
	selectedRom: CustomRomSession;
	isPdf?: boolean;
	fetchData: (value: string) => void;
}

// ============================================================================
// EXERCISE LIBRARY & RECOMMENDATIONS (Story 2.3)
// ============================================================================

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type MuscleGroup =
	| 'Neck/Shoulders'
	| 'Upper Back'
	| 'Lower Back'
	| 'Core'
	| 'Hips/Pelvis';

export interface InstructionStep {
	step: number;
	instruction: string;
	imageUrl?: string;
}

export interface ExerciseLibrary {
	id: number;
	title: string;
	description: string;
	duration: number; // seconds
	difficulty: ExerciseDifficulty;
	muscleGroups: MuscleGroup[];
	videoUrl: string;
	thumbnailUrl: string;
	instructions: InstructionStep[];
	safetyTips: string;
	contraindications: string;
	captionsUrl?: string; // VTT format
	postureRecommendation?: boolean;
}

export interface CompletionRecord {
	date: string; // ISO date
	duration: number; // seconds
}

export interface ExerciseTrackingData {
	completions: CompletionRecord[];
	currentStreak: number;
	longestStreak: number;
	lastCompleted: string; // ISO date
}

export interface ExerciseTracking {
	userId: string;
	exercises: {
		[exerciseId: string]: ExerciseTrackingData;
	};
}

export interface ExerciseRecommendationFilters {
	muscleGroup: MuscleGroup | 'All';
	difficulty: ExerciseDifficulty | 'All';
}

export type ExerciseSortOption =
	| 'priority'
	| 'alphabetical'
	| 'duration'
	| 'difficulty';

// ============================================================================
// POSTURE COMPARISON TYPES (Story 2.2)
// ============================================================================

export type AnnotationType = 'angle' | 'landmark' | 'area' | 'arrow';

export interface PostureAnnotation {
	id: string;
	type: AnnotationType;
	coordinates: { x: number; y: number }[];
	label: string;
	value?: string; // e.g., "15°", "+5mm"
	color: string; // CSS custom property or hex
	opacity?: number; // 0.0 - 1.0
}

export interface ImprovementIndicator {
	id: string;
	bodyPart: string; // e.g., "shoulder alignment", "neck tilt"
	deltaValue: number; // positive = improvement, negative = regression
	deltaUnit: string; // e.g., "°", "mm", "%"
	description: string; // e.g., "Shoulder alignment +15°"
	direction: 'improved' | 'attention' | 'stable';
	severity?: 'mild' | 'moderate' | 'severe';
}

export interface AttentionArea {
	id: string;
	bodyPart: string;
	issue: string; // e.g., "forward head posture"
	severity: 'mild' | 'moderate' | 'severe';
	coordinates: { x: number; y: number }[]; // polygon coordinates
	color: string; // yellow/orange based on severity
	recommendations?: string[]; // exercise IDs to address this issue
}

export interface PostureAnalysis {
	id: string;
	userId: string;
	sessionId: string;
	baselineImageUrl: string;
	currentImageUrl: string;
	baselineThumbnailUrl?: string; // blur placeholder
	currentThumbnailUrl?: string; // blur placeholder
	scanDate: string; // ISO date string
	baselineDate: string; // ISO date string
	annotations: PostureAnnotation[];
	improvements: ImprovementIndicator[];
	attentionAreas: AttentionArea[];
	clinicalNotes?: string;
	overallScore?: number; // 0-100
	createdAt: string;
	updatedAt: string;
}

export interface PostureComparisonSummary {
	totalAreas: number;
	improvedCount: number;
	attentionCount: number;
	stableCount: number;
	overallProgress: 'improved' | 'stable' | 'declined';
}

// ============================================================================
// CLINICAL REASONING TRANSPARENCY TYPES (Story 2.7 - FR26)
// ============================================================================

export type SeverityLevel = 'mild' | 'moderate' | 'severe';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type EducationalResourceType = 'article' | 'video' | 'diagram';
export type EducationalResourceSource = 'strapi' | 'external';

export interface PostureFinding {
	id: string;
	bodyArea: string; // e.g., "neck", "shoulders", "upper back"
	measurement: string; // e.g., "15° forward tilt", "12° internal rotation"
	severity: SeverityLevel;
	priority: PriorityLevel;
	description: string; // Plain language description
}

export interface EducationalResource {
	id: string;
	title: string;
	url: string;
	type: EducationalResourceType;
	source: EducationalResourceSource;
	description?: string;
	thumbnailUrl?: string;
	duration?: number; // For videos, in seconds
}

export interface ClinicalReasoning {
	exerciseId: string;
	explanation: string; // Plain language explanation (Flesch ≥60)
	postureFindings: PostureFinding[];
	expectedOutcome: string; // e.g., "Reduced neck tension within 2-3 weeks"
	timeline: string; // e.g., "2-3 weeks", "4-6 weeks"
	evidenceLinks: EducationalResource[];
	benefits: string[]; // Bullet points of benefits
	// Readability metadata
	readabilityScore?: number; // Flesch Reading Ease score
	avgSentenceLength?: number; // Words per sentence
	medicalJargonCount?: number; // Number of medical terms
}

export interface ClinicalSummary {
	topConcerns: PostureFinding[]; // Top 3 posture concerns
	overallAssessment: string; // Plain language overall assessment
	treatmentPlan: string; // Treatment approach summary
	progressIndicators: string[]; // What to watch for improvement
	expectedImprovementTimeline: string; // Overall timeline
	generatedAt: string; // ISO date string
}

// Extended ExerciseLibrary to include clinical reasoning
export interface ExerciseLibraryWithReasoning extends ExerciseLibrary {
	clinicalReasoning?: ClinicalReasoning;
}

// Posture analysis with clinical notes
export interface PostureAnalysisWithClinicalNotes extends PostureAnalysis {
	clinicalSummary?: ClinicalSummary;
	exerciseRecommendations?: ExerciseLibraryWithReasoning[];
}
