import { Image01 } from '@vitalflow-icons/files/image01';
import CustomSummaryContentResult from '@pages/CustomRomSummary/CustomSummaryContentResult';
import { getReport, updateReportNotes } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { CustomRomSessionExercise, IRomSession, ReportNotes } from '@types';
import { Typography, message } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddNotes from './AddNotes';
import ReportNotesDownloadTemplate from './ReportNotes/ReportNotesDownloadTemplate';
import ReportNotesTemplate from './ReportNotes/ReportNotesTemplate';

const { Paragraph } = Typography;

// Local interface for ROM result item in PDF view
interface RomResultItem {
	value?: number | { left?: number; right?: number };
	screenshot?: string;
	normal?: number;
	wfl?: number;
	strapiOmniRomExercise?: { name?: string };
	romProgramExercise?: {
		normal?: number;
		strapiOmniRomExercise?: { name?: string };
		exerciseLibrary?: { title?: string };
	};
	exerciseLibrary?: { title?: string };
}

// Local interface for grouped patient results
interface GroupedPatientResult {
	title?: string;
	screenshot?: string;
	results?: RomResultItem[];
}

interface ReportRomSummaryDataProps {
	isEditMode: boolean;
	isDownload?: boolean;
}

export default function ReportRomSummaryData(props: ReportRomSummaryDataProps) {
	const { isEditMode, isDownload } = props;
	const { t } = useTranslation();
	const [romSesssionNotes, setRomSessionNotes] = useState('');
	const report = useTypedSelector(state => state.reports.report);
	const allEmpty = report?.romSessionsIds?.every(
		(summary: IRomSession) => summary?.romPatientResults?.length === 0,
	);
	const dispatch = useTypedDispatch();

	const handleSubmit = async () => {
		const reportId = report?.id || '';
		const payload = {
			romSessionsNotes: {
				notes: romSesssionNotes,
			},
		};
		await dispatch(updateReportNotes({ payload, reportId }));
		setRomSessionNotes('');
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
			formData.append('romSessionsNotes[notes]', messageDescription);
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

	const calculateScore = (normal: number, value: number): number => {
		if (value === 0) {
			return 0;
		}
		const score = Math.round((value / normal) * 100);
		const valueScore = score > 100 ? 100 : score;
		return isFinite(valueScore) ? valueScore : 0;
	};


	// Helper to extract numeric value from value that could be number or {left, right} object
	const extractValue = (
		value: number | { left?: number; right?: number } | null | undefined,
	): number => {
		if (value === null || value === undefined) return 0;
		if (typeof value === 'number') return value;
		if (typeof value === 'object') {
			// If it's an object, average left and right or use whichever is available
			const left = value.left ?? 0;
			const right = value.right ?? 0;
			if (value.left !== undefined && value.right !== undefined) {
				return Math.round((left + right) / 2);
			}
			return left || right;
		}
		return 0;
	};

	// Helper to render value - handles both number and {left, right} object
	const renderValue = (
		value: number | { left?: number; right?: number } | null | undefined,
	): string => {
		if (value === null || value === undefined) return '0';
		if (typeof value === 'number') return String(Math.round(value));
		if (typeof value === 'object') {
			const parts: string[] = [];
			if (value.left !== undefined) parts.push(`L: ${Math.round(value.left)}`);
			if (value.right !== undefined)
				parts.push(`R: ${Math.round(value.right)}`);
			return parts.length > 0 ? parts.join(' / ') : '0';
		}
		return '0';
	};

	return (
		<>
			{!isDownload ? (
				<div className="pb-2">
					{report?.romSessionsIds && !allEmpty ? (
						<>
							{report?.romSessionsIds?.map((item: IRomSession) => {
								return (
									<>
										{(item?.romPatientResults?.length ?? 0) > 0 && (
											<>
												<Paragraph className="font-bold text-base text-gray-600 mt-5 text-center">
													{t('Admin.data.addToReports.romSummaryData')}
												</Paragraph>

												<div>
													<p className="py-[15px] text-gray-600">
														<b className="font-bold">
															{t('Admin.data.addToReports.sessionDate')}
														</b>{' '}
														{moment(item.createdAt).local().format('LLL')}
													</p>
													<CustomSummaryContentResult
														item={(item?.romPatientResults ?? []) as unknown as CustomRomSessionExercise[]}
													/>
												</div>
											</>
										)}
									</>
								);
							})}
							{report?.romSessionsNotes?.some((note: ReportNotes) => note.notes?.trim()) && (
								<>
									{(report?.romSessionsNotes?.length ?? 0) > 0 ? (
										<>
											{!isDownload && (
												<>
													<div className="text-left mt-3 mb-3">
														<span className="font-semibold text-base text-gray-900">
															{t('Admin.data.addNotes.notes')}
														</span>
													</div>
													{report?.romSessionsNotes?.map((note: ReportNotes, index: number) => {
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
											)}
										</>
									) : null}
								</>
							)}
						</>
					) : null}
					{report?.romSessionsIds?.length != 0 ? (
						<AddNotes
							sendMessage={sendMessage}
							onClick={() => handleSubmit()}
							onChange={event => setRomSessionNotes(event.target.value)}
						/>
					) : null}
				</div>
			) : (
				<>
					<div style={{ paddingBottom: '8px' }}>
						<p
							style={{
								fontWeight: 700,
								fontSize: '14px',
								color: '#475467',
								marginTop: '12px',
								textAlign: 'center',
								marginBottom: '8px',
							}}>
							{t('Admin.data.addToReports.romSummaryData')}
						</p>
						{report?.romSessionsIds?.map((data: IRomSession) => {
							return (
								<>
									{(data?.romPatientResults?.length ?? 0) > 0 && (
										<>
											<div>
												<p
													style={{
														padding: '8px 0',
														color: '#475467',
														fontSize: '12px',
													}}>
													<b style={{ fontWeight: 700, fontSize: '12px' }}>
														{t('Admin.data.addToReports.sessionDate')}
													</b>{' '}
													{moment(data.createdAt).local().format('LLL')}
												</p>
												{data?.romPatientResults?.map(
													(patientResult: GroupedPatientResult, idx: number, array: GroupedPatientResult[]) => {
														return (
															<>
																<div
																	style={{
																		marginBottom: '12px',
																		border: '1px solid #e5e7eb',
																		borderRadius: '8px',
																		overflow: 'visible',
																	}}>
																	{/* Card Header - matches modal style */}
																	<div
																		style={{
																			display: 'flex',
																			justifyContent: 'space-between',
																			alignItems: 'center',
																			backgroundColor: '#f9fafb',
																			padding: '12px 16px',
																			borderBottom: '1px solid #e5e7eb',
																			borderRadius: '8px 8px 0 0',
																		}}>
																		{/* Left side: Title */}
																		<span
																			style={{
																				fontWeight: 700,
																				fontSize: '13px',
																				color: '#475467',
																			}}>
																			{patientResult?.title?.toUpperCase() ||
																				'ROM ASSESSMENT'}
																		</span>
																		{/* Right side: Column headers */}
																		<div
																			style={{
																				display: 'flex',
																				gap: '4px',
																			}}>
																			<span
																				style={{
																					width: '70px',
																					textAlign: 'center',
																					fontSize: '11px',
																					fontWeight: 600,
																					color: '#667085',
																				}}>
																				Normal
																			</span>
																			<span
																				style={{
																					width: '70px',
																					textAlign: 'center',
																					fontSize: '11px',
																					fontWeight: 600,
																					color: '#667085',
																				}}>
																				WFL
																			</span>
																			<span
																				style={{
																					width: '70px',
																					textAlign: 'center',
																					fontSize: '11px',
																					fontWeight: 600,
																					color: '#667085',
																				}}>
																				Value
																			</span>
																		</div>
																	</div>

																	{/* Content Rows - matches modal style */}
																	{patientResult?.results?.map(
																		(result: RomResultItem, resultIdx: number) => {
																			const numericValue = extractValue(
																				result?.value,
																			);
																			const score = calculateScore(
																				result?.romProgramExercise?.normal ?? 0,
																				numericValue,
																			);
																			const getScoreColor = () => {
																				if (score >= 90) return '#16a34a';
																				if (score >= 60) return '#d97706';
																				return '#dc2626';
																			};

																			return (
																				<div
																					key={resultIdx}
																					className="avoid-page-break"
																					style={{
																						display: 'flex',
																						justifyContent: 'space-between',
																						alignItems: 'center',
																						padding: '10px 16px',
																						borderBottom:
																							resultIdx <
																							(patientResult?.results?.length ?? 0) - 1
																								? '1px solid #f3f4f6'
																								: 'none',
																						backgroundColor: '#ffffff',
																						pageBreakInside: 'avoid',
																						breakInside: 'avoid',
																					}}>
																					{/* Left side: Image Icon + Exercise Name */}
																					<div
																						style={{
																							display: 'flex',
																							alignItems: 'center',
																							gap: '8px',
																							flex: 1,
																						}}>
																						{(result?.screenshot || patientResult?.screenshot) && (
																							<a
																								href={result?.screenshot || patientResult?.screenshot}
																								target="_blank"
																								rel="noopener noreferrer"
																								style={{
																									display: 'flex',
																									alignItems: 'center',
																									justifyContent: 'center',
																									width: '24px',
																									height: '24px',
																									backgroundColor: '#f3f4f6',
																									borderRadius: '4px',
																									flexShrink: 0,
																								}}>
																										<Image01
																									width={14}
																									height={14}
																									color="stroke-gray-500"
																								/>
																							</a>
																						)}
																						<span
																							style={{
																								color: '#475467',
																								fontWeight: 600,
																								fontSize: '12px',
																							}}>
																							{result?.strapiOmniRomExercise
																								?.name ||
																								result?.romProgramExercise
																									?.strapiOmniRomExercise?.name ||
																								result?.romProgramExercise
																									?.exerciseLibrary?.title ||
																								result?.exerciseLibrary?.title ||
																								'Standard Motion'}
																						</span>
																					</div>
																					{/* Right side: Values */}
																					<div
																						style={{
																							display: 'flex',
																							gap: '4px',
																						}}>
																						<span
																							style={{
																								width: '70px',
																								textAlign: 'center',
																								color: '#475467',
																								fontSize: '12px',
																							}}>
																							{result?.romProgramExercise
																								?.normal ||
																								result?.normal ||
																								0}
																							°
																						</span>
																						<span
																							style={{
																								width: '70px',
																								textAlign: 'center',
																								color: '#475467',
																								fontSize: '12px',
																							}}>
																							{result?.wfl || 0}°
																						</span>
																						<span
																							style={{
																								width: '70px',
																								textAlign: 'center',
																								color: getScoreColor(),
																								fontWeight: 700,
																								fontSize: '12px',
																							}}>
																							{renderValue(result?.value)}°
																						</span>
																					</div>
																				</div>
																			);
																		},
																	)}
																</div>
																{idx < array.length - 1 && (
																	<div style={{ height: '8px' }} />
																)}
															</>
														);
													},
												)}
											</div>
											<>
												{(report?.romSessionsNotes?.length ?? 0) > 0 && (
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
														{report?.romSessionsNotes?.map((note: ReportNotes, index: number) => {
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
										</>
									)}
								</>
							);
						})}
					</div>
				</>
			)}
		</>
	);
}
