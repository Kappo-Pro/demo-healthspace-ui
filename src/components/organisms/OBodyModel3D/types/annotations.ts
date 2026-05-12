/**
 * Interactive Annotations Types
 *
 * Type definitions for measurement annotations and comparison mode.
 *
 * @module organisms/OBodyModel3D/types/annotations
 * @since EPIC-001-S13
 */

import type { BodyMeasurementResult } from '@utils/bodyMeasurement';

/**
 * Measurement annotation data
 *
 * Associates measurement with 3D position on body model.
 */
export interface MeasurementAnnotation {
	/** Unique annotation ID */
	id: string;

	/** Display label */
	label: string;

	/** Measurement value */
	value: number;

	/** Measurement unit */
	unit: 'cm' | 'in' | 'ratio' | '%';

	/** Confidence score (0-1) */
	confidence: number;

	/** 3D position on body model */
	position: {
		x: number;
		y: number;
		z: number;
	};

	/** Body part this annotation refers to */
	bodyPart:
		| 'head'
		| 'neck'
		| 'torso'
		| 'left-shoulder'
		| 'right-shoulder'
		| 'left-upper-arm'
		| 'right-upper-arm'
		| 'left-forearm'
		| 'right-forearm'
		| 'left-thigh'
		| 'right-thigh'
		| 'left-calf'
		| 'right-calf';

	/** Measurement type */
	type: 'segment' | 'circumference' | 'ratio' | 'symmetry';
}

/**
 * Before/After Comparison Data
 *
 * Tracks measurement changes between two assessment sessions.
 */
export interface ComparisonData {
	/** Unique comparison ID */
	id: string;

	/** Before measurement result */
	before: BodyMeasurementResult;

	/** After measurement result */
	after: BodyMeasurementResult;

	/** Time period between measurements (days) */
	daysBetween: number;

	/** Overall change percentage */
	overallChange: number;

	/** Individual measurement changes */
	changes: MeasurementChange[];
}

/**
 * Individual measurement change
 */
export interface MeasurementChange {
	/** Measurement ID */
	id: string;

	/** Measurement label */
	label: string;

	/** Before value */
	beforeValue: number;

	/** After value */
	afterValue: number;

	/** Unit */
	unit: string;

	/** Absolute change */
	absoluteChange: number;

	/** Percentage change */
	percentChange: number;

	/** Change direction: 'increase' | 'decrease' | 'stable' */
	direction: 'increase' | 'decrease' | 'stable';

	/** Whether this change is positive (improvement) */
	isPositive: boolean;
}

/**
 * Progress tracking entry
 */
export interface ProgressEntry {
	/** Entry timestamp */
	date: string;

	/** Measurement result */
	result: BodyMeasurementResult;

	/** Overall progress score (0-100) */
	score: number;
}

/**
 * Export report format
 */
export interface ComparisonReport {
	/** Report title */
	title: string;

	/** Export timestamp */
	exportDate: string;

	/** Patient/User ID */
	userId?: string;

	/** Comparison data */
	comparison: ComparisonData;

	/** Summary statistics */
	summary: {
		totalMeasurements: number;
		improvementCount: number;
		regressionCount: number;
		stableCount: number;
	};

	/** Report format version */
	version: '1.0';
}
