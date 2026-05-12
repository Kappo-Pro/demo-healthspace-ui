import {
	BackwardOutlined,
	ForwardOutlined,
	PauseCircleOutlined,
	PlayCircleOutlined,
	SoundOutlined,
} from '@ant-design/icons';
import { Flex } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface VideoPlayerProps {
	video: File | null | Blob;
	className: string;
	controls: boolean;
}

const VideoPlayer = React.memo(
	({ video, className, controls }: VideoPlayerProps) => {
		const videoRef = useRef<HTMLVideoElement>(null);
		const [isPlaying, setIsPlaying] = useState(false);
		const [isMuted, setIsMuted] = useState(true);

		const videoUrl = useMemo(() => {
			if (!video) return null;
			return URL.createObjectURL(video);
		}, [video]);

		useEffect(() => {
			const videoElement = videoRef.current;
			return () => {
				// Stop video playback on unmount
				if (videoElement) {
					videoElement.pause();
					videoElement.src = '';
					videoElement.load();
				}
				if (videoUrl) {
					URL.revokeObjectURL(videoUrl);
				}
			};
		}, [videoUrl]);

		const togglePlay = () => {
			if (videoRef.current) {
				if (isPlaying) {
					videoRef.current.pause();
				} else {
					videoRef.current.play();
				}
				setIsPlaying(!isPlaying);
			}
		};

		const toggleMute = () => {
			if (videoRef.current) {
				videoRef.current.muted = !isMuted;
				setIsMuted(!isMuted);
			}
		};

		const skipForward = () => {
			if (videoRef.current) {
				videoRef.current.currentTime = Math.min(
					videoRef.current.currentTime + 15,
					videoRef.current.duration,
				);
				videoRef.current.play();
				setIsPlaying(true);
			}
		};

		const skipBackward = () => {
			if (videoRef.current) {
				videoRef.current.currentTime = Math.max(
					videoRef.current.currentTime - 15,
					0,
				);
				videoRef.current.play();
				setIsPlaying(true);
			}
		};

		const handleVideoEnd = () => {
			setIsPlaying(false);
		};

		if (!videoUrl) return null;

		// Simple video without controls (thumbnail view)
		if (!controls) {
			return (
				<video
					src={videoUrl}
					muted
					className={className}
					playsInline
				/>
			);
		}

		// Video with custom controls (modal view)
		return (
			<div className={className} style={{ position: 'relative' }}>
				<video
					ref={videoRef}
					src={videoUrl}
					muted={isMuted}
					playsInline
					onEnded={handleVideoEnd}
					style={{ width: '100%', height: '100%', objectFit: 'contain' }}
				/>
				<Flex
					justify="center"
					align="center"
					gap={24}
					style={{
						position: 'absolute',
						bottom: 16,
						left: '50%',
						transform: 'translateX(-50%)',
						background: 'rgba(0, 0, 0, 0.6)',
						borderRadius: 'var(--radius-full)',
						padding: '8px 20px',
					}}>
					<BackwardOutlined
						onClick={skipBackward}
						style={{
							fontSize: 24,
							color: 'var(--color-white)',
							cursor: 'pointer',
						}}
					/>
					{isPlaying ? (
						<PauseCircleOutlined
							onClick={togglePlay}
							style={{
								fontSize: 32,
								color: 'var(--color-white)',
								cursor: 'pointer',
							}}
						/>
					) : (
						<PlayCircleOutlined
							onClick={togglePlay}
							style={{
								fontSize: 32,
								color: 'var(--color-white)',
								cursor: 'pointer',
							}}
						/>
					)}
					<ForwardOutlined
						onClick={skipForward}
						style={{
							fontSize: 24,
							color: 'var(--color-white)',
							cursor: 'pointer',
						}}
					/>
					<SoundOutlined
						onClick={toggleMute}
						style={{
							fontSize: 24,
							color: isMuted
								? 'var(--color-gray-400)'
								: 'var(--color-white)',
							cursor: 'pointer',
						}}
					/>
				</Flex>
			</div>
		);
	},
);

export default VideoPlayer;
