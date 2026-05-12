/**
 * survey.ts
 *
 * Survey and questionnaire types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 11
 */

// ============================================================================
// SURVEY TYPES (11 declarations)
// ============================================================================

export type ISurveyData = IRomRehab;

export interface SurveyQuestionOptions {
	id?: string | undefined;
	option: string;
	score: number;
	questionId?: string;
	order?: number;
	isDeleted?: boolean;
}

export interface SurveyQuestion {
	deletedOptionList: never[];
	id: string;
	title: string;
	description: string;
	ratingOptions: string[];
	questionType: string;
	surveyId: string | null;
	optionList?: SurveyQuestionOptions[];
	surveyTemplateId: string | null;
	order: number;
	scored?: boolean;
}

export interface Survey {
	id: string;
	userId: string;
	clinicallyValidated: boolean;
	image: string;
	title: string;
	description: string;
	instructions: string;
	resultFeedback: string;
	active: boolean;
	startAt: Date | null;
	finishAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	status: string;
	originType: string;
	isFinished: boolean;
	questionList?: SurveyQuestion[];
	surveyTemplateId: string | null;
	surveyTemplateQuestion?: SurveyQuestion[];
}

export interface SurveyTemplate {
	id: string;
	userId: string;
	image: string;
	title: string;
	description: string;
	instructions: string;
	resultFeedback: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	originType: string;
	surveyTemplateQuestion?: SurveyQuestion[];
	surveyTemplateId: string | null;
}

export interface SurveyQuestion {
	id: string;
	surveyResultId: string;
	questionType: string;
	ratingLevel: number;
	selectedAnswer: string | null;
	score: number | null;
	question: string;
	questionDescription: string;
	answerList: string[];
}

export interface SurveyResult {
	id: string;
	title: string | undefined;
	description: string | undefined;
	userId: string | undefined;
	reportsId: string;
	createdAt: string;
	updatedAt: string;
	questionList: { create: SurveyResultQuestionList[] };
	status: string;
}

export interface SurveyResultQuestionList {
	id?: string;
	surveyResult?: SurveyResult;
	surveyResultId?: string;
	questionType: string;
	ratingLevel?: number | null;
	selectedAnswer?: string | null;
	score?: number | null;
	question: string;
	questionDescription: string;
	answerList?: string[];
}

export interface SurveyResult {
	id: string;
}

export interface SurveyOptionList {
	saveSurvey: () => void;
	selectedOptionList: SurveyResultQuestionList[];
	setSelectedSurvey: (saveSurvey: Survey | null) => void;
	setSelectedOptionList: (
		selectedOptionList: SurveyResultQuestionList[],
	) => void;
	item: SurveyQuestion;
	index: number;
	selectedSurveyData: SurveyQuestion[];
	selectedSurvey: Survey | null;
	setSelectedSurveyData: (selectedSurveyData: SurveyQuestion[]) => void;
	fetchSurveyData: (value: number) => void;
}

export interface SurveyOptionListOperations {
	create: SurveyOptionPayload[];
	update: SurveyOptionPayload[];
	delete?: { id: string }[];
}
