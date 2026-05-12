import { UntitledIcon } from '@atoms/Icon';
import { CardGridSkeleton } from '@atoms/Skeletons';
import { getSurveyData } from '@stores/content/survey/survey';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { Button, Col, Image, Row, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

import { useNavigate } from 'react-router-dom';

import { router } from '@routers/routers';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { Survey } from '@types';
import './style.css';

const StartSurvey = ({ id }: { id: string }) => {
	const { t } = useTranslation();
	const [surveyData, setSurveyData] = useState<Survey | null>(null);
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async (id: string) => {
			const action = await dispatch(getSurveyData({ id }));
			setSurveyData(action.payload);
			setLoading(false);
		};

		fetchData(id);
	}, [id, dispatch]);

	const buttonStyle = {
		color: 'var(--brand-primary)',
		border: 'inherit',
		width: '100%',
	};

	return (
		<div className="start-survey">
			{loading ? (
				<CardGridSkeleton count={3} columns={1} />
			) : (
				<div>
					<Row gutter={[16, 16]} className="start-survey-row">
						<Col span={16} key={surveyData?.id}>
							<div className="custom-container-survey">
								<div className="custom-image-container">
									{surveyData?.image ? (
										<Image
											src={surveyData?.image}
											className="image"
											alt={t('Admin.data.survey.noImage')}
											onError={e => {
												const target = e.target as HTMLImageElement;
												target.src = '/images/white-image.png';
											}}
											preview={{
												src: surveyData?.image || '/images/white-image.png',
												mask: <UntitledIcon name="eye" size={18} />,
											}}
										/>
									) : (
										<Image
											src="/images/white-image.png"
											className="image"
											alt={t('Admin.data.survey.noImage')}
											preview={{
												src: '/images/white-image.png',
												mask: <UntitledIcon name="eye" size={18} />,
											}}
										/>
									)}
								</div>
								<div className="survey-container">
									<p className="survey-title">
										{surveyData?.title}{' '}
										{surveyData?.isFinished && (
											<p className="survey-title text-gray-400">
												(
												{surveyData?.isFinished &&
													t('Admin.data.survey.completed')}
												)
											</p>
										)}
									</p>
									<Paragraph className="questions">
										{t('Admin.data.survey.questions')}:{' '}
										{surveyData?.questionList?.length}
									</Paragraph>
									<Paragraph className="description">
										{surveyData?.description}
									</Paragraph>
									{surveyData?.status === 'approved' ? (
										<Button
											className="survey-button non-finished-survey-css"
											style={buttonStyle}
											icon={<UntitledIcon name="clipboard-check" size={20} />}
											onClick={() => {
												navigate(
													`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_START_SURVEY_USER}`,
													{
														state: {
															item: surveyData,
															active: true,
														},
													},
												);
												dispatch(setActiveTab('startSurvey'));
											}}>
											{surveyData?.isFinished
												? t('Admin.data.survey.startSurveyAgain')
												: t('Admin.data.survey.startSurvey')}
										</Button>
									) : (
										<Button
											className="survey-button no-button-style"
											icon={<UntitledIcon name="clipboard-check" size={20} />}
											onClick={() => {
												message.error(t('Admin.data.survey.noSurvey'));
											}}>
											{t('Admin.data.survey.noSurvey')}
										</Button>
									)}
								</div>
							</div>
						</Col>
					</Row>
				</div>
			)}
		</div>
	);
};

export default StartSurvey;
