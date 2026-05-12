import { Layout } from 'antd';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useGlobalSpeech } from '../context/SpeechContext';
import {
	TransitionStates,
	UseTransitionTutorial,
} from '../context/TransitionTutorial.context';
import { UseTutorialControls } from '../context/TutorialControls.context';
import { useSendResult } from '../hooks/useSendResult';
import ClosingTutorial from './ClosingTutorial';
import OpeningTutorial from './OpeningTutorial';
import ReadySetGoTutorial from './ReadySetGoTutorial';
import ResultScreenTutorial from './ResultScreenTutorial';
import TutorialInstruction from './TutorialInstruction';

const { Content } = Layout;

function TransitionTutorial({ children }: Readonly<PropsWithChildren>) {
	const { transition, onNextTransition, setTransitionToState } =
		UseTransitionTutorial();
	const { selectedScan, setLatestScreenshot, resultBus } =
		UseTutorialControls();
	const { send, sending, progress } = useSendResult();
	const { currentCaption } = useGlobalSpeech();
	const [snapshot, setSnapshot] = useState<string | null>(null);
	const lastCapturedFor = useRef<string | null>(null);
	const snapshotRef = useRef<string | null>(null);

	useEffect(() => {
		if (transition?.value !== TransitionStates.READYSETGO) return;

		const key = String(selectedScan?.id ?? 'unknown');
		if (lastCapturedFor.current === key) return;
		lastCapturedFor.current = key;

		// Reset temporary ref for new scan
		snapshotRef.current = null;

		// Dispatch with a small delay to ensure render is complete
		const t = setTimeout(() => {
			window.dispatchEvent(new Event('tutorial.captureScreenshot'));
		}, 100);
		return () => clearTimeout(t);
	}, [transition?.value, selectedScan?.id]);

	useEffect(() => {
		const handler = (e: Event) => {
			const { dataUrl } = (e as CustomEvent).detail || {};
			if (dataUrl) {
				// Defer state update to avoid re-render during critical transition
				snapshotRef.current = dataUrl;
			}
		};
		window.addEventListener('tutorial.screenshotCaptured', handler);
		return () =>
			window.removeEventListener('tutorial.screenshotCaptured', handler);
	}, []);

	// Synch snapshot to state/context when entering CLOSING or other relevant states
	useEffect(() => {
		if (
			(transition?.value === TransitionStates.CLOSING ||
				transition?.value === TransitionStates.RESULT) &&
			snapshotRef.current
		) {
			const s = snapshotRef.current;
			setSnapshot(s);
			setLatestScreenshot(s);
		}
	}, [transition?.value, setLatestScreenshot]);

	useEffect(() => {
		if (transition?.value !== TransitionStates.CLOSING) return;
		// Need to wait for setLatestScreenshot to propagate to resultBus if checking resultBus here
		// But let's rely on send() checking resultBus.screenshot internally or passing it
		if (!resultBus?.screenshot && !snapshotRef.current) return;
		// Check for either angle (unilateral) or dualAngles (bilateral)
		const hasAngleData = resultBus?.angle != null || resultBus?.dualAngles != null;
		if (!hasAngleData) return;

		// If resultBus needs time to update, we might need to rely on the effect dependency
	}, [transition?.value, resultBus?.screenshot, resultBus?.angle, resultBus?.dualAngles]);

	// Separate effect to trigger send when data is ready
	useEffect(() => {
		if (transition?.value !== TransitionStates.CLOSING) return;
		// Check for either angle (unilateral) or dualAngles (bilateral)
		const hasAngleData = resultBus?.angle != null || resultBus?.dualAngles != null;
		if (resultBus?.screenshot && hasAngleData) {
			void send();
		}
	}, [transition?.value, resultBus?.screenshot, resultBus?.angle, resultBus?.dualAngles, send]);

	const tutorialVideoScreen = transition?.value === TransitionStates.INTRO;

	return (
		<div
			className="h-[100%] overflow-hidden"
			style={{ height: '100%', width: '100%', position: 'relative' }}>
			{tutorialVideoScreen && (
				<TutorialInstruction
					onTogglePauseVideo={() => undefined}
					currentExercise={selectedScan}
					isRepeat={false}
				/>
			)}

			{transition?.value === TransitionStates.READYSETGO && !currentCaption && (
				<ReadySetGoTutorial
					isPaused={false}
					onNextTransition={onNextTransition}
					transitionTime={3}
				/>
			)}

			{/* <ReadySetGoTutorial
				isPaused={false}
				onNextTransition={onNextTransition}
				transitionTime={3}
			/> */}

			{transition?.value === TransitionStates.CLOSING && (
				<ClosingTutorial
					isPaused={false}
					onNextTransition={() => {
						setTransitionToState(TransitionStates.OPENNING);
					}}
				/>
			)}

			{transition?.value === TransitionStates.OPENNING && (
				<OpeningTutorial
					isPaused={false}
					onNextExercise={() => {
						setTransitionToState(TransitionStates.RESULT);
					}}
				/>
			)}

			{transition?.value === TransitionStates.RESULT && (
				<ResultScreenTutorial
					imageSrc={snapshot}
					isSaving={sending || (typeof progress === 'number' && progress < 100)}
					percent={
						typeof progress === 'number' && progress > 0 ? progress : undefined
					}
					statusText={
						sending || (typeof progress === 'number' && progress < 100)
							? 'Saving your scan & generating results…'
							: 'Done'
					}
				/>
			)}

			<div
				style={{
					position: 'relative',
					display: 'block',
					height: '100%',
					width: '100%',
				}}>
				{children}
			</div>
		</div>
	);
}

export default TransitionTutorial;
