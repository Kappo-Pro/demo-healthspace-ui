import React, { useEffect, useState } from 'react';
import './TextAnimation.css';

interface TextAnimationProps {
	text?: string;
	bodySideTitle?: string;
	movementTitle?: string;
}

const TextAnimation: React.FC<TextAnimationProps> = ({
	text,
	bodySideTitle,
	movementTitle,
}) => {
	const [animationClass, setAnimationClass] = useState('slide-in');

	useEffect(() => {
		const timeoutIn = setTimeout(() => {
			setAnimationClass('slide-out');
		}, 3000);

		return () => clearTimeout(timeoutIn);
	}, []);

	return (
		<div className={`${animationClass} animation-wrapper`}>
			<div className="inner-box"></div>
			{!movementTitle ? (
				<p className="animated-text">{text}</p>
			) : (
				<div className="animated-text-wrap">
					<p className="body-side-title-text">{bodySideTitle}</p>
					<p className="movement-title-text">{movementTitle}</p>
				</div>
			)}
		</div>
	);
};

export default TextAnimation;
