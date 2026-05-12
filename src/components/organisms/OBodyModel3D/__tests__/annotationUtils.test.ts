/**
 * Annotation Utilities Tests
 *
 * Test suite for annotation positioning, comparison calculations,
 * and report generation utilities.
 *
 * @module organisms/OBodyModel3D/__tests__
 * @since EPIC-001-S13
 */

import {
	createAnnotationsFromMeasurements,
	calculateComparison,
	generateComparisonReport,
	getChangeColor,
	getChangeIcon,
} from '../utils/annotationUtils';
import type { BodyMeasurementResult } from '@utils/bodyMeasurement';
import type { MeasurementChange } from '../types/annotations';

// Mock measurement result
const mockMeasurementResult: BodyMeasurementResult = {
	measurements: {
		segments: [
			{
				segment: 'torso-length',
				lengthCm: 60,
				confidence: 0.95,
			},
			{
				segment: 'upper-arm-length',
				lengthCm: 30,
				confidence: 0.9,
			},
		],
		circumferences: [
			{
				bodyPart: 'chest',
				circumferenceCm: 90,
				confidence: 0.92,
			},
			{
				bodyPart: 'waist',
				circumferenceCm: 75,
				confidence: 0.88,
			},
		],
		ratios: [],
		symmetry: [],
	},
	calibration: {
		pixelsPerCm: 10,
		confidence: 0.9,
		noseToAnklePixels: 1000,
		userHeightCm: 175,
		imageHeight: 720,
	},
	metadata: {
		timestamp: '2025-01-01T00:00:00Z',
		processingTime: 100,
		totalMeasurements: 4,
		averageConfidence: 0.91,
		symmetryScore: 95,
	},
	qualityFlags: {
		calibrationValid: true,
		allLandmarksVisible: true,
		lowConfidenceCount: 0,
	},
};

describe('createAnnotationsFromMeasurements', () => {
	it('should create annotations from measurement result', () => {
		const annotations = createAnnotationsFromMeasurements(mockMeasurementResult);

		expect(annotations.length).toBeGreaterThan(0);
		expect(annotations[0]).toHaveProperty('id');
		expect(annotations[0]).toHaveProperty('label');
		expect(annotations[0]).toHaveProperty('value');
		expect(annotations[0]).toHaveProperty('unit');
		expect(annotations[0]).toHaveProperty('confidence');
		expect(annotations[0]).toHaveProperty('position');
		expect(annotations[0]).toHaveProperty('bodyPart');
		expect(annotations[0]).toHaveProperty('type');
	});

	it('should include segment annotations', () => {
		const annotations = createAnnotationsFromMeasurements(mockMeasurementResult);
		const segmentAnnotations = annotations.filter(a => a.type === 'segment');

		expect(segmentAnnotations.length).toBeGreaterThan(0);
	});

	it('should include circumference annotations', () => {
		const annotations = createAnnotationsFromMeasurements(mockMeasurementResult);
		const circumferenceAnnotations = annotations.filter(a => a.type === 'circumference');

		expect(circumferenceAnnotations.length).toBeGreaterThan(0);
	});

	it('should have valid 3D positions', () => {
		const annotations = createAnnotationsFromMeasurements(mockMeasurementResult);

		annotations.forEach(annotation => {
			expect(annotation.position).toHaveProperty('x');
			expect(annotation.position).toHaveProperty('y');
			expect(annotation.position).toHaveProperty('z');
			expect(typeof annotation.position.x).toBe('number');
			expect(typeof annotation.position.y).toBe('number');
			expect(typeof annotation.position.z).toBe('number');
		});
	});
});

describe('calculateComparison', () => {
	const beforeMeasurement: BodyMeasurementResult = {
		...mockMeasurementResult,
		metadata: {
			...mockMeasurementResult.metadata,
			timestamp: '2025-01-01T00:00:00Z',
		},
		measurements: {
			segments: [
				{
					segment: 'torso-length',
					lengthCm: 60,
					confidence: 0.95,
				},
			],
			circumferences: [
				{
					bodyPart: 'waist',
					circumferenceCm: 80,
					confidence: 0.9,
				},
			],
			ratios: [],
			symmetry: [],
		},
	};

	const afterMeasurement: BodyMeasurementResult = {
		...mockMeasurementResult,
		metadata: {
			...mockMeasurementResult.metadata,
			timestamp: '2025-01-15T00:00:00Z',
		},
		measurements: {
			segments: [
				{
					segment: 'torso-length',
					lengthCm: 62,
					confidence: 0.95,
				},
			],
			circumferences: [
				{
					bodyPart: 'waist',
					circumferenceCm: 75,
					confidence: 0.9,
				},
			],
			ratios: [],
			symmetry: [],
		},
	};

	it('should calculate comparison data', () => {
		const comparison = calculateComparison(beforeMeasurement, afterMeasurement);

		expect(comparison).toHaveProperty('id');
		expect(comparison).toHaveProperty('before');
		expect(comparison).toHaveProperty('after');
		expect(comparison).toHaveProperty('daysBetween');
		expect(comparison).toHaveProperty('overallChange');
		expect(comparison).toHaveProperty('changes');
	});

	it('should calculate days between measurements', () => {
		const comparison = calculateComparison(beforeMeasurement, afterMeasurement);

		expect(comparison.daysBetween).toBe(14);
	});

	it('should calculate measurement changes', () => {
		const comparison = calculateComparison(beforeMeasurement, afterMeasurement);

		expect(comparison.changes.length).toBeGreaterThan(0);

		const torsoChange = comparison.changes.find(c => c.id === 'torso-length');
		expect(torsoChange).toBeDefined();
		expect(torsoChange?.beforeValue).toBe(60);
		expect(torsoChange?.afterValue).toBe(62);
		expect(torsoChange?.absoluteChange).toBe(2);
		expect(torsoChange?.direction).toBe('increase');
	});

	it('should identify positive changes correctly', () => {
		const comparison = calculateComparison(beforeMeasurement, afterMeasurement);

		// Segment increase = positive (muscle growth)
		const torsoChange = comparison.changes.find(c => c.id === 'torso-length');
		expect(torsoChange?.isPositive).toBe(true);

		// Waist circumference decrease = positive (fat loss)
		const waistChange = comparison.changes.find(c => c.id === 'waist');
		expect(waistChange?.isPositive).toBe(true);
	});

	it('should calculate percent change', () => {
		const comparison = calculateComparison(beforeMeasurement, afterMeasurement);

		const torsoChange = comparison.changes.find(c => c.id === 'torso-length');
		expect(torsoChange?.percentChange).toBeCloseTo(3.33, 1); // (2/60) * 100
	});
});

describe('generateComparisonReport', () => {
	const beforeMeasurement: BodyMeasurementResult = mockMeasurementResult;
	const afterMeasurement: BodyMeasurementResult = {
		...mockMeasurementResult,
		metadata: {
			...mockMeasurementResult.metadata,
			timestamp: '2025-01-15T00:00:00Z',
		},
	};

	const comparison = calculateComparison(beforeMeasurement, afterMeasurement);

	it('should generate comparison report', () => {
		const report = generateComparisonReport(comparison, 'user-123');

		expect(report).toHaveProperty('title');
		expect(report).toHaveProperty('exportDate');
		expect(report).toHaveProperty('userId');
		expect(report).toHaveProperty('comparison');
		expect(report).toHaveProperty('summary');
		expect(report).toHaveProperty('version');
	});

	it('should include summary statistics', () => {
		const report = generateComparisonReport(comparison);

		expect(report.summary).toHaveProperty('totalMeasurements');
		expect(report.summary).toHaveProperty('improvementCount');
		expect(report.summary).toHaveProperty('regressionCount');
		expect(report.summary).toHaveProperty('stableCount');

		const total =
			report.summary.improvementCount +
			report.summary.regressionCount +
			report.summary.stableCount;
		expect(total).toBe(report.summary.totalMeasurements);
	});

	it('should use version 1.0', () => {
		const report = generateComparisonReport(comparison);

		expect(report.version).toBe('1.0');
	});
});

describe('getChangeColor', () => {
	it('should return success color for positive changes', () => {
		const change: MeasurementChange = {
			id: 'test',
			label: 'Test',
			beforeValue: 100,
			afterValue: 105,
			unit: 'cm',
			absoluteChange: 5,
			percentChange: 5,
			direction: 'increase',
			isPositive: true,
		};

		const color = getChangeColor(change);
		expect(color).toBe('var(--success-500)');
	});

	it('should return error color for negative changes', () => {
		const change: MeasurementChange = {
			id: 'test',
			label: 'Test',
			beforeValue: 100,
			afterValue: 95,
			unit: 'cm',
			absoluteChange: -5,
			percentChange: -5,
			direction: 'decrease',
			isPositive: false,
		};

		const color = getChangeColor(change);
		expect(color).toBe('var(--error-500)');
	});

	it('should return gray color for stable changes', () => {
		const change: MeasurementChange = {
			id: 'test',
			label: 'Test',
			beforeValue: 100,
			afterValue: 100,
			unit: 'cm',
			absoluteChange: 0,
			percentChange: 0,
			direction: 'stable',
			isPositive: false,
		};

		const color = getChangeColor(change);
		expect(color).toBe('var(--gray-500)');
	});
});

describe('getChangeIcon', () => {
	it('should return arrowUp for increase', () => {
		const icon = getChangeIcon('increase');
		expect(icon).toBe('arrowUp');
	});

	it('should return arrowDown for decrease', () => {
		const icon = getChangeIcon('decrease');
		expect(icon).toBe('arrowDown');
	});

	it('should return minus for stable', () => {
		const icon = getChangeIcon('stable');
		expect(icon).toBe('minus');
	});
});
