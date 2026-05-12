import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { StatusNormalized } from '@stores/constants';
import { addReportId, deleteReportId } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { updateSurveySessionStatus as updateSurveySessionStatusEscalationRequired } from '@stores/patients/triage/escalationRequired';
import { updateSurveySessionStatus as updateSurveySessionStatusFollowUpRequired } from '@stores/patients/triage/followUpRequired';
import { updateSurveySessionStatus as updateSurveySessionStatusOutOfParams } from '@stores/patients/triage/outOfParams';
import { updateSurveySessionStatus as updateSurveySessionStatusPendingReview } from '@stores/patients/triage/pendingReview';
import { updateSurveySessionStatus as updateSurveySessionStatusReviewed } from '@stores/patients/triage/reviewed';
import {
	IstatusIcon,
	OnchangeStatus,
	Status,
	SummaryContentProps,
	SurveyResult,
} from '@types';
import type { MenuProps } from 'antd';
import {
	Checkbox,
	Collapse,
	Dropdown,
	Pagination,
	Space,
	Typography,
	message,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const { Paragraph } = Typography;

const StatusBadge = ({ color }: { color: string }) => (
	<span
		className="inline-block"
		style={{
			width: 'var(--spacing-4)',
			height: 'var(--spacing-4)',
			borderRadius: 'var(--radius-full)',
			backgroundColor: color,
			marginTop:'4px'
		}}
	/>
);

export default function SurveySummaryContent(props: SummaryContentProps) {
	const {
		handlePanelChange,
		handleClick,
		item,
		activePanelKey,
		index,
		selectedCollapse,
		setSelectedCollapse,
		isLoading,
		surveySessionData,
		getPainLevel,
		totalCount,
		pageHandle,
		currentCount,
		fetchSurveyByIdData,
		surveyIdData,
		setSurveyIdData,
	} = props;

	const { state } = useLocation();
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const [statusSave, setStatusSave] = useState('');
	const reportIds = useTypedSelector(state => state.reports.reportIds);

	const stateId = useTypedSelector(
		state => state.patientDetail.patientDetail.stateId,
	);
	const surveyStateId = useTypedSelector(
		state => state.patientDetail.patientDetail.surveyStateId,
	);

	useEffect(() => {
		if (statusSave) {
			fetchSurveyByIdData(surveyIdData, currentCount);
		}
	}, [statusSave]);

	useEffect(() => {
		if (state?.session?.surveyId) {
			fetchSurveyByIdData(state.session.surveyId, 1);
			setSurveyIdData(state.session.surveyId);
		}
	}, []);

	const statusIcons: IstatusIcon = {
		outOfParams: <StatusBadge color="var(--text-tertiary)" />,
		pendingReview: <StatusBadge color="var(--color-warning-500)" />,
		reviewed: <StatusBadge color="var(--color-success-500)" />,
		escalationRequired: <StatusBadge color="var(--color-error-600)" />,
		followUpRequired: <StatusBadge color="var(--color-warning-600)" />,
	};

	type IUpdateRomSessionStatus = Omit<Record<Status, unknown>, 'newPatients'>;

	const updateSurveySession: IUpdateRomSessionStatus = {
		outOfParams: updateSurveySessionStatusOutOfParams,
		pendingReview: updateSurveySessionStatusPendingReview,
		reviewed: updateSurveySessionStatusReviewed,
		escalationRequired: updateSurveySessionStatusEscalationRequired,
		followUpRequired: updateSurveySessionStatusFollowUpRequired,
	};

	const onChangeStatus = async (params: OnchangeStatus, item: SurveyResult) => {
		const { sessionId, status } = params;

		message.loading({
			content: t('Admin.data.menu.patientDetail.aiAssistantRomSummary.saving'),
			key: sessionId,
		});

		await dispatch(
			updateSurveySession[item.status as keyof IUpdateRomSessionStatus]({
				sessionId,
				body: { status },
			}),
		);

		message.success({
			content: t(
				'Admin.data.menu.patientDetail.aiAssistantRomSummary.statusSuccess',
			),
			key: sessionId,
			duration: 3,
		});

		fetchSurveyByIdData(surveyIdData, currentCount);
	};

	const healthStatus = (item: SurveyResult) => {
		const menuItems: MenuProps['items'] = Object.entries(StatusNormalized)
			.filter(([key]) => key !== item.status)
			.map(([status, label]) => ({
				key: status,
				label: (
					<Space>
						<span>{statusIcons[status as keyof IstatusIcon]}</span>
						<span>{label}</span>
					</Space>
				),
				onClick: () => {
					onChangeStatus(
						{ sessionId: item.id, status: status as Status },
						item,
					);
					setStatusSave(status);
				},
			}));

		return user.isPhysioterapist ? (
			<Dropdown
				className="survey-summary-status-icon"
				menu={{ items: menuItems }}>
				<a onClick={e => e.stopPropagation()}>
					{statusIcons[item.status as keyof IstatusIcon]}
				</a>
			</Dropdown>
		) : null;
	};

	return (
		<Collapse
			defaultActiveKey={surveyStateId}
			className="collapse-panel-container"
			activeKey={activePanelKey === item.id ? [item.id] : undefined}
			bordered={false}
			key={item.id}
			onChange={() => {
				handlePanelChange(item.id);
				handleClick(item.id);
			}}>
			<Collapse.Panel
				className="header-panel panel-div"
				key={item.id}
				header={
					<div className="panel-header-div">
						<span>{item.title || `Survey Result - ${index + 1}`}</span>
					</div>
				}>
				{isLoading ? (
					<ActivityFeedSkeleton count={6} />
				) : (
					<>
						<Collapse
							bordered={false}
							defaultActiveKey={selectedCollapse || stateId}
							onChange={key => setSelectedCollapse(key)}
							className="second-collapse-div">
							{surveySessionData?.map((item: SurveyResult) => {
								let totalScore = 0;
								item.questionList.forEach(q => {
									totalScore += q.score || 0;
								});

								return (
									<Collapse.Panel
										key={item.id}
										className="header-panel header-panel-second"
										collapsible="header"
										header={
											<div className="second-panel-header">
												<span className="created-date">
													{moment(item.createdAt).local().format('LLL')}
												</span>
											</div>
										}
										extra={
											<div style={{ display: 'flex', alignItems: 'center' }}>
												<div
													className="panel-controls"
													style={{ marginRight: 'var(--spacing-2-5)' }}>
													<span onClick={e => e.stopPropagation()}>
														{healthStatus(item)}
													</span>

													{totalScore !== 0 && (
														<span className="score-badge">
															Score : {totalScore}
														</span>
													)}
												</div>
												<div>
													<Checkbox
														checked={reportIds?.surveyResultIds?.includes(
															item.id,
														)}
														onChange={e => {
															if (e.target.checked) {
																dispatch(
																	addReportId({
																		type: 'surveyResultIds',
																		id: item.id,
																	}),
																);
															} else {
																dispatch(
																	deleteReportId({
																		type: 'surveyResultIds',
																		id: item.id,
																	}),
																);
															}
														}}
													/>
												</div>
											</div>
										}>
										{item.questionList.map((question, i) => (
											<div key={i} className="question-box">
												<div className="question-header">
													<Paragraph>
														{i + 1} - {question.question}
													</Paragraph>
													{question.score != null && (
														<Paragraph className="score-badge">
															{question.score}
														</Paragraph>
													)}
												</div>
												<hr />

												{question.questionType === 'rate' ? (
													<Paragraph>
														{getPainLevel(question.ratingLevel ?? 0, question)}
													</Paragraph>
												) : question.questionType === 'openText' ? (
													<Paragraph>{question.selectedAnswer}</Paragraph>
												) : question.questionType === 'singleSelect' ? (
													<ul>
														<li>- {question.selectedAnswer}</li>
													</ul>
												) : (
													<ul>
														{question.answerList?.map((ans, idx) => (
															<li key={idx}>- {ans}</li>
														))}
													</ul>
												)}
											</div>
										))}
									</Collapse.Panel>
								);
							})}
						</Collapse>

						{totalCount > 9 && (
							<Pagination
								current={currentCount}
								onChange={pageHandle}
								total={totalCount}
							/>
						)}
					</>
				)}
			</Collapse.Panel>
		</Collapse>
	);
}
