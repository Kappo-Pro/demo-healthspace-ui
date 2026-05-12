import CoachPostureSummary from '@pages/AiPosture/CoachPostureSummary';
import { getReport, updateReportNotes } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { IPosture, PostureAnalysisItem } from '@stores/interfaces';
import { Posture } from '@types';
import { Flex, Row, Typography, message } from 'antd';
import moment from 'moment';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddNotes from './AddNotes';
import ReportNotesDownloadTemplate from './ReportNotes/ReportNotesDownloadTemplate';
import ReportNotesTemplate from './ReportNotes/ReportNotesTemplate';

const { Paragraph } = Typography;

interface ReportRomCapturesDataProps {
	isEditMode: boolean;
	isDownload?: boolean;
}

export default function ReportPostureData(props: ReportRomCapturesDataProps) {
	const { isEditMode, isDownload } = props;
	const { t } = useTranslation();
	const report = useTypedSelector(state => state.reports.report);
	const [postureSessionsNotes, setPostureSessionNotes] = useState<string>();
	const dispatch = useTypedDispatch();

	const handleSubmit = async () => {
		const reportId = report?.id || '';
		const payload = {
			postureSessionsNotes: {
				notes: postureSessionsNotes,
			},
		};
		await dispatch(updateReportNotes({ payload, reportId }));
		setPostureSessionNotes('');
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
			formData.append('postureSessionsNotes[notes]', messageDescription);
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

	return (
		<>
			<div className="posture-data-container">
				{!isDownload ? (
					<>
						<Paragraph className="posture-data-title">
							{t('Patient.data.postures.postureData')}
						</Paragraph>
						<div className="posture-sessions-wrapper">
							<Row
								gutter={[14, 8]}
								style={{
									display: 'flex',
									alignItems: 'center',
									columnGap: 'var(--spacing-10)',
									paddingLeft: 'var(--spacing-5)',
								}}>
								{report?.postureSessionsIds?.map((item: IPosture) => {
									if (item.postureAnalytics.length > 0) {
										return (
											<>
												<p className="font-semibold text-gray-600 mt-2">
													{t(
														'Patient.data.myProgress.evaluation.dateOfAssessment',
													)}{' '}
													<span className="posture-date-value">
														{moment(item.createdAt).local().format('LLL')}
													</span>
												</p>
												<CoachPostureSummary item={item} />
											</>
										);
									}
									return null;
								})}
							</Row>
						</div>
					</>
				) : (
					<>
						<Paragraph className="posture-data-title-download">
							{t('Patient.data.postures.postureData')}
						</Paragraph>
						{report?.postureSessionsIds?.map((item: Posture) => (
							<Fragment key={item.id}>
								{item?.postureAnalytics?.map(
									(analyticsItem: PostureAnalysisItem, idx: number, array) => (
										<Fragment key={analyticsItem.id}>
											<p className="py-[8px] text-gray-600 text-xs">
												<b className="font-bold text-xs">
													{t('Admin.data.addToReports.sessionDate')}
												</b>{' '}
												{moment(analyticsItem.createdAt).local().format('LLL')}
											</p>
											<Flex vertical gap={2}>
												<p className="font-normal text-xs">
													<b className="font-bold text-xs">
														{t('Admin.data.addToReports.value')}{' '}
													</b>
													{analyticsItem.view}
												</p>
												<p className="font-normal text-xs">
													<b className="font-bold text-xs">
														{t('Admin.data.addToReports.screenshot')}{' '}
													</b>
													<a
														href={analyticsItem.screenshot}
														target="_blank"
														rel="noreferrer">
														{analyticsItem.screenshot}
													</a>
												</p>
												<p className="font-normal text-xs">
													<p className="text-xs">
														<b className="text-xs">
															{t('Admin.data.addToReports.ear')}
														</b>{' '}
														: {analyticsItem.ear}
													</p>
													<p className="text-xs">
														<b className="text-xs">
															{t('Admin.data.addToReports.head')}
														</b>{' '}
														: {analyticsItem.head}
													</p>
													<p className="text-xs">
														<b className="text-xs">
															{t('Admin.data.addToReports.ankle')}
														</b>{' '}
														: {analyticsItem.ankle}
													</p>
													<p className="text-xs">
														<b className="text-xs">
															{t('Admin.data.addToReports.elbow')}
														</b>{' '}
														: {analyticsItem.elbow}
													</p>
													<p className="text-xs">
														<b className="text-xs">
															{t('Admin.data.addToReports.hip')}
														</b>{' '}
														: {analyticsItem.hip}
													</p>
													<p className="text-xs">
														<b className="text-xs">
															{t('Admin.data.addToReports.knee')}
														</b>{' '}
														: {analyticsItem.knee}
													</p>
													<p className="text-xs">
														<b className="text-xs">
															{t('Admin.data.addToReports.shoulder')}
														</b>{' '}
														: {analyticsItem.shoulder}
													</p>
												</p>
											</Flex>
											{idx < array.length - 1 && (
												<hr
													style={{
														margin: '10px 0',
														border: 'none',
														borderTop: '1px solid var(--border-primary)',
													}}
												/>
											)}
										</Fragment>
									),
								)}
							</Fragment>
						))}
					</>
				)}
				{report?.postureSessionsNotes?.some(note => note.notes?.trim()) && (
					<>
						{(report?.postureSessionsNotes?.length ?? 0) > 0 ? (
							<>
								<div className="posture-notes-header">
									<span className="posture-notes-title">
										{t('Admin.data.addNotes.notes')}
									</span>
								</div>
								{!isDownload ? (
									<>
										{report?.postureSessionsNotes?.map((note, index) => {
											return (
												<ReportNotesTemplate
													index={index}
													isEditMode={isEditMode}
													note={note}
												/>
											);
										})}
									</>
								) : (
									<>
										{report?.postureSessionsNotes?.map((note, index) => {
											return (
												<ReportNotesDownloadTemplate
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
				{report?.postureSessionsIds?.length != 0 && !isDownload ? (
					<AddNotes
						sendMessage={sendMessage}
						onClick={() => handleSubmit()}
						onChange={event => setPostureSessionNotes(event.target.value)}
					/>
				) : null}
			</div>
		</>
	);
}
