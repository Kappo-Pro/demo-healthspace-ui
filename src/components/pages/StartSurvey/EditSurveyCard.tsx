import { UntitledIcon } from '@atoms/Icon';
import { router } from '@routers/routers';
import { deleteSurvey } from '@stores/content/survey/survey';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { Survey, SurveyPaginated } from '@types';
import { Image, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

import { useNavigate } from 'react-router-dom';

interface IEditSurveyCard {
	surveyEdit: boolean;
	setSurveyEdit: (value: boolean) => void;
	item: Survey;
	setSelectedSurvey: (value: Survey) => void;
	setModalVisible: (value: boolean) => void;
	handleApproveSurvey: (item: Survey, value: boolean) => void;
	fetchHomeData: (value: number) => void;
	survey: SurveyPaginated;
}
export const EditSurveyCard = (props: IEditSurveyCard) => {
	const {
		setSurveyEdit,
		survey,
		fetchHomeData,
		item,
		setSelectedSurvey,
		setModalVisible,
		handleApproveSurvey,
	} = props;
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [approved, setApproved] = useState(
		item?.status?.toLowerCase() === 'approved',
	);
	const [active, setActive] = useState(item?.active);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const dispatch = useTypedDispatch();
	useEffect(() => {
		setApproved(item?.status?.toLowerCase() === 'approved');
		setActive(item?.active);
	}, [item]);
	const [hover, setHover] = useState(false);

	const handleDelete = async (id: string) => {
		await dispatch(deleteSurvey(id));
		message.success(t('Admin.data.survey.surveyDelete'));
		// TODO: Consider using currentPage ?? defaultValue or currentPage?.property instead of currentPage!
		fetchHomeData(
			survey?.data?.length == 1
				? (survey?.pagination?.currentPage ?? 0) - 1
				: survey?.pagination?.currentPage,
		);
	};

	return (
		<div
			className="edit-survey-card"
			key={item.id}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}>
			<div className={`survey-card`}>
				<div className="image-container">
					{item?.image ? (
						<Image
							src={item?.image}
							className="image-not-found"
							alt={t('Admin.data.survey.noImage')}
							onError={e => {
								const target = e.target as HTMLImageElement;
								target.src = '/images/white-image.png';
							}}
							style={{
								borderRadius: 'var(--radius-lg)',
								objectFit: 'contain',
								border: '2px dashed var(--border-default)',
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
							style={{
								borderRadius: 'var(--radius-lg)',
								border: '2px dashed var(--border-default)',
							}}
							preview={{
								src: '/images/white-image.png',
								mask: <UntitledIcon name="eye" size={18} />,
							}}
						/>
					)}
				</div>
				<div className="card-content">
					<div className="custom-card-div-css">
						{!hover ? (
							<div className="hover-container-css">
								<Paragraph
									className={`${active ? 'active-button-container' : 'non-active-button-container'}`}>
									{active
										? t('Admin.data.survey.active')
										: t('Admin.data.survey.nonActive')}
								</Paragraph>
								{item?.clinicallyValidated && (
									<Paragraph className="template-button-container">
										{t('Admin.data.survey.clinicallyValidatedSurvey')}
									</Paragraph>
								)}
							</div>
						) : (
							<>
								<span className="action-button-container">
									<span className={`approve-button`}>
										{approved ? (
											<Tooltip
												placement="top"
												title={t('Admin.data.survey.disableSurvey')}>
												<div
													onClick={event => {
														event.stopPropagation();
														handleApproveSurvey(item, false);
														setApproved(false);
														setActive(false);
													}}>
													<UntitledIcon
														name="checkCircle"
														size={20}
														color="var(--success-500)"
													/>
												</div>
											</Tooltip>
										) : (
											<Tooltip
												placement="top"
												title={t('Admin.data.survey.enableSurvey')}>
												<div
													onClick={event => {
														event.stopPropagation();
														handleApproveSurvey(item, true);
														setApproved(true);
														setActive(true);
													}}>
													<UntitledIcon
														name="plus"
														size={20}
														color="var(--gray-700)"
													/>
												</div>
											</Tooltip>
										)}
									</span>
									<Tooltip
										placement="top"
										title={t('Admin.data.survey.editSurvey')}>
										<span
											className="edit-button"
											onClick={_e => {
												setSurveyEdit(true);
												setSelectedSurvey(item);
												setModalVisible(true);
											}}>
											<UntitledIcon
												name="edit"
												size={18}
												color="var(--gray-700)"
											/>
										</span>
									</Tooltip>
									<Tooltip
										placement="top"
										title={t('Admin.data.survey.deleteSurvey')}>
										<div
											className="delete-button"
											onClick={() => {
												handleDelete(item?.id);
											}}>
											<UntitledIcon
												name="delete"
												size={20}
												color="var(--gray-700)"
											/>
										</div>
									</Tooltip>
									<Tooltip
										placement="top"
										title={t('Admin.data.survey.startSurvey')}>
										<div
											className="play-icon"
											onClick={() => {
												navigate(
													`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_START_SURVEY_USER}`,
													{
														state: {
															item: item,
															active: true,
														},
													},
												);
												dispatch(setActiveTab('startSurveyUser'));
											}}>
											<UntitledIcon
												name="playCircle"
												size={18}
												color="var(--gray-700)"
											/>
										</div>
									</Tooltip>
								</span>{' '}
							</>
						)}
					</div>
					<div className="card-header">
						<span
							className="survey-title"
							style={{ fontSize: 14 }}
							title={item?.title}>
							{item?.title}
						</span>{' '}
						{item?.isFinished && (
							<span style={{ color: 'var(--color-gray-500)', fontSize: 12 }}>
								({item?.isFinished && t('Admin.data.survey.completed')})
							</span>
						)}
					</div>
					<Paragraph className="survey-question-count">
						{t('Admin.data.survey.questions')}: {item?.questionList?.length}
					</Paragraph>
					<p className="survey-description-container description-container">
						<span className="description-text">{item?.description}</span>
					</p>
				</div>
			</div>
		</div>
	);
};
