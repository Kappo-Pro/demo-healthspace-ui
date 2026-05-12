import { useEffect, useRef } from 'react';

interface ITransitionOpeningProps {
	isPaused: boolean;
	onNextExercise: () => void;
	duration?: number;
	delay?: number;
}

function OpeningTutorial({
	isPaused,
	onNextExercise,
	duration = 700,
	delay = 0,
}: ITransitionOpeningProps) {
	const divRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = divRef.current;
		if (!el) return;

		el.style.animation = `cs-shutter-open ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms both`;
		el.style.animationPlayState = isPaused ? 'paused' : 'running';

		const handleEnd = () => onNextExercise?.();
		el.addEventListener('animationend', handleEnd);
		return () => el.removeEventListener('animationend', handleEnd);
	}, [isPaused, duration, delay, onNextExercise]);

	useEffect(() => {
		if (divRef.current) {
			divRef.current.style.animationPlayState = isPaused ? 'paused' : 'running';
		}
	}, [isPaused]);

	return (
		<div
			aria-hidden
			ref={divRef}
			className="cs-shutter cs-shutter--opening"
			style={{ position: 'absolute', inset: 0 }}
		/>
	);
}

export default OpeningTutorial;
