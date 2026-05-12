/**
 * Integration Tests: Full Measurement Suite
 *
 * Tests complete measurement calculation pipeline with ground truth data.
 *
 * @module utils/bodyMeasurement/__tests__/integration.test
 */

import { calculateAllMeasurements } from '../index';
import { Point3D } from '../geometry';
import groundTruthData from './fixtures/groundTruth.json';

describe('Body Measurement Integration Tests', () => {
	describe('calculateAllMeasurements', () => {
		it('processes full measurement suite successfully', () => {
			const sample = groundTruthData[0];
			const landmarks = sample.landmarks as Point3D[];

			const result = calculateAllMeasurements(landmarks, sample.height);

			// Verify structure
			expect(result.measurements.segments).toHaveLength(15);
			expect(result.measurements.circumferences).toHaveLength(8);
			expect(result.measurements.ratios.length).toBeGreaterThan(0);
			expect(result.measurements.symmetry).toHaveLength(6);

			// Verify metadata
			expect(result.metadata.totalMeasurements).toBeGreaterThan(0);
			expect(result.metadata.processingTime).toBeGreaterThan(0);
			expect(result.metadata.averageConfidence).toBeGreaterThan(0);
			expect(result.metadata.symmetryScore).toBeGreaterThanOrEqual(0);
			expect(result.metadata.symmetryScore).toBeLessThanOrEqual(100);

			// Verify calibration
			expect(result.calibration.pixelsPerCm).toBeGreaterThan(0);
			expect(result.calibration.confidence).toBeGreaterThan(0);

			// Verify quality flags
			expect(result.qualityFlags.calibrationValid).toBe(true);
			expect(typeof result.qualityFlags.allLandmarksVisible).toBe('boolean');
			expect(typeof result.qualityFlags.lowConfidenceCount).toBe('number');
		});

		it('achieves acceptable accuracy vs ground truth', () => {
			const sample = groundTruthData[0];
			const landmarks = sample.landmarks as Point3D[];
			const groundTruth = sample.groundTruth;

			const result = calculateAllMeasurements(landmarks, sample.height);

			// Find specific measurements
			const shoulderWidth = result.measurements.segments.find(
				s => s.segment === 'shoulder-width'
			);
			const armSpan = result.measurements.segments.find(s => s.segment === 'arm-span');
			const legLength = result.measurements.segments.find(s => s.segment === 'leg-length');
			const torsoLength = result.measurements.segments.find(
				s => s.segment === 'torso-length'
			);
			const chestCirc = result.measurements.circumferences.find(
				c => c.bodyPart === 'chest'
			);
			const waistCirc = result.measurements.circumferences.find(
				c => c.bodyPart === 'waist'
			);

			// Validate against ground truth (within tolerance)
			if (shoulderWidth && groundTruth.shoulderWidth) {
				const error = Math.abs(
					shoulderWidth.lengthCm - groundTruth.shoulderWidth.expected
				);
				expect(error).toBeLessThan(groundTruth.shoulderWidth.tolerance);
			}

			if (armSpan && groundTruth.armSpan) {
				const error = Math.abs(armSpan.lengthCm - groundTruth.armSpan.expected);
				expect(error).toBeLessThan(groundTruth.armSpan.tolerance);
			}

			if (legLength && groundTruth.legLength) {
				const error = Math.abs(legLength.lengthCm - groundTruth.legLength.expected);
				expect(error).toBeLessThan(groundTruth.legLength.tolerance);
			}

			if (torsoLength && groundTruth.torsoLength) {
				const error = Math.abs(torsoLength.lengthCm - groundTruth.torsoLength.expected);
				expect(error).toBeLessThan(groundTruth.torsoLength.tolerance);
			}

			if (chestCirc && groundTruth.chestCircumference) {
				const error = Math.abs(
					chestCirc.circumferenceCm - groundTruth.chestCircumference.expected
				);
				expect(error).toBeLessThan(groundTruth.chestCircumference.tolerance);
			}

			if (waistCirc && groundTruth.waistCircumference) {
				const error = Math.abs(
					waistCirc.circumferenceCm - groundTruth.waistCircumference.expected
				);
				expect(error).toBeLessThan(groundTruth.waistCircumference.tolerance);
			}
		});

		it('throws error for invalid landmark count', () => {
			const invalidLandmarks = [
				{ x: 0, y: 0, z: 0, visibility: 1 },
			] as Point3D[];

			expect(() => calculateAllMeasurements(invalidLandmarks, 175)).toThrow(
				'Invalid landmarks: expected 33 BlazePose GHUM landmarks'
			);
		});

		it('throws error for invalid height', () => {
			const sample = groundTruthData[0];
			const landmarks = sample.landmarks as Point3D[];

			expect(() => calculateAllMeasurements(landmarks, 0)).toThrow(
				'Invalid userHeight'
			);
			expect(() => calculateAllMeasurements(landmarks, 400)).toThrow(
				'Invalid userHeight'
			);
		});

		it('handles low visibility landmarks gracefully', () => {
			const sample = groundTruthData[0];
			const landmarks = sample.landmarks.map(lm => ({
				...lm,
				visibility: 0.3, // Low visibility
			})) as Point3D[];

			const result = calculateAllMeasurements(landmarks, sample.height);

			// Should still process
			expect(result.measurements.segments.length).toBeGreaterThan(0);

			// But confidence should be low
			expect(result.metadata.averageConfidence).toBeLessThan(0.5);

			// Quality flags should reflect issues
			expect(result.qualityFlags.lowConfidenceCount).toBeGreaterThan(0);
		});
	});

	describe('Performance Benchmarks', () => {
		it('processes full measurement suite in <100ms', () => {
			const sample = groundTruthData[0];
			const landmarks = sample.landmarks as Point3D[];

			const start = performance.now();
			calculateAllMeasurements(landmarks, sample.height);
			const duration = performance.now() - start;

			expect(duration).toBeLessThan(100);
		});

		it('maintains performance over multiple runs', () => {
			const sample = groundTruthData[0];
			const landmarks = sample.landmarks as Point3D[];
			const runs = 10;
			const durations: number[] = [];

			for (let i = 0; i < runs; i++) {
				const start = performance.now();
				calculateAllMeasurements(landmarks, sample.height);
				durations.push(performance.now() - start);
			}

			const avgDuration = durations.reduce((a, b) => a + b, 0) / runs;
			expect(avgDuration).toBeLessThan(100);

			// No significant performance degradation
			const lastDuration = durations[runs - 1];
			expect(lastDuration).toBeLessThan(avgDuration * 1.5);
		});
	});

	describe('Edge Cases', () => {
		it('handles symmetrical pose correctly', () => {
			// Create perfectly symmetrical landmarks
			const symmetricalLandmarks = Array.from({ length: 33 }, (_, i) => ({
				x: 0.5,
				y: i / 32,
				z: 0,
				visibility: 1,
			})) as Point3D[];

			const result = calculateAllMeasurements(symmetricalLandmarks, 175);

			// Symmetry score should be high (near 100)
			expect(result.metadata.symmetryScore).toBeGreaterThan(90);
		});

		it('detects asymmetry in pose', () => {
			const sample = groundTruthData[0];
			const asymmetricalLandmarks = sample.landmarks.map((lm, i) => {
				// Make left side higher than right
				if (i >= 11 && i <= 22 && i % 2 === 1) {
					return { ...lm, y: lm.y - 0.05 }; // Shift left landmarks up
				}
				return lm;
			}) as Point3D[];

			const result = calculateAllMeasurements(asymmetricalLandmarks, sample.height);

			// Symmetry score should be lower
			expect(result.metadata.symmetryScore).toBeLessThan(90);

			// Symmetry measurements should show imbalance
			const hasImbalance = result.measurements.symmetry.some(
				sym => !sym.isBalanced
			);
			expect(hasImbalance).toBe(true);
		});
	});
});
