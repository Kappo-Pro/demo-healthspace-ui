import { combineReducers } from '@reduxjs/toolkit';
import PostureReducer from '@stores/posture/postures/postures';

// Export selectors
export {
	selectPosturesState,
	selectLatestPosture,
	selectPostureScore,
} from './selectors';

export default combineReducers({
	postures: PostureReducer,
});
