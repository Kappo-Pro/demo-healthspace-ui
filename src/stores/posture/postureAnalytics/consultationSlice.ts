/**
 * Consultation Mode Redux Slice
 *
 * Manages state for real-time clinician-patient consultation sessions.
 * Supports annotations, communication channels, goal setting, and session recording.
 *
 * @module stores/posture/postureAnalytics/consultationSlice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ReduxState } from '@stores/index';
import type {
	ConsultationSession,
	ConsultationStatus,
	ConsultationParticipant,
	AnnotationStroke,
	ChatMessage,
	CollaborativeGoal,
	SessionRecording,
	ConsultationPreferences,
	AnnotationTool,
} from '@types/consultation';

/**
 * Consultation slice state
 */
export interface ConsultationState {
	/** Active consultation session */
	activeSession: ConsultationSession | null;

	/** Connection status */
	connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

	/** WebSocket error message */
	connectionError: string | null;

	/** User's preferences */
	preferences: ConsultationPreferences;

	/** Current annotation tool */
	currentTool: AnnotationTool;

	/** Current annotation color */
	currentColor: string;

	/** Current stroke width */
	currentStrokeWidth: number;

	/** Recording state */
	recording: {
		isRecording: boolean;
		recordingId: string | null;
		startTime: string | null;
	};

	/** Loading states */
	loading: {
		startSession: boolean;
		endSession: boolean;
		saveAnnotations: boolean;
		generateSummary: boolean;
	};

	/** Error states */
	error: {
		startSession: string | null;
		endSession: string | null;
		saveAnnotations: string | null;
		generateSummary: string | null;
	};
}

/**
 * Initial state
 */
const initialState: ConsultationState = {
	activeSession: null,
	connectionStatus: 'disconnected',
	connectionError: null,
	preferences: {
		defaultTool: 'pen',
		defaultColor: 'var(--color-error)',
		defaultStrokeWidth: 3,
		autoSave: true,
		autoSaveInterval: 30,
		autoRecord: false,
		emailSummary: true,
		externalDisplayMirror: true,
	},
	currentTool: 'pen',
	currentColor: 'var(--color-error)',
	currentStrokeWidth: 3,
	recording: {
		isRecording: false,
		recordingId: null,
		startTime: null,
	},
	loading: {
		startSession: false,
		endSession: false,
		saveAnnotations: false,
		generateSummary: false,
	},
	error: {
		startSession: null,
		endSession: null,
		saveAnnotations: null,
		generateSummary: null,
	},
};

/**
 * Start consultation session payload
 */
export interface StartConsultationPayload {
	postureSessionId: string;
	comparisonSessionId?: string;
	clinicianId: string;
	patientId: string;
}

/**
 * Add annotation payload
 */
export interface AddAnnotationPayload {
	imageId: string;
	stroke: AnnotationStroke;
}

/**
 * Update goal payload
 */
export interface UpdateGoalPayload {
	goalId: string;
	updates: Partial<CollaborativeGoal>;
}

/**
 * Thunk: Start consultation session
 */
export const startConsultationSession = createAsyncThunk<
	ConsultationSession,
	StartConsultationPayload,
	{ rejectValue: string }
>('consultation/startSession', async (payload, { rejectWithValue }) => {
	try {
		// TODO: Replace with actual API call
		// const response = await consultationApi.startSession(payload);

		// Mock implementation for development
		const session: ConsultationSession = {
			id: `consultation-${Date.now()}`,
			status: 'connecting',
			participants: [
				{
					id: `participant-${payload.clinicianId}`,
					userId: payload.clinicianId,
					name: 'Dr. Smith', // TODO: Fetch from user profile
					role: 'clinician',
					connected: true,
					joinedAt: new Date().toISOString(),
					channels: {
						voice: false,
						video: false,
						screenShare: false,
						chat: true,
						quality: 100,
					},
				},
				{
					id: `participant-${payload.patientId}`,
					userId: payload.patientId,
					name: 'John Doe', // TODO: Fetch from patient profile
					role: 'patient',
					connected: false,
					joinedAt: new Date().toISOString(),
					channels: {
						voice: false,
						video: false,
						screenShare: false,
						chat: true,
						quality: 0,
					},
				},
			],
			postureSessionId: payload.postureSessionId,
			comparisonSessionId: payload.comparisonSessionId,
			annotations: [],
			chatMessages: [
				{
					id: `msg-${Date.now()}`,
					participantId: 'system',
					role: 'clinician',
					content: 'Consultation session started',
					timestamp: new Date().toISOString(),
					type: 'system',
				},
			],
			goals: [],
			startTime: new Date().toISOString(),
			endTime: null,
			displaySettings: {
				mirrorMode: false,
				dualView: true,
				externalDisplay: false,
			},
		};

		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 500));

		return session;
	} catch (error: unknown) {
		return rejectWithValue(
			error instanceof Error ? error.message : 'Failed to start consultation session',
		);
	}
});

/**
 * Thunk: End consultation session
 */
export const endConsultationSession = createAsyncThunk<
	void,
	string,
	{ state: ReduxState; rejectValue: string }
>('consultation/endSession', async (sessionId, { getState, rejectWithValue }) => {
	try {
		const state = getState();
		const session = state.consultation.activeSession;

		if (!session) {
			throw new Error('No active session to end');
		}

		// TODO: Replace with actual API call
		// await consultationApi.endSession(sessionId);

		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 300));
	} catch (error: unknown) {
		return rejectWithValue(
			error instanceof Error ? error.message : 'Failed to end consultation session',
		);
	}
});

/**
 * Thunk: Save annotations to backend
 */
export const saveAnnotations = createAsyncThunk<
	void,
	string,
	{ state: ReduxState; rejectValue: string }
>('consultation/saveAnnotations', async (sessionId, { getState, rejectWithValue }) => {
	try {
		const state = getState();
		const session = state.consultation.activeSession;

		if (!session) {
			throw new Error('No active session');
		}

		// TODO: Replace with actual API call
		// await consultationApi.saveAnnotations(sessionId, session.annotations);

		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 200));
	} catch (error: unknown) {
		return rejectWithValue(
			error instanceof Error ? error.message : 'Failed to save annotations',
		);
	}
});

/**
 * Thunk: Generate AI-assisted session summary
 */
export const generateSessionSummary = createAsyncThunk<
	ConsultationSession['summary'],
	string,
	{ state: ReduxState; rejectValue: string }
>('consultation/generateSummary', async (sessionId, { getState, rejectWithValue }) => {
	try {
		const state = getState();
		const session = state.consultation.activeSession;

		if (!session) {
			throw new Error('No active session');
		}

		// TODO: Replace with actual API call to AI service
		// const summary = await aiApi.generateConsultationSummary(session);

		// Mock summary for development
		const summary: ConsultationSession['summary'] = {
			sections: [
				{
					title: 'Session Overview',
					content:
						'Discussed posture improvements and identified areas requiring continued attention.',
					aiGenerated: true,
				},
				{
					title: 'Key Findings',
					content:
						'- Shoulder symmetry improved by 15%\n- Spine alignment shows positive trend\n- Head forward posture remains a concern',
					aiGenerated: true,
				},
			],
			decisions: [
				'Continue current exercise program',
				'Add neck strengthening exercises',
				'Schedule follow-up in 2 weeks',
			],
			actionItems: [
				'Patient to perform exercises 3x daily',
				'Upload progress photos weekly',
				'Book next appointment',
			],
		};

		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 1000));

		return summary;
	} catch (error: unknown) {
		return rejectWithValue(
			error instanceof Error ? error.message : 'Failed to generate session summary',
		);
	}
});

/**
 * Consultation slice
 */
const consultationSlice = createSlice({
	name: 'consultation',
	initialState,
	reducers: {
		/**
		 * Update connection status
		 */
		setConnectionStatus: (
			state,
			action: PayloadAction<ConsultationState['connectionStatus']>,
		) => {
			state.connectionStatus = action.payload;
			if (action.payload === 'connected') {
				state.connectionError = null;
			}
		},

		/**
		 * Set connection error
		 */
		setConnectionError: (state, action: PayloadAction<string | null>) => {
			state.connectionError = action.payload;
			if (action.payload) {
				state.connectionStatus = 'error';
			}
		},

		/**
		 * Update session status
		 */
		updateSessionStatus: (state, action: PayloadAction<ConsultationStatus>) => {
			if (state.activeSession) {
				state.activeSession.status = action.payload;
			}
		},

		/**
		 * Add participant to session
		 */
		addParticipant: (state, action: PayloadAction<ConsultationParticipant>) => {
			if (state.activeSession) {
				const existingIndex = state.activeSession.participants.findIndex(
					p => p.id === action.payload.id,
				);
				if (existingIndex >= 0) {
					state.activeSession.participants[existingIndex] = action.payload;
				} else {
					state.activeSession.participants.push(action.payload);
				}
			}
		},

		/**
		 * Update participant connection status
		 */
		updateParticipantConnection: (
			state,
			action: PayloadAction<{ participantId: string; connected: boolean }>,
		) => {
			if (state.activeSession) {
				const participant = state.activeSession.participants.find(
					p => p.id === action.payload.participantId,
				);
				if (participant) {
					participant.connected = action.payload.connected;
				}
			}
		},

		/**
		 * Add annotation stroke
		 */
		addAnnotationStroke: (state, action: PayloadAction<AddAnnotationPayload>) => {
			if (!state.activeSession) return;

			const { imageId, stroke } = action.payload;
			let layer = state.activeSession.annotations.find(a => a.imageId === imageId);

			if (!layer) {
				layer = {
					id: `layer-${imageId}-${Date.now()}`,
					sessionId: state.activeSession.id,
					imageId,
					strokes: [],
					createdAt: new Date().toISOString(),
					modifiedAt: new Date().toISOString(),
				};
				state.activeSession.annotations.push(layer);
			}

			layer.strokes.push(stroke);
			layer.modifiedAt = new Date().toISOString();
		},

		/**
		 * Clear annotations for an image
		 */
		clearAnnotations: (state, action: PayloadAction<string>) => {
			if (!state.activeSession) return;

			const layer = state.activeSession.annotations.find(
				a => a.imageId === action.payload,
			);
			if (layer) {
				layer.strokes = [];
				layer.modifiedAt = new Date().toISOString();
			}
		},

		/**
		 * Add chat message
		 */
		addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
			if (state.activeSession) {
				state.activeSession.chatMessages.push(action.payload);
			}
		},

		/**
		 * Add collaborative goal
		 */
		addCollaborativeGoal: (state, action: PayloadAction<CollaborativeGoal>) => {
			if (state.activeSession) {
				state.activeSession.goals.push(action.payload);
			}
		},

		/**
		 * Update collaborative goal
		 */
		updateCollaborativeGoal: (state, action: PayloadAction<UpdateGoalPayload>) => {
			if (!state.activeSession) return;

			const goal = state.activeSession.goals.find(g => g.id === action.payload.goalId);
			if (goal) {
				Object.assign(goal, action.payload.updates);
			}
		},

		/**
		 * Set current annotation tool
		 */
		setCurrentTool: (state, action: PayloadAction<AnnotationTool>) => {
			state.currentTool = action.payload;
		},

		/**
		 * Set current annotation color
		 */
		setCurrentColor: (state, action: PayloadAction<string>) => {
			state.currentColor = action.payload;
		},

		/**
		 * Set current stroke width
		 */
		setCurrentStrokeWidth: (state, action: PayloadAction<number>) => {
			state.currentStrokeWidth = action.payload;
		},

		/**
		 * Toggle display settings
		 */
		toggleDisplaySetting: (
			state,
			action: PayloadAction<keyof ConsultationSession['displaySettings']>,
		) => {
			if (state.activeSession) {
				const key = action.payload;
				state.activeSession.displaySettings[key] =
					!state.activeSession.displaySettings[key];
			}
		},

		/**
		 * Start recording
		 */
		startRecording: (state, action: PayloadAction<{ recordingId: string }>) => {
			state.recording = {
				isRecording: true,
				recordingId: action.payload.recordingId,
				startTime: new Date().toISOString(),
			};
		},

		/**
		 * Stop recording
		 */
		stopRecording: (state, action: PayloadAction<SessionRecording>) => {
			state.recording = {
				isRecording: false,
				recordingId: null,
				startTime: null,
			};
			if (state.activeSession) {
				state.activeSession.recording = action.payload;
			}
		},

		/**
		 * Update preferences
		 */
		updatePreferences: (state, action: PayloadAction<Partial<ConsultationPreferences>>) => {
			state.preferences = { ...state.preferences, ...action.payload };
		},

		/**
		 * Reset consultation state
		 */
		resetConsultation: () => initialState,
	},

	extraReducers: builder => {
		// Start session
		builder.addCase(startConsultationSession.pending, state => {
			state.loading.startSession = true;
			state.error.startSession = null;
		});
		builder.addCase(startConsultationSession.fulfilled, (state, action) => {
			state.loading.startSession = false;
			state.activeSession = action.payload;
			state.connectionStatus = 'connected';
			// Initialize tools from preferences
			state.currentTool = state.preferences.defaultTool;
			state.currentColor = state.preferences.defaultColor;
			state.currentStrokeWidth = state.preferences.defaultStrokeWidth;
		});
		builder.addCase(startConsultationSession.rejected, (state, action) => {
			state.loading.startSession = false;
			state.error.startSession = action.payload ?? 'Unknown error';
		});

		// End session
		builder.addCase(endConsultationSession.pending, state => {
			state.loading.endSession = true;
			state.error.endSession = null;
		});
		builder.addCase(endConsultationSession.fulfilled, state => {
			state.loading.endSession = false;
			if (state.activeSession) {
				state.activeSession.status = 'ended';
				state.activeSession.endTime = new Date().toISOString();
			}
		});
		builder.addCase(endConsultationSession.rejected, (state, action) => {
			state.loading.endSession = false;
			state.error.endSession = action.payload ?? 'Unknown error';
		});

		// Save annotations
		builder.addCase(saveAnnotations.pending, state => {
			state.loading.saveAnnotations = true;
			state.error.saveAnnotations = null;
		});
		builder.addCase(saveAnnotations.fulfilled, state => {
			state.loading.saveAnnotations = false;
		});
		builder.addCase(saveAnnotations.rejected, (state, action) => {
			state.loading.saveAnnotations = false;
			state.error.saveAnnotations = action.payload ?? 'Unknown error';
		});

		// Generate summary
		builder.addCase(generateSessionSummary.pending, state => {
			state.loading.generateSummary = true;
			state.error.generateSummary = null;
		});
		builder.addCase(generateSessionSummary.fulfilled, (state, action) => {
			state.loading.generateSummary = false;
			if (state.activeSession) {
				state.activeSession.summary = action.payload;
			}
		});
		builder.addCase(generateSessionSummary.rejected, (state, action) => {
			state.loading.generateSummary = false;
			state.error.generateSummary = action.payload ?? 'Unknown error';
		});
	},
});

/**
 * Selectors
 */
export const selectConsultationState = (state: ReduxState) => state.consultation;
export const selectActiveSession = (state: ReduxState) => state.consultation.activeSession;
export const selectConnectionStatus = (state: ReduxState) =>
	state.consultation.connectionStatus;
export const selectCurrentTool = (state: ReduxState) => state.consultation.currentTool;
export const selectCurrentColor = (state: ReduxState) => state.consultation.currentColor;
export const selectCurrentStrokeWidth = (state: ReduxState) =>
	state.consultation.currentStrokeWidth;
export const selectIsRecording = (state: ReduxState) => state.consultation.recording.isRecording;
export const selectPreferences = (state: ReduxState) => state.consultation.preferences;

/**
 * Actions
 */
export const {
	setConnectionStatus,
	setConnectionError,
	updateSessionStatus,
	addParticipant,
	updateParticipantConnection,
	addAnnotationStroke,
	clearAnnotations,
	addChatMessage,
	addCollaborativeGoal,
	updateCollaborativeGoal,
	setCurrentTool,
	setCurrentColor,
	setCurrentStrokeWidth,
	toggleDisplaySetting,
	startRecording,
	stopRecording,
	updatePreferences,
	resetConsultation,
} = consultationSlice.actions;

/**
 * Reducer
 */
export default consultationSlice.reducer;
