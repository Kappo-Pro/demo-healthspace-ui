import { UntitledIcon } from '@atoms/Icon';
import { FaceNeutral } from '@vitalflow-icons/users/faceNeutral';
import { FaceSad } from '@vitalflow-icons/users/faceSad';
import { FaceSmile } from '@vitalflow-icons/users/faceSmile';
import { Button, Flex, Typography } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

interface OverallConditionProps {
	activeStep: number;
	setActiveStep: (activeStep: number) => void;
	setOverallCondition: (overallCondition: string) => void;
	savedVoice: string;
	painLevel: number;
	setSavedVoice: (savedVoice: string) => void;
}

export const OverallCondition = (props: OverallConditionProps) => {
	const { t } = useTranslation();
	const {
		activeStep,
		setActiveStep,
		setOverallCondition,
		savedVoice,
		painLevel,
		setSavedVoice,
	} = props;

	useEffect(() => {
		if (activeStep === 2 && painLevel < 8) {
			if (
				savedVoice.toLowerCase().includes('improving') ||
				savedVoice.toLowerCase().includes('impr') ||
				savedVoice.toLowerCase().includes('imp')
			) {
				setOverallCondition('improving');
				setActiveStep(activeStep + 1);
			} else if (
				savedVoice.toLowerCase().includes('change') ||
				savedVoice.toLowerCase() === 'no' ||
				savedVoice.toLowerCase() === 'no change'
			) {
				setSavedVoice('');
				setOverallCondition('noChange');
				setActiveStep(activeStep + 1);
			} else if (
				savedVoice.toLowerCase().includes('worsening') ||
				savedVoice.toLowerCase().includes('wor') ||
				savedVoice.toLowerCase().includes('war') ||
				savedVoice.toLowerCase().includes('as') ||
				savedVoice.toLowerCase().includes('or') ||
				savedVoice.toLowerCase().includes('vor') ||
				savedVoice.toLowerCase().includes("what's")
			) {
				setOverallCondition('worsening');
				setActiveStep(activeStep + 1);
			}
		}
	}, [
		savedVoice,
		activeStep,
		painLevel,
		setOverallCondition,
		setActiveStep,
		setSavedVoice,
	]);

	const handleBackArrow = () => {
		setSavedVoice('');
		setActiveStep(activeStep - 1);
	};

	return (
		<div style={{ userSelect: 'none' }}>
			<Flex gap={16} align="center" justify="center">
				<Button
					className="back-arrow-css"
					onClick={() => handleBackArrow()}
					icon={<UntitledIcon name="arrowLeft" />}
				/>
				<Typography className="main-heading-label">
					{t('Admin.data.rehab.rehabPreAssessment.overallCondition')}
				</Typography>
			</Flex>
			<Flex
				align="center"
				justify="space-between"
				gap={16}
				style={{ padding: 'var(--spacing-4)' }}>
				<Button
					icon={<FaceSmile width={20} height={20} />}
					style={{
						backgroundColor: 'var(--color-success-600)',
						color: 'var(--color-white)',
					}}
					onClick={() => {
						setOverallCondition('improving');
						setActiveStep(activeStep + 1);
					}}>
					{t('Admin.data.rehab.rehabPreAssessment.improving')}
				</Button>
				<Button
					icon={<FaceNeutral width={20} height={20} />}
					style={{
						backgroundColor: 'var(--color-warning-400)',
						color: 'var(--color-white)',
					}}
					onClick={() => {
						setOverallCondition('noChange');
						setActiveStep(activeStep + 1);
					}}>
					{t('Admin.data.rehab.rehabPreAssessment.noChange')}
				</Button>
				<Button
					icon={<FaceSad width={20} height={20} />}
					style={{
						backgroundColor: 'var(--color-error-600)',
						color: 'var(--color-white)',
					}}
					onClick={() => {
						setOverallCondition('worsening');
						setActiveStep(activeStep + 1);
					}}>
					{t('Admin.data.rehab.rehabPreAssessment.worsening')}
				</Button>
			</Flex>
		</div>
	);
};
