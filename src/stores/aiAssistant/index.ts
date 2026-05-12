import { combineReducers } from '@reduxjs/toolkit'
import ProgramReducer from '@stores/aiAssistant/program'
import AiAssistantReducer from '@stores/aiAssistant/aiAssistant'
import UserReducer from '@stores/user'

export default combineReducers({
	program: ProgramReducer,
	aiAssistant: AiAssistantReducer,
	userSlice : UserReducer
})