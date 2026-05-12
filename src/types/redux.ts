/**
 * redux.ts
 *
 * Redux store and state types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 2
 */

// ============================================================================
// REDUX TYPES (2 declarations)
// ============================================================================

export interface StatusStoreState {
	vitalscan-rom: IOminiRom;
	rehab: IRehab;
	evaluation: IEvaluationData;
	survey: ISurveyData;
	postures: IPostureDataStatus;
}

export interface SettingsInitialState {
	clientId: string;
	savedUserPlans: TUserPlan;
	openaiApiKey: string;
	inviteCode: string;
	emailTemplate: string;
	inviteTemplate: string;
	consentFormTemplate: string;
	romTemplate: string;
	plans: Plans[];
	functionalGoals: IFunctionalGoals[];
	preExistingConditions: PreExistingConditions;
	selfRegistration: SelfRegistration;
	getTheme: {
		id: string;
		name: string;
		clientId: string;
		createdAt: string;
		updatedAt: string;
		locked: false;
	};
	getSavedTags: TagsDetails[];
	bandwidth: boolean | null;
}
