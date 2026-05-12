import { FaceFrown } from '@vitalflow-icons/users/faceFrown';
import { FaceHappy } from '@vitalflow-icons/users/faceHappy';
import { FaceNeutral } from '@vitalflow-icons/users/faceNeutral';
import { FaceSad } from '@vitalflow-icons/users/faceSad';
import { FaceSmile } from '@vitalflow-icons/users/faceSmile';
import { FaceWink } from '@vitalflow-icons/users/faceWink';
import { PlayCircle } from '@vitalflow-icons/media/playCircle';
import { getReport, updateReportNotes } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { Col, Empty, Flex, Row, Typography, message } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddNotes from './AddNotes';
import ReportNotesDownloadTemplate from './ReportNotes/ReportNotesDownloadTemplate';
import ReportNotesTemplate from './ReportNotes/ReportNotesTemplate';

const { Paragraph } = Typography;

interface ReportRehabCaptureDataProps {
	isEditMode: boolean;
	isDownload?: boolean;
}

export default function ReportRehabCaptureData(
	props: ReportRehabCaptureDataProps,
) {
	const { isEditMode, isDownload } = props;
	const { t } = useTranslation();
	const report = useTypedSelector(state => state.reports.report);
	const [programSessionsNotes, setProgramSessionsNotes] = useState<string>();
	const dispatch = useTypedDispatch();

	const handleSubmit = async () => {
		const reportId = report?.id || '';
		const payload = {
			programSessionsNotes: {
				notes: programSessionsNotes,
			},
		};
		await dispatch(updateReportNotes({ payload, reportId }));
		setProgramSessionsNotes('');
		message.success(t('Admin.data.addToReports.saveText'));
	};

	const sendMessage = async (
		reportId: string,
		messageDescription: string,
		imgFile: File[],
		videoBlob: Blob,
	) => {
		if (messageDescription.trim() !== '' && (videoBlob || imgFile)) {
			const formData = new FormData();
			formData.append('programSessionsNotes[notes]', messageDescription);
			if (imgFile?.[0]) {
				formData.append('images', imgFile[0]);
			}
			if (videoBlob) {
				formData.append(`videos`, videoBlob);
			}
			const result = await dispatch(
				updateReportNotes({
					payload: formData,
					reportId: reportId || '',
				}),
			);
			if (result.meta.requestStatus === 'fulfilled') {
				// Retry fetching report with exponential backoff
				const maxRetries = 5;
				for (let i = 0; i < maxRetries; i++) {
					await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
					await dispatch(getReport(reportId || ''));
					// Small delay to let Redux update
					await new Promise(resolve => setTimeout(resolve, 100));
					// Check if video/image is present in latest note
					const latestNote = report?.evaluationSessionsNotes?.[0];
					if (latestNote && (latestNote.video || latestNote.image)) {
						break;
					}
				}
				message.success(t('Admin.data.addToReports.saveText'));
			}
		} else {
			message.error(t('Admin.data.addNotes.requiredErr'));
		}
	};

	const getStatusComponent = (dataItems: { overallCondition: string }) => {
		switch (dataItems?.overallCondition) {
			case 'improving':
				return (
					<span className="custom-rating-improving custom-rating-feedback">
						{t(
							'Admin.data.menu.patientDetail.aiAssistantListSessions.improving',
						)}
					</span>
				);
			case 'worsening':
				return (
					<span className="custom-rating-worsening custom-rating-feedback">
						{t(
							'Admin.data.menu.patientDetail.aiAssistantListSessions.worsening',
						)}
					</span>
				);
			case 'noChange':
				return (
					<span className="custom-rating-nochange custom-rating-feedback">
						{t(
							'Admin.data.menu.patientDetail.aiAssistantListSessions.noChange',
						)}
					</span>
				);
			default:
				return null;
		}
	};

	const getExerciseDifficultyLevel = (dataItems: {
		exerciseDifficultyLevel: string;
	}) => {
		switch (dataItems?.exerciseDifficultyLevel) {
			case '1':
				return (
					<span className="custom-rating-tooeasy custom-rating-feedback">
						{t('Admin.data.addNotes.tooEasy')}
					</span>
				);
			case '2':
				return (
					<span className="custom-rating-improving custom-rating-feedback">
						{t('Admin.data.addNotes.easy')}
					</span>
				);
			case '3':
				return (
					<span className="custom-rating-nochange custom-rating-feedback">
						{t('Admin.data.addNotes.normal')}
					</span>
				);
			case '4':
				return (
					<span className="custom-rating-hard custom-rating-feedback">
						{t('Admin.data.addNotes.hard')}
					</span>
				);
			case '5':
				return (
					<span className="custom-rating-worsening custom-rating-feedback">
						{t('Admin.data.addNotes.tooHard')}
					</span>
				);
			default:
				return null;
		}
	};

	const painLevelData = {
		0: {
			color: 'var(--color-cyan-5)',
			icon: <FaceHappy color="var(--color-cyan-5)" width={20} height={20} />,
		},
		1: {
			color: 'var(--color-success-700)',
			icon: (
				<FaceWink color="var(--color-success-700)" width={20} height={20} />
			),
		},
		2: {
			color: 'var(--color-success-500)',
			icon: (
				<FaceSmile color="var(--color-success-500)" width={20} height={20} />
			),
		},
		3: {
			color: 'var(--color-success-300)',
			icon: (
				<FaceSmile color="var(--color-success-300)" width={20} height={20} />
			),
		},
		4: {
			color: 'var(--color-yellow-7)',
			icon: (
				<FaceNeutral color="var(--color-yellow-7)" width={20} height={20} />
			),
		},
		5: {
			color: 'var(--color-yellow-4)',
			icon: (
				<FaceNeutral color="var(--color-yellow-4)" width={20} height={20} />
			),
		},
		6: {
			color: 'var(--color-orange-dark-3)',
			icon: (
				<FaceSad color="var(--color-orange-dark-3)" width={20} height={20} />
			),
		},
		7: {
			color: 'var(--color-orange-dark-4)',
			icon: (
				<FaceSad color="var(--color-orange-dark-4)" width={20} height={20} />
			),
		},
		8: {
			color: 'var(--color-error-500)',
			icon: <FaceFrown color="var(--color-error-500)" width={20} height={20} />,
		},
		9: {
			color: 'var(--color-error-600)',
			icon: <FaceFrown color={'stroke-rose-600'} width={20} height={20} />,
		},
		10: {
			color: 'var(--color-error-700)',
			icon: <FaceFrown color={'stroke-rose-700'} width={20} height={20} />,
		},
	};

	const getPainLevel = (dataItems: { painLevel: string }) => {
		const painLevelDataItem = painLevelData[dataItems?.painLevel];
		if (painLevelDataItem) {
			return (
				<Flex gap={8} className={painLevelDataItem.color}>
					<span className="text-sm font-semibold">{dataItems?.painLevel}</span>
					{painLevelDataItem.icon}
				</Flex>
			);
		}
		return null;
	};

	return (
		<div className="pb-2">
			{!isDownload ? (
				<>
					<Paragraph className="mt-5 font-bold text-base text-gray-600 text-center">
						{t('Admin.data.addToReports.letsMoveHistoricalData')}
					</Paragraph>
					{report?.programSessionsIds?.map((item, index: number) => {
						return (
							<div key={index}>
								<p className="text-gray-600">
									<b className="font-bold">{item?.program?.name}</b>
								</p>
								<Flex
									align="center"
									justify="space-between"
									className="text-gray-600 mb-2">
									<p className="text-gray-600">
										<b className="font-semibold">
											{t('Admin.data.addToReports.sessionDate')}
										</b>{' '}
										{moment(item.createdAt).local().format('LLL')}
									</p>
									<Flex align="center" onClick={e => e.stopPropagation()}>
										<Flex>
											<Paragraph className="font-normal mr-2">
												{getStatusComponent(item)}
											</Paragraph>
											<Paragraph className="font-normal">
												{getPainLevel(item)}
											</Paragraph>
										</Flex>
									</Flex>
								</Flex>

								<Flex
									vertical
									gap={8}
									className="p-[15px] my-2.5 bg-gray-100 mt-1 rounded-lg border-1 border-inherit text-sm text-gray-500">
									{item?.programSessionResult.length > 0 ? (
										<Row gutter={[16, 16]}>
											{item?.programSessionResult?.map(
												(exercItem, index: number) => (
													<Col key={index} xs={24} sm={12} lg={6}>
														<div className="relative rounded-md">
															<video
																controls
																className="video rounded-md"
																preload="metadata"
																src={exercItem?.video}
																width="100%"
																height="100%"
															/>
															<Flex
																justify="space-between"
																style={{
																	marginTop: '-10px',
																	backgroundColor: 'var(--color-gray-500)',
																	padding: 'var(--spacing-1-5)',
																	color: 'var(--color-white)',
																}}>
																<span>
																	{exercItem?.programExercise?.strapiExercise
																		? exercItem?.programExercise?.strapiExercise
																				?.name
																		: exercItem?.programExercise
																				?.exerciseLibrary?.title}
																</span>
																<span></span>
															</Flex>
															<div
																style={{
																	position: 'absolute',
																	top: 'var(--spacing-2)',
																	right: 'var(--spacing-2)',
																	color: 'var(--color-white)',
																	zIndex: 20,
																}}>
																<span>
																	{getExerciseDifficultyLevel(exercItem)}
																</span>
															</div>
														</div>
													</Col>
												),
											)}
										</Row>
									) : (
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={
												<span>{t('Admin.data.addToReports.noData')}</span>
											}
										/>
									)}
								</Flex>
							</div>
						);
					})}
				</>
			) : (
				<>
					<p
						style={{
							fontWeight: 700,
							fontSize: '14px',
							color: '#475467',
							marginTop: '12px',
							textAlign: 'center',
							marginBottom: '8px',
						}}>
						{t('Admin.data.addToReports.letsMoveHistoricalData')}
					</p>
					{report?.programSessionsIds?.map((item, index: number) => {
						const getOverallConditionStyle = () => {
							switch (item?.overallCondition) {
								case 'improving':
									return { backgroundColor: '#d1fae5', color: '#065f46' };
								case 'worsening':
									return { backgroundColor: '#fee2e2', color: '#991b1b' };
								case 'noChange':
									return { backgroundColor: '#fef3c7', color: '#92400e' };
								default:
									return { backgroundColor: '#f3f4f6', color: '#475467' };
							}
						};

						const getPainLevelColor = () => {
							const level = parseInt(item?.painLevel || '0');
							if (level <= 2) return '#16a34a';
							if (level <= 4) return '#d97706';
							if (level <= 6) return '#ea580c';
							return '#dc2626';
						};

						return (
							<div
								key={index}
								style={{
									marginBottom: '12px',
									border: '1px solid #e5e7eb',
									borderRadius: '8px',
									overflow: 'visible',
								}}>
								{/* Card Header */}
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										backgroundColor: '#f9fafb',
										padding: '10px 16px',
										borderBottom: '1px solid #e5e7eb',
										borderRadius: '8px 8px 0 0',
									}}>
									<div>
										<span
											style={{
												fontWeight: 700,
												fontSize: '13px',
												color: '#475467',
											}}>
											{item?.program?.name?.toUpperCase() || 'LET\'S MOVE SESSION'}
										</span>
										<p
											style={{
												fontSize: '11px',
												color: '#667085',
												marginTop: '2px',
											}}>
											{moment(item.createdAt).local().format('LLL')}
										</p>
									</div>
									<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
										{item?.overallCondition && (
											<span
												style={{
													...getOverallConditionStyle(),
													padding: '4px 8px',
													borderRadius: '4px',
													fontSize: '11px',
													fontWeight: 600,
												}}>
												{item.overallCondition === 'noChange'
													? 'No Change'
													: item.overallCondition.charAt(0).toUpperCase() +
														item.overallCondition.slice(1)}
											</span>
										)}
										{item?.painLevel && (
											<span
												style={{
													color: getPainLevelColor(),
													fontWeight: 700,
													fontSize: '12px',
												}}>
												Pain: {item.painLevel}/10
											</span>
										)}
									</div>
								</div>

								{/* Exercise Cards */}
								<div style={{ padding: '12px 16px' }}>
									{item?.programSessionResult && item?.programSessionResult.length > 0 ? (
										<div
											style={{
												display: 'flex',
												flexWrap: 'wrap',
												gap: '8px',
											}}>
											{item?.programSessionResult?.map(
												(exercItem, exercIndex: number) => {
													const exerciseName =
														exercItem?.programExercise?.strapiExercise?.name ||
														exercItem?.programExercise?.exerciseLibrary?.title ||
														'Exercise';

													const getDifficultyStyle = () => {
														switch (exercItem?.exerciseDifficultyLevel) {
															case '1':
																return { bg: '#dbeafe', color: '#1e40af', label: 'Too Easy' };
															case '2':
																return { bg: '#d1fae5', color: '#065f46', label: 'Easy' };
															case '3':
																return { bg: '#fef3c7', color: '#92400e', label: 'Normal' };
															case '4':
																return { bg: '#fed7aa', color: '#c2410c', label: 'Hard' };
															case '5':
																return { bg: '#fee2e2', color: '#991b1b', label: 'Too Hard' };
															default:
																return null;
														}
													};

													const difficultyStyle = getDifficultyStyle();

													return (
														<a
															key={exercIndex}
															href={exercItem?.video}
															target="_blank"
															rel="noopener noreferrer"
															className="avoid-page-break"
															style={{
																display: 'block',
																backgroundColor: '#f9fafb',
																border: '1px solid #e5e7eb',
																borderRadius: '6px',
																overflow: 'hidden',
																minWidth: '140px',
																maxWidth: '180px',
																pageBreakInside: 'avoid',
																breakInside: 'avoid',
																textDecoration: 'none',
															}}>
															{/* Video Thumbnail with Play Icon */}
															<div
																style={{
																	position: 'relative',
																	width: '100%',
																	height: '80px',
																	backgroundColor: '#1f2937',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																}}>
																<PlayCircle
																	width={32}
																	height={32}
																	color="#ffffff"
																/>
															</div>
															{/* Exercise Info */}
															<div style={{ padding: '8px 10px' }}>
																<p
																	style={{
																		fontSize: '11px',
																		fontWeight: 600,
																		color: '#475467',
																		marginBottom: '4px',
																		lineHeight: '1.3',
																	}}>
																	{exerciseName}
																</p>
																{difficultyStyle && (
																	<span
																		style={{
																			backgroundColor: difficultyStyle.bg,
																			color: difficultyStyle.color,
																			padding: '2px 6px',
																			borderRadius: '4px',
																			fontSize: '9px',
																			fontWeight: 600,
																		}}>
																		{difficultyStyle.label}
																	</span>
																)}
															</div>
														</a>
													);
												},
											)}
										</div>
									) : (
										<p
											style={{
												fontSize: '12px',
												color: '#667085',
												textAlign: 'center',
												padding: '8px',
											}}>
											{t('Admin.data.addToReports.noData')}
										</p>
									)}
								</div>
							</div>
						);
					})}
				</>
			)}
			{report?.programSessionsNotes?.some(note => note.notes?.trim()) && (
				<>
					{(report?.programSessionsNotes?.length ?? 0) > 0 ? (
						<>
							{!isDownload ? (
								<>
									<div className="text-left mt-2 mb-2">
										<span className="font-semibold text-sm text-gray-900">
											{t('Admin.data.addNotes.notes')}
										</span>
									</div>
									{report?.programSessionsNotes?.map((note, index: number) => {
										return (
											<ReportNotesTemplate
												key={index}
												index={index}
												isEditMode={isEditMode}
												note={note}
											/>
										);
									})}
								</>
							) : (
								<>
									<div
										style={{
											textAlign: 'left',
											marginTop: '8px',
											marginBottom: '8px',
										}}>
										<span
											style={{
												fontWeight: 600,
												fontSize: '14px',
												color: '#101828',
											}}>
											{t('Admin.data.addNotes.notes')}
										</span>
									</div>
									{report?.programSessionsNotes?.map((note, index: number) => {
										return (
											<ReportNotesDownloadTemplate
												key={index}
												index={index}
												isEditMode={isEditMode}
												note={note}
											/>
										);
									})}
								</>
							)}
						</>
					) : null}
				</>
			)}
			{report?.programSessionsIds?.length != 0 && !isDownload ? (
				<AddNotes
					sendMessage={sendMessage}
					onClick={() => handleSubmit()}
					onChange={event => setProgramSessionsNotes(event.target.value)}
				/>
			) : null}
		</div>
	);
}
