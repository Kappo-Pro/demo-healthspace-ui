import { UntitledIcon } from '@atoms/Icon';
import { VideoRecorder } from '@vitalflow-icons/media/videoRecorder';
import { router } from '@routers/routers';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { postPreAssesmentResult } from '@stores/shared/patientDetail/program';
import { ProgramPreAssesment } from '@types';
import { Button, Flex, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const { Paragraph } = Typography;

interface UnReportedInjuriesProps {
	activeStep: number;
	setActiveStep: (activeStep: number) => void;
	userPreassesmentData: ProgramPreAssesment;
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

	const handleNo = () => {
		setActiveStep(activeStep + 1);
		setYes(false);
		dispatch(postPreAssesmentResult({ ...userPreassesmentData }));
	};

	const handleYes = () => {
		setYes(true);
		dispatch(postPreAssesmentResult({ ...userPreassesmentData }));
	};

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedVoice]);

	const handleBackArrow = () => {
		setSavedVoice('');
		setActiveStep(activeStep - 1);
	};

	const _buttonStyle = {
		color: 'var(--brand-primary)',
		border: 'inherit',
	};

	return !isYes ? (
		<Flex vertical align="center" className="select-none">
			<Flex gap={16} align="center">
				<Button
					style={{ borderRadius: '25px' }}
					onClick={() => handleBackArrow()}
					icon={<FaArrowLeft />}
				/>
				<Typography
					style={{
						fontWeight: 'var(--font-weight-semibold)',
					}}>
					{t('Admin.data.rehab.rehabPreAssessment.unreportedInjuries1')}
					<br />
					{t('Admin.data.rehab.rehabPreAssessment.unreportedInjuries2')}
				</Typography>
			</Flex>
			<div className="w-[250px] h-[74px] mt-[15px]">
				<Flex justify="center" gap={24} style={{ padding: 'var(--spacing-4)' }}>
					<Button onClick={() => handleNo()}>
						{t('Admin.data.rehab.rehabPreAssessment.no')}
					</Button>
					<Button onClick={() => handleYes()}>
						{t('Admin.data.rehab.rehabPreAssessment.yes')}
					</Button>
				</Flex>
			</div>
		</Flex>
	) : (
		<Flex vertical align="center" className="select-none">
			<Flex
				justify="space-around"
				align="center"
				className="mt-[130px] mb-[15px] w-[636px] h-[56px]">
				<Button
					className="!rounded-full"
					onClick={() => setYes(false)}
					icon={<FaArrowLeft />}
				/>
				<Paragraph className="w-[280px] text-white text-lg font-semibold text-center m-auto ">
					{t('Admin.data.rehab.rehabPreAssessment.title')}
				</Paragraph>
			</Flex>
			<div className="h-auto w-[636px] rounded-xl bg-[color-mix(in_srgb,var(--color-gray-50)_10%,transparent)]">
				<div className="p-[25px] pb-0">
					<Paragraph className="text-white text-base">
						{t('Admin.data.rehab.rehabPreAssessment.dearPatient')}
					</Paragraph>
					<br />
					<Paragraph className="text-white text-base">
						{t(
							'Admin.data.rehab.rehabPreAssessment.unreportedInjuriesDescription1',
						)}
					</Paragraph>
					<br />
					<Paragraph className="text-white text-base">
						{t('Admin.data.rehab.rehabPreAssessment.noticeDescription2')}
					</Paragraph>
					<br />
					<Paragraph className="text-white text-base">
						{t('Admin.data.rehab.rehabPreAssessment.noticeDescription3')}
					</Paragraph>
				</div>
				<Flex justify="center" gap={24} style={{ padding: 'var(--spacing-6)' }}>
					<Button
						className="!w-[180px] !bg-[var(--brand-tertiary)] !border-2 !border-white hover:!bg-[var(--brand-primary)] !text-white !font-semibold !text-base"
						icon={<UntitledIcon name="clipboard-check" size={20} />}
						onClick={() => {
							navigate(
								`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_VIRTUAL_EVALUATION}`,
							);
							dispatch(setActiveTab('virtualEvaluation'));
						}}>
						{t('Admin.data.rehab.rehabPreAssessment.virtualEvaluation')}
					</Button>
					<Button
						className="!bg-success-500 !border-2 !border-white !text-white hover:!bg-[var(--brand-primary)] hover:!border-none"
						icon={<VideoRecorder height={18} width={18} />}
						onClick={e => {
							e.stopPropagation();
							setActiveStep(4);
						}}>
						{t('Admin.data.rehab.rehabPreAssessment.startSession')}
					</Button>
				</Flex>
			</div>
		</Flex>
	);
};
