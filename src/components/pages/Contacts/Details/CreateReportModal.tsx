import { Modal } from 'antd';
import './style.css';
import { useTranslation } from 'react-i18next';
import CreateReportModalContent from './CreateReportModalContent';

interface CreateReportModalProps {
  isVisible: boolean
  onCancel: () => void
}
const CreateReportModal = (props: CreateReportModalProps) => {
  const {
    isVisible,
    onCancel
  } = props

  const { t } = useTranslation();

  return (
    <Modal
    title={<span className="titleStyle">{t('Admin.data.addToReports.createReport')}</span>}
    open={isVisible}
    onCancel={onCancel}
    footer={false}
    width={788}
   className="select-none"
  >
    <CreateReportModalContent onCancel={onCancel}/>
    </Modal>
  );

};

export default CreateReportModal
