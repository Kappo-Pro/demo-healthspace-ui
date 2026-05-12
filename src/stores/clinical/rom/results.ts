import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import {
	CustomRomSession,
	RomeRequestParam,
	StrapiOmniRomExercises,
} from '@types';
import axios from 'axios';
import { ReduxState } from '..';

import { updateOmniRomSessionStatus as updateOmniRomSessionStatusEscalationRequired } from '@stores/patients/triage/escalationRequired';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusFollowUpRequired } from '@stores/patients/triage/followUpRequired';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusOutOfParams } from '@stores/patients/triage/outOfParams';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusPendingReview } from '@stores/patients/triage/pendingReview';
import { updateOmniRomSessionStatus as updateOmniRomSessionStatusReviewed } from '@stores/patients/triage/reviewed';
import strapi from '@strapi';
import { stringify } from 'qs';

export const fetchExercises = createAsyncThunk(
	'rom/results/fetchExercises',
	async (): Promise<StrapiOmniRomExercises[]> => {
		const query = stringify({
			fields: ['name', 'function'],
			order: ['order:desc'],
			populate: {
				reference: true,
				video: {
					fields: 'url',
				},
				image: {
					fields: 'url',
				},
				pointsToCalculateAngle: {
					populate: {
						a: true,
						b: true,
						c: true,
					},
				},
				pointsToValidatePosition: {
					populate: {
						a: true,
						b: true,
						c: true,
					},
				},
			},
		});

		const { data } = await strapi.get(`/omni-rom-exercises?${query}`);
		return data?.data;
	},
);

export const getOmniRomGroups = createAsyncThunk(
	'rom/results/getOmniRomGroups',
	async () => {
		const query = stringify({
			populate: {
				frontend: '*',
			},
		});
		const { data } = await strapi.get(`/omni-rom-exercise-groups?${query}}`);
		return data?.data;
	},
);

export const getExercisesResults = createAsyncThunk(
	'rom/results/getExercisesResults',
	async (_, thunkAPI) => {
		const { getState } = thunkAPI;
		const state = getState() as ReduxState;

		const patientId = state.user.isPhysioterapist
			? state.contacts.main.selectedUser?.id
			: state.user.id;

		const { data } = await axios.get(`/rom/sessions/${patientId}`);
		return data;
	},
);

export const getRomSessionList = createAsyncThunk(
	'rom/results/getRomSessionList',
	async (payload: RomeRequestParam) => {
		const { patientId, page, limit } = { ...payload };
		const { data } = await axios.get(
			`v1/rom/programs/patients/${patientId}?limit=${limit}&page=${page}&sessions=true`,
		);
		return data;
	},
);

export const getAllRomSessions = createAsyncThunk(
	'rom/results/getAllRomSessions',
	async (payload: { patientId: string; page: number; limit: number }) => {
		const { patientId, page, limit } = payload;
		const { data } = await axios.get(
			`/rom/sessions/${patientId}/all?limit=${limit}&page=${page}`,
		);
		return data;
	},
);

export const getRomMobiltyScore = createAsyncThunk(
	'rom/results/getRomMobiltyScore',
	async (patientId: string) => {
		const { data } = await axios.get(`/rom/mobility-score/${patientId}`);
		return data;
	},
);

export const postReqRehab = async (userId: string) => {
	const { data } = await axios.post(`/program/enrollments/${userId}`);
	return data;
};

const initialState: unknown = {
	groups: null,
	resultsExercises: null,
	resetExercisesLoading: false,
	romSessionListData: null,
	strapiOmniRomExercises: null,
	strapiOmniRomExerciseGroupId: null,
	showAllResults: true,
	exerciseLoad: true,
	mobilityScore: null,
};

export const results = createSlice({
	name: 'results',
	initialState,
	reducers: {
		setShowAllResults(state, action) {
			state.showAllResults = action.payload;
		},
	},
	extraReducers: builder => {
		builder.addCase(fetchExercises.fulfilled, (state, action) => {
			const exercises = action.payload;
			const exercisesRight = exercises.filter(exercise =>
				exercise.name?.toLowerCase().includes('right'),
			);
			const exercisesLeft = exercises.filter(exercise =>
				exercise.name?.toLowerCase().includes('left'),
			);

			state.strapiOmniRomExercises = {
				'Right Shoulder': {
					exercises: exercisesRight.filter(exercise =>
						exercise.name?.toLowerCase().includes('shoulder'),
					),
					styles: {
						bottom: null,
						left: '45px',
						right: null,
						top: '70px',
					},
				},
				'Right Elbow': {
					exercises: exercisesRight.filter(exercise =>
						exercise.name?.toLowerCase().includes('elbow'),
					),
					styles: {
						bottom: null,
						left: '33px',
						right: null,
						top: '120px',
					},
				},
				'Right Hip': {
					exercises: exercisesRight.filter(exercise =>
						exercise.name?.toLowerCase().includes('hip'),
					),
					styles: {
						bottom: null,
						left: '60px',
						right: null,
						top: '180px',
					},
				},
				'Right Knee': {
					exercises: exercisesRight.filter(exercise =>
						exercise.name?.toLowerCase().includes('knee'),
					),
					styles: {
						bottom: null,
						left: '67px',
						right: null,
						top: '250px',
					},
				},
				'Left Shoulder': {
					exercises: exercisesLeft.filter(exercise =>
						exercise.name?.toLowerCase().includes('shoulder'),
					),
					styles: {
						bottom: null,
						left: '115px',
						right: null,
						top: '70px',
					},
				},
				'Left Elbow': {
					exercises: exercisesLeft.filter(exercise =>
						exercise.name?.toLowerCase().includes('elbow'),
					),
					styles: {
						bottom: null,
						left: '126px',
						right: null,
						top: '120px',
					},
				},
				'Left Hip': {
					exercises: exercisesLeft.filter(exercise =>
						exercise.name?.toLowerCase().includes('hip'),
					),
					styles: {
						bottom: null,
						left: '100px',
						right: null,
						top: '180px',
					},
				},
				'Left Knee': {
					exercises: exercisesLeft.filter(exercise =>
						exercise.name?.toLowerCase().includes('knee'),
					),
					styles: {
						bottom: null,
						left: '93px',
						right: null,
						top: '250px',
					},
				},
				Squat: {
					exercises: exercises.filter(exercise =>
						exercise.name?.toLowerCase().includes('squat'),
					),
					styles: {
						bottom: null,
						left: '100px',
						right: null,
						top: '180px',
					},
				},
			};
		});
		builder
			.addCase(getOmniRomGroups.fulfilled, (state, action) => {
				state.groups = action.payload;
			})
			.addCase(getOmniRomGroups.rejected, state => {
				state.groups = null;
			});

		builder
			.addCase(getExercisesResults.fulfilled, (state, action) => {
				if (action.payload && action.payload?.romPatientResults?.length > 0) {
					state.resultsExercises = action.payload.romPatientResults;
					state.strapiOmniRomExerciseGroupId =
						action.payload.strapiOmniRomExerciseGroupId;
				}
			})
			.addCase(getExercisesResults.rejected, state => {
				state.resultsExercises = null;
			});

		builder
			.addCase(getRomSessionList.fulfilled, (state, action) => {
				if (action.payload) {
					state.romSessionListData = action.payload;
				}
				state.exerciseLoad = false;
			})
			.addCase(getRomSessionList.pending, state => {
				state.exerciseLoad = true;
			})
			.addCase(getRomSessionList.rejected, state => {
				state.romSessionListData = null;
				state.exerciseLoad = false;
			});

		builder.addCase(getRomMobiltyScore.fulfilled, (state, action) => {
			state.mobilityScore = action.payload.data[0];
		});

		builder
			.addCase(getAllRomSessions.fulfilled, (state, action) => {
				if (action.payload) {
					state.romSessionListData = action.payload;
				}
				state.exerciseLoad = false;
			})
			.addCase(getAllRomSessions.pending, state => {
				state.exerciseLoad = true;
			})
			.addCase(getAllRomSessions.rejected, state => {
				state.romSessionListData = null;
				state.exerciseLoad = false;
			});

		builder.addMatcher(
			isAnyOf(
				updateOmniRomSessionStatusOutOfParams.fulfilled,
				updateOmniRomSessionStatusReviewed.fulfilled,
				updateOmniRomSessionStatusFollowUpRequired.fulfilled,
				updateOmniRomSessionStatusEscalationRequired.fulfilled,
				updateOmniRomSessionStatusPendingReview.fulfilled,
			),
			(state, action) => {
				if (state.romSessionListData?.data?.length > 0) {
					state.romSessionListData.data = state.romSessionListData.data.map(
						(session: CustomRomSession) => {
							if (session.id === action.payload.id) {
								return {
									...session,
									status: action.payload.status,
								};
							}
							return session;
						},
					);
				}
			},
		);
	},
});

export const { setShowAllResults } = results.actions;

export default results.reducer;
