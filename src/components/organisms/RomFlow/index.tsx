import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { CameraPermissionSplash } from '@molecules/CameraPermissionSplash';
import RomData from '@organisms/RomFlow/RomData';
import '@organisms/RomFlow/style.css';
import { ControlsProvider } from '@pages/PostureScan/context/Controls.context';
import {
	ETransitions,
	TTransitions,
	clearPoseData,
	completedExercise,
	editPatientResults,
	exerciseValue,
	getBodyPointsVisible,
	goToExercise,
	nextTransition,
	savePatientResults,
	setCameraId,
	updateUser,
} from '@stores/clinical/rom/main';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setCollapsible } from '@stores/shared/patientDetail/patientDetail';
import { Flex, message } from 'antd';
import { useLocation } from 'react-router-dom';
import '../../pages/StartScan/style.css';

interface SaveResultsPayload {
	userId: string;
	romSessionId: string;
	title: string;
	screenshot: string;
	coordinates: string;
	result?: {
		[key: string]: string | number | object[] | boolean | undefined;
	};
	results?: {
		create?: object[];
	};
}

export interface RomFlowControlState {
	isFullscreen: boolean;
	isVideoPause: boolean;
	isSwitchMode: boolean;
	isSplashOpened: boolean;
	isTransitionTimeScreen: boolean;
}

interface RomFlowProps {
	isDashboard?: boolean;
	hideTopbar?: boolean;
	showSplashOnMount?: boolean;
	onScanComplete?: () => void;
	/** Hide control buttons when external control bar is used */
	hideControls?: boolean;
	/** External volume control (0-100) */
	volume?: number;
	/** External mute control */
	isMuted?: boolean;
	/** Callback for volume changes from internal control bar */
	onVolumeChange?: (value: number) => void;
	/** Callback for mute toggle from internal control bar */
	onToggleMute?: () => void;
	/** Number of cameras available */
	cameraCount?: number;
	/** Callback when control state changes (replaces polling via controlsRef) */
	onStateChange?: (state: RomFlowControlState) => void;
	controlsRef?: React.MutableRefObject<{
		onFullscreen: () => void;
		onTogglePauseVideo: () => void;
		onToggleTutorial: () => void;
		switchCamera: () => void;
		onTogglesSwitchMode: () => void;
		onToggleMenu: () => void;
		onToggleInfo: () => void;
		isFullscreen: boolean;
		isVideoPause: boolean;
		isSwitchMode: boolean;
		isSplashOpened: boolean;
	} | null>;
}

const ORom = (props: RomFlowProps) => {
	const {
		isDashboard,
		hideTopbar,
		showSplashOnMount = true,
		onScanComplete,
		hideControls,
		volume,
		isMuted,
		onVolumeChange,
		onToggleMute,
		cameraCount = 1,
		onStateChange,
		controlsRef,
	} = props;
	const { state } = useLocation();
	const { resultsExercises } = useTypedSelector(state => state.rom.main);
	const [isFullscreen, setFullscreen] = useState(false);
	const [flipCamera, setFlipCamera] = useState(false);
	const [isMenuOpened, setMenuOpen] = useState(false);
	const [isTutorialOpened, setTutorialOpen] = useState(false);
	const [isSwitchMode, setSwitchMode] = useState(false);
	const [isSplashOpened, setSplashOpen] = useState(
		state?.skipSplash ? false : showSplashOnMount,
	);
	const [isVideoPause, setVideoPause] = useState(false);
	const [showPermissionSplash, setShowPermissionSplash] = useState(true);
	const initialStreamRef = useRef<MediaStream | null>(null);
	const [isValidResult, setValidResult] = useState<boolean | null>(null);
	const [isCompleted, setCompleted] = useState(false);
	const [isManual, setIsManual] = useState(false);
	const [isInfoOpened, setInfoOpen] = useState(false);
	const fullscreenRef = useRef<HTMLDivElement>(null);
	const [completionLoader, setCompletionLoader] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isTransitionTimeScreen, setTransitionTimeScreen] = useState(true);

	const dispatch = useTypedDispatch();
	const {
		session,
		isCustom,
		pose,
		transition,
		metricsData,
		isRepetingExercise,
		enableToSendResult,
		exercises,
		currentExercise,
		cameraId,
	} = useTypedSelector(state => state.rom.main);
	const { selectedRom } = useTypedSelector(state => state.rom.customRom);

	const user = useTypedSelector(state => {
		const { selectedUser } = state.contacts.main;
		const user = state.user;
		return user.isPhysioterapist ? selectedUser : user;
	});
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);

	// Notify parent of state changes (replaces polling)
	useEffect(() => {
		onStateChange?.({
			isFullscreen,
			isVideoPause,
			isSwitchMode,
			isSplashOpened,
			isTransitionTimeScreen,
		});
	}, [
		isFullscreen,
		isVideoPause,
		isSwitchMode,
		isSplashOpened,
		isTransitionTimeScreen,
		onStateChange,
	]);

	// Callback for RomData to notify transition time screen changes
	const handleTransitionTimeChange = useCallback((isShowing: boolean) => {
		setTransitionTimeScreen(isShowing);
	}, []);

	const onToggleMenu = () => {
		setTutorialOpen(false);
		setMenuOpen(!isMenuOpened);
		setInfoOpen(false);
	};

	const onToggleInfo = () => {
		setInfoOpen(!isInfoOpened);
		setMenuOpen(false);
	};

	const onToggleTutorial = () => {
		setMenuOpen(false);
		setTutorialOpen(!isTutorialOpened);
	};

	const onTogglesSwitchMode = () => {
		setSwitchMode(!isSwitchMode);
	};

	const onTogglesSplashPage = () => {
		setSplashOpen(!isSplashOpened);
	};

	// Handle camera permission ready from splash screen
	const handlePermissionReady = useCallback(
		async (stream: MediaStream) => {
			// Store stream reference for cleanup
			initialStreamRef.current = stream;

			// Stop the stream as we'll create a new one with specific deviceId
			stream.getTracks().forEach(track => track.stop());
			initialStreamRef.current = null;

			// Enumerate devices and set initial camera
			if (navigator.mediaDevices?.enumerateDevices) {
				const devices = await navigator.mediaDevices.enumerateDevices();
				const cameras = devices.filter(device => device.kind === 'videoinput');

				setFlipCamera(cameras.length > 1);

				if (cameras.length > 0 && cameras[0].deviceId && !cameraId) {
					dispatch(setCameraId(cameras[0].deviceId));
				}
			}

			// Hide permission splash and show main content
			setShowPermissionSplash(false);
		},
		[cameraId, dispatch],
	);

	const onExerciseValueAndCoordinates = (
		value: number,
		coordinates: NormalizedLandmark[],
	) => {
		dispatch(exerciseValue({ value, coordinates }));
	};

	const onBodyPointsVisible = (value: boolean) => {
		dispatch(getBodyPointsVisible(value));
	};
	const isSwitchingRef = useRef(false);
	const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const switchCamera = async () => {
		if (isSwitchingRef.current) return;
		isSwitchingRef.current = true;

		// Clear any pending timeout
		if (switchTimeoutRef.current) {
			clearTimeout(switchTimeoutRef.current);
			switchTimeoutRef.current = null;
		}

		try {
			// Request camera access with flexible constraints (video only)
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
					frameRate: { ideal: 30 },
				},
			});
			// STOP THE STREAM IMMEDIATELY to prevent leak
			stream.getTracks().forEach(track => track.stop());

			// Get the list of video input devices
			const devices = await navigator.mediaDevices.enumerateDevices();
			const cameras = devices.filter(device => device.kind === 'videoinput');

			if (cameras.length > 0) {
				// Find the current camera index
				const currentCameraIndex = cameras.findIndex(
					camera => camera.deviceId === cameraId,
				);
				const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
				const nextCamera = cameras[nextCameraIndex];

				if (nextCamera?.deviceId) {
					dispatch(setCameraId(nextCamera.deviceId));
				} else {
					// Retry switching if deviceId is empty
					switchTimeoutRef.current = setTimeout(switchCamera, 1000);
				}
			}
		} catch (error) {
			// Silently handle camera switching errors - user can retry manually
			// Common causes: permission denied, camera busy, device not available
		} finally {
			switchTimeoutRef.current = setTimeout(() => {
				isSwitchingRef.current = false;
			}, 1000);
		}
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (switchTimeoutRef.current) {
				clearTimeout(switchTimeoutRef.current);
			}
		};
	}, []);

	const onTogglePauseVideo = () => {
		setVideoPause(!isVideoPause);
	};

	const onFullscreen = async () => {
		try {
			if (isFullscreen) {
				await document.exitFullscreen();
			} else if (fullscreenRef.current) {
				await fullscreenRef.current.requestFullscreen();
			}
		} catch (error) {
			// Fullscreen API requires user interaction - browser may block automatic requests
			console.warn('Fullscreen request failed:', error);
		}
	};

	// Expose control handlers through ref for external topbar
	useEffect(() => {
		if (controlsRef) {
			controlsRef.current = {
				onFullscreen,
				onTogglePauseVideo,
				onToggleTutorial,
				switchCamera,
				onTogglesSwitchMode,
				onToggleMenu,
				onToggleInfo,
				isFullscreen,
				isVideoPause,
				isSwitchMode,
				isSplashOpened,
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [controlsRef, isFullscreen, isVideoPause, isSwitchMode, isSplashOpened]);

	const onNextTransition = (transition: TTransitions) =>
		dispatch(nextTransition(transition));

	const _exerciseNumber = exercises?.findIndex(
		exer => exer.id === currentExercise?.id,
	);

	// Track previous results length to only auto-navigate after submissions
	const prevResultsLengthRef = useRef(resultsExercises.length);

	useEffect(() => {
		const prevLength = prevResultsLengthRef.current;
		const currentLength = resultsExercises.length;
		const justSubmitted = currentLength > prevLength;

		// Update ref for next comparison
		prevResultsLengthRef.current = currentLength;

		// Only auto-navigate after a submission (results increased)
		if (!justSubmitted) {
			return;
		}

		if (currentLength !== exercises?.length) {
			// Check if we're currently on the last exercise AND it has been submitted
			const currentExerciseIndex =
				exercises?.findIndex(ex => ex.id === currentExercise?.id) ?? -1;
			const isOnLastExercise =
				currentExerciseIndex === (exercises?.length ?? 0) - 1;
			const lastExerciseId = String(exercises?.[exercises.length - 1]?.id);
			const lastExerciseHasResult = resultsExercises.some(
				result => String(result.id) === lastExerciseId,
			);

			// Only block if CURRENTLY on last exercise AND it has result - dialog will handle
			if (isOnLastExercise && lastExerciseHasResult) {
				return;
			}

			const resultIds = resultsExercises.map(result => String(result.id));
			const missingExercise = exercises?.find(
				exercise => !resultIds.includes(String(exercise.id)),
			);

			if (missingExercise) {
				dispatch(goToExercise(missingExercise));
			}
		} else {
			setCompletionLoader(true);
			setCompleted(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resultsExercises, exercises, currentExercise]); // dispatch is stable from Redux

	const onSavePhysicalAssessmentsMetrics = useCallback(async () => {
		// Prevent multiple concurrent executions
		if (isSaving) {
			console.warn(
				'Save operation already in progress, ignoring duplicate call',
			);
			return;
		}

		setIsSaving(true);

		try {
			// Add data validation first
			if (!user?.id) {
				message.error('User information is missing. Please log in again.');
				return;
			}

			if (!session?.id && !state?.isEdit) {
				message.error(
					'Session information is missing. Please start a new scan.',
				);
				return;
			}

			if (!metricsData) {
				message.error('No scan data available. Please complete the scan.');
				return;
			}

			const payloadBase: SaveResultsPayload = {
				userId: user?.id,
				romSessionId: state?.isEdit ? state?.sessionId : session?.id ?? '',
				screenshot: metricsData?.screenshot,
				coordinates: metricsData?.coordinates,
			};

			if (
				currentExercise?.exercises?.length &&
				pose?.dualAngles &&
				Object.keys(pose.dualAngles).length === 2 &&
				currentExercise.bodySideTitle === 'Shoulder'
			) {
				const asyncTasks = currentExercise.exercises.map(
					async (exercise, index) => {
						if (pose.dualAngles && Object.keys(pose.dualAngles).length === 2) {
							const dualTasks = Object.entries(pose.dualAngles).map(
								async ([side, value]) => {
									const capitalizedSide =
										side.charAt(0).toUpperCase() + side.slice(1);
									const payload: SaveResultsPayload = {
										...payloadBase,
										title: `${capitalizedSide} ${currentExercise?.name} `,
										results: {
											create: [
												{
													value: Number.isFinite(value) ? value : 0,
													normal: exercise?.normal,
													min: exercise?.min,
													max: exercise?.max || exercise?.normal,
													wfl: exercise?.wfl,
													outOfRange:
														typeof exercise?.min === 'number' &&
														typeof exercise?.max === 'number'
															? value < exercise.min || value > exercise.max
															: false,
													romProgramExerciseId: exercise?.id,
												},
											],
										},
									};

									await dispatch(savePatientResults(payload));
								},
							);

							const results = await Promise.allSettled(dualTasks);
							const successCount = results.filter(
								r => r.status === 'fulfilled',
							).length;
							if (successCount < results.length) {
								console.warn(
									`${results.length - successCount} dual angle exercises failed to save`,
								);
							}
							dispatch(completedExercise(currentExercise));
						} else {
							const value =
								(isCustom ? pose?.angleResults[index] : pose?.angleResult) ?? 0;

							const romPatientResults = selectedRom?.romPatientResults?.find(
								res =>
									res?.results?.some(
										resultItem =>
											resultItem.romProgramExercise?.id === exercise.id,
									),
							);
							const result = romPatientResults?.results?.find(
								resultItem => resultItem.romProgramExercise?.id === exercise.id,
							);

							const payload: SaveResultsPayload = {
								...payloadBase,
								title:
									currentExercise?.name || currentExercise?.title || 'Exercise',
							};

							if (state?.isEdit && result?.romPatientResultId != undefined) {
								payload.result = {
									value: Number.isFinite(value) ? value : 0,
									normal: exercise?.normal,
									min: exercise?.min,
									max: exercise?.max || exercise?.normal,
									wfl: exercise?.wfl,
									outOfRange:
										typeof exercise?.min === 'number' &&
										typeof exercise?.max === 'number'
											? value < exercise.min || value > exercise.max
											: false,
								};

								await dispatch(
									editPatientResults({
										editData: payload,
										id: result.romPatientResultId,
									}),
								);
							} else {
								payload.results = {
									create: [
										{
											value: Number.isFinite(value) ? value : 0,
											normal: exercise?.normal,
											min: exercise?.min,
											max: exercise?.max || exercise?.normal,
											wfl: exercise?.wfl,
											outOfRange:
												typeof exercise?.min === 'number' &&
												typeof exercise?.max === 'number'
													? value < exercise.min || value > exercise.max
													: false,
											romProgramExerciseId: exercise?.id,
										},
									],
								};

								await dispatch(savePatientResults(payload));
							}

							dispatch(completedExercise(currentExercise));
						}
					},
				);

				const results = await Promise.allSettled(asyncTasks);
				const successCount = results.filter(
					r => r.status === 'fulfilled',
				).length;
				if (successCount < results.length) {
					console.warn(
						`${results.length - successCount} single angle exercises (batch 1) failed to save`,
					);
				}

				dispatch(clearPoseData());
			} else if (currentExercise?.exercises?.length) {
				const asyncTasks = currentExercise.exercises.map(
					async (exercise, index) => {
						const value =
							(isCustom ? pose?.angleResults[index] : pose?.angleResult) ?? 0;

						const romPatientResults = selectedRom?.romPatientResults?.find(
							res =>
								res?.results?.some(
									resultItem =>
										resultItem.romProgramExercise?.id === exercise.id,
								),
						);
						const result = romPatientResults?.results?.find(
							resultItem => resultItem.romProgramExercise?.id === exercise.id,
						);

						const payload: SaveResultsPayload = {
							...payloadBase,
							title:
								currentExercise?.name || currentExercise?.title || 'Exercise',
						};

						if (state?.isEdit && result?.romPatientResultId != undefined) {
							payload.result = {
								value: Number.isFinite(value) ? value : 0,
								normal: exercise?.normal,
								min: exercise?.min,
								max: exercise?.max || exercise?.normal,
								wfl: exercise?.wfl,
								outOfRange:
									typeof exercise?.min === 'number' &&
									typeof exercise?.max === 'number'
										? value < exercise.min || value > exercise.max
										: false,
							};

							await dispatch(
								editPatientResults({
									editData: payload,
									id: result.romPatientResultId,
								}),
							);
						} else {
							payload.results = {
								create: [
									{
										value: Number.isFinite(value) ? value : 0,
										normal: exercise?.normal,
										min: exercise?.min,
										max: exercise?.max || exercise?.normal,
										wfl: exercise?.wfl,
										outOfRange:
											typeof exercise?.min === 'number' &&
											typeof exercise?.max === 'number'
												? value < exercise.min || value > exercise.max
												: false,
										romProgramExerciseId: exercise?.id,
									},
								],
							};

							await dispatch(savePatientResults(payload));
						}

						dispatch(completedExercise(currentExercise));
					},
				);

				const secondBatchResults = await Promise.allSettled(asyncTasks);
				const secondBatchSuccessCount = secondBatchResults.filter(
					r => r.status === 'fulfilled',
				).length;
				if (secondBatchSuccessCount < secondBatchResults.length) {
					console.warn(
						`${secondBatchResults.length - secondBatchSuccessCount} single angle exercises (batch 2) failed to save`,
					);
				}
				dispatch(clearPoseData());
			} else {
				// Fallback: exercise without nested exercises array
				// Save the exercise directly using the base data

				const value = pose?.angleResult ?? 0;

				const payload: SaveResultsPayload = {
					...payloadBase,
					title: currentExercise?.name || currentExercise?.title || 'Exercise',
					results: {
						create: [
							{
								value: Number.isFinite(value) ? value : 0,
								normal:
									currentExercise?.normal ??
									currentExercise?.strapiOmniRomExercise?.reference?.normal,
								min:
									currentExercise?.min ??
									currentExercise?.strapiOmniRomExercise?.reference?.min,
								max:
									currentExercise?.max ??
									currentExercise?.strapiOmniRomExercise?.reference?.max ??
									currentExercise?.strapiOmniRomExercise?.reference?.normal,
								wfl:
									currentExercise?.wfl ??
									currentExercise?.strapiOmniRomExercise?.reference?.wfl,
								outOfRange: false,
								romProgramExerciseId: currentExercise?.id,
							},
						],
					},
				};

				await dispatch(savePatientResults(payload));
				dispatch(completedExercise(currentExercise));
				dispatch(clearPoseData());
			}
		} catch (error) {
			console.error('Error saving ROM results:', error);
			message.error(
				'Failed to save results. Please try again or contact support.',
			);
			// Ensure state is cleaned up even on error
		} finally {
			setIsSaving(false);
		}
	}, [
		isSaving,
		user,
		session,
		state,
		metricsData,
		currentExercise,
		pose,
		selectedRom,
		dispatch,
		isCustom,
	]);

	useEffect(() => {
		const onFullscreenChange = () =>
			setFullscreen(Boolean(document.fullscreenElement));

		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () =>
			document.removeEventListener('fullscreenchange', onFullscreenChange);
	}, []);

	// Camera initialization is now handled by CameraPermissionSplash
	// This effect only runs if permission splash was skipped (e.g., skipSplash flag)
	useEffect(() => {
		// Skip if permission splash is showing or main splash is still open
		if (showPermissionSplash || isSplashOpened) {
			return;
		}

		// Camera already initialized by permission splash
		// This fallback handles edge cases where splash was bypassed
		const initializeCameraFallback = async () => {
			if (cameraId) return; // Already initialized

			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						width: { ideal: 1280 },
						height: { ideal: 720 },
						frameRate: { ideal: 30 },
					},
				});

				stream.getTracks().forEach(track => track.stop());

				if (navigator.mediaDevices?.enumerateDevices) {
					const devices = await navigator.mediaDevices.enumerateDevices();
					const cameras = devices.filter(
						device => device.kind === 'videoinput',
					);

					setFlipCamera(cameras.length > 1);

					if (cameras.length > 0 && cameras[0].deviceId && !cameraId) {
						dispatch(setCameraId(cameras[0].deviceId));
					}
				}
			} catch (error) {
				console.error('Camera initialization fallback failed:', error);
			}
		};

		initializeCameraFallback();

		return () => {
			setFlipCamera(false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showPermissionSplash, isSplashOpened]);

	useEffect(() => {
		return () => {
			setFullscreen(false);
			setFlipCamera(false);
			setMenuOpen(false);
			setTutorialOpen(false);
			setSwitchMode(false);
			setSplashOpen(true);
			setVideoPause(false);
			setValidResult(null);
			setCompleted(false);
			setIsManual(false);
			setInfoOpen(false);
		};
	}, []);

	const requestWakeLock = async () => {
		try {
			if ('wakeLock' in navigator && wakeLockRef.current === null) {
				wakeLockRef.current = await navigator.wakeLock.request('screen');
			}
		} catch (err) {
			// Silently handle wake lock errors
			// Wake lock may not be supported or permission denied - app continues without it
		}
	};

	const releaseWakeLock = async () => {
		try {
			if (wakeLockRef.current) {
				await wakeLockRef.current.release();
				wakeLockRef.current = null;
			}
		} catch (err) {
			// Silently handle wake lock release errors
			// Release may fail if already released or browser doesn't support it
		}
	};

	useEffect(() => {
		requestWakeLock();

		return () => {
			releaseWakeLock();
		};
	}, []);

	useEffect(() => {
		dispatch(updateUser(user));
	}, [user, dispatch]);

	useEffect(() => {
		if (transition?.value === ETransitions.INTRO) {
			setVideoPause(false);
		}
	}, [transition, isRepetingExercise]);

	useEffect(() => {
		if (transition?.value === ETransitions.RESULT) {
			setValidResult(enableToSendResult);
		} else {
			setValidResult(null);
		}

		return () => setValidResult(null);
	}, [transition, enableToSendResult]);

	useEffect(() => {
		const checkDevice = () => {
			const isMobileOrIpad = window.innerWidth <= 1024;
			if (isMobileOrIpad) {
				dispatch(setCollapsible(true));
			} else {
				dispatch(setCollapsible(false));
			}
		};

		checkDevice();

		window.addEventListener('resize', checkDevice);

		return () => {
			window.removeEventListener('resize', checkDevice);
		};
	}, [dispatch]);

	// Show camera permission splash before main content
	if (showPermissionSplash) {
		return (
			<CameraPermissionSplash
				onReady={handlePermissionReady}
				requireAudio={true}
			/>
		);
	}

	return (
		<Flex
			align="flex-start"
			className="select-none"
			style={{ height: '100%', width: '100%' }}>
			<ControlsProvider mode="rom">
				<RomData
					isSplashOpened={
						showSplashOnMount
							? isSplashOpened
							: !state?.isDashboard &&
								!isDashboard &&
								!isCustom &&
								isSplashOpened
					}
					completionLoader={completionLoader}
					setCompletionLoader={setCompletionLoader}
					onToggleMenu={onToggleMenu}
					isDashboard={isDashboard ?? false}
					isValidResult={isValidResult}
					onSavePhysicalAssessmentsMetrics={onSavePhysicalAssessmentsMetrics}
					isSaving={isSaving}
					isVideoPause={isVideoPause}
					onTogglePauseVideo={onTogglePauseVideo}
					isFullscreen={isFullscreen}
					onToggleTutorial={onToggleTutorial}
					onFullscreen={onFullscreen}
					onTogglesSwitchMode={onTogglesSwitchMode}
					flipCamera={flipCamera}
					switchCamera={switchCamera}
					isSwitchMode={isSwitchMode}
					isMenuOpened={isMenuOpened}
					isTutorialOpened={isTutorialOpened}
					onTogglesSplashPage={onTogglesSplashPage}
					onExerciseValueAndCoordinates={onExerciseValueAndCoordinates}
					onBodyPointsVisible={onBodyPointsVisible}
					onNextTransition={onNextTransition}
					fullscreenRef={fullscreenRef}
					isCompleted={isCompleted}
					setCompleted={setCompleted}
					setIsManual={setIsManual}
					isManual={isManual}
					onToggleInfo={onToggleInfo}
					isInfoOpened={isInfoOpened}
					hideTopbar={hideTopbar}
					hideControls={hideControls}
					onScanComplete={onScanComplete}
					onTransitionTimeChange={handleTransitionTimeChange}
					volume={volume}
					isMuted={isMuted}
					onVolumeChange={onVolumeChange}
					onToggleMute={onToggleMute}
					cameraCount={cameraCount}
				/>
			</ControlsProvider>
		</Flex>
	);
};

export default memo(ORom);
