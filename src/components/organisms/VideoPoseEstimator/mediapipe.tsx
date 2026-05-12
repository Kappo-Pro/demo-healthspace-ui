/* eslint-disable react-refresh/only-export-components */
import { Landmark } from '@mediapipe/tasks-vision';
import { landmarksToRemove } from '@pages/PostureScan/constants';
import {
	boneColor,
	circleRadius,
	drawDashedLine,
	drawHip,
} from '@utils/SkeletonMedia';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useMediaPipeWorker } from '@hooks/useMediaPipeWorker';
import type { NormalizedLandmark } from '@workers/types';

const defaultVideoSize = { width: 1280, height: 720 };

// Target ~10fps for pose detection (100ms between frames)
// Lower frame rate reduces CPU load while still providing smooth skeleton tracking
const TARGET_FRAME_INTERVAL_MS = 100;

const drawOptions = {
	// Canvas API doesn't support CSS variables - use hex value
	color: '#ffffff', // equiv: var(--text-on-dark)
	lineWidth: 5,
	visibilityMin: 0.65,
};


function throttle<T extends (...args: any[]) => void>(
	func: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let lastCall = 0;
	return (...args: Parameters<T>): void => {
		const now = performance.now();
		if (now - lastCall < delay) return;
		lastCall = now;
		func(...args);
	};
}

// Canvas 2D API requires hex values - Mediapipe exempted from design token rules
export const highlightedBoneColor = '#6847C6'; // equiv: var(--brand-primary)

const JOINT_FILL_COLOR = '#8B5CF6'; // equiv: var(--brand-secondary)

function Mediapipe(props: {
	cameraId: string | null;
	isFullscreen: boolean;
	isSwitchMode: boolean;
	stopLandmarks?: boolean;
	bodyPointsToHighlight?: number[];
	videoSizeState?: string;
	setCanvasDimensions: (dimensions: { width: number; height: number }) => void;
	onVideoAspectRatio?: (aspectRatio: number) => void;
}) {
	const {
		cameraId,
		stopLandmarks,
		isFullscreen,
		bodyPointsToHighlight = [],
		videoSizeState,
		setCanvasDimensions,
	} = props;
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const lastFrameTimeRef = useRef<number>(0);
	const isMounted = useRef(true);
	const setupCameraTimerRef = useRef<NodeJS.Timeout | null>(null);
	const isCameraSettingUpRef = useRef(false);
	const setupCameraRef = useRef<() => void>(() => {});

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	const videoSize = defaultVideoSize;
	const frameRate = isIpad ? { ideal: 10, max: 15 } : { ideal: 15, max: 20 };

	const animationFrameIdRef = useRef<number | undefined>(undefined);

	const triggerResultsEvent = (eventName: string, data: unknown) => {
		const event = new CustomEvent(eventName, { detail: data });
		window.dispatchEvent(event);
	};
	const throttledTriggerResultsEvent = throttle((eventName: string, data: unknown) => triggerResultsEvent(eventName, data), 500);

	const drawCallback = useCallback(
		(landmarks: NormalizedLandmark[]) => {
			if (!landmarks || !canvasRef.current) return;

			throttledTriggerResultsEvent('results', {
				results: landmarks,
			});

			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			const video = videoRef.current;
			if (!ctx || !video) return;

			const width = (canvas.width = video.videoWidth);
			const height = (canvas.height = video.videoHeight);

			ctx.save();
			ctx.clearRect(0, 0, width, height);

			const transform = (
				landmark: Landmark,
			): { x: number; y: number; z: number } => ({
				x: landmark.x * canvas.width,
				y: landmark.y * canvas.height,
				z: landmark.z ? landmark.z * canvas.width : 0,
			});

			const bonePairs = [
				{ points: [11, 13] },
				{ points: [13, 15] },
				{ points: [12, 14] },
				{ points: [14, 16] },
				{ points: [23, 25] },
				{ points: [25, 27] },
				{ points: [24, 26] },
				{ points: [26, 28] },
			];

			bonePairs.forEach(({ points: [startIdx, endIdx] }) => {
				const start = landmarks[startIdx];
				const end = landmarks[endIdx];

				if (
					start.visibility < drawOptions.visibilityMin ||
					end.visibility < drawOptions.visibilityMin
				)
					return;

				const p1 = transform(start);
				const p2 = transform(end);

				drawDashedLine(
					ctx as CanvasRenderingContext2D,
					p1.x,
					p1.y,
					p2.x,
					p2.y,
					boneColor,
				);
			});

			drawHip(ctx, landmarks, transform, boneColor);

			// Draw lines from neck to shoulders and spine
			const leftShoulder = landmarks[11];
			const rightShoulder = landmarks[12];
			let neckX = 0, neckY = 0;
			if (
				leftShoulder.visibility >= drawOptions.visibilityMin &&
				rightShoulder.visibility >= drawOptions.visibilityMin
			) {
				const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x) * canvas.width;
				const neckOffset = shoulderWidth * 0.15;
				neckX = ((leftShoulder.x + rightShoulder.x) / 2) * canvas.width;
				neckY = ((leftShoulder.y + rightShoulder.y) / 2) * canvas.height - neckOffset;

				// Neck to left shoulder
				const p1 = transform(leftShoulder);
				drawDashedLine(ctx, neckX, neckY, p1.x, p1.y, boneColor);

				// Neck to right shoulder
				const p2 = transform(rightShoulder);
				drawDashedLine(ctx, neckX, neckY, p2.x, p2.y, boneColor);

				// Neck to hip center (spine)
				const leftHip = landmarks[23];
				const rightHip = landmarks[24];
				if (
					leftHip.visibility >= drawOptions.visibilityMin &&
					rightHip.visibility >= drawOptions.visibilityMin
				) {
					const hipX = ((leftHip.x + rightHip.x) / 2) * canvas.width;
					const hipY = ((leftHip.y + rightHip.y) / 2) * canvas.height;
					drawDashedLine(ctx, neckX, neckY, hipX, hipY, boneColor);
				}

				// Draw neck joint
				ctx.beginPath();
				ctx.arc(neckX, neckY, circleRadius, 0, 2 * Math.PI);
				ctx.fillStyle = JOINT_FILL_COLOR;
				ctx.fill();
				ctx.strokeStyle = boneColor;
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			landmarks.forEach((lm, idx) => {
				if (
					landmarksToRemove.includes(idx) ||
					lm.visibility < drawOptions.visibilityMin
				)
					return;
				const { x, y } = transform(lm);
				ctx.beginPath();
				ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
				ctx.fillStyle = JOINT_FILL_COLOR;
				ctx.fill();
				ctx.strokeStyle = boneColor; // White border
				ctx.lineWidth = 1;
				ctx.stroke();
			});

			ctx.restore();
		},

		[throttledTriggerResultsEvent],
	);

	// Worker callbacks
	const handlePoseResults = useCallback((landmarks: NormalizedLandmark[][]) => {
		if (landmarks[0]) {
			drawCallback(landmarks[0]);
		}
	}, [drawCallback]);

	// Initialize MediaPipe worker
	const { detect, isReady } = useMediaPipeWorker({
		delegate: isIpad ? 'GPU' : 'CPU',
		modelPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
		enableHand: false,
		onResults: handlePoseResults,
	});

	const predictWebcam = useCallback(async () => {
		if (!videoRef.current) {
			animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
			return;
		}

		// Skip detection if landmarks are disabled or worker not ready
		if (stopLandmarks || !isReady) {
			animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
			return;
		}

		const startTimeMs = performance.now();
		const timeSinceLastFrame = startTimeMs - lastFrameTimeRef.current;

		if (timeSinceLastFrame < TARGET_FRAME_INTERVAL_MS) {
			animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
			return;
		}

		if (videoRef.current.readyState < 2) {
			animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
			return;
		}

		lastFrameTimeRef.current = startTimeMs;

		// Non-blocking pose detection
		detect(videoRef.current);

		animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
	}, [detect, isReady, stopLandmarks]);

	const stopStreamedVideo = useCallback(() => {
		if (videoRef.current) {
			animationFrameIdRef.current &&
				cancelAnimationFrame(animationFrameIdRef.current);
			const stream = videoRef.current.srcObject as MediaStream;
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}
			videoRef.current.srcObject = null;
			videoRef.current.removeEventListener('loadeddata', predictWebcam);
		}
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop());
			streamRef.current = null;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setupCamera = useCallback(() => {
		// Cancel any pending retry timer
		if (setupCameraTimerRef.current) {
			clearTimeout(setupCameraTimerRef.current);
			setupCameraTimerRef.current = null;
		}

		// Prevent concurrent camera setups
		if (isCameraSettingUpRef.current) {
			return;
		}

		if (!navigator.mediaDevices?.getUserMedia) {
			console.error('Camera API not available');
			return;
		}

		// Worker readiness is now checked by the useEffect that calls this function
		// The effect only triggers when isReady becomes true

		isCameraSettingUpRef.current = true;

		const constraints = {
			video: {
				deviceId: { exact: cameraId as string },
				width: { ideal: videoSize.width, max: videoSize.width },
				height: { ideal: videoSize.height, max: videoSize.height },
				frameRate: frameRate,
			},
			audio: false,
		};

		// Stop any existing stream before requesting a new one
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop());
			streamRef.current = null;
		}

		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(stream => {
				// Check if component unmounted using isMounted ref
				if (!isMounted.current) {
					stream.getTracks().forEach(track => track.stop());
					isCameraSettingUpRef.current = false;
					return;
				}

				// Double check videoRef just in case
				if (!videoRef?.current) {
					stream.getTracks().forEach(track => track.stop());
					isCameraSettingUpRef.current = false;
					return;
				}

				streamRef.current = stream;

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.addEventListener('loadeddata', () => {
						isCameraSettingUpRef.current = false;
						predictWebcam();
					});
				} else {
					console.error('Video ref is null');
					isCameraSettingUpRef.current = false;
				}
			})
			.catch(error => {
				console.error('Camera setup failed:', error);
				isCameraSettingUpRef.current = false;
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cameraId, predictWebcam]);

	const setupCameraOnly = useCallback(() => {
		if (!navigator.mediaDevices?.getUserMedia) {
			// Camera not available - cannot proceed
			console.error('Camera API not available');
			return;
		}

		const constraints = {
			video: {
				deviceId: { exact: cameraId as string },
				width: { ideal: videoSize.width, max: videoSize.width },
				height: { ideal: videoSize.height, max: videoSize.height },
				frameRate: frameRate,
			},
			audio: false,
		};
		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(stream => {
				// Check if component unmounted
				if (!videoRef?.current) {
					stream.getTracks().forEach(track => track.stop());
					return;
				}

				streamRef.current = stream;

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			})
			.catch(error => {
				console.error('Camera setup (only mode) failed:', error);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cameraId]);

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
			// Cancel any pending camera setup retry
			if (setupCameraTimerRef.current) {
				clearTimeout(setupCameraTimerRef.current);
				setupCameraTimerRef.current = null;
			}
			isCameraSettingUpRef.current = false;
			stopStreamedVideo();
		};
	}, [stopStreamedVideo]);

	// Keep setupCameraRef in sync with latest setupCamera
	useEffect(() => {
		setupCameraRef.current = setupCamera;
	}, [setupCamera]);

	useEffect(() => {
		// Only setup camera when both cameraId is set AND worker is ready
		// This eliminates the race condition where camera tries to start before worker is initialized
		if (cameraId && isReady) {
			setupCameraRef.current();
		}
		// Re-run when cameraId or isReady changes
	}, [cameraId, isReady]);

	return (
		<div>
			<div id="printscreen">
				<video
					id="video"
					autoPlay
					playsInline
					ref={videoRef}
					onLoadedMetadata={() => {
						const video = videoRef.current;
						const canvas = canvasRef.current;
						if (video && canvas) {
							canvas.width = video.videoWidth;
							canvas.height = video.videoHeight;
							setCanvasDimensions({
								width: video.videoWidth,
								height: video.videoHeight,
							});
							if (props.onVideoAspectRatio) {
								props.onVideoAspectRatio(video.videoWidth / video.videoHeight);
							}
						}
					}}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						objectFit: videoSizeState as React.CSSProperties['objectFit'],
						zIndex: 1,
						pointerEvents: 'none',
						background: 'var(--color-background-video-element)',
					}}
				/>
			</div>
			<canvas
				id="canvas"
				ref={canvasRef}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					objectFit: videoSizeState as React.CSSProperties['objectFit'],
					zIndex: 2,
					pointerEvents: 'none',
				}}
			/>
		</div>
	);
}

export default memo(Mediapipe);
