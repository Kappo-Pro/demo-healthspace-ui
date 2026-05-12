import { UntitledIcon } from '@atoms/Icon';
// REMOVED: import { VideoRecorder } from "@vitalflow-icons/media/videoRecorder"
import { router } from '@routers/routers';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { postPreAssesmentResult } from '@stores/shared/patientDetail/program';
import { RehabPreAssesment } from '@types';
import { Button, Flex, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface UnReportedInjuriesProps {
	activeStep: number;
	setActiveStep: (activeStep: number) => void;
	userPreassesmentData: RehabPreAssesment;
	savedVoice: string;
	setSavedVoice: (savedVoice: string) => void;
}

export const UnReportedInjuries = (props: UnReportedInjuriesProps) => {
	const {
		activeStep,
		setActiveStep,
		userPreassesmentData,
		savedVoice,
		setSavedVoice,
	} = props;
	const dispatch = useTypedDispatch();
	const [isYes, setYes] = useState(false);
	const navigate = useNavigate();
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	useEffect(() => {
		if (activeStep === 3) {
			if (
				savedVoice.toLowerCase().includes('virtual evaluation') ||
				savedVoice.toLowerCase().includes('virtual evolution') ||
				savedVoice.toLowerCase().includes('virtual')
			) {
				navigate(
					`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_VIRTUAL_EVALUATION}`,
				);
				dispatch(setActiveTab('virtualEvaluation'));
			} else if (
				savedVoice.toLowerCase().includes('start session') ||
				savedVoice.toLowerCase().includes('session') ||
				savedVoice.toLowerCase().includes('start')
			)
				setActiveStep(activeStep + 1);
			else if (savedVoice.toLowerCase() === 'no') handleNo();
			else if (savedVoice.toLowerCase() === 'yes') handleYes();
		}
	}, [savedVoice]);

	const handleNo = () => {
		setActiveStep(activeStep + 1);
		setYes(false);
		dispatch(postPreAssesmentResult({ ...userPreassesmentData }));
	};

	const handleYes = () => {
		setYes(true);
		dispatch(postPreAssesmentResult({ ...userPreassesmentData }));
	};

	const handleBackArrow = () => {
		setSavedVoice('');
		setActiveStep(activeStep - 1);
	};

	return !isYes ? (
		<Flex vertical align="center" gap={16}>
			<Flex gap={16} justify="center">
				<Button
					className="back-arrow-css"
					onClick={() => handleBackArrow()}
					icon={<UntitledIcon name="arrowLeft" />}
				/>
				<Typography className="main-heading-label text-align-center">
					{t('Admin.data.rehab.rehabPreAssessment.unreportedInjuries1')}
					<br />
					{t('Admin.data.rehab.rehabPreAssessment.unreportedInjuries2')}
				</Typography>
			</Flex>

			<Flex justify="center" gap={25}>
				<Button onClick={() => handleNo()}>
					{t('Admin.data.rehab.rehabPreAssessment.no')}
				</Button>
				<Button onClick={() => handleYes()}>
					{t('Admin.data.rehab.rehabPreAssessment.yes')}
				</Button>
			</Flex>
		</Flex>
	) : (
		<Flex vertical align="center">
			<Flex gap={16} justify="center">
				<Button
					className="back-arrow-css"
					onClick={() => setYes(false)}
					icon={<UntitledIcon name="arrowLeft" />}
				/>
				<Typography className="main-heading-label text-align-center">
					{t('Admin.data.rehab.rehabPreAssessment.unreportedInjuries1')}
					<br />
					{t('Admin.data.rehab.rehabPreAssessment.unreportedInjuries2')}
				</Typography>
			</Flex>
			<div className="unreported-container">
				<div className="theme-text-color">
					<p>{t('Admin.data.rehab.rehabPreAssessment.dearPatient')}</p>
					<p>
						{t(
							'Admin.data.rehab.rehabPreAssessment.unreportedInjuriesDescription1',
						)}
					</p>
					<p>{t('Admin.data.rehab.rehabPreAssessment.noticeDescription2')}</p>
					<p>{t('Admin.data.rehab.rehabPreAssessment.noticeDescription3')}</p>
				</div>
				<Flex justify="center" gap={25}>
					<Button
						icon={<UntitledIcon name="clipboard-check" size={20} />}
						style={{
							backgroundColor: 'var(--color-purple-700)',
							color: 'var(--color-white)',
						}}
						onClick={() => {
							navigate(
								`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_VIRTUAL_EVALUATION}`,
							);
							dispatch(setActiveTab('virtualEvaluation'));
						}}>
						{t('Admin.data.rehab.rehabPreAssessment.virtualEvaluation')}
					</Button>
					<Button
						icon={<UntitledIcon name="video" />}
						style={{
							backgroundColor: 'var(--color-success-600)',
							color: 'var(--color-white)',
						}}
						onClick={e => {
							e.stopPropagation();
							setActiveStep(activeStep + 1);
						}}>
						{t('Admin.data.rehab.rehabPreAssessment.startSession')}
					</Button>
				</Flex>
			</div>
		</Flex>
	);
};
