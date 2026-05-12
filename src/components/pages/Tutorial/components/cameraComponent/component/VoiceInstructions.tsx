import { determineOrientation } from '@utils/PoseDetectionUtility';
import { PersonOrientation } from '@utils/SkeletonMedia';
import { useEffect, useRef, useState } from 'react';
import { useGlobalSpeech } from '../context/SpeechContext';
import {
	TransitionStates,
	UseTransitionTutorial,
} from '../context/TransitionTutorial.context';
import {
	ExerciseResult,
	UseTutorialControls,
} from '../context/TutorialControls.context';
import { useFrameBounds } from '../hooks/useFrameBounds';
import { useGuidedTourApi } from '../hooks/useGuidedTourApi';
import { useSendResult } from '../hooks/useSendResult';
import { useVideoPreloader } from '../hooks/useVideoPreloader';
import OverlayCanvas from './OverlayCanvas';
import { DEFAULT_ASSISTANT, Guide } from './TutorialConstants';

interface Props {
	onCompleted: () => void;
}

interface Position {
	x: number;
	y: number;
	z?: number;
	visibility?: number;
}

const TIME_GAP = 10000;

const VoiceInstructions: React.FC<Props> = ({ onCompleted }) => {
	const { speakText, cancelSpeech, currentCaption } = useGlobalSpeech();
	const { getFrameBounds } = useFrameBounds();
	const { send, sending, progress } = useSendResult();
	const {
		selectedScan,
		completedScanIds,
		markScanAsCompleted,
		exerciseList,
		setSelectedScan,
		isBodyVisible,
		setBodyVisible,
		canvasDimensions,
		isAligned,
		setIsAligned,
		setIsPersonCentered,
		hasShownInfoInterlude,
		setHasShownInfoInterlude,
		latestAngle,
		addResult,
		resetSentResults,
	} = UseTutorialControls();

	const { transition, setTransitionToState } = UseTransitionTutorial();
	const voiceName = DEFAULT_ASSISTANT.voiceName;
	const rate = 1;
	const { completeSession } = useGuidedTourApi();

	const hasSpokenInstructionRef = useRef(false);

	const [isCentered, setIsCentered] = useState(false);
	const [isOriented, setIsOriented] = useState(false);

	const centeringReminderTimeout = useRef<NodeJS.Timeout | null>(null);
	const orientationReminderTimeout = useRef<NodeJS.Timeout | null>(null);
	const visibilityReminderTimeout = useRef<NodeJS.Timeout | null>(null);
	const hasSpokenVisibilityRef = useRef(false);
	const hasSpokenCenteringRef = useRef(false);
	const hasSpokenOrientationRef = useRef(false);

	const didAdvanceAfterSaveRef = useRef(false);

	useEffect(() => {
		const href = window.location.href.toLowerCase();
		const shouldSkip = href.includes('sitting');
		if (shouldSkip) {
			setIsOriented(true);
		}
	}, [window?.location.href]);

	useEffect(() => {
		didAdvanceAfterSaveRef.current = false;
	}, [selectedScan?.id, transition?.value === TransitionStates.RESULT]);

	const getBodyPointIndices = (): number[] => {
		if (!selectedScan?.bodySideTitle) return [];

		const side = selectedScan.bodySideTitle.toLowerCase();
		if (side.includes('left')) {
			return [7, 23, 27];
		}
		if (side.includes('right')) {
			return [8, 24, 28];
		}

		return [0, 11, 12];
	};

	const scheduleVisibilityReminder = () => {
		if (visibilityReminderTimeout.current) {
			clearTimeout(visibilityReminderTimeout.current);
		}

		visibilityReminderTimeout.current = setTimeout(() => {
			if (!isBodyVisible && selectedScan?.visibility && !currentCaption) {
				speakText(selectedScan.visibility, voiceName, rate);
			}
			scheduleVisibilityReminder();
		}, TIME_GAP);
	};
	const scheduleCenteringReminder = () => {
		if (centeringReminderTimeout.current) {
			clearTimeout(centeringReminderTimeout.current);
		}
		centeringReminderTimeout.current = setTimeout(() => {
			if (!isCentered && isBodyVisible && !currentCaption) {
				speakText(Guide.center, voiceName, rate);
			}
			scheduleCenteringReminder();
		}, TIME_GAP);
	};

	const scheduleOrientationReminder = () => {
		if (orientationReminderTimeout.current) {
			clearTimeout(orientationReminderTimeout.current);
		}
		orientationReminderTimeout.current = setTimeout(() => {
			if (!isOriented && isBodyVisible && isCentered && !currentCaption) {
				speakText(
					expectedSide === 'left' ? Guide.left : Guide.right,
					voiceName,
					rate,
				);
			}
			scheduleOrientationReminder();
		}, TIME_GAP);
	};

	const checkBodyVisibility = (results: Position[]) => {
		const pointIndices = getBodyPointIndices();

		const visible = pointIndices.every(index => {
			const point = results[index];
			return point?.visibility !== undefined && point.visibility > 0.6;
		});
		setBodyVisible(visible);

		if (!visible) {
			setIsAligned(false);
			if (!hasSpokenVisibilityRef.current && selectedScan?.visibility) {
				speakText(selectedScan.visibility, voiceName, rate);
				hasSpokenVisibilityRef.current = true;
			}
			hasSpokenInstructionRef.current = false;
			hasSpokenCenteringRef.current = false;
			hasSpokenOrientationRef.current = false;
		} else {
			hasSpokenVisibilityRef.current = false;
			if (visibilityReminderTimeout.current) {
				clearTimeout(visibilityReminderTimeout.current);
			}
		}
	};

	const checkCenteredInFrame = (results: Position[]) => {
		const ids = [11, 12, 23, 24];
		const pts = ids.map(i => results[i]);

		const xs = pts.map(p => p?.x ?? 0);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);

		const { width, height } = canvasDimensions;
		const f = getFrameBounds(width, height);

		const leftN = f.x / width;
		const rightN = (f.x + f.w) / width;

		const centered = minX > leftN && maxX < rightN;

		setIsCentered(centered);

		if (
			isBodyVisible &&
			!centered &&
			!hasSpokenCenteringRef.current &&
			!currentCaption
		) {
			speakText(Guide.center, voiceName, rate);
			hasSpokenCenteringRef.current = true;
			scheduleCenteringReminder();
		}

		if (centered) {
			hasSpokenCenteringRef.current = false;
			if (centeringReminderTimeout.current)
				clearTimeout(centeringReminderTimeout.current);
		}
	};

	const checkBodyOrientation = (results: Position[]) => {
		if (!selectedScan?.bodySideTitle) return;

		const hipCheck = selectedScan.bodySideTitle.toLowerCase().includes('hip');
		if (hipCheck) {
			setIsOriented(true);

			return;
		}

		const expected = selectedScan.bodySideTitle.toLowerCase().includes('left')
			? PersonOrientation.LEFT
			: PersonOrientation.RIGHT;
		const actual = determineOrientation(results);
		const isCorrect = actual === expected;
		setIsOriented(isCorrect);
		if (
			isBodyVisible &&
			isCentered &&
			!isCorrect &&
			!hasSpokenOrientationRef.current &&
			!currentCaption
		) {
			speakText(
				expected === 'left' ? Guide.left : Guide.right,
				voiceName,
				rate,
			);
			hasSpokenOrientationRef.current = true;
			scheduleOrientationReminder();
		}
		if (isCorrect) {
			hasSpokenOrientationRef.current = false;
			if (orientationReminderTimeout.current)
				clearTimeout(orientationReminderTimeout.current);
		}
	};

	useEffect(() => {
		const listener = (event: Event) => {
			const results = (event as CustomEvent).detail?.results;
			if (Array.isArray(results)) {
				checkBodyVisibility(results);

				if (isBodyVisible) {
					checkCenteredInFrame(results);
					const href = window.location.href.toLowerCase();
					const shouldSkip = href.includes('sitting');
					if (!shouldSkip) {
						checkBodyOrientation(results);
					}
				}
			}
		};

		window.addEventListener('resultsTutorial', listener);
		scheduleVisibilityReminder();

		return () => {
			window.removeEventListener('resultsTutorial', listener);
			cancelSpeech();
			if (visibilityReminderTimeout.current)
				clearTimeout(visibilityReminderTimeout.current);
			if (centeringReminderTimeout.current)
				clearTimeout(centeringReminderTimeout.current);
			if (orientationReminderTimeout.current)
				clearTimeout(orientationReminderTimeout.current);
			hasSpokenVisibilityRef.current = false;
			hasSpokenCenteringRef.current = false;
			hasSpokenOrientationRef.current = false;
			hasSpokenInstructionRef.current = false;
		};
	}, [selectedScan, isBodyVisible]);

	useEffect(() => {
		const speakCentralizedInstruction = async () => {
			cancelSpeech();
			await speakText(Guide.centered, voiceName, rate);
		};

		if (isCentered) {
			speakCentralizedInstruction();
		}
	}, [isCentered]);

	useEffect(() => {
		const speakInstruction = async () => {
			cancelSpeech();
			await speakText(selectedScan?.instruction as string, voiceName, rate);
			hasSpokenInstructionRef.current = true;
		};

		if (
			isBodyVisible &&
			isCentered &&
			isOriented &&
			!hasSpokenInstructionRef.current &&
			selectedScan?.instruction
		) {
			speakInstruction();
			setIsAligned(true);
			setIsPersonCentered(true);
		} else {
			setIsAligned(false);
			setIsPersonCentered(false);
		}
	}, [isBodyVisible, isCentered, isOriented]);

	const handleFinish = async () => {
		await completeSession();
		resetSentResults();
	};

	useEffect(() => {
		const handleVoiceFlow = async () => {
			if (transition?.value === TransitionStates.CLOSING) {
				window.dispatchEvent(new Event('tutorial.captureScreenshot'));

				const once = (e: Event) => {
					const { dataUrl } = (e as CustomEvent).detail || {};
					try {
						if (dataUrl && selectedScan) {
							const r: ExerciseResult = {
								id: selectedScan.id,
								name: selectedScan.name,
								imageSrc: dataUrl,
								angle: Math.round((latestAngle ?? 0) * 100) / 100,
								wfl: selectedScan.wfl,
								min: selectedScan.min,
								normal: selectedScan.normal,
								ts: Date.now(),
							};
							addResult(r);
						}
					} finally {
						window.removeEventListener('tutorial.screenshotCaptured', once);
					}
				};
				window.addEventListener('tutorial.screenshotCaptured', once, {
					once: true,
				});
				await speakText(selectedScan?.finished as string, voiceName, rate);
				if (selectedScan?.id) markScanAsCompleted(selectedScan.id);
				setTransitionToState(TransitionStates.RESULT);
			}

			if (transition?.value === TransitionStates.RESULT) {
				if (sending) return;
				if (didAdvanceAfterSaveRef.current) return;
				didAdvanceAfterSaveRef.current = true;

				const next = exerciseList.find(
					ex => ex.id && !completedScanIds.includes(ex.id),
				);
				if (next) {
					setIsAligned(false);
					setIsPersonCentered(false);
					setIsCentered(false);
					const hipCheck = next?.bodySideTitle.toLowerCase().includes('hip');

					const href = window.location.href.toLowerCase();
					const shouldSkip = href.includes('sitting');

					if (hipCheck && !hasShownInfoInterlude && !shouldSkip) {
						setHasShownInfoInterlude(true);
						setIsOriented(true);
						speakText(Guide.chair, voiceName, rate);
						setSelectedScan(next);
						setTransitionToState(TransitionStates.INFO);
						hasSpokenInstructionRef.current = false;
						return;
					}
					setSelectedScan(next);

					setTransitionToState(TransitionStates.INTRO);
					setBodyVisible(false);
					hasSpokenInstructionRef.current = false;
				} else if (completedScanIds.length === exerciseList.length) {
					handleFinish();
					onCompleted();
				}
			}
		};

		if (!currentCaption) {
			handleVoiceFlow();
		}
	}, [transition, currentCaption, sending]);

	const expectedSide = selectedScan?.bodySideTitle
		?.toLowerCase()
		.includes('left')
		? 'left'
		: 'right';

	const videoVisible =
		isBodyVisible &&
		isCentered &&
		transition?.value === TransitionStates.CALIBRATION &&
		!isOriented;

	useEffect(() => {
		const speakSideInstruction = async () => {
			cancelSpeech();

			let expected: PersonOrientation = PersonOrientation.RIGHT;
			if (selectedScan && selectedScan.bodySideTitle) {
				expected = selectedScan.bodySideTitle.toLowerCase().includes('left')
					? PersonOrientation.LEFT
					: PersonOrientation.RIGHT;
			}
			await speakText(
				expected === 'left' ? Guide.left : Guide.right,
				voiceName,
				rate,
			);
		};
		if (videoVisible) {
			speakSideInstruction();
		}
	}, [videoVisible, selectedScan]);

	const showCaliberation = !isBodyVisible && currentCaption !== null;
	const showOverlay = transition?.value === TransitionStates.CALIBRATION;

	const firebaseUrl =
		expectedSide === 'left'
			? 'https://risecxlibrary.blob.core.windows.net/tour-videos/left_side.mp4'
			: 'https://risecxlibrary.blob.core.windows.net/tour-videos/right_side.mp4';

	const { src: preloadedSrc, state } = useVideoPreloader(firebaseUrl);
	const videoSrc: string | undefined = preloadedSrc ?? firebaseUrl;

	return (
		<>
			<div>
				{showOverlay && (
					<OverlayCanvas
						canvasWidth={canvasDimensions.width}
						canvasHeight={canvasDimensions.height}
						isBodyVisible={isBodyVisible}
						isCentered={isCentered}
						isOriented={isOriented}
						expectedSide={expectedSide}
					/>
				)}
			</div>
			{videoVisible && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						...(expectedSide === 'left' ? { left: 0 } : { right: 0 }),
						bottom: 0,
						width: '20%',
						color: 'var(--color-white)',
						zIndex: 1000,
						textAlign: 'center',
						pointerEvents: 'none',
						borderRadius: 0,
					}}>
					<video
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
						autoPlay
						muted
						loop={true}
						src={videoSrc}
						preload="auto"
						crossOrigin="anonymous"
					/>
				</div>
			)}
		</>
	);
};

export default VoiceInstructions;
