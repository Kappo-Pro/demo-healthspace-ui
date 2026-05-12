import {
	FilesetResolver,
	Landmark,
	NormalizedLandmark,
	PoseLandmarker,
	PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import EventEmitter from '@services/EventEmitter';
import {
	PersonOrientation,
	boneColor,
	circleRadius,
	drawDashedLine,
	drawHip,
} from '@utils/SkeletonMedia';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { drawOptions, videoSize } from '../constants';
import { PosturalAnalytics, UseControls } from '../context/Controls.context';
import { UseFullScreen } from '../context/FullScreen.context';
import { UseSwitchVideo } from '../context/SwitchVideo.context';

const fps = 30; // Optimal for pose detection - balances responsiveness and performance
const fpsInMiliceconds = 1000 / fps;

function throttle<T extends (...args: any[]) => void>(
	func: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let lastCall = 0;
	return function (...args: Parameters<T>): void {
		const now = performance.now();
		if (now - lastCall < delay) {
			return;
		}
		lastCall = now;
		func(...args);
	};
}

interface MediapipeProps {
	isSkeletonVisible?: boolean;
}

export const landmarksToRemove = {
	front: [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22, 29, 30, 31, 32,
	],
	back: [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22, 29, 30, 31, 32,
	],
	left: [
		0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 17, 18, 19, 20, 21, 22, 28, 29, 30, 31, 32,
		12, 14, 16, 24, 26, 28, 13, 15,
	],
	right: [
		0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 17, 18, 19, 20, 21, 22, 27, 29, 30, 31, 32,
		11, 13, 15, 23, 25, 27, 14, 16,
	],
};

const postureBoneMap: Record<string, [number, number][]> = {
	front: [
		[11, 13],
		[13, 15],
		[12, 14],
		[14, 16],
		[23, 25],
		[25, 27],
		[24, 26],
		[26, 28],
		[23, 24],
	],
	back: [
		[11, 13],
		[13, 15],
		[12, 14],
		[14, 16],
		[23, 25],
		[25, 27],
		[24, 26],
		[26, 28],
		[23, 24],
	],
	left: [
		[23, 25],
		[25, 27],
		[7, 11],
		[11, 23],
	],
	right: [
		[24, 26],
		[26, 28],
		[8, 12],
		[12, 24],
	],
};

// Canvas 2D API requires hex values - Mediapipe exempted from design token rules
 
const JOINT_ERROR_COLOR = '#DC2626'; // equiv: var(--error-500)
 
const JOINT_FILL_COLOR = '#8B5CF6'; // equiv: var(--brand-secondary)

function Mediapipe() {
	const { isFullScreen } = UseFullScreen();

	const { cameraId } = UseSwitchVideo();
	const {
		onGetCurrent,
		isPersonInBox,
		isSkeletonVisible,
		isAligned,
		setCanvasDimensions,
	} = UseControls();

	const current = onGetCurrent() as Partial<PosturalAnalytics>;

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const skeletonVisibleRef = useRef<boolean>(isSkeletonVisible);
	const currenPostureRef = useRef<PersonOrientation>(PersonOrientation.FRONT);

	// MediaPipe instance and animation tracking refs
	const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
	const animationFrameIdRef = useRef<number | null>(null);
	const timeOutIdRef = useRef<NodeJS.Timeout | null>(null);
	const isInitializingRef = useRef(false);
	const isActiveRef = useRef(true); // Track if component is active and should predict
	const [modelReady, setModelReady] = useState(false);
	const cameraSetupRef = useRef(false); // Track if camera is already set up
	const currentCameraIdRef = useRef<string | null>(null); // Track current camera ID

	useEffect(() => {
		skeletonVisibleRef.current = isSkeletonVisible;
	}, [isSkeletonVisible]);

	const triggerResultsEvent = useCallback(
		(eventName: string, data: NormalizedLandmark[]) => {
			EventEmitter.emit(eventName, data);
		},
		[],
	);

	// Stable throttled function using useRef to prevent recreation on every render
	const throttledTriggerResultsEvent = useRef(
		throttle(triggerResultsEvent, 250),
	).current;

	useEffect(() => {
		if (current) {
			if (current.view) {
				currenPostureRef.current = current.view as PersonOrientation;
			}
		}
	}, [current]);

	const drawCallback = useCallback(
		(results: PoseLandmarkerResult) => {
			if (!results.landmarks[0] || !canvasRef.current || !videoRef.current)
				return;

			throttledTriggerResultsEvent('results', results.landmarks[0]);

			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			const video = videoRef.current;
			if (!ctx) return;

			const width = (canvas.width = video.videoWidth);
			const height = (canvas.height = video.videoHeight);

			ctx.save();
			ctx.clearRect(0, 0, width, height);

			const landmarks = results.landmarks[0];

			const transform = (
				landmark: Landmark,
			): { x: number; y: number; z: number } => ({
				x: landmark.x * canvas.width,
				y: landmark.y * canvas.height,
				z: landmark.z ? landmark.z * canvas.width : 0,
			});

			if (!skeletonVisibleRef.current) {
				// Draw joints only with error color when skeleton not visible
				landmarks.forEach((lm, idx) => {
					if (
						landmarksToRemove[currenPostureRef.current].includes(idx) ||
						lm.visibility < drawOptions.visibilityMin
					)
						return;

					const { x, y } = transform(lm);
					ctx.beginPath();
					ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
					ctx.fillStyle = JOINT_ERROR_COLOR;
					ctx.fill();
				});
				ctx.restore();
				return;
			}

			const posture = currenPostureRef.current;
			const bonePairs: [number, number][] = postureBoneMap[posture] || [];

			// Draw bones with dashed lines
			bonePairs.forEach(([startIdx, endIdx]) => {
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

			// Draw hip connection only for front/back views
			if (posture === 'front' || posture === 'back') {
				drawHip(ctx, landmarks, transform, boneColor);
			}

			// Draw neck to shoulders and spine for front/back views
			if (posture === 'front' || posture === 'back') {
				const leftShoulder = landmarks[11];
				const rightShoulder = landmarks[12];
				if (
					leftShoulder.visibility >= drawOptions.visibilityMin &&
					rightShoulder.visibility >= drawOptions.visibilityMin
				) {
					const shoulderWidth =
						Math.abs(rightShoulder.x - leftShoulder.x) * canvas.width;
					const neckOffset = shoulderWidth * 0.15;
					const neckX = ((leftShoulder.x + rightShoulder.x) / 2) * canvas.width;
					const neckY =
						((leftShoulder.y + rightShoulder.y) / 2) * canvas.height -
						neckOffset;

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
			}

			// Draw joints with purple fill and white stroke
			landmarks.forEach((lm, idx) => {
				if (
					landmarksToRemove[currenPostureRef.current].includes(idx) ||
					lm.visibility < drawOptions.visibilityMin
				)
					return;

				const { x, y } = transform(lm);
				ctx.beginPath();
				ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
				ctx.fillStyle = JOINT_FILL_COLOR;
				ctx.fill();
				ctx.strokeStyle = boneColor;
				ctx.lineWidth = 1;
				ctx.stroke();
			});

			ctx.restore();
		},
		[throttledTriggerResultsEvent],
	);

	const predictWebcam = useCallback(() => {
		// Stop if component is no longer active
		if (!isActiveRef.current) {
			return;
		}

		// Check if video element has valid video data
		const video = videoRef?.current;
		if (
			!video ||
			!poseLandmarkerRef.current ||
			video.videoWidth === 0 ||
			video.videoHeight === 0 ||
			video.readyState < 2
		) {
			// Video not ready, skip this frame but schedule next check if still active
			if (isActiveRef.current) {
				timeOutIdRef.current = setTimeout(predictWebcam, fpsInMiliceconds);
			}
			return;
		}

		timeOutIdRef.current = setTimeout(() => {
			// Double-check active status and video validity before processing
			if (!isActiveRef.current) {
				return;
			}

			const video = videoRef?.current;
			if (
				!video ||
				video.videoWidth === 0 ||
				video.videoHeight === 0 ||
				video.readyState < 2
			) {
				if (isActiveRef.current) {
					animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
				}
				return;
			}

			try {
				poseLandmarkerRef.current?.detectForVideo(
					video,
					performance.now(),
					drawCallback,
				);
				// Only schedule next frame if still active
				if (isActiveRef.current) {
					animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
				}
			} catch (error) {
				console.error('Error on predictWebcam:', error);
				// Stop the loop on error
				isActiveRef.current = false;
				if (animationFrameIdRef.current) {
					cancelAnimationFrame(animationFrameIdRef.current);
					animationFrameIdRef.current = null;
				}
				if (timeOutIdRef.current) {
					clearTimeout(timeOutIdRef.current);
					timeOutIdRef.current = null;
				}
			}
		}, fpsInMiliceconds);
	}, [drawCallback]);

	const stopStreamedVideo = useCallback(() => {
		// CRITICAL: Set active flag to false FIRST to stop any pending callbacks
		isActiveRef.current = false;

		if (animationFrameIdRef.current) {
			cancelAnimationFrame(animationFrameIdRef.current);
			animationFrameIdRef.current = null;
		}
		if (timeOutIdRef.current) {
			clearTimeout(timeOutIdRef.current);
			timeOutIdRef.current = null;
		}

		if (videoRef?.current) {
			videoRef.current.removeEventListener('loadeddata', predictWebcam);
			videoRef.current.srcObject = null;
		}

		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => {
				track.stop();
			});
			streamRef.current = null;
		}

		// Reset camera setup flag when stopping video
		cameraSetupRef.current = false;
		currentCameraIdRef.current = null;
	}, [predictWebcam]);

	const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

	const setupCamera = useCallback(() => {
		if (!hasGetUserMedia()) {
			console.warn('getUserMedia() is not supported by your browser');
			return;
		}

		if (!poseLandmarkerRef.current) {
			console.warn('Wait! poseLandmaker not loaded yet.');
			setTimeout(setupCamera, 1000);
			return;
		}

		// Build constraints - use exact deviceId if available, otherwise any camera
		const videoConstraints: MediaTrackConstraints = {
			width: videoSize.width,
			height: videoSize.height,
			frameRate: {
				ideal: 15,
				max: 20,
			},
		};

		// Only add deviceId constraint if cameraId is available
		if (cameraId) {
			videoConstraints.deviceId = { exact: cameraId };
		}

		const constraints: MediaStreamConstraints = {
			video: videoConstraints,
			audio: false,
		};

		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(stream => {
				// Check if component unmounted (videoRef is null)
				if (!videoRef?.current) {
					stream.getTracks().forEach(track => track.stop());
					return;
				}

				if (videoRef?.current) {
					videoRef.current.srcObject = stream;
					streamRef.current = stream;

					videoRef.current.addEventListener('loadeddata', predictWebcam);
					cameraSetupRef.current = true; // Mark camera as set up
					currentCameraIdRef.current = cameraId; // Store current camera ID
					isActiveRef.current = true; // Re-enable prediction loop
				}
			})
			.catch(error => {
				console.error('Error accessing camera:', error);
				cameraSetupRef.current = false;
				// If exact deviceId fails, try without it as fallback
				if (cameraId && error.name === 'OverconstrainedError') {
					console.error('Retrying without specific device ID...');
					const fallbackConstraints = {
						video: {
							width: videoSize.width,
							height: videoSize.height,
							frameRate: { ideal: 15, max: 20 },
						},
						audio: false,
					};
					navigator.mediaDevices
						.getUserMedia(fallbackConstraints)
						.then(stream => {
							// Check if component unmounted
							if (!videoRef?.current) {
								stream.getTracks().forEach(track => track.stop());
								return;
							}

							videoRef.current.srcObject = stream;
							streamRef.current = stream;
							// Expose globally for failsafe cleanup
							(window as unknown).currentPostureScanStream = stream;

							videoRef.current.addEventListener('loadeddata', predictWebcam);
							cameraSetupRef.current = true;
							currentCameraIdRef.current = cameraId;
							isActiveRef.current = true; // Re-enable prediction loop
						})
						.catch(fallbackError => {
							console.error('Fallback camera access failed:', fallbackError);
							cameraSetupRef.current = false;
						});
				}
			});
	}, [cameraId, predictWebcam]);

	const createPoseLandmarker = useCallback(async () => {
		if (poseLandmarkerRef.current || isInitializingRef.current) {
			console.warn(
				'PoseLandmarker already initialized or initializing. Skipping...',
			);
			return;
		}

		isInitializingRef.current = true;
		setModelReady(false);

		try {
			const vision = await FilesetResolver.forVisionTasks(
				'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
			);
			poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
				vision,
				{
					baseOptions: {
						modelAssetPath:
							'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
						delegate: 'CPU',
					},
					runningMode: 'VIDEO',
					numPoses: 1,
					minPoseDetectionConfidence: 0.6,
					minTrackingConfidence: 0.6,
				},
			);
			console.warn(' PoseLandmarker initialized successfully');
			setModelReady(true);
		} catch (error) {
			console.error('Ã¢ÂÅ’ Error creating PoseLandmarker:', error);
			setModelReady(false);
		} finally {
			isInitializingRef.current = false;
		}
	}, []);

	useEffect(() => {
		createPoseLandmarker();
		return () => {
			stopStreamedVideo();
			// CRITICAL: Close MediaPipe instance to prevent memory leaks
			if (poseLandmarkerRef.current) {
				console.warn(' Cleaning up PoseLandmarker instance...');
				poseLandmarkerRef.current.close();
				poseLandmarkerRef.current = null;
			}
			isInitializingRef.current = false;
			setModelReady(false);
		};
	}, [createPoseLandmarker, stopStreamedVideo]);

	// Setup camera when MediaPipe is ready or cameraId changes
	useEffect(() => {
		if (!modelReady) {
			console.warn(
				'Waiting for PoseLandmarker to initialize before setting up camera...',
			);
			return;
		}

		// Only restart camera if cameraId actually changed or camera is not set up
		const cameraIdChanged = currentCameraIdRef.current !== cameraId;
		const cameraNotSetup = !cameraSetupRef.current;

		if (cameraIdChanged || cameraNotSetup) {
			stopStreamedVideo();
			cameraSetupRef.current = false; // Reset flag before setup
			setTimeout(() => {
				setupCamera();
			}, 500);
		} else {
			console.warn('Camera already set up with same ID, skipping restart');
		}
	}, [cameraId, modelReady, setupCamera, stopStreamedVideo]);

	return (
		<div id="printscreen_posture_analytics">
			<video
				id="romVideo"
				ref={videoRef}
				autoPlay
				playsInline
				muted
				onLoadedMetadata={() => {
					if (canvasRef.current && videoRef.current) {
						canvasRef.current.width = videoRef.current.videoWidth;
						canvasRef.current.height = videoRef.current.videoHeight;
						setCanvasDimensions({
							width: videoRef?.current.videoWidth,
							height: videoRef.current.videoHeight,
						});
					}
				}}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					zIndex: 1,
					maxWidth: '100%',
					pointerEvents: 'none',
				}}
			/>
			<canvas
				id="romOverlay"
				ref={canvasRef}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					maxWidth: '100%',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					zIndex: 4,
					pointerEvents: 'none',
				}}
			/>
		</div>
	);
}

export default memo(Mediapipe);
