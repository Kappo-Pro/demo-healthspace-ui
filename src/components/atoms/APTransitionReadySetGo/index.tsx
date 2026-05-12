import { useEffect, useRef, useState } from 'react';
import { useTypedSelector } from '@stores/index';
import { useTranslation } from 'react-i18next';
import { useAudio } from '@organisms/ORom/context/AudioContext';
import { UsePostureScreenAudio } from '@pages/PostureScan/context/PostureScreen.context';
import './style.css';

interface ITransitionReadySetGo {
	isPaused: boolean;
	onNextTransition: () => void;
	transitionTime: number;
	postureScan?: boolean;
}

function TransitionReadySetGo(props: ITransitionReadySetGo) {
	const {
		isPaused,
		onNextTransition,
		transitionTime,
		postureScan = false,
	} = props;
	const { stop } = UsePostureScreenAudio();

	useEffect(() => {
		stop();
	}, [postureScan]);

	const screenshotSound = '/assets/screenshotSound.mp3';
	const counterSound = '/assets/counterSound.mp3';

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	const activeStep = useTypedSelector(
		state => state.onBoard.onBoard.activeStep,
	);

	const counterAudioRef = useRef<HTMLAudioElement | null>(null);
	const screenshotAudioRef = useRef<HTMLAudioElement | null>(null);

	const [countdown, setCountdown] = useState<number>(
		transitionTime === -1 ? 3 : transitionTime,
	);
	const [countdownKey, setCountdownKey] = useState(0);

	const { playSound } = useAudio();
	const { t } = useTranslation();
	const currentLocation = window.location.pathname;

	useEffect(() => {
		setCountdown(transitionTime === -1 ? 3 : transitionTime);
	}, [transitionTime]);

	useEffect(() => {
		let interval: NodeJS.Timeout | undefined;

		if (!isPaused && countdown > 0) {
			interval = setInterval(() => {
				setCountdown(prev => {
					const newCountdown = prev - 1;

					// Trigger blur animation for new number
					setCountdownKey(k => k + 1);

					if (isIpad) {
						playSound('counter');
					} else if (counterAudioRef.current) {
						counterAudioRef.current.currentTime = 0;
						counterAudioRef.current.play().catch(() => {});
					}

					return newCountdown;
				});
			}, 1000);
		}

		if (countdown === 1) {
			clearInterval(interval);

			setTimeout(() => {
				if (isIpad) {
					playSound('screenshot');
				} else if (
					screenshotAudioRef.current &&
					activeStep !== 8 &&
					!currentLocation.includes('rom/start-scan')
				) {
					screenshotAudioRef.current.currentTime = 0;
					screenshotAudioRef.current.play().catch(() => {});
				}
			}, 1000);

			setTimeout(() => {
				onNextTransition();
			}, 2000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [countdown, isPaused, onNextTransition]);

	return (
		<>
			{!isIpad && (
				<>
					<audio ref={counterAudioRef} src={counterSound} preload="auto" />
					<audio
						ref={screenshotAudioRef}
						src={screenshotSound}
						preload="auto"
					/>
				</>
			)}

			{countdown !== 0 && (
				<div className="ready-set-go">
					{/* Caption text */}
					<div className="ready-set-go__caption">
						<span className="ready-set-go__text">
							{t('Patient.data.vitalscan-rom.getPosition')}
						</span>
					</div>

					{/* Countdown number with blur animation */}
					<h1 key={countdownKey} className="ready-set-go__countdown">
						{countdown}
					</h1>
				</div>
			)}
		</>
	);
}

export default TransitionReadySetGo;
