import ProgressBarUpload from '@atoms/ProgressBarUpload';
import { useVoiceControl } from '@atoms/RehabPreAssessment/VoiceControl';
import HighBandwidth from '@vitalflow-icons/speedometer/highBandwidth';
import LowBandwidth from '@vitalflow-icons/speedometer/lowBandwidth';
import VideoRecord from '@molecules/VideoRecorder';
import { ROUTE_KEYS, patientTimeLimit } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	completeUploadProgress,
	goToExercise,
	patchSession,
	resetAll,
	saveCompletedExercise,
	setCompleted,
} from '@stores/shared/patientDetail/program';
import { RebhabProgramExercise, RehabVideoState } from '@types';
import {
	Col,
	ConfigProvider,
	Drawer,
	Empty,
	Flex,
	Modal,
	Progress,
	Row,
	Tooltip,
	Typography,
	message,
} from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import InstructionalVideo from './InstructionalVideo';
import Menu from './Menu';
import PatientExerciseInfo from './ProgramExerciseInfo';
import ProgramVideoHeader from './ProgramVideoHeader';
import { useBlockNavigation } from '@atoms/BlockNavigation';
import CountDownTimerOnScreen from '@atoms/CountDownTimer/CountDownTimerOnScreen';
import PreAssesment from '@atoms/RehabPreAssessment';
import ImageCapture from '@molecules/MPImageCapture';
import { router } from '@routers/routers';
import {
	setActiveTab,
	setProgramStateId,
	setStateId,
} from '@stores/shared/patientDetail/patientDetail';
import { getbandwidth } from '@stores/shared/settings/settings';
import { MdFullscreen, MdFullscreenExit, MdMic, MdMicOff } from 'react-icons/md';
import { ReactVideoRecorderProps } from 'react-video-recorder';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
// ...
import { PreCompletionScreen } from './CompletionScreen/PreCompletionScreen';
import './style.css';

// Browser detection
const isEdge = /Edg/.test(navigator.userAgent);
const isIE = /MSIE|Trident/.test(navigator.userAgent);
const isWindows = /Win/.test(navigator.platform);
const isWindowsEdge = isEdge && isWindows;

// Windows Edge uses shorter recording time to reduce memory pressure
const WINDOWS_EDGE_TIME_LIMIT = 5000; // 5 seconds

export const Program = (props: {
	setIsProgramModalVisible?: (val: boolean) => void;
}) => {
	const { setIsProgramModalVisible } = props;
	const { t } = useTranslation();
	const {
		exercises,
		currentExercise,
		sessionId,
		transitionTime,
		isAuto,
		isCompleted,
	} = useTypedSelector(state => state.patientDetail.program.main);
	const [isPreCompleted, setPreCompleted] = useState(false);
	const { handleNavigation, clearNavigation } = useBlockNavigation(
		!isCompleted && !isPreCompleted,
		t('common.exitConfirmationMessage', 'Are you sure you want to exit the session? Your progress might not be saved.')
	);
	const [bandwidth, setBandwidth] = useState<boolean>(
		isWindowsEdge ? true : false,
	);
	const [isUploading, setUploading] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isMenuOpened, setMenuOpen] = useState(false);
	const [isInfoOpened, setInfoOpen] = useState(false);
	const [flipCamera, setFlipCamera] = useState(false);
	const [cameraId, setCameraId] = useState<string | null>(null);
	const [isStartingTimer, setStartingTimer] = useState(false);
	const [videoBlob, setVideoBlob] = useState<null | Blob>(null);
	const [videoState, setVideoState] = useState<RehabVideoState>(
		RehabVideoState.START,
	);
	const [selectedRating, setSelectedRating] = useState<number>(0);
	const [activeStep, setActiveStep] = useState(1);
	const [timeLeft, getTimeLeft] = useState<number>(0);
	const fullscreenRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<any>(null);
	const [savedVoice, setSavedVoice] = useState('');
	const [exerciseQueue, setExerciseQueue] = useState<RebhabProgramExercise[]>(
		[],
	);
	const [showBrowserWarning, setShowBrowserWarning] = useState(false);
	// Use shorter time limit for Windows Edge
	const effectiveTimeLimit = isWindowsEdge
		? WINDOWS_EDGE_TIME_LIMIT
		: patientTimeLimit;
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);

	// Simulation state for low bandwidth/Edge
	const [isSimulatingRecording, setSimulatingRecording] = useState(false);
	const [simulationTimeLeft, setSimulationTimeLeft] = useState(0);
	const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
	const [isMuted, setIsMuted] = useState(false);

	const isFullScreenInstructional = useTypedSelector(
		state => state.rehab.main.fullScreen,
	);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Intentionally empty - mount-only effect for initial data fetch

	const fetchData = async () => {
		if (isWindowsEdge) {
			return;
		}
		const networkStatus = await dispatch(getbandwidth());
		setBandwidth(networkStatus.payload?.networkIssue || false);
	};

	useEffect(() => {
		dispatch(resetAll());
		if (exercises.length == 0) {
			handleNavigation(
				`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}/dashboard`,
			);
			clearNavigation();
			dispatch(setActiveTab('activity'));
		}
	}, []);

	// Show browser warning when user selects time and before starting recording
	// Handle simulation timer
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isSimulatingRecording && simulationTimeLeft > 0) {
			interval = setInterval(() => {
				setSimulationTimeLeft(prev => prev - 1);
			}, 1000);
		} else if (isSimulatingRecording && simulationTimeLeft === 0) {
			finishSimulation();
		}
		return () => clearInterval(interval);
	}, [isSimulatingRecording, simulationTimeLeft]);

	useEffect(() => {
		if (activeStep === 6 && (isIE || isEdge)) {
			setShowBrowserWarning(true);
		}
	}, [activeStep]);

	useEffect(() => {
		if (
			videoState === RehabVideoState.START &&
			(activeStep < 1 || activeStep > 6) &&
			!isFullScreenInstructional
		) {
			if (
				savedVoice === 'record' ||
				savedVoice === 'yes' ||
				savedVoice === 'yes.' ||savedVoice === ' yes' ||
				savedVoice === 'record.' || savedVoice === ' record'
			) {
				message.success(t('Patient.data.vitalscan-rom.recordStarted'));
				onStartRecord();
			} else if (savedVoice === 'next') {
				if (resultExercise < exercises.length - 1) {
					message.success(t('Patient.data.vitalscan-rom.switchVideo'));
					onClickNext();
				} else {
					message.success(t('Patient.data.vitalscan-rom.alreadyLast'));
				}
			} else if (savedVoice === 'previous') {
				if (resultExercise > 0) {
					message.success(t('Patient.data.vitalscan-rom.switchPrevious'));
					onClickPrev();
				} else {
					message.success(t('Patient.data.vitalscan-rom.alreadyFirst'));
				}
			}
		} else if (videoState === RehabVideoState.RECORDING) {
			if (savedVoice === 'stop' || savedVoice === 'stop.' || savedVoice === ' stop') {
				message.success(t('Patient.data.vitalscan-rom.recordStopped'));
				onStopRecord();
			}
		} else if (videoState === RehabVideoState.REPLAYING) {
			if (savedVoice === 'no' || savedVoice === ' no') {
				message.success(t('Patient.data.vitalscan-rom.discardText'));
				onDiscardRecord();
			} else if (savedVoice === 'yes' || savedVoice === ' yes') {
				message.success(t('Patient.data.vitalscan-rom.saveSuccess'));
				onSubmitRecord();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- voice control effect, full dependencies would cause infinite loops
	}, [savedVoice, selectedRating]);

	// Memoize callback to prevent VoiceControl from restarting on every render
	// Only restarts when isAuto changes (acceptable - toggles auto mode)
	const handleVoiceTranscript = useCallback(
		(updatedTranscript: string) => {
			if (!isAuto || (activeStep >= 1 && activeStep <= 5)) {
				setSavedVoice(updatedTranscript);
			}
		},
		[isAuto, activeStep],
	);

	useVoiceControl(handleVoiceTranscript);

	const resultExercise = exercises.findIndex(
		exer => exer.id === currentExercise?.id,
	);

	const onClickPrev = () => {
		dispatch(goToExercise(exercises[resultExercise - 1]));
	};
	const onClickNext = () => {
		dispatch(goToExercise(exercises[resultExercise + 1]));
	};

	const onToggleMenu = () => {
		setInfoOpen(false);
		setMenuOpen(!isMenuOpened);
	};

	const onToggleInfo = () => {
		setInfoOpen(!isInfoOpened);
		setMenuOpen(false);
	};

	const requestWakeLock = async () => {
		if (isEdge) {
			return;
		}

		try {
			if ('wakeLock' in navigator && wakeLockRef.current === null) {
				wakeLockRef.current = await (navigator as unknown).wakeLock.request(
					'screen',
				);
				wakeLockRef.current.addEventListener('release', () => {
					wakeLockRef.current = null;
				});
			}
		} catch (err) {
			wakeLockRef.current = null;
		}
	};

	const releaseWakeLock = async () => {
		try {
			if (wakeLockRef.current) {
				await wakeLockRef.current.release();

				wakeLockRef.current = null;
			}
		} catch (err) {
			// Wake lock release failed - silently continue
			// Wake lock will be automatically released when page is hidden
			wakeLockRef.current = null;
		}
	};

	const onFullscreen = async () => {
		isFullscreen
			? await document?.exitFullscreen()
			: await fullscreenRef?.current!.requestFullscreen()!;
	};

	const onFullscreenExit = async () => {
		isFullscreen && (await document?.exitFullscreen());
	};

	const autoRecord = () => {
		requestWakeLock();
		setVideoState(RehabVideoState.RECORDING);
		setStartingTimer(true);
	};

	const autoStopRecord = () => {
		if (isSimulatingRecording) {
			finishSimulation();
			return;
		}
		requestWakeLock();
		videoRef?.current?.handleStopRecording?.();
		setStartingTimer(false);
		setVideoState(RehabVideoState.SAVING);

		if (resultExercise != exercises.length - 1) {
			setTimeout(() => setVideoState(RehabVideoState.START), 3000);
		}
	};

	const onStartRecord = () => {
		requestWakeLock();
		videoRef?.current?.handleStartRecording();
		if (isAuto) {
			setVideoState(RehabVideoState.READY);
			setTimeout(() => autoRecord(), transitionTime! * 1000);
		} else {
			setVideoState(RehabVideoState.READY);
			setTimeout(() => {
				setStartingTimer(true);
				setVideoState(RehabVideoState.RECORDING);
			}, transitionTime! * 1000);
		}
	};

	const onStopRating = () => {
		setVideoState(RehabVideoState.REPLAYING);
		setStartingTimer(false);
	};

	const finishSimulation = () => {
		setSimulatingRecording(false);
		setSimulationTimeLeft(0);

		if (capturedBlob) {
			if (isAuto) {
				submitVideoPatient(capturedBlob);
				// Only reset to START if there are more exercises remaining
				if (exerciseQueue.length + 1 < exercises.length) {
					setVideoState(RehabVideoState.START);
				}
				setCapturedBlob(null); // Clear if auto submitted
			} else {
				// In manual mode, go directly to REPLAYING to show captured image (same as high bandwidth)
				setVideoState(RehabVideoState.REPLAYING);
				// DO NOT clear capturedBlob here for manual flow, it is needed for submitVideoPatient
			}
		} else {
            // Fallback if no blob
             setVideoState(RehabVideoState.START);
             setMilliseconds(effectiveTimeLimit);
        }
	};

	const onStopRecord = () => {
		if (isSimulatingRecording) {
			finishSimulation();
			return;
		}
		requestWakeLock();
		videoRef?.current?.handleStopRecording?.();
		setStartingTimer(false);
		// Set to SAVING state while waiting for video blob to be ready
		setVideoState(RehabVideoState.SAVING);
	};

	const onEndedTimer = () => {
		isAuto ? autoStopRecord() : onStopRecord();
	};

	const onDiscardRecord = () => {
		requestWakeLock();
		setVideoBlob(null);
		setCapturedBlob(null); // Clear captured blob
		if (videoRef?.current?.recordedBlobs) videoRef.currentrecordedBlobs = [];
		setSavedVoice('');
		setSelectedRating(0);
		setVideoState(RehabVideoState.START);
	};

	const submitVideoPatient = (blob?: Blob) => {
		const exerciseData = {
			id: currentExercise?.id,
			name: currentExercise?.name
				? currentExercise?.name
				: currentExercise?.exerciseLibrary?.title,
			video: blob ? blob : (videoBlob || capturedBlob), // Use capturedBlob as fallback
			programSessionId: sessionId,
			programExerciseId: currentExercise?.id,
			exerciseDifficultyLevel: selectedRating,
		};
		const updatedExerciseQueue = [...exerciseQueue, exerciseData];
		setExerciseQueue(prev => [...prev, exerciseData]);
		if (exercises.length === updatedExerciseQueue.length) {
			setPreCompleted(true);
		} else {
			const exerciseIdsInQueue = updatedExerciseQueue.map(item => item.id);
			const missingExercise = exercises.find(
				exercise => !exerciseIdsInQueue.includes(exercise.id),
			);
			if (missingExercise) {
				dispatch(goToExercise(missingExercise));
			}
		}
		dispatch(saveCompletedExercise(currentExercise));
		setSavedVoice('');
	};

	const onRecordFinished = (videoBlob: Blob) => {
		if (videoBlob) {
			// Check if we should simulate recording (Edge or Low Bandwidth)
			if (isWindowsEdge || bandwidth) {
				setCapturedBlob(videoBlob);
				setSimulatingRecording(true);
				setSimulationTimeLeft(60); // Dynamic simulation time
				setVideoState(RehabVideoState.RECORDING); // Pretend we are recording
				return;
			}

			setVideoBlob(videoBlob);
			if (isAuto) {
				submitVideoPatient(videoBlob);
				// Only reset to START if there are more exercises remaining
				if (exerciseQueue.length + 1 < exercises.length) {
					setVideoState(RehabVideoState.START);
				}
				// If all exercises complete, PreCompletionScreen will show via isPreCompleted state
			} else {
				// In manual mode, transition to REPLAYING now that blob is available
				setVideoState(RehabVideoState.REPLAYING);
			}
		} else {
			if (isEdge) {
				setVideoState(RehabVideoState.START);
				const errorMsg = isWindowsEdge
					? 'Recording failed on Windows Edge. Try enabling low bandwidth mode or refreshing the page.'
					: 'Recording failed. Please try again.';
				message.error(errorMsg);
			}
		}
	};

	const onSubmitRecord = async () => {
		requestWakeLock();
		setUploading(true);
		submitVideoPatient();
		setVideoBlob(null);
		setCapturedBlob(null); // Clear captured blob
		setUploading(false);

		// Only reset to START if there are more exercises remaining
		if (exerciseQueue.length + 1 < exercises.length) {
			setVideoState(RehabVideoState.START);
			setSelectedRating(0);
			setUploading(false);
		} else {
			// Ensure PreCompleted is set to true for the last exercise
			// This acts as a safeguard to ensure transition happens
			setPreCompleted(true);
		}
		// If all exercises complete, PreCompletionScreen will show via isPreCompleted state
	};

	useEffect(() => {
		if (isCompleted) {
			patchAndSave();
		}
	}, [isCompleted]);

	// Refs for URL tracking
	const videoUrlRef = useRef<string | null>(null);
	const capturedUrlRef = useRef<string | null>(null);

	useEffect(() => {
		if (videoBlob) {
			if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
			videoUrlRef.current = URL.createObjectURL(videoBlob);
		}
	}, [videoBlob]);

	useEffect(() => {
		if (capturedBlob) {
			if (capturedUrlRef.current) URL.revokeObjectURL(capturedUrlRef.current);
			capturedUrlRef.current = URL.createObjectURL(capturedBlob);
		}
	}, [capturedBlob]);

	useEffect(() => {
		return () => {
			// Comprehensive cleanup on unmount to prevent memory leaks
			releaseWakeLock();

			// Clean up video blob URL if exists
			if (videoUrlRef.current) {
				URL.revokeObjectURL(videoUrlRef.current);
				videoUrlRef.current = null;
			}
			// Clean up captured blob if exists
			if (capturedUrlRef.current) {
				URL.revokeObjectURL(capturedUrlRef.current);
				capturedUrlRef.current = null;
			}

			// Stop any recording in progress
			try {
				videoRef?.current?.handleStopRecording?.();
			} catch (e) {
				// Stop recording errors handled gracefully
			}
		};
	}, []);

	const patchAndSave = async () => {
		if (isFullscreen) {
			onFullscreen();
		}
		const data = await dispatch(patchSession(sessionId));
		dispatch(setProgramStateId(data?.payload?.programId));
		if (
			location.pathname.includes(ROUTE_KEYS.PROGRAM_GENERATE) ||
			location.pathname.includes(ROUTE_KEYS.PROGRAM_CREATE) ||
			location.pathname.includes(ROUTE_KEYS.PROGRAM_START)
		) {
			dispatch(setStateId(data?.payload?.programId));
			dispatch(completeUploadProgress(sessionId));
			setIsProgramModalVisible && setIsProgramModalVisible(false);
			clearNavigation();
			navigate(
				`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_LIST_SESSIONS}`,
			);
			dispatch(setActiveTab('listSessions'));
		}
		dispatch(setCompleted(false));
	};

	const switchCamera = async () => {
		setCameraId(null);
		let stream: MediaStream | null = null;
		try {
			// Request media access to enumerate devices
			stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: true,
			});

			const devices = await navigator.mediaDevices.enumerateDevices();
			const cameras = devices.filter(device => device.kind === 'videoinput');
			setFlipCamera(cameras.length > 1);

			// Immediately stop the temporary stream to prevent memory leaks
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
				stream = null;
			}

			if (cameras.length > 0) {
				const currentCameraIndex =
					cameras.findIndex(camera => camera.deviceId === cameraId) || 0;

				const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
				const nextCamera = cameras[nextCameraIndex];

				if (nextCamera.deviceId !== '') {
					return setCameraId(nextCamera.deviceId);
				}

				setTimeout(() => switchCamera(), 1000);
			}
		} catch (error) {
			// Clean up stream on error
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}
		}
	};

	useEffect(() => {
		switchCamera();

		return () => {
			setCameraId(null);
			setFlipCamera(false);
		};
	}, []);

	useEffect(() => {
		const onFullscreenChange = () =>
			setIsFullscreen(Boolean(document.fullscreenElement));

		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () =>
			document.removeEventListener('fullscreenchange', onFullscreenChange);
	}, []);

	if (exercises.length == 0)
		return (
			<Flex align="center" justify="center" className="select-none">
				<div className="w-1/2">
					<Flex justify="center" align="center" className="h-screen">
						<Empty
							description={
								<Typography.Title
									level={3}
									style={{ color: 'var(--text-on-dark)' }}>
									{t('Patient.data.rehab.rehabEmpty')}
								</Typography.Title>
							}
						/>
					</Flex>
				</div>
			</Flex>
		);

	const handleChangeNetwork = async () => {
		if (isWindowsEdge) {
			return;
		}
		setBandwidth(!bandwidth);
	};

	return (
		<ConfigProvider prefixCls="ant">
			{!showBrowserWarning && (
				<Row
					className="coach-container select-none"
					align="middle"
					justify="center"
					style={{
						height: '100%',
						overflow: isFullscreen ? 'hidden' : '',
					}}>
					<Col
						ref={fullscreenRef}
						style={{
							maxWidth: 1280,
							width: '100%',
						}}>
						{!isUploading &&
							!(activeStep > 0 && activeStep < 6) &&
							!isCompleted &&
							!isPreCompleted && (
								<ProgramVideoHeader
									savedVoice={savedVoice}
									isFullscreen={isFullscreen}
									autoStopRecord={autoStopRecord}
									flipCamera={flipCamera}
									videoState={videoState}
									isStartingTimer={isStartingTimer}
									onFullscreen={onFullscreen}
									onToggleMenu={onToggleMenu}
									onToggleInfo={onToggleInfo}
									onStartRecord={onStartRecord}
									onStopRecord={onStopRecord}
									onDiscardRecord={onDiscardRecord}
									onSubmitRecord={onSubmitRecord}
									onEndedTimer={onEndedTimer}
									onStopRating={onStopRating}
									selectedRating={selectedRating}
									setSelectedRating={setSelectedRating}
									switchCamera={switchCamera}
								/>
							)}
						{videoState === RehabVideoState.RECORDING && (!isEdge || isSimulatingRecording) && !isPreCompleted && !isCompleted && (
							<Progress
								percent={
									(((isSimulatingRecording ? 60 : effectiveTimeLimit / 1000) -
										(isSimulatingRecording ? simulationTimeLeft : timeLeft)) /
										(isSimulatingRecording ? 60 : effectiveTimeLimit / 1000)) *
									100
								}
								showInfo={false}
								trailColor="color-mix(in srgb, var(--color-neutral-950) 50%, transparent)"
								strokeColor="linear-gradient(90deg, var(--color-info-400) 0%, var(--color-purple-700) 100%)"
								style={{ backgroundColor: 'var(--color-black)' }}
							/>
						)}
						<Content
							style={{
								maxWidth: isFullscreen ? '100%' : 1280,
								position: 'relative',
								zIndex: 1,
								background: 'var(--color-purple-600)',
								overflow: 'hidden',
								marginBottom:
									activeStep > 0 && activeStep < 6
										? undefined
										: 'var(--spacing-12)',
							}}
							className="exercise-info">
							<Drawer
								placement="top"
								closable={false}
								style={{ width: '60%' }}
								onClose={onToggleInfo}
								open={isInfoOpened}
								getContainer={false}
								forceRender={isFullscreen}
								styles={{
									body: {
										backgroundColor: 'var(--color-gray-400)',
										backdropFilter: 'blur(8px)',
									},
								}}
								height="auto">
								<PatientExerciseInfo />
							</Drawer>
							<Drawer
								placement="left"
								closable={false}
								onClose={onToggleMenu}
								open={isMenuOpened}
								getContainer={false}
								forceRender={isFullscreen}
								style={{ height: isMenuOpened ? '100%' : 0 }}
								styles={{
									body: {
										padding: 0,
										backgroundColor: 'var(--mainmenu-bg-color)',
										color: 'var(--color-gray-300)',
									},
								}}>
								<Menu onToggleMenu={onToggleMenu} />
							</Drawer>
							<Col
								className="program-video-recorder-container"
								style={{
									background: 'var(--mainmenu-bg-color)',
									maxWidth: isFullscreen ? '100%' : 1280,
									width: '100%',
									height: isFullscreen ? '100%' : '',
									aspectRatio: isFullscreen ? '' : '16/9',
								}}>
								{activeStep > 0 && activeStep < 6 && (
									<PreAssesment
										setSavedVoice={setSavedVoice}
										savedVoice={savedVoice}
										activeStep={activeStep}
										setActiveStep={setActiveStep}
									/>
								)}
								{isUploading && !(activeStep > 0 && activeStep < 6) && (
									<ProgressBarUpload isFullscreen={isFullscreen} />
								)}
								{videoState != RehabVideoState.REPLAYING &&
									!isCompleted &&
									!isPreCompleted &&
									!isUploading &&
									videoState != RehabVideoState.RATING &&
									!isUploading &&
									(videoState == RehabVideoState.READY ||
										videoState == RehabVideoState.RECORDING ||
										videoState == RehabVideoState.START) &&
									!(activeStep > 0 && activeStep < 6) &&
									currentExercise && (
										<InstructionalVideo
											currentExercise={currentExercise}
											onStartRecord={onStartRecord}
											videoState={videoState}
										/>
									)}
								{!isCompleted &&
									!isPreCompleted &&
									!isUploading &&
									cameraId && (
										<>
											{isWindowsEdge || bandwidth ? (
												<ImageCapture
													cameraId={cameraId}
													onImageCaptured={onRecordFinished}
													videoState={isSimulatingRecording ? RehabVideoState.START : videoState}
													isFullscreen={isFullscreen}
													transitionTime={transitionTime}
													timeLimit={effectiveTimeLimit}
												/>
											) : (
												<VideoRecord
													ref={videoRef}
													videoState={videoState}
													videoBlob={videoBlob}
													onRecordFinished={onRecordFinished}
													cameraId={cameraId}
													timeLimit={effectiveTimeLimit}
													audio={true}
													isFullscreen={isFullscreen}
													getTimeLeft={getTimeLeft}
													bandwidth={bandwidth}
													isWindowsEdge={isWindowsEdge}
													isMuted={isMuted}
												/>
											)}
											{videoState === RehabVideoState.RECORDING &&
												((!bandwidth && !isWindowsEdge) || isSimulatingRecording) && (
													<div
														style={{
															bottom: '90px',
															left: '30px',
															position: 'absolute',
															zIndex: 10,
														}}>
														<CountDownTimerOnScreen timeLeft={isSimulatingRecording ? simulationTimeLeft : timeLeft} />
													</div>
												)}
											{(activeStep < 1 || activeStep >= 6) &&  (
												<div
													className={`fullscreen-conatiner ${isFullscreen ? 'fullscreen-icon' : 'normal-fullscreen-icon'} `}>
													<Tooltip title={t('Patient.data.vitalscan-rom.fullScreen')}>
														{isFullscreen ? (
															<MdFullscreenExit
																size={30}
																className="align-middle cursor-pointer"
																onClick={onFullscreen}
																color="var(--color-white)"
															/>
														) : (
															<MdFullscreen
																size={30}
																className="align-middle cursor-pointer"
																onClick={onFullscreen}
																color="var(--color-white)"
															/>
														)}
													</Tooltip>
												</div>
											)}
											{(activeStep < 1 || activeStep >= 6) && (
												<div
													className={`fullscreen-conatiner ${isFullscreen ? 'fullscreen-icon' : 'normal-fullscreen-icon'} `}
													style={{ right: '90px' }}>
													<Tooltip title={isMuted ? t('Patient.data.rehab.unmute') : t('Patient.data.rehab.mute')}>
														{isMuted ? (
															<MdMicOff
																size={30}
																className="align-middle cursor-pointer"
																onClick={() => setIsMuted(false)}
																color="var(--color-white)"
															/>
														) : (
															<MdMic
																size={30}
																className="align-middle cursor-pointer"
																onClick={() => setIsMuted(true)}
																color="var(--color-white)"
															/>
														)}
													</Tooltip>
												</div>
											)}
										</>
									)}
								{isPreCompleted && !isCompleted && (
									<div>
										<PreCompletionScreen
											exercises={exerciseQueue}
											setExercises={setExerciseQueue}
											savedVoice={savedVoice}
											onFullscreenChange={onFullscreenExit}
											patchAndSave={patchAndSave}
											bandwidth={bandwidth}
											setActiveStep={setActiveStep}
										/>
									</div>
								)}
	{videoState === RehabVideoState.START &&  !(
  videoState != RehabVideoState.REPLAYING &&
  !isCompleted &&
  !isPreCompleted &&
  !isUploading &&
  videoState != RehabVideoState.RATING &&
  (videoState === RehabVideoState.READY ||
    videoState === RehabVideoState.RECORDING ||
    videoState === RehabVideoState.START) &&
  !(activeStep > 0 && activeStep < 6) &&
  currentExercise
)
&& (
									<Tooltip
										title={
											isWindowsEdge
												? 'Low bandwidth mode (image capture - locked for Edge)'
												: t(
														`Patient.data.vitalscan-rom.${bandwidth ? 'lowBandwidth' : 'highBandwidth'}`,
													)
										}>
										<div
											className={`bandwidth-conatiner ${isFullscreen ? 'full-screen-band-bottom' : 'band-bottom'} ${isWindowsEdge ? 'cursor-not-allowed' : 'cursor-pointer'} ${bandwidth ? 'selected-bandwidth' : 'not-selected-bandwidth'}`}
											onClick={() =>
												isWindowsEdge ? null : handleChangeNetwork()
											}>
											{bandwidth ? (
												<LowBandwidth color="var(--color-white)" />
											) : (
												<HighBandwidth color="var(--color-white)" />
											)}
										</div>
									</Tooltip>
								)}
							</Col>
						</Content>
					</Col>
				</Row>
			)}
			<Modal
				open={showBrowserWarning}
				onOk={() => setShowBrowserWarning(false)}
				onCancel={() => {
					setShowBrowserWarning(false);
					setActiveStep(4); // Go back to time selection
				}}
				okText="Continue"
				cancelText="Go Back"
				centered
				closable={false}
				maskClosable={false}>
				<div className="text-center py-4">
					<div className="text-xl font-bold mb-4">
						{isIE
							? '⚠️ Internet Explorer Detected'
							: '⚠️ Edge Browser Detected'}
					</div>
					<p className="mb-2">
						{isIE
							? 'Internet Explorer has limitations that may affect your experience.'
							: 'Microsoft Edge may have limitations that may affect your experience.'}
					</p>
					<p className="font-semibold text-primary-600">
						For the best experience, we recommend using Google Chrome.
					</p>
				</div>
			</Modal>
		</ConfigProvider>
	);
};
