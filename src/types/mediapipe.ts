/**
 * MediaPipe BlazePose GHUM Type Definitions
 *
 * Defines 33-keypoint pose landmark interfaces for body measurement SDK.
 * Compatible with MediaPipe Pose standard.
 *
 * @packageDocumentation
 */

/**
 * BlazePose GHUM 33 Landmark Enumeration
 *
 * Standard MediaPipe Pose landmark indices.
 * Used for type-safe landmark access.
 */
export enum PoseLandmark {
	// Face (11 landmarks)
	NOSE = 0,
	LEFT_EYE_INNER = 1,
	LEFT_EYE = 2,
	LEFT_EYE_OUTER = 3,
	RIGHT_EYE_INNER = 4,
	RIGHT_EYE = 5,
	RIGHT_EYE_OUTER = 6,
	LEFT_EAR = 7,
	RIGHT_EAR = 8,
	MOUTH_LEFT = 9,
	MOUTH_RIGHT = 10,

	// Upper Body (6 landmarks)
	LEFT_SHOULDER = 11,
	RIGHT_SHOULDER = 12,
	LEFT_ELBOW = 13,
	RIGHT_ELBOW = 14,
	LEFT_WRIST = 15,
	RIGHT_WRIST = 16,

	// Hands (6 landmarks)
	LEFT_PINKY = 17,
	RIGHT_PINKY = 18,
	LEFT_INDEX = 19,
	RIGHT_INDEX = 20,
	LEFT_THUMB = 21,
	RIGHT_THUMB = 22,

	// Lower Body (10 landmarks)
	LEFT_HIP = 23,
	RIGHT_HIP = 24,
	LEFT_KNEE = 25,
	RIGHT_KNEE = 26,
	LEFT_ANKLE = 27,
	RIGHT_ANKLE = 28,
	LEFT_HEEL = 29,
	RIGHT_HEEL = 30,
	LEFT_FOOT_INDEX = 31,
	RIGHT_FOOT_INDEX = 32,
}

/**
 * 3D Pose Landmark with Visibility Score
 *
 * Normalized coordinates (0-1 range) with depth (z) and confidence.
 *
 * @property x - Normalized x coordinate (0-1, image width)
 * @property y - Normalized y coordinate (0-1, image height)
 * @property z - Depth relative to hips (negative = closer to camera, in same scale as x)
 * @property visibility - Confidence score (0-1, likelihood landmark is visible and accurate)
 */
export interface PoseLandmark3D {
	x: number;
	y: number;
	z: number;
	visibility: number;
}

/**
 * Pose Detection Result
 *
 * Contains normalized landmarks (image space) and world landmarks (real-world 3D).
 *
 * @property landmarks - 33 normalized landmarks in image space
 * @property worldLandmarks - 33 landmarks in real-world coordinates (meters)
 * @property segmentationMask - Optional person segmentation mask
 */
export interface PoseResult {
	/** Normalized landmarks (0-1 image space) */
	landmarks: PoseLandmark3D[];
	/** Real-world 3D coordinates (meters from camera) */
	worldLandmarks: PoseLandmark3D[];
	/** Optional segmentation mask for person isolation */
	segmentationMask?: ImageData;
}

/**
 * Model Complexity Levels
 *
 * 0 = Lite (fast, lower accuracy)
 * 1 = Full (balanced)
 * 2 = Heavy (GHUM - high accuracy, slower)
 */
export type ModelComplexity = 0 | 1 | 2;

/**
 * Device Capability Assessment
 */
export interface DeviceCapability {
	/** Can run BlazePose GHUM (complexity=2) within performance targets */
	canRunGHUM: boolean;
	/** Recommended model complexity for this device */
	recommendedComplexity: ModelComplexity;
	/** Measured inference time (ms) from capability test */
	measuredInferenceTime?: number;
}

/**
 * BlazePose Detection Performance Metrics
 */
export interface PoseDetectionMetrics {
	/** Inference time in milliseconds */
	duration: number;
	/** Timestamp when detection occurred */
	timestamp: number;
	/** Number of landmarks detected (should be 33) */
	landmarkCount: number;
	/** Average visibility score across all landmarks */
	avgVisibility: number;
}
