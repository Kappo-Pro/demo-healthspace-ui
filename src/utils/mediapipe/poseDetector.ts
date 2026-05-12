/**
 * BlazePose GHUM Pose Detector Service
 *
 * Provides high-level API for 33-keypoint 3D pose detection using MediaPipe BlazePose.
 * Manages Web Worker lifecycle and provides type-safe landmark access.
 *
 * Usage:
 * ```typescript
 * const detector = new PoseDetectorService();
 * await detector.initialize(2); // GHUM model
 * const result = await detector.detectPose(imageData);
 * const nose = detector.getLandmark(result, PoseLandmark.NOSE);
 * detector.dispose();
 * ```
 */

import type {
	PoseResult,
	PoseLandmark,
	PoseLandmark3D,
	ModelComplexity,
	PoseDetectionMetrics,
} from '@types/mediapipe';

/**
 * Worker Message Types (Internal)
 */
interface InitMessage {
	type: 'INIT_BLAZEPOSE';
	payload: { modelComplexity: ModelComplexity };
}

interface DetectMessage {
	type: 'DETECT_POSE';
	payload: { imageData: ImageData; timestamp: number };
}

interface InitSuccessMessage {
	type: 'INIT_SUCCESS';
}

interface PoseResultMessage {
	type: 'POSE_RESULT';
	payload: {
		result: PoseResult;
		duration: number;
	};
}

interface ErrorMessage {
	type: 'ERROR';
	payload: { error: string };
}

type WorkerMessage = InitSuccessMessage | PoseResultMessage | ErrorMessage;

/**
 * BlazePose Pose Detector Service
 *
 * Manages Web Worker for pose detection with BlazePose GHUM model.
 */
export class PoseDetectorService {
	private worker: Worker | null = null;
	private isInitialized = false;
	private detectionCount = 0;
	private totalInferenceTime = 0;

	/**
	 * Initialize Worker with BlazePose GHUM
	 *
	 * Creates and initializes Web Worker with specified model complexity.
	 *
	 * @param modelComplexity - Model complexity (0=Lite, 1=Full, 2=Heavy/GHUM)
	 * @throws Error if worker initialization fails
	 */
	async initialize(modelComplexity: ModelComplexity = 2): Promise<void> {
		if (this.isInitialized && this.worker) {
			console.warn('[PoseDetector] Already initialized');
			return;
		}

		try {
			// Create worker from separate worker file
			// Use classic worker in development to avoid ES module importScripts() issues
			// Use module worker in production for better optimization
			this.worker = new Worker(
				new URL('../../workers/blazepose.worker.ts', import.meta.url),
				process.env.NODE_ENV === 'production' ? { type: 'module' } : undefined
			);

			// Wait for initialization
			await new Promise<void>((resolve, reject) => {
				if (!this.worker) {
					reject(new Error('Worker creation failed'));
					return;
				}

				const timeoutId = setTimeout(() => {
					reject(new Error('Worker initialization timeout (10s)'));
				}, 10000);

				this.worker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
					if (event.data.type === 'INIT_SUCCESS') {
						clearTimeout(timeoutId);
						this.isInitialized = true;
						resolve();
					} else if (event.data.type === 'ERROR') {
						clearTimeout(timeoutId);
						reject(new Error(event.data.payload.error));
					}
				});

				// Send init message
				const initMessage: InitMessage = {
					type: 'INIT_BLAZEPOSE',
					payload: { modelComplexity },
				};
				this.worker.postMessage(initMessage);
			});
		} catch (error) {
			this.dispose();
			throw new Error(`Failed to initialize PoseDetector: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Detect Pose from Video Frame
	 *
	 * Runs pose detection on ImageData and returns 33 3D landmarks.
	 *
	 * @param imageData - Image data from canvas or video frame
	 * @returns Pose result with landmarks and performance metrics
	 * @throws Error if worker not initialized or detection fails
	 */
	async detectPose(imageData: ImageData): Promise<PoseResult & PoseDetectionMetrics> {
		if (!this.worker || !this.isInitialized) {
			throw new Error('PoseDetector not initialized. Call initialize() first.');
		}

		const worker = this.worker; // Capture for closure

		return new Promise((resolve, reject) => {
			const handleMessage = (event: MessageEvent<WorkerMessage>) => {
				if (event.data.type === 'POSE_RESULT') {
					worker.removeEventListener('message', handleMessage);

					const { result, duration } = event.data.payload;

					// Calculate metrics
					this.detectionCount++;
					this.totalInferenceTime += duration;

					const avgVisibility =
						result.landmarks.reduce((sum, lm) => sum + lm.visibility, 0) /
						result.landmarks.length;

					const metrics: PoseResult & PoseDetectionMetrics = {
						...result,
						duration,
						timestamp: Date.now(),
						landmarkCount: result.landmarks.length,
						avgVisibility,
					};

					resolve(metrics);
				} else if (event.data.type === 'ERROR') {
					worker.removeEventListener('message', handleMessage);
					reject(new Error(event.data.payload.error));
				}
			};

			worker.addEventListener('message', handleMessage);

			// Send detect message with timestamp for tracking
			const detectMessage: DetectMessage = {
				type: 'DETECT_POSE',
				payload: {
					imageData,
					timestamp: performance.now(),
				},
			};
			worker.postMessage(detectMessage);
		});
	}

	/**
	 * Get Specific Landmark by Enum
	 *
	 * Type-safe landmark access using PoseLandmark enum.
	 *
	 * @param result - Pose detection result
	 * @param landmark - Landmark enum (e.g., PoseLandmark.NOSE)
	 * @returns 3D landmark with visibility score
	 */
	getLandmark(result: PoseResult, landmark: PoseLandmark): PoseLandmark3D {
		return result.landmarks[landmark];
	}

	/**
	 * Get World Landmark (Real-World Coordinates)
	 *
	 * Returns landmark in real-world 3D space (meters).
	 *
	 * @param result - Pose detection result
	 * @param landmark - Landmark enum
	 * @returns 3D landmark in world coordinates (meters)
	 */
	getWorldLandmark(result: PoseResult, landmark: PoseLandmark): PoseLandmark3D {
		return result.worldLandmarks[landmark];
	}

	/**
	 * Check if Landmark is Visible
	 *
	 * Determines if landmark visibility score meets threshold.
	 *
	 * @param landmark - 3D landmark
	 * @param threshold - Minimum visibility (default: 0.5)
	 * @returns True if landmark is visible above threshold
	 */
	isLandmarkVisible(landmark: PoseLandmark3D, threshold = 0.5): boolean {
		return landmark.visibility >= threshold;
	}

	/**
	 * Get Performance Statistics
	 *
	 * Returns aggregate performance metrics since initialization.
	 *
	 * @returns Average inference time and detection count
	 */
	getPerformanceStats(): { avgInferenceTime: number; detectionCount: number } {
		return {
			avgInferenceTime:
				this.detectionCount > 0 ? this.totalInferenceTime / this.detectionCount : 0,
			detectionCount: this.detectionCount,
		};
	}

	/**
	 * Cleanup Worker Resources
	 *
	 * Terminates worker and resets state.
	 * Should be called when detector is no longer needed.
	 */
	dispose(): void {
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
		this.isInitialized = false;
		this.detectionCount = 0;
		this.totalInferenceTime = 0;
	}

	/**
	 * Check if Detector is Ready
	 *
	 * @returns True if initialized and ready for detection
	 */
	isReady(): boolean {
		return this.isInitialized && this.worker !== null;
	}
}
