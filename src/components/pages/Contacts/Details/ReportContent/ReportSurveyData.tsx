import { FaceFrown } from '@vitalflow-icons/users/faceFrown';
import { FaceHappy } from '@vitalflow-icons/users/faceHappy';
import { FaceNeutral } from '@vitalflow-icons/users/faceNeutral';
import { FaceSad } from '@vitalflow-icons/users/faceSad';
import { FaceSmile } from '@vitalflow-icons/users/faceSmile';
import { FaceWink } from '@vitalflow-icons/users/faceWink';
import { getReport, updateReportNotes } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { SurveyResult, SurveyResultQuestionList } from '@types';
import { Typography, message } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddNotes from './AddNotes';
import ReportNotesDownloadTemplate from './ReportNotes/ReportNotesDownloadTemplate';
import ReportNotesTemplate from './ReportNotes/ReportNotesTemplate';
import './ReportSurveyData.css';

const { Paragraph } = Typography;

interface ReportSurveyDataProps {
	isEditMode: boolean;
	isDownload?: boolean;
}

export default function ReportSurveyData(props: ReportSurveyDataProps) {
	const { isEditMode, isDownload } = props;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const report = useTypedSelector(state => state.reports.report);
	const [surveyResultNotes, setSurveyResultNotes] = useState<string>();
	const [isUpdating, setIsUpdating] = useState(false);

	const getPainLevel = (
		painLevel: number,
		question: SurveyResultQuestionList,
	) => {
		switch (painLevel) {
			case 1:
				return (
					<div className="report-survey-painlevel">
						<div className={`${isDownload ? 'pt-[5px]' : ''}`}>
							<FaceFrown color={'stroke-rose-700'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-rose-700">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 2:
				return (
					<div className="report-survey-painlevel">
						<div className={`${isDownload ? 'pt-[5px]' : ''}`}>
							<FaceFrown color={'stroke-rose-500'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-rose-500">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 3:
				return (
					<div className="report-survey-painlevel">
						<div className={`${isDownload ? 'pt-[5px]' : ''}`}>
							<FaceSad color={'stroke-orange-400'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-orange-400">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 4:
				return (
					<div className="report-survey-painlevel">
						<div className={`${isDownload ? 'pt-[5px]' : ''}`}>
							<FaceSad color={'stroke-orange-300'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-orange-300">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 5:
				return (
					<div className="report-survey-painlevel">
						<div className={`${isDownload ? 'pt-[5px]' : ''}`}>
							<FaceNeutral color={'stroke-yellow-400'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-yellow-400">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 6:
				return (
					<div className="report-survey-painlevel">
						<div className={`${isDownload ? 'pt-[5px]' : ''}`}>
							<FaceNeutral color={'stroke-yellow-300'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-yellow-300">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 7:
				return (
					<div className="report-survey-painlevel">
						<div className="pt-[5px]">
							<FaceSmile color={'stroke-green-300'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-green-300">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 8:
				return (
					<div className="report-survey-painlevel">
						<div className="pt-[5px]">
							<FaceSmile color={'stroke-green-500'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-green-500">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 9:
				return (
					<div className="report-survey-painlevel">
						<div className="pt-[5px]">
							<FaceWink color={'stroke-green-700'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-green-700">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			case 10:
				return (
					<div className="report-survey-painlevel">
						<div className="pt-[5px]">
							<FaceHappy color={'stroke-cyan-500'} width={20} height={20} />
						</div>
						<span className="report-survey-painlevel-label text-cyan-500">
							{question?.selectedAnswer}
						</span>
					</div>
				);
			default:
				return null;
		}
	};

	const handleSubmit = async () => {
		const reportId = report?.id || '';
		const payload = {
			surveyResultNotes: {
				notes: surveyResultNotes,
			},
		};
		await dispatch(updateReportNotes({ payload, reportId }));
		setSurveyResultNotes('');
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
				formData.append('surveyResultNotes[notes]', messageDescription);
				if (imgFile?.[0]) {
					formData.append('images', imgFile[0]);
				}
				if (videoBlob) {
					formData.append(`videos`, videoBlob);
				}
				const result = await dispatch(
					updateReportNotes({
						payload: formData,
						reportId: reportId,
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

	return (
		<div style={{ fontSize: 'var(--font-size-sm)' }}>
			<Paragraph className="report-survey-summary">
				{t('Admin.data.survey.surveySummary')}
			</Paragraph>
			{report?.surveyResultIds?.map((item: SurveyResult, index: number) => {
				let totalScore = 0;
				item.questionList.forEach((question: SurveyResultQuestionList) => {
					totalScore += question.score || 0;
				});
				return (
					<div className="report-survey-container">
						<p className="report-survey-date">
							{t('patient.progress.evaluation.dateOfAssessment')}{' '}
							<span className="font-regular">
								{moment(item.createdAt).local().format('LLL')}
							</span>
						</p>
						{
							<div className="report-survey-summary-container">
								<div className="report-survey-list">
									<div className="report-survey-inner-list">
										<Paragraph className="report-survey-title">
											{item.title ? item.title : `Survey Result - ${index + 1}`}
										</Paragraph>
									</div>

									{totalScore !== 0 && (
										<div className="report-score-container">
											<p
												className={`${!isDownload ? 'report-score-label pb-1' : 'report-score-label !pb-4'}`}>
												{t('Admin.data.survey.score')} : {totalScore}
											</p>
										</div>
									)}
								</div>
								{item.questionList.map(
									(question: SurveyResultQuestionList, index: number) => (
										<div
											key={index}
											className="report-survey-question-container">
											<div className="report-survey-question-inner-container">
												<Paragraph className="report-survey-question">
													{index + 1} - {question.question}
												</Paragraph>
												{question?.score != null && (
													<p
														className={`${!isDownload ? 'report-survey-question-score pb-1' : 'report-survey-question-score !pb-3'}`}>
														{question.score}
													</p>
												)}
											</div>
											<hr
												style={{
													margin: '10px 0',
													border: 'none',
													borderTop: '1px solid var(--border-primary)',
												}}
											/>
											{question.answerList?.length === 0 &&
											question.questionType === 'rate' &&
											question.ratingLevel ? (
												<Paragraph>
													{getPainLevel(question.ratingLevel, question)}
												</Paragraph>
											) : (question.answerList?.length ?? 0) > 0 &&
											  question.questionType !== 'rate' ? (
												<ul>
													{question.answerList?.map(
														(answer: string, index: number) => (
															<li
																key={index}
																style={{ marginBottom: 'var(--spacing-1)' }}>
																- {answer}
															</li>
														),
													)}
												</ul>
											) : (
												<>
													<ul>
														<li
															key={index}
															style={{ marginBottom: 'var(--spacing-1)' }}>
															- {question.selectedAnswer}
														</li>
													</ul>
												</>
											)}
										</div>
									),
								)}
							</div>
						}
					</div>
				);
			})}
			{report?.surveyResultNotes?.some(note => note.notes?.trim()) &&
				report.surveyResultNotes.length > 0 && (
					<>
						<>
							<div className="text-left mt-2 mb-2">
								<span className="font-semibold text-sm text-gray-900">
									{t('Admin.data.addNotes.notes')}
								</span>
							</div>
							{!isDownload ? (
								<>
									{report?.surveyResultNotes?.map((note, index) => {
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
									{report?.surveyResultNotes?.map((note, index) => {
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
			{report?.surveyResultIds?.length != 0 && !isDownload ? (
				<AddNotes
					sendMessage={sendMessage}
					onClick={() => {
						handleSubmit();
					}}
					onChange={event => setSurveyResultNotes(event.target.value)}
					isUpdating={isUpdating}
				/>
			) : null}
		</div>
	);
}
