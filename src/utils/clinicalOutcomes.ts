/**
 * Clinical Outcomes Utility Functions
 *
 * Helper functions for clinical outcome calculations, correlation analysis,
 * and insight generation (FR17).
 *
 * @module utils/clinicalOutcomes
 */

import { sampleCorrelation } from 'simple-statistics';
import type {
	CorrelationData,
	ClinicalInsight,
	OutcomeMeasure,
} from '@types/clinicalOutcomes';

/**
 * Calculate Pearson correlation coefficient between two datasets
 *
 * @param dataPoints - Array of data point pairs
 * @returns Correlation data with coefficient, interpretation, and significance
 */
export const calculateCorrelation = (
	dataPoints: Array<{ postureScore: number; outcomeValue: number }>,
): Omit<CorrelationData, 'dataPoints'> => {
	if (dataPoints.length < 3) {
		return {
			coefficient: 0,
			pValue: 1,
			interpretation: 'no correlation',
			isSignificant: false,
		};
	}

	try {
		// Extract x and y values
		const xValues = dataPoints.map(d => d.postureScore);
		const yValues = dataPoints.map(d => d.outcomeValue);

		// Calculate Pearson correlation coefficient
		const coefficient = sampleCorrelation(xValues, yValues);

		// Calculate approximate p-value using t-statistic
		// t = r * sqrt((n-2)/(1-r^2))
		const n = dataPoints.length;
		const tStatistic =
			coefficient * Math.sqrt((n - 2) / (1 - coefficient ** 2));

		// Approximate p-value (two-tailed)
		// For simplicity, use threshold approach
		const criticalT = 2.0; // Approximate for p < 0.05 with df > 10
		const pValue = Math.abs(tStatistic) > criticalT ? 0.02 : 0.1;

		// Determine interpretation based on coefficient magnitude
		const absCoeff = Math.abs(coefficient);
		let interpretation:
			| 'strong positive'
			| 'moderate positive'
			| 'weak positive'
			| 'no correlation'
			| 'weak negative'
			| 'moderate negative'
			| 'strong negative';

		if (absCoeff >= 0.7) {
			interpretation = coefficient > 0 ? 'strong positive' : 'strong negative';
		} else if (absCoeff >= 0.4) {
			interpretation =
				coefficient > 0 ? 'moderate positive' : 'moderate negative';
		} else if (absCoeff >= 0.2) {
			interpretation = coefficient > 0 ? 'weak positive' : 'weak negative';
		} else {
			interpretation = 'no correlation';
		}

		return {
			coefficient: Math.round(coefficient * 100) / 100,
			pValue: Math.round(pValue * 1000) / 1000,
			interpretation,
			isSignificant: pValue < 0.05,
		};
	} catch (error) {
		return {
			coefficient: 0,
			pValue: 1,
			interpretation: 'no correlation',
			isSignificant: false,
		};
	}
};

/**
 * Detect inflection points in a time series
 *
 * Identifies points where the trend changes significantly.
 *
 * @param data - Array of { date, value } points
 * @returns Array of inflection point dates
 */
export const detectInflectionPoints = (
	data: Array<{ date: string; value: number }>,
): string[] => {
	if (data.length < 5) return [];

	const inflectionPoints: string[] = [];
	const windowSize = 3;

	for (let i = windowSize; i < data.length - windowSize; i++) {
		const before = data
			.slice(i - windowSize, i)
			.reduce((sum, d) => sum + d.value, 0);
		const after = data
			.slice(i + 1, i + windowSize + 1)
			.reduce((sum, d) => sum + d.value, 0);

		const avgBefore = before / windowSize;
		const avgAfter = after / windowSize;
		const current = data[i].value;

		// Detect significant change (>15% difference)
		const changeBefore = Math.abs((current - avgBefore) / avgBefore);
		const changeAfter = Math.abs((avgAfter - current) / current);

		if (changeBefore > 0.15 || changeAfter > 0.15) {
			inflectionPoints.push(data[i].date);
		}
	}

	return inflectionPoints;
};

/**
 * Detect outliers in outcome data
 *
 * Identifies data points that deviate significantly from the trend.
 *
 * @param data - Array of { date, value } points
 * @returns Array of outlier dates
 */
export const detectOutliers = (
	data: Array<{ date: string; value: number }>,
): string[] => {
	if (data.length < 5) return [];

	// Calculate mean and standard deviation
	const values = data.map(d => d.value);
	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	const variance =
		values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
	const stdDev = Math.sqrt(variance);

	// Identify outliers (>2 standard deviations from mean)
	const outliers: string[] = [];
	data.forEach(d => {
		if (Math.abs(d.value - mean) > 2 * stdDev) {
			outliers.push(d.date);
		}
	});

	return outliers;
};

/**
 * Generate clinical insights from outcome measures
 *
 * Analyzes trends, correlations, and anomalies to generate actionable insights.
 *
 * @param measures - Array of outcome measures
 * @param correlations - Correlation data for each measure
 * @returns Array of clinical insights
 */
export const generateClinicalInsights = (
	measures: OutcomeMeasure[],
	correlations: Record<string, CorrelationData>,
): ClinicalInsight[] => {
	const insights: ClinicalInsight[] = [];

	measures.forEach(measure => {
		// Inflection point insights
		const inflectionPoints = detectInflectionPoints(measure.history);
		if (inflectionPoints.length > 0) {
			insights.push({
				id: `inflection-${measure.measureType}`,
				type: 'inflection_point',
				severity: 'info',
				title: `${measure.label} trend changed`,
				description: `Significant change detected in ${measure.label} around ${new Date(inflectionPoints[0]).toLocaleDateString()}.`,
				relatedDates: inflectionPoints,
				suggestedActions: ['Review treatment plan for this period'],
			});
		}

		// Outlier insights
		const outliers = detectOutliers(measure.history);
		if (outliers.length > 0) {
			insights.push({
				id: `outlier-${measure.measureType}`,
				type: 'outlier',
				severity: 'warning',
				title: `Unusual ${measure.label} readings`,
				description: `${outliers.length} outlier(s) detected in ${measure.label} data. Consider external factors or measurement errors.`,
				relatedDates: outliers,
				suggestedActions: [
					'Verify measurement accuracy',
					'Check for confounding factors',
				],
			});
		}

		// Correlation insights
		const correlation = correlations[measure.measureType];
		if (correlation && correlation.isSignificant) {
			const isPositive = correlation.coefficient > 0;
			insights.push({
				id: `correlation-${measure.measureType}`,
				type: 'correlation',
				severity: 'info',
				title: `${correlation.interpretation} correlation detected`,
				description: `${measure.label} shows a ${correlation.interpretation} (r = ${correlation.coefficient.toFixed(2)}) with posture scores.`,
				suggestedActions: [
					isPositive
						? 'Improve posture to improve outcome'
						: 'Posture improvements correlate with better outcomes',
				],
			});
		}

		// Trend-based recommendations
		if (measure.trend === 'worsening' && measure.current > measure.baseline) {
			insights.push({
				id: `recommendation-${measure.measureType}`,
				type: 'recommendation',
				severity: 'critical',
				title: `${measure.label} worsening`,
				description: `${measure.label} has increased from ${measure.baseline} to ${measure.current}. Immediate intervention recommended.`,
				suggestedActions: [
					'Reassess treatment plan',
					'Consider additional interventions',
					'Schedule follow-up consultation',
				],
			});
		}
	});

	return insights;
};

/**
 * Predict goal achievement date based on current trend
 *
 * Uses linear regression to estimate when a goal will be achieved.
 *
 * @param history - Historical data points
 * @param targetValue - Goal target value
 * @returns Predicted achievement date (ISO string) or null if not achievable
 */
export const predictGoalAchievement = (
	history: Array<{ date: string; value: number }>,
	targetValue: number,
): string | null => {
	if (history.length < 3) return null;

	// Simple linear regression
	const n = history.length;
	const timestamps = history.map(h => new Date(h.date).getTime());
	const values = history.map(h => h.value);

	const sumX = timestamps.reduce((a, b) => a + b, 0);
	const sumY = values.reduce((a, b) => a + b, 0);
	const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
	const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);

	const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;

	// Check if trend is moving toward target
	const currentValue = values[values.length - 1];
	const isIncreasing = slope > 0;
	const needsIncrease = targetValue > currentValue;

	if (isIncreasing !== needsIncrease && Math.abs(slope) > 0.0001) {
		// Trend is moving away from target
		return null;
	}

	// Calculate timestamp when target will be reached
	const targetTimestamp = (targetValue - intercept) / slope;

	// Validate it's in the future and within reasonable timeframe (< 2 years)
	const now = Date.now();
	const twoYearsFromNow = now + 2 * 365 * 24 * 60 * 60 * 1000;

	if (targetTimestamp > now && targetTimestamp < twoYearsFromNow) {
		return new Date(targetTimestamp).toISOString();
	}

	return null;
};
