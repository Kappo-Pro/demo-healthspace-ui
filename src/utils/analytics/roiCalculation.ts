/**
 * ROI Calculation Utilities
 *
 * Calculates return on investment for the posture analytics redesign beta program.
 * Includes time savings, revenue impact, and net present value analysis.
 *
 * @see Story 4.5 - Quantitative Beta Validation
 * @see docs/beta-program/success-criteria.md
 */

import type { ROICalculation, EfficiencyMetrics, EngagementMetrics } from '@types/betaMetrics';

/**
 * Default assumptions for ROI calculations
 */
export const DEFAULT_ASSUMPTIONS = {
	clinicianHourlyRate: 75, // $75/hour (average clinician cost)
	averageRate: 100, // $100/hour (average development cost)
	revenuePerEngagedPatient: 250, // $250 per engaged patient (assessment + program)
	discountRate: 0.1, // 10% annual discount rate for NPV
	workingWeeksPerYear: 50, // 50 working weeks per year
};

/**
 * Calculate time savings from efficiency improvements
 *
 * @param efficiencyMetrics - Clinician efficiency metrics from beta
 * @param patientsPerWeek - Average patients per clinician per week
 * @param clinicianCount - Number of clinicians
 * @param hourlyRate - Clinician hourly rate (optional, uses default)
 * @returns Time savings analysis
 */
export const calculateTimeSavings = (
	efficiencyMetrics: EfficiencyMetrics,
	patientsPerWeek: number,
	clinicianCount: number,
	hourlyRate: number = DEFAULT_ASSUMPTIONS.clinicianHourlyRate,
): ROICalculation['timeSavings'] => {
	// Calculate triage time reduction per patient
	const triageTimeReduction = efficiencyMetrics.triageTime.baseline - efficiencyMetrics.triageTime.actual;

	// Total minutes saved per week across all clinicians
	const totalMinutesSaved = triageTimeReduction * patientsPerWeek * clinicianCount;

	// Convert to hours
	const hoursSaved = totalMinutesSaved / 60;

	// Calculate cost savings
	const costSavings = hoursSaved * hourlyRate;

	return {
		triageTimeReduction,
		patientsPerWeek,
		totalMinutesSaved,
		hoursSaved,
		clinicianHourlyRate: hourlyRate,
		costSavings,
	};
};

/**
 * Calculate revenue impact from increased patient engagement
 *
 * @param engagementMetrics - Patient engagement metrics from beta
 * @param totalPatients - Total number of patients in system
 * @param revenuePerPatient - Revenue per engaged patient (optional, uses default)
 * @returns Revenue impact analysis
 */
export const calculateEngagementRevenue = (
	engagementMetrics: EngagementMetrics,
	totalPatients: number,
	revenuePerPatient: number = DEFAULT_ASSUMPTIONS.revenuePerEngagedPatient,
): ROICalculation['patientEngagement'] => {
	// Calculate engagement increase
	const engagementIncrease = engagementMetrics.viewRate.actual - engagementMetrics.viewRate.baseline;

	// Number of additional engaged patients
	const patientsAffected = (totalPatients * engagementIncrease) / 100;

	// Additional revenue from increased engagement
	const additionalRevenue = patientsAffected * revenuePerPatient;

	return {
		engagementIncrease,
		patientsAffected,
		revenuePerEngagedPatient: revenuePerPatient,
		additionalRevenue,
	};
};

/**
 * Calculate development cost
 *
 * @param designHours - Hours spent on design
 * @param developmentHours - Hours spent on development
 * @param testingHours - Hours spent on testing/QA
 * @param averageRate - Average hourly rate (optional, uses default)
 * @returns Development cost analysis
 */
export const calculateDevelopmentCost = (
	designHours: number,
	developmentHours: number,
	testingHours: number,
	averageRate: number = DEFAULT_ASSUMPTIONS.averageRate,
): ROICalculation['developmentCost'] => {
	const totalHours = designHours + developmentHours + testingHours;
	const totalCost = totalHours * averageRate;

	return {
		designHours,
		developmentHours,
		testingHours,
		totalHours,
		averageRate,
		totalCost,
	};
};

/**
 * Calculate Net Present Value (NPV) over multiple years
 *
 * @param annualBenefit - Annual benefit amount
 * @param years - Number of years to calculate
 * @param discountRate - Annual discount rate (default: 10%)
 * @returns Net present value
 */
export const calculateNPV = (
	annualBenefit: number,
	years: number,
	discountRate: number = DEFAULT_ASSUMPTIONS.discountRate,
): number => {
	let npv = 0;
	for (let year = 1; year <= years; year++) {
		npv += annualBenefit / Math.pow(1 + discountRate, year);
	}
	return npv;
};

/**
 * Calculate complete ROI analysis
 *
 * @param timeSavings - Time savings from efficiency gains
 * @param engagementRevenue - Revenue from engagement improvements
 * @param developmentCost - Total development cost
 * @returns Complete ROI calculation
 */
export const calculateROI = (
	timeSavings: ROICalculation['timeSavings'],
	engagementRevenue: ROICalculation['patientEngagement'],
	developmentCost: ROICalculation['developmentCost'],
): ROICalculation['roi'] => {
	// Annual time savings (weekly savings * 50 working weeks)
	const annualTimeSavings = timeSavings.costSavings * DEFAULT_ASSUMPTIONS.workingWeeksPerYear;

	// Annual engagement revenue
	const annualEngagementRevenue = engagementRevenue.additionalRevenue * DEFAULT_ASSUMPTIONS.workingWeeksPerYear;

	// Total annual benefit
	const totalAnnualBenefit = annualTimeSavings + annualEngagementRevenue;

	// Total cost (one-time development cost)
	const totalCost = developmentCost.totalCost;

	// Net benefit (first year only)
	const netBenefit = totalAnnualBenefit - totalCost;

	// ROI percentage
	const roiPercentage = (netBenefit / totalCost) * 100;

	// Break-even time (months)
	const monthlyBenefit = totalAnnualBenefit / 12;
	const breakEvenMonths = totalCost / monthlyBenefit;

	// 5-year Net Present Value
	const fiveYearNPV = calculateNPV(totalAnnualBenefit, 5) - totalCost;

	return {
		totalBenefit: totalAnnualBenefit,
		totalCost,
		netBenefit,
		roiPercentage,
		breakEvenMonths,
		fiveYearNPV,
	};
};

/**
 * Generate complete ROI calculation from metrics
 *
 * @param efficiencyMetrics - Clinician efficiency metrics
 * @param engagementMetrics - Patient engagement metrics
 * @param developmentHours - Development time breakdown
 * @param config - Optional configuration overrides
 * @returns Complete ROI calculation
 */
export const generateROICalculation = (
	efficiencyMetrics: EfficiencyMetrics,
	engagementMetrics: EngagementMetrics,
	developmentHours: { design: number; development: number; testing: number },
	config?: {
		patientsPerWeek?: number;
		clinicianCount?: number;
		totalPatients?: number;
		clinicianHourlyRate?: number;
		revenuePerPatient?: number;
		averageRate?: number;
	},
): ROICalculation => {
	const patientsPerWeek = config?.patientsPerWeek ?? 20;
	const clinicianCount = config?.clinicianCount ?? 10;
	const totalPatients = config?.totalPatients ?? 1000;

	// Calculate components
	const timeSavings = calculateTimeSavings(
		efficiencyMetrics,
		patientsPerWeek,
		clinicianCount,
		config?.clinicianHourlyRate,
	);

	const patientEngagement = calculateEngagementRevenue(
		engagementMetrics,
		totalPatients,
		config?.revenuePerPatient,
	);

	const developmentCost = calculateDevelopmentCost(
		developmentHours.design,
		developmentHours.development,
		developmentHours.testing,
		config?.averageRate,
	);

	const roi = calculateROI(timeSavings, patientEngagement, developmentCost);

	return {
		timeSavings,
		patientEngagement,
		developmentCost,
		roi,
	};
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

/**
 * Format ROI percentage
 */
export const formatROIPercentage = (roiPercentage: number): string => {
	const sign = roiPercentage >= 0 ? '+' : '';
	return `${sign}${roiPercentage.toFixed(1)}%`;
};

/**
 * Generate ROI summary text
 */
export const generateROISummary = (roi: ROICalculation['roi']): string => {
	const benefit = formatCurrency(roi.totalBenefit);
	const cost = formatCurrency(roi.totalCost);
	const net = formatCurrency(roi.netBenefit);
	const roiPercent = formatROIPercentage(roi.roiPercentage);
	const breakEven = roi.breakEvenMonths.toFixed(1);
	const npv = formatCurrency(roi.fiveYearNPV);

	return `Annual Benefit: ${benefit} | Cost: ${cost} | Net: ${net} | ROI: ${roiPercent} | Break-even: ${breakEven} months | 5-year NPV: ${npv}`;
};

/**
 * Export ROI calculation to CSV format
 */
export const exportROIToCSV = (roiCalculation: ROICalculation): string => {
	const rows = [
		['ROI Calculation', 'Value'],
		['', ''],
		['TIME SAVINGS', ''],
		['Triage Time Reduction (min)', roiCalculation.timeSavings.triageTimeReduction.toFixed(1)],
		['Patients Per Week', roiCalculation.timeSavings.patientsPerWeek.toString()],
		['Total Minutes Saved', roiCalculation.timeSavings.totalMinutesSaved.toFixed(0)],
		['Hours Saved Per Week', roiCalculation.timeSavings.hoursSaved.toFixed(1)],
		['Clinician Hourly Rate', formatCurrency(roiCalculation.timeSavings.clinicianHourlyRate)],
		['Weekly Cost Savings', formatCurrency(roiCalculation.timeSavings.costSavings)],
		['Annual Cost Savings', formatCurrency(roiCalculation.timeSavings.costSavings * 50)],
		['', ''],
		['PATIENT ENGAGEMENT', ''],
		['Engagement Increase (%)', roiCalculation.patientEngagement.engagementIncrease.toFixed(1)],
		['Patients Affected', roiCalculation.patientEngagement.patientsAffected.toFixed(0)],
		['Revenue Per Patient', formatCurrency(roiCalculation.patientEngagement.revenuePerEngagedPatient)],
		['Weekly Additional Revenue', formatCurrency(roiCalculation.patientEngagement.additionalRevenue)],
		['Annual Additional Revenue', formatCurrency(roiCalculation.patientEngagement.additionalRevenue * 50)],
		['', ''],
		['DEVELOPMENT COST', ''],
		['Design Hours', roiCalculation.developmentCost.designHours.toString()],
		['Development Hours', roiCalculation.developmentCost.developmentHours.toString()],
		['Testing Hours', roiCalculation.developmentCost.testingHours.toString()],
		['Total Hours', roiCalculation.developmentCost.totalHours.toString()],
		['Average Rate', formatCurrency(roiCalculation.developmentCost.averageRate)],
		['Total Cost', formatCurrency(roiCalculation.developmentCost.totalCost)],
		['', ''],
		['ROI SUMMARY', ''],
		['Total Annual Benefit', formatCurrency(roiCalculation.roi.totalBenefit)],
		['Total Cost', formatCurrency(roiCalculation.roi.totalCost)],
		['Net Benefit (Year 1)', formatCurrency(roiCalculation.roi.netBenefit)],
		['ROI Percentage', formatROIPercentage(roiCalculation.roi.roiPercentage)],
		['Break-even (months)', roiCalculation.roi.breakEvenMonths.toFixed(1)],
		['5-Year NPV', formatCurrency(roiCalculation.roi.fiveYearNPV)],
	];

	return rows.map((row) => row.join(',')).join('\n');
};
