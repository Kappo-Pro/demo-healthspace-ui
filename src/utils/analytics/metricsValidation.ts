/**
 * Beta Metrics Validation Service
 *
 * Validates beta program metrics against success criteria and generates
 * comprehensive validation results for all 5 strategic goals.
 *
 * @see Story 4.5 - Quantitative Beta Validation
 * @see docs/beta-program/success-criteria.md
 */

import type {
	AccessibilityMetrics,
	EfficiencyMetrics,
	EngagementMetrics,
	ReusabilityMetrics,
	AIReadinessMetrics,
	SatisfactionMetrics,
	ValidationStatus,
	GoalValidationSummary,
	StrategicGoal,
	BetaValidationResults,
} from '@types/betaMetrics';

/**
 * Validate accessibility compliance metrics (Goal 1)
 */
export const validateAccessibilityMetrics = (metrics: AccessibilityMetrics): ValidationStatus => {
	const wcagPassed = metrics.wcagCompliance.actual >= metrics.wcagCompliance.target;
	const lighthousePassed = metrics.lighthouseScore.actual >= metrics.lighthouseScore.target;
	const noCriticalViolations = metrics.axeViolations.critical === 0;
	const keyboardPassed = metrics.keyboardNavigation.tested && metrics.keyboardNavigation.passed;
	const screenReaderPassed =
		metrics.screenReaderCompatibility.tested && metrics.screenReaderCompatibility.passed;

	if (wcagPassed && lighthousePassed && noCriticalViolations && keyboardPassed && screenReaderPassed) {
		return 'passed';
	}

	if (noCriticalViolations && (wcagPassed || lighthousePassed)) {
		return 'partial';
	}

	return 'failed';
};

/**
 * Validate clinician efficiency metrics (Goal 2)
 */
export const validateEfficiencyMetrics = (metrics: EfficiencyMetrics): ValidationStatus => {
	const triageTarget = metrics.triageTime.reduction >= 40; // 40% reduction
	const triageAcceptable = metrics.triageTime.reduction >= 20; // 20% minimum

	const assessmentPassed = metrics.assessmentTime.actual <= metrics.assessmentTime.target;
	const reportPassed = metrics.reportGenerationTime.actual <= metrics.reportGenerationTime.target;

	if (triageTarget && assessmentPassed && reportPassed) {
		return 'passed';
	}

	if (triageAcceptable && (assessmentPassed || reportPassed)) {
		return 'partial';
	}

	return 'failed';
};

/**
 * Validate patient engagement metrics (Goal 3)
 */
export const validateEngagementMetrics = (metrics: EngagementMetrics): ValidationStatus => {
	const viewRateTarget = metrics.viewRate.increase >= 60; // 60% increase
	const viewRateAcceptable = metrics.viewRate.increase >= 40; // 40% minimum

	const goodRetention = metrics.returnRate.week4 >= 80; // 80% retention target

	if (viewRateTarget && goodRetention) {
		return 'passed';
	}

	if (viewRateAcceptable) {
		return 'partial';
	}

	return 'failed';
};

/**
 * Validate component reusability metrics (Goal 4)
 */
export const validateReusabilityMetrics = (metrics: ReusabilityMetrics): ValidationStatus => {
	const reusabilityTarget = metrics.reusabilityScore.actual >= metrics.reusabilityScore.target; // 80%
	const reusabilityAcceptable = metrics.reusabilityScore.actual >= 70; // 70% minimum

	if (reusabilityTarget) {
		return 'passed';
	}

	if (reusabilityAcceptable) {
		return 'partial';
	}

	return 'failed';
};

/**
 * Validate AI integration readiness metrics (Goal 5)
 */
export const validateAIReadinessMetrics = (metrics: AIReadinessMetrics): ValidationStatus => {
	const apiStable = metrics.apiContracts.stable && metrics.apiContracts.breakingChanges === 0;
	const dataPipelineScalable = metrics.dataPipeline.scalable && metrics.dataPipeline.latency < 500; // <500ms
	const mockPassed = metrics.mockIntegration.tested && metrics.mockIntegration.passed;
	const zeroRework = metrics.reworkNeeded.estimate === 'zero';

	if (apiStable && dataPipelineScalable && mockPassed && zeroRework) {
		return 'passed';
	}

	if (apiStable && dataPipelineScalable && mockPassed) {
		return 'partial'; // Minimal rework acceptable
	}

	return 'failed';
};

/**
 * Validate satisfaction metrics
 */
export const validateSatisfactionMetrics = (metrics: SatisfactionMetrics): ValidationStatus => {
	const npsTarget = metrics.nps.actual >= metrics.nps.target; // ≥50
	const susTarget = metrics.sus.actual >= metrics.sus.target; // ≥80
	const csatTarget = metrics.csat.actual >= metrics.csat.target; // ≥80%
	const errorRateOk = metrics.errorRate.actual <= metrics.errorRate.target; // <1%
	const loadTimeOk = metrics.loadTime.actual <= metrics.loadTime.target; // <3s

	// NPS, SUS, and CSAT are critical satisfaction metrics
	if (npsTarget && susTarget && csatTarget && errorRateOk && loadTimeOk) {
		return 'passed';
	}

	// At least two critical metrics met with acceptable performance
	const criticalMetsPassed = [npsTarget, susTarget, csatTarget].filter(Boolean).length;
	if (criticalMetsPassed >= 2 && errorRateOk) {
		return 'partial';
	}

	return 'failed';
};

/**
 * Generate goal validation summary
 */
export const generateGoalSummary = (
	goal: StrategicGoal,
	status: ValidationStatus,
	metricsCount: number,
	metricsPassed: number,
	criticalPassed: boolean,
): GoalValidationSummary => {
	const goalNames: Record<StrategicGoal, string> = {
		accessibility_compliance: 'Goal 1: Accessibility Compliance',
		clinician_efficiency: 'Goal 2: Clinician Efficiency',
		patient_engagement: 'Goal 3: Patient Engagement',
		component_reusability: 'Goal 4: Component Reusability',
		ai_integration_readiness: 'Goal 5: AI Integration Readiness',
	};

	let details = '';
	if (status === 'passed') {
		details = `All ${metricsCount} metrics passed. Target achieved.`;
	} else if (status === 'partial') {
		details = `${metricsPassed}/${metricsCount} metrics passed. Acceptable performance with minor gaps.`;
	} else {
		details = `${metricsPassed}/${metricsCount} metrics passed. Critical targets not met.`;
	}

	return {
		goal,
		goalName: goalNames[goal],
		status,
		metricsCount,
		metricsPassed,
		criticalMetricsPassed: criticalPassed,
		details,
	};
};

/**
 * Determine overall beta program status
 */
export const determineOverallStatus = (
	accessibilityStatus: ValidationStatus,
	efficiencyStatus: ValidationStatus,
	engagementStatus: ValidationStatus,
	reusabilityStatus: ValidationStatus,
	aiReadinessStatus: ValidationStatus,
	satisfactionStatus: ValidationStatus,
): 'go' | 'conditional_go' | 'no_go' => {
	const statuses = [
		accessibilityStatus,
		efficiencyStatus,
		engagementStatus,
		reusabilityStatus,
		aiReadinessStatus,
		satisfactionStatus,
	];

	const passedCount = statuses.filter((s) => s === 'passed').length;
	const failedCount = statuses.filter((s) => s === 'failed').length;

	// Critical goals: accessibility, efficiency, satisfaction
	const criticalPassed =
		accessibilityStatus !== 'failed' && efficiencyStatus !== 'failed' && satisfactionStatus !== 'failed';

	// GO: All passed or 1 partial
	if (passedCount >= 5 && failedCount === 0 && criticalPassed) {
		return 'go';
	}

	// CONDITIONAL GO: Most passed, minor issues
	if (passedCount >= 4 && failedCount <= 1 && criticalPassed) {
		return 'conditional_go';
	}

	// NO-GO: Critical failures
	return 'no_go';
};

/**
 * Generate recommendation based on overall status
 */
export const generateRecommendation = (
	overallStatus: 'go' | 'conditional_go' | 'no_go',
	criticalIssues: string[],
): string => {
	if (overallStatus === 'go') {
		return 'All success criteria met. Recommend deploying to production with phased rollout (beta users → 25% → 50% → 100%).';
	}

	if (overallStatus === 'conditional_go') {
		return `Most criteria met with minor gaps. Recommend addressing ${criticalIssues.length} issue(s) before production deployment. Estimated timeline: 1-2 weeks.`;
	}

	return `Critical criteria not met. Recommend extended beta period (4 weeks) with significant fixes. ${criticalIssues.length} critical issue(s) require resolution before production consideration.`;
};

/**
 * Identify critical issues
 */
export const identifyCriticalIssues = (
	validationResults: BetaValidationResults,
): string[] => {
	const issues: string[] = [];

	// Check accessibility
	if (validationResults.goals.accessibility.axeViolations.critical > 0) {
		issues.push(
			`Accessibility: ${validationResults.goals.accessibility.axeViolations.critical} critical WCAG violations`,
		);
	}

	// Check efficiency
	if (validationResults.goals.efficiency.triageTime.reduction < 20) {
		issues.push(
			`Efficiency: Triage time reduction ${validationResults.goals.efficiency.triageTime.reduction.toFixed(1)}% (target: 40%)`,
		);
	}

	// Check engagement
	if (validationResults.goals.engagement.viewRate.increase < 40) {
		issues.push(
			`Engagement: View rate increase ${validationResults.goals.engagement.viewRate.increase.toFixed(1)}% (target: 60%)`,
		);
	}

	// Check satisfaction
	if (validationResults.satisfaction.errorRate.actual > 2) {
		issues.push(
			`Quality: Error rate ${validationResults.satisfaction.errorRate.actual.toFixed(1)}% (target: <1%)`,
		);
	}

	if (validationResults.satisfaction.nps.actual < 30) {
		issues.push(
			`Satisfaction: NPS ${validationResults.satisfaction.nps.actual.toFixed(0)} (target: ≥50)`,
		);
	}

	if (validationResults.satisfaction.sus.actual < 60) {
		issues.push(
			`Usability: SUS ${validationResults.satisfaction.sus.actual.toFixed(0)} (target: ≥80)`,
		);
	}

	return issues;
};

/**
 * Validate complete beta program results
 */
export const validateBetaResults = (
	results: BetaValidationResults,
): {
	goalSummaries: GoalValidationSummary[];
	overallStatus: 'go' | 'conditional_go' | 'no_go';
	recommendation: string;
	criticalIssues: string[];
} => {
	// Validate each goal
	const accessibilityStatus = validateAccessibilityMetrics(results.goals.accessibility);
	const efficiencyStatus = validateEfficiencyMetrics(results.goals.efficiency);
	const engagementStatus = validateEngagementMetrics(results.goals.engagement);
	const reusabilityStatus = validateReusabilityMetrics(results.goals.reusability);
	const aiReadinessStatus = validateAIReadinessMetrics(results.goals.aiReadiness);
	const satisfactionStatus = validateSatisfactionMetrics(results.satisfaction);

	// Generate summaries
	const goalSummaries: GoalValidationSummary[] = [
		generateGoalSummary('accessibility_compliance', accessibilityStatus, 5, 5, accessibilityStatus === 'passed'),
		generateGoalSummary('clinician_efficiency', efficiencyStatus, 4, 3, efficiencyStatus !== 'failed'),
		generateGoalSummary('patient_engagement', engagementStatus, 3, 2, engagementStatus !== 'failed'),
		generateGoalSummary('component_reusability', reusabilityStatus, 2, 2, reusabilityStatus === 'passed'),
		generateGoalSummary('ai_integration_readiness', aiReadinessStatus, 4, 3, aiReadinessStatus !== 'failed'),
	];

	// Determine overall status
	const overallStatus = determineOverallStatus(
		accessibilityStatus,
		efficiencyStatus,
		engagementStatus,
		reusabilityStatus,
		aiReadinessStatus,
		satisfactionStatus,
	);

	// Identify critical issues
	const criticalIssues = identifyCriticalIssues(results);

	// Generate recommendation
	const recommendation = generateRecommendation(overallStatus, criticalIssues);

	return {
		goalSummaries,
		overallStatus,
		recommendation,
		criticalIssues,
	};
};

/**
 * Format validation status as emoji
 */
export const formatStatusEmoji = (status: ValidationStatus): string => {
	switch (status) {
		case 'passed':
			return '✅';
		case 'partial':
			return '⚠️';
		case 'failed':
			return '❌';
		case 'pending':
			return '⏳';
		default:
			return '❓';
	}
};

/**
 * Format overall status as emoji
 */
export const formatOverallStatusEmoji = (status: 'go' | 'conditional_go' | 'no_go'): string => {
	switch (status) {
		case 'go':
			return '✅ GO';
		case 'conditional_go':
			return '⚠️ CONDITIONAL GO';
		case 'no_go':
			return '❌ NO-GO';
		default:
			return '❓ PENDING';
	}
};
