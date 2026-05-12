import { combineReducers } from "@reduxjs/toolkit";
import SurveyReducer from '@stores/content/survey/survey';

export default combineReducers({
	survey: SurveyReducer,
})