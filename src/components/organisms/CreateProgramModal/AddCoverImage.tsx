import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { AddCoverImageProps } from '@types';
import { Modal, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import './AddCoverImage.css';
import AddCoverUpload from './AddCoverUpload';

export default function AddCoverImage(props: AddCoverImageProps) {
	const { openCoverImage, setOpenCoverImage } = props;
	const { t } = useTranslation();

	return (
		<Modal
			title={
				<Typography.Text style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
					{t('Admin.data.menu.patientDetail.aiAssistantPrograms.coverImage')}
				</Typography.Text>
			}
			onOk={() => setOpenCoverImage(false)}
			open={openCoverImage}
			style={{ top: 20 }}
			onCancel={() => setOpenCoverImage(false)}
			footer={false}
			width={MODAL_SIZES.LARGE}
			className="select-none"
			maskClosable={false}>
			<AddCoverUpload {...props} />
		</Modal>
	);
}
