import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
	CustomRom,
	CustomRomExercise,
	CustomRomSession,
	CustomRomState,
	CustonRomPaginated,
} from '@types';
import axios from 'axios';
import html2canvas from 'html2canvas';

export const getPrintScreen = async (): Promise<string> => {
	const element = document.getElementById('printscreen');
	if (!element) {
		console.warn('getPrintScreen: Printscreen element not found - element may not be mounted yet');
		return '';
	}
	const canvas = await html2canvas(element);
	return canvas.toDataURL();
};

export const getRomTemplates = createAsyncThunk(
	'getRomTemplates',
	async ({
		page,
		search,
	}: {
		page: number;
		search: string;
	}): Promise<CustonRomPaginated> => {
		const { data } = await axios.get(
			`/rom/program-templates?limit=10&page=${page}${search === '' ? '' : `&search=${search}`}`,
		);
		return data;
	},
);

export const patchRomBodyPoints = createAsyncThunk(
	'patchRomBodyPoints',
	async ({
		bodyPointId,
		payload,
	}: {
		bodyPointId: string;
		payload: unknown;
	}): Promise<CustomRomExercise> => {
		const { data } = await axios.patch(
			`/rom/sessions/patient-results/${bodyPointId}`,
			payload,
		);
		return data;
	},
);

export const getCustomRomList = createAsyncThunk(
	'getCustomRomList',
	async ({
		userId,
		page,
		limit,
		search = '',
	}: {
		userId: string;
		page: number;
		limit: number;
		search?: string;
	}): Promise<CustonRomPaginated> => {
		const { data } = await axios.get(
			`/rom/programs/patients/${userId}?limit=${limit}&page=${page}${search === '' ? '' : `&search=${search}`}`,
		);
		return data;
	},
);

export const getCustomRomSession = createAsyncThunk(
	'getCustomRomSession',
	async ({
		userId,
		page,
	}: {
		userId: string;
		page: number;
		search?: string;
	}): Promise<CustonRomPaginated> => {
		const { data } = await axios.get(
			`/rom/sessions/${userId}?limit=10&page=${page}`,
		);
		return data;
	},
);

export const sendRomResultInMail = createAsyncThunk(
	'sendRomResultInMail',
	async ({
		sessionId,
		formData,
	}: {
		sessionId: string;
		formData: FormData;
	}): Promise<string> => {
		const { data } = await axios.post(
			`/rom/sessions/${sessionId}/pdf`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			},
		);
		return data;
	},
);

export const getCustomRomSessionById = createAsyncThunk(
	'getCustomRomSessionById',
	async ({
		customRomId,
		page,
		completed,
	}: {
		customRomId: string;
		page: number;
		completed: boolean;
	}): Promise<CustomRomSession> => {
		const { data } = await axios.get(
			`/rom/sessions/programs/${customRomId}?limit=10&page=${page}&completed=${completed}`,
		);
		return data;
	},
);

export const getAllRomSessions = createAsyncThunk(
	'getAllRomSessions',
	async ({
		patientId,
		page = 1,
		limit = 10,
		title,
		completed,
		sort,
	}: {
		patientId: string;
		page?: number;
		limit?: number;
		title?: string;
		completed?: boolean;
		sort?: 'asc' | 'desc';
	}) => {
		let url = `/rom/sessions/${patientId}/all?page=${page}&limit=${limit}`;
		if (title) {
			url += `&title=${encodeURIComponent(title)}`;
		}
		if (completed !== undefined) {
			url += `&completed=${completed}`;
		}
		if (sort) {
			url += `&sort=${sort}`;
		}
		const { data } = await axios.get(url);
		return data;
	},
);

export const getRomSessionByIdforActivity = createAsyncThunk(
	'getRomSessionByIdforActivity',
	async ({
		customRomId,
	}: {
		customRomId: string;
	}): Promise<CustomRomSession> => {
		const { data } = await axios.get(`/rom/session/${customRomId}`);
		return data;
	},
);

export const getRomSessionById = createAsyncThunk(
	'getRomSessionById',
	async ({
		customRomId,
	}: {
		customRomId: string;
	}): Promise<CustomRomSession> => {
		const { data } = await axios.get(`/rom/session/${customRomId}`);
		return data;
	},
);

export const updateCustomRom = createAsyncThunk(
	'updateCustomRom',
	async (payload: unknown): Promise<CustomRom> => {
		const { programId, programData } = payload;
		const { data } = await axios.patch(
			`/rom/programs/${programId}`,
			programData,
		);
		return data;
	},
);

export const postRomTemplates = createAsyncThunk(
	'postRomTemplates',
	async (payload: unknown): Promise<CustonRomPaginated> => {
		const { data } = await axios.post(`/rom/program-templates`, payload);
		return data;
	},
);

export const createCustomRomSession = createAsyncThunk(
	'createCustomRomSession',
	async (payload: unknown): Promise<CustomRomSession> => {
		const { data } = await axios.post(`/custom-rom/session`, payload);
		return data;
	},
);

export const saveExercise = createAsyncThunk(
	'saveExercise',
	async (payload: unknown): Promise<CustomRomExercise> => {
		const { data } = await axios.post(`/custom-rom/session/exercises`, payload);
		return data;
	},
);

export const updateSessionExercise = createAsyncThunk(
	'updateSessionExercise',
	async (payload: {
		exerciseId: string;
		exerciseData: unknown;
	}): Promise<CustomRomExercise> => {
		const { exerciseId, exerciseData } = payload;
		const { data } = await axios.patch(
			`/custom-rom/session/exercises/${exerciseId}`,
			exerciseData,
		);
		return data;
	},
);

export const closeSession = createAsyncThunk(
	'closeSession',
	async (sessionId: string): Promise<CustomRomSession> => {
		const { data } = await axios.patch(`/custom-rom/session/${sessionId}`);
		return data;
	},
);

export enum ETransitions {
	INTRO = 'intro',
	CALIBRATION = 'calibration',
	READYSETGO = 'readySetGo',
	RESULT = 'result',
	OPENNING = 'openning',
}

export type TTransitions = {
	next: TTransitions | null;
	value: ETransitions;
};

export const linkedListTransitions = () => {
	const transitions = Object.values(ETransitions).reduceRight(
		(next: TTransitions | null, value) => ({ value, next }),
		null,
	);

	if (transitions && transitions.value !== ETransitions.INTRO) {
		return { value: ETransitions.INTRO, next: transitions };
	}

	return transitions;
};

export const getRomMobilityReports = createAsyncThunk(
	'getUserReports',
	async (payload: { sessionId: string }): Promise<unknown> => {
		const { sessionId } = payload;
		const { data } = await axios.get(
			`/rom/mobility-report/sessions/${sessionId}`,
		);
		return data;
	},
);

const initialState: CustomRomState = {
	customRom: {
		data: [],
		pagination: null,
	},
	customRomSessionData: {
		data: [],
		pagination: null,
	},
	customRomSession: null,
	data: [],
	pdfLink: '',
	pagination: null,
	sendingMail: false,
	romUploadDetails: null,
	selectedRom: null,
};

const customRom = createSlice({
	name: 'romTemplates',
	initialState,
	reducers: {
		setRomUploadDetails: (state, action) => {
			state.romUploadDetails = action.payload;
		},
		setSelectedRom: (state, action) => {
			state.selectedRom = action.payload;
		},
	},
	extraReducers: builder => {
		builder.addCase(getRomTemplates.fulfilled, (state, action) => {
			state.data = action?.payload?.data;
			state.pagination = action?.payload?.pagination;
		});

		builder.addCase(postRomTemplates.fulfilled, (state, action) => {
			state.data = action?.payload?.data;
			state.pagination = action?.payload?.pagination;
		});

		builder.addCase(getCustomRomList.fulfilled, (state, action) => {
			state.customRom.data = action.payload.data;
			state.customRom.pagination = action.payload.pagination;
		});

		builder.addCase(getCustomRomSession.fulfilled, (state, action) => {
			state.customRomSessionData.data = action.payload.data;
			state.customRomSessionData.pagination = action.payload.pagination;
		});

		builder.addCase(createCustomRomSession.fulfilled, (state, action) => {
			state.customRomSession = action.payload;
		});

		builder.addCase(getRomSessionById.fulfilled, (state, action) => {
			state.selectedRom = action.payload;
		});

		builder.addCase(sendRomResultInMail.fulfilled, (state, action) => {
			state.pdfLink = action.payload;
			state.sendingMail = false;
		});
		builder.addCase(getRomMobilityReports.fulfilled, (state, action) => {
			state.pdfLink = action.payload;
			state.sendingMail = false;
		});
		builder.addCase(getAllRomSessions.fulfilled, (state, action) => {
			state.customRomSessionData.data = action.payload.data;
			state.customRomSessionData.pagination = action.payload.pagination;
		});

		builder.addCase(sendRomResultInMail.pending, state => {
			state.sendingMail = true;
		});
		builder.addCase(sendRomResultInMail.rejected, state => {
			state.sendingMail = false;
		});
	},
});

export const { setRomUploadDetails, setSelectedRom } = customRom.actions;

export default customRom.reducer;
