/**
 * patient.ts
 *
 * Patient and user management types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 79
 */

import { ReactNode } from 'react';

// ============================================================================
// PATIENT TYPES (79 declarations)
// ============================================================================

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

export enum StatusPatients {
	unAssignedPatients = 'unAssignedPatients',
	pendingInvites = 'pendingInvites',
	registeredPatients = 'registeredPatients',
	consentFormPatients = 'consentFormPatients',
}

export type IStatusNormalizedPatients = Record<StatusPatients, string>;

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

export interface AllAdminPayload {
	limit?: number;
	page?: number;
	name?: string;
}

export enum UserToolStatusEnum {
	assignRehab,
	assignedRehab,
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

export interface SavePhysioterapistVideoToPatient {
	userId: string;
	body: Body;
}

export interface RehabCreatePatientResultExercise {
	userId: string;
	rehabPatientListExerciseId: string;
	rehabExerciseToPatientId: string;
	video: string;
	exerciseDifficultyLevel?: string;
}

export type IRehabCreatePatientEvaluation = RehabCreatePatientResultExercise;

export interface RehabPatientResultsPaginated {
	data: RehabPatientResultExercise[];
	pagination: IPaginationPluginDefaultResponse;
}

export interface CreatePatientResult {
	userId: string;
	romExerciseId: string;
	value: number;
	screenshot: string;
}

export interface GetPatientResults {
	userId: string;
	exerciseId: string;
	rangeDate: RangeDate;
}

export interface MovrRomCreatePatientResult {
	userId: string;
	movrExerciseId: string;
	value: string;
	screenshot: string;
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

export interface PerformanceSaveUserProgress {
	userId: string;
	performanceExerciseId: string;
	time: number;
}

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

export interface ROMPatientResult extends RomPatientResult {
	romSessionId: string;
	strapiOmniRomExercise: StrapiOmniRomExercises;

	strapiOmniRomExerciseId?: number;
}

export interface UserExerciseResult extends IGeneralDetails {
	romPatientResults: GroupedData;
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

export interface SavePhysioterapistVideoToPatient {
	userId: string;
	body: SaveVideoToRehab[];
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

export interface ProfileModalProps {
	isModalOpen: boolean;
	setIsModalOpen: (isModalOpen: boolean) => void;
	setPolicyModalOpen: (policyModalOpen: boolean) => void;
	policyModalOpen: boolean;
	closable: boolean;
	onEdit: boolean;
	rowData?: ProfileAdmin;
	isAdminEdit?: boolean;
}

export interface ProfileFormProps {
	policyModalOpen: boolean;
	onEdit?: boolean;
	isAdminEdit?: boolean;
	onFinish?: () => void;
	setIsModalOpen: (value: boolean) => void;
	userFormData?: TProfileData;
	setUserFormData?: (item: TProfileData) => void;
	isBirthDateError?: boolean;
	setPolicyModalOpen: (value: boolean) => void;
	handleCheck?: (value: boolean) => void;
	rowData?: ProfileAdmin;
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

export interface PatientListDataProps {
	active: boolean;
	data: UserData;
	email: string;
	firstName: string;
	id: string;
	fusionAuthUserId: string;
	createdAt: string;
}

export interface MenuAdminProps {
	label: string;
	key: string;
	icon: ReactNode;
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

export interface TUserPlan {
	id: string;
	userId: string;
	clientId: string;
	planType: string;
	createdAt: string;
	updatedAt: string;
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

export interface ProgramPatient {
	programData: ProgramOnBoard[];
	fetchHomeData: (vlaue: number) => void;
	pagination: {
		pageCount: number;
		totalCount: number;
	};
}
