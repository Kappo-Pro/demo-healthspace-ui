/**
 * ui.ts
 *
 * UI component prop types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 31
 */

import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { CanvasState } from '@pages/ImageAnnotation/types';

// ============================================================================
// UI TYPES (31 declarations)
// ============================================================================

export interface FeatureProps {
	title: string;
	description: string;
	buttonText: string;
	imageSrc: string;
	onClick: () => void;
	logoSrc: string;
	disabled: boolean;
}

export enum FacingMode {
	USER = 'user',
	ENVIRONMENT = 'environment',
}

export interface ThumbnailProps {
	url: string;
}

export interface NewOptionProps {
	id: string;
	option: string;
	score: number;
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

export interface CustomModalProps {
	name?: string | null;
	description?: string | null;
	video?: string | null;
}

export interface ReactVideorRecordRef {
	handleStartRecording: () => void;
	handleStopRecording: () => void;
	handleStopReplaying: () => void;
	handleRating: () => void;
	recordedBlobs: IOnSubmitVideo[];
}

export interface TDataSetProps {
	key: string;
	patterns: string[];
	extraResponse?: string[];
	component: React.ReactNode;
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
	isUpdating?: boolean;
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
	isSaving: boolean;
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
	hideTopbar?: boolean;
	onScanComplete?: () => void;
	/** Hide control buttons when external control bar is used */
	hideControls?: boolean;
	/** Callback when transition time screen visibility changes */
	onTransitionTimeChange?: (isShowing: boolean) => void;
	/** External volume control (0-100) */
	volume?: number;
	/** External mute control */
	isMuted?: boolean;
	/** Callback for volume changes */
	onVolumeChange?: (value: number) => void;
	/** Callback for mute toggle */
	onToggleMute?: () => void;
	/** Number of cameras available */
	cameraCount?: number;
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

export interface AddButtonItemsProps {
	key: string;
	label: string;
	icon: React.ReactNode;
}

/**
 * Feature Flag Types - REMOVED
 * EPIC-024-S4: Feature flag system removed in feature-flag-removal epic
 * Former types: Feature, AllFeatureFlagsInterface
 * Removed: 2025-11-07
 */

export interface AddCoverImageProps {
	openCoverImage: boolean;
	setOpenCoverImage: (value: boolean) => void;
	previewImage: string | null;
	setImgFile: (value: string) => void;
	previewUnSplashedImage: string | null;
	setPreviewImage: (value: string | null) => void;
	setPreviewUnSplashedImage: (value: string | null) => void;
}

export interface TOnBoardSymptomsProps {
	setActiveStep: (value: number) => void;
	setProgressPercent: (value: number) => void;
	navigatorDirection?: 'forward' | 'backward';
	setNavigatorDirection: (val: 'forward' | 'backward') => void;
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
