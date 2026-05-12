/**
 * Statistical Analysis Utilities
 *
 * Provides statistical analysis functions for beta metrics validation.
 * Includes t-tests, confidence intervals, and significance testing.
 *
 * @see Story 4.5 - Quantitative Beta Validation
 */

import type { StatisticalAnalysis, SignificanceLevel } from '@types/betaMetrics';

/**
 * Calculate mean (average) of an array of numbers
 */
export const calculateMean = (values: number[]): number => {
	if (values.length === 0) return 0;
	const sum = values.reduce((acc, val) => acc + val, 0);
	return sum / values.length;
};

/**
 * Calculate median of an array of numbers
 */
export const calculateMedian = (values: number[]): number => {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

/**
 * Calculate percentile (e.g., P95)
 */
export const calculatePercentile = (values: number[], percentile: number): number => {
	if (values.length === 0) return 0;
	if (percentile < 0 || percentile > 100) {
		throw new Error('Percentile must be between 0 and 100');
	}

	const sorted = [...values].sort((a, b) => a - b);
	const index = (percentile / 100) * (sorted.length - 1);
	const lower = Math.floor(index);
	const upper = Math.ceil(index);
	const weight = index - lower;

	return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

/**
 * Calculate standard deviation
 */
export const calculateStdDev = (values: number[]): number => {
	if (values.length === 0) return 0;
	const mean = calculateMean(values);
	const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
	const variance = calculateMean(squaredDiffs);
	return Math.sqrt(variance);
};

/**
 * Calculate standard error of the mean
 */
export const calculateStdError = (values: number[]): number => {
	if (values.length === 0) return 0;
	const stdDev = calculateStdDev(values);
	return stdDev / Math.sqrt(values.length);
};

/**
 * Perform two-sample t-test (independent samples)
 *
 * Tests if the difference between baseline and actual values is statistically significant.
 *
 * @param baseline - Baseline (pre-beta) values
 * @param actual - Actual (post-beta) values
 * @param alpha - Significance level (default: 0.05)
 * @returns t-statistic and p-value
 */
export const twoSampleTTest = (
	baseline: number[],
	actual: number[],
	alpha: SignificanceLevel = 0.05,
): { tStatistic: number; pValue: number; significant: boolean } => {
	const n1 = baseline.length;
	const n2 = actual.length;

	if (n1 === 0 || n2 === 0) {
		return { tStatistic: 0, pValue: 1, significant: false };
	}

	const mean1 = calculateMean(baseline);
	const mean2 = calculateMean(actual);
	const stdDev1 = calculateStdDev(baseline);
	const stdDev2 = calculateStdDev(actual);

	// Pooled standard deviation
	const pooledStdDev = Math.sqrt(
		((n1 - 1) * Math.pow(stdDev1, 2) + (n2 - 1) * Math.pow(stdDev2, 2)) / (n1 + n2 - 2),
	);

	// t-statistic
	const tStatistic = (mean1 - mean2) / (pooledStdDev * Math.sqrt(1 / n1 + 1 / n2));

	// Degrees of freedom
	const df = n1 + n2 - 2;

	// Approximate p-value using t-distribution
	// For simplicity, using a rough approximation (for production, use a proper stats library)
	const pValue = approximatePValue(Math.abs(tStatistic), df);

	return {
		tStatistic,
		pValue,
		significant: pValue < alpha,
	};
};

/**
 * Approximate p-value from t-statistic and degrees of freedom
 *
 * Simplified approximation for demonstration. For production, use a proper statistics library.
 *
 * Note: This simplified version doesn't use df (degrees of freedom) in the approximation.
 * A proper implementation would use the t-distribution with df to calculate accurate p-values.
 *
 * @param tStat - t-statistic value
 * @param _df - degrees of freedom (unused in this simplified version, kept for API consistency)
 */
 
const approximatePValue = (tStat: number, _df: number): number => {
	// Very rough approximation for two-tailed test
	// For t > 2.5, p < 0.05
	// For t > 3.5, p < 0.01
	if (tStat > 3.5) return 0.001;
	if (tStat > 2.5) return 0.01;
	if (tStat > 2.0) return 0.05;
	if (tStat > 1.5) return 0.1;
	return 0.2;
};

/**
 * Calculate confidence interval for mean
 *
 * @param values - Sample values
 * @param confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns Lower and upper bounds of confidence interval
 */
export const calculateConfidenceInterval = (
	values: number[],
	confidenceLevel = 0.95,
): { lower: number; upper: number; level: number } => {
	if (values.length === 0) {
		return { lower: 0, upper: 0, level: confidenceLevel };
	}

	const mean = calculateMean(values);
	const stdError = calculateStdError(values);

	// For 95% CI, use t-value ≈ 1.96 (z-score for large samples)
	// For 99% CI, use t-value ≈ 2.576
	let tValue = 1.96;
	if (confidenceLevel === 0.99) tValue = 2.576;
	if (confidenceLevel === 0.90) tValue = 1.645;

	const marginOfError = tValue * stdError;

	return {
		lower: mean - marginOfError,
		upper: mean + marginOfError,
		level: confidenceLevel,
	};
};

/**
 * Perform statistical analysis on metric
 *
 * Compares baseline (pre-beta) vs actual (post-beta) values and determines
 * statistical significance.
 *
 * @param metricName - Name of the metric
 * @param baseline - Baseline values (array)
 * @param actual - Actual values (array)
 * @param alpha - Significance level
 * @returns Complete statistical analysis
 */
export const analyzeMetric = (
	metricName: string,
	baseline: number[],
	actual: number[],
	alpha: SignificanceLevel = 0.05,
): StatisticalAnalysis => {
	const baselineMean = calculateMean(baseline);
	const actualMean = calculateMean(actual);
	const change = actualMean - baselineMean;
	const percentChange = baselineMean !== 0 ? (change / baselineMean) * 100 : 0;

	const { tStatistic, pValue, significant } = twoSampleTTest(baseline, actual, alpha);
	const confidenceInterval = calculateConfidenceInterval(actual, 0.95);

	return {
		metric: metricName,
		baseline: baselineMean,
		actual: actualMean,
		change,
		percentChange,
		sampleSize: actual.length,
		tStatistic,
		pValue,
		significant,
		confidenceInterval,
	};
};

/**
 * Calculate percentage change
 */
export const calculatePercentChange = (baseline: number, actual: number): number => {
	if (baseline === 0) return actual > 0 ? 100 : 0;
	return ((actual - baseline) / baseline) * 100;
};

/**
 * Determine if target is met
 */
export const isTargetMet = (
	actual: number,
	target: number,
	direction: 'increase' | 'decrease' = 'increase',
): boolean => {
	return direction === 'increase' ? actual >= target : actual <= target;
};

/**
 * Calculate NPS (Net Promoter Score)
 *
 * NPS = % Promoters (9-10) - % Detractors (0-6)
 *
 * @param scores - Array of scores (0-10)
 * @returns NPS score and breakdown
 */
export const calculateNPS = (
	scores: number[],
): { nps: number; promoters: number; passives: number; detractors: number } => {
	if (scores.length === 0) {
		return { nps: 0, promoters: 0, passives: 0, detractors: 0 };
	}

	const promoterCount = scores.filter((score) => score >= 9).length;
	const passiveCount = scores.filter((score) => score >= 7 && score <= 8).length;
	const detractorCount = scores.filter((score) => score <= 6).length;

	const promoters = (promoterCount / scores.length) * 100;
	const passives = (passiveCount / scores.length) * 100;
	const detractors = (detractorCount / scores.length) * 100;

	const nps = promoters - detractors;

	return { nps, promoters, passives, detractors };
};

/**
 * Calculate SUS (System Usability Scale)
 *
 * SUS is calculated from 10 questions, each scored 1-5.
 * Odd questions: contribution = (score - 1)
 * Even questions: contribution = (5 - score)
 * Total = sum of contributions * 2.5
 *
 * @param responses - Array of 10 responses (1-5 each)
 * @returns SUS score (0-100)
 */
export const calculateSUS = (responses: number[]): number => {
	if (responses.length !== 10) {
		throw new Error('SUS requires exactly 10 responses');
	}

	let sum = 0;
	for (let i = 0; i < 10; i++) {
		const score = responses[i];
		if (score < 1 || score > 5) {
			throw new Error('SUS scores must be between 1 and 5');
		}
		// Odd questions (index 0, 2, 4, 6, 8)
		if (i % 2 === 0) {
			sum += score - 1;
		} else {
			// Even questions (index 1, 3, 5, 7, 9)
			sum += 5 - score;
		}
	}

	return sum * 2.5;
};

/**
 * Calculate CSAT (Customer Satisfaction)
 *
 * CSAT = % of responses that are 4 or 5 (on a 1-5 scale)
 *
 * @param scores - Array of satisfaction scores (1-5)
 * @returns CSAT percentage
 */
export const calculateCSAT = (scores: number[]): number => {
	if (scores.length === 0) return 0;
	const satisfiedCount = scores.filter((score) => score >= 4).length;
	return (satisfiedCount / scores.length) * 100;
};

/**
 * Export statistical analysis to CSV format
 */
export const exportToCSV = (analyses: StatisticalAnalysis[]): string => {
	const headers = [
		'Metric',
		'Baseline',
		'Actual',
		'Change',
		'Percent Change',
		'Sample Size',
		't-Statistic',
		'p-Value',
		'Significant',
		'CI Lower',
		'CI Upper',
	];

	const rows = analyses.map((analysis) => [
		analysis.metric,
		analysis.baseline.toFixed(2),
		analysis.actual.toFixed(2),
		analysis.change.toFixed(2),
		`${analysis.percentChange.toFixed(1)}%`,
		analysis.sampleSize.toString(),
		analysis.tStatistic.toFixed(3),
		analysis.pValue.toFixed(4),
		analysis.significant ? 'Yes' : 'No',
		analysis.confidenceInterval.lower.toFixed(2),
		analysis.confidenceInterval.upper.toFixed(2),
	]);

	const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

	return csvContent;
};

/**
 * Format number with appropriate precision
 */
export const formatNumber = (value: number, decimals = 2): string => {
	return value.toFixed(decimals);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals = 1): string => {
	return `${value.toFixed(decimals)}%`;
};

/**
 * Format time duration (milliseconds to human-readable)
 */
export const formatDuration = (milliseconds: number): string => {
	if (milliseconds < 1000) return `${Math.round(milliseconds)}ms`;
	if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
	return `${(milliseconds / 60000).toFixed(1)}min`;
};
