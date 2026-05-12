import { UntitledIcon } from '@atoms/Icon';
import { router } from '@routers/routers';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { Button, Flex, Typography } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface ImportantNoticeProps {
	activeStep: number;
	setActiveStep: (activeStep: number) => void;
	setPainLevel: (painLevel: number) => void;
	savedVoice: string;
	painLevel: number;
	setSavedVoice: (savedVoice: string) => void;
}

export const ImportantNotice = (props: ImportantNoticeProps) => {
	const {
		activeStep,
		setActiveStep,
		setPainLevel,
		savedVoice,
		painLevel,
		setSavedVoice,
	} = props;
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();

	useEffect(() => {
		if (activeStep === 2 && painLevel >= 8) {
			if (savedVoice.toLowerCase().includes('dashboard')) {
				navigate(
					`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}/dashboard`,
				);
				dispatch(setActiveTab('activity'));
			}
		}
		// Only trigger on savedVoice changes (voice command). Other deps are checked but shouldn't trigger re-runs.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedVoice]);

	return (
		<Flex vertical align="center">
			<Flex gap={16} justify="center" align="center">
				<Button
					className="back-arrow-css"
					onClick={() => {
						setSavedVoice('');
						setPainLevel(-1);
						setActiveStep(activeStep - 1);
					}}
					icon={<UntitledIcon name="arrowLeft" />}
				/>
				<Typography className="main-heading-label text-align-center">
					{t('Admin.data.rehab.rehabPreAssessment.importantNotice')}
				</Typography>
			</Flex>
			<div className="unreported-container">
				<div className="theme-text-color">
					<p>{t('Admin.data.rehab.rehabPreAssessment.dearPatient')},</p>
					<p>{t('Admin.data.rehab.rehabPreAssessment.noticeDescription1')}</p>
					<p>{t('Admin.data.rehab.rehabPreAssessment.noticeDescription2')}</p>
					<p>{t('Admin.data.rehab.rehabPreAssessment.noticeDescription3')}</p>
				</div>
				<Flex justify="center">
					<Button
						icon={<UntitledIcon name="arrowLeft" />}
						style={{
							backgroundColor: 'var(--color-success-600)',
							color: 'var(--color-white)',
						}}
						onClick={() => {
							navigate(
								`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}/dashboard`,
							);
							dispatch(setActiveTab('activity'));
						}}>
						{t('Admin.data.rehab.rehabPreAssessment.dashboard')}
					</Button>
				</Flex>
			</div>
		</Flex>
	);
};
