/**
 * Beta Metrics Types
 *
 * Type definitions for beta program quantitative validation and metrics analysis.
 *
 * @see docs/beta-program/success-criteria.md
 * @see Story 4.5 - Quantitative Beta Validation
 */

/**
 * Beta program strategic goals
 */
export type StrategicGoal =
	| 'accessibility_compliance'
	| 'clinician_efficiency'
	| 'patient_engagement'
	| 'component_reusability'
	| 'ai_integration_readiness';

/**
 * Metric validation status
 */
export type ValidationStatus = 'passed' | 'failed' | 'partial' | 'pending';

/**
 * Statistical significance level
 */
export type SignificanceLevel = 0.01 | 0.05 | 0.1;

/**
 * Accessibility compliance metrics
 */
export interface AccessibilityMetrics {
	goal: 'accessibility_compliance';
	wcagCompliance: {
		target: 100;
		actual: number;
		baseline: 75;
		status: ValidationStatus;
	};
	axeViolations: {
		critical: number;
		serious: number;
		moderate: number;
		minor: number;
	};
	lighthouseScore: {
		target: 95;
		actual: number;
		status: ValidationStatus;
	};
	keyboardNavigation: {
		tested: boolean;
		passed: boolean;
		issues: string[];
	};
	screenReaderCompatibility: {
		tested: boolean;
		passed: boolean;
		issues: string[];
	};
}

/**
 * Clinician efficiency metrics
 */
export interface EfficiencyMetrics {
	goal: 'clinician_efficiency';
	triageTime: {
		target: 54; // minutes
		actual: number;
		baseline: 90;
		reduction: number; // percentage
		status: ValidationStatus;
	};
	assessmentTime: {
		target: 8;
		actual: number;
		baseline: 12;
		status: ValidationStatus;
	};
	reportGenerationTime: {
		target: 2;
		actual: number;
		baseline: 4;
		status: ValidationStatus;
	};
	clicksToComplete: {
		target: 5;
		actual: number;
		baseline: 8;
		status: ValidationStatus;
	};
	sampleSize: number;
	clinicianCount: number;
}

/**
 * Patient engagement metrics
 */
export interface EngagementMetrics {
	goal: 'patient_engagement';
	viewRate: {
		target: 56; // percentage
		actual: number;
		baseline: 35;
		increase: number; // percentage
		status: ValidationStatus;
	};
	sessionDuration: {
		average: number; // seconds
		median: number;
		p95: number;
	};
	featureAdoption: {
		postureAnalytics: number; // percentage
		exerciseRecommendations: number;
		goalTracking: number;
		comparison: number;
	};
	returnRate: {
		week1: number;
		week2: number;
		week3: number;
		week4: number;
	};
	sampleSize: number;
}

/**
 * Component reusability metrics
 */
export interface ReusabilityMetrics {
	goal: 'component_reusability';
	reusabilityScore: {
		target: 80; // percentage
		actual: number;
		status: ValidationStatus;
	};
	sharedComponents: {
		atoms: number;
		molecules: number;
		organisms: number;
		total: number;
	};
	componentUsage: {
		singleUse: number;
		multiUse: number;
		highlyReused: number; // 5+ uses
	};
	codeAnalysis: {
		totalComponents: number;
		sharedComponents: number;
		averageUsageCount: number;
	};
}

/**
 * AI integration readiness metrics
 */
export interface AIReadinessMetrics {
	goal: 'ai_integration_readiness';
	apiContracts: {
		stable: boolean;
		version: string;
		breakingChanges: number;
		status: ValidationStatus;
	};
	dataPipeline: {
		scalable: boolean;
		throughput: number; // requests per second
		latency: number; // milliseconds
		status: ValidationStatus;
	};
	mockIntegration: {
		tested: boolean;
		passed: boolean;
		issues: string[];
	};
	reworkNeeded: {
		estimate: 'zero' | 'minimal' | 'moderate' | 'significant';
		status: ValidationStatus;
	};
}

/**
 * Additional satisfaction metrics
 */
export interface SatisfactionMetrics {
	nps: {
		target: 50;
		actual: number;
		promoters: number; // percentage
		passives: number;
		detractors: number;
		status: ValidationStatus;
	};
	sus: {
		target: 80;
		actual: number;
		status: ValidationStatus;
	};
	csat: {
		target: 80; // percentage
		actual: number;
		status: ValidationStatus;
	};
	errorRate: {
		target: 1; // percentage
		actual: number;
		status: ValidationStatus;
	};
	loadTime: {
		target: 3000; // milliseconds (P95)
		actual: number;
		status: ValidationStatus;
	};
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
	week: number;
	date: string;
	value: number;
	target?: number;
	status?: ValidationStatus;
}

/**
 * Statistical analysis result
 */
export interface StatisticalAnalysis {
	metric: string;
	baseline: number;
	actual: number;
	change: number; // absolute change
	percentChange: number;
	sampleSize: number;
	tStatistic: number;
	pValue: number;
	significant: boolean;
	confidenceInterval: {
		lower: number;
		upper: number;
		level: number; // 0.95, 0.99, etc.
	};
}

/**
 * ROI calculation
 */
export interface ROICalculation {
	timeSavings: {
		triageTimeReduction: number; // minutes per patient
		patientsPerWeek: number;
		totalMinutesSaved: number;
		hoursSaved: number;
		clinicianHourlyRate: number;
		costSavings: number; // dollars
	};
	patientEngagement: {
		engagementIncrease: number; // percentage
		patientsAffected: number;
		revenuePerEngagedPatient: number; // dollars
		additionalRevenue: number;
	};
	developmentCost: {
		designHours: number;
		developmentHours: number;
		testingHours: number;
		totalHours: number;
		averageRate: number; // dollars per hour
		totalCost: number;
	};
	roi: {
		totalBenefit: number; // dollars
		totalCost: number;
		netBenefit: number;
		roiPercentage: number;
		breakEvenMonths: number;
		fiveYearNPV: number; // Net Present Value
	};
}

/**
 * Complete beta validation results
 */
export interface BetaValidationResults {
	programId: string;
	startDate: string;
	endDate: string;
	duration: number; // weeks
	participantCount: number;
	clinicCount: number;

	goals: {
		accessibility: AccessibilityMetrics;
		efficiency: EfficiencyMetrics;
		engagement: EngagementMetrics;
		reusability: ReusabilityMetrics;
		aiReadiness: AIReadinessMetrics;
	};

	satisfaction: SatisfactionMetrics;

	timeSeries: {
		engagement: TimeSeriesDataPoint[];
		triageTime: TimeSeriesDataPoint[];
		errorRate: TimeSeriesDataPoint[];
		nps: TimeSeriesDataPoint[];
	};

	statisticalAnalysis: StatisticalAnalysis[];

	roi: ROICalculation;

	overallStatus: 'go' | 'conditional_go' | 'no_go';
	recommendation: string;
	criticalIssues: string[];
	notes: string[];
}

/**
 * Metrics export format
 */
export type ExportFormat = 'pdf' | 'csv' | 'json' | 'excel';

/**
 * Report generation options
 */
export interface ReportOptions {
	format: ExportFormat;
	includeRawData: boolean;
	includeCharts: boolean;
	includeStatistics: boolean;
	includeROI: boolean;
	audience: 'executive' | 'technical' | 'stakeholder' | 'comprehensive';
}

/**
 * Beta metrics dashboard state
 */
export interface BetaMetricsDashboardState {
	loading: boolean;
	error: string | null;
	data: BetaValidationResults | null;
	lastUpdated: string | null;
	autoRefresh: boolean;
	refreshInterval: number; // milliseconds
}

/**
 * Metrics comparison (pre-beta vs post-beta)
 */
export interface MetricsComparison {
	metric: string;
	preBeta: number;
	postBeta: number;
	change: number;
	percentChange: number;
	target: number;
	targetMet: boolean;
	status: ValidationStatus;
}

/**
 * Goal validation summary
 */
export interface GoalValidationSummary {
	goal: StrategicGoal;
	goalName: string;
	status: ValidationStatus;
	metricsCount: number;
	metricsPassed: number;
	criticalMetricsPassed: boolean;
	details: string;
}
