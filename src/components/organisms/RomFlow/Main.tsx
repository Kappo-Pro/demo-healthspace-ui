import BorderGlow from '@atoms/BorderGlow';
import Calibration from '@atoms/TransitionCalibration';
import Closing from '@atoms/TransitionClosing';
import ReadySetGo from '@atoms/TransitionReadySetGo';

import { useCallback, useEffect, useRef, useState } from 'react';

import { DashboardSkeleton } from '@atoms/Skeletons';
import SingleResult from '@molecules/TransitionSingleResultRom';
import { router } from '@routers/routers';
import { getRomSessionById } from '@stores/clinical/rom/customRom';
import {
	clearCapturedFrame,
	closeSession,
	ETransitions,
	getPrintScreen,
	nextExercise,
	nextTransition,
	repetingExercise,
	setMetricsDataValue,
	setResultExerciseValidateValue,
} from '@stores/clinical/rom/main';
import { setShowAllResults } from '@stores/clinical/rom/results';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setOnBoardRomCompletion } from '@stores/shared/onBoard/onBoard';
import { Content } from 'antd/lib/layout/layout';
import { useNavigate } from 'react-router-dom';
import InstructionalVideo from './InstructionalVideo';
import { ResultScreen } from './ResultScreen';
import { ExerciseTransitionTime } from './TransitionTime';

const legMovementsExerciseIds = [16, 17, 18, 19, 20, 21, 22, 23];

interface IMainProps {
	isDashboard: boolean;
	transitionTime: number;
	setTransitionTime: (value: number) => void;
	children: React.ReactNode;
	completionLoader?: boolean;
	setCompletionLoader: (val: boolean) => void;
	isVideoPause: boolean;
	onFullscreen: () => void;
	onTogglePauseVideo: () => void;
	isSwitchMode: boolean;
	isFullscreen: boolean;
	isCompleted: boolean;
	setIsManual: (val: boolean) => void;
	setCompleted: (val: boolean) => void;
	onSavePhysicalAssessmentsMetrics: () => void;
	isManual: boolean;
	onScanComplete?: () => void;
	aspectRatio: string;
	/** Hide control buttons when external control bar is used */
	hideControls?: boolean;
	/** Whether save operation is in progress */
	isSaving?: boolean;
	/** External volume control (0-100) */
	volume?: number;
	/** External mute control */
	isMuted?: boolean;
}

const Main = (props: IMainProps) => {
	const {
		children,
		completionLoader,
		setCompletionLoader,
		onFullscreen: _onFullscreen,
		isSwitchMode,
		isFullscreen,
		isVideoPause,
		onTogglePauseVideo,
		isCompleted,
		setIsManual,
		isManual,
		setCompleted,
		onSavePhysicalAssessmentsMetrics,
		transitionTime,
		setTransitionTime,
		isDashboard,
		onScanComplete,
		aspectRatio,
		hideControls: _hideControls,
		isSaving = false,
		volume,
		isMuted,
	} = props;
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const {
		user,
		isCustom,
		exercises,
		currentExercise,
		transition,
		finishedExercises,
		paused,
		uploadProgress,
		enableToSendResult,
		pose,
		isRepetingExercise,
		resultExerciseValidation,
		bodyPointsVisible,
		session,
		metricsData,
		resultsExercises,
		capturedFrame,
	} = useTypedSelector(state => state.rom.main);
	const [savedVoice, setSavedVoice] = useState('');
	const transitionRef = useRef(transition);
	const hasSavedRef = useRef(false);
	const lastExerciseIdRef = useRef<number | string | null>(null);
	const shouldSkipNavigationRef = useRef(false);
	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	useEffect(() => {
		transitionRef.current = transition;
	}, [transition]);

	const onNextTransition = useCallback(() => {
		dispatch(nextTransition(transition?.next));
	}, [dispatch, transition]);

	// Check if we're on the last exercise with incomplete exercises
	const exerciseIndex =
		exercises?.findIndex(
			(ex: unknown) => (ex as { id: string }).id === currentExercise?.id,
		) ?? -1;
	const isLastExercise = exerciseIndex === (exercises?.length ?? 0) - 1;
	const hasIncompleteExercises =
		exercises?.some(
			(exercise: unknown) =>
				!resultsExercises?.some(
					(result: unknown) =>
						String((result as { id?: string })?.id) ===
						String((exercise as { id: string }).id),
				),
		) ?? false;
	// Skip opening transition if on last exercise with incompletes - dialog will handle navigation
	const shouldSkipOpeningTransition = isLastExercise && hasIncompleteExercises;

	// Update ref synchronously during render (not in effect) to avoid race conditions
	shouldSkipNavigationRef.current = shouldSkipOpeningTransition;

	const onNextExercise = useCallback(() => {
		// Check ref to prevent navigation when dialog should handle it
		if (shouldSkipNavigationRef.current) {
			return;
		}
		dispatch(nextExercise());
	}, [dispatch]);

	const onRepeatExercise = useCallback(() => {
		dispatch(repetingExercise(true));
	}, [dispatch]);

	const customRomSession = useTypedSelector(state => state.rom.main.session);

	const onSavePhysicalAssessmentsMetricsToState = useCallback(async () => {
		// Use pre-captured frame if available, otherwise fallback to getPrintScreen
		let screenshot = capturedFrame;
		if (screenshot) {
			// Clear the captured frame after using it
			dispatch(clearCapturedFrame());
		} else {
			screenshot = await getPrintScreen();
		}

		const data = {
			userId: user?.id,
			strapiOmniRomExerciseId: currentExercise?.id,
			romSessionId: session?.id,
			value: isCustom ? pose.angleResults : +pose.angleResult,
			coordinates: isCustom ? pose.multiCoordinates : pose.coordinates,
			screenshot,
		};
		dispatch(setMetricsDataValue(data));
		dispatch(setResultExerciseValidateValue(data));
	}, [user, pose, currentExercise, session, dispatch, isCustom, capturedFrame]);

	const verifyCompletion = useCallback(async () => {
		if (finishedExercises?.finished && session?.id) {
			dispatch(setOnBoardRomCompletion(true));
			setCompleted(true);
		}
	}, [finishedExercises?.finished, session?.id, dispatch, setCompleted]);

	useEffect(() => {
		verifyCompletion();
	}, [verifyCompletion]);

	useEffect(() => {
		if (transition?.value === ETransitions.CLOSING) {
			// No delay needed - frame was pre-captured during ReadySetGo countdown
			onSavePhysicalAssessmentsMetricsToState();
		}
	}, [transition, onSavePhysicalAssessmentsMetricsToState]);

	// Handle OPENING transition - immediately proceed to next exercise (no animation)
	useEffect(() => {
		if (
			transition?.value === ETransitions.OPENNING &&
			!shouldSkipOpeningTransition &&
			!paused
		) {
			onNextExercise();
		}
	}, [transition, shouldSkipOpeningTransition, paused, onNextExercise]);

	// Reset saved flag when exercise changes or when repeating
	useEffect(() => {
		if (
			currentExercise?.id !== lastExerciseIdRef.current ||
			isRepetingExercise
		) {
			hasSavedRef.current = false;
			lastExerciseIdRef.current = currentExercise?.id || null;
		}
	}, [currentExercise?.id, isRepetingExercise]);

	useEffect(() => {
		// Only save if we haven't already saved for this exercise
		if (
			transition?.value === ETransitions.RESULT &&
			metricsData?.screenshot &&
			!isManual &&
			!hasSavedRef.current
		) {
			hasSavedRef.current = true;
			onSavePhysicalAssessmentsMetrics().catch(error => {
				console.error('Failed to save ROM results:', error);
				// Reset flag on error so user can retry
				hasSavedRef.current = false;
			});
		}
	}, [
		transition?.value,
		metricsData?.screenshot,
		isManual,
		onSavePhysicalAssessmentsMetrics,
	]);

	useEffect(() => {
		if (transition?.value === ETransitions.CALIBRATION) {
			const timer = setTimeout(() => {
				onSavePhysicalAssessmentsMetricsToState();
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [
		bodyPointsVisible,
		transition?.value,
		onSavePhysicalAssessmentsMetricsToState,
	]);

	const removeAllCanvases = () => {
		// Find all canvas elements (on-screen)
		const canvases = document.querySelectorAll('canvas');

		canvases.forEach(canvasEl => {
			const canvas = canvasEl as HTMLCanvasElement;

			// Clear 2D context
			const ctx2d = canvas.getContext('2d');
			if (ctx2d) {
				ctx2d.clearRect(0, 0, canvas.width, canvas.height);
			}

			// Dispose WebGL context
			const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
			if (gl) {
				const loseCtx = gl.getExtension('WEBGL_lose_context');
				if (loseCtx) {
					loseCtx.loseContext();
				}
			}

			canvas.width = 0;
			canvas.height = 0;
			canvas.remove();
		});

		// Extra: look for global/offscreen canvas references and delete them manually
		Object.keys(window).forEach(key => {
			if (
				(window as unknown)[key] instanceof HTMLCanvasElement ||
				((window as unknown)[key]?.getContext &&
					typeof (window as unknown)[key].getContext === 'function')
			) {
				(window as unknown)[key] = null;
			}
		});
	};

	const completeSession = useCallback(async () => {
		if (customRomSession?.id) {
			await dispatch(closeSession(customRomSession.id));
		}
	}, [customRomSession?.id, dispatch]);

	const stopAllMediaStreams = () => {
		const videos = document.querySelectorAll('video');
		videos.forEach(video => {
			const stream = video.srcObject as MediaStream | null;
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
				video.srcObject = null;
			}
		});
	};

	const handleCompletion = useCallback(async () => {
		if (isCompleted) {
			setCompletionLoader(true);
			await completeSession();
			dispatch(setOnBoardRomCompletion(true));

			// Close modal if in dashboard mode
			if (isDashboard && onScanComplete) {
				onScanComplete();
			}

			// Fetch session data and navigate to results page
			if (session?.id) {
				await dispatch(getRomSessionById({ customRomId: session.id }));
			}
			setCompletionLoader(false);
			navigate(`/${user?.id}${router.AIASSISTANT_ROM_SUMMARY}`, {
				state: { openFirstTriage: true },
			});

			dispatch(setShowAllResults(false));
			removeAllCanvases();
			stopAllMediaStreams();
			if (isIpad) {
				sessionStorage.removeItem('freshEntry');
			}
		}
	}, [
		isCompleted,
		completeSession,
		isDashboard,
		session?.id,
		user?.id,
		dispatch,
		navigate,
		setCompletionLoader,
		isIpad,
		onScanComplete,
	]);

	useEffect(() => {
		handleCompletion();
	}, [handleCompletion]);

	// Cleanup effect: Stop all media streams when component unmounts
	useEffect(() => {
		return () => {
			stopAllMediaStreams();
			removeAllCanvases();
		};
	}, []); // Mount-only effect - cleanup on unmount

	const enableInstreuctionalVideo = transition?.value !== ETransitions.RESULT;

	const isReadySetGo = transition?.value === ETransitions.READYSETGO;

	return (
		<Content
			className="h-full overflow-hidden"
			style={{ position: 'relative', ...(!isFullscreen && { aspectRatio }) }}>
			{/* Border glow around video area during countdown */}
			<BorderGlow
				variant="success"
				visible={isReadySetGo}
				speed={2.5}
				borderRadius={14}
			/>
			{!transitionTime && !isManual && (
				<ExerciseTransitionTime
					setIsManual={setIsManual}
					setSavedVoice={setSavedVoice}
					savedVoice={savedVoice}
					setTransitionTime={setTransitionTime}
					transitionTime={transitionTime}
				/>
			)}

			{completionLoader && <DashboardSkeleton />}

			{!isCompleted &&
				transitionTime &&
				!finishedExercises.finished &&
				enableInstreuctionalVideo &&
				currentExercise && (
					<InstructionalVideo
						isVideoPause={isVideoPause}
						onTogglePauseVideo={onTogglePauseVideo}
						onNextTransition={onNextTransition}
						transition={transition}
						currentExercise={currentExercise}
						isSwitchMode={isSwitchMode}
						isFullscreen={isFullscreen}
						isRepeat={isRepetingExercise}
						aspectRatio={aspectRatio}
						volume={volume}
						isMuted={isMuted}
					/>
				)}

			{!isCompleted &&
				!bodyPointsVisible &&
				transition?.value === ETransitions.CALIBRATION && (
					<Calibration
						label={
							legMovementsExerciseIds.includes(currentExercise?.id)
								? 'STEP BACK, and Kindly use a chair for support and ensure your ankles are visible.'
								: 'STEP BACK'
						}
						externalVolume={volume}
						externalMuted={isMuted}
					/>
				)}
			{transition?.value === ETransitions.READYSETGO && (
				<ReadySetGo
					isPaused={paused}
					onNextTransition={onNextTransition}
					transitionTime={transitionTime}
				/>
			)}

			{transition?.value === ETransitions.CLOSING && (
				<Closing isPaused={paused} onNextTransition={onNextTransition} />
			)}

			{transition?.value === ETransitions.RESULT &&
				(isManual ? (
					<div
						className="w-full h-full"
						style={{
							background:
								'color-mix(in srgb, var(--brand-primary) 85%, transparent)',
						}}>
						{uploadProgress > 0 ? (
							<SingleResult
								exerciseName={
									currentExercise?.name
										? currentExercise?.name
										: currentExercise?.title || ''
								}
								isPaused={paused}
								enableToSendResult={enableToSendResult}
								onNextTransition={onNextTransition}
								resultExerciseValidation={resultExerciseValidation}
							/>
						) : (
							<ResultScreen
								screenshot={metricsData?.screenshot}
								aspectRatio={aspectRatio}
								showButtons={true}
								onRetry={onRepeatExercise}
								onSubmit={onSavePhysicalAssessmentsMetrics}
								isSaving={isSaving}
							/>
						)}
					</div>
				) : (
					<SingleResult
						exerciseName={
							currentExercise?.name
								? currentExercise?.name
								: currentExercise?.title || ''
						}
						isPaused={paused}
						enableToSendResult={enableToSendResult}
						onNextTransition={onNextTransition}
						resultExerciseValidation={resultExerciseValidation}
					/>
				))}
			{children}
		</Content>
	);
};

export default Main;
