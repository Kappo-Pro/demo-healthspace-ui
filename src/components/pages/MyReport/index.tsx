import CoachReport from '@pages/Contacts/Details/CoachReport'

export default function AiAssistantMyReport({perPage}: {perPage?: number}) {
  
  return (
    <div className='m-6'>
        <CoachReport perPage={perPage} isAssistant/>
    </div>
  )
}
