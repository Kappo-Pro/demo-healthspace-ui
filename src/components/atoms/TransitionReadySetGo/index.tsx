import { useAudio } from '@organisms/RomFlow/context/AudioContext';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { captureVideoFrame, setCapturedFrame } from '@stores/clinical/rom/main';
import { Flex } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BorderAnimation from '@atoms/BorderAnimation';

interface ITransitionReadySetGo {
	isPaused: boolean;
	onNextTransition: () => void;
	transitionTime: number;
}

function TransitionReadySetGo(props: ITransitionReadySetGo) {
	const { isPaused, onNextTransition, transitionTime } = props;
	const dispatch = useTypedDispatch();

	const screenshotSound = '/assets/screenshotSound.mp3';
	const counterSound = '/assets/counterSound.mp3';

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	const activeStep = useTypedSelector(
		state => state.onBoard.onBoard.activeStep,
	);

	const counterAudioRef = useRef<HTMLAudioElement | null>(null);
	const screenshotAudioRef = useRef<HTMLAudioElement | null>(null);
	const hasCapuredRef = useRef(false);

	const [countdown, setCountdown] = useState<number>(
		transitionTime === -1 ? 3 : transitionTime,
	);
	const [isVisible, setIsVisible] = useState(true);

	const { playSound } = useAudio();
	const { t } = useTranslation();
	const currentLocation = window.location.pathname;

	useEffect(() => {
		setCountdown(transitionTime === -1 ? 3 : transitionTime);
		setIsVisible(true);
		hasCapuredRef.current = false;
	}, [transitionTime]);

	// Pre-capture video frame at countdown=1 (before modal hides)
	useEffect(() => {
		if (countdown === 1 && !hasCapuredRef.current) {
			hasCapuredRef.current = true;
			const frame = captureVideoFrame();
			if (frame) {
				dispatch(setCapturedFrame(frame));
			}
		}
	}, [countdown, dispatch]);

	useEffect(() => {
		let interval: NodeJS.Timeout | undefined;

		if (!isPaused && countdown > 0) {
			interval = setInterval(() => {
				setCountdown(prev => {
					const newCountdown = prev - 1;

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

		// Trigger completion when countdown reaches 0
		if (countdown === 0) {
			clearInterval(interval);

			// Keep visible for 200ms to let animation complete
			setTimeout(() => {
				setIsVisible(false);
			}, 200);

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
			}, 500);

			setTimeout(() => {
				onNextTransition();
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [countdown, isPaused, onNextTransition, activeStep, playSound]);

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

			{isVisible && (
				<Flex
					vertical
					justify="center"
					align="center"
					className="w-full h-full"
					style={{
						position: 'absolute',
						background: 'var(--color-transparent)',
						zIndex: 10,
					}}>
					<BorderAnimation
						duration={transitionTime === -1 ? 3 : transitionTime}
						isAnimating={!isPaused}
						borderWidth={3}
						borderRadius={10.829}>
						<div
							style={{
								position: 'relative',
								width: 'min(500px, 55vh)',
								height: 'min(850px, 92vh)',
								borderRadius: 10.829,
								background: 'var(--color-purple-alpha-15)',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center',
								overflow: 'hidden',
								gap: 24,
							}}>
							<span
								style={{
									fontSize: 42,
									fontWeight: 'bold',
									color: 'var(--text-on-dark)',
								}}>
								{t('Patient.data.vitalscan-rom.getPosition')}
							</span>
							<Flex
								align="center"
								justify="center"
								className="rounded-full"
								style={{
									width: 100,
									height: 100,
									fontSize: 42,
									fontWeight: 'bold',
									color: 'var(--text-on-dark)',
									backgroundColor: 'var(--brand-primary)',
								}}>
								{countdown > 0 ? countdown : '✓'}
							</Flex>
						</div>
					</BorderAnimation>
				</Flex>
			)}
		</>
	);
}

export default TransitionReadySetGo;
