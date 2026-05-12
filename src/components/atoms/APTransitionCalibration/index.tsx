import {
	PosturalAnalytics,
	UseControls,
} from '@pages/PostureScan/context/Controls.context';
import { Col, Row } from 'antd';
import Lottie from 'lottie-react';
import { useCallback, useEffect, useState } from 'react';
import animationData from './coord.json';

function TransitionCalibration({
	label = 'STEP BACK',
	postureScan = false,
}: {
	label?: string;
	postureScan?: boolean;
}) {
	const { isPersonInBox, isAligned, onGetCurrent, canvasDimensions } =
		UseControls();
	const [volume, setVolume] = useState(100);
	const [muted, setMuted] = useState(false);

	const current = onGetCurrent() as Partial<PosturalAnalytics>;
	const Instructions = {
		GET_IN_BOX: 'Please Center Yourself in the Box',
		TURN: `Turn ${current?.view}`,
	};

	const readLabel = useCallback(
		(label = 'STEP BACK') => {
			if (postureScan) {
				// Audio is now handled by PostureScreen.context.tsx calibration loop
				// This component only handles visual display during calibration
				return;
			} else {
				if ('speechSynthesis' in window) {
					window.speechSynthesis.cancel();
					const utterance = new SpeechSynthesisUtterance(label);
					utterance.volume = muted ? 0 : volume / 100;
					window.speechSynthesis.speak(utterance);
				} else {
					console.error('Speech synthesis not supported in this browser.');
				}
			}
		},
		[muted, volume],
	);

	useEffect(() => {
		let message = '';

		if (postureScan === true) {
			if (!isPersonInBox) {
				message = Instructions.GET_IN_BOX;
			} else if (!isAligned) {
				message = Instructions.TURN;
			}
		} else {
			message = label;
		}
		readLabel(message);
		const intervalId: NodeJS.Timeout = setInterval(() => {
			readLabel(message);
		}, 5000);

		return () => clearInterval(intervalId);
	}, [isPersonInBox, isAligned, postureScan]);
	const aspectRatio =
		canvasDimensions?.width && canvasDimensions?.height
			? canvasDimensions.width / canvasDimensions.height
			: 16 / 9;

	return (
		<>
			<div
				style={{
					position: 'absolute',
					zIndex: 5,
					width: '100%',
					// backgroundColor: 'rgb(0, 0, 0, 0.7)',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					aspectRatio: aspectRatio,
					height: '100%',
				}}>
				<Row align="middle" justify="center">
					{postureScan ? (
						<Col>
							{/* {!isPersonInBox ? (
								<p
									style={{
										fontSize: '52px',
										fontWeight: 'bold',
										color: 'var(--text-color-on-dark)',
										padding: 15,
									}}>
									{Instructions.GET_IN_BOX}
								</p>
							) : (
								!isAligned && (
									<p
										style={{
											fontSize: '52px',
											fontWeight: 'bold',
											color: 'var(--text-color-on-dark)',
											// background: '#6b2ba0',
											padding: 15,
											// margin: '0 0 5px 0',
										}}>
										{Instructions.TURN}
									</p>
								)
							)} */}
						</Col>
					) : (
						<Col>
							<Lottie
								className="md:h-[340px] lg:h-[470px] xl:h-[580px] 2xl:h-[720px]"
								loop={false}
								autoplay={true}
								animationData={animationData}
								style={{ width: '100%' }}
							/>
						</Col>
					)}
				</Row>
				{/* <div
					style={{
						position: 'absolute',
						bottom: 10,
						right: 20,
						display: 'flex',
						alignItems: 'center',
						gap: 16,
					}}>
					{muted ? (
						<BiVolumeMute
							color="var(--text-color-on-dark)"
							size={24}
							onClick={() => setMuted(false)}
						/>
					) : (
						<BiVolumeFull
							color="var(--text-color-on-dark)"
							size={24}
							onClick={() => setMuted(true)}
						/>
					)}
					<Slider
						min={0}
						max={100}
						step={1}
						value={muted ? 0 : volume}
						onChange={val => {
							setVolume(val);
							if (val > 0) {
								savedVolume.current = val;
								setMuted(false);
							} else {
								setMuted(true);
							}
						}}
						trackStyle={{ backgroundColor: 'var(--stepper-secondary-color)' }}
						handleStyle={{
							borderColor: 'var(--stepper-secondary-color)',
							backgroundColor: 'var(--stepper-secondary-color)',
						}}
						railStyle={{
							backgroundColor: 'var(--content-manager-tab-bg-color)',
						}}
						style={{ width: 200 }}
					/>
				</div> */}
			</div>
		</>
	);
}

export default TransitionCalibration;
