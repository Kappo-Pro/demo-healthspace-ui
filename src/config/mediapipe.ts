/**
 * MediaPipe BlazePose GHUM Configuration
 *
 * Configures BlazePose model selection, performance thresholds,
 * and device capability detection.
 *
 * Modern @mediapipe/tasks-vision API Configuration
 */

import type { ModelComplexity } from '@types/mediapipe';

/**
 * Performance Thresholds
 */
export const PERFORMANCE_TARGETS = {
	/** Maximum acceptable inference time (ms) for modern devices */
	MAX_INFERENCE_TIME_MS: 3000,
	/** Maximum memory usage (MB) during inference */
	MAX_MEMORY_MB: 150,
	/** Minimum confidence threshold for pose detection */
	MIN_DETECTION_CONFIDENCE: 0.5,
	/** Minimum tracking confidence for smooth pose tracking */
	MIN_TRACKING_CONFIDENCE: 0.5,
} as const;

/**
 * BlazePose Model Configuration (Modern Tasks Vision API)
 */
export const BLAZEPOSE_CONFIG = {
	/** WASM base URL for MediaPipe Tasks Vision (pinned to v0.10.20 for stability) */
	WASM_BASE_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm',

	/** Model URLs by complexity (Google Storage, .task format) */
	MODEL_URLS: {
		0: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
		1: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
		2: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task',
	} as const,

	/** Confidence thresholds */
	MIN_DETECTION_CONFIDENCE: 0.5,
	MIN_PRESENCE_CONFIDENCE: 0.5,
	MIN_TRACKING_CONFIDENCE: 0.5,
} as const;

/**
 * Device Detection Heuristics
 */
interface DeviceInfo {
	isMobile: boolean;
	isOldDevice: boolean;
	deviceType: 'desktop' | 'modern-mobile' | 'old-mobile';
}

/**
 * Detect device type and capabilities
 */
function detectDevice(): DeviceInfo {
	const userAgent = navigator.userAgent;
	const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

	let isOldDevice = false;

	if (isMobile) {
		// Check iOS version (iPhone 11 and older = iOS < 14)
		const iosMatch = userAgent.match(/iPhone OS (\d+)/);
		if (iosMatch) {
			const iosVersion = parseInt(iosMatch[1], 10);
			isOldDevice = iosVersion < 14;
		}

		// Check Android version
		const androidMatch = userAgent.match(/Android (\d+)/);
		if (androidMatch) {
			const androidVersion = parseInt(androidMatch[1], 10);
			isOldDevice = androidVersion < 10; // Android 9 and older
		}
	}

	const deviceType = isOldDevice ? 'old-mobile' : isMobile ? 'modern-mobile' : 'desktop';

	return { isMobile, isOldDevice, deviceType };
}

/**
 * Get Recommended Model Complexity Based on Device Capability
 *
 * Heuristic-based model selection:
 * - Desktop: Heavy (GHUM, complexity=2)
 * - Modern mobile (iPhone 12+, Android 10+): Full (complexity=1)
 * - Old mobile: Lite (complexity=0)
 *
 * @returns Recommended model complexity (0=Lite, 1=Full, 2=Heavy)
 */
export function getRecommendedModelComplexity(): ModelComplexity {
	const { deviceType } = detectDevice();

	switch (deviceType) {
		case 'desktop':
			return 2; // Heavy (GHUM)
		case 'modern-mobile':
			return 1; // Full
		case 'old-mobile':
			return 0; // Lite
		default:
			return 1; // Default to Full
	}
}

/**
 * Check if Device Can Run BlazePose GHUM
 *
 * Quick heuristic check without running inference test.
 * For actual capability testing, use DeviceCapabilityService.
 *
 * @returns True if device likely supports GHUM (complexity=2)
 */
export function canDeviceRunGHUM(): boolean {
	const { deviceType } = detectDevice();
	return deviceType === 'desktop' || deviceType === 'modern-mobile';
}

/**
 * Get Model URL for Given Complexity
 *
 * @param complexity - Model complexity (0=Lite, 1=Full, 2=Heavy)
 * @returns Model asset URL
 */
export function getModelUrl(complexity: ModelComplexity): string {
	return BLAZEPOSE_CONFIG.MODEL_URLS[complexity];
}

/**
 * Export configuration object for external use
 */
export const MEDIAPIPE_CONFIG = {
	getModelComplexity: getRecommendedModelComplexity,
	canRunGHUM: canDeviceRunGHUM,
	getModelUrl,
	MAX_INFERENCE_TIME_MS: PERFORMANCE_TARGETS.MAX_INFERENCE_TIME_MS,
	MAX_MEMORY_MB: PERFORMANCE_TARGETS.MAX_MEMORY_MB,
} as const;
