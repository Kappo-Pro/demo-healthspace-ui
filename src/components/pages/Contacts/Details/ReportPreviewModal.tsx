import { AddToReports } from '@atoms/AddToReports'
import { ArrowLeft } from '@vitalflow-icons/arrows/arrowLeft'
import { LetsMoveSessions } from '@pages/Patient/Conversation/LetsMoveSessions'
import { ListEvaluation } from '@pages/Patient/Conversation/ListEvaluation'
import { RomCaptures } from '@pages/Patient/Conversation/RomCaptures'
import AiAssistantRomSummary from '@pages/RomSummary'
import AiAssistantSurveySummary from '@pages/SurveySummary'
import { PatientDetailTabs, AddButtonItemsProps } from '@types'
import { Modal } from 'antd'
import './ReportPreviewModal.css'
import { setIsReportModal } from '@stores/shared/patientDetail/patientDetail'
import { useTypedDispatch } from '@stores/index'
import { clearReports } from '@stores/content/report/reports'
import { useTranslation } from 'react-i18next'
import AiPostureSummary from '@pages/AiPosture/AiPostureSummary'
import { THEME } from '@stores/constants'

interface IReportPreviewModalProps {
  isVisible: boolean
  setIsVisible: (val: boolean) => void
  activeComponent: AddButtonItemsProps
}

export default function ReportPreviewModal(props: IReportPreviewModalProps) {
  const { isVisible, setIsVisible, activeComponent } = props
  const dispatch = useTypedDispatch();
  const {t} = useTranslation()
  const handleCancel = () => {
    setIsVisible(false);
    dispatch(setIsReportModal(false));
    dispatch(clearReports());
  }

  const isDark = document.documentElement.getAttribute("data-theme") === THEME.VIBRANT

  return (
    <Modal
      title={<div className='report-preview-title' onClick={handleCancel}>
        <ArrowLeft width={30} height={30} color={`${isDark ? 'stroke-text-primary':'stroke-primary-800'}`} /><span className="titleStyle">{t("Admin.data.addNotes.add")} {activeComponent.label}</span>
      </div>}
      open={isVisible}
      onCancel={handleCancel}
      footer={false}
      width={1205}
      className="select-none"
      className='review-modal-css'
      maskClosable={false}
    >
      <div style={{backgroundColor:'var(--p-text-color-root)', padding:'var(--spacing-1)'}}>
      <div className="soap-add-to-report-css">
        <AddToReports setIsVisible={setIsVisible} />
      </div>
      <div>
        {activeComponent.key === PatientDetailTabs.listEvaluation && <ListEvaluation />}
        {activeComponent.key === PatientDetailTabs.romSummary && <AiAssistantRomSummary />}
        {activeComponent.key === PatientDetailTabs.captures && <RomCaptures />}
        {activeComponent.key === PatientDetailTabs.listSessions && <LetsMoveSessions />}
        {activeComponent.key === PatientDetailTabs.surveySummary && <AiAssistantSurveySummary />}
        {activeComponent.key === PatientDetailTabs.postureSummary && <AiPostureSummary />}
      </div>
      </div>
    </Modal>
  )
}
