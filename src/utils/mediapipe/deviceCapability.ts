/**
 * Device Capability Detection for BlazePose GHUM
 *
 * Runs performance tests to determine optimal model complexity.
 * Implements graceful degradation for older devices.
 */

import { PoseDetectorService } from './poseDetector';
import { PERFORMANCE_TARGETS } from '@config/mediapipe';
import type { DeviceCapability, ModelComplexity } from '@types/mediapipe';

/**
 * Check Device Capability with Inference Test
 *
 * Runs actual inference test with BlazePose GHUM to measure performance.
 * Falls back to lower complexity if performance targets not met.
 *
 * @param testImageSize - Size of test image (default: 320x240 for quick test)
 * @returns Device capability assessment with recommended model complexity
 */
export async function checkDeviceCapability(
	testImageSize = { width: 320, height: 240 }
): Promise<DeviceCapability> {
	const testStart = performance.now();

	try {
		// Try GHUM model (complexity=2)
		const detector = new PoseDetectorService();
		await detector.initialize(2);

		// Create test image
		const testImage = createTestImage(testImageSize.width, testImageSize.height);

		// Run detection
		const result = await detector.detectPose(testImage);

		const totalDuration = performance.now() - testStart;
		detector.dispose();

		// Check if performance meets targets
		if (totalDuration < PERFORMANCE_TARGETS.MAX_INFERENCE_TIME_MS) {
			return {
				canRunGHUM: true,
				recommendedComplexity: 2,
				measuredInferenceTime: totalDuration,
			};
		} else {
			// GHUM too slow, recommend Full model
			return {
				canRunGHUM: false,
				recommendedComplexity: 1,
				measuredInferenceTime: totalDuration,
			};
		}
	} catch (error) {
		console.warn('[DeviceCapability] GHUM test failed, falling back to Lite:', error);

		// GHUM failed, fallback to Lite
		return {
			canRunGHUM: false,
			recommendedComplexity: 0,
			measuredInferenceTime: undefined,
		};
	}
}

/**
 * Create Test Image for Capability Testing
 *
 * Generates simple test ImageData for performance benchmarking.
 *
 * @param width - Image width (default: 320)
 * @param height - Image height (default: 240)
 * @returns ImageData for testing
 */
function createTestImage(width = 320, height = 240): ImageData {
	// Create canvas offscreen
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	// Fill with neutral gradient (simulates person outline)
	const gradient = ctx.createLinearGradient(0, 0, width, height);
	gradient.addColorStop(0, '#404040');
	gradient.addColorStop(0.5, '#808080');
	gradient.addColorStop(1, '#404040');

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	// Add some noise for realism
	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		const noise = Math.random() * 20 - 10;
		data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
		data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
		data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
	}

	return imageData;
}

/**
 * Test Specific Model Complexity
 *
 * Runs performance test with specific model complexity.
 *
 * @param complexity - Model complexity to test
 * @returns Measured inference time (ms) or null if test failed
 */
export async function testModelComplexity(complexity: ModelComplexity): Promise<number | null> {
	try {
		const detector = new PoseDetectorService();
		await detector.initialize(complexity);

		const testImage = createTestImage();
		const startTime = performance.now();

		await detector.detectPose(testImage);

		const duration = performance.now() - startTime;
		detector.dispose();

		return duration;
	} catch (error) {
		console.warn(`[DeviceCapability] Model complexity ${complexity} test failed:`, error);
		return null;
	}
}

/**
 * Get Fallback Model Complexity
 *
 * If current complexity fails or is too slow, suggest fallback.
 *
 * @param currentComplexity - Current model complexity
 * @returns Next lower complexity or null if already at minimum
 */
export function getFallbackComplexity(
	currentComplexity: ModelComplexity
): ModelComplexity | null {
	switch (currentComplexity) {
		case 2:
			return 1; // GHUM → Full
		case 1:
			return 0; // Full → Lite
		case 0:
			return null; // Already at minimum
		default:
			return null;
	}
}

/**
 * Run Comprehensive Capability Test
 *
 * Tests all model complexities and provides detailed recommendations.
 *
 * @returns Map of complexity → inference time (ms)
 */
export async function runComprehensiveTest(): Promise<Map<ModelComplexity, number | null>> {
	const results = new Map<ModelComplexity, number | null>();

	// Test in reverse order (fastest to slowest) to avoid exhausting device
	for (const complexity of [0, 1, 2] as ModelComplexity[]) {
		const duration = await testModelComplexity(complexity);
		results.set(complexity, duration);

		// If a complexity fails, don't test higher ones
		if (duration === null) {
			break;
		}
	}

	return results;
}
