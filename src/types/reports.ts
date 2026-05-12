/**
 * reports.ts
 *
 * Report generation types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 5
 */

// ============================================================================
// REPORTS TYPES (5 declarations)
// ============================================================================

export enum ReportsResources {
	romSessions = 'romSessions',
	romResults = 'romResults',
	rehabSessions = 'rehabSessions',
	evaluationSessions = 'evaluationSessions',
}

export interface ReportNotes {
	createdAt: Date;
	notes: string;
	image: string;
	video: string;
	jobId: string;
}

export interface Report {
	id: string;
	user?: User;
	userId: string;
	name: string;
	romSessionsIds?: IRomSession[];
	romSessionsNotes?: ReportNotes[];
	surveyResultNotes?: ReportNotes[];
	romResultsIds?: RomPatientResult[];
	romResultsNotes?: ReportNotes[];
	programSessionsIds?: RehabExerciseListSession[];
	programSessionsNotes?: ReportNotes[];
	evaluationSessionsIds?: IEvaluation[];
	surveyResultIds?: SurveyResult[];
	evaluationSessionsNotes?: ReportNotes[];
	assessmentNotes?: ReportNotes[];
	diagnosisCode?: number[];
	planNotes?: ReportNotes[];
	startDate?: Date;
	endDate?: Date;
	createdAt: Date;
	updatedAt: Date;
	postureSessionsIds?: Posture[];
	postureSessionsNotes?: ReportNotes[];
}

export interface ReportData {
	reports: ReportPaginatedResponse;
	report: Report | null;
	loading: boolean;
	reportIds: ReportIdsInterface;
	searchTextForReports: string;
}

export interface ReportIdsInterface {
	romSessionsIds?: string[];
	romResultsIds?: string[];
	programSessionsIds?: string[];
	evaluationSessionsIds?: string[];
	exercisesSelectedRows?: string[];
	surveyResultIds?: string[];
	postureSessionsIds?: string[];
}
