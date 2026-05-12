/**
 * Organizational Metrics Type Definitions
 *
 * Types for aggregate reporting, cohort analysis, and ROI tracking
 * Used by OrganizationalReporting page (FR27 - Story 3.6)
 *
 * @module types/organizationalMetrics
 */

/**
 * Aggregate metrics across all patients
 */
export interface AggregateMetrics {
	/** Total number of patients tracked */
	totalPatients: number;

	/** Average posture improvement percentage across all patients */
	averageImprovementPercent: number;

	/** Percentage of patients viewing posture analytics */
	engagementRate: number;

	/** Percentage of patients completing recommended exercises */
	adherenceRate: number;

	/** Date range for metrics */
	dateRange: {
		start: string;
		end: string;
	};

	/** Last updated timestamp */
	lastUpdated: string;
}

/**
 * Cohort grouping types
 */
export type CohortGroupBy =
	| 'condition'
	| 'ageGroup'
	| 'clinician'
	| 'riskLevel';

/**
 * Age group categories
 */
export type AgeGroup = '<18' | '18-30' | '31-45' | '46-60' | '61-75' | '>75';

/**
 * Clinical condition types
 */
export type ClinicalCondition =
	| 'chronic_back_pain'
	| 'neck_pain'
	| 'scoliosis'
	| 'kyphosis'
	| 'postural_dysfunction'
	| 'sports_injury'
	| 'work_related'
	| 'other';

/**
 * Individual cohort data
 */
export interface CohortData {
	/** Cohort identifier */
	id: string;

	/** Cohort display label */
	label: string;

	/** Number of patients in cohort */
	patientCount: number;

	/** Average improvement percentage */
	averageImprovement: number;

	/** Engagement rate for cohort */
	engagementRate: number;

	/** Adherence rate for cohort */
	adherenceRate: number;

	/** Average baseline score */
	averageBaselineScore: number;

	/** Average current score */
	averageCurrentScore: number;

	/** Statistical confidence (0-1) */
	confidence: number;
}

/**
 * Cohort comparison analysis
 */
export interface CohortAnalysis {
	/** Grouping method used */
	groupBy: CohortGroupBy;

	/** Cohort data array */
	cohorts: CohortData[];

	/** Date range filter */
	dateRange: {
		start: string;
		end: string;
	};

	/** Comparison insights */
	insights: string[];

	/** Statistical significance notes */
	significance: {
		pValue?: number;
		interpretation: string;
	};
}

/**
 * Return on Investment metrics
 */
export interface ROIMetrics {
	/** Patient retention rate (%) */
	retentionRate: number;

	/** Percentage of patients meeting functional goals */
	outcomeAchievementRate: number;

	/** Average reduction in triage time (minutes) */
	triageTimeReduction: number;

	/** Clinical efficiency metrics */
	efficiency: {
		/** Average sessions per patient */
		avgSessionsPerPatient: number;

		/** Average time to first improvement */
		avgTimeToImprovement: number; // days

		/** Percentage of patients showing improvement */
		improvementRate: number;
	};

	/** Cost metrics */
	cost: {
		/** Average cost per patient */
		avgCostPerPatient: number;

		/** Cost per outcome achieved */
		costPerOutcome: number;

		/** Total program cost */
		totalProgramCost: number;
	};

	/** Date range for ROI calculation */
	dateRange: {
		start: string;
		end: string;
	};

	/** Last updated timestamp */
	lastUpdated: string;
}

/**
 * Risk distribution data
 */
export interface RiskDistribution {
	/** Risk level */
	level: 'critical' | 'high' | 'medium' | 'low' | 'excellent';

	/** Number of patients in this risk level */
	count: number;

	/** Percentage of total patients */
	percentage: number;

	/** Color for visualization */
	color: string;
}

/**
 * Engagement trend data point
 */
export interface EngagementDataPoint {
	/** Date (ISO 8601) */
	date: string;

	/** Engagement rate (%) */
	engagementRate: number;

	/** Number of active patients */
	activePatients: number;

	/** Number of new assessments */
	newAssessments: number;

	/** Adherence rate (%) */
	adherenceRate: number;
}

/**
 * Complete organizational metrics response
 */
export interface OrganizationalMetricsData {
	/** Aggregate metrics */
	aggregate: AggregateMetrics;

	/** Cohort analysis */
	cohorts: CohortAnalysis;

	/** ROI metrics */
	roi: ROIMetrics;

	/** Risk distribution */
	riskDistribution: RiskDistribution[];

	/** Engagement trends over time */
	engagementTrends: EngagementDataPoint[];
}

/**
 * Organizational metrics filter options
 */
export interface OrganizationalMetricsFilter {
	/** Date range */
	dateRange: {
		start: string;
		end: string;
	};

	/** Cohort grouping method */
	cohortGroupBy: CohortGroupBy;

	/** Optional clinician filter */
	clinicianId?: string;

	/** Optional clinic location filter */
	clinicLocation?: string;

	/** Optional condition filter */
	conditions?: ClinicalCondition[];
}

/**
 * Export template configuration
 */
export interface ExportTemplate {
	/** Template identifier */
	id: string;

	/** Template name */
	name: string;

	/** Sections to include */
	sections: {
		executiveSummary: boolean;
		aggregateMetrics: boolean;
		cohortAnalysis: boolean;
		roiMetrics: boolean;
		visualizations: boolean;
		recommendations: boolean;
	};

	/** Export format */
	format: 'pdf' | 'pptx' | 'excel';

	/** Branding options */
	branding?: {
		logo?: string;
		organizationName?: string;
		customColors?: {
			primary: string;
			secondary: string;
		};
	};
}

/**
 * Executive summary data
 */
export interface ExecutiveSummary {
	/** Report title */
	title: string;

	/** Report date range */
	dateRange: {
		start: string;
		end: string;
	};

	/** Key highlights */
	highlights: string[];

	/** Key metrics summary */
	keyMetrics: {
		label: string;
		value: string;
		trend?: 'up' | 'down' | 'stable';
		change?: string;
	}[];

	/** Recommendations */
	recommendations: string[];

	/** Generated timestamp */
	generatedAt: string;
}
