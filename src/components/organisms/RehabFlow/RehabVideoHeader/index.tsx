import { UntitledIcon } from '@atoms/Icon';
import { RehabVideoHeaderDataProps, RehabVideoState } from '@types';
import { Col, Flex, Row, Space, Tooltip, Typography } from 'antd';

import {
	ETransitionsAdmin,
	ETransitionsUser,
} from '@stores/clinical/rehab/main';
import { useTypedSelector } from '@stores/index';
import { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import RehabHeaderContent from './RehabHeaderContent';
import './style.css';

const { Text } = Typography;

function RehabVideoHeader(props: RehabVideoHeaderDataProps) {
	const {
		isFullscreen,
		videoState,
		onFullscreen,
		onToggleMenu,
		onToggleInfo,
		savedVoice,
	} = props;

	const {
		currentExercise,
		exercises,
		isPhysioterapist,
		recordConsult,
		progress,
		sequence,
	} = useTypedSelector(state => state.rehab.main);
	const exerciseNumber = exercises?.findIndex(
		exer => exer.id === currentExercise?.id,
	);

	const micRef = useRef<LottieRefCurrentProps>(null);
	const { t } = useTranslation();

	useEffect(() => {
		micRef.current?.play();
		setTimeout(() => {
			micRef.current?.stop();
		}, 2000);
	}, [savedVoice]);

	if (
		sequence?.value !== ETransitionsAdmin.VIDEO ||
		sequence?.value !== ETransitionsUser.VIDEO
	) {
		return (
			<Row
				align="middle"
				justify="end"
				className="header-height"
				style={{ backgroundColor: 'var(--color-black)' }}>
				<Col span={12}>
					<Row
						justify="end"
						className="header-height"
						style={{ textAlign: 'end' }}>
						<Col span={24}>
							<Flex justify="flex-end" align="center" className="header-height">
								<Tooltip title={t('Patient.data.rehab.fullScreen')}>
									{isFullscreen ? (
										<MdFullscreenExit
											size={30}
											className="cursor-pointer-css custom-white-stroke"
											onClick={onFullscreen}
										/>
									) : (
										<MdFullscreen
											size={30}
											className="cursor-pointer-css custom-white-stroke"
											onClick={onFullscreen}
										/>
									)}
								</Tooltip>
							</Flex>
						</Col>
					</Row>
				</Col>
			</Row>
		);
	}

	return (
		<Row
			align="middle"
			justify="center"
			className="header-height"
			style={{ backgroundColor: 'var(--color-black)' }}>
			<Col span={12}>
				<Row className="header-height" style={{ paddingLeft: 8 }}>
					{!isPhysioterapist &&
						sequence?.value !== ETransitionsUser.EVALUATION && (
							<Col
								span={
									videoState != RehabVideoState.RECORDING &&
									videoState != RehabVideoState.READY
										? '3'
										: '1'
								}>
								<Flex align="center" className="header-height">
									<Space>
										{videoState != RehabVideoState.RECORDING &&
											videoState != RehabVideoState.READY && (
												<Tooltip title={t('Admin.data.rehab.flow.menu')}>
													<UntitledIcon name="holder" size={20} />
												</Tooltip>
											)}
										<Tooltip title={t('Admin.data.rehab.flow.info')}>
											<UntitledIcon name="infoCircle" size={20} />
										</Tooltip>
									</Space>
								</Flex>
							</Col>
						)}
					<Col
						className={
							videoState != RehabVideoState.RECORDING &&
							videoState != RehabVideoState.READY
								? ''
								: 'ml-[10px]'
						}
						span={20}
						style={{ top: '1px' }}>
						<Text style={{ color: 'var(--text-on-dark)' }}>
							{currentExercise &&
								`${exerciseNumber + 1}/${progress.total} ${currentExercise?.rehabExercisesLibrary?.title?.toUpperCase() || currentExercise?.strapiExercise?.name?.toUpperCase() || recordConsult?.title?.toUpperCase()}`}
						</Text>
					</Col>
				</Row>
			</Col>
			<Col span={12}>
				<RehabHeaderContent {...props} />
			</Col>
		</Row>
	);
}

export default RehabVideoHeader;
