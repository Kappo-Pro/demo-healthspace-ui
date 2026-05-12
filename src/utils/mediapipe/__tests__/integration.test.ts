/**
 * Integration Tests for BlazePose GHUM
 *
 * Tests complete workflows with mocked worker.
 */

import { PoseDetectorService } from '../poseDetector';
import { checkDeviceCapability } from '../deviceCapability';
import { getRecommendedModelComplexity } from '@config/mediapipe';
import { PoseLandmark } from '@types/mediapipe';

// Mock worker
class MockWorker {
	private messageHandler: ((event: MessageEvent) => void) | null = null;

	constructor() {}

	addEventListener(
		type: string,
		handler: (event: MessageEvent) => void,
		_options?: boolean | AddEventListenerOptions
	): void {
		if (type === 'message') {
			this.messageHandler = handler;
		}
	}

	removeEventListener(type: string, handler: (event: MessageEvent) => void): void {
		if (type === 'message' && this.messageHandler === handler) {
			this.messageHandler = null;
		}
	}

	postMessage(message: unknown): void {
		setTimeout(() => {
			if (!this.messageHandler) return;

			const msg = message as { type: string; payload?: unknown };

			if (msg.type === 'INIT_BLAZEPOSE') {
				this.messageHandler(
					new MessageEvent('message', {
						data: { type: 'INIT_SUCCESS' },
					})
				);
			} else if (msg.type === 'DETECT_POSE') {
				const mockLandmarks = Array.from({ length: 33 }, (_, i) => ({
					x: 0.5 + (Math.random() - 0.5) * 0.2,
					y: 0.5 + (Math.random() - 0.5) * 0.2,
					z: (Math.random() - 0.5) * 0.3,
					visibility: 0.85 + Math.random() * 0.15,
				}));

				this.messageHandler(
					new MessageEvent('message', {
						data: {
							type: 'POSE_RESULT',
							payload: {
								result: {
									landmarks: mockLandmarks,
									worldLandmarks: mockLandmarks,
								},
								duration: 150 + Math.random() * 200,
							},
						},
					})
				);
			}
		}, 5);
	}

	terminate(): void {
		this.messageHandler = null;
	}
}

(global as typeof globalThis & { Worker: typeof Worker }).Worker =
	MockWorker as unknown as typeof Worker;

describe('BlazePose GHUM Integration', () => {
	it('should complete full pose detection workflow', async () => {
		// 1. Get recommended model complexity
		const complexity = getRecommendedModelComplexity();
		expect([0, 1, 2]).toContain(complexity);

		// 2. Initialize detector
		const detector = new PoseDetectorService();
		await detector.initialize(complexity);
		expect(detector.isReady()).toBe(true);

		// 3. Run detection
		const testImage = new ImageData(640, 480);
		const result = await detector.detectPose(testImage);

		// 4. Verify results
		expect(result.landmarks).toHaveLength(33);
		expect(result.worldLandmarks).toHaveLength(33);
		expect(result.duration).toBeGreaterThan(0);
		expect(result.avgVisibility).toBeGreaterThan(0.5);

		// 5. Access specific landmarks
		const nose = detector.getLandmark(result, PoseLandmark.NOSE);
		expect(nose).toBeDefined();
		expect(nose.x).toBeGreaterThanOrEqual(0);
		expect(nose.x).toBeLessThanOrEqual(1);

		// 6. Cleanup
		detector.dispose();
		expect(detector.isReady()).toBe(false);
	});

	it('should track performance across multiple detections', async () => {
		const detector = new PoseDetectorService();
		await detector.initialize(2);

		const testImage = new ImageData(640, 480);

		// Run 5 detections
		for (let i = 0; i < 5; i++) {
			await detector.detectPose(testImage);
		}

		const stats = detector.getPerformanceStats();
		expect(stats.detectionCount).toBe(5);
		expect(stats.avgInferenceTime).toBeGreaterThan(0);

		detector.dispose();
	});

	it('should handle landmark visibility checks', async () => {
		const detector = new PoseDetectorService();
		await detector.initialize(2);

		const testImage = new ImageData(640, 480);
		const result = await detector.detectPose(testImage);

		// Check that most landmarks are visible (mock returns high visibility)
		const visibleCount = result.landmarks.filter((lm) =>
			detector.isLandmarkVisible(lm, 0.7)
		).length;

		expect(visibleCount).toBeGreaterThan(25); // Most landmarks visible

		detector.dispose();
	});

	it('should support different model complexities', async () => {
		const complexities = [0, 1, 2] as const;

		for (const complexity of complexities) {
			const detector = new PoseDetectorService();
			await detector.initialize(complexity);

			expect(detector.isReady()).toBe(true);

			const testImage = new ImageData(320, 240);
			const result = await detector.detectPose(testImage);

			expect(result.landmarks).toHaveLength(33);

			detector.dispose();
		}
	});

	it('should calculate body measurements from landmarks', async () => {
		const detector = new PoseDetectorService();
		await detector.initialize(2);

		const testImage = new ImageData(640, 480);
		const result = await detector.detectPose(testImage);

		// Get shoulder landmarks
		const leftShoulder = detector.getWorldLandmark(result, PoseLandmark.LEFT_SHOULDER);
		const rightShoulder = detector.getWorldLandmark(result, PoseLandmark.RIGHT_SHOULDER);

		// Calculate shoulder width (simple Euclidean distance)
		const distance = Math.sqrt(
			Math.pow(rightShoulder.x - leftShoulder.x, 2) +
				Math.pow(rightShoulder.y - leftShoulder.y, 2) +
				Math.pow(rightShoulder.z - leftShoulder.z, 2)
		);

		expect(distance).toBeGreaterThan(0);

		detector.dispose();
	});
});
