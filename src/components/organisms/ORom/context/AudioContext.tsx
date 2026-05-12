import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'antd';

type SoundType = 'counter' | 'screenshot';

interface IAudioContext {
	isUnlocked: boolean;
	requestUnlock: () => void;
	playSound: (type: SoundType) => void;
	speak: (text: string, volume?: number) => void;
}

const AudioContext = createContext<IAudioContext>({
	isUnlocked: false,
	requestUnlock: () => {},
	playSound: () => {},
	speak: () => {},
});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
	const counterRef = useRef<HTMLAudioElement>(null);
	const screenshotRef = useRef<HTMLAudioElement>(null);

	const [isUnlocked, setUnlocked] = useState(false);
	const [showPrompt, setShowPrompt] = useState(false);

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	// const isScanPage =
	// 	typeof window !== 'undefined' && window.location.pathname.includes('rom');

	useEffect(() => {
		if (isIpad) {
			setShowPrompt(true);
		}
	}, []);

	const requestUnlock = () => {
		const tryPlay = (ref: HTMLAudioElement | null) => {
			if (!ref) return;
			ref
				.play()
				.then(() => {
					ref.pause();
					ref.currentTime = 0;
				})
				.catch(err => console.warn('Audio play failed:', err));
		};

		tryPlay(counterRef.current);
		tryPlay(screenshotRef.current);

		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance('');
			utterance.volume = 0.5;
			window.speechSynthesis.cancel();
			window.speechSynthesis.speak(utterance);
		}

		setUnlocked(true);
		setShowPrompt(false);
	};

	const playSound = (type: SoundType) => {
		if (!isUnlocked) return;
		const ref = type === 'counter' ? counterRef.current : screenshotRef.current;
		if (ref) {
			ref.currentTime = 0;
			ref.play().catch(err => console.warn(`🔇 Cannot play ${type}:`, err));
		}
	};

	const speak = (text: string, volume = 1) => {
		if (!isUnlocked || !text || !('speechSynthesis' in window)) return;
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.volume = volume;
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utterance);
	};

	return (
		<AudioContext.Provider
			value={{ isUnlocked, requestUnlock, playSound, speak }}>
			<audio ref={counterRef} src="/assets/counterSound.mp3" preload="auto" />
			<audio
				ref={screenshotRef}
				src="/assets/screenshotSound.mp3"
				preload="auto"
			/>

			<Modal
				open={showPrompt}
				closable={false}
				maskClosable={false}
				centered
				footer={null}>
				<div style={{ textAlign: 'center', padding: 'var(--spacing-2-5) 0' }}>
					<h3>
						<strong>Enable Audio</strong>
					</h3>
					<p style={{ padding: 'var(--spacing-5)', fontSize: 'var(--font-size-sm)' }}>
						Please enable audio by clicking below to proceed with instructions
					</p>
					<Button
						type="primary"
						onClick={requestUnlock}
						style={{ marginTop: 'var(--spacing-2-5)' }}>
						Enable Audio
					</Button>
				</div>
			</Modal>

			{children}
		</AudioContext.Provider>
	);
};
