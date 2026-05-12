/**
 * Icon Registry - LINEAR (OUTLINE) VARIANTS ONLY
 *
 * Central mapping of Ant Design icon names to Untitled UI icon components.
 * All icons use LINEAR/OUTLINE style from @untitledui/icons package.
 *
 * IMPORTANT: This registry uses ONLY linear (outline/stroke) icons.
 * All icons have fill="none" and use stroke for rendering.
 *
 * Icon Naming Convention (from https://www.untitledui.com/free-icons):
 * - Icons with numbers (01, 02, 03, etc.) = Different linear design variations
 * - Icons with "Line" suffix = Simplified linear version
 * - NO solid/filled icons are used in this registry
 *
 * Reference: @untitledui/icons v0.0.19 (free tier - linear icons only)
 */

// Import custom icons (not in Untitled UI library)
import { MobilityBody } from './custom';

// Import all LINEAR icons from @untitledui/icons main index
// All icons below are outline/stroke style (fill="none")
import {
	Activity,
	AlertCircle,
	AlertTriangle,
	// Navigation Icons - Linear
	ArrowCircleRight,
	ArrowDown,
	ArrowLeft,
	ArrowNarrowDown,
	ArrowNarrowUp,
	ArrowRight,
	ArrowUp,
	// Phase 2: Navigation Icons - Linear
	BarChart01,
	BarChartSquare01,
	BarChartSquarePlus,
	// UI Component Icons - Linear
	Bell01,
	// Settings Icons - Linear
	BookClosed,
	// Form & Input Icons - Linear
	Calendar,
	CalendarCheck01,
	CalendarHeart02,
	Camera01,
	Certificate02,
	// Action Icons - Linear
	Check,
	// Status & Feedback Icons - Linear (outline circles/shapes)
	CheckCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ClipboardCheck,
	ClipboardPlus,
	Clock,
	ClockFastForward,
	// Integration & Technical Icons - Linear
	Code02,
	CodeBrowser,
	Copy01,
	CornerDownLeft,
	CornerUpLeft,
	Dotpoints01,
	Download01,
	Download02,
	Edit01,
	Edit05,
	Eye,
	EyeOff,
	FaceFrown,
	FaceHappy,
	FaceNeutral,
	FaceSad,
	FaceSmile,
	FaceWink,
	File04,
	File06,
	FileCheck02,
	FileHeart02,
	FileShield02,
	FilterLines,
	Folder, // Using Home02 (outline house with door detail)
	Globe01,
	Heart,
	HelpCircle,
	Home02,
	Image01,
	InfoCircle,
	Key01,
	LayerSingle,
	LayersThree02,
	// Phase 3: Command Palette Icons - Linear
	LayoutAlt02,
	LayoutGrid01,
	Lightbulb03,
	Lightning01,
	Link01,
	List,
	Lock01,
	LogOut04,
	MagicWand01,
	Mail01,
	MedicalCross,
	MessageCheckSquare,
	// Media & Content Icons - Linear
	Microphone01,
	Minus,
	// Theme & Display Icons - Linear
	Moon02,
	Move,
	NotificationText,
	Palette,
	Paperclip,
	Phone02,
	PlayCircle,
	// Menu Icons - Linear
	PlaySquare,
	Plus,
	PlusSquare,
	QrCode01,
	QrCode02,
	RefreshCcw01,
	RefreshCw01,
	RefreshCw05,
	Rocket01,
	Ruler,
	Save01,
	Scales01,
	SearchMd,
	Settings01,
	Share07,
	Shuffle01,
	Sun,
	Table,
	Tool01,
	Trash01,
	Trophy01,
	Type02,
	Upload01,
	User01,
	UserCheck01,
	UserSquare,
	UserX01,
	Users01,
	VideoRecorder,
	XCircle,
	XClose,
	// Additional Icons - Linear
	XSquare,
	Zap,
} from '@untitledui/icons';

/**
 * Icon Registry Object
 * Maps friendly names to Untitled UI React components
 *
 * ALL ICONS ARE LINEAR (OUTLINE) STYLE:
 * - No filled/solid variants
 * - Consistent stroke-based rendering
 * - All have fill="none" attribute
 */
export const IconRegistry = {
	// ==========================================
	// NAVIGATION ICONS (Linear)
	// ==========================================
	arrowDown: ArrowDown,
	arrowLeft: ArrowLeft,
	arrowRight: ArrowRight,
	arrowUp: ArrowUp,
	arrowCircleRight: ArrowCircleRight,
	'arrow-circle-right': ArrowCircleRight,
	arrowNarrowUp: ArrowNarrowUp,
	'arrow-narrow-up': ArrowNarrowUp,
	arrowNarrowDown: ArrowNarrowDown,
	'arrow-narrow-down': ArrowNarrowDown,
	chevronDown: ChevronDown,
	chevronLeft: ChevronLeft,
	chevronRight: ChevronRight,
	chevronUp: ChevronUp,
	leftOutlined: ChevronLeft, // Legacy alias for Ant Design compatibility
	rightOutlined: ChevronRight, // Legacy alias
	home: Home02, // Linear variant with door detail (outline only)
	'home-02': Home02, // Explicit variant name
	global: Globe01,
	layerSingle: LayerSingle,
	layerThree: LayersThree02,
	// ==========================================
	// ACTION ICONS (Linear)
	// ==========================================
	check: Check,
	close: XClose,
	copy: Copy01,
	delete: Trash01,
	download: Download01,
	download02: Download02,
	'download-02': Download02,
	edit: Edit05,
	edit01: Edit01,
	'edit-01': Edit01,
	minus: Minus,
	plus: Plus,
	reload: RefreshCw01,
	refreshCcw01: RefreshCcw01,
	'refresh-ccw-01': RefreshCcw01,
	save: Save01,
	search: SearchMd,
	share: Share07,
	undo: CornerUpLeft,
	upload: Upload01,
	qr: QrCode01,
	qr02: QrCode02,
	'qr-code-02': QrCode02,
	cornerDownLeft: CornerDownLeft,
	'corner-down-left': CornerDownLeft,

	// ==========================================
	// STATUS & FEEDBACK ICONS (Linear - Outline Only)
	// ==========================================
	// NOTE: These icons use OUTLINE circles/shapes, NOT filled
	checkCircle: CheckCircle, // Linear outline circle with check
	checkCircleFilled: CheckCircle, // Using same linear variant (no filled version in free tier)
	closeCircle: XCircle, // Linear outline circle with X
	closeCircleFilled: XCircle, // Using same linear variant
	exclamationCircle: AlertCircle, // Linear outline circle with !
	infoCircle: InfoCircle, // Linear outline circle with i
	infoCircleFilled: InfoCircle, // Using same linear variant
	loading: RefreshCw05, // Linear spinning arrows
	trophy: Trophy01, // Linear outline trophy
	warning: AlertTriangle, // Linear outline triangle with !
	heart: Heart, // Linear outline heart

	// ==========================================
	// FORM & INPUT ICONS (Linear)
	// ==========================================
	calendar: Calendar,
	calendarCheck: CalendarCheck01,
	'calendar-check-01': CalendarCheck01,
	clock: Clock,
	clockFastForward: ClockFastForward,
	'clock-fast-forward': ClockFastForward,
	filter: FilterLines,
	filterFilled: FilterLines, // Using same linear variant (no filled in free tier)
	lock: Lock01,
	sortAscending: List,
	list: List,
	user: User01,
	userCheck: UserCheck01,
	'user-check-01': UserCheck01,
	userX: UserX01,
	'user-x-01': UserX01,
	ruler: Ruler,
	scales: Scales01,
	'scales-01': Scales01,

	// ==========================================
	// MEDIA & CONTENT ICONS (Linear)
	// ==========================================
	audio: Microphone01,
	camera: Camera01,
	video: VideoRecorder,
	videoRecorder: VideoRecorder, // Alias
	eye: Eye,
	eyeOff: EyeOff,
	eyeTwoTone: Eye, // Using standard eye (no two-tone in free tier)
	filePdf: File04,
	fileText: File06,
	file06: File06,
	'file-06': File06,
	fileCheck: FileCheck02,
	'file-check-02': FileCheck02,
	fileHeart: FileHeart02,
	'file-heart-02': FileHeart02,
	image: Image01,
	certificate: Certificate02,
	'certificate-02': Certificate02,
	clipboardPlus: ClipboardPlus,
	'clipboard-plus': ClipboardPlus,

	// ==========================================
	// UI COMPONENT ICONS (Linear)
	// ==========================================
	bell: Bell01,
	drag: Move,
	holder: Dotpoints01,
	table: Table,
	fontSize: Type02,

	// ==========================================
	// THEME & DISPLAY ICONS (Linear)
	// ==========================================
	moon: Moon02,
	sun: Sun,
	settings: Settings01,
	project: Folder,

	// ==========================================
	// INTEGRATION & TECHNICAL ICONS (Linear)
	// ==========================================
	api: Code02,
	code: CodeBrowser,
	key: Key01,
	mail: Mail01,
	mail01: Mail01,
	'mail-01': Mail01,
	paperclip: Paperclip,
	playCircle: PlayCircle,
	rocket: Rocket01,
	lightning: Lightning01,
	link: Link01,
	helpCircle: HelpCircle,
	'help-circle': HelpCircle,
	questionCircle: HelpCircle, // Alias for Ant Design compatibility
	lightbulb: Lightbulb03,
	lightbulb03: Lightbulb03,
	'lightbulb-03': Lightbulb03,

	// ==========================================
	// ADDITIONAL ICONS (Linear)
	// ==========================================
	clear: XSquare,
	fire: Zap,

	// ==========================================
	// PHASE 2: NAVIGATION-SPECIFIC ICONS (Linear)
	// ==========================================
	'bar-chart': BarChart01,
	barChart: BarChart01, // Alias
	barChartSquare: BarChartSquare01,
	'bar-chart-square-01': BarChartSquare01,
	activity: Activity,
	tool: Tool01,
	'clipboard-check': ClipboardCheck,
	clipboardCheck: ClipboardCheck, // Alias
	users: Users01,
	medicalCross: MedicalCross,
	'medical-cross': MedicalCross,
	messageCheckSquare: MessageCheckSquare,
	'message-check-square': MessageCheckSquare,

	// ==========================================
	// PHASE 3: COMMAND PALETTE ICONS (Linear)
	// ==========================================
	dashboard: LayoutGrid01,

	// ==========================================
	// MENU ICONS (Linear)
	// ==========================================
	playSquare: PlaySquare,
	'play-square': PlaySquare,
	fileShield: FileShield02,
	'file-shield': FileShield02,
	magicWand: MagicWand01,
	'magic-wand': MagicWand01,
	plusSquare: PlusSquare,
	'plus-square': PlusSquare,
	barChartSquarePlus: BarChartSquarePlus,
	'bar-chart-square-plus': BarChartSquarePlus,
	userSquare: UserSquare,
	'user-square': UserSquare,
	phone: Phone02,
	logout: LogOut04,
	'log-out': LogOut04,
	notificationText: NotificationText,
	'notification-text': NotificationText,

	// ==========================================
	// SETTINGS PAGE ICONS (Linear)
	// ==========================================
	palette: Palette,
	shuffle: Shuffle01,
	'shuffle-01': Shuffle01,
	layoutAlt: LayoutAlt02,
	'layout-alt-02': LayoutAlt02,
	calendarHeart: CalendarHeart02,
	'calendar-heart-02': CalendarHeart02,
	bookClosed: BookClosed,
	'book-closed': BookClosed,

	// ==========================================
	// PAIN SCALE FACE ICONS (VitalFlow custom - clinical validation required)
	// ==========================================
	// NOTE: These icons are preserved from src/icons/users/ for healthcare compliance
	// They represent the pain scale assessment (0-10) with faces
	faceFrown: FaceFrown,
	'face-frown': FaceFrown,
	faceHappy: FaceHappy,
	'face-happy': FaceHappy,
	faceNeutral: FaceNeutral,
	'face-neutral': FaceNeutral,
	faceSad: FaceSad,
	'face-sad': FaceSad,
	faceSmile: FaceSmile,
	'face-smile': FaceSmile,
	faceWink: FaceWink,
	'face-wink': FaceWink,

	// ==========================================
	// CUSTOM VITALFLOW ICONS (Not in Untitled UI)
	// ==========================================
	mobilityBody: MobilityBody,
	'mobility-body': MobilityBody,
} as const;

/**
 * Type Definitions
 */
export type IconName = keyof typeof IconRegistry;
export type IconComponent = (typeof IconRegistry)[IconName];

/**
 * Verification Notes:
 * - All icons verified to have fill="none" attribute
 * - All icons use stroke for rendering (linear/outline style)
 * - Package: @untitledui/icons v0.0.19 (free tier)
 * - No solid/filled variants in this registry
 * - Consistent "01" variants used for uniform visual weight
 */
