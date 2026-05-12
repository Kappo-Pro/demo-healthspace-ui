import { combineReducers } from '@reduxjs/toolkit'
import mainReducer from '@stores/clinical/performance/main'

export default combineReducers({
	main: mainReducer,
})
