import { useEffect } from 'react';
import './style.css';

interface ITransitionClosingProps {
	isPaused: boolean;
	onNextTransition: () => void;
}

function TransitionClosing(props: ITransitionClosingProps) {
	const { isPaused, onNextTransition } = props;

	useEffect(() => {
		if (isPaused) return;

		// Trigger next transition after flash animation completes (500ms)
		const timer = setTimeout(() => {
			onNextTransition();
		}, 500);

		return () => clearTimeout(timer);
	}, [isPaused, onNextTransition]);

	return (
		<div
			className="closing-flash"
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				zIndex: 15,
				backgroundColor: 'var(--surface-primary)',
				animation: isPaused ? 'none' : 'flash-fade 0.5s ease-out forwards',
				pointerEvents: 'none',
			}}
		/>
	);
}

export default TransitionClosing;
