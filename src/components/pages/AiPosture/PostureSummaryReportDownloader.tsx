import { UntitledIcon } from '@atoms/Icon';
import AdminQRCodeModal from '@pages/AdminQRCodeModal';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { IPosture } from '@stores/interfaces';
import { getPostureMobilityReports } from '@stores/posture/postures/postures';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SummaryResultReportDownloaderProps {
	selectedPosture: IPosture;
	reportType: 'download' | 'qr' | 'email';
	color?: string;
}

export const PostureSummaryReportDownloader = ({
	selectedPosture,
	reportType,
	color,
}: SummaryResultReportDownloaderProps) => {
	const { t } = useTranslation();
	const { pdfLink = '' } = useTypedSelector(state => state.postures.postures);
	const [downloadingPhase, setDownLoadingPhase] = useState<string>('');
	const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const dispatch = useTypedDispatch();
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const key = 'downloadProcess';
		if (reportType == 'download')
			if (downloadingPhase.length > 0) {
				message.loading({
					content: downloadingPhase,
					key,
					duration: 0,
				});
			} else {
				message.destroy(key);
				if (loading) {
					message
						.success({
							content: t('Admin.data.survey.done'),
							key,
							duration: 1,
						})
						.then(() => setLoading(false));
				}
			}
	}, [downloadingPhase, loading]);

	const handleQRCodeGeneration = () => {
		setErrorMessage(''); // Clear previous errors
		setQrCodeModalOpen(true);
		handleDownload();
	};

	const handleModalClose = (open: boolean) => {
		setQrCodeModalOpen(open);
		if (!open) {
			setErrorMessage(''); // Clear error when modal closes
		}
	};

	const handleDownload = async () => {
		try {
			setDownLoadingPhase(t('Patient.data.vitalscan-rom.fetchingData'));
			setLoading(true);
			setErrorMessage(''); // Clear previous errors

			const response = await dispatch(
				getPostureMobilityReports({ sessionId: selectedPosture?.id }),
			).unwrap();

			const reportUrl = response;
			if (!reportUrl) {
				const errorMsg = 'Report URL not found';
				setErrorMessage(errorMsg);
				if (reportType !== 'qr') {
					message.error(errorMsg);
				}
				setLoading(false);
				setDownLoadingPhase('');
				return;
			}
			setDownLoadingPhase(t('Patient.data.vitalscan-rom.generatingPdf'));
			const fileResponse = await fetch(reportUrl);
			const pdfBlob = await fileResponse.blob();

			if (reportType === 'qr') {
				const formData = new FormData();
				formData.append('mustSendEmail', 'false');
				formData.append('attachment', pdfBlob);
			} else {
				const url = URL.createObjectURL(pdfBlob);
				const link = document.createElement('a');
				link.href = url;
				link.download = 'report.pdf';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}

			setDownLoadingPhase('');
			setLoading(false);
			setErrorMessage(''); // Clear error on success
		} catch (error) {
			console.error(error);
			const errorMsg = 'Failed to scan the pdf. Please contact admin.';
			setErrorMessage(errorMsg);
			if (reportType !== 'qr') {
				message.error(errorMsg);
			}
			setDownLoadingPhase('');
			setLoading(false);
		}
	};

	return reportType === 'download' ? (
		<div onClick={handleDownload} style={{ cursor: 'pointer' }}>
			<UntitledIcon
				name="download"
				size={20}
				color={color ? 'var(--text-primary)' : 'var(--text-secondary)'}
			/>
		</div>
	) : (
		<div>
			<div
				style={{ cursor: 'pointer' }}
				onClick={() => handleQRCodeGeneration()}>
				<UntitledIcon
					name="qr"
					size={20}
					color={color ? 'var(--text-primary)' : 'var(--text-secondary)'}
				/>
			</div>
			{qrCodeModalOpen && (
				<AdminQRCodeModal
					qrCodeModalOpen={qrCodeModalOpen}
					setQrCodeModalOpen={handleModalClose}
					qrCodeUrl={pdfLink}
					closable={true}
					loading={loading}
					error={errorMessage}
				/>
			)}
		</div>
	);
};
