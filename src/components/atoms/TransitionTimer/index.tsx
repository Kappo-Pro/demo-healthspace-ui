import { useEffect, useRef } from 'react'
import Lottie, { LottieRefCurrentProps } from 'react-lottie-player/dist/LottiePlayerLight'
import animationData from './coord.json'
import './style.css'

interface ITransitionTimerProps {
	isPaused: boolean
	onTimerCountDownFinish: () => void
}

function TransitionTimer(props: ITransitionTimerProps) {
	const lottieRef = useRef<LottieRefCurrentProps | null>(null)

	useEffect(() => {
		if (props?.isPaused) lottieRef.current?.pause()
		else lottieRef.current?.play()
	}, [props])

	return (
		<div className={'timer'}>
			<Lottie
				className="mtimer"
				lottieRef={lottieRef}
				loop={false}
				play
				animationData={animationData}
				className="w-full h-full"
				onComplete={props?.onTimerCountDownFinish}
			/>
		</div>
	)
}

export default TransitionTimer
