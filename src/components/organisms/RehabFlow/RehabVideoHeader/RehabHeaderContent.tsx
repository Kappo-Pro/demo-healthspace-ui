import CountDownTimer from '@atoms/CountDownTimer';
import { UntitledIcon } from '@atoms/Icon';
import RatingFeedback from '@molecules/VideoRecorder/ratingFeedback';
import { adminTimeLimit, patientTimeLimit } from '@stores/constants';
import { useTypedSelector } from '@stores/index';
import { RehabVideoHeaderDataProps, RehabVideoState } from '@types';
import {
	Button,
	Col,
	Divider,
	Flex,
	Row,
	Space,
	Tooltip,
	Typography,
} from 'antd';
import { LottieRefCurrentProps } from 'lottie-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
	MdFullscreen,
	MdFullscreenExit,
	MdOutlineSwitchCamera,
} from 'react-icons/md';

const { Paragraph } = Typography;

const controlInstructions = {
	[RehabVideoState.START.toString()]: {
		text1: "Say 'RECORD' or 'YES' to start recording",
		text2: "Say 'RECORD' or 'YES' or wave with an open hand to start recording",
		icon: <img src={`/images/openHand.svg`} />,
	},
	[RehabVideoState.RECORDING.toString()]: {
		text1: "Say 'STOP' to stop the recording",
		text2: "Say 'STOP' or extend an open hand to stop the recording",
		icon: <img src={`/images/openHand.svg`} />,
	},
	[RehabVideoState.REPLAYING.toString()]: {
		text1: "Say 'NO' to redo or 'YES' to save the recording",
		text2:
			"Say 'NO' to redo or 'YES' to save, or gesture 'THUMBS DOWN' or 'THUMBS UP'",
		icon: (
			<div>
				<img src={`/images/thumbDown.svg`} />
				<img src={`/images/thumbUp.svg`} />
			</div>
		),
	},
	[RehabVideoState.RATING.toString()]: {
		text1: 'Choose a number and say it aloud',
		text2: 'Choose a number and say it aloud.',
	},
};

export default function RehabHeaderContent(props: RehabVideoHeaderDataProps) {
	const {
		videoState,
		onStartRecord,
		onStopRecord,
		onDiscardRecord,
		onStopRating,
		selectedRating,
		setSelectedRating,
		onFullscreen,
		isGestureEnabled,
		onSubmitRecord,
		isStartingTimer,
		onEndedTimer,
		toogleFacingMode,
		isFullscreen,
		flipCamera,
	} = props;
	const micRef = useRef<LottieRefCurrentProps>(null);
	const { isPhysioterapist } = useTypedSelector(state => state.rehab.main);
	const { t } = useTranslation();
	const timeLimit = isPhysioterapist ? adminTimeLimit : patientTimeLimit;

	return (
		<Row justify="end" className="header-height" style={{ textAlign: 'end' }}>
			<Col span={24}>
				<Flex justify="flex-end" align="center" className="h-[40px]">
					{videoState === RehabVideoState.READY && (
						<Tooltip title={t('Patient.data.rehab.getReady')}>
							<Button
								className="header-height"
								style={{
									border: 0,
									borderRadius: 0,
									backgroundColor: 'var(--color-warning-500)',
									color: 'var(--text-on-dark)',
								}}>
								{t('Patient.data.rehab.getReady')}
							</Button>
						</Tooltip>
					)}

					{videoState === RehabVideoState.RECORDING && (
						<Tooltip title={t('Patient.data.rehab.stop')}>
							<Button
								onClick={onStopRecord}
								className="header-height"
								style={{
									border: 0,
									borderRadius: 0,
									backgroundColor: 'var(--color-error-600)',
									color: 'var(--text-on-dark)',
								}}>
								<Space align="center">
									<UntitledIcon name="closeCircle" />
									{t('Patient.data.rehab.stop')}
								</Space>
							</Button>
						</Tooltip>
					)}

					{videoState === RehabVideoState.START && (
						<Tooltip title={t('Patient.data.rehab.record')}>
							<Button
								onClick={onStartRecord}
								className="header-height"
								style={{
									border: 0,
									borderRadius: 0,
									backgroundColor: 'var(--color-success-600)',
									color: 'var(--text-on-dark)',
								}}>
								<Space align="center">
									<UntitledIcon name="video" />
									{t('Patient.data.rehab.record')}
								</Space>
							</Button>
						</Tooltip>
					)}

					{videoState === RehabVideoState.RATING && (
						<div className="bg-neutral-950 bg-opacity-60 absolute z-10 top-60 right-0 py-4 px-7 rounded-s-full">
							<RatingFeedback
								onStopRating={onStopRating}
								selectedRating={selectedRating}
								setSelectedRating={setSelectedRating}
							/>
						</div>
					)}
					{/* {controlInstructions[videoState] && (
						<Flex justify="flex-end" align="center" gap={4}>
							<div className="bg-neutral-950 bg-opacity-60 max-w-[500px] absolute z-10 top-50 right-0 py-4 px-7 rounded-s-full">
								<Flex justify="flex-end" align="center">
									<Flex
										justify="center"
										align="center"
										style={{ height: '50px', width: '150px' }}>
										<Lottie
											lottieRef={micRef}
											animationData={checkLogo}
											loop={true}
											autoplay={true}
										/>
									</Flex>
									<img src="/images/microphone.svg" />
								</Flex>
								<Paragraph
									className="font-semibold text-lg"
									style={{ color: 'var(--text-on-dark)' }}>
									{isGestureEnabled
										? controlInstructions[videoState]?.text2
										: controlInstructions[videoState]?.text1}
								</Paragraph>
							</div>
							{isGestureEnabled && controlInstructions[videoState]?.icon}
						</Flex>
					)} */}

					{videoState === RehabVideoState.REPLAYING && (
						<>
							<Tooltip title={t('Patient.data.rehab.discard')}>
								<Button
									onClick={onDiscardRecord}
									className="header-height"
									style={{
										border: 0,
										borderRadius: 0,
										backgroundColor: 'var(--color-error-600)',
										color: 'var(--text-on-dark)',
									}}>
									<Space align="center">
										<UntitledIcon name="closeCircle" />
										{t('Patient.data.rehab.discard')}
									</Space>
								</Button>
							</Tooltip>
							<Tooltip title={t('Patient.data.rehab.submit')}>
								<Button
									onClick={onSubmitRecord}
									className="header-height"
									style={{
										border: 0,
										borderRadius: 0,
										backgroundColor: 'var(--color-success-600)',
										color: 'var(--text-on-dark)',
									}}>
									<Space align="center">
										<UntitledIcon name="check" />
										{t('Patient.data.rehab.submit')}
									</Space>
								</Button>
							</Tooltip>
						</>
					)}
					{videoState === RehabVideoState.RATING ? (
						''
					) : (
						<Tooltip title={t('Patient.data.rehab.record')}>
							<CountDownTimer
								limit={timeLimit}
								isStartingTimer={isStartingTimer}
								endedTimer={onEndedTimer}
							/>
						</Tooltip>
					)}
					<Divider
						type="vertical"
						className="h-[34px]"
						style={{ bordercolor: 'var(--color-gray-900)' }}
					/>
					<Tooltip title={t('Admin.data.rehab.flow.fullscreen')}>
						{isFullscreen ? (
							<MdFullscreenExit
								size={30}
								className="align-middle cursor-pointer custom-white-stroke"
								onClick={onFullscreen}
							/>
						) : (
							<MdFullscreen
								size={30}
								className="align-middle cursor-pointer custom-white-stroke"
								onClick={onFullscreen}
							/>
						)}
					</Tooltip>
					<Divider
						type="vertical"
						className="h-[34px]"
						style={{ bordercolor: 'var(--color-gray-900)' }}
					/>
					{flipCamera && (
						<>
							<Tooltip title={t('Patient.data.vitalscan-rom.flipCamera')}>
								<MdOutlineSwitchCamera
									size={30}
									className="align-middle cursor-pointer"
									onClick={toogleFacingMode}
								/>
							</Tooltip>
							<Divider
								type="vertical"
								className="h-[34px]"
								style={{ bordercolor: 'var(--color-gray-900)' }}
							/>
						</>
					)}
				</Flex>
			</Col>
		</Row>
	);
}
