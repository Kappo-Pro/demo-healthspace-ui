import NavigationButtons from '@molecules/NavigationButtons';
import { UntitledIcon } from '@atoms/Icon';
import VideoRecord from '@molecules/VideoRecorder';
import Menu from '@organisms/RehabFlow/Menu';
import '@organisms/RehabFlow/style.css';
import { countdownTime, patientTimeLimit } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	ETransitionsAdmin,
	ETransitionsUser,
	deleteCurrentSession,
	fetchExercises,
	fetchSession,
	goToExercise,
	nextExercise,
	nextSequence,
	resetAll,
	savePatientVideo,
	savePhysioterapistVideo,
	setFacingMode,
	setOmniromRecord,
	setOmniromUpload,
	updateProps} from '@stores/clinical/rehab/main';
import {
	Col,
	ConfigProvider,
	Drawer,
	Empty,
	Flex,
	Modal,
	Row,
	Typography,
	message} from 'antd';
import { DashboardSkeleton } from '@atoms/Skeletons';
import { Content } from 'antd/lib/layout/layout';
import { useCallback, useEffect, useRef, useState } from 'react';
import RehabVideoHeader from './RehabVideoHeader';
import { RehabVideoState } from '@types';
import ProgressBarUpload from '@atoms/ProgressBarUpload';
import ResultRecordScreen from '@organisms/ResultRecordScreen';
import RecordConsultForm from '@organisms/RecordConsultForm';
import { useLocation } from 'react-router-dom';
import InstructionalVideo from './InstructionalVideo';
import RehabExerciseInfo from './RehabExerciseInfo';

import { useTranslation } from 'react-i18next';
import PreAssesment from '@atoms/RehabPreAssessment';
import { CompletionScreen } from './CompletionScreen/CompletionScreen';
import {
	loadTensorFlow,
	loadHandpose,
	loadFingerpose,
	loadTensorFlowWasm} from '@utils/MLLibraryLoader';
import {
	discardGesture,
	nextGesture,
	playGesture,
	previousGesture,
	submitGesture} from './HandGestures/gestures';
import { useVoiceControl } from '@atoms/RehabPreAssessment/VoiceControl';
import RomImageModal from '@pages/StartScan/ImageModal';
import { saveOmniRomPhysioterapistVideo } from '@stores/clinical/rom/romTemplates';
import { router } from '@routers/routers';
import MLLoadingIndicator from '@atoms/MLLoadingIndicator';

// Type imports only (no bundle impact)
type TensorFlow = typeof import('@tensorflow/tfjs');
type Handpose = typeof import('@tensorflow-models/handpose');
type Fingerpose = typeof import('fingerpose');

interface IOnSubmitVideo {
	size: number;
	type: string;
}

interface ReactVideorRecordRef {
	handleStartRecording: () => unknown;
	handleStopRecording: () => unknown;
	handleStopReplaying: () => unknown;
	handleRating: () => unknown;
	recordedBlobs: IOnSubmitVideo[];
}

function Rehab() {
	const { state } = useLocation();
	const [isUploading, setUploading] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isMenuOpened, setMenuOpen] = useState(false);
	const [isInfoOpened, setInfoOpen] = useState(false);
	const [flipCamera, setFlipCamera] = useState(false);
	const [isStartingTimer, setStartingTimer] = useState(false);
	const [videoBlob, setVideoBlob] = useState<null | Blob>(null);
	const [videoState, setVideoState] = useState<RehabVideoState>(
		RehabVideoState.START,
	);
	const [selectedRating, setSelectedRating] = useState<number>(0);
	const [isGestureEnabled, setGestureEnabled] = useState(false);
	const [gesture, setGesture] = useState();
	const [isLoadingML, setIsLoadingML] = useState(false);
	const [_mlLibraries, setMlLibraries] = useState<{
		tf?: TensorFlow;
		handpose?: Handpose;
		fp?: Fingerpose;
	}>({});

	const { t } = useTranslation();

	const [sessionId, setSessionId] = useState('');
	const fullscreenRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<ReactVideorRecordRef>(null);
	const [savedVoice, setSavedVoice] = useState('');
	const canvasRef = useRef(null);

	const dispatch = useTypedDispatch();
	const {
		exercises,
		currentExercise,
		sequence,
		facingMode,
		isPhysioterapist,
		recordConsult,
		completed,
		continueWhereLeftOff,
		session,
		updateOmniRomRecordConsultForm,
	} = useTypedSelector(state => state.rehab.main);

	const [isLoading, setIsLoading] = useState(true);

	const currentPath = window.location.pathname;
	const { isOmniRomRecord, isOmniRomUpload } = useTypedSelector(
		state => state.rehab.main,
	);
	const { romUploadDetails } = useTypedSelector(
		state => state.rom.romTemplates,
	);

	const [activeStep, setActiveStep] = useState(() => {
		if (currentPath === router.PROGRAMADDEXERCISES) {
			return -1;
		} else if (currentPath === router.OMNIROMADDEXERCISES) {
			return -2;
		} else {
			return 1;
		}
	});

	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	useEffect(() => {
		dispatch(resetAll());
		if (currentPath === router.PROGRAMADDEXERCISES) {
			setActiveStep(-1);
		} else if (currentPath === router.OMNIROMADDEXERCISES) {
			setActiveStep(-2);
			if (state?.omniRomRecord) {
				dispatch(setOmniromRecord(true));
			} else {
				dispatch(setOmniromUpload(true));
			}
		} else {
			setActiveStep(1);
		}
	}, [currentPath, dispatch, state]);

	const runHandpose = async () => {
		if (!isGestureEnabled) return;

		try {
			setIsLoadingML(true);

			// Lazy load TensorFlow libraries only when gesture control is enabled
			const [tf, handposeLib, fingerposeLib] = await Promise.all([
				loadTensorFlow(),
				loadHandpose(),
				loadFingerpose(),
				loadTensorFlowWasm(),
			]);

			// Set backend to WASM
			await tf.setBackend('wasm');
			await tf.ready();

			setMlLibraries({ tf, handpose: handposeLib, fp: fingerposeLib });
			setIsLoadingML(false);

			// Load handpose model
			const net = await handposeLib.load();

			// Start detection loop
			setInterval(() => {
				detect(net, fingerposeLib);
			}, 1500);
		} catch (error) {
			// Gesture control failed to load - continue without it
			console.error('Failed to load gesture control:', error);
			setIsLoadingML(false);
		}
	};

	const detect = async (
		net: Awaited<ReturnType<Handpose['load']>>,
		fp: Fingerpose,
	) => {
		if (
			isGestureEnabled &&
			videoState != RehabVideoState.RATING &&
			typeof videoRef?.current !== 'undefined' &&
			videoRef?.current !== null &&
			videoRef?.current?.cameraVideo?.readyState === 4
		) {
			const video = videoRef.current.cameraVideo;
			const videoWidth = video.videoWidth;
			const videoHeight = video.videoHeight;

			video.width = videoWidth;
			video.height = videoHeight;

			canvasRef.current.width = videoWidth;
			canvasRef.current.height = videoHeight;

			const hand = await net.estimateHands(video);

			if (hand.length > 0) {
				const GE = new fp.GestureEstimator([
					nextGesture,
					playGesture,
					previousGesture,
					submitGesture,
					discardGesture,
				]);

				setGesture(GE.estimate(hand[0].landmarks, 4));
			}
		}
	};

	useEffect(() => {
		if (gesture) {
			const score = gesture?.gestures.map(prediction =>
				prediction.score > 4 ? prediction.score : null,
			);

			const maxScore = score.indexOf(Math.max.apply(null, score));

			const handPose = gesture?.gestures[maxScore]?.name;

			if (
				handPose === 'play_stop_gesture' &&
				videoState === RehabVideoState.START
			)
				onStartRecord();
			else if (
				handPose === 'next_gesture' &&
				videoState === RehabVideoState.START
			)
				onClickNext();
			else if (
				handPose === 'previous_gesture' &&
				videoState === RehabVideoState.START
			)
				onClickPrev();
			else if (
				handPose === 'play_stop_gesture' &&
				videoState === RehabVideoState.RECORDING
			)
				onStopRecord();
			else if (
				handPose === 'submit_gesture' &&
				videoState === RehabVideoState.REPLAYING
			)
				onSubmitRecord();
			else if (
				handPose === 'discard_gesture' &&
				videoState === RehabVideoState.REPLAYING
			)
				onDiscardRecord();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gesture, videoState]);

	const resultExercise = exercises.findIndex(
		exer => exer.id === currentExercise?.id,
	);

	useEffect(() => {
		if (videoState === RehabVideoState.START) {
			if (
				savedVoice === 'record' ||
				savedVoice === 'yes' ||
				savedVoice === 'yes.'
			) {
				message.success('Recording Started!');
				onStartRecord();
			} else if (savedVoice === 'next') {
				if (resultExercise < exercises.length - 1) {
					message.success('Switched to the next video successfully!');
					onClickNext();
				} else {
					message.success('Already at the last exercise');
				}
			} else if (savedVoice === 'previous') {
				if (resultExercise > 0) {
					message.success('Switched to the previous video successfully!');
					onClickPrev();
				} else {
					message.success('Already at the first exercise');
				}
			}
		} else if (videoState === RehabVideoState.RECORDING) {
			if (savedVoice === 'stop') {
				message.success('Recording Stopped!');
				onStopRecord();
			}
		} else if (videoState === RehabVideoState.RATING) {
			const voiceLowerCase = savedVoice.toLowerCase();
			if (
				voiceLowerCase.includes('too easy') ||
				voiceLowerCase.includes('1') ||
				voiceLowerCase.includes('one')
			) {
				setSelectedRating(1);
			} else if (
				voiceLowerCase.includes('easy') ||
				voiceLowerCase.includes('2') ||
				voiceLowerCase.includes('two')
			) {
				setSelectedRating(2);
			} else if (
				voiceLowerCase.includes('normal') ||
				voiceLowerCase.includes('3') ||
				voiceLowerCase.includes('three')
			) {
				setSelectedRating(3);
			} else if (
				voiceLowerCase.includes('hard') ||
				voiceLowerCase.includes('4') ||
				voiceLowerCase.includes('four')
			) {
				setSelectedRating(4);
			} else if (
				voiceLowerCase.includes('too hard') ||
				voiceLowerCase.includes('5') ||
				voiceLowerCase.includes('five')
			) {
				setSelectedRating(5);
			}
			selectedRating !== 0 && onStopRating();
		} else if (videoState === RehabVideoState.REPLAYING) {
			if (savedVoice === 'no') {
				message.success('Discarded!');
				onDiscardRecord();
			} else if (savedVoice === 'yes') {
				message.success(t('Patient.data.vitalscan-rom.saveSuccess'));
				onSubmitRecord();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		savedVoice,
		selectedRating,
		videoState,
		resultExercise,
		exercises.length,
	]);

	// Memoize callback to prevent VoiceControl from restarting on every render
	const handleVoiceTranscript = useCallback(
		(updatedTranscript: string) => {
			setSavedVoice(updatedTranscript);
		},
		[],
	);

	useVoiceControl(handleVoiceTranscript);

	useEffect(() => {
		runHandpose();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGestureEnabled]);

	const onClickPrev = () => {
		dispatch(goToExercise(exercises[resultExercise - 1]));
	};
	const onClickNext = () => {
		dispatch(goToExercise(exercises[resultExercise + 1]));
	};

	const toogleFacingMode = () => {
		dispatch(setFacingMode());
	};

	const onToggleMenu = () => {
		setInfoOpen(false);
		setMenuOpen(!isMenuOpened);
	};

	useEffect(() => {
		if (activeStep === -1) {
			setIsLoading(false);
		}
	}, [activeStep]);

	const onToggleInfo = () => {
		setInfoOpen(!isInfoOpened);
	};

	const onFullscreen = async () => {
		if (isFullscreen) {
			await document.exitFullscreen();
		} else if (fullscreenRef.current) {
			await fullscreenRef.current.requestFullscreen();
		}
	};

	const onStartRecord = () => {
		videoRef?.current?.handleStartRecording();
		setVideoState(RehabVideoState.READY);
		setTimeout(() => {
			setStartingTimer(true);
			setVideoState(RehabVideoState.RECORDING);
		}, countdownTime);
	};

	const onStopRating = () => {
		setVideoState(RehabVideoState.REPLAYING);
		setStartingTimer(false);
	};

	const onStopRecord = () => {
		if (isPhysioterapist) {
			videoRef?.current?.handleStopRecording?.();
			setVideoState(RehabVideoState.SAVING);
			setStartingTimer(false);
			setTimeout(() => onStopRating(), 3000);
		} else {
			videoRef?.current?.handleStopRecording?.();
			setVideoState(RehabVideoState.SAVING);
			setStartingTimer(false);
			setTimeout(() => setVideoState(RehabVideoState.RATING), 3000);
		}
	};

	const onEndedTimer = () => {
		onStopRecord();
	};

	const onDiscardRecord = () => {
		setVideoBlob(null);
		if (videoRef?.current?.recordedBlobs) videoRef.current.recordedBlobs = [];
		setSavedVoice('');
		setSelectedRating(0);
		setVideoState(RehabVideoState.START);
	};

	const onRecordFinished = (videoBlob: Blob) => {
		if (videoBlob) setVideoBlob(videoBlob);
	};

	const onSubmitRecord = async () => {
		setUploading(true);
		isPhysioterapist
			? await submitPhysioterapistVideo()
			: await submitVideoPatient();
		setVideoBlob(null);
		setUploading(false);
		setVideoState(RehabVideoState.START);
	};

	const submitVideoPatient = async () => {
		const form = new FormData();
		const exerciseDifficultyLevel = selectedRating.toString();
		form.append('video', videoBlob);
		form.append(
			'rehabPatientListExercisesId',
			currentExercise?.rehabPatientListExercisesId,
		);
		form.append('rehabExerciseToPatientId', currentExercise?.id);
		form.append('exerciseDifficultyLevel', exerciseDifficultyLevel);
		form.append('userId', user.isPhysioterapist ? selectedUser?.id : user?.id);
		const rehabExerciseData = await dispatch(savePatientVideo(form));
		setSessionId(rehabExerciseData?.payload?.rehabExerciseListSessionId);
		dispatch(nextExercise());
		setSavedVoice('');
		setSelectedRating(0);
	};

	const submitOmniromRecord = async () => {
		const form = new FormData();
		form.append('physioterapistId', user.id);
		const videos = romUploadDetails.videos ? [...romUploadDetails.videos] : [];
		if (videoBlob instanceof Blob || videoBlob instanceof File) {
			videos.push(videoBlob);
		}
		videos.forEach(video => {
			form.append('video', video);
		});

		updateOmniRomRecordConsultForm?.forEach((exercise, index: number) => {
			form.append(
				`exercises[create][${index}][strapiOmniRomExerciseId]`,
				exercise?.strapiOmniRomExerciseId || 0,
			);
			form.append(`exercises[create][${index}][normal]`, exercise?.normal);
			form.append(`exercises[create][${index}][wfl]`, exercise?.wfl);
			form.append(`exercises[create][${index}][min]`, exercise?.min);
			form.append(`exercises[create][${index}][max]`, exercise?.max);
		});

		for (const [key, value] of Object.entries(romUploadDetails)) {
			if (key !== 'videos') {
				form.append(key, value || '');
			}
		}
		dispatch(nextSequence(sequence.next));

		try {
			await dispatch(saveOmniRomPhysioterapistVideo(form));
		} catch (error) {
			// Error handled by Redux thunk and user notification
			console.error('Failed to save OmniRom video:', error);
		}
	};

	const submitPhysioterapistVideo = async () => {
		if (isOmniRomRecord || isOmniRomUpload) {
			submitOmniromRecord();
		} else {
			const form = new FormData();
			// TODO: Consider using videoBlob ?? defaultValue or videoBlob?.property instead of videoBlob!
			if (!videoBlob) {
				console.error('Video blob is null, cannot submit');
				return;
			}
			form.append('video', videoBlob);
			form.append('physioterapistId', user.id);
			for (const [key, value] of Object.entries(recordConsult)) {
				form.append(key, value || '');
			}
			if (selectedUser) {
				form.append('userId', selectedUser?.id);
			}
			await dispatch(savePhysioterapistVideo(form));
			setSavedVoice('');
		}
	};

	useEffect(() => {
		dispatch(resetAll());
		if (state?.startSession || !user.isPhysioterapist) {
			const patient = user.isPhysioterapist ? selectedUser : user;
			dispatch(
				updateProps({
					user: patient.id,
					physioterapist: null,
					isPhysioterapist: false,
				}),
			);
			dispatch(fetchExercises(patient.id)).then(() => setIsLoading(false));
			dispatch(fetchSession(patient.id));
		} else {
			dispatch(
				updateProps({
					user: selectedUser?.id,
					physioterapist: user.id,
					isPhysioterapist: user.isPhysioterapist,
				}),
			);
			setIsLoading(false);
		}

		return () => {
			dispatch(resetAll());
		};
	}, [selectedUser, user, state, dispatch]);

	useEffect(() => {
		if (completed && sequence?.next) {
			dispatch(nextSequence(sequence.next));
			setUploading(false);
		}
	}, [completed, sequence, dispatch]);

	useEffect(() => {
		if (!completed && exercises.length && !currentExercise) {
			dispatch(nextExercise());
		}
	}, [completed, exercises, currentExercise, dispatch]);

	useEffect(() => {
		if (
			!isLoading &&
			continueWhereLeftOff &&
			session &&
			!isPhysioterapist &&
			sequence?.value === ETransitionsUser.VIDEO &&
			!completed
		) {
			Modal.destroyAll();
			Modal.confirm({
				title: t('Patient.data.rehab.confirm'),
				icon: (
					<div className={'iconModalInativity'}>
						<UntitledIcon name="exclamationCircle" size={20} />
					</div>
				),
				content: t('Patient.data.rehab.continueExercise'),
				okText: t('Patient.data.rehab.yes'),
				cancelText: t('Patient.data.rehab.no'),
				onCancel: () => {
					setIsLoading(true);
					dispatch(resetAll());
					dispatch(deleteCurrentSession(session.id));
					dispatch(
						fetchExercises(user.isPhysioterapist ? selectedUser?.id : user?.id),
					).then(() => setIsLoading(false));
				},
				onOk: () => {
					if (!session.rehabEvaluationId && completed)
						dispatch(nextSequence(sequence.next));
					else dispatch(nextExercise());
					setActiveStep(4);
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		continueWhereLeftOff,
		session,
		sequence,
		user,
		isLoading,
		isPhysioterapist,
		completed,
	]);

	useEffect(() => {
		const onFullscreenChange = () =>
			setIsFullscreen(Boolean(document.fullscreenElement));

		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () =>
			document.removeEventListener('fullscreenchange', onFullscreenChange);
	}, []);

	useEffect(() => {
		const enumerateCameras = async () => {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const cameras = devices.filter(device => device.kind === 'videoinput');
			setFlipCamera(cameras.length > 1);
		};
		if (navigator.mediaDevices?.enumerateDevices) enumerateCameras();

		return () => setFlipCamera(false);
	}, []);

	if (isLoading) return <DashboardSkeleton />;

	if (!exercises.length && !isPhysioterapist)
		return (
			<Flex align="center" justify="center" className="select-none">
				<div className="w-1/2">
					<Flex justify="center" align="center" className="h-screen">
						<Empty
							description={
								<Typography.Title level={3} className="!text-white">
									{t('Patient.data.rehab.rehabEmpty')}
								</Typography.Title>
							}
						/>
					</Flex>
				</div>
			</Flex>
		);
	return (
		<ConfigProvider prefixCls="ant">
			<Row
				className="coach-container select-none h-full"
				align="middle"
				justify="center"
				className="overflow-hidden">
				<Col
					ref={fullscreenRef}
					style={{
						maxWidth: 1280,
						width: '100%',
					}}>
					{!isUploading && !(activeStep > 0 && activeStep < 5) && (
						<RehabVideoHeader
							savedVoice={savedVoice}
							isGestureEnabled={isGestureEnabled}
							isFullscreen={isFullscreen}
							flipCamera={flipCamera}
							videoState={videoState}
							isStartingTimer={isStartingTimer}
							onFullscreen={onFullscreen}
							toogleFacingMode={toogleFacingMode}
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
						/>
					)}

					<Content
						style={{
							height: isFullscreen ? '100%' : 'auto',
							position: 'relative',
							zIndex: 1,
							background: 'var(--color-purple-600)',
							overflow: 'hidden',
						}}>
						<Drawer
							placement="top"
							closable={false}
							onClose={onToggleInfo}
							open={isInfoOpened}
							getContainer={false}
							forceRender={isFullscreen}
							styles={{
								body: {
									backgroundColor: 'var(--color-bg-modal-overlay)',
									backdropFilter: 'blur(8px)',
								},
							}}
							height="auto">
							<RehabExerciseInfo />
						</Drawer>
						<Drawer
							placement="left"
							closable={false}
							onClose={onToggleMenu}
							open={isMenuOpened}
							getContainer={false}
							forceRender={isFullscreen}
							style={{ height: isMenuOpened ? '100%' : 0 }}
							bodyStyle={{
								padding: 0,
								backgroundColor: 'var(--brand-primary)e3',
							}}>
							<Menu onToggleMenu={onToggleMenu} />
						</Drawer>
						<Col
							style={{
								background: 'var(--mainmenu-bg-color)',
								maxWidth: isFullscreen ? '100%' : 1280,
								width: '100%',
								height: isFullscreen ? '100%' : 680,
								maxHeight: isFullscreen ? '100%' : 680,
							}}>
							{activeStep > 0 && activeStep < 5 && (
								<PreAssesment
									setSavedVoice={setSavedVoice}
									setGestureEnabled={setGestureEnabled}
									savedVoice={savedVoice}
									activeStep={activeStep}
									setActiveStep={setActiveStep}
								/>
							)}
							{isUploading && <ProgressBarUpload />}
							{videoState !== RehabVideoState.REPLAYING &&
								videoState !== RehabVideoState.RATING &&
								!isUploading &&
								currentExercise && (
									<InstructionalVideo currentExercise={currentExercise} />
								)}
							{sequence?.value === ETransitionsAdmin.FORM &&
								activeStep === -2 && <RomImageModal />}
							{sequence?.value === ETransitionsAdmin.FORM &&
								activeStep === -1 && <RecordConsultForm />}
							{(sequence?.value === ETransitionsAdmin.VIDEO ||
								sequence?.value === ETransitionsUser.VIDEO) && (
								<VideoRecord
									ref={videoRef}
									videoState={videoState}
									videoBlob={videoBlob}
									onRecordFinished={onRecordFinished}
									facingMode={facingMode}
									timeLimit={patientTimeLimit}
									audio={true}
								/>
							)}
							{sequence?.value !== ETransitionsAdmin.FINISH &&
								sequence?.value !== ETransitionsUser.EVALUATION && (
									<canvas ref={canvasRef} />
								)}
							{isLoadingML && isGestureEnabled && (
								<MLLoadingIndicator type="tensorflow" size="small" />
							)}
							{sequence?.value === ETransitionsAdmin.FINISH && (
								<ResultRecordScreen />
							)}
							{sequence?.value === ETransitionsUser.EVALUATION && (
								<CompletionScreen
									savedVoice={savedVoice}
									sessionId={sessionId}
								/>
							)}
							<img
								style={{
									bottom: '40px',
									left: '40px',
									position: 'absolute',
									zIndex: 2,
								}}
								src={
									isOmniRomRecord || isOmniRomUpload
										? '/images/OmniRome.svg'
										: '/images/LogoLetsMove.svg'
								}
								alt="rehab"
							/>
							{!(activeStep > 0 && activeStep < 5) &&
								videoState === RehabVideoState.START && (
									<NavigationButtons
										prevHide={
											resultExercise === 0 ||
											exercises.length === 0 ||
											sequence?.value === ETransitionsUser.EVALUATION
										}
										nextHide={
											resultExercise === exercises.length - 1 ||
											sequence?.value === ETransitionsUser.EVALUATION
										}
										onClickPrev={onClickPrev}
										onClickNext={onClickNext}
									/>
								)}
						</Col>
					</Content>
				</Col>
			</Row>
		</ConfigProvider>
	);
}

export default Rehab;
