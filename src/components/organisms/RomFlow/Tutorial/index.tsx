import { useTypedDispatch } from '@stores/index';
import { Button, Flex, Spin } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ITutorialProps {
	onToggleTutorial: () => void;
	aspectRatio: string;
	volume?: number;
	isMuted?: boolean;
	isPaused?: boolean;
}

const Tutorial = (props: ITutorialProps) => {
	const { onToggleTutorial, aspectRatio, volume = 100, isMuted = false, isPaused = false } = props;
	const [loading, setLoading] = useState(true);
	const videoRef = useRef<HTMLVideoElement>(null);
	const onToggleTutorialRef = useRef(onToggleTutorial);
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();

	// Keep ref updated
	useEffect(() => {
		onToggleTutorialRef.current = onToggleTutorial;
	}, [onToggleTutorial]);

	// Set up video event handlers once on mount
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleLoadedMetadata = () => {
			setLoading(false);
		};

		const handleEnded = () => {
			setLoading(false);
			onToggleTutorialRef.current();
		};

		video.addEventListener('loadedmetadata', handleLoadedMetadata);
		video.addEventListener('ended', handleEnded);

		return () => {
			video.removeEventListener('loadedmetadata', handleLoadedMetadata);
			video.removeEventListener('ended', handleEnded);
		};
	}, []); // Empty deps - only run once on mount

	// Apply volume and mute changes without restarting video
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.volume = volume / 100;
			videoRef.current.muted = isMuted;
		}
	}, [volume, isMuted]);

	// Handle play/pause
	useEffect(() => {
		if (videoRef.current) {
			if (isPaused) {
				videoRef.current.pause();
			} else {
				videoRef.current.play().catch(() => {
					// Ignore play errors (e.g., if video not loaded yet)
				});
			}
		}
	}, [isPaused]);

	return (
		<Content
			style={{
				position: 'relative',
				aspectRatio,
				overflow: 'hidden',
				zIndex: 10,
			}}>
			{loading && (
				<Flex
					justify="center"
					align="center"
					style={{
						backgroundColor: 'var(--surface-overlay)',
						aspectRatio,
						width: '100%',
					}}>
					<Spin spinning={loading} size={'large'} />
				</Flex>
			)}
			<video
				ref={videoRef}
				autoPlay
				preload="metadata"
				src="https://risecxlibrary.blob.core.windows.net/coach/tutorial.mp4"
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					position: 'absolute',
					top: 0,
					left: 0,
				}}
			/>
			<Button
				onClick={onToggleTutorial}
				style={{ position: 'absolute', top: '50%', right: 30, transform: 'translateY(-50%)' }}>
				{t('Patient.data.vitalscan-rom.skipTutorial')}
			</Button>
		</Content>
	);
};

export default Tutorial;
