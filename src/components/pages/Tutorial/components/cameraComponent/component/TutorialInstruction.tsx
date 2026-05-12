import TextAnimation from '@atoms/TextAnimation/TextAnimation';
import { UseFullScreen } from '@pages/PostureScan/context/FullScreen.context';
import { UseSwitchVideo } from '@pages/PostureScan/context/SwitchVideo.context';

import { Content } from 'antd/lib/layout/layout';
import { useEffect, useRef, useState } from 'react';
import {
	TransitionStates,
	UseTransitionTutorial,
} from '../context/TransitionTutorial.context';
import {
	MovementExercise,
	UseTutorialControls,
} from '../context/TutorialControls.context';

interface IInstructionalVideoProps {
	onTogglePauseVideo: () => void;
	currentExercise: MovementExercise | null;
	isRepeat: boolean;
}

// removed hardcoded color constant

function TutorialInstruction(props: IInstructionalVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [open, setOpen] = useState(false);
	const [isFull, setFull] = useState(true);
	const [showVideo, setShowVideo] = useState(false);
	const { isFullScreen } = UseFullScreen();
	const { isSwitchMode } = UseSwitchVideo();
	const { transition, setTransitionToState } = UseTransitionTutorial();

	const { onTogglePauseVideo, currentExercise, isRepeat } = props;

	const { isBodyVisible, selectedScan, isAligned } = UseTutorialControls();

	useEffect(() => {
		if (isAligned) {
			setOpen(true);
			setFull(true);
			setShowVideo(false);
			const timer = setTimeout(() => {
				setShowVideo(true);
			}, 4500);

			return () => clearTimeout(timer);
		}
	}, [isAligned]);

	useEffect(() => {
		const t = setTimeout(() => {
			setTransitionToState(TransitionStates.CALIBRATION);
		}, 3500);

		return () => clearTimeout(t);
	}, []);

	// useEffect(() => {
	// 	if (!isAligned) {
	// 		setOpen(false);
	// 		setFull(false);
	// 		setShowVideo(false);
	// 		if (videoRef?.current) {
	// 			videoRef.current.currentTime = 0;
	// 			videoRef.current.pause();
	// 		}
	// 	}
	// }, [isAligned, videoRef]);

	const onToggleVideoOpened = () => {
		if (open && isFull) setFull(false);
		setOpen(!open);
	};

	const onended = () => {
		setFull(false);
		// if (open && isFull) setTransitionToState(TransitionStates.READYSETGO);
		if (transition?.value === TransitionStates.INTRO) {
			setTimeout(() => {
				setTransitionToState(TransitionStates.READYSETGO);
			}, 1500);
		}
		if (videoRef.current) videoRef.current.currentTime = 0;

		videoRef.current?.play();
	};

	if (!currentExercise && !isBodyVisible) return null;
	if (!selectedScan) return null;
	return (
		<>
			<Content
				className="md:w-[240px] lg:w-[300px] xl:w-[360px] 2xl:w-[420px]"
				style={{
					position: 'absolute',
					width: isSwitchMode || isFull ? '100%' : '',
					...(showVideo && {
						display: 'flex',
						alignItems: 'center',
					}),
					zIndex: isSwitchMode ? 3 : 4,
					backgroundColor: open
						? 'var(--color-neutral-purple-1000)'
						: 'transparent',
					opacity: 0.85,
					height: isFullScreen && (isSwitchMode || isFull) ? '100vh' : 'auto',
				}}>
				{/* {showVideo && (
					<video
						style={{
							visibility: open || isSwitchMode ? 'visible' : 'hidden',
							width: '100%',
							// aspectRatio: '4/2',
							height: 'auto',
							objectFit: 'contain',
						}}
						id="instructionalvideo"
						ref={videoRef}
						autoPlay
						muted
						loop={!isFull}
						preload="metadata"
						key={currentExercise?.id}
						src={currentExercise?.video?.url}
						onEnded={onended}
					/>
				)} */}
				{/* Navigation arrows removed */}\n
			</Content>
			{!showVideo && (
				<div
					style={{
						// overflow: 'hidden',
						// opacity: 0.85,
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'none',
						backgroundColor: 'transparent',
						zIndex: 10,
					}}>
					<TextAnimation
						text={selectedScan?.name?.toUpperCase()}
						bodySideTitle={selectedScan?.bodySideTitle?.toUpperCase()}
						movementTitle={selectedScan?.movementTitle?.toUpperCase()}
					/>
				</div>
			)}
		</>
	);
}

export default TutorialInstruction;
