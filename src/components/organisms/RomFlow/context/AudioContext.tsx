/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'antd';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();
	const counterRef = useRef<HTMLAudioElement>(null);
	const screenshotRef = useRef<HTMLAudioElement>(null);

	const [isUnlocked, setUnlocked] = useState(false);
	const [showPrompt, setShowPrompt] = useState(false);

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	// const isScanPage =
	//   typeof window !== 'undefined' && window.location.pathname.includes('rom');

	useEffect(() => {
		if (isIpad) {
			setShowPrompt(true);
		}
	}, [isIpad]);

	const requestUnlock = () => {
		const tryPlay = (ref: HTMLAudioElement | null) => {
			if (!ref) return;
			ref.play().then(() => {
				ref.pause();
				ref.currentTime = 0;
			});
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
						<strong>
							{t('Patient.data.vitalscan-rom.audioContext.enableAudio')}
						</strong>
					</h3>
					<p style={{ padding: 'var(--spacing-5)', fontSize: 'var(--font-size-sm)' }}>
						{t('Patient.data.vitalscan-rom.audioContext.enableAudioDescription')}
					</p>
					<Button
						type="primary"
						onClick={requestUnlock}
						style={{ marginTop: 'var(--spacing-2-5)' }}>
						{t('Patient.data.vitalscan-rom.audioContext.enableAudioButton')}
					</Button>
				</div>
			</Modal>

			{children}
		</AudioContext.Provider>
	);
};
