import { UntitledIcon } from '@atoms/Icon';
import { Flex, Modal, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

interface ReportHeaderProps {
	copyToClipboard: () => void;
	downloadPdf2: () => void;
	confirmPopUp: boolean;
	handleSave: () => void;
	setConfirmPopUp: (value: boolean) => void;
}

export default function ReportHeader(props: ReportHeaderProps) {
	const {
		downloadPdf2,
		copyToClipboard,
		confirmPopUp,
		handleSave,
		setConfirmPopUp,
	} = props;
	const { t } = useTranslation();

	return (
		<Flex justify="flex-end" className="pr-7">
			<Tooltip
				placement="topRight"
				title={t('patient.progress.evaluation.download')}
				showArrow={false}>
				<span className="cursor-pointer" onClick={() => downloadPdf2()}>
					<UntitledIcon name="download" />
				</span>
			</Tooltip>
			<Tooltip
				placement="topRight"
				title={t('patient.progress.evaluation.copy')}
				showArrow={false}>
				<span
					className="cursor-pointer"
					style={{ paddingLeft: 'var(--spacing-4)' }}
					onClick={() => copyToClipboard()}>
					<UntitledIcon name="copy" />
				</span>
			</Tooltip>
			<Modal
				title={t('Admin.data.addToReports.confirmPopupStatus')}
				className="select-none"
				centered
				open={confirmPopUp}
				onOk={handleSave}
				onCancel={() => setConfirmPopUp(false)}
				okText="Yes"
				cancelText="No"></Modal>
		</Flex>
	);
}
