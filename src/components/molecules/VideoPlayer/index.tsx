import React, { useRef, useState, useEffect } from 'react';
import { Flex, Button, Slider, Tooltip } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './VideoPlayer.css';

export interface VideoPlayerProps {
	/** Video source URL */
	videoUrl: string;
	/** Poster image URL */
	posterUrl?: string;
	/** Captions/subtitles URL (WebVTT format) */
	captionsUrl?: string;
	/** Enable loop playback */
	loop?: boolean;
	/** Initial playback speed */
	initialSpeed?: number;
	/** Show custom controls */
	showControls?: boolean;
	/** Autoplay video */
	autoPlay?: boolean;
	/** Muted */
	muted?: boolean;
	/** Class name */
	className?: string;
	/** Callback when video ends */
	onEnded?: () => void;
	/** Callback when video plays */
	onPlay?: () => void;
	/** Callback when video pauses */
	onPause?: () => void;
}

/**
 * VideoPlayer - Custom HTML5 video player with accessible controls (Story 2.3)
 *
 * Features:
 * - Playback speed control (0.5x, 1x, 1.5x)
 * - Loop toggle
 * - Closed captions support
 * - Keyboard shortcuts (Space, F, arrows, M, L)
 * - Fullscreen mode
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <VideoPlayer
 *   videoUrl="/exercises/shoulder-stretch.mp4"
 *   posterUrl="/exercises/shoulder-stretch.jpg"
 *   captionsUrl="/exercises/shoulder-stretch.vtt"
 *   loop
 * />
 * ```
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
	videoUrl,
	posterUrl,
	captionsUrl,
	loop = false,
	initialSpeed = 1,
	showControls = true,
	autoPlay = false,
	muted = false,
	className = '',
	onEnded,
	onPlay,
	onPause,
}) => {
	const { t } = useTypedTranslation();
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(100);
	const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
	const [isLooping, setIsLooping] = useState(loop);
	const [showCaptions, setShowCaptions] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Handle play/pause
	const togglePlayPause = () => {
		if (!videoRef.current) return;

		if (isPlaying) {
			videoRef.current.pause();
			setIsPlaying(false);
			onPause?.();
		} else {
			videoRef.current.play();
			setIsPlaying(true);
			onPlay?.();
		}
	};

	// Update time display
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleTimeUpdate = () => {
			setCurrentTime(video.currentTime);
		};

		const handleLoadedMetadata = () => {
			setDuration(video.duration);
		};

		const handleEnded = () => {
			setIsPlaying(false);
			onEnded?.();
		};

		video.addEventListener('timeupdate', handleTimeUpdate);
		video.addEventListener('loadedmetadata', handleLoadedMetadata);
		video.addEventListener('ended', handleEnded);

		return () => {
			video.removeEventListener('timeupdate', handleTimeUpdate);
			video.removeEventListener('loadedmetadata', handleLoadedMetadata);
			video.removeEventListener('ended', handleEnded);
		};
	}, [onEnded]);

	// Handle seek
	const handleSeek = (value: number) => {
		if (!videoRef.current) return;
		videoRef.current.currentTime = value;
		setCurrentTime(value);
	};

	// Handle volume change
	const handleVolumeChange = (value: number) => {
		if (!videoRef.current) return;
		videoRef.current.volume = value / 100;
		setVolume(value);
	};

	// Handle playback speed
	const handleSpeedChange = (speed: number) => {
		if (!videoRef.current) return;
		videoRef.current.playbackRate = speed;
		setPlaybackSpeed(speed);
	};

	// Toggle loop
	const toggleLoop = () => {
		setIsLooping(!isLooping);
	};

	// Toggle captions
	const toggleCaptions = () => {
		if (!videoRef.current) return;
		const tracks = videoRef.current.textTracks;
		if (tracks.length > 0) {
			tracks[0].mode = showCaptions ? 'hidden' : 'showing';
			setShowCaptions(!showCaptions);
		}
	};

	// Toggle fullscreen
	const toggleFullscreen = () => {
		if (!containerRef.current) return;

		if (!isFullscreen) {
			if (containerRef.current.requestFullscreen) {
				containerRef.current.requestFullscreen();
			}
			setIsFullscreen(true);
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
			setIsFullscreen(false);
		}
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (!videoRef.current) return;

			switch (e.key) {
				case ' ':
					e.preventDefault();
					togglePlayPause();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					videoRef.current.currentTime = Math.max(
						0,
						videoRef.current.currentTime - 5,
					);
					break;
				case 'ArrowRight':
					e.preventDefault();
					videoRef.current.currentTime = Math.min(
						duration,
						videoRef.current.currentTime + 5,
					);
					break;
				case 'ArrowUp':
					e.preventDefault();
					handleVolumeChange(Math.min(100, volume + 10));
					break;
				case 'ArrowDown':
					e.preventDefault();
					handleVolumeChange(Math.max(0, volume - 10));
					break;
				case 'f':
				case 'F':
					e.preventDefault();
					toggleFullscreen();
					break;
				case 'm':
				case 'M':
					e.preventDefault();
					handleVolumeChange(volume > 0 ? 0 : 100);
					break;
				case 'l':
				case 'L':
					e.preventDefault();
					toggleLoop();
					break;
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPlaying, volume, duration]);

	// Format time display
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div
			ref={containerRef}
			className={`video-player-container ${className}`}
			style={{ position: 'relative', width: '100%' }}>
			<video
				ref={videoRef}
				src={videoUrl}
				poster={posterUrl}
				loop={isLooping}
				autoPlay={autoPlay}
				muted={muted}
				preload="metadata"
				controlsList="nodownload"
				style={{
					width: '100%',
					height: 'auto',
					display: 'block',
					borderRadius: 'var(--radius-lg)',
				}}
				aria-label={t('common.videoPlayer.videoDemo')}>
				{captionsUrl && (
					<track
						kind="captions"
						src={captionsUrl}
						srcLang="en"
						label={t('common.videoPlayer.captionLanguageEnglish')}
						default
					/>
				)}
				{t('common.videoPlayer.browserNotSupported')}
			</video>

			{showControls && (
				<Flex
					vertical
					gap={8}
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						padding: 'var(--spacing-4)',
						background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
						borderBottomLeftRadius: '8px',
						borderBottomRightRadius: '8px',
					}}>
					{/* Progress bar */}
					<Slider
						min={0}
						max={duration}
						step={0.1}
						value={currentTime}
						onChange={handleSeek}
						tooltip={{ formatter: formatTime }}
						style={{ margin: 0 }}
						aria-label={t('common.videoPlayer.videoProgress')}
					/>

					{/* Controls */}
					<Flex justify="space-between" align="center">
						<Flex gap={8} align="center">
							{/* Play/Pause */}
							<Button
								type="text"
								icon={
									isPlaying ? (
										<UntitledIcon name="playCircle" size={24} />
									) : (
										<UntitledIcon name="playCircle" size={24} />
									)
								}
								onClick={togglePlayPause}
								style={{ color: 'var(--color-text-inverse)' }}
								aria-label={
									isPlaying
										? t('common.videoPlayer.pause')
										: t('common.videoPlayer.play')
								}
							/>

							{/* Time */}
							<span
								style={{ color: 'var(--color-text-inverse)', fontSize: 14 }}>
								{formatTime(currentTime)} / {formatTime(duration)}
							</span>
						</Flex>

						<Flex gap={8} align="center">
							{/* Playback speed */}
							<Flex gap={4}>
								{[0.5, 1, 1.5].map(speed => (
									<Button
										key={speed}
										type={playbackSpeed === speed ? 'primary' : 'text'}
										size="small"
										onClick={() => handleSpeedChange(speed)}
										style={
											playbackSpeed !== speed
												? { color: 'var(--color-text-inverse)' }
												: undefined
										}
										aria-label={t('common.videoPlayer.playbackSpeed', {
											speed,
										})}>
										{speed}x
									</Button>
								))}
							</Flex>

							{/* Loop */}
							<Tooltip title={t('common.videoPlayer.loop')}>
								<Button
									type={isLooping ? 'primary' : 'text'}
									icon={<UntitledIcon name="reload" size={16} />}
									onClick={toggleLoop}
									style={
										!isLooping
											? { color: 'var(--color-text-inverse)' }
											: undefined
									}
									aria-label={t('common.videoPlayer.toggleLoop')}
									aria-pressed={isLooping}
								/>
							</Tooltip>

							{/* Captions */}
							{captionsUrl && (
								<Tooltip title={t('common.videoPlayer.captions')}>
									<Button
										type={showCaptions ? 'primary' : 'text'}
										icon={<UntitledIcon name="fileText" size={16} />}
										onClick={toggleCaptions}
										style={
											!showCaptions
												? { color: 'var(--color-text-inverse)' }
												: undefined
										}
										aria-label={t('common.videoPlayer.toggleCaptions')}
										aria-pressed={showCaptions}
									/>
								</Tooltip>
							)}

							{/* Volume */}
							<Flex align="center" gap={8} style={{ width: 100 }}>
								<UntitledIcon name="audio" size={16} style={{ color: 'var(--color-text-inverse)' }} />
								<Slider
									min={0}
									max={100}
									step={1}
									value={volume}
									onChange={handleVolumeChange}
									style={{ flex: 1, margin: 0 }}
									aria-label={t('common.videoPlayer.volume')}
								/>
							</Flex>

							{/* Fullscreen */}
							<Tooltip title={t('common.videoPlayer.fullscreenWithKey')}>
								<Button
									type="text"
									icon={<UntitledIcon name="plus" size={16} />}
									onClick={toggleFullscreen}
									style={{ color: 'var(--color-text-inverse)' }}
									aria-label={t('common.videoPlayer.fullscreen')}
								/>
							</Tooltip>
						</Flex>
					</Flex>
				</Flex>
			)}
		</div>
	);
};
