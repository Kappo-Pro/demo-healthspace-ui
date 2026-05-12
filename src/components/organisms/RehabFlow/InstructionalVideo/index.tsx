import { RehabExerciseToPatient } from '@types'
import { UntitledIcon } from '@atoms/Icon';
import { useEffect, useRef, useState } from 'react'


interface IInstructionalVideoProps {
	currentExercise: RehabExerciseToPatient
}

function InstructionalVideo(props: IInstructionalVideoProps) {
	const { currentExercise } = props
	const videoRef = useRef<HTMLVideoElement>(null)
	const [open, setOpen] = useState(false)

	const onToggleVideoOpened = () => {
		setOpen(!open)
	}

	useEffect(() => {
		if (currentExercise) {
			setOpen(true)
		}

		return () => {
			setOpen(false)
		}
	}, [currentExercise])

	const onPlay = () => {
		if (videoRef?.current) {
			videoRef.current.currentTime = 0
			videoRef.current.play()
		}
	}

	if (!currentExercise) return <></>

	const video =
		currentExercise?.rehabExercisesLibrary?.videoUrl ||
		currentExercise?.strapiExercise?.video

	return (
		<div
			style={{
				position: 'absolute',
				width: '420px',
				zIndex: 3,
				minHeight: '237px',
				backgroundColor: open ? 'var(--color-purple-600)' : 'transparent',
				opacity: 0.85
			}}
		>
			<video
				style={{
					visibility: open ? 'visible' : 'hidden',
					width: '100%',
				}}
				id="instructionalvideo"
				ref={videoRef}
				loop
				autoPlay
				muted
				preload="metadata"
				key={video}
				src={video}
				onLoadedMetadata={onPlay}
			/>
			{open ? (
				<UntitledIcon name="arrowUp" size={20} />
			) : (
				<UntitledIcon name="arrowDown" size={20} />
			)}
		</div>
	)
}

export default InstructionalVideo

