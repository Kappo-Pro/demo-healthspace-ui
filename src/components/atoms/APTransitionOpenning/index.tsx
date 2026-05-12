import { useEffect, useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
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
				zIndex: 3,
				width: '100%',
			}}>
			<Lottie
				lottieRef={lottieRef}
				loop={false}
				autoplay={true}
				animationData={animationData}
				style={{ width: '100%', height: '100%' }}
				onComplete={() => {
					props?.onNextExercise();
				}}
			/>
		</div>
	);
}

export default TransitionOpenning;
