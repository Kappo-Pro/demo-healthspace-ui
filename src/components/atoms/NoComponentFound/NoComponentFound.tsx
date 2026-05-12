import React from 'react'
import { useTranslation } from 'react-i18next'

const NoComponentFound = () => {

  const {t} = useTranslation()
  
  return (
    <div className="no-component-found-div">{t('Admin.data.menu.patientDetail.aiAssistantSearchBar.permissionDenied')}</div>
  )
}

export default NoComponentFound