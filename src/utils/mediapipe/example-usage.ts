/**
 * BlazePose GHUM Usage Example
 *
 * Demonstrates how to integrate BlazePose GHUM 33-keypoint detection
 * into body measurement workflows.
 *
 * This file serves as documentation and reference implementation.
 */

import { PoseDetectorService } from './poseDetector';
import { checkDeviceCapability } from './deviceCapability';
import { getRecommendedModelComplexity } from '@config/mediapipe';
import { PoseLandmark, type PoseResult } from '@types/mediapipe';

/**
 * Example 1: Basic Pose Detection
 *
 * Simple setup with automatic model selection.
 */
export async function basicPoseDetection(videoElement: HTMLVideoElement): Promise<PoseResult> {
	// 1. Get recommended model complexity based on device
	const modelComplexity = getRecommendedModelComplexity();

	// 2. Initialize detector
	const detector = new PoseDetectorService();
	await detector.initialize(modelComplexity);

	// 3. Capture frame from video
	const canvas = document.createElement('canvas');
	canvas.width = videoElement.videoWidth;
	canvas.height = videoElement.videoHeight;

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas context unavailable');

	ctx.drawImage(videoElement, 0, 0);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	// 4. Detect pose
	const result = await detector.detectPose(imageData);

	// 5. Cleanup
	detector.dispose();

	return result;
}

/**
 * Example 2: Device Capability Testing
 *
 * Test device before choosing model complexity.
 */
export async function smartPoseDetection(videoElement: HTMLVideoElement): Promise<PoseResult> {
	// 1. Run device capability test
	const capability = await checkDeviceCapability();

	// 2. Use recommended complexity
	const detector = new PoseDetectorService();
	await detector.initialize(capability.recommendedComplexity);

	// 3. Detect pose (same as example 1)
	const canvas = document.createElement('canvas');
	canvas.width = videoElement.videoWidth;
	canvas.height = videoElement.videoHeight;

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas context unavailable');

	ctx.drawImage(videoElement, 0, 0);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	const result = await detector.detectPose(imageData);

	detector.dispose();

	return result;
}

/**
 * Example 3: Continuous Pose Tracking
 *
 * Track pose across video frames for real-time measurement.
 */
export class ContinuousPoseTracker {
	private detector: PoseDetectorService;
	private isTracking = false;
	private frameCallback?: (result: PoseResult) => void;

	constructor() {
		this.detector = new PoseDetectorService();
	}

	async start(
		videoElement: HTMLVideoElement,
		onFrame: (result: PoseResult) => void
	): Promise<void> {
		// Initialize with recommended model
		const modelComplexity = getRecommendedModelComplexity();
		await this.detector.initialize(modelComplexity);

		this.frameCallback = onFrame;
		this.isTracking = true;

		// Start tracking loop
		this.trackFrame(videoElement);
	}

	private async trackFrame(videoElement: HTMLVideoElement): Promise<void> {
		if (!this.isTracking) return;

		try {
			// Capture frame
			const canvas = document.createElement('canvas');
			canvas.width = videoElement.videoWidth;
			canvas.height = videoElement.videoHeight;

			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('Canvas context unavailable');

			ctx.drawImage(videoElement, 0, 0);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			// Detect pose
			const result = await this.detector.detectPose(imageData);

			// Invoke callback
			this.frameCallback?.(result);

			// Schedule next frame
			requestAnimationFrame(() => this.trackFrame(videoElement));
		} catch (error) {
			console.error('Pose tracking error:', error);
			this.stop();
		}
	}

	stop(): void {
		this.isTracking = false;
		this.detector.dispose();
	}

	getStats() {
		return this.detector.getPerformanceStats();
	}
}

/**
 * Example 4: Specific Landmark Access
 *
 * Extract specific body measurements from pose landmarks.
 */
export function extractBodyMeasurements(result: PoseResult): {
	shoulderWidth: number;
	armLength: number;
	legLength: number;
	height: number;
} {
	const detector = new PoseDetectorService();

	// Get world landmarks (real-world 3D coordinates in meters)
	const leftShoulder = detector.getWorldLandmark(result, PoseLandmark.LEFT_SHOULDER);
	const rightShoulder = detector.getWorldLandmark(result, PoseLandmark.RIGHT_SHOULDER);
	const leftElbow = detector.getWorldLandmark(result, PoseLandmark.LEFT_ELBOW);
	const leftWrist = detector.getWorldLandmark(result, PoseLandmark.LEFT_WRIST);
	const leftHip = detector.getWorldLandmark(result, PoseLandmark.LEFT_HIP);
	const leftKnee = detector.getWorldLandmark(result, PoseLandmark.LEFT_KNEE);
	const leftAnkle = detector.getWorldLandmark(result, PoseLandmark.LEFT_ANKLE);
	const nose = detector.getWorldLandmark(result, PoseLandmark.NOSE);

	// Calculate distances (Euclidean distance)
	const distance = (p1: typeof leftShoulder, p2: typeof leftShoulder) => {
		return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));
	};

	const shoulderWidth = distance(leftShoulder, rightShoulder);
	const upperArm = distance(leftShoulder, leftElbow);
	const foreArm = distance(leftElbow, leftWrist);
	const armLength = upperArm + foreArm;

	const thigh = distance(leftHip, leftKnee);
	const shin = distance(leftKnee, leftAnkle);
	const legLength = thigh + shin;

	// Approximate height (nose to ankle)
	const height = distance(nose, leftAnkle);

	return {
		shoulderWidth,
		armLength,
		legLength,
		height,
	};
}

/**
 * Example 5: Landmark Visibility Filtering
 *
 * Filter out low-confidence landmarks for robust measurements.
 */
export function getHighConfidenceLandmarks(
	result: PoseResult,
	minVisibility = 0.7
): Map<PoseLandmark, typeof result.landmarks[0]> {
	const highConfidence = new Map<PoseLandmark, typeof result.landmarks[0]>();
	const detector = new PoseDetectorService();

	result.landmarks.forEach((landmark, index) => {
		if (detector.isLandmarkVisible(landmark, minVisibility)) {
			highConfidence.set(index as PoseLandmark, landmark);
		}
	});

	return highConfidence;
}

/**
 * Example 6: Performance Monitoring
 *
 * Track and log pose detection performance.
 */
export async function monitoredPoseDetection(
	videoElement: HTMLVideoElement
): Promise<{ result: PoseResult; metrics: { avgFPS: number; avgInferenceTime: number } }> {
	const detector = new PoseDetectorService();
	await detector.initialize(2); // GHUM

	const canvas = document.createElement('canvas');
	canvas.width = videoElement.videoWidth;
	canvas.height = videoElement.videoHeight;

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas context unavailable');

	ctx.drawImage(videoElement, 0, 0);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	// Run detection
	const result = await detector.detectPose(imageData);

	// Get stats
	const stats = detector.getStats();
	const avgFPS = stats.avgInferenceTime > 0 ? 1000 / stats.avgInferenceTime : 0;

	detector.dispose();

	return {
		result,
		metrics: {
			avgFPS,
			avgInferenceTime: stats.avgInferenceTime,
		},
	};
}
