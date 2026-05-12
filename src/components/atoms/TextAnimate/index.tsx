import React, { useEffect, useState } from 'react';
import './style.css';

type AnimationType = 'blurInOut' | 'blurIn' | 'fadeIn' | 'slideUp';
type ElementType = 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface TextAnimateProps {
	children: React.ReactNode;
	animation?: AnimationType;
	as?: ElementType;
	className?: string;
	delay?: number;
	duration?: number; // How long to stay visible before blurring out (ms)
}

export const TextAnimate: React.FC<TextAnimateProps> = ({
	children,
	animation = 'blurInOut',
	as: Component = 'span',
	className = '',
	delay = 0,
	duration = 3000,
}) => {
	const [state, setState] = useState<'hidden' | 'visible' | 'exit'>('hidden');

	useEffect(() => {
		// Blur in after delay
		const inTimer = setTimeout(() => {
			setState('visible');
		}, delay);

		// Blur out after duration
		const outTimer = setTimeout(() => {
			setState('exit');
		}, delay + duration);

		return () => {
			clearTimeout(inTimer);
			clearTimeout(outTimer);
		};
	}, [delay, duration]);

	return (
		<Component
			className={`text-animate text-animate--${animation} text-animate--${state} ${className}`}
		>
			{children}
		</Component>
	);
};

export default TextAnimate;
