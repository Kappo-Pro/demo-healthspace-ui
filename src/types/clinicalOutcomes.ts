/**
 * Clinical Outcomes Type Definitions
 *
 * Types for clinical outcome measures (NPRS, NDI, ODI) and their integration
 * with posture analytics (FR17).
 *
 * @module types/clinicalOutcomes
 */

/**
 * Outcome measure types supported by the system
 */
export type OutcomeMeasureType = 'NPRS' | 'NDI' | 'ODI' | 'FUNCTIONAL_GOAL';

/**
 * Single outcome measure data point
 */
export interface OutcomeMeasurePoint {
	/** Measurement date (ISO 8601) */
	date: string;

	/** Score value */
	value: number;

	/** Optional notes from clinician */
	notes?: string;
}

/**
 * NPRS (Numeric Pain Rating Scale) data
 * Scale: 0-10 (0 = no pain, 10 = worst pain)
 */
export interface NPRSData {
	measureType: 'NPRS';
	label: 'Pain Level';
	unit: '/10';
	scale: { min: 0; max: 10 };
	history: OutcomeMeasurePoint[];
	current: number;
	baseline: number;
	trend: 'improving' | 'stable' | 'worsening';
}

/**
 * NDI (Neck Disability Index) data
 * Scale: 0-100% (0 = no disability, 100 = complete disability)
 */
export interface NDIData {
	measureType: 'NDI';
	label: 'Neck Disability';
	unit: '%';
	scale: { min: 0; max: 100 };
	history: OutcomeMeasurePoint[];
	current: number;
	baseline: number;
	trend: 'improving' | 'stable' | 'worsening';
}

/**
 * ODI (Oswestry Disability Index) data
 * Scale: 0-100% (0 = no disability, 100 = complete disability)
 */
export interface ODIData {
	measureType: 'ODI';
	label: 'Back Disability';
	unit: '%';
	scale: { min: 0; max: 100 };
	history: OutcomeMeasurePoint[];
	current: number;
	baseline: number;
	trend: 'improving' | 'stable' | 'worsening';
}

/**
 * Functional goal data
 * Scale: 0-100% achievement
 */
export interface FunctionalGoalData {
	measureType: 'FUNCTIONAL_GOAL';
	label: string; // e.g., "Return to running"
	unit: '% achieved';
	scale: { min: 0; max: 100 };
	history: OutcomeMeasurePoint[];
	current: number;
	baseline: number;
	trend: 'improving' | 'stable' | 'worsening';
	targetDate?: string;
}

/**
 * Union type for all outcome measures
 */
export type OutcomeMeasure = NPRSData | NDIData | ODIData | FunctionalGoalData;

/**
 * Correlation data between posture score and clinical outcome
 */
export interface CorrelationData {
	/** Posture score and outcome pairs */
	dataPoints: Array<{
		date: string;
		postureScore: number;
		outcomeValue: number;
	}>;

	/** Pearson correlation coefficient (-1 to 1) */
	coefficient: number;

	/** Statistical significance (p-value) */
	pValue: number;

	/** Human-readable interpretation */
	interpretation:
		| 'strong positive'
		| 'moderate positive'
		| 'weak positive'
		| 'no correlation'
		| 'weak negative'
		| 'moderate negative'
		| 'strong negative';

	/** Whether correlation is statistically significant (p < 0.05) */
	isSignificant: boolean;
}

/**
 * Clinical insight generated from outcome analysis
 */
export interface ClinicalInsight {
	/** Unique insight ID */
	id: string;

	/** Insight type */
	type: 'inflection_point' | 'outlier' | 'correlation' | 'recommendation';

	/** Severity level */
	severity: 'info' | 'warning' | 'critical';

	/** Title */
	title: string;

	/** Detailed description */
	description: string;

	/** Related data points (if applicable) */
	relatedDates?: string[];

	/** Suggested actions */
	suggestedActions?: string[];
}

/**
 * Outcome goal definition
 */
export interface OutcomeGoal {
	/** Goal ID */
	id: string;

	/** Outcome measure type */
	measureType: OutcomeMeasureType;

	/** Target value */
	targetValue: number;

	/** Current value */
	currentValue: number;

	/** Progress percentage (0-100) */
	progress: number;

	/** Target date (ISO 8601) */
	targetDate: string;

	/** Predicted achievement date (ISO 8601) */
	predictedDate?: string;

	/** Status */
	status: 'on-track' | 'at-risk' | 'behind' | 'achieved';

	/** Human-readable description */
	description: string;
}

/**
 * Complete clinical outcomes data for a patient
 */
export interface ClinicalOutcomesData {
	/** Patient ID */
	patientId: string;

	/** All outcome measures */
	measures: OutcomeMeasure[];

	/** Correlations with posture scores */
	correlations: Record<OutcomeMeasureType, CorrelationData>;

	/** Generated clinical insights */
	insights: ClinicalInsight[];

	/** Active outcome goals */
	goals: OutcomeGoal[];

	/** Last updated timestamp */
	lastUpdated: string;
}
