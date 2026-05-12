import { combineReducers } from '@reduxjs/toolkit'
import mainReducer from '@stores/clinical/rehab/main'
import libraryReducer from '@stores/clinical/rehab/library'

export default combineReducers({
	main: mainReducer,
	library: libraryReducer,
})
