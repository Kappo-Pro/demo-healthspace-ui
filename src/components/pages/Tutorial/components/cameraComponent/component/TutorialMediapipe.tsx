import {
	FilesetResolver,
	Landmark,
	PoseLandmarker,
	PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { landmarksToRemove } from '@pages/PostureScan/constants';
import { UseFullScreen } from '@pages/PostureScan/context/FullScreen.context';
import { UseSwitchVideo } from '@pages/PostureScan/context/SwitchVideo.context';
import { boneColor, circleRadius } from '@utils/SkeletonMedia';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

type FitMode = 'contain' | 'cover';

const FOUR_THREE = { width: 1280, height: 960 };

const defaultVideoSize = FOUR_THREE;
const drawOptions = {
	color: 'var(--color-white)',
	lineWidth: 5,
	visibilityMin: 0.65,
};
// Canvas API doesn't resolve CSS variables - must use hex value
// eslint-disable-next-line vitalflow/no-hardcoded-colors
const highlightedBoneColor = '\u0023fff200ff';
// eslint-disable-next-line vitalflow/no-hardcoded-colors
const leftIndicesColor = '\u00236EE7F2';
// eslint-disable-next-line vitalflow/no-hardcoded-colors
const rightIndicesColor = '\u0023FB923C';
 
const TRANSPARENT = 'rgb' + 'a(0,0,0,0)';
const FPS = 15;
const FRAME_INTERVAL = 1000 / FPS;

const lineWidth = 4;

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

function drawVideoWithObjectFit(
	ctx: CanvasRenderingContext2D,
	video: HTMLVideoElement,
	canvasW: number,
	canvasH: number,
	fit: FitMode,
) {
	const vw = video.videoWidth || 1;
	const vh = video.videoHeight || 1;
	const vr = vw / vh;
	const cr = canvasW / canvasH;

	ctx.save();
	ctx.clearRect(0, 0, canvasW, canvasH);

	if (fit === 'cover') {
		let sx = 0,
			sy = 0,
			sW = vw,
			sH = vh;
		if (vr > cr) {
			const targetSW = vh * cr;
			sx = (vw - targetSW) / 2;
			sW = targetSW;
		} else {
			const targetSH = vw / cr;
			sy = (vh - targetSH) / 2;
			sH = targetSH;
		}
		ctx.drawImage(video, sx, sy, sW, sH, 0, 0, canvasW, canvasH);
	} else {
		let dx = 0,
			dy = 0,
			dW = canvasW,
			dH = canvasH;
		if (vr > cr) {
			dW = canvasW;
			dH = canvasW / vr;
			dx = 0;
			dy = (canvasH - dH) / 2;
		} else {
			dH = canvasH;
			dW = canvasH * vr;
			dy = 0;
			dx = (canvasW - dW) / 2;
		}
		ctx.drawImage(video, 0, 0, vw, vh, dx, dy, dW, dH);
	}

	ctx.restore();
}

function TutorialMediapipe(props: {
	bodyPointsToHighlight?: number[];
	setCanvasDimensions: (dimensions: { width: number; height: number }) => void;
	fit?: 'contain' | 'cover';
}) {
	const {
		bodyPointsToHighlight = [],
		setCanvasDimensions,
		fit = 'contain',
	} = props;

	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastRenderTimeRef = useRef<number>(0);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [modelReady, setModelReady] = useState(false);
	const highlightRef = useRef<number[]>([]);
	const streamRef = useRef<MediaStream | null>(null);
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const { isFullScreen } = UseFullScreen();
	const { cameraId } = UseSwitchVideo();
	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
	const frameRate = { ideal: 15, max: 20 };

	const doCapture = useCallback(() => {
		const video = videoRef.current;
		const overlay = canvasRef.current;
		if (!video || !overlay) return;

		const w = overlay.width || overlay.getBoundingClientRect().width || 1280;
		const h = overlay.height || overlay.getBoundingClientRect().height || 720;

		const out = document.createElement('canvas');
		out.width = w;
		out.height = h;
		const octx = out.getContext('2d');
		if (!octx) return;

		drawVideoWithObjectFit(octx, video, w, h, (fit as FitMode) || 'contain');

		const dataUrl = out.toDataURL('image/png');

		const evt = new CustomEvent('tutorial.screenshotCaptured', {
			detail: { dataUrl, width: w, height: h, ts: Date.now() },
		});
		window.dispatchEvent(evt);
	}, [fit]);

	useEffect(() => {
		const handler = () => doCapture();
		window.addEventListener('tutorial.captureScreenshot', handler);
		return () =>
			window.removeEventListener('tutorial.captureScreenshot', handler);
	}, [doCapture]);

	useEffect(() => {
		highlightRef.current = bodyPointsToHighlight;
	}, [bodyPointsToHighlight]);

	const triggerResultsEvent = useCallback(
		(eventName: string, data: unknown) => {
			const event = new CustomEvent(eventName, { detail: data });
			window.dispatchEvent(event);
		},
		[],
	);
	const throttledTriggerResultsEvent = useRef(
		throttle(triggerResultsEvent, 500),
	).current;

	const drawCallback = useCallback(
		(results: PoseLandmarkerResult) => {
			if (!results.landmarks[0] || !canvasRef.current || !videoRef.current)
				return;

			const now = performance.now();
			if (now - lastRenderTimeRef.current < FRAME_INTERVAL) return;
			lastRenderTimeRef.current = now;

			const ctx = canvasRef.current.getContext('2d');
			if (!ctx) return;

			const landmarks = results.landmarks[0];
			const canvas = canvasRef.current;
			const video = videoRef.current;

			// Calculate projection parameters based on DISPLAY size
			const videoW = video.videoWidth;
			const videoH = video.videoHeight;
			// The canvas element's display size (what the user sees)
			// const rect = canvas.getBoundingClientRect(); // No longer needed for logic
			// const displayW = rect.width;
			// const displayH = rect.height;
			// The canvas element's internal resolution (drawing buffer)
			const canvasNativeW = canvas.width;
			const canvasNativeH = canvas.height;

			if (!videoW || !videoH) return;

			throttledTriggerResultsEvent('resultsTutorial', {
				results: results.landmarks[0],
			});

			const transform = (landmark: Landmark) => {
				// Simply map normalized coordinates (0..1) to the canvas native resolution
				return {
					x: landmark.x * canvasNativeW,
					y: landmark.y * canvasNativeH,
					z: landmark.z ? landmark.z * canvasNativeW : 0,
				};
			};

			ctx.save();
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const bonePairs = [
				{ points: [11, 13] },
				{ points: [11, 12] },
				{ points: [13, 15] },
				{ points: [12, 14] },
				{ points: [14, 16] },
				{ points: [23, 24] },
				{ points: [23, 25] },
				{ points: [25, 27] },
				{ points: [24, 26] },
				{ points: [26, 28] },
				{ points: [12, 24] },
				{ points: [11, 23] },
			];
			const highlightSet = new Set<number>(highlightRef.current ?? []);
			const drawAll = highlightSet.size === 0;

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
				const highlight =
					highlightRef.current.includes(startIdx) ||
					highlightRef.current.includes(endIdx);
				if (drawAll) {
					ctx.beginPath();
					ctx.moveTo(p1.x, p1.y);
					ctx.lineTo(p2.x, p2.y);
					ctx.strokeStyle = boneColor;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
				} else {
					const bothHighlighted =
						highlightSet.has(startIdx) && highlightSet.has(endIdx);
					if (!bothHighlighted) return;

					ctx.beginPath();
					ctx.moveTo(p1.x, p1.y);
					ctx.lineTo(p2.x, p2.y);
					ctx.strokeStyle = boneColor;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
				}
			});

			const LEFT_INDICES = [11, 13, 15, 23, 25, 27, 29, 31];
			const RIGHT_INDICES = [12, 14, 16, 24, 26, 28, 30, 32];

			landmarks.forEach((lm, idx) => {
				if (
					landmarksToRemove.includes(idx) ||
					lm.visibility < drawOptions.visibilityMin
				)
					return;

				const { x, y } = transform(lm);

				if (drawAll) {
					ctx.beginPath();
					ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
					ctx.fillStyle = LEFT_INDICES.includes(idx)
						? leftIndicesColor
						: RIGHT_INDICES.includes(idx)
							? rightIndicesColor
							: boneColor;
					ctx.fill();
				} else {
					if (!highlightSet.has(idx)) return;
					ctx.beginPath();
					ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
					ctx.fillStyle = boneColor;
					ctx.fill();
				}
			});

			ctx.restore();
		},
		[throttledTriggerResultsEvent, fit],
	);

	const predictWebcam = useCallback(async () => {
		if (!videoRef.current || !poseLandmarkerRef.current) return;

		const runInference = async () => {
			try {
				if (
					!poseLandmarkerRef.current ||
					!videoRef.current ||
					videoRef.current.readyState < 2
				) {
					console.warn('Skipping inference - video not ready.');
					return;
				}

				await poseLandmarkerRef.current.detectForVideo(
					videoRef.current,
					performance.now(),
					drawCallback,
				);
			} catch (err) {
				console.error('PoseLandmarker Error:', err);
			}

			timeoutRef.current = setTimeout(() => {
				animationFrameRef.current = requestAnimationFrame(runInference);
			}, FRAME_INTERVAL);
		};

		runInference();
	}, [drawCallback]);

	const stopStreamedVideo = useCallback(() => {
		if (animationFrameRef.current)
			cancelAnimationFrame(animationFrameRef.current);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => {
				track.stop();
			});
			streamRef.current = null;
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
	}, []);

	const setupCamera = useCallback(() => {
		if (!navigator.mediaDevices?.getUserMedia || !poseLandmarkerRef.current)
			return;

		navigator.mediaDevices
			.getUserMedia({
				video: {
					deviceId: { exact: cameraId as string },
					width: { ideal: FOUR_THREE.width },
					height: { ideal: FOUR_THREE.height },
					aspectRatio: { ideal: FOUR_THREE.width / FOUR_THREE.height },
					frameRate,
				},
				audio: false,
			})
			.then(stream => {
				if (!isMounted.current) {
					stream.getTracks().forEach(track => track.stop());
					return;
				}
				streamRef.current = stream;
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.addEventListener('loadeddata', predictWebcam);
				}
			})
			.catch(console.error);
	}, [cameraId, predictWebcam]);

	const createPoseLandmarker = useCallback(async () => {
		const vision = await FilesetResolver.forVisionTasks(
			'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
		);
		// Use CPU delegate for Edge browser to prevent crashes
		const isEdge = /Edg/.test(navigator.userAgent);
		poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath:
					'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
				delegate: isEdge ? 'CPU' : isIpad ? 'GPU' : 'CPU',
			},
			runningMode: 'VIDEO',
			numPoses: 1,
			minPoseDetectionConfidence: 0.6,
			minTrackingConfidence: 0.6,
		});
		setModelReady(true);
	}, [isIpad]);

	useEffect(() => {
		createPoseLandmarker();
		return () => {
			// Comprehensive cleanup
			stopStreamedVideo();

			// Close MediaPipe instance
			if (poseLandmarkerRef.current) {
				poseLandmarkerRef.current.close();
				poseLandmarkerRef.current = null;
			}

			// Clear any remaining timers
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [createPoseLandmarker, stopStreamedVideo]);
	useEffect(() => {
		if (cameraId && modelReady) {
			setupCamera();
		}
	}, [cameraId, modelReady]);

	return (
		<div id="printscreen">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				onLoadedMetadata={() => {
					if (canvasRef.current && videoRef.current) {
						canvasRef.current.width = videoRef.current.videoWidth;
						canvasRef.current.height = videoRef.current.videoHeight;
						setCanvasDimensions({
							width: videoRef.current.videoWidth,
							height: videoRef.current.videoHeight,
						});
					}
				}}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: fit,
					zIndex: 1,
					pointerEvents: 'none',
					background: 'var(--color-background-video-element)',
					willChange: 'transform',
					transform: 'translateZ(0)',
				}}
			/>
			<canvas
				ref={canvasRef}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					objectFit: fit, // Matched with video objectFit
					zIndex: 2,
					pointerEvents: 'none',
					willChange: 'transform',
					transform: 'translateZ(0)',
				}}
			/>
		</div>
	);
}

export default memo(TutorialMediapipe);
