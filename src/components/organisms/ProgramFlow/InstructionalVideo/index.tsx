import { UntitledIcon } from '@atoms/Icon';
import { setFullScreen } from '@stores/clinical/rehab/main';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { IProgramExercise, RehabVideoState } from '@types';
import { useEffect, useRef, useState } from 'react';

import { Tooltip } from 'antd';
import './style.css';

import TextAnimation from '@atoms/TextAnimation/TextAnimation';
import { useTranslation } from 'react-i18next';
import {
	MdVisibility,
	MdVisibilityOff,
	MdVolumeOff,
	MdVolumeUp,
} from 'react-icons/md';

interface IInstructionalVideoProps {
	currentExercise: IProgramExercise;
	onStartRecord: () => void;
	videoState: RehabVideoState;
}

function InstructionalVideo(props: IInstructionalVideoProps) {
	const { currentExercise, onStartRecord, videoState } = props;
	const videoRef = useRef<HTMLVideoElement>(null);
	const [open, setOpen] = useState(false);
	const [isFull, setFull] = useState(true);
	const [enableTrueForm, setEnableTrueForm] = useState(false);
	const { isAuto } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const dispatch = useTypedDispatch();
	const [showVideo, setShowVideo] = useState(false);
	const [isVideoHidden, setIsVideoHidden] = useState(false);
	const { t } = useTranslation();
	const [isMuted, setIsMuted] = useState(!isFull);

	const toggleMute = () => {
		if (videoRef.current) {
			const newMutedState = !videoRef.current.muted;
			videoRef.current.muted = newMutedState;
			setIsMuted(newMutedState);
		}
	};

	useEffect(() => {
		setIsMuted(!isFull);
		if (videoRef.current) {
			videoRef.current.muted = !isFull;
		}
	}, [currentExercise, isFull]);

	useEffect(() => {
		if (currentExercise) {
			setOpen(true);
			setFull(true);
			dispatch(setFullScreen(true));
			setShowVideo(false);
			setIsVideoHidden(false); // Reset hidden state for new exercise
			const timer = setTimeout(() => {
				setShowVideo(true);
			}, 4500);

			return () => clearTimeout(timer);
		}
	}, [currentExercise]);

	// Cleanup video on unmount
	useEffect(() => {
		return () => {
			if (videoRef?.current) {
				try {
					videoRef.current.pause();
					videoRef.current.src = '';
				} catch (e) {
					// Ignore cleanup errors
				}
			}
		};
	}, []);

	const onPlay = () => {
		if (videoRef?.current && document.contains(videoRef.current)) {
			videoRef.current.currentTime = 0;
			const playPromise = videoRef.current.play();
			if (playPromise !== undefined) {
				playPromise.catch(error => {
					// Handle play interruption gracefully
					if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
						console.warn('Instructional video play interrupted:', error);
					}
				});
			}
		}
	};

	const onSkip = () => {
		if (isFull) {
			// Only auto-start recording if in auto mode
			// In manual mode, user should see the Record button and manually start
			if (isAuto) {
				onStartRecord();
			}
			setFull(false);
			dispatch(setFullScreen(false));
		}
	};

	const toggleVideoVisibility = () => {
		setIsVideoHidden(!isVideoHidden);
	};

	const onended = () => {
		if (isFull) {
			if (isAuto) {
				onStartRecord();
			}
			// Always trigger Get Ready state when instructional video completes

			setFull(false);
			dispatch(setFullScreen(false));
		}
		if (videoRef?.current && document.contains(videoRef.current)) {
			const playPromise = videoRef.current.play();
			if (playPromise !== undefined) {
				playPromise.catch(error => {
					// Handle play interruption gracefully
					if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
						console.warn('Instructional video loop play interrupted:', error);
					}
				});
			}
		}
	};

	if (!currentExercise) return <></>;

	const video = currentExercise?.video
		? currentExercise?.video
		: currentExercise?.exerciseLibrary?.videoUrl;

	return (
		<div
			style={{
				position: 'absolute',
				zIndex: 3,
				width: isFull ? '100%' : '300px',
				minHeight: '237px',
				borderRadius: 0,
				overflow: 'hidden',
				backgroundColor: isFull ? 'var(--color-purple-700)' : 'transparent',
				opacity: enableTrueForm ? 1 : 0.85,
				height: isFull ? '100%' : 'auto',
				display: 'flex',
				flexDirection: 'column',
			}}>
			<div
				style={{
					position: 'relative',
					height: isFull ? '100%' : 'auto',
					display: 'flex',
					justifyContent: 'center',
				}}>
				{isFull && !showVideo && (
					<div
						style={{
							backgroundColor: 'var(--color-purple-800)',
							overflow: 'hidden',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '100%',
							opacity: 0.85,
						}}>
						<TextAnimation
							text={
								currentExercise?.name?.toUpperCase() ||
								currentExercise?.exerciseLibrary?.title?.toUpperCase()
							}
						/>
					</div>
				)}

				{showVideo && !isVideoHidden && (
					<>
						<div
							style={{
								position: 'relative',
								width: '100%',
								height: '100%',
								objectFit: 'contain',
							}}>
							<video
								id="instructionalvideo"
								ref={videoRef}
								loop={!isFull}
								autoPlay
								muted={isMuted}
								controls={false}
								preload="metadata"
								key={video}
								src={video}
								onLoadedMetadata={onPlay}
								onEnded={onended}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'contain',
								}}
							/>

							<Tooltip title={isMuted ? 'Unmute Video' : 'Mute Video'}>
								<div
									style={{
										position: 'absolute',
										bottom: '5px',
										left: '5px',
										backgroundColor:
											'color-mix(in srgb, var(--brand-primary) 80%, transparent)',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: 'var(--color-white)',
										width: 'var(--spacing-8)',
										height: 'var(--spacing-8)',
										borderRadius: '50%',
										zIndex: 10,
									}}
									onClick={toggleMute}>
									{isMuted ? (
										<MdVolumeOff size={20} />
									) : (
										<MdVolumeUp size={20} />
									)}
								</div>
							</Tooltip>
						</div>
					</>
				)}
				{/* Hide/Show toggle button - only show when video is minimized */}
				{!isFull && showVideo && (
					<Tooltip
						title={
							isVideoHidden
								? t('Patient.data.programs.flow.showVideo')
								: t('Patient.data.programs.flow.hideVideo')
						}>
						<div
							style={{
								position: 'absolute',
								...(isVideoHidden
									? { top: '5px', left: '5px' } // Left top when hidden
									: { bottom: '5px', right: '5px' }), // Right bottom when visible
								backgroundColor:
									'color-mix(in srgb, var(--brand-primary) 80%, transparent)',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'var(--text-on-dark)',
								width: 'var(--spacing-8)',
								height: 'var(--spacing-8)',
								borderRadius: 'var(--radius-full)',
								zIndex: 10,
							}}
							onClick={toggleVideoVisibility}>
							{isVideoHidden ? (
								<MdVisibility size={20} />
							) : (
								<MdVisibilityOff size={20} />
							)}
						</div>
					</Tooltip>
				)}
				{!enableTrueForm && showVideo && (
					<>
						{open && isFull && (
							<Tooltip
								title={t('Patient.data.programs.flow.skipInstructionalVideo')}>
								<div
									style={{
										position: 'absolute',
										right: 0,
										bottom: 0,
										backgroundcolor: 'var(--brand-primary)',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										color: 'var(--text-on-dark)',
										paddingLeft: 'var(--spacing-2-5)',
										height: 'var(--spacing-8)',
										borderTopLeftRadius: '5px',
									}}
									onClick={onSkip}>
									<span
										style={{
											marginRight: 'var(--spacing-2)',
											fontSize: 'var(--font-size-sm)',
											fontWeight: 'bold',
										}}>
										SKIP
									</span>
									<UntitledIcon name="arrowRight" size={20} />
								</div>
							</Tooltip>
						)}
					</>
				)}
			</div>
			{/* True to Form - hidden until further notice */}
			{false && !isAuto && !isFull && videoState === RehabVideoState.START && (
				<span
					onClick={() => {
						setFull(true);
						setEnableTrueForm(true);
						dispatch(setFullScreen(true));
						onPlay();
					}}
					className="true-to-form-label">
					{t('Admin.data.rehab.rehabPreAssessment.true2Form')}
				</span>
			)}
			{isFull && enableTrueForm && (
				<div
					onClick={() => {
						setFull(false);
						setEnableTrueForm(false);
						dispatch(setFullScreen(false));
					}}
					className="true-to-form-close">
					<UntitledIcon name="close" size={20} />
				</div>
			)}
		</div>
	);
}

export default InstructionalVideo;
