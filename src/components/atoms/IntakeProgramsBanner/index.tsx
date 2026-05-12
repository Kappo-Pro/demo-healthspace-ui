import React from 'react';
import { Button, Typography } from 'antd';

const { Paragraph } = Typography;

const { Title } = Typography;
import './style.css';
import { useTranslation } from 'react-i18next';
import { INTAKE_STEPS } from '@stores/constants';
import { setCurrentStep } from '@stores/shared/onBoard/onBoard';
import { useTypedDispatch } from '@stores/index';

const MiniBannerSidebar = () => {
	const {t} = useTranslation()
	const dispatch = useTypedDispatch()
	return (
		<div className="mini-banner-container">
			<div className="bg-squares">
				<div className="banner-text">
					<Title level={3} className="banner-title">{t('Admin.data.intakeProcess.letsMovePrograms')}</Title>
					<Paragraph className="banner-description">
					{t('Admin.data.intakeProcess.yourExperience')}
					</Paragraph>
					<Button className="start-button start-session-css" onClick={() => dispatch(setCurrentStep(INTAKE_STEPS.INTAKE_PROGRAMS))}>
						{t('Admin.data.intakeProcess.reviewPreferences')}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default MiniBannerSidebar;
