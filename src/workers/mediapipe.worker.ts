/**
 * MediaPipe Web Worker
 *
 * Handles pose and hand landmark detection using MediaPipe Tasks Vision.
 * Runs in isolated worker thread for optimal performance.
 *
 * Message Types:
 * - INIT: Initialize PoseLandmarker
 * - INIT_HAND: Initialize HandLandmarker
 * - DETECT: Run pose detection on ImageBitmap
 * - DETECT_HAND: Run hand detection on ImageBitmap
 * - CLEANUP: Release resources
 *
 * Response Types:
 * - READY: PoseLandmarker initialized
 * - HAND_READY: HandLandmarker initialized
 * - RESULTS: Pose detection results
 * - HAND_RESULTS: Hand detection results
 * - ERROR: Error occurred
 */

import type { WorkerInMessage, WorkerOutMessage } from './types';

// CDN URL for MediaPipe Tasks Vision (worker-compatible)
// Bypasses webpack module resolution issues with npm packages in workers
const VISION_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/vision_bundle.mjs';

// Constants
const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm';

// Dynamic imports for MediaPipe Tasks Vision
let PoseLandmarker: any;
let HandLandmarker: any;
let FilesetResolver: any;

// Singleton instances
let poseLandmarker: any = null;
let handLandmarker: any = null;
let isInitializingPose = false;
let isInitializingHand = false;
let segmentationEnabled = false;

// Throttle mask extraction (expensive operation)
let lastMaskExtractionTime = 0;
const MASK_EXTRACTION_INTERVAL = 100; // 10fps for segmentation
const BLUR_AMOUNT = 12;

// Offscreen canvases for blur compositing (reused across frames)
let blurCanvas: OffscreenCanvas | null = null;
let sharpCanvas: OffscreenCanvas | null = null;
let maskCanvas: OffscreenCanvas | null = null;
let outputCanvas: OffscreenCanvas | null = null;
let lastCanvasSize = { w: 0, h: 0 };

/**
 * Post typed message to main thread
 */
function postTypedMessage(message: WorkerOutMessage): void {
	postMessage(message);
}

/**
 * Load MediaPipe library from CDN (lazy load on first use)
 */
async function loadMediaPipe(): Promise<void> {
	if (PoseLandmarker && FilesetResolver && HandLandmarker) {
		return; // Already loaded
	}

	try {
		// Dynamic import with CDN (webpackIgnore prevents webpack processing)
		const mediapipe = await import(/* webpackIgnore: true */ VISION_CDN);
		PoseLandmarker = mediapipe.PoseLandmarker;
		HandLandmarker = mediapipe.HandLandmarker;
		FilesetResolver = mediapipe.FilesetResolver;
	} catch (error) {
		throw new Error(
			`[MediaPipe Worker] Failed to load MediaPipe from CDN: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

/**
 * Initialize PoseLandmarker
 */
async function initializePoseLandmarker(
	delegate: 'CPU' | 'GPU',
	modelPath: string,
	enableSegmentation = false
): Promise<void> {
	if (poseLandmarker) {
		postTypedMessage({ type: 'READY' });
		return;
	}

	if (isInitializingPose) {
		return;
	}

	isInitializingPose = true;
	segmentationEnabled = enableSegmentation;

	try {
		// Load MediaPipe library from CDN
		await loadMediaPipe();

		const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

		const options = {
			baseOptions: {
				modelAssetPath: modelPath,
				delegate: delegate === 'GPU' ? 'GPU' : 'CPU',
			},
			runningMode: 'VIDEO',
			numPoses: 1,
			minPoseDetectionConfidence: 0.6,
			minPosePresenceConfidence: 0.6,
			minTrackingConfidence: 0.6,
			outputSegmentationMasks: enableSegmentation,
		};

		poseLandmarker = await PoseLandmarker.createFromOptions(vision, options);
		isInitializingPose = false;

		postTypedMessage({ type: 'READY' });
	} catch (error) {
		isInitializingPose = false;
		console.error('[Worker] PoseLandmarker initialization failed:', error);
		throw error;
	}
}

/**
 * Initialize HandLandmarker
 */
async function initializeHandLandmarker(modelPath: string): Promise<void> {
	if (handLandmarker) {
		postTypedMessage({ type: 'HAND_READY' });
		return;
	}

	if (isInitializingHand) {
		return;
	}

	isInitializingHand = true;

	try {
		// Load MediaPipe library from CDN
		await loadMediaPipe();

		const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

		const options = {
			baseOptions: {
				modelAssetPath: modelPath,
				delegate: 'GPU',
			},
			runningMode: 'VIDEO',
			numHands: 2,
			minHandDetectionConfidence: 0.5,
			minHandPresenceConfidence: 0.5,
			minTrackingConfidence: 0.5,
		};

		handLandmarker = await HandLandmarker.createFromOptions(vision, options);
		isInitializingHand = false;

		postTypedMessage({ type: 'HAND_READY' });
	} catch (error) {
		isInitializingHand = false;
		console.error('[Worker] HandLandmarker initialization failed:', error);
		throw error;
	}
}

/**
 * Extract segmentation mask data from MPMask
 */
function extractMaskData(
	mask: { width: number; height: number; getAsFloat32Array(): Float32Array } | undefined
): { data: Uint8Array; width: number; height: number } | undefined {
	if (!mask) return undefined;

	try {
		const float32Data = mask.getAsFloat32Array();
		// Convert float32 (0-1) to uint8 (0-255)
		const uint8Data = new Uint8Array(float32Data.length);
		for (let i = 0; i < float32Data.length; i++) {
			uint8Data[i] = Math.round(float32Data[i] * 255);
		}
		return {
			data: uint8Data,
			width: mask.width,
			height: mask.height,
		};
	} catch {
		return undefined;
	}
}

/**
 * Create blurred background + sharp person composite
 * All processing happens on the same frame for perfect sync
 */
async function createBlurredFrame(
	imageBitmap: ImageBitmap,
	maskData: Uint8Array,
	maskW: number,
	maskH: number
): Promise<ImageBitmap | undefined> {
	try {
		const w = imageBitmap.width;
		const h = imageBitmap.height;

		// Initialize or resize canvases
		if (!blurCanvas || !sharpCanvas || !maskCanvas || !outputCanvas ||
			lastCanvasSize.w !== w || lastCanvasSize.h !== h) {
			blurCanvas = new OffscreenCanvas(w, h);
			sharpCanvas = new OffscreenCanvas(w, h);
			maskCanvas = new OffscreenCanvas(maskW, maskH);
			outputCanvas = new OffscreenCanvas(w, h);
			lastCanvasSize = { w, h };
		}

		const blurCtx = blurCanvas.getContext('2d');
		const sharpCtx = sharpCanvas.getContext('2d');
		const maskCtx = maskCanvas.getContext('2d');
		const outCtx = outputCanvas.getContext('2d');

		if (!blurCtx || !sharpCtx || !maskCtx || !outCtx) return undefined;

		// 1. Draw blurred background
		blurCtx.filter = `blur(${BLUR_AMOUNT}px)`;
		blurCtx.drawImage(imageBitmap, 0, 0, w, h);
		blurCtx.filter = 'none';

		// 2. Create mask at mask resolution
		const maskImageData = maskCtx.createImageData(maskW, maskH);
		const pixels = maskImageData.data;
		for (let i = 0; i < maskData.length; i++) {
			const idx = i << 2;
			const alpha = maskData[i] > 128 ? 255 : Math.round((maskData[i] / 128) * 255);
			pixels[idx] = 255;
			pixels[idx + 1] = 255;
			pixels[idx + 2] = 255;
			pixels[idx + 3] = alpha;
		}
		maskCtx.putImageData(maskImageData, 0, 0);

		// 3. Draw sharp person with mask
		sharpCtx.clearRect(0, 0, w, h);
		sharpCtx.drawImage(imageBitmap, 0, 0, w, h);
		sharpCtx.globalCompositeOperation = 'destination-in';
		// Scale mask to video size
		sharpCtx.drawImage(maskCanvas, 0, 0, w, h);
		sharpCtx.globalCompositeOperation = 'source-over';

		// 4. Composite: blurred bg + sharp person
		outCtx.drawImage(blurCanvas, 0, 0);
		outCtx.drawImage(sharpCanvas, 0, 0);

		// 5. Create transferable bitmap
		return await createImageBitmap(outputCanvas);
	} catch {
		return undefined;
	}
}

/**
 * Detect pose landmarks
 */
async function detectPose(imageBitmap: ImageBitmap, timestamp: number): Promise<void> {
	if (!poseLandmarker) {
		throw new Error('PoseLandmarker not initialized');
	}

	try {
		const results = poseLandmarker.detectForVideo(imageBitmap, timestamp);

		// Extract segmentation mask if enabled (throttled to reduce overhead)
		let segmentationMask: { data: Uint8Array; width: number; height: number } | undefined;
		let blurredBitmap: ImageBitmap | undefined;
		const now = performance.now();
		const shouldExtractMask = segmentationEnabled &&
			results.segmentationMasks &&
			results.segmentationMasks.length > 0 &&
			(now - lastMaskExtractionTime >= MASK_EXTRACTION_INTERVAL);

		if (shouldExtractMask) {
			lastMaskExtractionTime = now;
			segmentationMask = extractMaskData(results.segmentationMasks[0] as unknown as {
				width: number;
				height: number;
				getAsFloat32Array(): Float32Array;
			});

			// Create blurred frame from SAME imageBitmap (ensures sync)
			if (segmentationMask) {
				blurredBitmap = await createBlurredFrame(
					imageBitmap,
					segmentationMask.data,
					segmentationMask.width,
					segmentationMask.height
				);
			}
		}

		// Close ImageBitmap to prevent memory leaks (after blur composite)
		imageBitmap.close();

		// Build payload
		const payload: {
			landmarks: typeof results.landmarks;
			worldLandmarks?: typeof results.worldLandmarks;
			timestamp: number;
			segmentationMask?: typeof segmentationMask;
			blurredFrame?: { bitmap: ImageBitmap; width: number; height: number };
		} = {
			landmarks: results.landmarks,
			worldLandmarks: results.worldLandmarks,
			timestamp,
			segmentationMask,
		};

		// Add blurred frame if available
		if (blurredBitmap) {
			payload.blurredFrame = {
				bitmap: blurredBitmap,
				width: blurredBitmap.width,
				height: blurredBitmap.height,
			};
		}

		// Send with transferable if we have a bitmap
		if (blurredBitmap) {
			postMessage({ type: 'RESULTS', payload }, [blurredBitmap]);
		} else {
			postTypedMessage({ type: 'RESULTS', payload });
		}
	} catch (error) {
		// Clean up ImageBitmap even on error
		imageBitmap.close();
		throw error;
	}
}

/**
 * Detect hand landmarks
 */
function detectHand(imageBitmap: ImageBitmap, timestamp: number): void {
	if (!handLandmarker) {
		throw new Error('HandLandmarker not initialized');
	}

	try {
		const results = handLandmarker.detectForVideo(imageBitmap, timestamp);

		// Close ImageBitmap to prevent memory leaks
		imageBitmap.close();

		postTypedMessage({
			type: 'HAND_RESULTS',
			payload: {
				landmarks: results.landmarks,
				worldLandmarks: results.worldLandmarks,
				handedness: results.handedness.map((h: any) => ({
					categoryName: h[0]?.categoryName || 'Unknown',
					score: h[0]?.score || 0,
				})),
			},
		});
	} catch (error) {
		// Clean up ImageBitmap even on error
		imageBitmap.close();
		throw error;
	}
}

/**
 * Cleanup resources
 */
function cleanup(): void {
	if (poseLandmarker) {
		poseLandmarker.close();
		poseLandmarker = null;
	}

	if (handLandmarker) {
		handLandmarker.close();
		handLandmarker = null;
	}

	isInitializingPose = false;
	isInitializingHand = false;
}

/**
 * Message handler
 */
self.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
	const message = event.data;

	try {
		switch (message.type) {
			case 'INIT': {
				const { delegate, modelPath, enableSegmentation } = message.payload;
				await initializePoseLandmarker(delegate, modelPath, enableSegmentation);
				break;
			}

			case 'INIT_HAND': {
				const { modelPath } = message.payload;
				await initializeHandLandmarker(modelPath);
				break;
			}

			case 'DETECT': {
				const { imageBitmap, timestamp } = message.payload;
				detectPose(imageBitmap, timestamp);
				break;
			}

			case 'DETECT_HAND': {
				const { imageBitmap, timestamp } = message.payload;
				detectHand(imageBitmap, timestamp);
				break;
			}

			case 'CLEANUP': {
				cleanup();
				break;
			}

			default: {
				// TypeScript exhaustive check
				const _exhaustive: never = message;
				throw new Error(`Unknown message type: ${(_exhaustive as WorkerInMessage).type}`);
			}
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[Worker] Error:', errorMessage);

		postTypedMessage({
			type: 'ERROR',
			payload: {
				message: errorMessage,
				code: message.type === 'INIT' || message.type === 'INIT_HAND'
					? 'INIT_FAILED'
					: message.type === 'DETECT' || message.type === 'DETECT_HAND'
						? 'DETECT_FAILED'
						: 'UNKNOWN',
			},
		});
	}
};
