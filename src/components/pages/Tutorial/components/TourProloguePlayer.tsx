import {
	FullscreenExitOutlined,
	FullscreenOutlined,
	PauseCircleOutlined,
	PlayCircleOutlined,
} from '@ant-design/icons';

import { Button, Card, Col, Row } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReadyToBeginModal from './ReadyToBeginModal';
import { useVideoPreloader } from './cameraComponent/hooks/useVideoPreloader';

interface Props {
	onContinue: () => void;
}

const TourProloguePlayer: React.FC<Props> = ({ onContinue }) => {
	const [videoEnded, setVideoEnded] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [gateOpen, setGateOpen] = useState(true);

	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [time, setTime] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [countdown, setCountdown] = useState<number | null>(null);

	const [isBuffering, setIsBuffering] = useState(false);

	const BUFFER_AHEAD_S = 2; // how much to buffer before auto-play (feel free to tune)

	const bufferedAhead = (v: HTMLVideoElement | null) => {
		if (!v) return 0;
		const { buffered, currentTime } = v;
		for (let i = 0; i < buffered.length; i++) {
			const start = buffered.start(i);
			const end = buffered.end(i);
			if (currentTime >= start && currentTime <= end) return end - currentTime;
		}
		return 0;
	};

	const canStartSmoothly = (v: HTMLVideoElement | null) =>
		!!v &&
		(v.readyState >= 3 /* HAVE_FUTURE_DATA */ ||
			bufferedAhead(v) >= BUFFER_AHEAD_S);

	const hasStarted = useRef(false);

	const ensurePlaying = async () => {
		const v = videoRef.current;
		if (!v) return;

		// Only auto-play or buffer if user has actually started
		if (!hasStarted.current) return;

		// If we have enough data, try playing
		if (canStartSmoothly(v)) {
			try {
				await v.play();
				setIsBuffering(false);
			} catch {
				setIsBuffering(true);
			}
		} else {
			// Not enough data yet: show loader and wait for more
			setIsBuffering(true);
		}
	};

	const containerRef = useRef<HTMLDivElement>(null);

	const fmt = (s: number) => {
		const mm = Math.floor(s / 60)
			.toString()
			.padStart(2, '0');
		const ss = Math.floor(s % 60)
			.toString()
			.padStart(2, '0');
		return `${mm}:${ss}`;
	};

	const onLoadedMetadata = () => setDuration(videoRef.current?.duration ?? 0);
	const onTimeUpdate = () => setTime(videoRef.current?.currentTime ?? 0);

	const togglePlay = useCallback(async () => {
		const v = videoRef.current;
		if (!v) return;
		if (v.paused) {
			await v.play().catch(() => {});
		} else {
			v.pause();
		}
	}, []);

	// useEffect(() => {
	// 	if (typeof window === 'undefined') return;

	// 	const href = window.location.href.toLowerCase();
	// 	const shouldSkip = href.includes('sitting');

	// 	if (!shouldSkip) return;

	// 	setGateOpen(false);
	// 	setIsBuffering(false);

	// 	const v = videoRef.current;
	// 	try {
	// 		v?.pause();
	// 		v && (v.currentTime = 0);
	// 	} catch {}

	// 	onContinue();
	// }, [onContinue]);

	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);
		const onEnded = () => {
			setIsPlaying(false);
			// Auto-start a big 3-2-1 overlay, then continue
			setCountdown(3);
		};
		v.addEventListener('play', onPlay);
		v.addEventListener('pause', onPause);
		v.addEventListener('ended', onEnded);
		return () => {
			v.removeEventListener('play', onPlay);
			v.removeEventListener('pause', onPause);
			v.removeEventListener('ended', onEnded);
		};
	}, []);

	useEffect(() => {
		if (countdown === null) return;
		if (countdown <= 0) {
			setCountdown(null);
			onContinue(); // proceed automatically
			return;
		}
		const t = setTimeout(() => setCountdown(c => (c ?? 0) - 1), 1000);
		return () => clearTimeout(t);
	}, [countdown, onContinue]);

	const onSeek = (val: number) => {
		const v = videoRef.current;
		if (!v) return;
		v.currentTime = val;
		setTime(val);
	};

	const toggleFullscreen = async () => {
		const el = containerRef.current;
		if (!el) return;
		if (!document.fullscreenElement) {
			await el.requestFullscreen().catch(() => {});
			setIsFullscreen(true);
		} else {
			await document.exitFullscreen().catch(() => {});
			setIsFullscreen(false);
		}
	};

	useEffect(() => {
		const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener('fullscreenchange', onFsChange);
		return () => document.removeEventListener('fullscreenchange', onFsChange);
	}, []);

	/* Keyboard shortcuts: space(play/pause), f(fullscreen), arrows(seek) */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === ' ') {
				e.preventDefault();
				togglePlay();
			}
			if (e.key.toLowerCase() === 'f') {
				e.preventDefault();
				toggleFullscreen();
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				onSeek(Math.min((videoRef.current?.currentTime ?? 0) + 5, duration));
			}
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				onSeek(Math.max((videoRef.current?.currentTime ?? 0) - 5, 0));
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [duration, togglePlay]);

	// init defaults

	const handleBegin = () => {
		hasStarted.current = true;
		setGateOpen(false);
		setIsBuffering(true);

		// Kick a first attempt quickly after layout; if not ready yet,
		// listeners will retry when data arrives.
		setTimeout(() => {
			ensurePlaying();
		}, 50);
	};

	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;

		const syncGateWithPlayback = () => {
			// If the video is actually playing or has advanced, suppress the modal
			if (!v.paused && !v.ended && v.currentTime > 0) {
				setGateOpen(false);
				sessionStorage.setItem('tutorialStarted', '1');
			}
		};

		// Try once on mount, then listen for reliable events
		syncGateWithPlayback();
		v.addEventListener('play', syncGateWithPlayback);
		v.addEventListener('playing', syncGateWithPlayback);
		v.addEventListener('loadeddata', syncGateWithPlayback);

		return () => {
			v.removeEventListener('play', syncGateWithPlayback);
			v.removeEventListener('playing', syncGateWithPlayback);
			v.removeEventListener('loadeddata', syncGateWithPlayback);
		};
	}, [videoRef.current]);

	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;

		const onWaiting = () => setIsBuffering(true);
		const onStalled = () => setIsBuffering(true);
		const onPlaying = () => {
			setIsBuffering(false), setGateOpen(false);
		};
		const onCanPlay = () => ensurePlaying(); // we got enough to start soon
		const onProgress = () => ensurePlaying(); // more bytes arrived
		const onLoadedData = () => ensurePlaying(); // first frame available

		v.addEventListener('waiting', onWaiting);
		v.addEventListener('stalled', onStalled);
		v.addEventListener('playing', onPlaying);
		v.addEventListener('canplay', onCanPlay);
		v.addEventListener('progress', onProgress);
		v.addEventListener('loadeddata', onLoadedData);

		return () => {
			v.removeEventListener('waiting', onWaiting);
			v.removeEventListener('stalled', onStalled);
			v.removeEventListener('playing', onPlaying);
			v.removeEventListener('canplay', onCanPlay);
			v.removeEventListener('progress', onProgress);
			v.removeEventListener('loadeddata', onLoadedData);
		};
	}, []);

	// const firebaseUrl =
	// 	'https://firebasestorage.googleapis.com/v0/b/vitalflow-1eee1.firebasestorage.app/o/Janelle_Final.mp4?alt=media&token=4c929209-c09d-475b-8c8a-00cf9c0d2bfe';
	const firebaseUrl =
		'https://risecxlibrary.blob.core.windows.net/tour-videos/Janelle_Final.mp4';

	const { src: preloadedSrc, state } = useVideoPreloader(firebaseUrl);
	const videoSrc: string | undefined = preloadedSrc ?? firebaseUrl;

	const handleSkip = async () => {
		if (document.fullscreenElement) {
			try {
				await document.exitFullscreen();
			} catch {
			}
		}
		onContinue();
	};

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 0,
				background: 'transparent',
				overflow: 'hidden',
			}}>
			<Card
				style={{
					width: '100%',
					height: '100%',
					// height: 'min(820px, calc(100vh - clamp(12px, 2.5vw, 24px)*2))',
					// aspectRatio: ASPECT_RATIO_4_3,
					borderRadius: 12,
					boxShadow: '0 2px 12px var(--color-black-alpha-10)',
					display: 'flex',
					flexDirection: 'column',
					padding: 0,
				}}
				bodyStyle={{
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					padding: 0,
				}}>
				<div
					style={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						padding: 'clamp(12px, 2vw, 20px)',
						gap: 'clamp(12px, 2vw, 20px)',
					}}>
					{/* <div
						style={{
							position: 'relative',
							width: '100%',
							flex: 1, // fill remaining height
							borderRadius: 12,
							overflow: 'hidden',
					{/* <div
						style={{
							position: 'relative',
							width: '100%',
							flex: 1, // fill remaining height
							borderRadius: 12,
							overflow: 'hidden',
							background: 'var(--color-black)',
						}}>
						}}>
						<video
							ref={videoRef}
							style={{
								display: 'block',
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								aspectRatio: '16 / 9',
							}}
							// controls
							preload="metadata"
							src={`/ai-agents/${assistants[0].name}/Jessica.mp4`}
							onEnded={() => setVideoEnded(true)}
							onError={() => undefined}
						/>
					</div> */}

					<div
						ref={containerRef}
						className="cs-player"
						style={{ position: 'relative', width: '100%', flex: 1 }}>
						<video
							ref={videoRef}
							style={{
								display: 'block',
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								aspectRatio: '16/9',
							}}
							playsInline
							preload="auto"
							crossOrigin="anonymous"
							src={videoSrc}
							onLoadedMetadata={onLoadedMetadata}
							onTimeUpdate={onTimeUpdate}
							onError={e => {
								const v = e.currentTarget as HTMLVideoElement;
							}}
						/>

						{countdown !== null && (
							<div className="cs-countdown">
								<div className="cs-countdown__num">{countdown || 1}</div>
							</div>
						)}
						<button
							type="button"
							className="cs-skip"
							onClick={handleSkip}
							aria-label="Skip intro and begin the guided tour">
							Skip
						</button>
						{isBuffering && (
							<div
								className="cs-loader"
								role="status"
								aria-live="polite"
								aria-label="Loading video">
								<div className="cs-spinner" />
								{/* <div className="cs-loader__text">Loading…</div> */}
							</div>
						)}

						<div className="cs-player__controls">
							<button
								className="cs-player__btn"
								onClick={togglePlay}
								aria-label={isPlaying ? 'Pause' : 'Play'}>
								{isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}{' '}
								&nbsp;
								{isPlaying ? 'Pause' : 'Play'}
							</button>

							<div className="cs-player__track">
								<input
									className="cs-player__seek"
									type="range"
									min={0}
									max={Math.max(duration, 0.0001)}
									step={0.05}
									value={time}
									onChange={e => onSeek(parseFloat(e.target.value))}
									style={{
										['--p' as unknown]: `${duration ? (time / duration) * 100 : 0}%`,
									}}
									aria-label="Seek"
								/>
								<span className="cs-player__time">
									{fmt(time)} / {fmt(duration || 0)}
								</span>
							</div>

							{/* Right: Fullscreen */}
							<button
								className="cs-player__btn"
								onClick={toggleFullscreen}
								aria-label={
									isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'
								}>
								{isFullscreen ? (
									<FullscreenExitOutlined />
								) : (
									<FullscreenOutlined />
								)}{' '}
								&nbsp;
								{isFullscreen ? 'Exit' : 'Fullscreen'}
							</button>
						</div>
					</div>
					{!isFullscreen && (
						<Row justify="center" align="top">
							<Col span={24}>
								<Button
									type="primary"
									size="large"
									style={{
										width: '100%',
										alignSelf: 'stretch',
										height: 'clamp(44px, 6vh, 56px)',
										fontSize: 'clamp(14px, 1.8vw, 18px)',
										marginTop: 'auto',
									}}
									onClick={() => onContinue()}>
									Skip
								</Button>
							</Col>
						</Row>
					)}
				</div>
			</Card>
			<ReadyToBeginModal open={gateOpen} onBegin={handleBegin} />
		</div>
	);
};

export default TourProloguePlayer;
