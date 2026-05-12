import { UntitledIcon } from '@atoms/Icon';
import { useTypedSelector } from '@stores/index';
import { RehabVideoHeaderProps, RehabVideoState } from '@types';
import { Button, Col, Divider, Row, Space, Tooltip } from 'antd';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineSwitchCamera } from 'react-icons/md';
import checkLogo from './VoiceRecordingLogo.json';

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

export default function ProgramVideoHeaderContent(
	props: RehabVideoHeaderProps,
) {
	const {
		videoState,
		onStopRecord,
		onStartRecord,
		onStopRating,
		autoStopRecord,
		onDiscardRecord,
		onSubmitRecord,
		flipCamera,
		switchCamera,
	} = props;
	const { t } = useTranslation();
	const micRef = useRef<LottieRefCurrentProps>(null);
	const { isAuto } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const isFullScreenInstructional = useTypedSelector(
		state => state.rehab.main.fullScreen,
	);

	return (
		<Row justify="end" className="header-height" style={{ textAlign: 'end' }}>
			<Col
				className="header-height"
				span={24}
				style={{
					display: 'flex',
					justifyContent: 'end',
					alignItems: 'center',
				}}>
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
							onClick={() => (isAuto ? autoStopRecord() : onStopRecord())}
							className="header-height"
							style={{
								border: 0,
								borderRadius: 0,
								backgroundColor: 'var(--color-error-600)',
								color: 'var(--text-on-dark)',
							}}>
							<Space align="center">
								{isAuto ? (
									<UntitledIcon name="arrowRight" />
								) : (
									<UntitledIcon name="closeCircle" />
								)}
								{isAuto
									? t('Patient.data.vitalscan-rom.next')
									: t('Patient.data.rehab.stop')}
							</Space>
						</Button>
					</Tooltip>
				)}
				{!isAuto &&
					videoState === RehabVideoState.START &&
					!isFullScreenInstructional && (
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
				{/* {videoState === RehabVideoState.RATING && (
          <div className='bg-black bg-opacity-60 absolute z-10 top-60 right-0 py-4 px-7 rounded-s-full'>
            <RatingFeedback onStopRating={onStopRating} selectedRating={selectedRating} setSelectedRating={setSelectedRating} />
          </div>
        )} */}
				{!isAuto &&
					controlInstructions[videoState] &&
					!isFullScreenInstructional && (
						<div className="voice-instructions-container">
							<div>
								<div className="voice-instructions-inner">
									<div className="lottie-animation-container">
										<Lottie
											lottieRef={micRef}
											animationData={checkLogo}
											loop={true}
											autoplay={true}
										/>
									</div>
									<img src="/images/microphone.svg" />
								</div>
								<p className="voice-instruction-text">
									{controlInstructions[videoState]?.text1}
								</p>
							</div>
						</div>
					)}
				{!isAuto && videoState === RehabVideoState.REPLAYING && (
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

				{flipCamera && (
					<>
						<Divider
							type="vertical"
							style={{ height: '34px', borderColor: 'var(--color-gray-900)' }}
						/>
						<Tooltip
							title={
								videoState === RehabVideoState.RECORDING ||
								videoState === RehabVideoState.READY
									? ' (Disabled during recording)'
									: t('Patient.data.vitalscan-rom.flipCamera')
							}>
							<MdOutlineSwitchCamera
								size={30}
								className="camera-switch-icon"
								onClick={
									videoState === RehabVideoState.RECORDING ||
									videoState === RehabVideoState.READY
										? () => {}
										: switchCamera
								}

								//disabled={videoState === RehabVideoState.RECORDING}
							/>
						</Tooltip>
						<Divider
							type="vertical"
							style={{ height: '34px', borderColor: 'var(--color-gray-900)' }}
						/>
					</>
				)}
			</Col>
		</Row>
	);
}
