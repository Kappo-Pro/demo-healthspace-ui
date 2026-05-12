import { Modal } from 'antd'
import { ReportModalProps } from '@types'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import MediumEditor from 'medium-editor';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import ReportHeader from './ReportHeader'
import ReportContent from './ReportContent'
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';

export const ReportModal = (props: ReportModalProps) => {
  const {
    isModalVisible,
    onOk,
    onCancel,
    copyToClipboard,
    downloadPdf2,
    reportModalLoading
  } = props

  const { t } = useTranslation();

  const [confirmPopUp, setConfirmPopUp] = useState(false);
  const [mediumEditor, setMediumEditor] = useState<MediumEditor | null>(null);
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (isEditMode) {
      const painSummaryEditor = new MediumEditor('#painSummaryEditor', {});
      const symptomsEditor = new MediumEditor('#associatedSymptomsEditor', {});
      const historyEditor = new MediumEditor('#medicalHistoryEditor', {});
      setMediumEditor({
        summary: painSummaryEditor,
        symptoms: symptomsEditor,
        history: historyEditor,
      });
      return () => {
        painSummaryEditor.destroy();
        symptomsEditor.destroy();
        historyEditor.destroy();
      };
    }
  }, [isEditMode]);

  const handleSave = () => {
    setIsEditMode(false);
    onCancel();
  };

  const handleCancel = () => {
    if (isEditMode) {
      const hasChanges =
        mediumEditor?.summary?.getContent() !== '' ||
        mediumEditor?.symptoms?.getContent() !== '' ||
        mediumEditor?.history?.getContent() !== '';

      if (hasChanges) {
        setConfirmPopUp(true);
        return;
      }
    }
    onCancel();
  };

  return (
    <Modal
      title={<span className="titleStyle">{t("Admin.data.addNotes.soapReport")}</span>}
      open={isModalVisible}
      onOk={onOk}
      onCancel={handleCancel}
      footer={false}
      width={MODAL_SIZES.XXLARGE}
      className='select-none'
    >
      <ReportHeader setConfirmPopUp={setConfirmPopUp} confirmPopUp={confirmPopUp} downloadPdf2={downloadPdf2} copyToClipboard={copyToClipboard} handleSave={handleSave} />
      <ReportContent
        reportModalLoading={reportModalLoading}
        isEditMode={isEditMode}
      />
    </Modal>
  )
}