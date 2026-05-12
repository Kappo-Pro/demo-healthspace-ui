import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef } from 'react';
import animationData from './coord.json';
import './style.css';

interface ITransitionOpenningProps {
	isPaused: boolean;
	onNextExercise: () => void;
}

function TransitionOpenning(props: ITransitionOpenningProps) {
	const lottieRef = useRef<LottieRefCurrentProps | null>(null);

	useEffect(() => {
		if (props?.isPaused) lottieRef.current?.pause();
		else lottieRef.current?.play();
	}, [props]);

	return (
		<div
			style={{
				position: 'absolute',
				zIndex: 15,
				width: '100%',
			}}>
			<Lottie
				lottieRef={lottieRef}
				loop={false}
				autoplay={true}
				animationData={animationData}
				className="w-full h-full"
				onComplete={() => {
					props?.onNextExercise();
				}}
			/>
		</div>
	);
}

export default TransitionOpenning;
