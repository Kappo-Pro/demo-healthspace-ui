import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import EventEmitter from '@services/EventEmitter';
import {
	assessPosture,
	determineOrientation,
	drawCenteringBox,
	FRONT_VIEW_CONNECTIONS,
	getAdaptiveThreshold,
	getOrientationConfidence,
	getSmoothedVisibility,
	isPersonInBoxFn,
	LEFT_VIEW_CONNECTIONS,
	RIGHT_VIEW_CONNECTIONS,
	updateVisibilityHistory,
} from '@utils/PoseDetectionUtility';
import { PersonOrientation } from '@utils/SkeletonMedia';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { PosturalAnalytics, UseControls } from '../context/Controls.context';
import { UseFullScreen } from '../context/FullScreen.context';
import { UsePostureScreenAudio } from '../context/PostureScreen.context';
import { TransitionStates, UseTransition } from '../context/Transition.context';

function Lines() {
	const canvasLinesRef = useRef<HTMLCanvasElement>(null);
	const {
		onGetCurrent,
		isPersonInBox,
		setIsPersonInBox,
		setIsSkeletonVisible,
		setIsAligned,
		canvasDimensions,
		assessmentValue,
		setAssessmentValue,
	} = UseControls();

	const { transition } = UseTransition();
	const { isFullScreen } = UseFullScreen();
	const { playWrongSide, calibrationState } = UsePostureScreenAudio();
	const [timerTick, setTimerTick] = useState<number>(0);
	const [isLineAligned, setIsLineAligned] = useState(false);
	const [isFullVisible, setIsFullVisible] = useState(false);
	const [orientationConfidence, setOrientationConfidence] = useState<
		number | null
	>(null);
	const [orientation, setOrientation] = useState<PersonOrientation>(
		PersonOrientation.FRONT,
	);
	const [personOrientation, setPersonOrientation] = useState<PersonOrientation>(
		PersonOrientation.FRONT,
	);

	const latestLandmarksRef = useRef<NormalizedLandmark[] | null>(null);
	const visibilityHistory = useRef<Map<number, number[]>>(new Map());

	const [boxWidth, setBoxWidth] = useState<number>(
		canvasDimensions.width * 0.4,
	);
	const [boxHeight, setBoxHeight] = useState<number>(
		canvasDimensions.height * 0.9,
	);
	const [boxX, setBoxX] = useState<number>(
		(canvasDimensions.width - canvasDimensions.width * 0.4) / 2,
	);
	const [boxY, setBoxY] = useState<number>(
		(canvasDimensions.height - canvasDimensions.height * 0.9) / 2,
	);
	const [canvasHeight, setCanvasHeight] = useState<number>(
		canvasDimensions.height,
	);
	const [canvasWidth, setCanvasWidth] = useState<number>(
		canvasDimensions.width,
	);

	const current = onGetCurrent() as Partial<PosturalAnalytics>;

	useEffect(() => {
		if (canvasDimensions) {
			const newBoxWidth = canvasDimensions.width * 0.4;
			const newBoxHeight = canvasDimensions.height * 0.9;
			const newBoxX = (canvasDimensions.width - newBoxWidth) / 2;
			const newBoxY = (canvasDimensions.height - newBoxHeight) / 2;
			setCanvasWidth(canvasDimensions.width);
			setCanvasHeight(canvasDimensions.height);

			setBoxWidth(newBoxWidth);
			setBoxHeight(newBoxHeight);
			setBoxX(newBoxX);
			setBoxY(newBoxY);
		}
	}, [canvasDimensions.width, canvasDimensions.height]);

	const alignmentThreshold = 20;

	const frameCallback = useCallback(() => {
		if (!latestLandmarksRef.current) {
			return;
		}
		const results = latestLandmarksRef.current;
		const canvasLinesCtx = canvasLinesRef.current?.getContext(
			'2d',
		) as CanvasRenderingContext2D;

		const width: number = canvasWidth;
		const height: number = canvasHeight;

		canvasLinesCtx.save();
		canvasLinesCtx.clearRect(0, 0, width, height);

		const centerX = width / 2;

		updateVisibilityHistory(visibilityHistory.current, results);

		const connections = (() => {
			switch (current?.view) {
				case PersonOrientation.LEFT:
					return LEFT_VIEW_CONNECTIONS;
				case PersonOrientation.RIGHT:
					return RIGHT_VIEW_CONNECTIONS;
				default:
					return FRONT_VIEW_CONNECTIONS;
			}
		})();

		const requiredIndices = new Set<number>();
		connections.forEach(({ start, end }) => {
			requiredIndices.add(start);
			requiredIndices.add(end);
		});
		const orientationConfidence = getOrientationConfidence(
			visibilityHistory.current,
			results,
		);

		const allVisible = Array.from(requiredIndices).every(
			index =>
				getSmoothedVisibility(visibilityHistory.current, index) >
				getAdaptiveThreshold(index),
		);
		setIsFullVisible(allVisible);

		setOrientationConfidence(orientationConfidence);

		const personInBox = isPersonInBoxFn(
			results,
			boxX,
			boxY,
			boxWidth,
			boxHeight,
			width,
			height,
		);
		const facingDirection = determineOrientation(results);
		setPersonOrientation(facingDirection);
		setOrientation(facingDirection);
		const correctDirection = current?.view === facingDirection;

		// Detect wrong side/direction for all views
		// LEFT↔RIGHT: person facing opposite lateral direction
		// FRONT↔BACK: person facing opposite direction (toward/away from camera)
		const isWrongSide =
			(current?.view === PersonOrientation.LEFT &&
				facingDirection === PersonOrientation.RIGHT) ||
			(current?.view === PersonOrientation.RIGHT &&
				facingDirection === PersonOrientation.LEFT) ||
			(current?.view === PersonOrientation.FRONT &&
				facingDirection === PersonOrientation.BACK) ||
			(current?.view === PersonOrientation.BACK &&
				facingDirection === PersonOrientation.FRONT);

		// Play wrong side audio if detected (debounce handled in context)
		// Only trigger AFTER visibility.mp3 has played - during wait/frame states
		// This ensures user hears visibility instructions before wrongSide correction
		if (isWrongSide && personInBox) {
			const canTrigger =
				calibrationState === 'waiting_after_visibility' ||
				calibrationState === 'playing_frame' ||
				calibrationState === 'waiting_after_frame';

			if (canTrigger && current?.view) {
				// Context handles debouncing - will skip if called too soon
				playWrongSide(current.view);
			}
		}

		setIsLineAligned(allVisible && correctDirection);

		// Note: Centering box now rendered via DashedBox SVG component in Transitions.tsx
		// Canvas drawing disabled in favor of animated SVG with marching ants effect
		// if (!personInBox) {
		// 	drawCenteringBox(canvasLinesCtx, boxX, boxY, boxWidth, boxHeight);
		// }
		setIsPersonInBox(personInBox && allVisible);
		const postureAssessments = assessPosture(
			results,
			width,
			height,
			canvasLinesCtx,
			current?.view,
		);

		if (transition?.value === TransitionStates.READYSETGO) {
			setAssessmentValue({
				...assessmentValue,
				[current?.view as string]: postureAssessments,
			});
		}

		if (
			[
				PersonOrientation.FRONT,
				PersonOrientation.BACK,
				PersonOrientation.RIGHT,
				PersonOrientation.LEFT,
			].includes(facingDirection)
		) {
			setIsSkeletonVisible(personInBox);
		}

		canvasLinesCtx.restore();
	}, [
		canvasWidth,
		canvasHeight,
		transition?.value,
		boxX,
		boxY,
		boxWidth,
		boxHeight,
		current?.view,
		setIsPersonInBox,
		assessmentValue,
		setIsSkeletonVisible,
		playWrongSide,
		calibrationState,
	]);

	useEffect(() => {
		EventEmitter.on('results', results => {
			latestLandmarksRef.current = results;
			frameCallback();
		});

		return () => {
			EventEmitter.removeListener('results');
		};
	}, [current, frameCallback, transition, timerTick]);

	// Update isAligned based on pose detection
	// Note: Race condition on INTRO→CALIBRATION is handled by resetting
	// isAligned in index.tsx when entering CALIBRATION state
	useEffect(() => {
		if (isLineAligned && isPersonInBox) {
			setIsAligned(true);
		} else {
			setIsAligned(false);
		}
	}, [isLineAligned, isPersonInBox, setIsAligned]);

	useEffect(() => {
		const timerId = setTimeout(() => {
			setTimerTick(prev => prev + 1);
			frameCallback();
		}, 1000);

		return () => {
			clearTimeout(timerId);
		};
	}, [timerTick, frameCallback]);

	return (
		<>
			<canvas
				id="canvasLines"
				ref={canvasLinesRef}
				width={canvasDimensions.width}
				height={canvasDimensions.height}
				style={{
					maxWidth: '100%',
					width: '100%',
					height: '100%',
					objectFit: isPersonInBox ? 'cover' : 'contain',
					zIndex: 5,
					position: 'absolute',
					pointerEvents: 'none',
					top: 0,
					left: 0,
				}}
			/>
		</>
	);
}

export default memo(Lines);
