import { measurementTypes } from '@pages/PatientOnboard/Constants';
import { router } from '@routers/routers';
import { IBodyRegionNormalized, IStatusNormalized } from '@types';
import { TFunction } from 'i18next';

export const CONSTANT = {
	SITTINGBASELINESCAN: 'Sitting Baseline Scan ',
};

export const connections: [number, number][] = [
	[11, 12],
	[11, 13],
	[13, 15],
	[15, 17],
	[15, 19],
	[15, 21],
	[17, 19],
	[12, 14],
	[14, 16],
	[16, 18],
	[16, 20],
	[16, 22],
	[18, 20],
	[11, 23],
	[12, 24],
	[23, 24],
	[23, 25],
	[24, 26],
	[25, 27],
	[26, 28],
	[27, 29],
	[28, 30],
	[29, 31],
	[30, 32],
	[27, 31],
	[28, 32],
];

export const BodyRegionNormalized: IBodyRegionNormalized = {
	full: 'Full Body',
	upperBody: 'Upper Body',
	upperRight: 'Upper Right',
	upperLeft: 'Upper Left',
	lowerBody: 'Lower Body',
	lowerRight: 'Lower Right',
	lowerLeft: 'Lower Left',
};

export const getMobilityData = (score: number, t: TFunction) => [
	{
		range: t('patient.reports.mobility.range1'),
		title: t('patient.reports.mobility.title1'),
		description: t('patient.reports.mobility.description1'),
		icon: '/assets/optimal.png',
		selectedIcon: '/assets/optimal.png',
		className: 'limitless',
		active: score >= 90,
		color: 'var(--color-success-600)',
	},
	{
		range: t('patient.reports.mobility.range2'),
		title: t('patient.reports.mobility.title2'),
		description: t('patient.reports.mobility.description2'),
		icon: '/assets/functional.png',
		selectedIcon: '/assets/functional.png',
		className: 'agile',
		active: score >= 75 && score <= 89,
		color: 'var(--color-success-400)',
	},
	{
		range: t('patient.reports.mobility.range3'),
		title: t('patient.reports.mobility.title3'),
		description: t('patient.reports.mobility.description'),
		icon: '/assets/moderate.png',
		selectedIcon: '/assets/moderate.png',
		className: 'functional',
		active: score >= 60 && score <= 74,
		color: 'var(--color-warning-600)',
	},
	{
		range: t('patient.reports.mobility.range4'),
		title: t('patient.reports.mobility.title4'),
		description: t('patient.reports.mobility.description4'),
		icon: '/assets/restricted.png',
		selectedIcon: '/assets/restricted.png',
		className: 'steady',
		active: score >= 40 && score <= 59,
		color: 'var(--color-warning-500)',
	},
	{
		range: t('patient.reports.mobility.range5'),
		title: t('patient.reports.mobility.title5'),
		description: t('patient.reports.mobility.description5'),
		icon: '/assets/severely.png',
		selectedIcon: '/assets/severely.png',
		className: 'resilient',
		active: score >= 20 && score <= 39,
		color: 'var(--color-error-500)',
	},
	{
		range: t('patient.reports.mobility.range6'),
		title: t('patient.reports.mobility.title6'),
		description: t('patient.reports.mobility.description6'),
		icon: '/assets/critically.png',
		selectedIcon: '/assets/critically.png',
		className: 'determined',
		active: score < 20,
		color: 'var(--color-error-600)',
	},
];

export const navigationConfig = {
	patientKey: { path: router.USERPATIENTVIEW },
	userActivity: { path: router.ACTIVITY },
	activity: { path: router.ACTIVITY },
	myReport: { path: router.AIASSISTANT_MY_REPORT },
	listEvaluation: { path: router.AIASSISTANT_LIST_EVALUATION },
	romSummary: { path: router.AIASSISTANT_ROM_SUMMARY },
	romProgram: { path: router.AIASSISTANT_ROM_PROGRAM },
	captures: { path: router.AIASSISTANT_CAPTURES },
	startScan: { path: router.AIASSISTANT_START_SCAN },
	startRomScan: { path: router.AIASSISTANT_START_ROM_SCAN },
	splashPage: { path: router.SPLASHPAGE },
	postureScan: { path: router.AIASSISTANT_POSTURE_SCAN },
	postureSummary: { path: router.AIASSISTANT_POSTURE_SUMMARY },
	postureCaptures: { path: router.AIASSISTANT_POSTURE_CAPTURES },
	customSummary: { path: router.AIASSISTANT_CUSTOM_SUMMARY },
	customCaptures: { path: router.AIASSISTANT_CUSTOM_CAPTURES },
	generateProgram: {
		path: router.AIASSISTANT_GENERATE_PROGRAM,
		state: { isGenerate: true },
	},
	programs: { path: router.AIASSISTANT_PROGRAMS, state: { isGenerate: false } },
	listSessions: { path: router.AIASSISTANT_LIST_SESSIONS },
	downloadApp: { path: router.DOWNLOAD_APP },
	surveySummary: { path: router.AIASSISTANT_SURVEY_SUMMARY },
	virtualEvaluation: { path: router.AIASSISTANT_VIRTUAL_EVALUATION },
	createReport: { path: router.AIASSISTANT_CREATE_REPORT },
	assignSurvey: {
		path: router.AIASSISTANT_ASSIGN_SURVEY,
		state: { openSurveyModal: true, isGenerate: true },
	},
	createSurvey: {
		path: router.AIASSISTANT_CREATE_SURVEY,
		state: { openSurveyModal: false, isGenerate: false },
	},
	startSurveyUser: { path: router.AIASSISTANT_START_SURVEY_USER },
	newPatients: { path: router.NEW_PATIENTS },
	outOfParams: { path: router.OUTOFPARAMETERS },
	pendingReview: { path: router.PENDINGREVIEW },
	reviewed: { path: router.REVIEWED },
	escalationRequired: { path: router.ESCALATIONREQUIRED },
	noComponentFound: { path: router.AIASSISTANT_PAGENOTFOUND },
	notUnderstandQuestion: { path: router.AIASSISTANT_SEARCHNOTFOUND },
	overview: { path: 'overview' },
};

export const StatusNormalized: Omit<IStatusNormalized, 'newPatients'> = {
	pendingReview: 'Pending Review',
	outOfParams: 'Out Of Parameters',
	followUpRequired: 'Follow Up Required',
	escalationRequired: 'Escalation Required',
	reviewed: 'Reviewed',
};

export const limitPagination = 10;

export const pagination = {
	isFirstPage: true,
	isLastPage: true,
	currentPage: 0,
	previousPage: 0,
	nextPage: 1,
	pageCount: 0,
	totalCount: 0,
};

export const countdownTime = 3000;

export const patientTimeLimit = 60000;

export const adminTimeLimit = 10000;

export const USER_ROLES = {
	ADMIN: 'admin',
	SUPER_ADMIN: 'superadmin',
	USER: 'user',
};

export const ACTIVETAB = {
	ROM_SCAN_RESULTS: 'romScanResults',
	HOME: 'home',
	DOWNLOAD_APP: 'downloadApp',
	START_SCAN: 'startScan',
	ROM_SUMMARY: 'romSummary',
	THEME: 'theme',
	OPENAI: 'OpenAi',
	TEMPLATES: 'templates',
	CONSENT_FORM: 'consentForm',
	EXPORT_REPORTS: 'exportReports',
	CONTENT_MANAGER: 'contentManager',
	INVITE_CODE: 'InviteCode',
	PROGRAMS: 'programs',
	EVALUATION: 'Evaluation',
	OMNIROM: 'VitalScan ROM',
	SURVEYS: 'Surveys',
	LETSMOVE: "Let's Move",
	ROMSUMMARY: 'romSummary',
	LIST_SESSIONS: 'listSessions',
	SURVEYSUMMARY: 'surveySummary',
	LIST_EVALUATION: 'listEvaluation',
	ACTIVE_TAB: 'active-tab',
};

export const functionalGoalsMap: Record<string, number[]> = {
	'Recovery & Managing Discomfort': [1, 3, 4],
	'Functional Independence & Daily Living': [2, 8],
	'Performance Enhancement & Injury Prevention': [6, 7],
	'Holistic Well-being & Quality of Life': [5, 9, 10],
};

export const titleToIconMapOld: Record<string, number> = {
	'Recovery & Managing Discomfort': 1,
	'Functional Independence & Daily Living': 2,
	'Performance Enhancement & Injury Prevention': 3,
	'Holistic Well-being & Quality of Life': 4,
};

export const MONTHS = [
	{ value: 1, label: 'Jan' },
	{ value: 2, label: 'Feb' },
	{ value: 3, label: 'Mar' },
	{ value: 4, label: 'Apr' },
	{ value: 5, label: 'May' },
	{ value: 6, label: 'Jun' },
	{ value: 7, label: 'Jul' },
	{ value: 8, label: 'Aug' },
	{ value: 9, label: 'Sep' },
	{ value: 10, label: 'Oct' },
	{ value: 11, label: 'Nov' },
	{ value: 12, label: 'Dec' },
];

export const DEFAULT_FORM_DATA = {
	firstName: '',
	lastName: '',
	email: '',
	imageUrl: '',
	birthDate: '',
	gender: '',
	imperialHeight: 0,
	metricHeight: 0,
	imperialWeight: 0,
	metricWeight: 0,
	isPregnant: false,
	consentPolicyRead: false,
	patientId: '',
	measurementSystem: measurementTypes.IMPERIAL,
	mobilePhone: '',
	weight: '',
	height: '',
	planType: '',
	tags: [],
};

export const THEME = {
	VIBRANT: 'vibrant',
	DARK: 'dark',
	DEFAULT: 'default',
};

export const activityKeys = [
	'sitting',
	'standing',
	'bending',
	'lifting',
	'walking',
	'sleeping',
];

export const ROUTE_KEYS = {
	DOWNLOAD_APP: 'download-app',
	PROGRAM_START: '/program/start',
	ROM_SCAN: '/rom/start-scan',
	POSTURE_SCAN: '/rom/posture-analytics/scan',
	ADD_EXERCISE: '/add-new-exercises',
	PROGRAM_CREATE: 'program/create',
	PROGRAM_GENERATE: 'program/generate',
};

export const ADMIN_MENU_CLICK = {
	PROFILE: 'profile',
	LOGOUT: 'logout',
	ASSESSMENT: 'assessment',
	THEME_SELECTOR: 'theme-selector',
	SETTINGS: 'settings',
	TOOLS: 'tools',
};

export const ADMIN_MENU = {
	NEW_PATIENTS: 'new-patients',
	REVIEWED: 'reviewed',
	PENDING_REVIEW: 'pending-review',
	FOLLOW_UP_REQUIRED: 'follow-up-required',
	ESCALATION_REQUIRED: 'escalation-required',
	OUT_OF_PARAMETERS: 'out-of-parameters',
	DEFAULT: '',
};

export const ADMIN_KEYS = {
	PATIENT_KEY: 'patientView',
	CONTACTS: 'contacts',
	ACTIVITY: 'activity',
	SUMMARY: 'summary',
	TOOLS: 'tools',
	USERACTIVITY: 'userActivity',
	GENERATE_PROGRAM: 'generateProgram',
	PATIENT_VIEW: 'patientView',
	SETTINGS: 'settings',
	UNASSIGNEDPATIENTS: 'unassigned-patients',
	PENDINGINVITES: 'pending-invites',
	REGISTEREDPATIENTS: 'registered-patients',
	CONSENTFORMPATIENTS: 'consent-form-patients',
};

export const titleToIconMap: Record<string, number> = {
	'Functional Independence & Daily Living': 1,
	'Performance Enhancement': 2,
	'Injury Prevention': 3,
	'Holistic Well-being & Quality of Life': 4,
	'Managing Discomfort': 5,
	Recovery: 6,
};

export const INTAKE_STEPS = {
	INTAKE_PROGRAMS: 'intake-programs',
	SUGGESTED: 'suggested',
	STEP_PROGRAM: 'step-program',
};

export const INTAKE_BODYPOINTS = [
	{
		id: 0,
		name: 'Right Shoulder',
		position: 'front',
		styles: { top: '72px', left: '36px' },
		part: 'rightShoulder',
	},
	{
		id: 1,
		name: 'Left Shoulder',
		position: 'front',
		styles: { top: '72px', right: '36px' },
		part: 'leftShoulder',
	},
	{
		id: 12,
		name: 'Left Ankle',
		position: 'front',
		styles: { bottom: '24px', right: '95px' },
		part: 'leftAnkle',
	},
	{
		id: 20,
		name: 'Right Ankle',
		position: 'front',
		styles: { bottom: '24px', left: '90px' },
		part: 'rightAnkle',
	},
	{
		id: 2,
		name: 'Right Elbow',
		position: 'front',
		styles: { top: '130px', left: '15px' },
		part: 'rightElbow',
	},
	{
		id: 3,
		name: 'Left Elbow',
		position: 'front',
		styles: { top: '130px', right: '20px' },
		part: 'leftElbow',
	},
	{
		id: 6,
		name: 'Right Hip',
		position: 'front',
		styles: { top: '170px', left: '46px' },
		part: 'rightHip',
	},
	{
		id: 7,
		name: 'Left Hip',
		position: 'front',
		styles: { top: '170px', right: '46px' },
		part: 'leftHip',
	},
	{
		id: 8,
		name: 'Right Knee',
		position: 'front',
		styles: { bottom: '110px', left: '40px' },
		part: 'rightKnee',
	},
	{
		id: 9,
		name: 'Left Knee',
		position: 'front',
		styles: { bottom: '110px', right: '45px' },
		part: 'leftKnee',
	},
	{
		id: 9,
		name: 'Right Wrist',
		position: 'front',
		styles: { top: '190px', left: '5px' },
		part: 'rightWrist',
	},
	{
		id: 10,
		name: 'Left Wrist',
		position: 'front',
		styles: { top: '190px', right: '10px' },
		part: 'leftWrist',
	},
	{
		id: 11,
		name: 'Neck',
		position: 'front',
		styles: { top: '50px', left: '62px' },
		part: 'neck',
	},
	{
		id: 12,
		name: 'Spine',
		position: 'front',
		styles: { top: '145px', left: '65px' },
		part: 'spine',
	},
];

export const SORT_KEYS = {
	CREATED_AT: 'createdAt',
};

export const PATIENT_ONBOARD = {
	VIRTUAL_PT: 'virtualPt',
	NO_PAIN: 'noPain',
};

export const PLANS = {
	SELECT_ALL: 'selectAll',
	SCREENING: 'screening',
	EARLYINTERVENTION: 'earlyIntervention',
	VIRTUALPT: 'virtualPt',
	PLAN1: 'Plan 1',
	PLAN2: 'Plan 2',
	PLAN3: 'Plan 3',
};

export const PLANS_OPTIONS = [
	{
		id: '1',
		planType: PLANS.SCREENING,
		title: 'Triage (injury risk assessment)',
		plan: PLANS.PLAN1,
		description: `<p>Movement and posture screening to assess your flexibility.</p>
				<p>Tailored report with personal insights.</p>
				<p>Recommendations to improve your score.</p>`,
	},
	{
		id: '2',
		planType: PLANS.EARLYINTERVENTION,
		title: 'Prehab (injury prevention)',
		plan: PLANS.PLAN2,
		description: `<p>All movement credit score features.</p>
				<p>Tailored Let’s Move programming to improve flexibility + strength + endurance.</p>
				<p>Personalized recommendations and training guides.</p>`,
	},
	{
		id: '3',
		planType: PLANS.VIRTUALPT,
		title: 'Rehab (virtual PT led program)',
		plan: PLANS.PLAN3,
		description: `<p>Virtual evaluation.</p>
				<p>Assignment of personalized care plan for recovery Asynchronous guided </p>
				<p>Let’s Move rehab sessions Virtual monitoring of activity with 1:1 support and communication </p>
				<p>Movement and posture screening </p>
				<p>Tailored health assessments and reports</p>`,
	},
];

export const URL_PATH = {
	ROM: 'rom',
	SCAN_RESULT: 'scan-result',
	POSTURE: 'posture',
};

export const hexToRgb = (hex: string): [number, number, number] => [
	parseInt(hex.slice(1, 3), 16),
	parseInt(hex.slice(3, 5), 16),
	parseInt(hex.slice(5, 7), 16),
];

export const isPurplePixel = (
	r: number,
	g: number,
	b: number,
	targetR: number,
	targetG: number,
	targetB: number,
): boolean => {
	const tolerance = 30;
	return (
		Math.abs(r - targetR) < tolerance &&
		Math.abs(g - targetG) < tolerance &&
		Math.abs(b - targetB) < tolerance
	);
};

export const calculateRanking = (score: number) => {
	if (score >= 91) return 10;
	if (score >= 81) return 9;
	if (score >= 71) return 8;
	if (score >= 61) return 7;
	if (score >= 51) return 6;
	if (score >= 41) return 5;
	if (score >= 31) return 4;
	if (score >= 21) return 3;
	if (score >= 11) return 2;
	if (score >= 1) return 1;
	return 0;
};
