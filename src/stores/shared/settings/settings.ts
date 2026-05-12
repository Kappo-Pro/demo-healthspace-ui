import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
	IFunctionalGoals,
	Plans,
	PreExistingConditions,
	SelfRegistration,
	SettingsInitialState,
	TagsDetails,
} from '@types';
import axios from 'axios';

export interface PostSettingApiKeyPayload {
	clientId: string;
	openaiApiKey: string;
}

export const getSettingApiKey = createAsyncThunk(
	'getSettingApiKey',
	async (): Promise<unknown> => {
		const { data } = await axios.get(`/settings`);
		return data;
	},
);

export const postSettingApiKey = createAsyncThunk(
	'postSettingApiKey',
	async (openaiApiKey: string): Promise<unknown> => {
		const response = await axios.post('/settings', openaiApiKey);
		return response.data;
	},
);

export const postTheme = createAsyncThunk(
	'postTheme',
	async (payload: { name: string; locked: boolean }): Promise<unknown> => {
		const response = await axios.post('/settings/themes', payload);
		return response.data;
	},
);

export const getTheme = createAsyncThunk(
	'getTheme',
	async (): Promise<unknown> => {
		const response = await axios.get('/settings/themes');
		return response.data;
	},
);

export const patchSettingApiKey = createAsyncThunk(
	'patchSettingApiKey',
	async ({
		settingsId,
		payload,
	}: {
		settingsId: string;
		payload: PostSettingApiKeyPayload;
	}): Promise<unknown> => {
		const response = await axios.patch(`/settings/${settingsId}`, payload);
		return response.data;
	},
);

export const getEmailTemplate = createAsyncThunk(
	'getEmailTemplate',
	async (): Promise<unknown> => {
		const { data } = await axios.get(`/settings/templates/email`);
		return data;
	},
);

export const getbandwidth = createAsyncThunk(
	'getbandwidth',
	async (): Promise<unknown> => {
		const { data } = await axios.get(`/settings/network`);
		return data;
	},
);

export const postBandwidth = createAsyncThunk(
	'postBandwidth',
	async (payload: unknown): Promise<unknown> => {
		const { data } = await axios.post(`/settings/network`, payload);
		return data;
	},
);

export const getSelfRegistration = createAsyncThunk(
	'getSelfRegistration',
	async (): Promise<SelfRegistration> => {
		const { data } = await axios.get(`/settings/self-registration/status`);
		return data;
	},
);

export const postSelfRegistration = createAsyncThunk(
	'postSelfRegistration',
	async (payload: { active: boolean }): Promise<unknown> => {
		const { data } = await axios.post(
			`/settings/self-registration/status`,
			payload,
		);
		return data;
	},
);

export const postEmailTemplate = createAsyncThunk(
	'postEmailTemplate',
	async (template: string): Promise<unknown> => {
		const response = await axios.post('/settings/templates/email', {
			templateBody: template,
		});
		return response.data;
	},
);

export const postRomEmailTemplate = createAsyncThunk(
	'postRomEmailTemplate',
	async (template: string): Promise<unknown> => {
		const response = await axios.post('/settings/templates/email/rom', {
			templateBody: template,
		});
		return response.data;
	},
);

export const getRomEmailTemplate = createAsyncThunk(
	'getRomEmailTemplate',
	async (): Promise<unknown> => {
		const { data } = await axios.get(`/settings/templates/email/rom`);
		return data;
	},
);

export const getInviteTemplate = createAsyncThunk(
	'getInviteTemplate',
	async (): Promise<unknown> => {
		const { data } = await axios.get(`/settings/templates/invite`);
		return data;
	},
);

export const postInviteTemplate = createAsyncThunk(
	'postInviteTemplate',
	async (template: string): Promise<unknown> => {
		const response = await axios.post('/settings/templates/invite', {
			templateBody: template,
		});
		return response.data;
	},
);

export const getConsentFormTemplate = createAsyncThunk(
	'getConsentFormTemplate',
	async (): Promise<unknown> => {
		const { data } = await axios.get(`/settings/consent-policy`);
		return data;
	},
);

export const postConsentFormTemplate = createAsyncThunk(
	'postConsentFormTemplate',
	async (template: string): Promise<unknown> => {
		const response = await axios.post('/settings/consent-policy', {
			content: template,
		});
		return response.data;
	},
);

export const getPlanByPlanType = createAsyncThunk(
	'getPlanByPlanType',
	async (planType: string): Promise<Plans> => {
		const { data } = await axios.get(
			`/settings/plans/templates?plan=${planType}`,
		);
		return data;
	},
);

export const getPlansByUserId = createAsyncThunk(
	'getPlansByUserId',
	async (userId: string): Promise<Plans> => {
		const { data } = await axios.get(`/plans/users/${userId}`);
		return data;
	},
);

export const postPlan = createAsyncThunk(
	'postPlan',
	async (formData: FormData): Promise<Plans> => {
		const response = await axios.post('/settings/plans/templates', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},
);

export const getFunctionalGoalById = createAsyncThunk(
	'getFunctionalGoalById',
	async (id: number): Promise<IFunctionalGoals> => {
		const { data } = await axios.get(
			`/settings/functional-goals?functionalGoalId=${id}`,
		);
		return data;
	},
);

export const postFunctionalGoal = createAsyncThunk(
	'postFunctionalGoal',
	async (formData: FormData): Promise<IFunctionalGoals> => {
		const response = await axios.post('/settings/functional-goals', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},
);

export const getPreExistingConditions = createAsyncThunk(
	'getPreExistingConditions',
	async (): Promise<PreExistingConditions> => {
		const { data } = await axios.get('/settings/pre-existing-conditions');
		return data;
	},
);

export const postPreExistingConditions = createAsyncThunk(
	'postPreExistingConditions',
	async (formData: FormData): Promise<PreExistingConditions> => {
		const response = await axios.post(
			'/settings/pre-existing-conditions',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			},
		);
		return response.data;
	},
);

export const postPlansByUserId = createAsyncThunk(
	'postPlansByUserId',
	async ({
		userId,
		planType,
	}: {
		userId: string;
		planType: string;
	}): Promise<unknown> => {
		const response = await axios.post(`/plans/users/${userId}`, { planType });
		return response.data;
	},
);

export const updatePlanByUserId = createAsyncThunk(
	'updatePlanByUserId',
	async ({
		userId,
		planType,
	}: {
		userId: string;
		planType: string;
	}): Promise<unknown> => {
		const response = await axios.patch(`/plans/users/${userId}`, { planType });
		return response.data;
	},
);

export const getPlansByClientId = createAsyncThunk(
	'getPlansByClientId',
	async (): Promise<Plans> => {
		const { data } = await axios.get(`settings/plans/client`);
		return data;
	},
);

export const postPlanByClientId = createAsyncThunk(
	'postPlanByClientId',
	async ({
		clientId,
		planType,
	}: {
		clientId: string;
		planType: string;
	}): Promise<unknown> => {
		const response = await axios.post(`settings/plans/client`, {
			clientId,
			planType,
		});
		return response.data;
	},
);

export const postTags = createAsyncThunk(
	'postTags',
	async (payload: { name: string }): Promise<unknown> => {
		const response = await axios.post('/settings/tags', payload);
		return response.data;
	},
);

export const getTags = createAsyncThunk(
	'getTags',
	async (): Promise<TagsDetails[]> => {
		const response = await axios.get('/settings/tags');
		return response.data;
	},
);

export const deleteTags = createAsyncThunk(
	'deleteTags',
	async (tagId: string): Promise<unknown> => {
		const response = await axios.delete(`/settings/tags/${tagId}`);
		return response.data;
	},
);

const initialState: SettingsInitialState = {
	clientId: '',
	openaiApiKey: '',
	inviteCode: '',
	emailTemplate: '',
	inviteTemplate: '',
	consentFormTemplate: '',
	plans: [],
	functionalGoals: [],
	preExistingConditions: {
		id: '',
		title: '',
		description: '',
		thumbnail: '',
	},
	romTemplate: '',
	templates: {
		rom: '',
		invite: '',
		email: '',
		consentForm: '',
	},
	selfRegistration: {
		id: '',
		active: false,
		clientId: '',
		createdAt: '',
		updatedAt: '',
	},
	getTheme: {
		id: '',
		name: '',
		clientId: '',
		createdAt: '',
		updatedAt: '',
		locked: false,
	},
	getSavedTags: [],
	bandwidth: false,
	savedUserPlans: {
		id: '',
		clientId: '',
		planType: '',
		userId: '',
	},
};

const settings = createSlice({
	name: 'settings',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder.addCase(getSettingApiKey.fulfilled, (state, action) => {
			state.openaiApiKey = action.payload;
			state.inviteCode = action.payload?.client?.inviteCode;
		});

		builder.addCase(postSettingApiKey.fulfilled, (state, action) => {
			state.openaiApiKey = action.payload;
		});

		builder.addCase(patchSettingApiKey.fulfilled, (state, action) => {
			state.openaiApiKey = action.payload;
		});

		builder.addCase(getTheme.fulfilled, (state, action) => {
			state.getTheme = action.payload;
		});

		builder.addCase(postTheme.fulfilled, (state, action) => {
			state.getTheme = action.payload;
		});

		builder.addCase(getEmailTemplate.fulfilled, (state, action) => {
			state.emailTemplate = action.payload?.templateBody ?? '';
		});

		builder.addCase(postEmailTemplate.fulfilled, (state, action) => {
			state.emailTemplate = action.payload?.templateBody || '';
		});

		builder.addCase(getbandwidth.fulfilled, (state, action) => {
			state.bandwidth = action.payload;
		});

		builder.addCase(postBandwidth.fulfilled, (state, action) => {
			state.bandwidth = action.payload;
		});

		builder.addCase(getSelfRegistration.fulfilled, (state, action) => {
			state.selfRegistration = action.payload;
		});

		builder.addCase(postSelfRegistration.fulfilled, (_state, _action) => {});

		builder.addCase(getInviteTemplate.fulfilled, (state, action) => {
			state.inviteTemplate = action.payload?.templateBody ?? '';
		});

		builder.addCase(postInviteTemplate.fulfilled, (state, action) => {
			state.inviteTemplate = action.payload?.templateBody || '';
		});

		builder.addCase(getConsentFormTemplate.fulfilled, (state, action) => {
			state.consentFormTemplate = action.payload?.content || '';
		});

		builder.addCase(postConsentFormTemplate.fulfilled, (state, action) => {
			state.consentFormTemplate = action.payload?.content || '';
		});

		builder.addCase(getPlanByPlanType.fulfilled, (state, action) => {
			const index = state.plans.findIndex(
				item => item.planType === action.payload?.planType,
			);
			index == -1
				? state.plans.push(action.payload)
				: (state.plans[index] = action.payload);
		});

		builder.addCase(postPlan.fulfilled, (state, action) => {
			const index = state.plans.findIndex(
				item => item.planType === action.payload?.planType,
			);
			index == -1
				? state.plans.push(action.payload)
				: (state.plans[index] = action.payload);
		});

		builder.addCase(getFunctionalGoalById.fulfilled, (state, action) => {
			const index = state.functionalGoals.findIndex(
				item => item.functionalGoalId === action.payload?.functionalGoalId,
			);
			index == -1
				? state.functionalGoals.push(action.payload)
				: (state.functionalGoals[index] = action.payload);
		});

		builder.addCase(postFunctionalGoal.fulfilled, (state, action) => {
			const index = state.functionalGoals.findIndex(
				item => item.functionalGoalId === action.payload?.functionalGoalId,
			);
			index == -1
				? state.functionalGoals.push(action.payload)
				: (state.functionalGoals[index] = action.payload);
		});

		builder.addCase(getPreExistingConditions.fulfilled, (state, action) => {
			state.preExistingConditions = action.payload;
		});

		builder.addCase(postPreExistingConditions.fulfilled, (state, action) => {
			state.preExistingConditions = action.payload;
		});

		builder.addCase(getPlansByUserId.fulfilled, (state, action) => {
			state.savedUserPlans = action.payload;
		});
		builder.addCase(getRomEmailTemplate.fulfilled, (state, action) => {
			state.romTemplate = action.payload?.templateBody ?? '';
			state.templates.rom = action.payload?.templateBody ?? '';
		});

		builder.addCase(postRomEmailTemplate.fulfilled, (state, action) => {
			state.romTemplate = action.payload?.templateBody;
			state.templates.rom = action.payload?.templateBody;
		});

		builder.addCase(getTags.fulfilled, (state, action) => {
			state.getSavedTags = action.payload;
		});

		builder.addCase(postTags.fulfilled, (_state, _action) => {});
		builder.addCase(deleteTags.fulfilled, (_state, _action) => {});
	},
});

export default settings.reducer;
