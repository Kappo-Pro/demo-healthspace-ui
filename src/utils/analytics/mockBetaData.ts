/**
 * Mock Beta Data Generator
 *
 * Generates realistic mock data for beta validation demonstration.
 * In production, this would be replaced with actual analytics data from
 * Google Analytics, Mixpanel, Sentry, etc.
 *
 * @see Story 4.5 - Quantitative Beta Validation
 */

import type {
	BetaValidationResults,
	AccessibilityMetrics,
	EfficiencyMetrics,
	EngagementMetrics,
	ReusabilityMetrics,
	AIReadinessMetrics,
	SatisfactionMetrics,
	TimeSeriesDataPoint,
} from '@types/betaMetrics';

/**
 * Generate mock accessibility metrics
 */
export const generateMockAccessibilityMetrics = (): AccessibilityMetrics => ({
	goal: 'accessibility_compliance',
	wcagCompliance: {
		target: 100,
		actual: 100,
		baseline: 75,
		status: 'passed',
	},
	axeViolations: {
		critical: 0,
		serious: 0,
		moderate: 2,
		minor: 5,
	},
	lighthouseScore: {
		target: 95,
		actual: 96,
		status: 'passed',
	},
	keyboardNavigation: {
		tested: true,
		passed: true,
		issues: [],
	},
	screenReaderCompatibility: {
		tested: true,
		passed: true,
		issues: [],
	},
});

/**
 * Generate mock efficiency metrics
 */
export const generateMockEfficiencyMetrics = (): EfficiencyMetrics => ({
	goal: 'clinician_efficiency',
	triageTime: {
		target: 54,
		actual: 50,
		baseline: 90,
		reduction: 44.4, // (90-50)/90 * 100
		status: 'passed',
	},
	assessmentTime: {
		target: 8,
		actual: 7.5,
		baseline: 12,
		status: 'passed',
	},
	reportGenerationTime: {
		target: 2,
		actual: 1.8,
		baseline: 4,
		status: 'passed',
	},
	clicksToComplete: {
		target: 5,
		actual: 4.2,
		baseline: 8,
		status: 'passed',
	},
	sampleSize: 150, // 150 triage sessions
	clinicianCount: 10,
});

/**
 * Generate mock engagement metrics
 */
export const generateMockEngagementMetrics = (): EngagementMetrics => ({
	goal: 'patient_engagement',
	viewRate: {
		target: 56,
		actual: 58,
		baseline: 35,
		increase: 65.7, // (58-35)/35 * 100
		status: 'passed',
	},
	sessionDuration: {
		average: 720, // 12 minutes in seconds
		median: 660, // 11 minutes
		p95: 1200, // 20 minutes
	},
	featureAdoption: {
		postureAnalytics: 85, // 85% of patients viewed
		exerciseRecommendations: 72,
		goalTracking: 58,
		comparison: 65,
	},
	returnRate: {
		week1: 90,
		week2: 88,
		week3: 85,
		week4: 83, // 83% retention
	},
	sampleSize: 250, // 250 patients
});

/**
 * Generate mock reusability metrics
 */
export const generateMockReusabilityMetrics = (): ReusabilityMetrics => ({
	goal: 'component_reusability',
	reusabilityScore: {
		target: 80,
		actual: 85,
		status: 'passed',
	},
	sharedComponents: {
		atoms: 45,
		molecules: 28,
		organisms: 12,
		total: 85,
	},
	componentUsage: {
		singleUse: 15,
		multiUse: 45,
		highlyReused: 25, // 5+ uses
	},
	codeAnalysis: {
		totalComponents: 100,
		sharedComponents: 85,
		averageUsageCount: 4.8,
	},
});

/**
 * Generate mock AI readiness metrics
 */
export const generateMockAIReadinessMetrics = (): AIReadinessMetrics => ({
	goal: 'ai_integration_readiness',
	apiContracts: {
		stable: true,
		version: '2.0.0',
		breakingChanges: 0,
		status: 'passed',
	},
	dataPipeline: {
		scalable: true,
		throughput: 500, // 500 requests/sec
		latency: 250, // 250ms average
		status: 'passed',
	},
	mockIntegration: {
		tested: true,
		passed: true,
		issues: [],
	},
	reworkNeeded: {
		estimate: 'zero',
		status: 'passed',
	},
});

/**
 * Generate mock satisfaction metrics
 */
export const generateMockSatisfactionMetrics = (): SatisfactionMetrics => ({
	nps: {
		target: 50,
		actual: 60,
		promoters: 70,
		passives: 20,
		detractors: 10,
		status: 'passed',
	},
	sus: {
		target: 80,
		actual: 82,
		status: 'passed',
	},
	csat: {
		target: 80,
		actual: 85,
		status: 'passed',
	},
	errorRate: {
		target: 1,
		actual: 0.7,
		status: 'passed',
	},
	loadTime: {
		target: 3000,
		actual: 2100, // 2.1 seconds
		status: 'passed',
	},
});

/**
 * Generate mock time series data
 */
export const generateMockTimeSeries = (): {
	engagement: TimeSeriesDataPoint[];
	triageTime: TimeSeriesDataPoint[];
	errorRate: TimeSeriesDataPoint[];
	nps: TimeSeriesDataPoint[];
} => {
	return {
		engagement: [
			{ week: 1, date: '2025-10-01', value: 72, target: 70, status: 'passed' },
			{ week: 2, date: '2025-10-08', value: 75, target: 70, status: 'passed' },
			{ week: 3, date: '2025-10-15', value: 68, target: 70, status: 'partial' },
			{ week: 4, date: '2025-10-22', value: 73, target: 70, status: 'passed' },
		],
		triageTime: [
			{ week: 1, date: '2025-10-01', value: 62, target: 54, status: 'partial' },
			{ week: 2, date: '2025-10-08', value: 58, target: 54, status: 'partial' },
			{ week: 3, date: '2025-10-15', value: 52, target: 54, status: 'passed' },
			{ week: 4, date: '2025-10-22', value: 50, target: 54, status: 'passed' },
		],
		errorRate: [
			{ week: 1, date: '2025-10-01', value: 1.2, target: 1.0, status: 'partial' },
			{ week: 2, date: '2025-10-08', value: 0.9, target: 1.0, status: 'passed' },
			{ week: 3, date: '2025-10-15', value: 0.8, target: 1.0, status: 'passed' },
			{ week: 4, date: '2025-10-22', value: 0.7, target: 1.0, status: 'passed' },
		],
		nps: [
			{ week: 1, date: '2025-10-01', value: 45, target: 50, status: 'partial' },
			{ week: 2, date: '2025-10-08', value: 52, target: 50, status: 'passed' },
			{ week: 3, date: '2025-10-15', value: 58, target: 50, status: 'passed' },
			{ week: 4, date: '2025-10-22', value: 60, target: 50, status: 'passed' },
		],
	};
};

/**
 * Generate complete mock beta validation results
 */
export const generateMockBetaResults = (): BetaValidationResults => {
	const mockAccessibility = generateMockAccessibilityMetrics();
	const mockEfficiency = generateMockEfficiencyMetrics();
	const mockEngagement = generateMockEngagementMetrics();
	const mockReusability = generateMockReusabilityMetrics();
	const mockAIReadiness = generateMockAIReadinessMetrics();
	const mockSatisfaction = generateMockSatisfactionMetrics();
	const mockTimeSeries = generateMockTimeSeries();

	// Mock statistical analysis (would be calculated from raw data)
	const mockStatisticalAnalysis = [
		{
			metric: 'Triage Time',
			baseline: 90,
			actual: 50,
			change: -40,
			percentChange: -44.4,
			sampleSize: 150,
			tStatistic: -8.5,
			pValue: 0.0001,
			significant: true,
			confidenceInterval: { lower: 48.5, upper: 51.5, level: 0.95 },
		},
		{
			metric: 'Patient Engagement Rate',
			baseline: 35,
			actual: 58,
			change: 23,
			percentChange: 65.7,
			sampleSize: 250,
			tStatistic: 12.3,
			pValue: 0.0001,
			significant: true,
			confidenceInterval: { lower: 55.2, upper: 60.8, level: 0.95 },
		},
		{
			metric: 'Error Rate',
			baseline: 2.5,
			actual: 0.7,
			change: -1.8,
			percentChange: -72.0,
			sampleSize: 3000,
			tStatistic: -15.2,
			pValue: 0.0001,
			significant: true,
			confidenceInterval: { lower: 0.65, upper: 0.75, level: 0.95 },
		},
	];

	// Mock ROI calculation
	const mockROI = {
		timeSavings: {
			triageTimeReduction: 40, // minutes
			patientsPerWeek: 20,
			totalMinutesSaved: 8000, // 40 * 20 * 10 clinicians
			hoursSaved: 133.3,
			clinicianHourlyRate: 75,
			costSavings: 10000, // $10k per week
		},
		patientEngagement: {
			engagementIncrease: 65.7,
			patientsAffected: 230, // (1000 * 23%) / week
			revenuePerEngagedPatient: 250,
			additionalRevenue: 57500, // per year
		},
		developmentCost: {
			designHours: 120,
			developmentHours: 400,
			testingHours: 80,
			totalHours: 600,
			averageRate: 100,
			totalCost: 60000,
		},
		roi: {
			totalBenefit: 557500, // Annual: (10k * 50) + 57.5k
			totalCost: 60000,
			netBenefit: 497500,
			roiPercentage: 829.2, // 829% ROI
			breakEvenMonths: 1.3, // Break even in 1.3 months
			fiveYearNPV: 2048000, // 5-year NPV: $2.048M
		},
	};

	return {
		programId: 'beta-2025-q4',
		startDate: '2025-10-01',
		endDate: '2025-10-29',
		duration: 4,
		participantCount: 30,
		clinicCount: 3,
		goals: {
			accessibility: mockAccessibility,
			efficiency: mockEfficiency,
			engagement: mockEngagement,
			reusability: mockReusability,
			aiReadiness: mockAIReadiness,
		},
		satisfaction: mockSatisfaction,
		timeSeries: mockTimeSeries,
		statisticalAnalysis: mockStatisticalAnalysis,
		roi: mockROI,
		overallStatus: 'go',
		recommendation:
			'All success criteria met. Recommend deploying to production with phased rollout (beta users → 25% → 50% → 100%).',
		criticalIssues: [],
		notes: [
			'All 5 strategic goals achieved or exceeded targets',
			'Strong statistical significance (p < 0.001) for all key metrics',
			'Exceptional ROI: 829% return, break-even in 1.3 months',
			'Zero critical accessibility violations',
			'High user satisfaction (NPS: 60, SUS: 82)',
		],
	};
};

/**
 * Generate mock results with conditional go status (for testing)
 */
export const generateConditionalGoResults = (): BetaValidationResults => {
	const results = generateMockBetaResults();

	// Modify to create conditional go scenario
	results.goals.efficiency.triageTime.actual = 58;
	results.goals.efficiency.triageTime.reduction = 35.6; // Below 40% target
	results.goals.efficiency.triageTime.status = 'partial';

	results.satisfaction.nps.actual = 45;
	results.satisfaction.nps.status = 'partial';

	results.overallStatus = 'conditional_go';
	results.recommendation =
		'Most criteria met with minor gaps. Recommend addressing 2 issue(s) before production deployment. Estimated timeline: 1-2 weeks.';
	results.criticalIssues = [
		'Efficiency: Triage time reduction 35.6% (target: 40%)',
		'Satisfaction: NPS 45 (target: ≥50)',
	];

	return results;
};

/**
 * Generate mock results with no-go status (for testing)
 */
export const generateNoGoResults = (): BetaValidationResults => {
	const results = generateMockBetaResults();

	// Modify to create no-go scenario
	results.goals.accessibility.axeViolations.critical = 3;
	results.goals.accessibility.wcagCompliance.actual = 92;
	results.goals.accessibility.wcagCompliance.status = 'failed';

	results.goals.efficiency.triageTime.actual = 75;
	results.goals.efficiency.triageTime.reduction = 16.7; // Well below target
	results.goals.efficiency.triageTime.status = 'failed';

	results.satisfaction.errorRate.actual = 3.5;
	results.satisfaction.errorRate.status = 'failed';

	results.satisfaction.nps.actual = 15;
	results.satisfaction.nps.status = 'failed';

	results.satisfaction.sus.actual = 55;
	results.satisfaction.sus.status = 'failed';

	results.overallStatus = 'no_go';
	results.recommendation =
		'Critical criteria not met. Recommend extended beta period (4 weeks) with significant fixes. 5 critical issue(s) require resolution before production consideration.';
	results.criticalIssues = [
		'Accessibility: 3 critical WCAG violations',
		'Efficiency: Triage time reduction 16.7% (target: 40%)',
		'Quality: Error rate 3.5% (target: <1%)',
		'Satisfaction: NPS 15 (target: ≥50)',
		'Usability: SUS 55 (target: ≥80)',
	];

	return results;
};
