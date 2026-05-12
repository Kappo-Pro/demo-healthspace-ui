import { useEffect, useRef, useState } from 'react';
import { useTypedSelector } from '@stores/index';
import { useTranslation } from 'react-i18next';
import { useAudio } from '@organisms/ORom/context/AudioContext';

interface ITransitionReadySetGo {
	isPaused: boolean;
	onNextTransition: () => void;
	transitionTime: number;
}

const SIZE = 200;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

const WORD: Record<number, string> = { 3: 'Three', 2: 'Two', 1: 'One' };

export default function ReadySetGoTutorial({
	isPaused,
	onNextTransition,
	transitionTime,
}: ITransitionReadySetGo) {
	const screenshotSound = '/assets/screenshotSound.mp3';
	const counterSound = '/assets/counterSound.mp3';

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	const activeStep = useTypedSelector(s => s.onBoard.onBoard.activeStep);

	const counterAudioRef = useRef<HTMLAudioElement | null>(null);
	const screenshotAudioRef = useRef<HTMLAudioElement | null>(null);

	const [countdown, setCountdown] = useState<number>(
		transitionTime === -1 ? 3 : transitionTime,
	);

	const [elapsedMs, setElapsedMs] = useState(0);
	const startRef = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);

	const totalMs = (transitionTime === -1 ? 3 : transitionTime) * 1000;

	const { playSound } = useAudio();
	const { t } = useTranslation();
	const currentLocation = window.location.pathname;

	useEffect(() => {
		const s = transitionTime === -1 ? 3 : transitionTime;
		setCountdown(s);
		setElapsedMs(0);
		startRef.current = null;
	}, [transitionTime]);

	useEffect(() => {
		if (isPaused) {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
			return;
		}

		const step = (ts: number) => {
			if (startRef.current == null) startRef.current = ts;
			const delta = ts - startRef.current;
			setElapsedMs(Math.min(totalMs, delta));
			if (delta < totalMs) {
				rafRef.current = requestAnimationFrame(step);
			}
		};

		rafRef.current = requestAnimationFrame(step);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		};
	}, [isPaused, totalMs]);

	useEffect(() => {
		let interval: NodeJS.Timeout | undefined;

		if (!isPaused && countdown > 0) {
			if (isIpad) {
				playSound('counter');
			} else {
				counterAudioRef.current?.play().catch(() => {});
			}

			interval = setInterval(() => {
				setCountdown(prev => {
					const next = prev - 1;
					if (next >= 1) {
						if (isIpad) playSound('counter');
						else if (counterAudioRef.current) {
							counterAudioRef.current.currentTime = 0;
							counterAudioRef.current.play().catch(() => {});
						}
					}
					return next;
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

	const progress = Math.min(1, Math.max(0, elapsedMs / totalMs));
	const dash = CIRC * progress;
	const dashOffset = CIRC - dash;

	const angle = -Math.PI / 2 + progress * 2 * Math.PI;
	const sparkX = SIZE / 2 + R * Math.cos(angle);
	const sparkY = SIZE / 2 + R * Math.sin(angle);

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
				<div
					style={{
						position: 'absolute',
						inset: 0,
						zIndex: 10,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'none',
						color: 'var(--color-white)',
					}}>
					<div style={{ textAlign: 'center' }}>
						<div
							style={{
								position: 'relative',
								width: SIZE,
								height: SIZE,
								background: 'var(--color-purple-700)',
								borderRadius: '50%',
							}}>
							<svg
								width={SIZE}
								height={SIZE}
								viewBox={`0 0 ${SIZE} ${SIZE}`}
								style={{ transform: 'rotate(0deg)' }}>
								<circle
									cx={SIZE / 2}
									cy={SIZE / 2}
									r={R}
									stroke="rgba(255, 255, 255, 0.25)"
									strokeWidth={STROKE}
									fill="none"
								/>
								<circle
									cx={SIZE / 2}
									cy={SIZE / 2}
									r={R}
									stroke="var(--color-green-6)"
									strokeWidth={STROKE}
									strokeLinecap="round"
									strokeDasharray={CIRC}
									strokeDashoffset={dashOffset}
									fill="none"
									style={{
										transition: isPaused
											? 'none'
											: 'stroke-dashoffset 80ms linear',
									}}
									transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
								/>
								<circle
									cx={SIZE / 2}
									cy={SIZE / 2}
									r={R}
									stroke="var(--color-white)"
									strokeWidth={STROKE}
									strokeLinecap="round"
									strokeDasharray={`${Math.max(1, STROKE * 1.8)} ${CIRC}`}
									strokeDashoffset={dashOffset}
									fill="none"
									transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
									style={{ opacity: 0.9 }}
								/>
							</svg>

							<div
								style={{
									position: 'absolute',
									left: sparkX - 6,
									top: sparkY - 6,
									width: 12,
									height: 12,
									borderRadius: '50%',
									background:
										'radial-gradient(circle at 30% 30%, var(--color-white), var(--color-blue-100) 40%, rgba(255,255,255,0) 70%)',
									boxShadow:
										'0 0 var(--spacing-1-5) var(--color-white), 0 0 var(--spacing-2-5) var(--color-white), 0 0 var(--spacing-4-5) var(--color-blue-300)',
									pointerEvents: 'none',
								}}
							/>

							<div
								style={{
									position: 'absolute',
									inset: 0,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 80,
									fontWeight: 'var(--font-weight-extrabold)',
									textShadow: '0 2px 12px rgba(0,0,0,.45)',
								}}>
								{countdown}
							</div>
						</div>

						<div style={{ marginTop: 10, fontSize: 22, opacity: 0.95 }}>
							{WORD[countdown] ?? countdown}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
