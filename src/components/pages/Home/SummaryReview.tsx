import { UntitledIcon } from '@atoms/Icon';
import { TStrapiBodyPoints } from '@molecules/MBodyPoints/interface';
import stores, { useTypedSelector } from '@stores/index';
import { Card, Divider, Flex, Tag, Tooltip, message } from 'antd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import DownloadSummary from './DownloadSummary';
import {
	EvaluationData,
	Options,
	PainAssessments,
	THealthSignsOptions,
} from './interface';
import SummuryOptionList from './summaryOptionList';

export interface SummaryReviewInterface {
	list?: THealthSignsOptions[];
	medicalHistoryOptionsData?: Options[];
	savedEvaluationData?: EvaluationData;
	bodyOptionsList?: TStrapiBodyPoints;
	/** Hide download/copy action buttons (used when actions are in parent modal header) */
	hideActions?: boolean;
}

const SummaryReview = (props: SummaryReviewInterface) => {
	const {
		list,
		medicalHistoryOptionsData,
		savedEvaluationData,
		hideActions = false,
	} = props;
	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);
	const associatedSymptomsData = useTypedSelector(
		state => state.painAssessment.associatedSymptoms,
	);
	const medicalHistoryData = useTypedSelector(
		state => state.painAssessment.medicalHistory,
	);
	const formattedDate = moment(new Date()).format('MMMM DD, YYYY hh:mm A');

	const copyToClipboard = () => {
		message.success(
			t('Patient.data.virtualEvaluation.summary.copyToClipboard'),
		);
		const summaryElement = document.getElementById('summary');
		if (summaryElement) {
			navigator.clipboard
				.writeText(summaryElement.innerText)
				.catch((_error: Error) => {
					message.error('Failed to copy to clipboard');
				});
		}
	};

	const handleDownload = async () => {
		const container = document.createElement('div');
		container.style.position = 'absolute';
		container.style.top = '-9999px';
		container.style.left = '-9999px';
		container.style.width = '1500px';
		container.style.zIndex = '-1';
		document.body.appendChild(container);

		const ReportWithProviders = (
			<Provider store={stores}>
				<DownloadSummary
					list={list}
					medicalHistoryOptionsData={medicalHistoryOptionsData}
					savedEvaluationData={savedEvaluationData}
				/>
			</Provider>
		);

		const root = createRoot(container);
		root.render(ReportWithProviders);

		await new Promise(res => setTimeout(res, 1000));
		const pdf = new jsPDF({ unit: 'px', format: 'a3' });
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();

		const margin = 20;
		let currentY = margin;

		const sections = container.querySelectorAll('.pdf-section');

		for (let i = 0; i < sections.length; i++) {
			const section = sections[i] as HTMLElement;

			const canvas = await html2canvas(section, {
				useCORS: true,
				scale: 1.25,
				scrollY: 0,
				scrollX: 0,
				windowWidth: 1000,
			});

			const imgData = canvas.toDataURL('image/jpeg', 0.8);
			const imgWidth = pageWidth - margin * 2;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			if (currentY + imgHeight > pageHeight - margin) {
				pdf.addPage();
				currentY = margin;
			}

			pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
			currentY += imgHeight;
		}
		pdf.save(`report.pdf`);
		root.unmount();
		document.body.removeChild(container);
	};

	const { t } = useTranslation();
	return (
		<div className="summary-review">
			{!hideActions && (
				<div className="download-copy-container">
					<Tooltip
						placement="topRight"
						className="cursor-pointer-css"
						title={t('Patient.data.virtualEvaluation.summary.download')}
						showArrow={false}>
						<span onClick={handleDownload}>
							<UntitledIcon name="download" size={20} />
						</span>
					</Tooltip>
					<Tooltip
						placement="topRight"
						className="cursor-pointer-css"
						title={t('Patient.data.virtualEvaluation.summary.copy')}
						showArrow={false}>
						<span onClick={() => copyToClipboard()}>
							<UntitledIcon name="copy" size={20} />
						</span>
					</Tooltip>
				</div>
			)}
			<div
				id="summary"
				className="download-page-container"
				style={{ color: 'var(--text-color-root)' }}>
				{!hideActions && (
					<>
						<div className="patient-details-container">
							<p className="font-semibold">
								{t('Patient.data.virtualEvaluation.summary.patientID')}{' '}
								<span className="font-regular">
									{user.isPhysioterapist ? selectedUser.id : user.id}
								</span>
							</p>
							<p className="font-semibold">
								{t('Patient.data.virtualEvaluation.summary.patientName')}{' '}
								<span className="font-regular">
									{user.isPhysioterapist
										? (selectedUser?.profile?.firstName ?? '') +
											' ' +
											(selectedUser?.profile?.lastName ?? '')
										: user.profile.firstName + ' ' + user.profile.lastName}
								</span>
							</p>
						</div>
						<Divider />
					</>
				)}
				{!hideActions && (
					<div
						className="assessment-date"
						style={{ color: 'var(--text-color-root)' }}>
						<p className="font-semibold">
							{t('Patient.data.virtualEvaluation.summary.dateOfAssessment')}{' '}
							<span className="font-regular">{formattedDate}</span>
						</p>
					</div>
				)}
				{savedEvaluationData?.painAssessments &&
				savedEvaluationData.painAssessments.length > 0 ? (
					<>
						<div
							className="pain-assessments-container"
							style={{
								color: 'var(--text-color-root)',
								padding: 'var(--spacing-3) 0',
							}}>
							<span
								className="pain-summary-text"
								style={{
									fontSize: 'var(--font-size-base)',
									fontWeight: 'var(--font-weight-semibold)',
								}}>
								{t('patient.progress.evaluation.painSummary')}
							</span>
						</div>
						<Card
							className="associated-card"
							style={{
								background: 'var(--bg-page)',
								border: 'none',
								borderRadius: 'var(--radius-xl)',
							}}>
							{(savedEvaluationData?.painAssessments ?? []).map(
								(
									item: PainAssessments,
									index: number,
									arr: PainAssessments[],
								) => {
									return (
										<SummuryOptionList
											item={item}
											key={index}
											isLast={index === arr.length - 1}
										/>
									);
								},
							)}
						</Card>
					</>
				) : null}
				<div
					className="associated-symptoms-container"
					style={{
						color: 'var(--text-color-root)',
						padding: 'var(--spacing-3) 0',
					}}>
					<span
						className="associated-symptoms"
						style={{
							fontSize: 'var(--font-size-base)',
							fontWeight: 'var(--font-weight-semibold)',
						}}>
						{t('patient.progress.evaluation.associatedSymptoms')}
					</span>
				</div>
				<Flex gap={8} wrap="wrap">
					{(associatedSymptomsData?.strapiHealthSignsIds ?? []).map(
						(id: string, index: number) => {
							const associatedSymptom = list?.find(
								(symptom: Options) => symptom?.id === id,
							);
							return (
								<Tag
									key={index}
									style={{
										margin: 0,
										padding: 'var(--spacing-1) var(--spacing-2-5)',
										fontSize: 'var(--font-size-xs)',
										fontWeight: 'var(--font-weight-medium)',
										color: 'var(--text-secondary)',
										background: 'var(--surface-secondary)',
										border: '1px solid var(--border-subtle)',
										borderRadius: 'var(--radius-md)',
										lineHeight: 'var(--line-height-snug)',
									}}>
									{associatedSymptom?.name}
								</Tag>
							);
						},
					)}
				</Flex>
				<div
					className="medical-history-container"
					style={{
						color: 'var(--text-color-root)',
						padding: 'var(--spacing-3) 0',
					}}>
					<span
						className="medical-history"
						style={{
							fontSize: 'var(--font-size-base)',
							fontWeight: 'var(--font-weight-semibold)',
						}}>
						{t('patient.progress.evaluation.medicalHistory')}
					</span>
				</div>
				<Flex gap={8} wrap="wrap">
					{(medicalHistoryData?.strapiMedicalHistoriesIds ?? []).map(
						(id: string, index: number) => {
							const medicalHistoryName = medicalHistoryOptionsData?.find(
								(symptom: Options) => symptom.id == id,
							);
							return (
								<Tag
									key={index}
									style={{
										margin: 0,
										padding: 'var(--spacing-1) var(--spacing-2-5)',
										fontSize: 'var(--font-size-xs)',
										fontWeight: 'var(--font-weight-medium)',
										color: 'var(--text-secondary)',
										background: 'var(--surface-secondary)',
										border: '1px solid var(--border-subtle)',
										borderRadius: 'var(--radius-md)',
										lineHeight: 'var(--line-height-snug)',
									}}>
									{medicalHistoryName?.name}
								</Tag>
							);
						},
					)}
				</Flex>
			</div>
		</div>
	);
};
export default SummaryReview;
