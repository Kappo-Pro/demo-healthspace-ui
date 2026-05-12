import TextAnimation from '@atoms/TextAnimation/TextAnimation';
import { UseControls } from '@pages/PostureScan/context/Controls.context';
import { useTypedSelector } from '@stores/index';
import { ETransitions, TTransitions } from '@stores/interfaces';
import { CustomRomExercise } from '@types';
import { Content } from 'antd/lib/layout/layout';
import React, { useEffect, useRef, useState } from 'react';

interface IInstructionalVideoProps {
	onNextTransition: () => void;
	onTogglePauseVideo: () => void;
	transition: TTransitions | null;
	currentExercise: CustomRomExercise;
	isVideoPause: boolean;
	isSwitchMode: boolean;
	isFullscreen: boolean;
	isRepeat: boolean;
	aspectRatio: string;
	volume?: number;
	isMuted?: boolean;
}

function InstructionalVideo(props: IInstructionalVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [open, setOpen] = useState(false);
	const [isFull, setFull] = useState(true);
	const [showVideo, setShowVideo] = useState(false);
	const { canvasDimensions, setCanvasDimensions } = UseControls();

	const videoSizeState = useTypedSelector(
		state => state.rom.main.videoSizeState,
	);

	const {
		onNextTransition,
		onTogglePauseVideo,
		currentExercise,
		isSwitchMode,
		isFullscreen,
		isRepeat,
		isVideoPause,
		transition,
		aspectRatio,
		volume = 100,
		isMuted = false,
	} = props;

	// useEffect(() => {
	// 	if (transition?.value == ETransitions.CALIBRATION) {
	// 		setFull(false)
	// 	}
	// }, [transition])

	useEffect(() => {
		if (currentExercise) {
			setOpen(true);
			setFull(true);
			setShowVideo(false);
			const timer = setTimeout(() => {
				setShowVideo(true);
			}, 4500);

			return () => clearTimeout(timer);
		}
	}, [currentExercise]);

	useEffect(() => {
		isVideoPause ? videoRef.current?.pause() : videoRef.current?.play();
	}, [isVideoPause]);

	// Apply volume and mute changes without restarting video
	useEffect(() => {
		if (videoRef.current) {
			const video = videoRef.current;
			const currentTime = video.currentTime;
			const isPlaying = !video.paused;

			video.volume = volume / 100;
			video.muted = isMuted;

			// Preserve playback state
			if (currentTime > 0 && currentTime !== video.currentTime) {
				video.currentTime = currentTime;
			}
			if (isPlaying && video.paused) {
				video.play().catch(() => {});
			}
		}
	}, [volume, isMuted]);

	const onToggleVideoOpened = () => {
		if (open && isFull) {
			onended();
		} else {
			setOpen(!open);
		}
	};

	const onended = () => {
		setFull(false);
		// onTogglePauseVideo();
		if (open && isFull) onNextTransition();
		videoRef.current?.play();
	};

	useEffect(() => {
		if (videoRef?.current && isRepeat) {
			videoRef.current.currentTime = 0;
			videoRef.current.play();
		}
	}, [isRepeat, videoRef]);

	if (
		!currentExercise ||
		transition?.value === ETransitions.OPENNING ||
		transition?.value === ETransitions.CLOSING
	)
		return <></>;

	return (
		<Content
			className="md:w-[240px] lg:w-[300px] xl:w-[360px] 2xl:w-[420px]"
			style={{
				position: 'absolute',
				width: isSwitchMode || isFull ? '100%' : '20%',
				// ...(showVideo && {
				// 	display: 'flex',
				// 	alignItems: 'center',
				// }),
				// width: "100%",
				// height: "auto",
				zIndex: isSwitchMode ? 3 : 4,
				background: open
					? isFull
						? 'linear-gradient(244deg, var(--color-purple-500) -8.37%, var(--color-purple-800) 101.09%)'
						: 'transparent'
					: 'transparent',
				aspectRatio,
				opacity: 0.85,
				height: isFullscreen && (isSwitchMode || isFull) ? '100vh' : 'auto',
			}}>
			{isFull && !showVideo && (
				<div
					style={{
						background: 'transparent',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						overflow: 'hidden',
					}}>
					<TextAnimation
						text={currentExercise?.name || currentExercise?.title}
						bodySideTitle={currentExercise?.bodySideTitle}
						movementTitle={currentExercise?.movementTitle}
					/>
				</div>
			)}

			{showVideo && (
				<video
					style={{
						visibility: open || isSwitchMode ? 'visible' : 'hidden',
						width: '100%',
						aspectRatio,
						height: 'auto',
						objectFit: videoSizeState as React.CSSProperties['objectFit'],
						borderRadius: 'var(--radius-xl)',
						...(!isFull && {
							marginTop: 'var(--spacing-24)',
							marginLeft: 'var(--spacing-6)',
						}),
					}}
					id="instructionalvideo"
					ref={videoRef}
					autoPlay
					loop={!isFull}
					preload="metadata"
					key={currentExercise?.id}
					src={
						currentExercise?.video?.url
							? currentExercise?.video?.url
							: currentExercise?.video
					}
					onEnded={onended}
				/>
			)}
			{/* {!isSwitchMode &&
				(open ? (
					<PiArrowUpLeftBold
						size={40}
						style={{
							color: 'var(--color-white)',
							position: 'absolute',
							right: 0,
							bottom: isFullscreen && isFull ? 35 : 0,
							backgroundColor: 'var(--color-purple-900)',
							cursor: 'pointer',
						}}
						onClick={onToggleVideoOpened}
					/>
				) : (
					<PiArrowDownRightBold
						size={40}
						style={{
							color: 'var(--color-white)',
							position: 'absolute',
							left: 0,
							top: 0,
							backgroundColor: 'var(--color-purple-900)',
							cursor: 'pointer',
						}}
						onClick={onToggleVideoOpened}
					/>
				))} */}
		</Content>
	);
}

export default React.memo(InstructionalVideo);
