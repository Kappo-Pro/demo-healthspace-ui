import { UntitledIcon } from '@atoms/Icon';
import AdminQRCodeModal from '@pages/AdminQRCodeModal';
import { getRomMobilityReports } from '@stores/clinical/rom/customRom';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { CustomRomSession, SelectedUser } from '@types';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryResultEditModal } from './SummaryResultEditModal';
import SendResultByEmailModal from './SummaryResultReportEmail';

interface SummaryResultReportDownloaderProps {
	selectedRom: CustomRomSession;
	user: SelectedUser;
	fetchSessionData?: (sessionId: string, page: number) => void;
	reportType: 'download' | 'qr' | 'email' | 'edit';
	color?: string;
	completedStatus: boolean;
	chartType?: string;
}

export const SummaryResultReportDownloader = ({
	selectedRom,
	user: _user,
	completedStatus,
	fetchSessionData,
	reportType,
	color,
	chartType: _chartType,
}: SummaryResultReportDownloaderProps) => {
	const { t } = useTranslation();
	const { pdfLink = '' } = useTypedSelector(state => state.rom.customRom);
	const [downloadingPhase, setDownLoadingPhase] = useState<string>('');
	const [emailModalOpen, setEmailModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [loading, setLoading] = useState(false);
	const dispatch = useTypedDispatch();

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
	}, [downloadingPhase, loading, reportType, t]);

	const handleQRCodeGeneration = () => {
		setQrCodeModalOpen(true);
		handleDownload();
	};

	const handleEmail = () => {
		setEmailModalOpen(true);
		handleDownload();
	};
	const handleEdit = () => {
		setEditModalOpen(true);
	};

	const handleDownload = async () => {
		try {
			setDownLoadingPhase(t('Patient.data.vitalscan-rom.fetchingData'));
			setLoading(true);

			const response = await dispatch(
				getRomMobilityReports({ sessionId: selectedRom.id }),
			).unwrap();

			const reportUrl = response;
			if (!reportUrl) {
				message.error('Report URL not found');
				setLoading(false);
				setDownLoadingPhase('');
				return;
			}
			setDownLoadingPhase(t('Patient.data.vitalscan-rom.generatingPdf'));
			const fileResponse = await fetch(reportUrl);
			const pdfBlob = await fileResponse.blob();

			if (reportType === 'email') {
				setPdfBlob(pdfBlob);
			} else if (reportType === 'qr') {
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
		} catch (error) {
			message.error('Failed to fetch report data');
			setDownLoadingPhase('');
			setLoading(false);
		}
	};

	return reportType === 'email' ? (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<div
				className="cursor-pointer"
				onClick={() => handleEmail()}
				style={{ display: 'flex', alignItems: 'center' }}>
				<UntitledIcon
					name="mail-01"
					size={16}
					color={color ? color : 'var(--text-secondary)'}
				/>
			</div>
			{emailModalOpen && (
				<SendResultByEmailModal
					selectedRom={selectedRom}
					pdfBlob={pdfBlob}
					modalOpen={emailModalOpen}
					setModalOpen={setEmailModalOpen}
					closable={true}
				/>
			)}
		</div>
	) : reportType === 'download' ? (
		<div
			onClick={handleDownload}
			className="cursor-pointer"
			style={{ display: 'flex', alignItems: 'center' }}>
			<UntitledIcon
				name="download-02"
				size={16}
				color={color ? color : 'var(--text-secondary)'}
			/>
		</div>
	) : reportType === 'edit' ? (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<div
				className="cursor-pointer"
				onClick={e => handleEdit(e)}
				style={{ display: 'flex', alignItems: 'center' }}>
				<UntitledIcon
					name="edit-01"
					size={16}
					color={color ? color : 'var(--text-secondary)'}
				/>
			</div>
			{editModalOpen && (
				<SummaryResultEditModal
					completedStatus={completedStatus}
					fetchSessionData={fetchSessionData}
					selectedRom={selectedRom}
					modalOpen={editModalOpen}
					setModalOpen={setEditModalOpen}
					closable={true}
				/>
			)}
		</div>
	) : (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<div
				className="cursor-pointer"
				onClick={() => handleQRCodeGeneration()}
				style={{ display: 'flex', alignItems: 'center' }}>
				<UntitledIcon
					name="qr-code-02"
					size={16}
					color={color ? color : 'var(--text-secondary)'}
				/>
			</div>
			{qrCodeModalOpen && (
				<AdminQRCodeModal
					qrCodeModalOpen={qrCodeModalOpen}
					setQrCodeModalOpen={setQrCodeModalOpen}
					qrCodeUrl={pdfLink}
					closable={true}
					loading={loading}
				/>
			)}
		</div>
	);
};
