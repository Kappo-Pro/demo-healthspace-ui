/**
 * Body Measurement SDK Event Tracking
 *
 * Defines event types and payloads for telemetry and analytics
 * tracking throughout the body measurement workflow.
 *
 * @module services/analytics/bodyMeasurementEvents
 * @story EPIC-001-S11 - Analytics & Monitoring
 */

/**
 * Body Measurement SDK event types
 *
 * Tracks complete user journey from session start to completion
 */
export enum BMEvent {
	SESSION_START = 'bm_session_start',
	CALIBRATION_COMPLETE = 'bm_calibration_complete',
	CAPTURE_FRONT_START = 'bm_capture_front_start',
	CAPTURE_FRONT_COMPLETE = 'bm_capture_front_complete',
	CAPTURE_SIDE_START = 'bm_capture_side_start',
	CAPTURE_SIDE_COMPLETE = 'bm_capture_side_complete',
	CAPTURE_BACK_START = 'bm_capture_back_start',
	CAPTURE_BACK_COMPLETE = 'bm_capture_back_complete',
	PROCESSING_START = 'bm_processing_start',
	PROCESSING_COMPLETE = 'bm_processing_complete',
	SESSION_COMPLETE = 'bm_session_complete',
	SESSION_ABANDON = 'bm_session_abandon',
	ERROR_OCCURRED = 'bm_error',
}

/**
 * Device information captured with each event
 */
export interface DeviceInfo {
	userAgent: string;
	platform: string;
	screenResolution: string;
	isMobile: boolean;
	browser: string;
	os: string;
}

/**
 * Quality metrics for measurement validation
 */
export interface QualityMetrics {
	confidence: number;
	poseVisibility: number;
	lightingQuality: 'good' | 'acceptable' | 'poor';
	distanceValid: boolean;
	fullBodyVisible: boolean;
}

/**
 * Performance metrics for SDK operations
 */
export interface PerformanceMetrics {
	inferenceTime?: number; // ms
	bundleLoadTime?: number; // ms
	totalSessionTime?: number; // ms
	frameRate?: number; // fps
	memoryUsage?: number; // MB
}

/**
 * Error tracking information
 */
export interface ErrorInfo {
	message: string;
	code?: string;
	stack?: string;
	step?: string;
	recoverable: boolean;
}

/**
 * Event payload structure
 *
 * Standard payload sent with every analytics event
 */
export interface BMEventPayload {
	sessionId: string;
	userId?: string;
	timestamp: string;
	deviceInfo: DeviceInfo;
	eventData?: Record<string, unknown>;
	qualityMetrics?: QualityMetrics;
	performanceMetrics?: PerformanceMetrics;
	errorInfo?: ErrorInfo;
}

/**
 * Session metadata
 */
export interface SessionMetadata {
	sessionId: string;
	startTime: string;
	endTime?: string;
	completionRate: number;
	stepsCompleted: BMEvent[];
	errors: ErrorInfo[];
}

/**
 * Extract device information from browser
 */
export function getDeviceInfo(): DeviceInfo {
	const ua = navigator.userAgent;

	// Detect mobile
	const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);

	// Detect browser
	let browser = 'Unknown';
	if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
	else if (ua.indexOf('Safari') > -1) browser = 'Safari';
	else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
	else if (ua.indexOf('Edge') > -1) browser = 'Edge';

	// Detect OS
	let os = 'Unknown';
	if (ua.indexOf('Win') > -1) os = 'Windows';
	else if (ua.indexOf('Mac') > -1) os = 'macOS';
	else if (ua.indexOf('Linux') > -1) os = 'Linux';
	else if (ua.indexOf('Android') > -1) os = 'Android';
	else if (ua.indexOf('iOS') > -1) os = 'iOS';

	return {
		userAgent: ua,
		platform: navigator.platform,
		screenResolution: `${window.screen.width}x${window.screen.height}`,
		isMobile,
		browser,
		os,
	};
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
	return `bm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
