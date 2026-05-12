import { combineReducers } from '@reduxjs/toolkit';
import poseEstimationReducer from './poseEstimation';

export default combineReducers({
	poseEstimation: poseEstimationReducer,
});
