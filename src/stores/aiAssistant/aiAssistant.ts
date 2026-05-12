import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	perpage: 0,
	activeTab: '',
	stateId: '',
	surveyModal: false,
	surveyStateId: '',
	programStateId: '',
	isReportModal: false,
	programModal: false,
	isStartSession: false,
	programModalSubKey : '1',
	isCollapsible: false
};

const aiAssistant = createSlice({
	name: 'aiAssistant',
	initialState,
	reducers: {
		setPerPage: (state, action) => {
			state.perpage = action.payload;
		},
		setCollapsible: (state, action) => {
			state.isCollapsible = action.payload;
		},
		setActiveTab: (state, action) => {
			state.activeTab = action.payload;
		},
		setStateId: (state, action) => {
			state.stateId = action.payload;
		},
		setSurveyModal: (state, action) => {
			state.surveyModal = action.payload;
		},
		setProgramModal: (state, action) => {
			state.programModal = action.payload;
		},
		setSurveyStateId: (state, action) => {
			state.surveyStateId = action.payload;
		},
		setProgramStateId: (state, action) => {
			state.programStateId = action.payload;
		},
		setIsReportModal: (state, action) => {
			state.isReportModal = action.payload;
		},
		setStartSession: (state, action) => {
			state.isStartSession = action.payload;
		},
		setProgramModalSubKey : (state , action) => {
			state.programModalSubKey = action.payload
		}
	},
});

export const {
	setPerPage,
	setActiveTab,
	setStateId,
	setProgramStateId,
	setSurveyStateId,
	setSurveyModal,
	setProgramModal,
	setIsReportModal,
	setStartSession,
	setProgramModalSubKey,
	setCollapsible
} = aiAssistant.actions;

export default aiAssistant.reducer;
