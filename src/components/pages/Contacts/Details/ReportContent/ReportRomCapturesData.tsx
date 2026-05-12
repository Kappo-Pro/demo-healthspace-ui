import { UntitledIcon } from '@atoms/Icon';
import { getReport, updateReportNotes } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { RomPatientResult } from '@types';
import { Col, Flex, Image, Typography, message } from 'antd';
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

export default function ReportRomCapturesData(
	props: ReportRomCapturesDataProps,
) {
	const { isEditMode, isDownload } = props;
	const { t } = useTranslation();
	const report = useTypedSelector(state => state.reports.report);
	const [romResultsNotes, setRomResultsNotes] = useState<string>();
	const dispatch = useTypedDispatch();

	const handleSubmit = async () => {
		const reportId = report?.id || '';
		const payload = {
			romResultsNotes: {
				notes: romResultsNotes,
			},
		};
		await dispatch(updateReportNotes({ payload, reportId }));
		setRomResultsNotes('');
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
			formData.append('romResultsNotes[notes]', messageDescription);
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
			<div className="pb-2">
				{!isDownload ? (
					<>
						<Paragraph className="font-bold text-base text-gray-600 mt-5 text-center mb-5">
							{t('Admin.data.addToReports.romCapturesData')}
						</Paragraph>
						<Flex
							align="center"
							gap={40}
							style={{ paddingLeft: 'var(--spacing-5)' }}>
							{report?.romResultsIds?.map((item: RomPatientResult) => {
								const DateUtc = moment(item?.createdAt).local().format('LLL');

								return (
									<Col
										key={`col-${item.id}`}
										xs={{ span: 12 }}
										sm={{ span: 12 }}
										lg={{ span: 5 }}
										xxl={{ span: 5 }}>
										<div className="screenshot tipChart">
											<Image
												className="object-contain"
												width="100%"
												height={125}
												src={item.screenshot}
												preview={{
													src: item.screenshot,
													mask: <UntitledIcon name="eye" size={18} />,
													width: 'auto',
													height: 'auto',
												}}
											/>
											<div className="date">{DateUtc}</div>
											<div className="value">{item.value}°</div>
										</div>
									</Col>
								);
							})}
						</Flex>
					</>
				) : (
					<>
						<Paragraph className="font-bold text-base text-gray-600 mt-5 text-center mb-5">
							{t('Admin.data.addToReports.romCapturesData')}
						</Paragraph>
						{report?.romResultsIds?.map((item: RomPatientResult) => {
							return (
								<Fragment>
									<p className="py-[15px] text-gray-600">
										<b className="font-bold">
											{t('Admin.data.addToReports.sessionDate')}
										</b>{' '}
										{moment(item.createdAt).local().format('LLL')}
									</p>
									<Flex
										vertical
										gap={2}
										className="p-[15px] my-2.5 bg-gray-100 mt-1 rounded-lg border-1 border-inherit text-sm text-gray-500">
										<p className="font-normal">
											<b className="font-bold">
												{t('Admin.data.addToReports.screenshot')}{' '}
											</b>
											<a href={item.screenshot} target="_blank">
												{item.screenshot}
											</a>
										</p>
										<p className="font-normal">
											<b className="font-bold">
												{t('Admin.data.addToReports.value')}{' '}
											</b>
											{item.value}°
										</p>
									</Flex>
								</Fragment>
							);
						})}
					</>
				)}
				{report?.romResultsNotes?.some(note => note.notes?.trim()) && (
					<>
						// TODO: Consider using length ?? defaultValue or length?.property
						instead of length!
						{(report?.romResultsNotes?.length ?? 0) > 0 ? (
							<>
								<div className="text-left mt-3 mb-3">
									<span className="font-semibold text-base text-gray-900">
										{t('Admin.data.addNotes.notes')}
									</span>
								</div>
								{!isDownload ? (
									<>
										{report?.romResultsNotes?.map((note, index) => {
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
										{report?.romResultsNotes?.map((note, index) => {
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
				{report?.romResultsIds?.length != 0 && !isDownload ? (
					<AddNotes
						sendMessage={sendMessage}
						onClick={() => handleSubmit()}
						onChange={event => setRomResultsNotes(event.target.value)}
					/>
				) : null}
			</div>
		</>
	);
}
