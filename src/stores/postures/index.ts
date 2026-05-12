import { combineReducers } from '@reduxjs/toolkit'
import PostureReducer from '@stores/postures/postures'

export default combineReducers({
	postures: PostureReducer,
})
