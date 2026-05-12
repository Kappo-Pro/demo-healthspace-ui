import { PostureAnalysis, PostureComparisonSummary } from '@types';

/**
 * PostureComparisonCard Props
 *
 * Main molecule for side-by-side posture comparison (Story 2.2 - FR7a)
 */
export interface PostureComparisonCardProps {
	/** Session ID for fetching comparison data */
	sessionId: string;

	/** Posture analysis data with baseline and current images */
	comparison: PostureAnalysis | null;

	/** Improvement summary calculated from comparison */
	summary: PostureComparisonSummary | null;

	/** Loading state */
	isLoading?: boolean;

	/** Error message if data fetch fails */
	error?: string | null;

	/** Optional CSS class name */
	className?: string;

	/** Optional callback when image is clicked (for fullscreen) */
	onImageClick?: (imageUrl: string, imageType: 'baseline' | 'current') => void;

	/** Optional callback when annotation is clicked */
	onAnnotationClick?: (annotationId: string) => void;

	/** Whether to show annotations overlay */
	showAnnotations?: boolean;

	/** Whether to enable zoom/pan controls */
	enableZoomPan?: boolean;

	/** Whether to show improvement summary card */
	showSummary?: boolean;
}

/**
 * AnnotationOverlay Props
 *
 * SVG overlay for rendering annotations on posture images
 */
export interface AnnotationOverlayProps {
	/** Array of annotations to render */
	annotations: PostureAnalysis['annotations'];

	/** Image dimensions for positioning annotations */
	imageDimensions: {
		width: number;
		height: number;
	};

	/** Optional callback when annotation is clicked */
	onAnnotationClick?: (annotationId: string) => void;

	/** Whether to show annotation labels */
	showLabels?: boolean;

	/** Optional CSS class name */
	className?: string;
}

/**
 * ImprovementSummary Props
 *
 * Summary card showing overall progress
 */
export interface ImprovementSummaryProps {
	/** Summary data */
	summary: PostureComparisonSummary;

	/** Improvement indicators with delta values */
	improvements: PostureAnalysis['improvements'];

	/** Optional CSS class name */
	className?: string;

	/** Compact mode for mobile */
	compact?: boolean;
}

/**
 * Zoom/Pan Control State
 */
export interface ZoomPanState {
	scale: number; // 0.5 - 4.0
	positionX: number;
	positionY: number;
}

/**
 * Image Loading State
 */
export interface ImageLoadState {
	baselineLoaded: boolean;
	currentLoaded: boolean;
	baselineError: boolean;
	currentError: boolean;
}
