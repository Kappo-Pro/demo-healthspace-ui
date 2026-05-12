import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from 'antd';
import { RehabVideoState } from '@types';
import './style.css';

interface IImageCaptureProps {
	cameraId: string | null;
	onImageCaptured: (imageBlob: Blob) => void;
	videoState?: RehabVideoState;
	isFullscreen?: boolean;
	transitionTime?: number; // countdown time in seconds
	timeLimit?: number; // exercise duration in milliseconds (default 60000ms = 60s)
}

export default function ImageCapture(props: IImageCaptureProps) {
	const {
		cameraId,
		onImageCaptured,
		videoState,
		isFullscreen,
		transitionTime = 3,
		timeLimit = 60000, // default 60 seconds
	} = props;
	const { t } = useTranslation();

	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
	const hasStartedCountdownRef = useRef(false);
	const capturedBlobRef = useRef<Blob | null>(null);

	const [capturing, setCapturing] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

	// Initialize camera
	useEffect(() => {
		if (!cameraId) return;

		const initCamera = async () => {
			try {
				const constraints: MediaStreamConstraints = {
					video: {
						deviceId: cameraId ? { exact: cameraId } : undefined,
						width: { ideal: 1280, max: 1280 },
						height: { ideal: 720, max: 720 },
						frameRate: { ideal: 24, max: 30 },
					},
					audio: false, // No audio needed for image capture
				};

				const stream = await navigator.mediaDevices.getUserMedia(constraints);
				streamRef.current = stream;

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.play();
				}
			} catch (err) {
				// Camera initialization error handled via error state
				setError('Failed to access camera');
			}
		};

		initCamera();

		return () => {
			// Cleanup
			if (streamRef.current) {
				streamRef.current.getTracks().forEach(track => track.stop());
				streamRef.current = null;
			}
			if (countdownTimerRef.current) {
				clearInterval(countdownTimerRef.current);
			}
			// Cleanup captured image URL
			if (capturedImageUrl) {
				URL.revokeObjectURL(capturedImageUrl);
			}
		};
	}, [cameraId, capturedImageUrl]);


	// Reset captured image when going back to START state
	useEffect(() => {
		if (videoState === RehabVideoState.START) {
			// Reset states
			capturedBlobRef.current = null;
			// Clear captured image
			if (capturedImageUrl) {
				URL.revokeObjectURL(capturedImageUrl);
				setCapturedImageUrl(null);
			}
		}
	}, [videoState, capturedImageUrl]);

	const captureImage = useCallback(() => {
		if (!videoRef.current || !canvasRef.current || capturing) {
			return;
		}

		setCapturing(true);

		try {
			const video = videoRef.current;
			const canvas = canvasRef.current;

			// Set canvas size to match video
			canvas.width = video.videoWidth || 1280;
			canvas.height = video.videoHeight || 720;

			// Draw current video frame to canvas
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to get canvas context');
			}

			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			// Convert canvas to blob
			canvas.toBlob(
				(blob) => {
					if (blob) {
						// Store the blob and URL for later display
						capturedBlobRef.current = blob;
						const imageUrl = URL.createObjectURL(blob);
						setCapturedImageUrl(imageUrl);

						// Immediately notify parent that capture is complete
						// The parent (ProgramFlow) will handle the simulation/countdown
						onImageCaptured(blob);
					} else {
						// Blob creation failure handled via error state
						setError('Failed to capture image');
					}
					setCapturing(false);
				},
				'image/jpeg',
				0.95 // High quality JPEG
			);
		} catch (err) {
			// Image capture error handled via error state
			setError('Failed to capture image');
			setCapturing(false);
		}
	}, [capturing, onImageCaptured, timeLimit]);

	const startCountdown = useCallback(() => {
		setCountdown(transitionTime);

		let counter = transitionTime;
		countdownTimerRef.current = setInterval(() => {
			counter -= 1;
			setCountdown(counter);

			if (counter === 0) {
				if (countdownTimerRef.current) {
					clearInterval(countdownTimerRef.current);
				}
				// Capture image after countdown
				captureImage();
			}
		}, 1000);
	}, [transitionTime, captureImage]);
		// Start capture countdown when recording state changes
	useEffect(() => {
		if (
			(videoState === RehabVideoState.RECORDING ||
				videoState === RehabVideoState.READY) &&
			!capturing &&
			!hasStartedCountdownRef.current
		) {
			hasStartedCountdownRef.current = true;
			startCountdown();
		}
	}, [videoState, capturing, startCountdown]);

	// Reset the ref when the state returns to START or something else that indicates a new attempt
	useEffect(() => {
		if (videoState === RehabVideoState.START) {
			hasStartedCountdownRef.current = false;
		}
	}, [videoState]);
	if (error) {
		return (
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xl">
				{error}
			</div>
		);
	}

	const shouldShowReplayWindow =
		(videoState === RehabVideoState.RATING || videoState === RehabVideoState.REPLAYING) &&
		capturedImageUrl;

	return (
		<div className={`video-record-item w-full ${isFullscreen ? 'full-height' : ''}`}>
			{/* Always show live video feed */}
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				className="w-full h-full object-cover"
				style={{ transform: 'scaleX(-1)' }} // Mirror for selfie mode
			/>

			{/* Show captured image in small replay window during RATING and REPLAYING (like high bandwidth) */}
			{shouldShowReplayWindow && (
				<div className="absolute top-0 left-0 w-[420px]">
					<div className="relative w-full">
						<img
							src={capturedImageUrl}
							alt="Captured exercise"
							style={{
								width: '100%',
								height: 'auto',
								objectFit: 'cover',
								transform: 'scaleX(-1)' // Mirror for selfie mode
							}}
						/>
					</div>
				</div>
			)}

			{/* Hidden canvas for capture */}
			<canvas ref={canvasRef} style={{ display: 'none' }} />

			{/* Get ready countdown overlay */}
			{countdown > 0 && (videoState === RehabVideoState.READY || videoState === RehabVideoState.RECORDING) && (
				<Flex
					vertical
					justify="center"
					align="center"
					className="w-full h-full"
					style={{
						position: 'absolute',
						zIndex: 10,
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 42,
							color: 'var(--color-white)',
							fontWeight: 'bold',
							textShadow: '2px 2px 4px var(--color-black)',
							textAlign: 'center',
						}}>
						{t('Patient.data.vitalscan-rom.getPosition')}
						<br />
						<div
							className="bg-primary-600 shadow-black shadow-md rounded-full"
							style={{
								width: 100,
								height: 100,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: 42,
								fontWeight: 'bold',
								backgroundColor: 'var(--sidebar-item-active-bg)',
								color: 'var(--color-white)',
								borderRadius: '50%',
								marginTop: '10px',
							}}>
							{countdown}
						</div>
					</div>
				</Flex>
			)}

			{/* Capturing indicator */}
			{capturing && (
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white text-3xl">
					{t('Patient.data.vitalscan-rom.capturing', 'Capturing...')}
				</div>
			)}

		</div>
	);
}
