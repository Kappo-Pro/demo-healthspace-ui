import { RehabVideoHeaderProps, RehabVideoState } from '@types';
import { Col, Row, Space, Tooltip, Typography } from 'antd';

import { UntitledIcon } from '@atoms/Icon';
import { useTypedSelector } from '@stores/index';
import { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef } from 'react';
import ProgramVideoHeaderContent from './ProgramVideoHeaderContent';
import './style.css';

const { Text } = Typography;

function ProgramVideoHeader(props: RehabVideoHeaderProps) {
	const { videoState, onToggleMenu, onToggleInfo, savedVoice } = props;

	const { exercises, currentExercise } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const currentExerciseIndex = exercises.findIndex(
		exercise => exercise.id == currentExercise?.id,
	);
	const micRef = useRef<LottieRefCurrentProps>(null);

	useEffect(() => {
		micRef.current?.play();
		setTimeout(() => {
			micRef.current?.stop();
		}, 2000);
	}, [savedVoice]);

	return (
		<Row
			align="middle"
			justify="center"
			className="header-height"
			style={{ backgroundColor: 'var(--color-black)' }}>
			<Col span={16}>
				<Row
					className="header-height"
					style={{
						paddingLeft: 8,
						width: '100%',
						display: 'flex',
						justifyContent: 'start',
						gap: 10,
						alignItems: 'center',
					}}>
					<Col
						span={
							videoState == RehabVideoState.START ? 'col-span-3' : 'col-span-1'
						}
						className="header-height">
						<Space
							style={{
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								marginTop: 'var(--spacing-2)',
							}}>
							{videoState == RehabVideoState.START && (
								<Tooltip title="Menu">
									<UntitledIcon
										name="list"
										onClick={onToggleMenu}
										color="var(--color-white)"
									/>
								</Tooltip>
							)}
							<Tooltip title="Info">
								<UntitledIcon
									name="infoCircle"
									onClick={onToggleInfo}
									color="var(--color-white)"
								/>
							</Tooltip>
						</Space>
					</Col>
					<Col
						span={15}
						style={{
							marginLeft: videoState == RehabVideoState.START ? 0 : 10,
						}}>
						<Typography
							style={{ color: 'var(--color-white)', width: 'max-content' }}>
							{currentExercise?.name ? (
								<>
									{currentExercise &&
										`${currentExerciseIndex + 1}/${exercises.length} ${currentExercise?.name?.toUpperCase()}`}
								</>
							) : (
								<>
									{currentExercise &&
										`${currentExerciseIndex + 1}/${exercises.length} ${currentExercise?.exerciseLibrary?.title?.toUpperCase()}`}
								</>
							)}
						</Typography>
					</Col>
				</Row>
			</Col>
			<Col span={8}>
				<ProgramVideoHeaderContent {...props} />
			</Col>
		</Row>
	);
}

export default ProgramVideoHeader;
