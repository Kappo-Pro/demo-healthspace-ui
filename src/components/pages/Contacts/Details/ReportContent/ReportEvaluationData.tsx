import SummuryOptionsList from '@atoms/CoachSummaryButtonExportPainAssessment/SummaryOptionsList';
import { getReport, updateReportNotes } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	AddButtonItemsProps,
	EvaluationPainAssessment,
	IEvaluation,
	IStrapiHealthSign,
	IStrapiMedicalHistory,
	TPainAssessmentProps,
	ReportNotes,
} from '@types';
import { Empty, Typography, message } from 'antd';
import { Divider } from 'antd/lib';
import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../ReportPreviewModal.css';
import AddMoreResults from './AddMoreResults';
import AddNotes from './AddNotes';
import ReportDiagnosisCodes from './ReportDiagnosisCodes';
import ReportNotesDownloadTemplate from './ReportNotes/ReportNotesDownloadTemplate';
import ReportNotesTemplate from './ReportNotes/ReportNotesTemplate';

const { Paragraph } = Typography;

interface ReportEvaluationDataProps {
	isEditMode: boolean;
	isDownload?: boolean;
	setActiveComponent: (value: AddButtonItemsProps) => void;
	setIsVisible: (val: boolean) => void;
}

export default function ReportEvaluationData(props: ReportEvaluationDataProps) {
	const { isDownload, isEditMode, setActiveComponent, setIsVisible } = props;
	const { t } = useTranslation();
	const report = useTypedSelector(state => state.reports.report);
	const [evaluationNotes, setEvaluationNotes] = useState<string>();
	const dispatch = useTypedDispatch();
	const [isUpdating, setIsUpdating] = useState(false);

	const handleSubmit = async () => {
		const reportId = report?.id || '';
		const payload = {
			evaluationSessionsNotes: {
				notes: evaluationNotes,
			},
		};
		await dispatch(updateReportNotes({ payload, reportId }));
		setEvaluationNotes('');
		message.success(t('Admin.data.addToReports.saveText'));
	};

	const sendMessage = async (
		reportId: string,
		messageDescription: string,
		imgFile: File[],
		videoBlob: Blob,
	) => {
		if (messageDescription.trim() !== '' && (videoBlob || imgFile)) {
			try {
				setIsUpdating(true);
				const formData = new FormData();
				formData.append('evaluationSessionsNotes[notes]', messageDescription);
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
			} catch (error) {
				message.error(t('Admin.data.addNotes.requiredErr'));
			} finally {
				setIsUpdating(false);
			}
		} else {
			message.error(t('Admin.data.addNotes.requiredErr'));
		}
	};

	// Helper function to join attributes
	const joinAttributes = (attributes: { name: string }[]) => {
		return attributes?.map(element => element.name).join(', ') || '';
	};

	return (
		<>
			{!isDownload && (
				<AddMoreResults
					setActiveComponent={setActiveComponent}
					setIsVisible={setIsVisible}
				/>
			)}
			<ReportDiagnosisCodes isDownload={isDownload} />
			{report?.evaluationSessionsIds?.length === 0 ? (
				<>
					{!isDownload && (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={<span>{t('Admin.data.addToReports.noData')}</span>}
						/>
					)}
				</>
			) : !isDownload ? (
				// Modal View - Original template
				<div style={{ fontSize: 'var(--font-size-xs)' }}>
					<Paragraph className="font-bold text-xs text-gray-600 mt-2 text-center">
						{t('Admin.data.addToReports.evaluationData')}
					</Paragraph>
					{report?.evaluationSessionsIds?.map(
						(data: IEvaluation, index: number) => {
							return (
								<div key={index}>
									<p className="py-[8px] text-gray-600 text-xs">
										<b className="font-bold text-xs">
											{t('patient.progress.evaluation.dateOfAssessment')}
										</b>{' '}
										<span>{moment(data.createdAt).local().format('LLL')}</span>
									</p>
									<div className="font-bold text-xs">
										{t('patient.progress.evaluation.painSummary')}
									</div>
									<ul
										id="painSummaryEditor"
										style={{
											fontSize: 'var(--font-size-xs)',
											padding: 0,
											margin: 0,
											listStyle: 'none',
										}}
										contentEditable={isEditMode}>
										{data?.painAssessments?.map(
											(item: EvaluationPainAssessment, pIdx: number) => {
												return (
													<li
														className="border-b-2 border-inherit"
														style={{
															fontSize: 'var(--font-size-xs)',
															padding: 0,
															margin: 0,
														}}
														key={pIdx}>
														<SummuryOptionsList item={item as unknown as TPainAssessmentProps} />
													</li>
												);
											},
										)}
									</ul>
									<Divider />
									<div className="font-bold text-xs">
										{t('patient.progress.evaluation.associatedSymptoms')}
									</div>
									<ul
										id="associatedSymptomsEditor"
										style={{
											fontSize: 'var(--font-size-xs)',
											padding: 0,
											margin: 0,
											listStyle: 'none',
										}}
										contentEditable={isEditMode}>
										<div
											style={{
												marginTop: 'var(--spacing-5)',
												marginBottom: 'var(--spacing-5)',
											}}>
											<span className="font-bold text-gray-700 text-xs">
												{t(
													'patient.progress.evaluation.doYouHaveAnyOfTheseSymptoms',
												)}
											</span>
										</div>
										{data?.healthSigns?.strapiHealthSigns?.map(
											(element: IStrapiHealthSign, hIdx: number) => {
												return (
													<li
														style={{
															fontSize: 'var(--font-size-xs)',
															padding: 0,
															margin: 0,
														}}
														className="grid text-xs mb-1 mt-1 leading-7"
														key={hIdx}>
														<span className="font-regular">{element.name}</span>
													</li>
												);
											},
										)}
									</ul>
									<Divider />
									<div>
										<span className="font-semibold text-[var(--tabs-text-color)] text-xs">
											{t('patient.progress.evaluation.medicalHistory')}
										</span>
									</div>
									<ul
										id="medicalHistoryEditor"
										contentEditable={isEditMode}
										style={{
											fontSize: 'var(--font-size-xs)',
											padding: 0,
											margin: 0,
											listStyle: 'none',
										}}>
										<div
											style={{
												marginTop: 'var(--spacing-5)',
												marginBottom: 'var(--spacing-5)',
											}}>
											<span className="font-bold text-gray-700 text-xs">
												{t(
													'patient.progress.evaluation.haveYouBeenDiagnosedWithAnyOfTheFollowing',
												)}
											</span>
										</div>
										{data?.medicalHistories?.strapiMedicalHistories?.map(
											(mData: IStrapiMedicalHistory, mIdx: number) => {
												return (
													<li
														className="grid text-xs mb-1 mt-1 leading-7"
														style={{
															fontSize: 'var(--font-size-xs)',
															padding: 0,
															margin: 0,
														}}
														key={mIdx}>
														<span className="font-regular">{mData.name}</span>
													</li>
												);
											},
										)}
									</ul>
									<Divider />
								</div>
							);
						},
					)}
					{report?.evaluationSessionsNotes?.some((note: ReportNotes) =>
						note.notes?.trim(),
					) && (
						<>
							{(report?.evaluationSessionsNotes?.length ?? 0) > 0 ? (
								<>
									<div className="text-left mt-2 mb-2">
										<span className="font-semibold text-sm text-gray-900">
											{t('Admin.data.addNotes.subjectiveNotes')}
										</span>
									</div>
									<>
										{report?.evaluationSessionsNotes?.map((note: ReportNotes, nIdx: number) => (
											<ReportNotesTemplate
												key={nIdx}
												index={nIdx}
												isEditMode={isEditMode}
												note={note}
											/>
										))}
									</>
								</>
							) : null}
						</>
					)}
					{report?.evaluationSessionsIds?.length != 0 && (
						<AddNotes
							sendMessage={sendMessage}
							onClick={() => handleSubmit()}
							onChange={event => setEvaluationNotes(event.target.value)}
							isUpdating={isUpdating}
						/>
					)}
				</div>
			) : (
				// PDF Download View - Inline styles template
				<div style={{ fontSize: '12px' }}>
					<p
						style={{
							fontWeight: 700,
							fontSize: '14px',
							color: '#475467',
							marginTop: '8px',
							textAlign: 'center',
							marginBottom: '8px',
						}}>
						{t('Admin.data.addToReports.evaluationData')}
					</p>
					{report?.evaluationSessionsIds?.map(
						(data: IEvaluation, index: number) => {
							return (
								<div
									key={index}
									style={{
										marginBottom: '12px',
										border: '1px solid #e5e7eb',
										borderRadius: '8px',
										overflow: 'hidden',
									}}>
									{/* Session Header */}
									<div
										style={{
											backgroundColor: '#f9fafb',
											padding: '8px 12px',
											borderBottom: '1px solid #e5e7eb',
										}}>
										<p style={{ fontSize: '11px', color: '#667085', margin: 0 }}>
											<span style={{ fontWeight: 700 }}>
												{t('patient.progress.evaluation.dateOfAssessment')}
											</span>{' '}
											{moment(data.createdAt).local().format('LLL')}
										</p>
									</div>

									{/* Pain Summary Section */}
									{data?.painAssessments && data.painAssessments.length > 0 && (
										<div style={{ padding: '8px 12px' }}>
											<p
												style={{
													fontWeight: 700,
													fontSize: '12px',
													color: '#475467',
													marginBottom: '6px',
												}}>
												{t('patient.progress.evaluation.painSummary')}
											</p>
											{(data.painAssessments as unknown as TPainAssessmentProps[]).map(
												(item: TPainAssessmentProps, pIdx: number) => (
													<div
														key={pIdx}
														className="avoid-page-break"
														style={{
															backgroundColor: '#f9fafb',
															borderRadius: '6px',
															padding: '8px 10px',
															marginBottom: '6px',
															pageBreakInside: 'avoid',
															breakInside: 'avoid',
														}}>
														<div
															style={{
																display: 'flex',
																flexWrap: 'wrap',
																gap: '8px',
																fontSize: '11px',
																color: '#475467',
															}}>
															<span>
																<b>Pain Level:</b> {item.painLevel || 0}
															</span>
															{item.strapiBodyPoint && (
																<span>
																	<b>Location:</b>{' '}
																	{((item.strapiBodyPoint as unknown as {name?: string; attributes?: {name?: string}})?.name ||
																	  (item.strapiBodyPoint as unknown as {name?: string; attributes?: {name?: string}})?.attributes?.name ||
																	  '').toUpperCase()}
																</span>
															)}
														</div>
														{item.strapiAggravatingFactors?.length > 0 && (
															<p style={{ fontSize: '11px', color: '#475467', marginTop: '4px' }}>
																<b>Aggravating Factors:</b>{' '}
																{joinAttributes(item.strapiAggravatingFactors)}
															</p>
														)}
														{item.strapiRelievingFactors?.length > 0 && (
															<p style={{ fontSize: '11px', color: '#475467', marginTop: '2px' }}>
																<b>Relieving Factors:</b>{' '}
																{joinAttributes(item.strapiRelievingFactors)}
															</p>
														)}
														{item.strapiPainCauses?.length > 0 && (
															<p style={{ fontSize: '11px', color: '#475467', marginTop: '2px' }}>
																<b>Cause of Pain:</b>{' '}
																{joinAttributes(item.strapiPainCauses)}
															</p>
														)}
														{item.strapiPainDuration && (
															<p style={{ fontSize: '11px', color: '#475467', marginTop: '2px' }}>
																<b>Duration:</b> {item.strapiPainDuration?.name}
															</p>
														)}
														{item.strapiPainFrequency && (
															<p style={{ fontSize: '11px', color: '#475467', marginTop: '2px' }}>
																<b>Frequency:</b> {item.strapiPainFrequency?.name}
															</p>
														)}
														{item.strapiPainStatus && (
															<p style={{ fontSize: '11px', color: '#475467', marginTop: '2px' }}>
																<b>Status:</b> {item.strapiPainStatus?.name}
															</p>
														)}
													</div>
												),
											)}
										</div>
									)}

									{/* Associated Symptoms Section */}
									{(data?.healthSigns?.strapiHealthSigns?.length ?? 0) > 0 && (
										<div
											style={{
												padding: '8px 12px',
												borderTop: '1px solid #e5e7eb',
											}}>
											<p
												style={{
													fontWeight: 700,
													fontSize: '12px',
													color: '#475467',
													marginBottom: '4px',
												}}>
												{t('patient.progress.evaluation.associatedSymptoms')}
											</p>
											<div
												style={{
													display: 'flex',
													flexWrap: 'wrap',
													gap: '4px',
												}}>
												{data?.healthSigns?.strapiHealthSigns?.map(
													(element: IStrapiHealthSign, hIdx: number) => (
														<span
															key={hIdx}
															style={{
																backgroundColor: '#f3f4f6',
																padding: '2px 8px',
																borderRadius: '4px',
																fontSize: '10px',
																color: '#475467',
															}}>
															{element.name}
														</span>
													),
												)}
											</div>
										</div>
									)}

									{/* Medical History Section */}
									{(data?.medicalHistories?.strapiMedicalHistories?.length ?? 0) > 0 && (
										<div
											style={{
												padding: '8px 12px',
												borderTop: '1px solid #e5e7eb',
											}}>
											<p
												style={{
													fontWeight: 700,
													fontSize: '12px',
													color: '#475467',
													marginBottom: '4px',
												}}>
												{t('patient.progress.evaluation.medicalHistory')}
											</p>
											<div
												style={{
													display: 'flex',
													flexWrap: 'wrap',
													gap: '4px',
												}}>
												{data?.medicalHistories?.strapiMedicalHistories?.map(
													(mData: IStrapiMedicalHistory, mIdx: number) => (
														<span
															key={mIdx}
															style={{
																backgroundColor: '#f3f4f6',
																padding: '2px 8px',
																borderRadius: '4px',
																fontSize: '10px',
																color: '#475467',
															}}>
															{mData.name}
														</span>
													),
												)}
											</div>
										</div>
									)}
								</div>
							);
						},
					)}
					{report?.evaluationSessionsNotes?.some((note: ReportNotes) =>
						note.notes?.trim(),
					) && (
						<>
							{(report?.evaluationSessionsNotes?.length ?? 0) > 0 && (
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
											{t('Admin.data.addNotes.subjectiveNotes')}
										</span>
									</div>
									{report?.evaluationSessionsNotes?.map((note: ReportNotes, nIdx: number) => (
										<ReportNotesDownloadTemplate
											key={nIdx}
											index={nIdx}
											isEditMode={isEditMode}
											note={note}
										/>
									))}
								</>
							)}
						</>
					)}
				</div>
			)}
		</>
	);
}
