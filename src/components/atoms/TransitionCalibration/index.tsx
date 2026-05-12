import { useAudio } from '@organisms/RomFlow/context/AudioContext';
import {
	PosturalAnalytics,
	UseControls,
} from '@pages/PostureScan/context/Controls.context';
import { Flex } from 'antd';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import animationData from './coord.json';

function TransitionCalibration({
	label = 'STEP BACK',
	postureScan = false,
	externalVolume,
	externalMuted,
}: {
	label?: string;
	postureScan?: boolean;
	/** External volume control (0-100) from parent - when provided, overrides internal state */
	externalVolume?: number;
	/** External mute control from parent - when provided, overrides internal state */
	externalMuted?: boolean;
}) {
	const { isPersonInBox, isAligned, onGetCurrent } =
		UseControls();
	const lottieRef = useRef<LottieRefCurrentProps>(null);
	const [animationKey, setAnimationKey] = useState(0);
	const [internalVolume] = useState(100);
	const [internalMuted] = useState(false);
	const savedVolume = useRef(1);
	const { speak } = useAudio();
	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	// Use external values when provided, otherwise use internal state
	const volume = externalVolume ?? internalVolume;
	const muted = externalMuted ?? internalMuted;

	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Track current volume/muted in refs for real-time access during playback
	const volumeRef = useRef(volume);
	const mutedRef = useRef(muted);

	// Keep refs in sync with volume/muted (whether internal or external)
	useEffect(() => {
		volumeRef.current = volume;
		mutedRef.current = muted;
		// Also update audio element immediately when volume/muted changes
		if (audioRef.current) {
			const newVolume = muted ? 0 : volume / 100;
			audioRef.current.volume = newVolume;
			audioRef.current.muted = muted;
		}
	}, [volume, muted]);

	// Initialize audio element once and keep reference
	useEffect(() => {
		const audio = new Audio('/ai-agents/Jessica/common/frame.mp3');
		audio.preload = 'auto';
		audioRef.current = audio;

		// Apply initial volume once audio is ready
		const handleCanPlay = () => {
			audio.volume = mutedRef.current ? 0 : volumeRef.current / 100;
			audio.muted = mutedRef.current;
		};
		audio.addEventListener('canplaythrough', handleCanPlay);

		// Sync volume continuously during playback
		const syncVolume = () => {
			audio.volume = mutedRef.current ? 0 : volumeRef.current / 100;
			audio.muted = mutedRef.current;
		};
		audio.addEventListener('timeupdate', syncVolume);

		// Handle loading errors
		const handleError = (e: Event) => {
			console.error('Audio load error:', e);
		};
		audio.addEventListener('error', handleError);

		return () => {
			audio.removeEventListener('canplaythrough', handleCanPlay);
			audio.removeEventListener('timeupdate', syncVolume);
			audio.removeEventListener('error', handleError);
			audio.pause();
			audio.src = '';
		};
	}, []);

	const readLabel = useCallback(
		(labelText = 'STEP BACK') => {
			// Play frame.mp3 for any "STEP BACK" message (including leg exercises with additional text)
			if (labelText.startsWith('STEP BACK')) {
				const audio = audioRef.current;
				if (audio) {
					// Always apply current volume before playing
					const effectiveVolume = mutedRef.current ? 0 : volumeRef.current / 100;
					audio.volume = effectiveVolume;
					audio.muted = mutedRef.current;
					audio.currentTime = 0; // Reset to start
					audio
						.play()
						.then(() => {
							// Ensure volume is set after play starts (some browsers reset on play)
							audio.volume = effectiveVolume;
							audio.muted = mutedRef.current;
						})
						.catch(e => console.error('Error playing audio:', e));
				}
				return;
			}

			if (isIpad && !mutedRef.current) {
				speak(labelText, savedVolume.current);
				return;
			}
			if ('speechSynthesis' in window) {
				window.speechSynthesis.cancel();
				const utterance = new SpeechSynthesisUtterance(labelText);
				utterance.volume = mutedRef.current ? 0 : volumeRef.current / 100;
				window.speechSynthesis.speak(utterance);
			} else {
				// Silently handle unsupported speech synthesis
				// Context: Speech synthesis not available in this browser - non-critical feature
			}
		},
		[isIpad, speak],
	);

	const current = onGetCurrent() as Partial<PosturalAnalytics>;

	const Instructions = {
		GET_IN_BOX: 'Please Center Yourself in the Box',
		TURN: `Turn ${current?.view}`,
	};
	useEffect(() => {
		let message = '';
		if (postureScan === true) {
			if (!isPersonInBox) {
				message = Instructions.GET_IN_BOX;
			} else if (!isAligned) {
				message = Instructions.TURN;
			}
		} else {
			message = label;
		}

		const intervalId = setInterval(() => {
			readLabel(message);
		}, 5000);

		return () => clearInterval(intervalId);
	}, [
		isPersonInBox,
		isAligned,
		postureScan,
		Instructions.GET_IN_BOX,
		Instructions.TURN,
		label,
		readLabel,
	]);

	useEffect(() => {
		if (!postureScan) {
			setAnimationKey(prev => prev + 1);
		}
	}, [postureScan, label]);

	return (
		<>
			{/* Semi-transparent purple overlay - camera feed visible behind */}
			<Flex
				justify="center"
				align="center"
				className="w-full h-full"
				style={{
					position: 'absolute',
					zIndex: 10,
					backgroundColor: 'var(--color-black-alpha-50)'
				}}>
				<Flex align="center" justify="center">
					{postureScan ? (
						<div>
							{!isPersonInBox ? (
								<p
									style={{
										fontSize: '52px',
										fontWeight: 'bold',
										color: 'var(--color-white)',
										padding: 15,
										textShadow: 'var(--shadow-text-on-media)',
									}}>
									{Instructions.GET_IN_BOX}
								</p>
							) : (
								!isAligned && (
									<p
										style={{
											fontSize: '52px',
											fontWeight: 'bold',
											color: 'var(--color-white)',
											padding: 15,
											textShadow: 'var(--shadow-text-on-media)',
										}}>
										{Instructions.TURN}
									</p>
								)
							)}
						</div>
					) : (
						<div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							{/* Purple bordered frame as per Figma design - transparent inside to show camera feed */}
							<div
								style={{
									position: 'relative',
									width: 'min(500px, 55vh)',
									height: 'min(850px, 92vh)',
									borderRadius: '10.829px',
									border: '1.354px solid var(--brand-primary)',
									background: 'var(--color-purple-alpha-15)',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									overflow: 'hidden',
								}}>
								{/* Body silhouette animation */}
								<Lottie
									key={animationKey}
									lottieRef={lottieRef}
									style={{
										height: '100%',
										width: '100%',
										position: 'absolute',
										top: '5%',
										left: 0,
										transform: 'scale(1.2)',
									}}
									loop={true}
									autoplay={true}
									animationData={animationData}
								/>
							</div>
						</div>
					)}
				</Flex>
			</Flex>
		</>
	);
}

export default TransitionCalibration;
