import { combineReducers } from '@reduxjs/toolkit'
import ProgramReducer from '@stores/shared/patientDetail/program'
import PatientDetailReducer from '@stores/shared/patientDetail/patientDetail'
import UserReducer from '@stores/shared/user'

export default combineReducers({
	program: ProgramReducer,
	patientDetail: PatientDetailReducer,
	userSlice : UserReducer
})