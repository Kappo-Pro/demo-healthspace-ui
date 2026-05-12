import GetStarted from '@atoms/RehabPreAssessment/GetStarted';
import { useTypedSelector } from '@stores/index';
import { RehabPreAssesment } from '@types';
import { Flex, Typography } from 'antd';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImportantNotice } from './ImportantNotice';
import { OverallCondition } from './OverallCondition';
import { Rate } from './Rate';
import { UnReportedInjuries } from './UnReportedInjuries';
import checkLogo from './VoiceRecordingLogo.json';
import './style.css';

const { Paragraph } = Typography;

interface PreAssesmentProps {
	setActiveStep: (activeStep: number) => void;
	savedVoice: string;
	activeStep: number;
	setSavedVoice: (savedVoice: string) => void;
}

const PreAssesment = (props: PreAssesmentProps) => {
	const { activeStep, setActiveStep, savedVoice, setSavedVoice } = props;
	const [painLevel, setPainLevel] = useState(-1);
	const [overallCondition, setOverallCondition] = useState<string>('');
	const user = useTypedSelector(state => state.user);
	const { currentExercise } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const micRef = useRef<LottieRefCurrentProps>(null);
	const { t } = useTranslation();

	const userPreassesmentData: RehabPreAssesment = {
		userId: user.isPhysioterapist ? selectedUser.id : user.id,
		overallCondition: overallCondition,
		painLevel: painLevel,
		programId: currentExercise?.programId,
	};

	useEffect(() => {
		if (savedVoice.toLowerCase().includes('back'))
			setActiveStep(activeStep - 1);
		micRef.current?.play();
		setTimeout(() => {
			micRef.current?.stop();
		}, 2000);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- activeStep and setActiveStep intentionally omitted to prevent infinite loop. Effect should only trigger on savedVoice change (voice command received). setActiveStep is stable, activeStep is only read for computation.
	}, [savedVoice]);

	return (
		<Flex vertical align="center" justify="center" style={{ height: '100%' }}>
			{activeStep === 1 && (
				<Rate
					savedVoice={savedVoice}
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					setPainLevel={setPainLevel}
				/>
			)}
			{activeStep === 2 && painLevel < 8 && (
				<OverallCondition
					savedVoice={savedVoice}
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					setOverallCondition={setOverallCondition}
					painLevel={painLevel}
					setSavedVoice={setSavedVoice}
				/>
			)}
			{activeStep === 2 && painLevel >= 8 && (
				<ImportantNotice
					savedVoice={savedVoice}
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					setPainLevel={setPainLevel}
					painLevel={painLevel}
					setSavedVoice={setSavedVoice}
				/>
			)}
			{activeStep === 3 && (
				<UnReportedInjuries
					savedVoice={savedVoice}
					userPreassesmentData={userPreassesmentData}
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					setSavedVoice={setSavedVoice}
				/>
			)}
			{activeStep === 4 && (
				<GetStarted
					savedVoice={savedVoice}
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					setSavedVoice={setSavedVoice}
				/>
			)}
			<Flex vertical justify="center" align="center">
				<Flex justify="end" align="center">
					<Flex
						align="center"
						justify="center"
						style={{
							height: 'var(--spacing-50)',
							width: 'var(--spacing-150)',
						}}>
						<Lottie
							lottieRef={micRef}
							animationData={checkLogo}
							loop={false}
							autoplay={false}
						/>
					</Flex>
					<img src="/images/microphone.svg" />
				</Flex>
				{activeStep === 1 ? (
					<div className="speak-load-label">
						<Paragraph>
							{t('Admin.data.rehab.rehabPreAssessment.sayNumber')}
						</Paragraph>
						<Paragraph>
							{t('Admin.data.rehab.rehabPreAssessment.speakDesired')}
						</Paragraph>
					</div>
				) : (
					<Paragraph className="speak-load-label">
						{t('Admin.data.rehab.rehabPreAssessment.speakDesired')}
					</Paragraph>
				)}
			</Flex>
		</Flex>
	);
};

export default PreAssesment;
