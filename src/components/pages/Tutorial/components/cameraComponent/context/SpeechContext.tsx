import { useTypedDispatch } from '@stores/index';
import {
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { DEFAULT_ASSISTANT, Guide } from '../component/TutorialConstants';
import {
	MovementExercise,
	UseTutorialControls,
} from './TutorialControls.context';

interface ISpeechContext {
	speakText: (text: string, voiceName?: string, rate?: number) => Promise<void>;
	cancelSpeech: () => void;
	isSpeaking: boolean;
	currentCaption: string | null;
	volume: number;
	setVolume: (v: number) => void;
	muted: boolean;
	setMuted: (m: boolean) => void;
}

const SpeechContext = createContext<ISpeechContext>({
	speakText: async () => {},
	cancelSpeech: () => {},
	isSpeaking: false,
	currentCaption: null,
	volume: 100,
	setVolume: (v: number) => {},
	muted: false,
	setMuted: (m: boolean) => {},
});

type SpeechType =
	| 'instruction'
	| 'visibility'
	| 'finished'
	| 'intro'
	| 'guide'
	| 'left'
	| 'right'
	| 'center'
	| 'centered'
	| 'chair'
	| 'TourEnd'
	| null;

export const useGlobalSpeech = () => useContext(SpeechContext);

export const SpeechProvider = ({ children }: PropsWithChildren) => {
	const { speak, cancel, speaking, voices } = useSpeechSynthesis();
	const [currentCaption, setCurrentCaption] = useState<string | null>(null);
	const { selectedScan } = UseTutorialControls();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const dispatch = useTypedDispatch();
	const DEFAULT_BROWSER_VOICE = 'Google UK English Female';
	const [volume, setVolume] = useState(100);
	const [muted, setMuted] = useState(false);

	const volumeRef = useRef(volume);
	const mutedRef = useRef(muted);

	useEffect(() => {
		volumeRef.current = volume;
	}, [volume]);
	useEffect(() => {
		mutedRef.current = muted;
	}, [muted]);

	const selectedAssistant = DEFAULT_ASSISTANT;

	const getLocalAudioPath = (
		selectedScan: MovementExercise | null,
		detected: SpeechType | null,
	): string | null => {
		const assistantName = 'Jessica';
		if (!selectedScan) return null;
		switch (detected) {
			case 'instruction':
				return `/ai-agents/${assistantName}/${selectedScan.name}/instruction.mp3`;
			case 'visibility':
				return `/ai-agents/${assistantName}/common/visiblity.mp3`;
			case 'finished':
				return `/ai-agents/${assistantName}/${selectedScan.name}/finished.mp3`;
			case 'intro':
				return `/ai-agents/${assistantName}/common/intro.mp3`;
			case 'guide':
				return `/ai-agents/${assistantName}/common/guide.mp3`;
			case 'left':
				return `/ai-agents/${assistantName}/common/left.mp3`;
			case 'right':
				return `/ai-agents/${assistantName}/common/right.mp3`;
			case 'center':
				return `/ai-agents/${assistantName}/${selectedScan.name}/frame.mp3`;
			case 'centered':
				return `/ai-agents/${assistantName}/common/centered.mp3`;
			case 'chair':
				return `/ai-agents/${assistantName}/common/chair.mp3`;
			case 'TourEnd':
				return `/ai-agents/${assistantName}/common/TourEnd.mp3`;
			default:
				return null;
		}
	};

	const normalizeText = (text: string): string =>
		text
			.toLowerCase()
			.replace(/[–—-]/g, '-')
			.replace(/[“”‘’]/g, '"')
			.replace(/[^\w\s]/gi, '')
			.trim();

	const isSimilar = (a: string, b: string): boolean => {
		const normA = normalizeText(a);
		const normB = normalizeText(b);
		return normA.includes(normB) || normB.includes(normA);
	};

	const detectSpeechTypeFromText = (
		text: string,
		selectedScan: MovementExercise | null,
	): SpeechType => {
		if (!text) return null;

		const introText = `Hi! I’m your virtual guide assistant. I’m here to support you every step of the way.`;
		const speakIntro = `Welcome to VitalFlow, your own virtual space for health and wellness. I’m your guide for the journey...`;

		if (!selectedScan) return null;
		if (isSimilar(text, speakIntro)) return 'guide';
		if (isSimilar(text, introText)) return 'intro';
		if (isSimilar(text, Guide.center)) return 'center';
		if (isSimilar(text, Guide.left)) return 'left';
		if (isSimilar(text, Guide.right)) return 'right';
		if (isSimilar(text, Guide.centered)) return 'centered';
		if (isSimilar(text, Guide.chair)) return 'chair';
		if (isSimilar(text, Guide.finished)) return 'TourEnd';
		if (isSimilar(text, selectedScan.instruction)) return 'instruction';
		if (isSimilar(text, selectedScan.visibility)) return 'visibility';
		if (isSimilar(text, selectedScan.finished)) return 'finished';

		return null;
	};

	const selectedScanRef = useRef(selectedScan);
	useEffect(() => {
		selectedScanRef.current = selectedScan;
	}, [selectedScan]);

	const speakText = useCallback(
		async (text: string, voiceName?: string, rate?: number) => {
			const currentSelectedScan = selectedScanRef.current;
			if (!currentSelectedScan) return;
			return new Promise<void>(async resolve => {
				if (!text || voices.length === 0) return resolve();
				setCurrentCaption(text);

				const getVol = () => (mutedRef.current ? 0 : volumeRef.current / 100);

				const fallbackToBrowserTTS = (
					fallbackText: string,
					fallbackVoiceName?: string,
				) => {
					const selectedVoice =
						voices.find(v => v.name === fallbackVoiceName) ||
						voices.find(v => v.name === DEFAULT_BROWSER_VOICE);

					if (!selectedVoice) return resolve();

					const utterance = new SpeechSynthesisUtterance(fallbackText);
					utterance.voice = selectedVoice;
					utterance.rate = rate || 1;
					utterance.volume = getVol();

					utterance.onend = () => {
						setCurrentCaption(null);
						resolve();
					};
					window.speechSynthesis.speak(utterance);
				};

				const detected = detectSpeechTypeFromText(text, currentSelectedScan);
				const mp3Path = getLocalAudioPath(currentSelectedScan, detected);

				if (mp3Path && audioRef.current) {
					const audio = audioRef.current;
					audio.src = mp3Path;
					audio.playbackRate = rate || 1;
					audio.muted = mutedRef.current;
					audio.volume = getVol();

					audio.onended = () => {
						setCurrentCaption(null);
						resolve();
					};
					audio.onerror = () => {
						// fallbackToBrowserTTS(text, voiceName);
					};
					try {
						await audio.play();
					} catch (e: unknown) {
						if (e.name !== 'AbortError') {
						}
						resolve();
					}
					return;
				}

				fallbackToBrowserTTS(text, voiceName);
			});
		},
		[voices, dispatch, selectedScanRef.current],
	);

	const cancelSpeech = () => {
		setCurrentCaption(null);
		cancel();
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
	};

	useEffect(() => {
		if (!speaking) {
			setCurrentCaption(null);
		}
	}, [speaking]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = mutedRef.current ? 0 : volumeRef.current / 100;
			audioRef.current.muted = mutedRef.current;
		}
	}, [volume, muted]);

	return (
		<SpeechContext.Provider
			value={{
				speakText,
				cancelSpeech,
				isSpeaking: speaking,
				volume,
				setVolume,
				muted,
				setMuted,
				currentCaption,
			}}>
			<audio ref={audioRef} />
			{children}
		</SpeechContext.Provider>
	);
};
