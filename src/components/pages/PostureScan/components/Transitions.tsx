import TransitionCalibration from '@atoms/APTransitionCalibration';
import TransitionClosing from '@atoms/APTransitionClosing';
import ReadySetGo from '@atoms/APTransitionReadySetGo';
import PostureCaptions from '@atoms/PostureCaptions';
import type { ScanState } from '@atoms/ScanVisualState';
import ScanVisualState from '@atoms/ScanVisualState';
import { useTypedSelector } from '@stores/index';
import { PostureView } from '@stores/interfaces';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { PosturalAnalytics, UseControls } from '../context/Controls.context';
import { UsePostureScreenAudio } from '../context/PostureScreen.context';
import { TransitionStates, UseTransition } from '../context/Transition.context';
import InstructionalVideo from './InstructionalVideo';
import './Transitions.css';

const landMarks = {
	front: [
		0, 2, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29,
		30,
	],
	back: [7, 8, 11, 12, 13, 14, 23, 24, 25, 26, 27, 28, 29, 30],
	left: [0, 2, 7, 11, 13, 15, 23, 25, 27],
	right: [0, 5, 8, 12, 14, 16, 24, 26, 28],
};

const customLabel = {
	front: 'FACE FORWARD',
	back: 'FACE BACKWARD',
	left: 'FACE LEFT',
	right: 'FACE RIGHT',
};

// Minimum display time for success state (lets blur animation complete)
const MIN_SUCCESS_DISPLAY_MS = 2500;

function Transitions({ children }: Readonly<PropsWithChildren>) {
	const {
		transition,
		onNextTransition,
		onResetTransition,
		setTransitionToState,
	} = UseTransition();
	const {
		onNext,
		onGetCurrent,
		isRepeat,
		isAligned,
		isCompleted,
		isPersonInBox,
	} = UseControls();
	const { uploadProgress } = useTypedSelector(state => state.postures.postures);
	const { play } = UsePostureScreenAudio();

	const [bodyPointsVisible, setBodyPointsVisible] = useState<boolean>(false);
	const [isPresentationDone, setIsPresentationDone] = useState<boolean>(false);
	const successHandledRef = useRef<string | null>(null);

	const current = onGetCurrent() as Partial<PosturalAnalytics>;

	useEffect(() => {
		if (current || isRepeat) onResetTransition();
	}, [current?.view, isRepeat, onResetTransition]);

	useEffect(() => {
		setBodyPointsVisible(isAligned);
		if (transition?.value === TransitionStates.READYSETGO && !isAligned) {
			setTransitionToState(TransitionStates.CALIBRATION);
		}
	}, [isAligned]);

	// useEffect(() => {
	// 	if (
	// 		transition?.value === TransitionStates.CALIBRATION &&
	// 		bodyPointsVisible
	// 	) {
	// 		onNextTransition();
	// 	}
	// }, [transition, bodyPointsVisible, onNextTransition]);

	useEffect(() => {
		if (transition?.value === TransitionStates.INTRO) {
			setBodyPointsVisible(false);
		}
	}, [transition]);

	// Handle OPENNING transition - immediately proceed to next view (no animation)
	// Skip if all views are complete (navigation handled by shouldNavigate)
	useEffect(() => {
		if (transition?.value === TransitionStates.OPENNING && !isCompleted) {
			const nextView = onNext();
		}
	}, [transition, onNext, isCompleted]);

	// Handle RESULT presentation (Audio + Visual Delay)
	useEffect(() => {
		if (transition?.value === TransitionStates.RESULT && current?.view) {
			// Prevent double handling for same view
			if (successHandledRef.current === current.view) return;
			successHandledRef.current = current.view;

			const handlePresentation = async () => {
				const startTime = Date.now();
				const view = current.view!.toLowerCase() as PostureView;

				// Play congratulations audio
				await play(view, 'congratulations');

				// Wait for minimum display time if audio finished quickly
				const elapsed = Date.now() - startTime;
				if (elapsed < MIN_SUCCESS_DISPLAY_MS) {
					await new Promise(r =>
						setTimeout(r, MIN_SUCCESS_DISPLAY_MS - elapsed),
					);
				}

				setIsPresentationDone(true);
			};

			handlePresentation();
		}
	}, [transition, current?.view, play]);

	// Handle RESULT Navigation (Wait for Presentation + Upload)
	useEffect(() => {
		if (transition?.value === TransitionStates.RESULT) {

			if (
				isPresentationDone &&
				(uploadProgress === 100 || current?.completed)
			) {
				onNextTransition();
			}
		}
	}, [
		transition,
		isPresentationDone,
		uploadProgress,
		current?.completed,
		onNextTransition,
	]);

	// Reset success handled ref when view changes
	useEffect(() => {
		if (!current?.view) {
			successHandledRef.current = null;
			setIsPresentationDone(false);
		}
	}, [current?.view]);

	const isTitle = transition?.value === TransitionStates.INTRO;
	const isReadySetGo = transition?.value === TransitionStates.READYSETGO;
	const isCalibrating = transition?.value === TransitionStates.CALIBRATION;
	const isResult = transition?.value === TransitionStates.RESULT;
	const needsAlignment = isCalibrating && (!isPersonInBox || !isAligned);

	// Determine scan visual state - smooth transitions between states
	// 'title' used during INTRO state (dark purple overlay while instruction audio plays)
	// 'idle' used for vignette effect (radial transparent center) during calibration wait
	// 'calibrating' used when user needs to position in alignment box
	// 'scanning' used for ReadySetGo countdown (lighter purples, faster flickering)
	// 'success' used for result display
	const scanState: ScanState = isTitle
		? 'title'
		: needsAlignment
			? 'calibrating'
			: isResult
				? 'success'
				: isReadySetGo
					? 'scanning'
					: 'idle';

	if (current?.view)
		return (
			<ScanVisualState
				state={scanState}
				className="h-[100%] overflow-hidden"
				borderRadius={12}
				glowSpeed={scanState === 'scanning' ? 2.5 : 2}
				captionsSlot={<PostureCaptions />}
				titleSlot={
					transition?.value === TransitionStates.INTRO ? (
						<InstructionalVideo />
					) : undefined
				}
				uploadProgress={uploadProgress}>
				{!bodyPointsVisible &&
					transition?.value === TransitionStates.CALIBRATION && (
						<TransitionCalibration
							label={customLabel[current.view as keyof typeof customLabel]}
							postureScan={true}
						/>
					)}
				{isReadySetGo && (
					<ReadySetGo
						isPaused={false}
						onNextTransition={onNextTransition}
						transitionTime={3}
						postureScan={true}
					/>
				)}
				{transition?.value === TransitionStates.CLOSING && (
					<TransitionClosing
						isPaused={false}
						onNextTransition={onNextTransition}
					/>
				)}
				{/* Video container */}
				<div
					style={{
						position: 'relative',
						display: 'block',
						height: '100%',
						width: '100%',
					}}>
					{children}
				</div>
			</ScanVisualState>
		);
}

export default Transitions;
