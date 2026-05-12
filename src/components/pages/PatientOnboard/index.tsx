import { OnboardHeader } from '@molecules/OnboardHeader';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getConsentFormTemplate } from '@stores/shared/settings/settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AssociatedSymptoms from './AssociatedSymptoms';
import FunctionalGoals from './FunctionalGoals';
import MedicalHistory from './MedicalHistory';
import OnboardProfileForm from './OnboardProfileForm';
import PainAssessment from './PainAssessment';
import PatientPainStatus from './PatientPainStatus';
import PostureAnalysis from './PostureAnalysis/PostureAnalysis';
import PreExistingCondition from './PreExistingCondition';
import RangeOfMotion from './RangeOfMotion/RangeOfMotion';
import WholeDayActivity from './WholeDayActivity';
import './style.css';

interface StepConfigValue {
	titleKey: string;
	descriptionKey?: string;
	customDescription?: boolean;
}

const STEP_CONFIG: Record<number, StepConfigValue> = {
	1: {
		titleKey: 'Patient.data.onboard.completeProfile',
		descriptionKey: 'Patient.data.onboard.completeProfileDescription',
	},
	2: {
		titleKey: 'Patient.data.onboard.choosePath',
		descriptionKey: 'Patient.data.onboard.selectCategory',
	},
	3: {
		titleKey: 'Patient.data.onboard.painAssessment',
		descriptionKey: 'Patient.data.onboard.painAssessmentDescription',
	},
	4: {
		titleKey: 'Patient.data.onboard.associatedSymptoms',
		descriptionKey: 'Patient.data.onboard.associatedSymptomsDescription',
	},
	5: {
		titleKey: 'Patient.data.onboard.medicalHistory',
		descriptionKey: 'Patient.data.onboard.medicalHistoryDescription',
	},
	6: {
		titleKey: 'Patient.data.onboard.functionalGoals',
		descriptionKey: 'Patient.data.onboard.functionalGoalsDescription',
	},
	7: {
		titleKey: 'Patient.data.onboard.howSpend',
		descriptionKey: 'Patient.data.onboard.selectApply',
	},
	8: {
		titleKey: 'Patient.data.onboard.rangeOfMotion',
		descriptionKey: 'Patient.data.onboard.rangeOfMotionDescription',
	},
	9: {
		titleKey: 'Patient.data.onboard.postureAnalysis',
		descriptionKey: 'Patient.data.onboard.postureAnalysisDescription',
	},
};

// Special config for pre-existing conditions (when painStatusButton === 'noPain')
const PRE_EXISTING_CONFIG: StepConfigValue = {
	titleKey: 'Patient.data.onboard.preExistingTitle',
	customDescription: true,
};

export default function PatientOnboard({
	onComplete,
}: {
	onComplete: () => void;
}) {
	const { t } = useTranslation();
	const [activeStep, setActiveStep] = useState(1);
	const savedActiveStep = useTypedSelector(
		state => state.onBoard.onBoard.activeStep,
	);
	const painStatusButton = useTypedSelector(
		state => state.onBoard.onBoard.painStatusButton,
	);
	const [navigatorDirection, setNavigatorDirection] = useState<
		'forward' | 'backward'
	>('forward');
	const dispatch = useTypedDispatch();

	// No-op for legacy child components - stepper handles progress visually
	const handleProgressPercent = () => {};

	const handleBack = () => {
		if (activeStep > 1) {
			setNavigatorDirection('backward');

			// Special handling for pre-existing condition flow (noPain path)
			if (activeStep === 5 && painStatusButton === 'noPain') {
				// Skip steps 3 & 4, go back to step 2 (PatientPainStatus)
				setActiveStep(2);
			} else {
				setActiveStep(prev => prev - 1);
			}
		}
	};

	const handleStepCompletion = () => {
		if (activeStep === 9) {
			onComplete();
		} else {
			setActiveStep(prev => prev + 1);
		}
	};

	useEffect(() => {
		const fetchConsentFormTemplate = async () => {
			await dispatch(getConsentFormTemplate());
		};
		fetchConsentFormTemplate();
	}, [dispatch]);

	const currentStep = savedActiveStep === 9 ? 9 : activeStep;

	// Use special config for pre-existing conditions page
	const isPreExistingStep = activeStep === 5 && painStatusButton === 'noPain';
	const stepConfig = isPreExistingStep
		? PRE_EXISTING_CONFIG
		: STEP_CONFIG[currentStep] || STEP_CONFIG[1];

	// Build description - special handling for pre-existing conditions with highlighted YES
	const getDescription = () => {
		if (stepConfig.customDescription) {
			return (
				<>
					{t('Patient.data.onboard.preExistingDescription1')}{' '}
					<span
						style={{
							fontWeight: 'var(--font-weight-semibold)',
							color: 'var(--brand-primary)',
						}}>
						{t('Patient.data.onboard.yes').toUpperCase()}
					</span>{' '}
					{t('Patient.data.onboard.preExistingDescription2')}
				</>
			);
		}
		return stepConfig.descriptionKey ? t(stepConfig.descriptionKey) : undefined;
	};

	return (
		<>
			<OnboardHeader
				title={t(stepConfig.titleKey)}
				description={getDescription()}
				currentStep={currentStep}
				onBack={handleBack}
				showBack={activeStep > 1}
			/>
			<div className="onboard-main-container">
				<div className="onboard-sub-container">
					{activeStep === 1 && (
						<OnboardProfileForm
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{activeStep === 2 && (
						<PatientPainStatus
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{activeStep === 3 && (
						<PainAssessment
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{activeStep === 4 && (
						<AssociatedSymptoms
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{activeStep === 5 && painStatusButton !== 'noPain' && (
						<MedicalHistory
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{activeStep === 5 && painStatusButton === 'noPain' && (
						<PreExistingCondition
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{activeStep === 6 && (
						<FunctionalGoals
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{activeStep === 7 && (
						<WholeDayActivity
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{activeStep === 8 && savedActiveStep != 9 && (
						<RangeOfMotion
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							navigatorDirection={navigatorDirection}
							setNavigatorDirection={setNavigatorDirection}
						/>
					)}
					{(savedActiveStep === 9 || activeStep === 9) && (
						<PostureAnalysis
							setActiveStep={setActiveStep}
							setProgressPercent={handleProgressPercent}
							onComplete={handleStepCompletion}
						/>
					)}
				</div>
			</div>
		</>
	);
}
