import { GestureControl } from '@atoms/RehabPreAssessment/GestureControl';
import GetStarted from '@atoms/RehabPreAssessment/GetStarted';
import { ImportantNotice } from '@atoms/RehabPreAssessment/ImportantNotice';
import { OverallCondition } from '@atoms/RehabPreAssessment/OverallCondition';
import { Rate } from '@atoms/RehabPreAssessment/Rate';
import checkLogo from '@atoms/RehabPreAssessment/VoiceRecordingLogo.json';
import { useTypedSelector } from '@stores/index';
import { ProgramPreAssesment } from '@types';
import { Flex, Typography } from 'antd';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UnReportedInjuries } from './UnReportedInjuries';

const { Paragraph } = Typography;

interface PreAssesmentProps {
	setGestureEnabled: (isGestureEnabled: boolean) => void;
	setActiveStep: (activeStep: number) => void;
	savedVoice: string;
	activeStep: number;
	setSavedVoice: (savedVoice: string) => void;
}

const PreAssesment = (props: PreAssesmentProps) => {
	const {
		activeStep,
		setActiveStep,
		savedVoice,
		setGestureEnabled,
		setSavedVoice,
	} = props;
	const [painLevel, setPainLevel] = useState(-1);
	const [overallCondition, setOverallCondition] = useState<string>('');
	const { currentExercise } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const micRef = useRef<LottieRefCurrentProps>(null);
	const { t } = useTranslation();
	const userPreassesmentData: ProgramPreAssesment = {
		// TODO: Consider using programId ?? defaultValue or programId?.property instead of programId!
		programId: currentExercise?.programId,
		overallCondition: overallCondition,
		painLevel: painLevel,
	};

	useEffect(() => {
		if (savedVoice.toLowerCase().includes('back'))
			setActiveStep(activeStep - 1);
		micRef.current?.play();
		setTimeout(() => {
			micRef.current?.stop();
		}, 2000);
	}, [savedVoice, activeStep, setActiveStep]);

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
			{activeStep === 5 && (
				<GestureControl
					savedVoice={savedVoice}
					setGestureEnabled={setGestureEnabled}
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					setSavedVoice={setSavedVoice}
				/>
			)}
			{activeStep != 4 && activeStep != 6 && (
				<Flex vertical justify="center" align="center">
					<Flex justify="end" align="center">
						<Flex
							align="center"
							justify="center"
							className="h-[50px] w-[150px]">
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
						<div>
							<Paragraph className="max-w-[360px] text-center font-semibold text-lg text-white">
								{t('Admin.data.rehab.rehabPreAssessment.sayNumber')}
							</Paragraph>
							<Paragraph className="font-semibold text-lg text-white">
								{t('Admin.data.rehab.rehabPreAssessment.speakDesired')}
							</Paragraph>
						</div>
					) : (
						<Paragraph className="font-semibold text-lg text-white">
							{t('Admin.data.rehab.rehabPreAssessment.speakDesired')}
						</Paragraph>
					)}
				</Flex>
			)}
		</Flex>
	);
};

export default PreAssesment;
