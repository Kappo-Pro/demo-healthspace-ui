import { UntitledIcon } from '@atoms/Icon';
import VideoPlayer from '@atoms/VideoPlayer';
import { StatusNormalized } from '@stores/constants';
import { addReportId, deleteReportId } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { updateRehabSessionStatus as updateOmniRomSessionStatusEscalationRequired } from '@stores/patients/triage/escalationRequired';
import { updateRehabSessionStatus as updateOmniRomSessionStatusFollowUpRequired } from '@stores/patients/triage/followUpRequired';
import { updateRehabSessionStatus as updateOmniRomSessionStatusOutOfParams } from '@stores/patients/triage/outOfParams';
import { updateRehabSessionStatus as updateOmniRomSessionStatusPendingReview } from '@stores/patients/triage/pendingReview';
import { updateRehabSessionStatus as updateOmniRomSessionStatusReviewed } from '@stores/patients/triage/reviewed';
import { setSessionClicked } from '@stores/shared/patientDetail/program';
import {
	AiProgramSummaryContent as AiProgramSummaryContentProps,
	IstatusIcon,
	OnchangeStatus,
	ProgramSession,
	ProgramSessionResult,
	Status,
} from '@types';
import {
	Checkbox,
	Collapse,
	Dropdown,
	Empty,
	Flex,
	Image,
	Space,
	Tag,
	Tooltip,
	message,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import './style.css';

const painLevelData = {
	0: {
		color: 'var(--color-success-400)',
		icon: (
			<UntitledIcon
				name="faceHappy"
				size={20}
				style={{ stroke: 'var(--color-success-400)' }}
			/>
		),
	},
	1: {
		color: 'var(--color-success-600)',
		icon: (
			<UntitledIcon
				name="faceWink"
				size={20}
				style={{ stroke: 'var(--color-success-600)' }}
			/>
		),
	},
	2: {
		color: 'var(--color-success-500)',
		icon: (
			<UntitledIcon
				name="faceSmile"
				size={20}
				style={{ stroke: 'var(--color-success-500)' }}
			/>
		),
	},
	3: {
		color: 'var(--color-success-300)',
		icon: (
			<UntitledIcon
				name="faceSmile"
				size={20}
				style={{ stroke: 'var(--color-success-300)' }}
			/>
		),
	},
	4: {
		color: 'var(--color-warning-300)',
		icon: (
			<UntitledIcon
				name="faceNeutral"
				size={20}
				style={{ stroke: 'var(--color-warning-300)' }}
			/>
		),
	},
	5: {
		color: 'var(--color-warning-400)',
		icon: (
			<UntitledIcon
				name="faceNeutral"
				size={20}
				style={{ stroke: 'var(--color-warning-400)' }}
			/>
		),
	},
	6: {
		color: 'var(--color-warning-500)',
		icon: (
			<UntitledIcon
				name="faceSad"
				size={20}
				style={{ stroke: 'var(--color-warning-500)' }}
			/>
		),
	},
	7: {
		color: 'var(--color-warning-600)',
		icon: (
			<UntitledIcon
				name="faceSad"
				size={20}
				style={{ stroke: 'var(--color-warning-600)' }}
			/>
		),
	},
	8: {
		color: 'var(--color-error-500)',
		icon: (
			<UntitledIcon
				name="faceFrown"
				size={20}
				style={{ stroke: 'var(--color-error-500)' }}
			/>
		),
	},
	9: {
		color: 'var(--color-error-600)',
		icon: (
			<UntitledIcon
				name="faceFrown"
				size={20}
				style={{ stroke: 'var(--color-error-600)' }}
			/>
		),
	},
	10: {
		color: 'var(--color-error-700)',
		icon: (
			<UntitledIcon
				name="faceFrown"
				size={20}
				style={{ stroke: 'var(--color-error-700)' }}
			/>
		),
	},
};

const StatusBadge = ({ color }: { color: string }) => (
	<span
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: 'var(--spacing-4)',
			height: 'var(--spacing-4)',
			borderRadius: 'var(--radius-full)',
			backgroundColor: color,
			flexShrink: 0,
			marginTop: 'var(--spacing-1)',
		}}
	/>
);

export default function AiProgramSummaryContent(
	props: AiProgramSummaryContentProps,
) {
	const {
		programIdData,
		currentCount,
		fetchProgramByIdList,
		programSessionData,
		isLoading,
		CustomModalInfo,
		setRehabExerciseToPatientId,
		setProgramuTutorialVideo,
		setProgramDescription,
		setExerciseTitle,
		activeInnerKey,
		setActiveInnerKey
	} = props;
	const [selectedCollapse, setSelectedCollapse] = useState<
		string[] | string | undefined
	>();

	const user = useTypedSelector(state => state.user);
	const reportIds = useTypedSelector(state => state.reports.reportIds);
	const stateId = useTypedSelector(
		state => state.patientDetail.patientDetail.stateId,
	);
	const dispatch = useTypedDispatch();

	const handleExtraHeader = (session: ProgramSession) => {
		const statusIcons: IstatusIcon = {
			outOfParams: <StatusBadge color="var(--text-tertiary)" />,
			pendingReview: <StatusBadge color="var(--color-warning-500)" />,
			reviewed: <StatusBadge color="var(--color-success-500)" />,
			escalationRequired: <StatusBadge color="var(--color-error-600)" />,
			followUpRequired: <StatusBadge color="var(--color-warning-600)" />,
		};

		const updateRehabSessionStatus: Record<Status, unknown> = {
			outOfParams: updateOmniRomSessionStatusOutOfParams,
			pendingReview: updateOmniRomSessionStatusPendingReview,
			reviewed: updateOmniRomSessionStatusReviewed,
			escalationRequired: updateOmniRomSessionStatusEscalationRequired,
			followUpRequired: updateOmniRomSessionStatusFollowUpRequired,
		};

		const onChangeStatus = async (params: OnchangeStatus) => {
			const { sessionId, status } = params;

			message.loading({ content: 'Saving…', key: sessionId });

			await dispatch(
				updateRehabSessionStatus[status]({
					sessionId,
					body: { status },
				}) as unknown,
			);

			message.success({ content: 'Updated', key: sessionId });
			fetchProgramByIdList(programIdData, currentCount);
		};

		const menuItems = Object.entries(StatusNormalized)
			.filter(([status]) => status !== session.status)
			.map(([status, label]) => ({
				key: status,
				label: (
					<Space>
						{statusIcons[status as keyof IstatusIcon]}
						{label}
					</Space>
				),
				onClick: () =>
					onChangeStatus({ sessionId: session.id, status: status as Status }),
			}));

		const statusDropdown = user.isPhysioterapist ? (
			<div
				onClick={e => e.stopPropagation()}
				onMouseDown={e => e.stopPropagation()}
				onMouseUp={e => e.stopPropagation()}>
				<Dropdown menu={{ items: menuItems }}>
					<a>{statusIcons[session.status as keyof IstatusIcon]}</a>
				</Dropdown>
			</div>
		) : null;

		const painLevel = painLevelData[session.painLevel];

		return (
			<Flex align="center" gap={16}>
				{/* Pain level */}
				{painLevel && (
					<Flex align="center" gap={6}>
						<span
							style={{
								color: painLevel.color,
								fontWeight: 'var(--font-weight-medium)',
							}}>
							{session.painLevel}
						</span>
						{painLevel.icon}
					</Flex>
				)}

				{/* Status dropdown */}
				{statusDropdown}

				{/* CHECKBOX protected */}
				<div
					onClick={e => e.stopPropagation()}
					onMouseDown={e => e.stopPropagation()}
					onMouseUp={e => e.stopPropagation()}>
					<Checkbox
						checked={reportIds?.programSessionsIds?.includes(session.id)}
						onChange={e => {
							if (e.target.checked) {
								dispatch(
									addReportId({ type: 'programSessionsIds', id: session.id }),
								);
							} else {
								dispatch(
									deleteReportId({
										type: 'programSessionsIds',
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

	const handleRefresh = (e: React.MouseEvent) => {
		e.stopPropagation();
		fetchProgramByIdList(programIdData, currentCount);
	};

	useEffect(() => {
		if (stateId && !activeInnerKey) {
			setActiveInnerKey!(stateId);
		}
	}, [stateId]);

	return (
		<Collapse
			bordered={false}
			accordion
			activeKey={activeInnerKey ? [activeInnerKey] : []}
			onChange={key => {
				const keys = Array.isArray(key) ? key : [key];
				const newKey = keys[keys.length - 1]; // In accordion, it's usually just one, but this is safer
				setActiveInnerKey?.(newKey as string);
			}}
			className={`select-none summary-panel ai-program-summary-content`}
			style={{ marginTop: 10, marginBottom: 10 }}>
			{programSessionData?.map((session: ProgramSession) => {
				const hasResults = session.programSessionResult.length > 0;
				const hasProcessing = session.programSessionResult.some(
					(result: ProgramSessionResult) =>
						result.processing && !result.thumbnail,
				);

				return (
					<Collapse.Panel
						key={session.id}
						header={
							<Flex gap={8} align="center">
								<span>{moment(session.createdAt).local().format('LLL')}</span>
								{!hasResults && <Tag color="purple">No Record Found</Tag>}
								{hasProcessing && (
									<Tooltip title="Refresh">
										<div
											onClick={handleRefresh}
											style={{
												cursor: 'pointer',
												padding: 4,
												display: 'flex',
												alignItems: 'center',
											}}>
											<UntitledIcon
												name="reload"
												size={16}
												color="var(--text-tertiary)"
											/>
										</div>
									</Tooltip>
								)}
							</Flex>
						}
						showArrow={hasResults}
						collapsible={hasResults ? 'header' : 'disabled'}
						extra={handleExtraHeader(session)}>
						{!isLoading && (
							<Flex wrap="wrap" gap={16}>
								{hasResults ? (
									session.programSessionResult.map(
										(value: ProgramSessionResult) => {
											const checkStrapi =
												value?.programExercise?.strapiExercise;
											const strapi = value?.programExercise?.strapiExercise;
											const library = value?.programExercise?.exerciseLibrary;

											return (
												<div key={value.id} className="video-item">
													{value.processing && !value.thumbnail ? (
														<Flex
															vertical
															align="center"
															justify="center"
															gap={8}
															style={{
																width: '284px',
																height: '160px',
																background: 'var(--surface-secondary)',
																borderRadius: 'var(--radius-md)',
															}}>
															<UntitledIcon
																name="loading"
																size={32}
																color="var(--text-tertiary)"
															/>
															<span
																style={{
																	color: 'var(--text-secondary)',
																	fontSize: 'var(--font-size-sm)',
																}}>
																Processing
															</span>
														</Flex>
													) : (
														<div className="video-container">
															{value.video ? (
																<VideoPlayer src={value.video} />
															) : (
																<Image
																	className="video rounded-md"
																	src={value.thumbnail}
																	width="284px"
																	height="160px"
																/>
															)}

															<div>
																<span
																	className="program-video-modal-container"
																	onClick={e => {
																		e.stopPropagation();
																		CustomModalInfo({
																			video: checkStrapi
																				? strapi?.assets[0]?.video?.url
																				: library?.videoUrl,
																			name: checkStrapi
																				? strapi?.name
																				: library?.title,
																			description: checkStrapi
																				? strapi?.description
																				: library?.description,
																		});
																	}}>
																	<UntitledIcon name="infoCircle" />
																</span>

																<span
																	className="bar-chart-container"
																	onClick={e => {
																		e.stopPropagation();
																		dispatch(setSessionClicked(true));
																		setRehabExerciseToPatientId(
																			value.programExerciseId,
																		);
																		setProgramuTutorialVideo(
																			checkStrapi
																				? strapi?.assets[0]?.video?.url
																				: library?.videoUrl,
																		);
																		setProgramDescription(
																			checkStrapi
																				? strapi?.description
																				: library?.description,
																		);
																		setExerciseTitle(
																			checkStrapi
																				? strapi?.name
																				: library?.title,
																		);
																	}}>
																	<UntitledIcon name="barChart" />
																</span>
															</div>

															<Flex
																align="center"
																justify="space-between"
																style={{
																	position: 'relative',
																	zIndex: 10,
																	padding: 'var(--spacing-2)',
																	marginTop: !value?.video ? '-14px' : '-8px',
																	maxWidth: '284px',
																	borderBottomRightRadius: '0.375rem',
																	borderBottomLeftRadius: '0.375rem',
																	color: 'var(--text-on-dark)',
																	backgroundColor: 'var(--video-bg-text)',
																}}>
																<Tooltip
																	title={
																		checkStrapi ? strapi?.name : library?.title
																	}>
																	<span
																		style={{
																			maxWidth: '240px', // IMPORTANT
																			overflow: 'hidden',
																			textOverflow: 'ellipsis',
																			whiteSpace: 'nowrap',
																			display: 'inline-block',
																			cursor: 'pointer',
																		}}>
																		{checkStrapi
																			? strapi?.name
																			: library?.title}
																	</span>
																</Tooltip>

																<span />
															</Flex>
														</div>
													)}
												</div>
											);
										},
									)
								) : (
									<div className="w-full">
										<Empty
											description={'No Captures Found'}
											image={Empty.PRESENTED_IMAGE_SIMPLE}
										/>
									</div>
								)}
							</Flex>
						)}
					</Collapse.Panel>
				);
			})}
		</Collapse>
	);
}
