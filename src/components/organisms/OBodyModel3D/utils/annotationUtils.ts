/**
 * Annotation Utility Functions
 *
 * Helper functions for positioning annotations on 3D model
 * and calculating comparison metrics.
 *
 * @module organisms/OBodyModel3D/utils/annotationUtils
 * @since EPIC-001-S13
 */

import type { BodyMeasurementResult } from '@utils/bodyMeasurement';
import type {
	MeasurementAnnotation,
	ComparisonData,
	MeasurementChange,
	ComparisonReport,
} from '../types/annotations';

/**
 * Body part position map
 *
 * Defines 3D positions for measurement annotations on body model.
 * Positions are in model space (meters), centered at origin.
 */
const BODY_PART_POSITIONS: Record<
	MeasurementAnnotation['bodyPart'],
	{ x: number; y: number; z: number }
> = {
	head: { x: 0, y: 0.8, z: 0 },
	neck: { x: 0, y: 0.6, z: 0 },
	torso: { x: 0, y: 0.2, z: 0 },
	'left-shoulder': { x: -0.3, y: 0.5, z: 0 },
	'right-shoulder': { x: 0.3, y: 0.5, z: 0 },
	'left-upper-arm': { x: -0.4, y: 0.3, z: 0 },
	'right-upper-arm': { x: 0.4, y: 0.3, z: 0 },
	'left-forearm': { x: -0.45, y: 0.05, z: 0 },
	'right-forearm': { x: 0.45, y: 0.05, z: 0 },
	'left-thigh': { x: -0.15, y: -0.2, z: 0 },
	'right-thigh': { x: 0.15, y: -0.2, z: 0 },
	'left-calf': { x: -0.15, y: -0.6, z: 0 },
	'right-calf': { x: 0.15, y: -0.6, z: 0 },
};

/**
 * Convert measurement result to annotations
 *
 * Maps measurements to 3D annotation points on body model.
 * Implements AC1: measurement labels overlay 3D model.
 *
 * @param result - Body measurement result
 * @returns Array of measurement annotations
 *
 * @example
 * ```typescript
 * const annotations = createAnnotationsFromMeasurements(measurementResult);
 * annotations.forEach(a => renderLabel(a));
 * ```
 */
export function createAnnotationsFromMeasurements(
	result: BodyMeasurementResult
): MeasurementAnnotation[] {
	const annotations: MeasurementAnnotation[] = [];

	// Segments → body part annotations
	result.measurements.segments.forEach(segment => {
		const bodyPart = mapSegmentToBodyPart(segment.segment);
		if (!bodyPart) return;

		annotations.push({
			id: `segment-${segment.segment}`,
			label: formatLabel(segment.segment),
			value: segment.lengthCm,
			unit: 'cm',
			confidence: segment.confidence,
			position: BODY_PART_POSITIONS[bodyPart],
			bodyPart,
			type: 'segment',
		});
	});

	// Circumferences → body part annotations
	result.measurements.circumferences.forEach(circ => {
		const bodyPart = mapCircumferenceToBodyPart(circ.bodyPart);
		if (!bodyPart) return;

		annotations.push({
			id: `circ-${circ.bodyPart}`,
			label: formatLabel(circ.bodyPart),
			value: circ.circumferenceCm,
			unit: 'cm',
			confidence: circ.confidence,
			position: BODY_PART_POSITIONS[bodyPart],
			bodyPart,
			type: 'circumference',
		});
	});

	return annotations;
}

/**
 * Calculate comparison between two measurements
 *
 * Implements AC3, AC5: before/after comparison with change indicators.
 *
 * @param before - Before measurement
 * @param after - After measurement
 * @returns Comparison data with changes
 *
 * @example
 * ```typescript
 * const comparison = calculateComparison(beforeMeasurement, afterMeasurement);
 *  // +5.2%
 * ```
 */
export function calculateComparison(
	before: BodyMeasurementResult,
	after: BodyMeasurementResult
): ComparisonData {
	const beforeDate = new Date(before.metadata.timestamp);
	const afterDate = new Date(after.metadata.timestamp);
	const daysBetween = Math.floor(
		(afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	const changes: MeasurementChange[] = [];

	// Compare segments
	before.measurements.segments.forEach(beforeSeg => {
		const afterSeg = after.measurements.segments.find(s => s.segment === beforeSeg.segment);
		if (!afterSeg) return;

		const change = calculateMeasurementChange(
			beforeSeg.segment,
			beforeSeg.lengthCm,
			afterSeg.lengthCm,
			'cm',
			'segment'
		);
		changes.push(change);
	});

	// Compare circumferences
	before.measurements.circumferences.forEach(beforeCirc => {
		const afterCirc = after.measurements.circumferences.find(
			c => c.bodyPart === beforeCirc.bodyPart
		);
		if (!afterCirc) return;

		const change = calculateMeasurementChange(
			beforeCirc.bodyPart,
			beforeCirc.circumferenceCm,
			afterCirc.circumferenceCm,
			'cm',
			'circumference'
		);
		changes.push(change);
	});

	// Calculate overall change percentage
	const totalChange = changes.reduce((sum, c) => sum + Math.abs(c.percentChange), 0);
	const overallChange = changes.length > 0 ? totalChange / changes.length : 0;

	return {
		id: `comparison-${Date.now()}`,
		before,
		after,
		daysBetween,
		overallChange,
		changes,
	};
}

/**
 * Generate comparison report
 *
 * Implements AC6: export comparison reports.
 *
 * @param comparison - Comparison data
 * @param userId - Optional user ID
 * @returns Exportable report
 *
 * @example
 * ```typescript
 * const report = generateComparisonReport(comparison, 'user-123');
 * downloadJSON(report, 'measurement-comparison.json');
 * ```
 */
export function generateComparisonReport(
	comparison: ComparisonData,
	userId?: string
): ComparisonReport {
	const improvementCount = comparison.changes.filter(c => c.isPositive).length;
	const regressionCount = comparison.changes.filter(c => !c.isPositive && c.direction !== 'stable')
		.length;
	const stableCount = comparison.changes.filter(c => c.direction === 'stable').length;

	return {
		title: 'Body Measurement Comparison Report',
		exportDate: new Date().toISOString(),
		userId,
		comparison,
		summary: {
			totalMeasurements: comparison.changes.length,
			improvementCount,
			regressionCount,
			stableCount,
		},
		version: '1.0',
	};
}

/**
 * Export report to JSON file
 *
 * Triggers browser download of comparison report.
 *
 * @param report - Comparison report
 * @param filename - Output filename
 */
export function exportReportToJSON(report: ComparisonReport, filename = 'comparison-report.json'): void {
	const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Calculate individual measurement change
 *
 * @internal
 */
function calculateMeasurementChange(
	id: string,
	beforeValue: number,
	afterValue: number,
	unit: string,
	type: 'segment' | 'circumference'
): MeasurementChange {
	const absoluteChange = afterValue - beforeValue;
	const percentChange = beforeValue !== 0 ? (absoluteChange / beforeValue) * 100 : 0;

	let direction: MeasurementChange['direction'];
	if (Math.abs(percentChange) < 1) {
		direction = 'stable';
	} else if (absoluteChange > 0) {
		direction = 'increase';
	} else {
		direction = 'decrease';
	}

	// Determine if change is positive (improvement)
	// For segments: increase = improvement (muscle growth)
	// For circumferences: decrease = improvement (fat loss), except chest/shoulders
	let isPositive = false;
	if (type === 'segment') {
		isPositive = direction === 'increase';
	} else if (type === 'circumference') {
		const waistCirc = id.includes('waist') || id.includes('hip');
		isPositive = waistCirc ? direction === 'decrease' : direction === 'increase';
	}

	return {
		id,
		label: formatLabel(id),
		beforeValue,
		afterValue,
		unit,
		absoluteChange,
		percentChange,
		direction,
		isPositive,
	};
}

/**
 * Map segment name to body part
 *
 * @internal
 */
function mapSegmentToBodyPart(segment: string): MeasurementAnnotation['bodyPart'] | null {
	const mapping: Record<string, MeasurementAnnotation['bodyPart']> = {
		'torso-length': 'torso',
		'shoulder-width': 'torso',
		'upper-arm-length': 'left-upper-arm',
		'forearm-length': 'left-forearm',
		'thigh-length': 'left-thigh',
		'calf-length': 'left-calf',
		'neck-length': 'neck',
	};

	return mapping[segment] || null;
}

/**
 * Map circumference body part to annotation body part
 *
 * @internal
 */
function mapCircumferenceToBodyPart(
	bodyPart: string
): MeasurementAnnotation['bodyPart'] | null {
	const mapping: Record<string, MeasurementAnnotation['bodyPart']> = {
		chest: 'torso',
		waist: 'torso',
		hip: 'torso',
		thigh: 'left-thigh',
		calf: 'left-calf',
		bicep: 'left-upper-arm',
		forearm: 'left-forearm',
		neck: 'neck',
	};

	return mapping[bodyPart] || null;
}

/**
 * Format label for display
 *
 * @internal
 */
function formatLabel(id: string): string {
	return id
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Get color for change direction
 *
 * Implements AC5: color coding for positive/negative changes.
 *
 * @param change - Measurement change
 * @returns CSS color value
 */
export function getChangeColor(change: MeasurementChange): string {
	if (change.direction === 'stable') return 'var(--gray-500)';
	return change.isPositive ? 'var(--success-500)' : 'var(--error-500)';
}

/**
 * Get change icon
 *
 * @param direction - Change direction
 * @returns Icon name
 */
export function getChangeIcon(direction: MeasurementChange['direction']): string {
	switch (direction) {
		case 'increase':
			return 'arrowUp';
		case 'decrease':
			return 'arrowDown';
		default:
			return 'minus';
	}
}
