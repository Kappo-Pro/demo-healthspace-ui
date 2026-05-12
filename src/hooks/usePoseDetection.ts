/**
 * usePoseDetection Hook
 *
 * Real-time pose detection using BlazePose GHUM.
 * Manages PoseDetectorService lifecycle and provides pose results.
 *
 * @module hooks/usePoseDetection
 * @since EPIC-001-S4
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseDetectorService } from '@utils/mediapipe/poseDetector';
import type { PoseResult, PoseLandmark3D, ModelComplexity } from '@types/mediapipe';

export interface UsePoseDetectionOptions {
	/** Video element reference */
	videoRef: React.RefObject<HTMLVideoElement | null>;

	/** Model complexity (0=Lite, 1=Full, 2=GHUM) */
	modelComplexity?: ModelComplexity;

	/** Enable automatic detection on mount */
	autoStart?: boolean;
}

export interface UsePoseDetectionReturn {
	/** Current pose result */
	poseResult: PoseResult | null;

	/** Is pose detection active */
	isDetecting: boolean;

	/** Is detector loading/initializing */
	isLoading: boolean;

	/** Error message if detection fails */
	error: string | null;

	/** Frames per second */
	fps: number;

	/** Start pose detection */
	startDetection: () => void;

	/** Stop pose detection */
	stopDetection: () => void;
}

/**
 * Pose Detection Hook
 *
 * Manages real-time pose detection from video stream.
 *
 * @param options - Hook options
 * @returns Pose detection state and controls
 *
 * @example
 * ```typescript
 * const videoRef = useRef<HTMLVideoElement>(null);
 * const { poseResult, isDetecting, startDetection } = usePoseDetection({ videoRef });
 *
 * useEffect(() => {
 *   if (videoRef.current) {
 *     startDetection();
 *   }
 * }, []);
 * ```
 */
export function usePoseDetection(options: UsePoseDetectionOptions): UsePoseDetectionReturn {
	const { videoRef, modelComplexity = 2, autoStart = false } = options;

	const [poseResult, setPoseResult] = useState<PoseResult | null>(null);
	const [isDetecting, setIsDetecting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fps, setFps] = useState(0);

	const detectorRef = useRef<PoseDetectorService | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastFrameTimeRef = useRef<number>(0);
	const frameCountRef = useRef(0);
	const fpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Initialize detector
	const initializeDetector = useCallback(async () => {
		if (detectorRef.current?.isReady()) {
			return; // Already initialized
		}

		setIsLoading(true);
		setError(null);

		try {
			const detector = new PoseDetectorService();
			await detector.initialize(modelComplexity);
			detectorRef.current = detector;
			setIsLoading(false);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to initialize pose detector';
			setError(message);
			setIsLoading(false);
			throw err;
		}
	}, [modelComplexity]);

	// Detection loop
	const detectFrame = useCallback(async () => {
		const video = videoRef.current;
		const detector = detectorRef.current;

		if (!video || !detector || !detector.isReady()) {
			return;
		}

		// Skip if video not ready
		if (video.videoWidth === 0 || video.videoHeight === 0) {
			animationFrameRef.current = requestAnimationFrame(detectFrame);
			return;
		}

		try {
			// Create canvas for frame capture
			const canvas = document.createElement('canvas');
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to get canvas context');
			}

			// Draw current video frame
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			// Get image data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			// Run detection
			const result = await detector.detectPose(imageData);

			// Update pose result
			setPoseResult(result);

			// Update FPS counter
			frameCountRef.current++;
			const now = performance.now();
			if (now - lastFrameTimeRef.current >= 1000) {
				setFps(frameCountRef.current);
				frameCountRef.current = 0;
				lastFrameTimeRef.current = now;
			}

			// Continue loop
			if (isDetecting) {
				animationFrameRef.current = requestAnimationFrame(detectFrame);
			}
		} catch (err) {
			console.error('[usePoseDetection] Detection error:', err);
			setError(err instanceof Error ? err.message : 'Pose detection failed');
		}
	}, [videoRef, isDetecting]);

	// Start detection
	const startDetection = useCallback(async () => {
		if (isDetecting) {
			return; // Already detecting
		}

		try {
			// Initialize detector if needed
			if (!detectorRef.current?.isReady()) {
				await initializeDetector();
			}

			setIsDetecting(true);
			setError(null);
			frameCountRef.current = 0;
			lastFrameTimeRef.current = performance.now();

			// Start detection loop
			animationFrameRef.current = requestAnimationFrame(detectFrame);
		} catch (err) {
			console.error('[usePoseDetection] Failed to start detection:', err);
			setError(err instanceof Error ? err.message : 'Failed to start detection');
		}
	}, [isDetecting, initializeDetector, detectFrame]);

	// Stop detection
	const stopDetection = useCallback(() => {
		setIsDetecting(false);

		// Cancel animation frame
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}

		// Clear FPS interval
		if (fpsIntervalRef.current) {
			clearInterval(fpsIntervalRef.current);
			fpsIntervalRef.current = null;
		}

		setFps(0);
		frameCountRef.current = 0;
	}, []);

	// Auto-start if requested
	useEffect(() => {
		if (autoStart && videoRef.current) {
			startDetection();
		}
	}, [autoStart, videoRef, startDetection]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopDetection();
			if (detectorRef.current) {
				detectorRef.current.dispose();
				detectorRef.current = null;
			}
		};
	}, [stopDetection]);

	return {
		poseResult,
		isDetecting,
		isLoading,
		error,
		fps,
		startDetection,
		stopDetection,
	};
}
