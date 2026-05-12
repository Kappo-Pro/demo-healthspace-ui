import { Typography } from 'antd';
import { useRef, useState, useCallback } from 'react';
import './style.css';

const { Paragraph } = Typography;

interface VideoCardProps {
	videoSrc: string;
	posterSrc: string;
	title: string;
	description: string;
	onClick?: () => void;
	comingSoon?: boolean;
	comingSoonText?: string;
}

export function VideoCard({
	videoSrc,
	posterSrc,
	title,
	description,
	onClick,
	comingSoon = false,
	comingSoonText = 'Coming Soon',
}: VideoCardProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isHovering, setIsHovering] = useState(false);
	const [isVideoLoaded, setIsVideoLoaded] = useState(false);

	const handleMouseEnter = useCallback(() => {
		setIsHovering(true);
		if (videoRef.current) {
			videoRef.current.currentTime = 0;
			videoRef.current.play().catch(() => {
				// Autoplay might be blocked, ignore error
			});
		}
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsHovering(false);
		if (videoRef.current) {
			videoRef.current.pause();
			videoRef.current.currentTime = 0;
		}
	}, []);

	const handleVideoLoaded = useCallback(() => {
		setIsVideoLoaded(true);
	}, []);

	return (
		<div
			className={`video-card ${comingSoon ? 'video-card--coming-soon' : ''} ${isHovering ? 'video-card--hovering' : ''}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={comingSoon ? undefined : onClick}
		>
			{/* Border Beam Effect */}
			<div className="video-card__beam video-card__beam--1" />
			<div className="video-card__beam video-card__beam--2" />

			{/* Poster Image */}
			<img
				src={posterSrc}
				alt={title}
				className={`video-card__poster ${isHovering && isVideoLoaded ? 'video-card__poster--hidden' : ''}`}
				loading="lazy"
			/>

			{/* Video (preloaded on hover) */}
			<video
				ref={videoRef}
				src={videoSrc}
				className={`video-card__video ${isHovering && isVideoLoaded ? 'video-card__video--visible' : ''}`}
				muted
				loop
				playsInline
				preload="metadata"
				onLoadedData={handleVideoLoaded}
			/>

			{/* Content Overlay */}
			<div className="video-card__content">
				{comingSoon && (
					<span className="video-card__badge">{comingSoonText}</span>
				)}
				<h3 className="video-card__title">{title}</h3>
				<Paragraph className="video-card__description">{description}</Paragraph>
			</div>
		</div>
	);
}

export default VideoCard;
