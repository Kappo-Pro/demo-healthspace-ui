import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setAutoMode, setTransitionTime } from '@stores/shared/patientDetail/program';
import { Button, Flex, Typography } from 'antd';
import Lottie from 'lottie-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import checkLogo from './VoiceRecordingLogo.json';

interface GetStartedProps {
	activeStep: number;
	setActiveStep: (activeStep: number) => void;
	savedVoice: string;
	setSavedVoice: (savedVoice: string) => void;
}

const GetStarted = (props: GetStartedProps) => {
	const { activeStep, setActiveStep, setSavedVoice } = props;
	const transitionOptions = [3, 5, 8, 10];
	const { transitionTime } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();

	const isEdge = useMemo(() => /Edg/i.test(navigator.userAgent), []);

	return (
		<Flex
			vertical
			justify="center"
			align="center"
			style={{
				width: '100%',
				position: 'absolute',
				background: 'var(--mainmenu-bg-color)',
				zIndex: 10,
				height: '100%',
				color: 'var(--color-white)',
				textAlign: 'center',
			}}>
			<Flex
				vertical
				gap={10}
				style={{
					width: 551,
					zIndex: 10,
					fontSize: 20,
					padding: 20,
					gap: 10,
				}}>
				<Flex justify="center" align="center" gap={8}>
					<Button
						className="back-arrow-css"
						onClick={() => {
							setSavedVoice('');
							setActiveStep(activeStep - 1);
						}}
						icon={<UntitledIcon name="arrowLeft" size={16} />}
					/>
					<Typography className="main-heading-label text-align-center">
						{t('Patient.data.vitalscan-rom.transitionTime')}
					</Typography>
				</Flex>
				<Typography className="main-heading-label text-align-center">
					{t('Patient.data.vitalscan-rom.transitionExercise')}{' '}
					<span className="font-semibold">
						{transitionTime} {t('Patient.data.vitalscan-rom.secs')}
					</span>
					.
				</Typography>
				<Typography className="main-heading-label text-align-center">
					{t('Patient.data.vitalscan-rom.keepTime')}:
				</Typography>
				<Flex justify="space-between" gap={16}>
					{transitionOptions.map(time => {
						return (
							<Button
								onClick={() => {
									setActiveStep(6);
									dispatch(setTransitionTime(time));
								}}>
								{time} {t('Patient.data.vitalscan-rom.secs')}
							</Button>
						);
					})}
					{!isEdge && (
						<Button
							onClick={() => {
								dispatch(setAutoMode(false));
								setActiveStep(-1);
							}}>
							{t('Patient.data.vitalscan-rom.manualOpt')}
						</Button>
					)}
				</Flex>

				<Flex
					align="center"
					justify="center"
					style={{
						height: 'var(--spacing-50)',
						width: 'var(--spacing-150)',
					}}>
					<Lottie animationData={checkLogo} loop autoplay />
					<img src="/images/microphone.svg" />
				</Flex>
				<Typography className="speak-load-label">
					{t('Admin.data.rehab.rehabPreAssessment.speakDesired')}
				</Typography>
			</Flex>
		</Flex>
	);
};

export default GetStarted;
