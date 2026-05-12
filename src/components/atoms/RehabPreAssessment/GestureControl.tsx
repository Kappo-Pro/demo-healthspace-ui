import { UntitledIcon } from '@atoms/Icon';
import { Button, Flex, Typography } from 'antd';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

interface GestureControlProps {
	setGestureEnabled: (isGestureEnabled: boolean) => void;
	setActiveStep: (activeStep: number) => void;
	activeStep: number;
	savedVoice: string;
	setSavedVoice: (savedVoice: string) => void;
}

export const GestureControl = ({
	setGestureEnabled,
	setActiveStep,
	activeStep,
	savedVoice,
	setSavedVoice,
}: GestureControlProps) => {
	const { t } = useTranslation();

	const handleNo = useCallback(() => {
		setGestureEnabled(false);
		setActiveStep(-1);
	}, [setGestureEnabled, setActiveStep]);

	const handleYes = useCallback(() => {
		setGestureEnabled(true);
		setActiveStep(-1);
	}, [setGestureEnabled, setActiveStep]);

	useEffect(() => {
		if (activeStep === 4) {
			if (
				savedVoice.toLowerCase().includes('cancel') ||
				savedVoice.toLowerCase().includes('cancal')
			)
				handleNo();
			else if (
				savedVoice.toLowerCase().includes('ok') ||
				savedVoice.toLowerCase().includes('okay') ||
				savedVoice.toLowerCase().includes('ok.')
			)
				handleYes();
		}
	}, [savedVoice, activeStep, handleNo, handleYes]);

	const handleBackArrow = () => {
		setSavedVoice('');
		setActiveStep(activeStep - 1);
	};

	return (
		<Flex vertical align="center" className="select-none">
			<Flex gap={16} justify="center" align="center">
				<Button
					className="back-arrow-css"
					onClick={() => handleBackArrow()}
					icon={<UntitledIcon name="arrowLeft" />}
				/>
				<Typography className="main-heading-label">
					{t('Admin.data.rehab.rehabPreAssessment.gestureControl')}
				</Typography>
			</Flex>
			<Paragraph className="main-heading-label margin-top">
				{t('Admin.data.rehab.rehabPreAssessment.gestureControlDescription')}
			</Paragraph>
			<Flex justify="center" gap={25}>
				<Button onClick={() => handleNo()}>
					{t('Admin.data.rehab.rehabPreAssessment.cancelText')}
				</Button>
				<Button onClick={() => handleYes()}>
					{t('Admin.data.rehab.rehabPreAssessment.okText')}
				</Button>
			</Flex>
		</Flex>
	);
};
