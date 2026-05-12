/**
 * React hook for MediaPipe Web Worker communication
 * Provides zero-copy ImageBitmap transfers for efficient pose/hand detection
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
	NormalizedLandmark,
	WorkerOutMessage,
	ErrorPayload,
	SegmentationMaskData,
	BlurredFrameData,
} from '../workers/types';

// ============================================================================
// Types
// ============================================================================

export interface UseMediaPipeWorkerOptions {
	/** CPU or GPU delegate (default: 'CPU') */
	delegate?: 'CPU' | 'GPU';
	/** Path to pose model file (default: '/models/pose_landmarker_full.task') */
	modelPath?: string;
	/** Path to hand model file */
	handModelPath?: string;
	/** Enable hand detection (default: false) */
	enableHand?: boolean;
	/** Enable segmentation mask output (default: false) */
	enableSegmentation?: boolean;
	/** Callback for pose detection results */
	onResults: (landmarks: NormalizedLandmark[][], timestamp: number) => void;
	/** Callback for hand detection results */
	onHandResults?: (
		landmarks: NormalizedLandmark[][],
		handedness: string[],
	) => void;
	/** Callback for segmentation mask results */
	onSegmentationMask?: (mask: SegmentationMaskData) => void;
	/** Callback for blurred frame (background blur + sharp person composite) */
	onBlurredFrame?: (frame: BlurredFrameData) => void;
	/** Callback for worker errors */
	onError?: (error: ErrorPayload) => void;
	/** Callback when worker is ready */
	onReady?: () => void;
}

export interface UseMediaPipeWorkerReturn {
	/** Detect pose from video element */
	detect: (video: HTMLVideoElement) => Promise<void>;
	/** Detect hand from video element */
	detectHand: (video: HTMLVideoElement) => Promise<void>;
	/** Whether pose worker is initialized and ready */
	isReady: boolean;
	/** Whether hand worker is initialized and ready */
	isHandReady: boolean;
	/** Terminate worker and cleanup resources */
	terminate: () => void;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_DELEGATE = 'CPU';
const DEFAULT_MODEL_PATH = '/models/pose_landmarker_full.task';
const DEFAULT_HAND_MODEL_PATH =
	'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task';

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMediaPipeWorker(
	options: UseMediaPipeWorkerOptions,
): UseMediaPipeWorkerReturn {
	const {
		delegate = DEFAULT_DELEGATE,
		modelPath = DEFAULT_MODEL_PATH,
		handModelPath = DEFAULT_HAND_MODEL_PATH,
		enableHand = false,
		enableSegmentation = false,
		onResults,
		onHandResults,
		onSegmentationMask,
		onBlurredFrame,
		onError,
		onReady,
	} = options;

	// Worker instance reference
	const workerRef = useRef<Worker | null>(null);

	// Ready state
	const [isReady, setIsReady] = useState(false);
	const [isHandReady, setIsHandReady] = useState(false);

	// Callback refs (avoid stale closures)
	const onResultsRef = useRef(onResults);
	const onHandResultsRef = useRef(onHandResults);
	const onSegmentationMaskRef = useRef(onSegmentationMask);
	const onBlurredFrameRef = useRef(onBlurredFrame);
	const onErrorRef = useRef(onError);
	const onReadyRef = useRef(onReady);

	// Update callback refs when they change
	useEffect(() => {
		onResultsRef.current = onResults;
		onHandResultsRef.current = onHandResults;
		onSegmentationMaskRef.current = onSegmentationMask;
		onBlurredFrameRef.current = onBlurredFrame;
		onErrorRef.current = onError;
		onReadyRef.current = onReady;
	}, [onResults, onHandResults, onSegmentationMask, onBlurredFrame, onError, onReady]);

	// Initialize worker
	useEffect(() => {
		let worker: Worker;

		try {
			// Create worker instance using Webpack 5 native worker support
			// IMPORTANT: Must be single expression for Webpack static analysis
			worker = new Worker(
				new URL('../workers/mediapipe.worker.ts', import.meta.url)
			);
		} catch (error) {
			console.error('[useMediaPipeWorker] Failed to create worker:', error);
			onErrorRef.current?.({
				message: `Failed to create worker: ${error instanceof Error ? error.message : 'Unknown error'}`,
				code: 'INIT_FAILED',
			});
			return;
		}

		workerRef.current = worker;

		// Error handler for worker script errors
		worker.onerror = (event) => {
			console.error('[useMediaPipeWorker] Worker error:', event);
			onErrorRef.current?.({
				message: `Worker error: ${event.message || 'Unknown worker error'}`,
				code: 'INIT_FAILED',
			});
		};

		// Message handler
		const handleMessage = (event: MessageEvent<WorkerOutMessage>) => {
			const message = event.data;

			switch (message.type) {
				case 'READY':
					setIsReady(true);
					onReadyRef.current?.();
					break;

				case 'HAND_READY':
					setIsHandReady(true);
					break;

				case 'RESULTS':
					onResultsRef.current(
						message.payload.landmarks,
						message.payload.timestamp,
					);
					// Call segmentation mask callback if mask data is present
					if (message.payload.segmentationMask) {
						onSegmentationMaskRef.current?.(message.payload.segmentationMask);
					}
					// Call blurred frame callback if available (worker-composited frame)
					if (message.payload.blurredFrame) {
						onBlurredFrameRef.current?.(message.payload.blurredFrame);
					}
					break;

				case 'HAND_RESULTS': {
					const handedness = message.payload.handedness.map(
						h => h.categoryName,
					);
					onHandResultsRef.current?.(message.payload.landmarks, handedness);
					break;
				}

				case 'ERROR':
					onErrorRef.current?.(message.payload);
					break;

				default: {
					// Exhaustive check
					const _exhaustive: never = message;
					console.warn('Unknown worker message:', _exhaustive);
					break;
				}
			}
		};

		worker.addEventListener('message', handleMessage);

		// Initialize pose detection
		worker.postMessage({
			type: 'INIT',
			payload: {
				delegate,
				modelPath,
				enableSegmentation,
			},
		});

		// Initialize hand detection if enabled
		if (enableHand) {
			worker.postMessage({
				type: 'INIT_HAND',
				payload: {
					modelPath: handModelPath,
				},
			});
		}

		// Cleanup on unmount
		return () => {
			worker.removeEventListener('message', handleMessage);
			worker.postMessage({ type: 'CLEANUP' });
			worker.terminate();
			workerRef.current = null;
			setIsReady(false);
			setIsHandReady(false);
		};
	}, [delegate, modelPath, handModelPath, enableHand, enableSegmentation]);

	// Detect pose from video
	const detect = useCallback(async (video: HTMLVideoElement): Promise<void> => {
		const worker = workerRef.current;
		if (!worker || !isReady) {
			return;
		}

		// Validate video element is ready for bitmap creation
		// createImageBitmap fails if video dimensions are 0 or video not loaded
		if (
			video.videoWidth === 0 ||
			video.videoHeight === 0 ||
			video.readyState < 2 // HAVE_CURRENT_DATA
		) {
			return;
		}

		try {
			// Create ImageBitmap for zero-copy transfer
			const bitmap = await createImageBitmap(video);

			// Post message with transferable (zero-copy)
			worker.postMessage(
				{
					type: 'DETECT',
					payload: {
						imageBitmap: bitmap,
						timestamp: performance.now(),
					},
				},
				[bitmap], // Transferable array enables zero-copy
			);
		} catch (error) {
			// Only log unexpected errors, not transient video state issues
			if (!(error instanceof DOMException && error.name === 'InvalidStateError')) {
				console.error('Failed to create ImageBitmap:', error);
				onErrorRef.current?.({
					message: error instanceof Error ? error.message : 'Unknown error',
					code: 'DETECT_FAILED',
				});
			}
		}
	}, [isReady]);

	// Detect hand from video
	const detectHand = useCallback(async (video: HTMLVideoElement): Promise<void> => {
		const worker = workerRef.current;
		if (!worker || !isHandReady) {
			return;
		}

		// Validate video element is ready for bitmap creation
		if (
			video.videoWidth === 0 ||
			video.videoHeight === 0 ||
			video.readyState < 2
		) {
			return;
		}

		try {
			// Create ImageBitmap for zero-copy transfer
			const bitmap = await createImageBitmap(video);

			// Post message with transferable (zero-copy)
			worker.postMessage(
				{
					type: 'DETECT_HAND',
					payload: {
						imageBitmap: bitmap,
						timestamp: performance.now(),
					},
				},
				[bitmap], // Transferable array enables zero-copy
			);
		} catch (error) {
			// Only log unexpected errors, not transient video state issues
			if (!(error instanceof DOMException && error.name === 'InvalidStateError')) {
				console.error('Failed to create ImageBitmap for hand detection:', error);
				onErrorRef.current?.({
					message: error instanceof Error ? error.message : 'Unknown error',
					code: 'DETECT_FAILED',
				});
			}
		}
	}, [isHandReady]);

	// Manual terminate function
	const terminate = useCallback(() => {
		const worker = workerRef.current;
		if (worker) {
			worker.postMessage({ type: 'CLEANUP' });
			worker.terminate();
			workerRef.current = null;
			setIsReady(false);
			setIsHandReady(false);
		}
	}, []);

	return {
		detect,
		detectHand,
		isReady,
		isHandReady,
		terminate,
	};
}
