/**
 * BlazePose GHUM Web Worker (Modern @mediapipe/tasks-vision)
 *
 * Handles 33-keypoint 3D pose detection using modern MediaPipe Tasks Vision API.
 * Runs in isolated worker thread to prevent UI blocking.
 *
 * Migration: Legacy @mediapipe/pose → @mediapipe/tasks-vision
 * - Promise-based API (no callbacks)
 * - Native Web Worker support (no document polyfill)
 * - Improved performance and reliability
 *
 * Message Types:
 * - INIT_BLAZEPOSE: Initialize pose detector with model complexity
 * - DETECT_POSE: Run pose detection on ImageData
 *
 * Response Types:
 * - INIT_SUCCESS: Initialization complete
 * - POSE_RESULT: Pose detection results with landmarks
 * - ERROR: Error occurred
 */

import type { PoseResult, PoseLandmark3D, ModelComplexity } from '../types/mediapipe';
import { BLAZEPOSE_CONFIG } from '../config/mediapipe';

// CDN URL for MediaPipe Tasks Vision (worker-compatible)
// Bypasses webpack module resolution issues with npm packages in workers
const VISION_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/vision_bundle.mjs';

// Dynamic imports for MediaPipe Tasks Vision
let PoseLandmarker: unknown;
let FilesetResolver: unknown;

// Singleton pose detector instance
let poseLandmarker: unknown = null;

/**
 * Load MediaPipe Tasks Vision Library from CDN
 *
 * Uses CDN import to avoid webpack module resolution issues in worker context.
 * MediaPipe team recommends CDN for worker usage.
 *
 * Rationale:
 * - Webpack can't resolve npm package imports in worker context
 * - Dynamic import with CDN URL bypasses module resolution
 * - Same issue as legacy API, same CDN-based solution
 */
async function loadMediaPipe() {
	if (!PoseLandmarker) {
		try {
			// Dynamic import with CDN (webpackIgnore prevents webpack processing)
			const mediapipe = await import(/* webpackIgnore: true */ VISION_CDN);
			PoseLandmarker = mediapipe.PoseLandmarker;
			FilesetResolver = mediapipe.FilesetResolver;
		} catch (error) {
			throw new Error(
				`Failed to load @mediapipe/tasks-vision from CDN: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}

/**
 * Initialize BlazePose with Specified Model Complexity
 *
 * Uses modern PoseLandmarker API with Promise-based initialization.
 *
 * @param modelComplexity - 0=Lite, 1=Full, 2=Heavy (GHUM)
 */
async function initializeBlazePose(modelComplexity: ModelComplexity): Promise<void> {
	// Load MediaPipe library dynamically before initialization
	await loadMediaPipe();

	if (poseLandmarker) {
		// Already initialized
		return;
	}

	try {
		// Load WASM files from CDN
		const vision = await FilesetResolver.forVisionTasks(
			BLAZEPOSE_CONFIG.WASM_BASE_URL
		);

		// Get model URL for specified complexity
		const modelAssetPath = BLAZEPOSE_CONFIG.MODEL_URLS[modelComplexity];

		// Create PoseLandmarker with modern API
		poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath,
				delegate: 'GPU', // Use GPU acceleration when available
			},
			runningMode: 'VIDEO', // Optimized for video frames
			numPoses: 1, // Single pose detection
			minPoseDetectionConfidence: BLAZEPOSE_CONFIG.MIN_DETECTION_CONFIDENCE,
			minPosePresenceConfidence: BLAZEPOSE_CONFIG.MIN_PRESENCE_CONFIDENCE,
			minTrackingConfidence: BLAZEPOSE_CONFIG.MIN_TRACKING_CONFIDENCE,
			outputSegmentationMasks: false, // Disable for performance
		});
	} catch (error) {
		poseLandmarker = null;
		throw new Error(
			`BlazePose initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Process Image and Return Pose Landmarks
 *
 * Uses modern detectForVideo() API with timestamp-based tracking.
 *
 * @param imageData - Image data from canvas or video frame
 * @param timestamp - Video timestamp in milliseconds (for tracking)
 * @returns Promise resolving to pose result
 */
async function detectPose(imageData: ImageData, timestamp: number): Promise<PoseResult> {
	if (!poseLandmarker) {
		throw new Error('Pose detector not initialized');
	}

	try {
		// Run detection with timestamp for smooth tracking
		const detection = poseLandmarker.detectForVideo(imageData, timestamp);

		// Check if pose was detected
		if (!detection.landmarks || detection.landmarks.length === 0) {
			throw new Error('No pose detected in frame');
		}

		// Get first pose (numPoses=1)
		const landmarks = detection.landmarks[0];
		const worldLandmarks = detection.worldLandmarks?.[0];

		// Validate landmark count
		if (landmarks.length !== 33) {
			throw new Error(`Invalid landmark count: ${landmarks.length} (expected 33)`);
		}

		// Convert to existing PoseResult format
		const poseResult: PoseResult = {
			landmarks: landmarks as PoseLandmark3D[],
			worldLandmarks: worldLandmarks as PoseLandmark3D[],
			segmentationMask: undefined, // Not using segmentation masks
		};

		return poseResult;
	} catch (error) {
		throw new Error(
			`Pose detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Worker Message Handler
 */
self.addEventListener('message', async (event: MessageEvent) => {
	const { type, payload } = event.data;

	try {
		switch (type) {
			case 'INIT_BLAZEPOSE': {
				const { modelComplexity } = payload as { modelComplexity: ModelComplexity };
				await initializeBlazePose(modelComplexity);
				self.postMessage({ type: 'INIT_SUCCESS' });
				break;
			}

			case 'DETECT_POSE': {
				const { imageData, timestamp } = payload as {
					imageData: ImageData;
					timestamp: number;
				};
				const startTime = performance.now();

				const result = await detectPose(imageData, timestamp);

				const duration = performance.now() - startTime;

				self.postMessage({
					type: 'POSE_RESULT',
					payload: { result, duration },
				});
				break;
			}

			default:
				throw new Error(`Unknown message type: ${type}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[BlazePose Worker] Error:', errorMessage);

		self.postMessage({
			type: 'ERROR',
			payload: { error: errorMessage },
		});
	}
});

// Export for TypeScript (not used at runtime)
export {};
