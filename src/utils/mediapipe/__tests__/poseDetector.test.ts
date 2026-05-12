/**
 * Unit Tests for PoseDetectorService
 *
 * Tests BlazePose GHUM pose detector initialization, detection,
 * and performance benchmarks.
 */

import { PoseDetectorService } from '../poseDetector';
import { PoseLandmark } from '@types/mediapipe';

// Mock worker for testing
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
		// Simulate async response
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
				// Mock 33 landmarks
				const mockLandmarks = Array.from({ length: 33 }, (_, i) => ({
					x: Math.random(),
					y: Math.random(),
					z: Math.random() * 0.5 - 0.25,
					visibility: 0.8 + Math.random() * 0.2,
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
								duration: 250, // 250ms
							},
						},
					})
				);
			}
		}, 10);
	}

	terminate(): void {
		this.messageHandler = null;
	}
}

// Mock Worker constructor
(global as typeof globalThis & { Worker: typeof Worker }).Worker =
	MockWorker as unknown as typeof Worker;

describe('PoseDetectorService', () => {
	describe('Initialization', () => {
		it('should initialize BlazePose GHUM successfully', async () => {
			const detector = new PoseDetectorService();
			await expect(detector.initialize(2)).resolves.not.toThrow();
			expect(detector.isReady()).toBe(true);
			detector.dispose();
		});

		it('should initialize with Lite model', async () => {
			const detector = new PoseDetectorService();
			await expect(detector.initialize(0)).resolves.not.toThrow();
			expect(detector.isReady()).toBe(true);
			detector.dispose();
		});

		it('should not reinitialize if already initialized', async () => {
			const detector = new PoseDetectorService();
			await detector.initialize(2);

			// Should warn but not throw
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			await detector.initialize(2);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
			detector.dispose();
		});
	});

	describe('Pose Detection', () => {
		it('should detect 33 landmarks from image', async () => {
			const detector = new PoseDetectorService();
			await detector.initialize(2);

			// Create test image
			const testImage = new ImageData(640, 480);

			const result = await detector.detectPose(testImage);

			expect(result.landmarks).toHaveLength(33);
			expect(result.worldLandmarks).toHaveLength(33);
			expect(result.duration).toBeGreaterThan(0);
			expect(result.landmarkCount).toBe(33);

			detector.dispose();
		});

		it('should provide visibility scores for each landmark', async () => {
			const detector = new PoseDetectorService();
			await detector.initialize(2);

			const testImage = new ImageData(640, 480);
			const result = await detector.detectPose(testImage);

			result.landmarks.forEach((landmark) => {
				expect(landmark.visibility).toBeGreaterThanOrEqual(0);
				expect(landmark.visibility).toBeLessThanOrEqual(1);
			});

			detector.dispose();
		});

		it('should throw error if not initialized', async () => {
			const detector = new PoseDetectorService();

			const testImage = new ImageData(640, 480);

			await expect(detector.detectPose(testImage)).rejects.toThrow(
				'PoseDetector not initialized'
			);
		});

		it('should calculate average visibility', async () => {
			const detector = new PoseDetectorService();
			await detector.initialize(2);

			const testImage = new ImageData(640, 480);
			const result = await detector.detectPose(testImage);

			expect(result.avgVisibility).toBeGreaterThanOrEqual(0);
			expect(result.avgVisibility).toBeLessThanOrEqual(1);

			detector.dispose();
		});
	});

	describe('Landmark Access', () => {
		it('should get landmark by enum', async () => {
			const detector = new PoseDetectorService();
			await detector.initialize(2);

			const testImage = new ImageData(640, 480);
			const result = await detector.detectPose(testImage);

			const nose = detector.getLandmark(result, PoseLandmark.NOSE);

			expect(nose).toBeDefined();
			expect(nose.x).toBeGreaterThanOrEqual(0);
			expect(nose.y).toBeGreaterThanOrEqual(0);
			expect(nose.visibility).toBeGreaterThanOrEqual(0);

			detector.dispose();
		});

		it('should get world landmark', async () => {
			const detector = new PoseDetectorService();
			await detector.initialize(2);

			const testImage = new ImageData(640, 480);
			const result = await detector.detectPose(testImage);

			const worldNose = detector.getWorldLandmark(result, PoseLandmark.NOSE);

			expect(worldNose).toBeDefined();

			detector.dispose();
		});

		it('should check landmark visibility', () => {
			const detector = new PoseDetectorService();

			const visibleLandmark = { x: 0.5, y: 0.5, z: 0, visibility: 0.9 };
			const hiddenLandmark = { x: 0.5, y: 0.5, z: 0, visibility: 0.2 };

			expect(detector.isLandmarkVisible(visibleLandmark)).toBe(true);
			expect(detector.isLandmarkVisible(hiddenLandmark)).toBe(false);
			expect(detector.isLandmarkVisible(hiddenLandmark, 0.1)).toBe(true);

			detector.dispose();
		});
	});

	describe('Performance Tracking', () => {
		it('should track performance statistics', async () => {
			const detector = new PoseDetectorService();
			await detector.initialize(2);

			const testImage = new ImageData(640, 480);

			// Run multiple detections
			await detector.detectPose(testImage);
			await detector.detectPose(testImage);
			await detector.detectPose(testImage);

			const stats = detector.getPerformanceStats();

			expect(stats.detectionCount).toBe(3);
			expect(stats.avgInferenceTime).toBeGreaterThan(0);

			detector.dispose();
		});

		it('should return zero stats before any detection', () => {
			const detector = new PoseDetectorService();

			const stats = detector.getPerformanceStats();

			expect(stats.detectionCount).toBe(0);
			expect(stats.avgInferenceTime).toBe(0);

			detector.dispose();
		});
	});

	describe('Resource Cleanup', () => {
		it('should dispose worker and reset state', async () => {
			const detector = new PoseDetectorService();
			await detector.initialize(2);

			expect(detector.isReady()).toBe(true);

			detector.dispose();

			expect(detector.isReady()).toBe(false);

			const stats = detector.getPerformanceStats();
			expect(stats.detectionCount).toBe(0);
		});

		it('should handle dispose before initialization', () => {
			const detector = new PoseDetectorService();

			expect(() => detector.dispose()).not.toThrow();
			expect(detector.isReady()).toBe(false);
		});
	});
});
