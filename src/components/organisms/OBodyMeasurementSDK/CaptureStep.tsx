/**
 * CaptureStep Component
 *
 * Multi-view pose capture with real-time guidance.
 * Handles front, side, and back view captures.
 *
 * @module organisms/OBodyMeasurementSDK/CaptureStep
 * @since EPIC-001-S4
 */

import React, { useRef, useEffect, useState } from 'react';
import { Button, Progress } from 'antd';
import styled from 'styled-components';
import { usePoseDetection } from '@hooks/usePoseDetection';
import { useQualityValidation } from '@hooks/useQualityValidation';
import { PoseGuidance } from './PoseGuidance';
import { QualityValidator } from './QualityValidator';
import { PoseLandmark, type PoseLandmark3D } from '@types/mediapipe';

export interface CaptureStepProps {
	/** Current view to capture */
	view: 'front' | 'side' | 'back';

	/** User height in cm */
	userHeight: number;

	/** Callback when pose captured */
	onCapture: (
		view: 'front' | 'side' | 'back',
		landmarks: PoseLandmark3D[],
		worldLandmarks: PoseLandmark3D[]
	) => void;
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	height: 100vh;
	background: var(--background-primary);
`;

const Header = styled.div`
	width: 100%;
	padding: var(--spacing-lg);
	background: var(--background-secondary);
	border-bottom: 1px solid var(--border-color);
`;

const Title = styled.h2`
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: var(--text-color-root);
	margin: 0;
	text-align: center;
	text-transform: capitalize;
`;

const VideoContainer = styled.div`
	position: relative;
	flex: 1;
	width: 100%;
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--gray-900);
`;

const Video = styled.video`
	width: 100%;
	height: 100%;
	object-fit: contain;
`;

const OverlayCanvas = styled.canvas`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
`;

const CountdownOverlay = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 120px;
	font-weight: bold;
	color: var(--success-500);
	text-shadow: 0 0 20px var(--shadow-color);
	z-index: 100;
	animation: pulse 1s ease-in-out;

	@keyframes pulse {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.2);
		}
	}
`;

const Instructions = styled.div`
	width: 100%;
	max-width: 600px;
	padding: var(--spacing-lg);
	background: var(--background-secondary);
	border-top: 1px solid var(--border-color);
`;

const InstructionsTitle = styled.h3`
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-medium);
	color: var(--text-color-root);
	margin-bottom: var(--spacing-sm);
`;

const InstructionsList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0 0 var(--spacing-md) 0;

	li {
		padding: var(--spacing-xs) 0;
		color: var(--text-secondary);
	}
`;

const ProgressContainer = styled.div`
	margin-bottom: var(--spacing-md);
`;

const ProgressLabel = styled.div`
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	margin-bottom: var(--spacing-xs);
	text-align: center;
`;

/**
 * Capture Step Component
 *
 * Handles pose capture for specific view with real-time guidance.
 *
 * @param props - Component props
 */
export const CaptureStep: React.FC<CaptureStepProps> = ({ view, userHeight, onCapture }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [countdown, setCountdown] = useState<number | null>(null);
	const [videoReady, setVideoReady] = useState(false);

	// Pose detection
	const { poseResult, isDetecting, startDetection, stopDetection } = usePoseDetection({
		videoRef,
		modelComplexity: 2,
		autoStart: false,
	});

	// Quality validation
	const { qualityFlags, qualityScore, isReadyForCapture, feedbackMessages } = useQualityValidation(
		poseResult,
		view
	);

	// Start camera and detection
	useEffect(() => {
		const initCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: 'user', width: 1280, height: 720 },
					audio: false,
				});

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					await videoRef.current.play();
					setVideoReady(true);
				}
			} catch (err) {
				console.error('[CaptureStep] Camera error:', err);
			}
		};

		initCamera();

		return () => {
			// Cleanup camera
			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;
				stream.getTracks().forEach(track => track.stop());
			}
			stopDetection();
		};
	}, [stopDetection]);

	// Start detection when video ready
	useEffect(() => {
		if (videoReady && !isDetecting) {
			startDetection();
		}
	}, [videoReady, isDetecting, startDetection]);

	// Auto-capture countdown when quality is good
	useEffect(() => {
		if (isReadyForCapture && countdown === null && poseResult) {
			setCountdown(3);
		}
	}, [isReadyForCapture, countdown, poseResult]);

	// Countdown timer
	useEffect(() => {
		if (countdown !== null && countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		} else if (countdown === 0 && poseResult) {
			// Capture!
			onCapture(view, poseResult.landmarks, poseResult.worldLandmarks);
			setCountdown(null);
		}
	}, [countdown, view, poseResult, onCapture]);

	// Get instructions based on view
	const getInstructions = () => {
		switch (view) {
			case 'front':
				return [
					'Face the camera directly',
					'Stand with arms slightly away from body',
					'Look straight ahead',
					'Keep feet shoulder-width apart',
				];
			case 'side':
				return [
					'Turn 90° to your right',
					'Arms at your sides',
					'Look straight ahead',
					'Stand with good posture',
				];
			case 'back':
				return [
					'Turn your back to camera',
					'Stand straight with relaxed shoulders',
					'Keep feet shoulder-width apart',
					'Look straight ahead',
				];
		}
	};

	// Calculate progress (0/3, 1/3, 2/3 based on view)
	const progressValue = view === 'front' ? 0 : view === 'side' ? 33 : 67;
	const progressLabel = view === 'front' ? '0/3' : view === 'side' ? '1/3' : '2/3';

	return (
		<Container data-testid="capture-step">
			<Header>
				<Title>{view} View</Title>
			</Header>

			<VideoContainer>
				<Video ref={videoRef} autoPlay playsInline muted />

				{videoReady && canvasRef.current && poseResult && (
					<>
						<OverlayCanvas ref={canvasRef} />
						<PoseGuidance
							pose={poseResult}
							view={view}
							canvas={canvasRef.current}
							width={videoRef.current?.videoWidth || 1280}
							height={videoRef.current?.videoHeight || 720}
						/>

						<QualityValidator
							qualityFlags={qualityFlags}
							score={qualityScore}
							feedbackMessages={feedbackMessages}
						/>
					</>
				)}

				{countdown !== null && countdown > 0 && (
					<CountdownOverlay>{countdown}</CountdownOverlay>
				)}
			</VideoContainer>

			<Instructions>
				<ProgressContainer>
					<ProgressLabel>
						Capture Progress: {progressLabel} views complete
					</ProgressLabel>
					<Progress percent={progressValue} showInfo={false} strokeColor="var(--brand-primary)" />
				</ProgressContainer>

				<InstructionsTitle>Instructions:</InstructionsTitle>
				<InstructionsList>
					{getInstructions().map((instruction, index) => (
						<li key={index}>{instruction}</li>
					))}
				</InstructionsList>

				<Button block size="large" disabled>
					Auto-capturing when quality is good...
				</Button>
			</Instructions>
		</Container>
	);
};
