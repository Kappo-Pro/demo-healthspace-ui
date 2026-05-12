import CreateReportModalContent from '@pages/Contacts/Details/CreateReportModalContent';
// REMOVED: import { useTranslation } from 'react-i18next';
import './style.css'

export default function AiAssistantCreateReportModal() {
	return (
		<div className='create-report-container'>
			<div className='create-report-modal-container'>
				<CreateReportModalContent />
			</div>
		</div>
	)
}
