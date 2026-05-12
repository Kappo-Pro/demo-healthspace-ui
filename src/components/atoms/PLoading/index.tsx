import { memo } from 'react'
import Lottie from 'react-lottie-player/dist/LottiePlayerLight'
import animationData from './coord.json'
import './style.css'

function Loading() {
	return (
		<div className="estimator-loading">
			<Lottie
				loop={true}
				play
				animationData={animationData}
				className="w-full h-full"
				width="100%"
				height="100%"
			/>
		</div>
	)
}

export default memo(Loading)
