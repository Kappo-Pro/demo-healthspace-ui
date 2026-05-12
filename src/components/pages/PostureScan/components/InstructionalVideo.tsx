import TextAnimation from '@atoms/TextAnimation/TextAnimation';
import { PostureView } from '@stores/interfaces';
import { Content } from 'antd/lib/layout/layout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PiArrowDownRightBold, PiArrowUpLeftBold } from 'react-icons/pi';
import { PosturalAnalytics, UseControls } from '../context/Controls.context';
import { UseFullScreen } from '../context/FullScreen.context';
import { UseInstructionalVideo } from '../context/InstructionalVideo.context';
import { UsePostureScreenAudio, CalibrationAudioState } from '../context/PostureScreen.context';
import { UseSwitchVideo } from '../context/SwitchVideo.context';
import { TransitionStates, UseTransition } from '../context/Transition.context';

function InstructionalVideo() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const { videoPaused, onTogglePause } = UseInstructionalVideo();
	const { isSwitchMode } = UseSwitchVideo();
	const { onNextTransition, transition } = UseTransition();
	const { onGetCurrent, isRepeat, onRepeat } = UseControls();
	const [videoPlayed, setVideoPlayed] = useState(false);
	const { isFullScreen } = UseFullScreen();
	const [singleMode, setSingleMode] = useState(false);

	const [open, setOpen] = useState(false);
	const [full, setFull] = useState(true);

	const current = onGetCurrent() as Partial<PosturalAnalytics>;

	const { playViewIntro, isPlaying, calibrationState } = UsePostureScreenAudio();
	const view = current?.view?.toLowerCase() as PostureView;
	const viewIndex = onGetCurrent(true) as number;

	// Track if intro audio has played for current view
	const introPlayedForViewRef = useRef<string | null>(null);

	// Minimum display time for intro title (ensures visibility even if audio fails due to autoplay policy)
	const MIN_INTRO_DISPLAY_MS = 3000;

	// Play intro audio during INTRO state and transition when complete
	// Title stays visible for duration of audio playback, with minimum fallback
	useEffect(() => {
		if (singleMode === false && transition?.value === TransitionStates.INTRO && current?.view) {
			// Prevent double-play for same view
			if (introPlayedForViewRef.current === current.view) {
				return;
			}
			introPlayedForViewRef.current = current.view;

			const playIntroAndTransition = async () => {
				const startTime = Date.now();
				await playViewIntro(viewIndex);
				// Ensure minimum display time (handles audio autoplay failures)
				const elapsed = Date.now() - startTime;
				if (elapsed < MIN_INTRO_DISPLAY_MS) {
					await new Promise(r => setTimeout(r, MIN_INTRO_DISPLAY_MS - elapsed));
				}
				onNextTransition();
			};
			playIntroAndTransition();
		}
	}, [singleMode, transition, current?.view, viewIndex, playViewIntro, onNextTransition]);

	// Reset intro played ref when view changes
	useEffect(() => {
		if (!current?.view) {
			introPlayedForViewRef.current = null;
		}
	}, [current?.view]);

	useEffect(() => {
		videoPaused ? videoRef.current?.pause() : videoRef.current?.play();
	}, [videoPaused]);

	const onToggleVideoOpened = () => {
		if (open && full) setFull(false);
		setOpen(!open);
	};

	const onended = useCallback(() => {
		setVideoPlayed(true);
		// Note: INTRO state transition is handled by playViewIntro effect above
		if (!isPlaying) {
			setFull(false);
			onTogglePause();
			if (open && full) onNextTransition();
		}
	}, [full, open, onNextTransition, onTogglePause, isPlaying]);

	useEffect(() => {
		if (current) {
			setOpen(true);
			setFull(true);
		}

		return () => {
			setOpen(false);
			setFull(true);
			setVideoPlayed(false);
		};
	}, [current]);

	useEffect(() => {
		if (videoRef?.current && isRepeat) {
			videoRef.current.currentTime = 0;
			videoRef.current.play();
			setOpen(true);
			setFull(true);
			onRepeat(false);
		}
	}, [isRepeat, videoRef, onRepeat]);

	if (!current) return null;
	return (
		<>
			{singleMode ? (
				<Content
					className="md:w-[180px] lg:w-[250px] xl:w-[330px] 2xl:w-[420px]"
					style={{
						position: 'absolute',
						width: isFullScreen && full ? '100%' : full ? '100%' : '',

						// width: full ? '100%' : '',
						zIndex: isSwitchMode ? 5 : 6,
						backgroundColor: open
							? 'var(--surface-overlay-dark)'
							: 'transparent',
						height: isFullScreen && full ? '97vh' : full ? '100%' : 'auto',
						opacity: 0.85,
						overflow: 'hidden',
					}}>
					<video
						style={{
							visibility: open || isSwitchMode ? 'visible' : 'hidden',
							width: '100%',
							height: isFullScreen && full ? '97vh' : full ? '100%' : 'auto',
							objectFit: 'cover',
						}}
						id="instructionalvideo"
						ref={videoRef}
						autoPlay
						muted
						preload="metadata"
						key={current?.video?.url}
						src={current?.video?.url}
						onEnded={onended}
					/>
					{!isSwitchMode &&
						(open ? (
							<PiArrowUpLeftBold
								size={40}
								style={{
									color: 'var(--text-color-on-dark)',
									position: 'absolute',
									right: 0,
									bottom: 0,
									backgroundColor: 'var(--brand-primary)',
									cursor: 'pointer',
								}}
								onClick={onToggleVideoOpened}
							/>
						) : (
							<PiArrowDownRightBold
								size={40}
								style={{
									color: 'var(--text-color-on-dark)',
									position: 'absolute',
									left: 0,
									top: 0,
									backgroundColor: 'var(--brand-primary)',
									cursor: 'pointer',
								}}
								onClick={onToggleVideoOpened}
							/>
						))}
				</Content>
			) : (
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
					{current?.view ? (
						<TextAnimation
							text={{
								front: 'FRONT VIEW',
								back: 'BACK VIEW',
								left: 'LEFT SIDE',
								right: 'RIGHT SIDE',
							}[current.view] || `${current.view.toUpperCase()} VIEW`}
							duration={10000}
						/>
					) : null}
				</div>
			)}
		</>
	);
}

export default InstructionalVideo;
