/**
 * Posture Analytics Type Definitions
 *
 * Shared interfaces for posture assessment, analysis, and patient journey features.
 * These types support the atomic design component architecture.
 *
 * @module types/posture
 */

/**
 * Posture assessment status types
 * Used by PostureStatusBadge atom component (FR1)
 */
export type PostureStatus =
	| 'excellent' // 90-100% score
	| 'good' // 70-89% score
	| 'fair' // 50-69% score
	| 'poor' // 30-49% score
	| 'critical'; // <30% score

/**
 * Posture session data captured from camera assessment
 * Core data structure for patient assessments
 */
export interface PostureSession {
	/** Unique session identifier */
	id: string;

	/** Patient/user identifier */
	userId: string;

	/** ISO 8601 timestamp */
	timestamp: string;

	/** Session duration in seconds */
	duration: number;

	/** Raw pose estimation data */
	poseData: PoseKeypoint[];

	/** Computed analysis results */
	analysis: PostureAnalysis;

	/** Session metadata */
	metadata: {
		deviceType: 'mobile' | 'desktop' | 'tablet';
		cameraQuality: 'low' | 'medium' | 'high';
		lighting: 'poor' | 'fair' | 'good';
	};
}

/**
 * Individual pose keypoint from MediaPipe/TensorFlow
 * Raw skeletal tracking data
 */
export interface PoseKeypoint {
	/** Keypoint identifier (e.g., 'nose', 'left_shoulder') */
	name: string;

	/** X coordinate (0-1 normalized) */
	x: number;

	/** Y coordinate (0-1 normalized) */
	y: number;

	/** Z depth (0-1 normalized, optional) */
	z?: number;

	/** Detection confidence (0-1) */
	confidence: number;
}

/**
 * Computed posture analysis results
 * Used by PostureMetricCard and OPostureDetailView (FR7, FR12)
 */
export interface PostureAnalysis {
	/** Overall posture score (0-100) */
	overallScore: number;

	/** Status derived from score */
	status: PostureStatus;

	/** Individual metric scores */
	metrics: PostureMetrics;

	/** Identified issues */
	issues: PostureIssue[];

	/** AI-generated insights */
	insights: string[];

	/** Comparison to baseline (if available) */
	comparison?: PostureComparison;
}

/**
 * Individual posture metrics
 * Used by PostureMetricCard molecule (FR12)
 */
export interface PostureMetrics {
	/** Head alignment score (0-100) */
	headAlignment: number;

	/** Shoulder symmetry score (0-100) */
	shoulderSymmetry: number;

	/** Spine curvature score (0-100) */
	spineCurvature: number;

	/** Hip alignment score (0-100) */
	hipAlignment: number;

	/** Overall balance score (0-100) */
	balance: number;

	/** Trend indicators for each metric */
	trends?: {
		headAlignment: number; // % change from previous
		shoulderSymmetry: number;
		spineCurvature: number;
		hipAlignment: number;
		balance: number;
	};
}

/**
 * Identified posture issue
 * Used by OPostureDetailView (FR7)
 */
export interface PostureIssue {
	/** Issue identifier */
	id: string;

	/** Severity level */
	severity: 'critical' | 'major' | 'minor';

	/** Human-readable title */
	title: string;

	/** Detailed description */
	description: string;

	/** Affected body part */
	affectedArea: 'head' | 'shoulders' | 'spine' | 'hips' | 'overall';

	/** Recommended exercises to address issue */
	recommendedExercises?: string[];
}

/**
 * Posture comparison data (current vs baseline/previous)
 * Used by PostureComparisonCard molecule (FR7a)
 */
export interface PostureComparison {
	/** Current session data */
	current: {
		sessionId: string;
		timestamp: string;
		score: number;
		metrics: PostureMetrics;
	};

	/** Baseline/previous session data */
	baseline: {
		sessionId: string;
		timestamp: string;
		score: number;
		metrics: PostureMetrics;
	};

	/** Computed improvements */
	improvements: {
		overallChange: number; // % change
		metricChanges: {
			headAlignment: number;
			shoulderSymmetry: number;
			spineCurvature: number;
			hipAlignment: number;
			balance: number;
		};
	};
}

/**
 * Exercise recommendation data
 * Used by ExerciseRecommendation molecule (FR7c)
 */
export interface ExerciseRecommendation {
	/** Exercise identifier */
	id: string;

	/** Exercise title */
	title: string;

	/** Brief description */
	description: string;

	/** Target area(s) */
	targetAreas: Array<'head' | 'shoulders' | 'spine' | 'hips' | 'core'>;

	/** Difficulty level */
	difficulty: 'beginner' | 'intermediate' | 'advanced';

	/** Estimated duration in minutes */
	duration: number;

	/** Media assets */
	media?: {
		thumbnailUrl?: string;
		videoUrl?: string;
		imageUrls?: string[];
	};

	/** Step-by-step instructions */
	instructions?: string[];

	/** Expected benefits */
	benefits?: string[];

	/** Priority/relevance score (0-100) */
	relevanceScore?: number;
}

/**
 * Patient journey milestone
 * Used by ProgressMilestone atom (FR8)
 */
export interface PatientMilestone {
	/** Milestone identifier */
	id: string;

	/** Milestone title */
	title: string;

	/** Description */
	description?: string;

	/** Achievement date (ISO 8601), null if not achieved */
	achievedAt: string | null;

	/** Milestone type */
	type: 'assessment' | 'improvement' | 'goal' | 'treatment';

	/** Associated metric improvement (if applicable) */
	metricImprovement?: {
		metric: string;
		before: number;
		after: number;
	};
}

/**
 * Patient journey state
 * Used by OPostureJourneyView organism (FR6)
 */
export interface PatientJourneyState {
	/** Patient identifier */
	patientId: string;

	/** Journey start date */
	startDate: string;

	/** All posture sessions (chronological) */
	sessions: PostureSession[];

	/** Achieved milestones */
	milestones: PatientMilestone[];

	/** Overall progress metrics */
	progress: {
		totalAssessments: number;
		averageScore: number;
		scoreImprovement: number; // % change from first to latest
		adherenceRate: number; // % of scheduled assessments completed
	};

	/** Current treatment goals */
	goals?: TreatmentGoal[];
}

/**
 * Treatment goal definition
 */
export interface TreatmentGoal {
	/** Goal identifier */
	id: string;

	/** Goal description */
	description: string;

	/** Target metric */
	targetMetric: keyof PostureMetrics;

	/** Target value */
	targetValue: number;

	/** Current value */
	currentValue: number;

	/** Target date (ISO 8601) */
	targetDate: string;

	/** Completion status */
	status: 'not-started' | 'in-progress' | 'achieved' | 'missed';
}

/**
 * Admin dashboard filter options
 * Used by OAdminTriageDashboard organism (FR11)
 */
export interface AdminFilter {
	/** Status filter */
	status?: PostureStatus[];

	/** Date range filter */
	dateRange?: {
		start: string;
		end: string;
	};

	/** Score range filter */
	scoreRange?: {
		min: number;
		max: number;
	};

	/** Issue severity filter */
	issueSeverity?: Array<'critical' | 'major' | 'minor'>;

	/** Search query */
	searchQuery?: string;

	/** Sort configuration */
	sort?: {
		field: 'timestamp' | 'score' | 'patientName' | 'status';
		order: 'asc' | 'desc';
	};

	/** Pagination */
	pagination?: {
		page: number;
		pageSize: number;
	};
}

/**
 * Admin patient summary for triage dashboard
 * Used by OAdminTriageDashboard (FR11)
 */
export interface AdminPatientSummary {
	/** Patient identifier */
	patientId: string;

	/** Patient name */
	patientName: string;

	/** Latest assessment */
	latestAssessment: {
		sessionId: string;
		timestamp: string;
		score: number;
		status: PostureStatus;
	};

	/** Assessment history summary */
	history: {
		totalAssessments: number;
		averageScore: number;
		trend: 'improving' | 'stable' | 'declining';
	};

	/** Critical issues requiring attention */
	criticalIssues: PostureIssue[];

	/** Flags for triage */
	flags: {
		requiresReview: boolean;
		missedAssessments: boolean;
		rapidDeteriorationg: boolean;
	};
}

/**
 * Empty state configuration
 * Used by EmptyStateMessage atom (FR9)
 */
export interface EmptyStateConfig {
	/** Title message */
	title: string;

	/** Description message */
	description: string;

	/** Icon name or component */
	icon?: string | React.ReactNode;

	/** Call-to-action configuration */
	cta?: {
		label: string;
		onClick: () => void;
		variant?: 'primary' | 'secondary';
	};

	/** Empty state type (affects styling) */
	type?: 'no-data' | 'no-results' | 'error' | 'permission-denied';
}
