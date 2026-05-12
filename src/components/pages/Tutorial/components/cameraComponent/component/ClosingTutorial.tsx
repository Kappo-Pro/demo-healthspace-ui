import { useEffect, useRef } from 'react';

interface ITransitionClosingProps {
	isPaused: boolean;
	onNextTransition: () => void;
	duration?: number;
	delay?: number;
}

function ClosingTutorial({
	isPaused,
	onNextTransition,
	duration = 700,
	delay = 0,
}: ITransitionClosingProps) {
	const divRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = divRef.current;
		if (!el) return;
		el.style.animation = `cs-shutter-close ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms both`;
		el.style.animationPlayState = isPaused ? 'paused' : 'running';

		const handleEnd = () => onNextTransition?.();
		el.addEventListener('animationend', handleEnd);
		return () => el.removeEventListener('animationend', handleEnd);
	}, [isPaused, duration, delay, onNextTransition]);

	useEffect(() => {
		if (divRef.current) {
			divRef.current.style.animationPlayState = isPaused ? 'paused' : 'running';
		}
	}, [isPaused]);

	return (
		<div
			aria-hidden
			ref={divRef}
			className="cs-shutter cs-shutter--closing"
			style={{ position: 'absolute', inset: 0 }}
		/>
	);
}

export default ClosingTutorial;
