import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { router } from '@routers/routers';
import {
	getCustomRomSessionById,
	setSelectedRom,
} from '@stores/clinical/rom/customRom';
import { StatusNormalized } from '@stores/constants';
import { addReportId, deleteReportId } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusEscalationRequired } from '@stores/patients/triage/escalationRequired';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusFollowUpRequired } from '@stores/patients/triage/followUpRequired';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusOutOfParams } from '@stores/patients/triage/outOfParams';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusPendingReview } from '@stores/patients/triage/pendingReview';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusReviewed } from '@stores/patients/triage/reviewed';
import {
	CustomRomSession,
	CustonRomSessionPaginated,
	IstatusIcon,
	OnchangeStatus,
	Status,
} from '@types';
import {
	Checkbox,
	Dropdown,
	Empty,
	Flex,
	Pagination,
	Segmented,
	Space,
	Tooltip,
	Typography,
	message,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { SummaryResultReportDownloader } from './SummaryResultReportDownloader';

const { Title } = Typography;

interface ICustomSummarySession {
	session: string;
	programId?: string;
}

const CustomSummarySession = (props: ICustomSummarySession) => {
	const { session } = props;
	const { t } = useTranslation();
	const [selectedButton, setSelectedButton] = useState<string>('completed');
	const [completedStatus, setCompletedStatus] = useState<boolean>(true);

	const segmentedOptions = [
		{ label: t('Admin.data.survey.completed'), value: 'completed' },
		{ label: t('Admin.data.menu.userRoles.inCompleted'), value: 'incompleted' },
	];
	const dispatch = useTypedDispatch();
	const [customRomSessionExercise, setCustomRomSessionExercise] =
		useState<CustonRomSessionPaginated>();
	const [isLoading, setLoading] = useState(false);

	const fetchSessionData = async (
		sessionId: string,
		page: number,
		completed: boolean,
	) => {
		setLoading(true);
		const data = await dispatch(
			getCustomRomSessionById({ customRomId: sessionId, page, completed }),
		);
		setCustomRomSessionExercise(data.payload as CustonRomSessionPaginated);
		setLoading(false);
	};

	const navigate = useNavigate();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	/* eslint-disable vitalflow/prefer-semantic-tokens */
	const statusIcons: IstatusIcon = {
		outOfParams: <StatusBadge color="var(--text-tertiary)" />,
		pendingReview: <StatusBadge color="var(--color-warning-500)" />,
		reviewed: <StatusBadge color="var(--color-success-500)" />,
		escalationRequired: <StatusBadge color="var(--color-error-600)" />,
		followUpRequired: <StatusBadge color="var(--color-warning-600)" />,
	};
	/* eslint-enable vitalflow/prefer-semantic-tokens */

	type IUpdatePostureSessionStatus = Omit<
		Record<Status, unknown>,
		'newPatients'
	>;

	const updateOmniRomStatus: IUpdatePostureSessionStatus = {
		outOfParams: updateOmniRomSessionStatusOutOfParams,
		pendingReview: updateOmniRomSessionStatusPendingReview,
		reviewed: updateOmniRomSessionStatusReviewed,
		escalationRequired: updateOmniRomSessionStatusEscalationRequired,
		followUpRequired: updateOmniRomSessionStatusFollowUpRequired,
	};

	const onChangeStatus = async (
		params: OnchangeStatus,
		item: unknown,
		completed: boolean,
	) => {
		const { sessionId, status } = params;
		message.loading({
			content: t('Admin.data.menu.patientDetail.aiAssistantRomSummary.saving'),
			key: sessionId,
		});
		await dispatch(
			updateOmniRomStatus[item.status as keyof IUpdatePostureSessionStatus]({
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
		const data = await dispatch(
			getCustomRomSessionById({
				customRomId: session,
				page: customRomSessionExercise?.pagination?.currentPage || 1,
				completed: completed,
			}),
		);
		setCustomRomSessionExercise(data.payload as CustonRomSessionPaginated);
	};

	const onPageChange = async (pageNumber: number) => {
		setLoading(true);
		fetchSessionData(session, pageNumber, completedStatus);
		setLoading(false);
	};

	useEffect(() => {
		fetchSessionData(session, 1, completedStatus);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	const reportIds = useTypedSelector(state => state.reports.reportIds);

	const healthStatus = (session: { id: string; status: Status }) => {
		const menuItems = Object.entries(StatusNormalized)
			.filter(([key]) => key !== session.status)
			.map(([status, label]) => ({
				key: status,
				label: (
					<Space className="rom-summary-badge">
						<span className="dropdown-badge">
							{statusIcons[status as keyof IstatusIcon]}
						</span>
						<span>{label}</span>
					</Space>
				),
				onClick: () => {
					onChangeStatus(
						{ sessionId: session.id, status: status as Status },
						session,
						completedStatus,
					);
				},
			}));

		return (
			<Flex gap={12} style={{ paddingRight: 0 }}>
				{session?.romPatientResults?.length >= 1 && (
					<>
						<Tooltip
							title={t(
								'Admin.data.menu.patientDetail.aiAssistantRomSummary.edit',
							)}>
							<span>
								<SummaryResultReportDownloader
									selectedRom={session}
									completedStatus={completedStatus}
									fetchSessionData={fetchSessionData}
									user={user.isPhysioterapist ? selectedUser : user}
									reportType="edit"
									color="var(--text-primary)"
								/>
							</span>
						</Tooltip>
						{completedStatus && (
							<>
								<Tooltip
									title={t(
										'Admin.data.menu.patientDetail.aiAssistantRomSummary.qrCode',
									)}>
									<span>
										<SummaryResultReportDownloader
											selectedRom={session}
											completedStatus={completedStatus}
											user={user.isPhysioterapist ? selectedUser : user}
											reportType="qr"
											color="var(--text-primary)"
										/>
									</span>
								</Tooltip>
								<Tooltip
									title={t(
										'Admin.data.menu.patientDetail.aiAssistantRomSummary.sendEmail',
									)}>
									<span>
										<SummaryResultReportDownloader
											selectedRom={session}
											completedStatus={completedStatus}
											user={user.isPhysioterapist ? selectedUser : user}
											reportType="email"
											color="var(--text-primary)"
										/>
									</span>
								</Tooltip>
								<Tooltip
									title={t(
										'Admin.data.menu.patientDetail.aiAssistantRomSummary.download',
									)}>
									<span>
										<SummaryResultReportDownloader
											selectedRom={session}
											user={user.isPhysioterapist ? selectedUser : user}
											reportType="download"
											color="var(--text-primary)"
											completedStatus={completedStatus}
										/>
									</span>
								</Tooltip>
							</>
						)}
					</>
				)}
				{user.isPhysioterapist && (
					<div className="posture-dropdown-section" style={{ marginTop: 3 }}>
						<Dropdown menu={{ items: menuItems }}>
							<a onClick={e => e.stopPropagation()}>
								{statusIcons[session.status as keyof IstatusIcon]}
							</a>
						</Dropdown>
					</div>
				)}
				<div
					style={{ paddingRight: 0 }}
					onClick={event => {
						event.stopPropagation();
					}}>
					<Checkbox
						checked={reportIds?.romSessionsIds?.includes(session.id)}
						disabled={session?.romPatientResults?.length <= 0}
						className="report-checkbox"
						onChange={e => {
							if (e.target.checked) {
								dispatch(
									addReportId({
										type: 'romSessionsIds',
										id: session.id,
									}),
								);
							} else {
								dispatch(
									deleteReportId({
										type: 'romSessionsIds',
										id: session.id,
									}),
								);
							}
						}}
					/>
				</div>
			</Flex>
		);
	};
	return (
		<>
			{isLoading ? (
				<ActivityFeedSkeleton count={6} />
			) : (
				<>
					<div className="select-none posture-collapse bg-gray-100">
						<Flex
							justify="flex-end"
							style={{ width: '100%', padding: 'var(--spacing-2-5)' }}>
							<Segmented
								options={segmentedOptions}
								value={selectedButton}
								onChange={value => {
									const newValue = value as string;
									setSelectedButton(newValue);
									if (!completedStatus && newValue === 'completed') {
										setCompletedStatus(true);
										fetchSessionData(session, 1, true);
									} else if (completedStatus && newValue === 'incompleted') {
										setCompletedStatus(false);
										fetchSessionData(session, 1, false);
									}
								}}
							/>
						</Flex>
						{(customRomSessionExercise?.data?.length ?? 0) > 0 ? (
							<>
								{customRomSessionExercise?.data?.map(
									(session: CustomRomSession) => {
										return (
											<Flex
												justify="space-between"
												align="center"
												className="header-panel !bg-white !border !border-gray-200 !rounded-lg my-1.5 p-3"
												title={
													session?.romPatientResults.length < 1
														? t('Admin.data.addToReports.noData')
														: ''
												}
												style={{
													cursor:
														session?.romPatientResults.length >= 1
															? 'pointer'
															: 'not-allowed',
												}}>
												<span
													onClick={e => {
														if (session?.romPatientResults.length >= 1) {
															e.preventDefault();
															e.stopPropagation();
															dispatch(setSelectedRom(session));
															const userId = user.isPhysioterapist
																? selectedUser.id
																: user.id;
															navigate(
																generatePath(router.USERROMSCANRESULT, {
																	userId,
																	sessionId: session?.id,
																}),
																{
																	state: {
																		status: completedStatus,
																	},
																},
															);
														}
													}}>
													{session?.title ||
														moment(session?.createdAt).local().format('LLLL')}
												</span>
												<span>{healthStatus(session)}</span>
											</Flex>
										);
									},
								)}
							</>
						) : (
							<Empty />
						)}
					</div>
					{(customRomSessionExercise?.pagination?.totalCount ?? 0) >= 5 && (
						<Flex justify="center">
							<Pagination
								current={customRomSessionExercise?.pagination?.currentPage}
								showSizeChanger={false}
								onChange={onPageChange}
								total={customRomSessionExercise?.pagination?.totalCount}
							/>
						</Flex>
					)}
				</>
			)}
		</>
	);
};

const StatusBadge = ({ color }: { color: string }) => (
	<span
		className="inline-block"
		style={{
			width: 'var(--spacing-4)',
			height: 'var(--spacing-4)',
			borderRadius: 'var(--radius-full)',
			backgroundColor: color,
		}}
	/>
);
export default CustomSummarySession;
