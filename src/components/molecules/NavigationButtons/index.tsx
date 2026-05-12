import React from 'react'
import { UntitledIcon } from '@atoms/Icon';
import { Button } from 'antd'


interface INavegationButtonsProps {
	nextHide: boolean
	onClickNext: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	onClickPrev: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	prevHide: boolean
}

function NavigationButtons(props: INavegationButtonsProps) {
	const { onClickPrev, onClickNext, prevHide, nextHide } = props

	return (
		<>
			{prevHide === false && (
				<Button
					className="btn-prev"
					type="primary"
					shape="circle"
					icon={<UntitledIcon name="chevronLeft" size={20} />}
					onClick={onClickPrev}
				/>
			)}
			{nextHide === false && (
				<Button
					className="btn-next"
					type="primary"
					shape="circle"
					icon={<UntitledIcon name="chevronRight" size={20} />}
					onClick={onClickNext}
				/>
			)}
		</>
	)
}

export default NavigationButtons
