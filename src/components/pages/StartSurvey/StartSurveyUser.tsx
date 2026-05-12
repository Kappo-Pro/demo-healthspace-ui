import { UntitledIcon } from '@atoms/Icon';
import { CardGridSkeleton } from '@atoms/Skeletons';
import { getSurvey, saveSurveyResult } from '@stores/content/survey/survey';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { Button, Col, Empty, Image, Pagination, Row, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { SurveyOptionList } from './SurveyOptionList';

const { Paragraph } = Typography;

import {
	setActiveTab,
	setStateId,
	setSurveyStateId,
} from '@stores/shared/patientDetail/patientDetail';
import { Survey, SurveyQuestion, SurveyResultQuestionList } from '@types';
import SelectedSurvey from './CreateSurveyModal/SelectedSurvey';

export const StartSurveyUser = () => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [loading, setLoading] = useState(true);
	const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>();
	const [selectedSurveyData, setSelectedSurveyData] = useState<
		SurveyQuestion[]
	>([]);
	const [selectedOptionList, setSelectedOptionList] = useState<
		SurveyResultQuestionList[]
	>([]);
	const [showThankyou, setShowThankyou] = useState(false);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const survey = useTypedSelector(state => state.survey.survey.survey);
	const lastDivRef = useRef<HTMLDivElement>(null);
	const { state } = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (state?.active) {
			dispatch(setActiveTab('startSurveyUser'));
			setSelectedSurvey(state?.item);
			setShowThankyou(false);
			setSelectedSurveyData([state?.item?.questionList[0]]);
			navigate('.', { state: { ...state, active: false }, replace: true });
		}
	}, [state, dispatch, navigate]);

	useEffect(() => {
		if (lastDivRef.current) {
			lastDivRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [selectedSurveyData, showThankyou]);

	const fetchSurveyData = useCallback(
		async (page: number) => {
			setLoading(true);
			const payload = {
				userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
				limit: 10,
				page: page,
				approved: true,
			};
			await dispatch(getSurvey(payload));
			setLoading(false);
		},
		[user.isPhysioterapist, user.id, selectedUser, dispatch],
	);

	const saveSurvey = async () => {
		const surveyData = {
			// TODO: Consider using title ?? defaultValue or title?.property instead of title!
			title: selectedSurvey?.title,
			// TODO: Consider using description ?? defaultValue or description?.property instead of description!
			description: selectedSurvey?.description,
			// TODO: Consider using userId ?? defaultValue or userId?.property instead of userId!
			userId: selectedSurvey?.userId,
			questionList: {
				create: selectedOptionList,
			},
		};
		const data = (await dispatch(
			saveSurveyResult({
				// TODO: Consider using id ?? defaultValue or id?.property instead of id!
				surveyId: selectedSurvey?.id,
				surveyData: surveyData,
			}),
		)) as { payload: { id: string; surveyId: string } };
		dispatch(setStateId(data?.payload?.id));
		dispatch(setSurveyStateId(data?.payload?.surveyId));
	};

	useEffect(() => {
		fetchSurveyData(1);
	}, [fetchSurveyData]);

	const getQuestionTypeDescription = (questionType: string) => {
		switch (questionType) {
			case 'rate':
				return t('Admin.data.survey.selectRate');
			case 'openText':
				return t('Admin.data.survey.detailedAnswer');
			case 'multiSelect':
				return t('Admin.data.survey.allOptions');
			case 'singleSelect':
				return t('Admin.data.survey.oneOption');
			default:
				return '';
		}
	};

	const buttonStyle = {
		color: 'var(--button-text-color)',
		border: 'inherit',
		width: '100%',
		fontSize: 'var(--font-size-xs)',
	};

	if (loading) {
		return <CardGridSkeleton count={4} columns={2} />;
	}
	return (
		<div className="start-survey-user">
			{selectedSurvey ? (
				<div className={`selected-survey-container`}>
					<div
						style={{ opacity: selectedSurvey ? 100 : 0 }}
						className={`selected-survey-container-animator`}>
						<SelectedSurvey selectedSurvey={selectedSurvey} />
						{selectedSurveyData &&
							selectedSurveyData?.map((item, index) => {
								return (
									<div
										className="survey-option-list-container"
										style={{ color: 'var(--text-color-root)' }}>
										<div className="selected-survey-title-container">
											<span className="magic-wand">
												<UntitledIcon name="magic-wand" />
											</span>
											<div className="question-container">
												<p
													className="font-semibold"
													style={{ color: 'var(--text-color)' }}>
													{index + 1} - {item?.title}{' '}
												</p>
												{item?.questionType != 'rate' && (
													<p
														className="question-type"
														style={{ color: 'var(--text-color-root)' }}>
														{getQuestionTypeDescription(item?.questionType)}
													</p>
												)}
											</div>
										</div>
										<SurveyOptionList
											fetchSurveyData={fetchSurveyData}
											saveSurvey={saveSurvey}
											selectedOptionList={selectedOptionList}
											setSelectedOptionList={setSelectedOptionList}
											item={item}
											index={index}
											selectedSurveyData={selectedSurveyData}
											selectedSurvey={selectedSurvey}
											setSelectedSurvey={setSelectedSurvey}
											setSelectedSurveyData={setSelectedSurveyData}
										/>
									</div>
								);
							})}
						<div ref={lastDivRef} className="last-div-container"></div>
					</div>
				</div>
			) : (
				<div
					style={{ opacity: selectedSurvey ? 0 : 100 }}
					className={`survey-list-container`}>
					{
						// TODO: Consider using length ?? defaultValue or length?.property instead of length!
						(survey?.data?.length ?? 0) > 0 ? (
							<>
								<Row className="list-container-row" gutter={[16, 16]}>
									{survey?.data?.map(item => {
										return (
											<Col
												xs={12}
												sm={12}
												md={12}
												lg={12}
												xl={12}
												key={item?.id}>
												<div className="list-container-col">
													<div className="image-container">
														{item?.image ? (
															<Image
																src={item?.image}
																className="image-not-found"
																style={{
																	borderRadius: 'var(--radius-lg)',
																	objectFit: 'contain',
																	border: '2px dashed var(--border-default)',
																}}
																alt={t('Admin.data.survey.noImage')}
																onError={e => {
																	const target = e.target as HTMLImageElement;
																	target.src = '/images/white-image.png';
																}}
																preview={{
																	src: item?.image || '/images/white-image.png',
																	mask: <UntitledIcon name="eye" size={18} />,
																}}
															/>
														) : (
															<Image
																src="/images/white-image.png"
																className="image-not-found"
																alt={t('Admin.data.survey.noImage')}
																preview={{
																	src: '/images/white-image.png',
																	mask: <UntitledIcon name="eye" size={18} />,
																}}
																style={{
																	borderRadius: 'var(--radius-lg)',
																	border: '2px dashed var(--border-default)',
																}}
															/>
														)}
													</div>
													<div className="survey-content-container">
														<p>
															{item?.title}{' '}
															{item?.isFinished && (
																<span
																	style={{ color: 'var(--color-gray-500)' }}>
																	(
																	{item?.isFinished &&
																		t('Admin.data.survey.completed')}
																	)
																</span>
															)}
														</p>
														<span className="survey-question-count">
															{t('Admin.data.survey.questions')}:{' '}
															{item?.questionList?.length}
														</span>
														<span className="survey-description">
															{item?.description}
														</span>
														<Button
															icon={
																<UntitledIcon
																	name="clipboard-check"
																	size={14}
																/>
															}
															onClick={() => {
																setSelectedSurvey(item);
																setShowThankyou(false);
																// TODO: Consider using questionList ?? defaultValue or questionList?.property instead of questionList!
																setSelectedSurveyData([
																	item?.questionList?.[0],
																]);
															}}>
															{item?.isFinished
																? t('Admin.data.survey.startSurveyAgain')
																: t('Admin.data.survey.startSurvey')}
														</Button>
													</div>
												</div>
											</Col>
										);
									})}
								</Row>
							</>
						) : (
							<Empty
								className="empty"
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									<span style={{ color: 'var(--color-gray-300)' }}>
										{t('Admin.data.survey.noSurveysFound')}
									</span>
								}
							/>
						)
					}
					{(survey?.data?.length ?? 0) > 0 && (
						<Pagination
							current={survey?.pagination?.currentPage}
							showSizeChanger={false}
							onChange={fetchSurveyData}
							total={survey?.pagination?.totalCount}
						/>
					)}
				</div>
			)}
		</div>
	);
};
