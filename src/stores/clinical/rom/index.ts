import { combineReducers } from '@reduxjs/toolkit';
import mainReducer from '@stores/clinical/rom/main';
import resultsReducer from '@stores/clinical/rom/results';
import customRomReducer from '@stores/clinical/rom/customRom';
import romTemplateReducer from '@stores/clinical/rom/romTemplates';

export default combineReducers({
	main: mainReducer,
	results: resultsReducer,
	customRom: customRomReducer,
	romTemplates: romTemplateReducer,
});
