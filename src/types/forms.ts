/**
 * forms.ts
 *
 * Form-related types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 5
 */

// ============================================================================
// FORMS TYPES (5 declarations)
// ============================================================================

export interface TFormDataType {
	userId: string;
	strapiBodyPointId: number;
	strapiAggravatingFactorsIds: [];
	strapiRelievingFactorsIds: [];
	strapiPainCausesIds: [];
	strapiPainDurationId: number;
	strapiPainFrequencyId: number;
	strapiPainStatusId: number;
}

export interface SelectedPhysiotherapists {
	patientId: string;
	physiotherapistId: string;
	physiotherapist: Physiotherapist;
}

export interface SurevyPopupFormProps {
	survey?: Survey | null;
	isEdit?: boolean;
	surveyTitle: string;
	setSurveyTitle: (val: string) => void;
	surveyInstructions: string;
	setSurveyInstructions: (val: string) => void;
	surveyResultFeedback: string;
	setSurveyResultFeedback: (val: string) => void;
	surveyDescription: string;
	setSurveyDescription: (val: string) => void;
	questionValue: string;
	setQuestionValue: (val: string) => void;
	setQuestionType: (val: string | undefined) => void;
	questionType: string | undefined;
	setQuestionList: (item: QuestionListPayload[]) => void;
	questionList: QuestionListPayload[];
	imgFile: File[] | undefined;
	setImgFile: (img: File[] | undefined) => void;
}

export interface UploadedFile {
	uid: string;
	lastModified: number;
	lastModifiedDate: Date;
	name: string;
	size: number;
	type: string;
	webkitRelativePath: string;
}

export type FormDataType = {
	goalSelection: string | null;
	experienceLevel: string | null;
	timeAvailability: string | null;
	workoutPreference: string | null;
};
