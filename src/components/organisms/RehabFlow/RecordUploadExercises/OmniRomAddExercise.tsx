import ProgressBarUpload from '@atoms/ProgressBarUpload';
import { useVoiceControl } from '@atoms/RehabPreAssessment/VoiceControl';
import VideoRecord from '@molecules/VideoRecorder';
import '@organisms/RehabFlow/style.css';
import ResultRecordScreen from '@organisms/ResultRecordScreen';
import RomImageModal from '@pages/StartScan/ImageModal';
import {
	ETransitionsAdmin,
	ETransitionsUser,
	nextSequence,
	resetAll,
	setOmniromRecord,
	setOmniromUpload,
	updateProps,
} from '@stores/clinical/rehab/main';
import { saveOmniRomPhysioterapistVideo } from '@stores/clinical/rom/romTemplates';
import { countdownTime, patientTimeLimit } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { RehabVideoState } from '@types';
import { Col, ConfigProvider, Flex, message } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import RehabVideoHeader from '../RehabVideoHeader';

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

function OmniRomAddExercise() {
	const { state } = useLocation();
	const [isUploading, setUploading] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isStartingTimer, setStartingTimer] = useState(false);
	const [videoBlob, setVideoBlob] = useState<null | Blob>(null);
	const [videoState, setVideoState] = useState<RehabVideoState>();
	const [selectedRating, setSelectedRating] = useState<number>(0);
	const { t } = useTranslation();
	const fullscreenRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<ReactVideorRecordRef>(null);
	const [savedVoice, setSavedVoice] = useState('');
	const dispatch = useTypedDispatch();
	const {
		sequence,
		facingMode,
		isPhysioterapist,
		updateOmniRomRecordConsultForm,
	} = useTypedSelector(state => state.rehab.main);
	const currentPath = window.location.pathname;
	const { romUploadDetails } = useTypedSelector(
		state => state.rom.romTemplates,
	);
	const [activeStep, setActiveStep] = useState(-2);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { isOmniRomRecordModal, isOmniRomRecord, isOmniRomUpload } =
		useTypedSelector(state => state.rehab.main);

	useEffect(() => {
		dispatch(resetAll());
		if (isOmniRomRecordModal) {
			setActiveStep(-2);
			if (isOmniRomRecord) {
				dispatch(setOmniromRecord(true));
			} else {
				dispatch(setOmniromUpload(true));
			}
		} else {
			setActiveStep(1);
		}
	}, [currentPath, dispatch, state]);

	useEffect(() => {
		const onFullscreenChange = () =>
			setIsFullscreen(Boolean(document.fullscreenElement));
		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () =>
			document.removeEventListener('fullscreenchange', onFullscreenChange);
	}, []);

	useEffect(() => {
		if (videoState === RehabVideoState.START) {
			if (
				savedVoice === 'record' ||
				savedVoice === 'yes' ||
				savedVoice === 'yes.'
			) {
				message.success('Recording Started!');
				onStartRecord();
			}
		} else if (videoState === RehabVideoState.RECORDING) {
			if (savedVoice === 'stop') {
				message.success('Recording Stopped!');
				onStopRecord();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedVoice, videoState]);

	// Memoize callback to prevent VoiceControl from restarting on every render
	const handleVoiceTranscript = useCallback(
		(updatedTranscript: string) => {
			setSavedVoice(updatedTranscript);
		},
		[],
	);

	useVoiceControl(handleVoiceTranscript);

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
		await submitPhysioterapistVideo();
		setVideoBlob(null);
		setUploading(false);
		setVideoState(RehabVideoState.START);
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
			message.success(t('Patient.data.vitalscan-rom.saveSuccess'));
		} catch (error) {
			// Error handled by Redux thunk and user notification
			console.error('Failed to save OmniRom video:', error);
		}
	};

	const submitPhysioterapistVideo = async () => {
		submitOmniromRecord();
	};

	useEffect(() => {
		dispatch(resetAll());
		dispatch(
			updateProps({
				user: selectedUser?.id,
				physioterapist: user.id,
				isPhysioterapist: user.isPhysioterapist,
			}),
		);
	}, [selectedUser, user, dispatch]);

	return (
		<ConfigProvider prefixCls="ant">
			<Flex
				className="coach-container select-none h-full"
				align="center"
				justify="center"
				className="overflow-hidden">
				<div ref={fullscreenRef} style={{ maxWidth: 1280, width: '100%' }}>
					{!isUploading &&
						!(activeStep > 0 && activeStep < 5) &&
						(sequence?.value === ETransitionsAdmin.VIDEO ||
							sequence?.value === ETransitionsUser.VIDEO ||
							(!isOmniRomRecord && !isOmniRomUpload)) && (
							<RehabVideoHeader
								savedVoice={savedVoice}
								isFullscreen={isFullscreen}
								videoState={videoState}
								isStartingTimer={isStartingTimer}
								onFullscreen={onFullscreen}
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
						className="main-section-content"
						style={{ height: isFullscreen ? '100%' : 'auto' }}>
						<Col
							className={
								isFullscreen ? 'full-screen-view' : 'normal-screen-view'
							}>
							{isUploading && <ProgressBarUpload />}
							{sequence?.value === ETransitionsAdmin.FORM &&
								activeStep === -2 && (
									<RomImageModal setVideoState={setVideoState} />
								)}
							{(sequence?.value === ETransitionsAdmin.VIDEO ||
								sequence?.value === ETransitionsUser.VIDEO) && (
								<VideoRecord
									ref={videoRef}
									videoState={videoState}
									videoBlob={videoBlob}
									onRecordFinished={onRecordFinished}
									facingMode={facingMode}
									timeLimit={patientTimeLimit}
									audio
								/>
							)}
							{sequence?.value === ETransitionsAdmin.FINISH && (
								<ResultRecordScreen />
							)}
							<img
								className="logo-image"
								src={'/images/OmniRome.svg'}
								alt="rehab"
							/>
						</Col>
					</Content>
				</div>
			</Flex>
		</ConfigProvider>
	);
}

export default OmniRomAddExercise;
