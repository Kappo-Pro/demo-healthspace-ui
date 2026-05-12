import { combineReducers } from '@reduxjs/toolkit'
import SettingsReducer from '@stores/shared/settings/settings'

export default combineReducers({
	settings: SettingsReducer,
})