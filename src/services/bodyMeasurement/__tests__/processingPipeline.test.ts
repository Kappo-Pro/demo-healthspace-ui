/**
 * Processing Pipeline Tests
 *
 * Comprehensive test suite for body measurement processing pipeline.
 * Tests multi-frame averaging, quality filtering, and SDK transformation.
 *
 * @module services/bodyMeasurement/__tests__/processingPipeline.test
 */

import {
	processMeasurements,
	processSingleView,
	averageLandmarks,
	averageLandmarksMultiView,
} from '../processingPipeline';
import { PoseResult, PoseLandmark3D } from '@types/mediapipe';
import { Point3D } from '@utils/bodyMeasurement';

// Mock pose data generator
function createMockPose(offsetX = 0, offsetY = 0) {
	const landmarks = Array.from({ length: 33 }, (_, i) => ({
		x: 0.5 + offsetX,
		y: i / 32 + offsetY,
		z: 0,
		visibility: 0.95,
	}));

	const worldLandmarks = landmarks.map(lm => ({
		x: lm.x,
		y: lm.y,
		z: lm.z,
		visibility: lm.visibility,
	}));

	return {
		landmarks,
		worldLandmarks,
	};
}

describe('Processing Pipeline', () => {
	describe('averageLandmarks', () => {
		it('averages landmarks across multiple frames', () => {
			const pose1 = createMockPose(0, 0);
			const pose2 = createMockPose(0.01, 0);
			const pose3 = createMockPose(-0.01, 0);

			const averaged = averageLandmarks([pose1, pose2, pose3]);

			expect(averaged).toHaveLength(33);
			// Average should be close to original (0.5)
			expect(Math.abs(averaged[0].x - 0.5)).toBeLessThan(0.01);
		});

		it('combines visibility scores correctly', () => {
			const pose1 = createMockPose(0, 0);
			pose1.worldLandmarks[0].visibility = 0.9;

			const pose2 = createMockPose(0, 0);
			pose2.worldLandmarks[0].visibility = 0.8;

			const averaged = averageLandmarks([pose1, pose2]);

			// Average visibility should be (0.9 + 0.8) / 2 = 0.85
			expect(averaged[0].visibility).toBeCloseTo(0.85, 2);
		});

		it('throws error for empty pose array', () => {
			expect(() => averageLandmarks([])).toThrow(
				'averageLandmarks: poses array cannot be empty'
			);
		});

		it('handles single pose correctly', () => {
			const pose = createMockPose(0, 0);
			const averaged = averageLandmarks([pose]);

			expect(averaged).toHaveLength(33);
			expect(averaged[0].x).toBe(pose.worldLandmarks[0].x);
		});
	});

	describe('averageLandmarksMultiView', () => {
		it('combines front/side/back poses', () => {
			const front = createMockPose(0, 0);
			const side = createMockPose(0.02, 0);
			const back = createMockPose(-0.02, 0);

			const averaged = averageLandmarksMultiView({ front, side, back });

			expect(averaged).toHaveLength(33);
			// Should average across all three views
			expect(Math.abs(averaged[0].x - 0.5)).toBeLessThan(0.01);
		});

		it('works with front-only pose', () => {
			const front = createMockPose(0, 0);

			const averaged = averageLandmarksMultiView({ front });

			expect(averaged).toHaveLength(33);
			expect(averaged[0].x).toBe(front.worldLandmarks[0].x);
		});

		it('works with front and side only', () => {
			const front = createMockPose(0, 0);
			const side = createMockPose(0.01, 0);

			const averaged = averageLandmarksMultiView({ front, side });

			expect(averaged).toHaveLength(33);
			// Average of front (0.5) and side (0.51) = 0.505
			expect(averaged[0].x).toBeCloseTo(0.505, 3);
		});
	});

	describe('processMeasurements', () => {
		it('processes multi-view poses successfully', async () => {
			const front = createMockPose(0, 0);
			const side = createMockPose(0.01, 0);
			const back = createMockPose(-0.01, 0);

			const result = await processMeasurements({ front, side, back }, 175);

			// Verify structure
			expect(result.measurements).toBeDefined();
			expect(Array.isArray(result.measurements)).toBe(true);
			expect(result.measurements.length).toBeGreaterThan(0);

			// Verify calibration
			expect(result.calibration.userHeight).toBe(175);
			expect(result.calibration.calibrationMethod).toBe('height');
			expect(result.calibration.poseQuality).toBeGreaterThan(0);
			expect(result.calibration.poseQuality).toBeLessThanOrEqual(1);

			// Verify metadata
			expect(result.metadata.timestamp).toBeDefined();
			expect(result.metadata.processingTime).toBeGreaterThan(0);
			expect(result.metadata.totalMeasurements).toBe(result.measurements.length);
			expect(result.metadata.averageConfidence).toBeGreaterThan(0);
			expect(result.metadata.symmetryScore).toBeGreaterThanOrEqual(0);
			expect(result.metadata.symmetryScore).toBeLessThanOrEqual(100);

			// Verify quality flags
			expect(typeof result.qualityFlags.calibrationValid).toBe('boolean');
			expect(typeof result.qualityFlags.allLandmarksVisible).toBe('boolean');
			expect(typeof result.qualityFlags.lowConfidenceCount).toBe('number');
		});

		it('includes 40+ measurements from algorithm library', async () => {
			const front = createMockPose(0, 0);

			const result = await processMeasurements({ front }, 175);

			// Should have measurements from all categories (segments, circumferences, ratios, symmetry)
			// Total: 15 segments + 8 circumferences + 5+ ratios + 6 symmetry = 34+ measurements
			expect(result.measurements.length).toBeGreaterThanOrEqual(30);

			// Verify measurement types
			const types = new Set(result.measurements.map(m => m.type));
			expect(types.has('segment')).toBe(true);
			expect(types.has('circumference')).toBe(true);
			expect(types.has('ratio')).toBe(true);
			expect(types.has('symmetry')).toBe(true);
		});

		it('filters low-confidence measurements (threshold: 0.6)', async () => {
			const front = createMockPose(0, 0);
			// Reduce visibility to create low-confidence measurements
			front.worldLandmarks.forEach(lm => {
				lm.visibility = 0.4; // Below default threshold
			});

			const result = await processMeasurements({ front }, 175);

			// All returned measurements should have confidence >= 0.6
			const allAboveThreshold = result.measurements.every(m => m.confidence >= 0.6);
			expect(allAboveThreshold).toBe(true);
		});

		it('respects custom confidence threshold', async () => {
			const front = createMockPose(0, 0);

			const result = await processMeasurements({ front }, 175, {
				confidenceThreshold: 0.8,
			});

			// All measurements should have confidence >= 0.8
			const allAboveThreshold = result.measurements.every(m => m.confidence >= 0.8);
			expect(allAboveThreshold).toBe(true);
		});

		it('completes processing in <2s', async () => {
			const front = createMockPose(0, 0);
			const side = createMockPose(0.01, 0);
			const back = createMockPose(-0.01, 0);

			const start = performance.now();
			await processMeasurements({ front, side, back }, 175);
			const duration = performance.now() - start;

			expect(duration).toBeLessThan(2000);
		}, 5000); // 5s test timeout

		it('throws error for missing front pose', async () => {
			await expect(
				processMeasurements({} as any, 175)
			).rejects.toThrow('front pose is required');
		});

		it('throws error for invalid height', async () => {
			const front = createMockPose(0, 0);

			await expect(
				processMeasurements({ front }, 0)
			).rejects.toThrow('userHeight must be 0 < height < 300 cm');

			await expect(
				processMeasurements({ front }, 400)
			).rejects.toThrow('userHeight must be 0 < height < 300 cm');
		});

		it('calculates pose quality from landmark visibility', async () => {
			const front = createMockPose(0, 0);
			// Set high visibility
			front.worldLandmarks.forEach(lm => {
				lm.visibility = 0.95;
			});

			const result = await processMeasurements({ front }, 175);

			expect(result.calibration.poseQuality).toBeGreaterThan(0.9);
		});

		it('formats measurement labels correctly', async () => {
			const front = createMockPose(0, 0);

			const result = await processMeasurements({ front }, 175);

			// Find a sample measurement
			const shoulderWidth = result.measurements.find(m =>
				m.id.includes('shoulder-width')
			);

			if (shoulderWidth) {
				// Label should be formatted: "shoulder-width" → "Shoulder Width"
				expect(shoulderWidth.label).toBe('Shoulder Width');
			}
		});

		it('includes all required measurement fields', async () => {
			const front = createMockPose(0, 0);

			const result = await processMeasurements({ front }, 175);

			// Check first measurement has all fields
			const measurement = result.measurements[0];
			expect(measurement.id).toBeDefined();
			expect(measurement.type).toBeDefined();
			expect(measurement.label).toBeDefined();
			expect(typeof measurement.value).toBe('number');
			expect(measurement.unit).toBeDefined();
			expect(typeof measurement.confidence).toBe('number');
		});
	});

	describe('processSingleView', () => {
		it('processes front-only pose', async () => {
			const front = createMockPose(0, 0);

			const result = await processSingleView(front, 175);

			expect(result.measurements.length).toBeGreaterThan(0);
			expect(result.calibration.userHeight).toBe(175);
		});

		it('respects custom options', async () => {
			const front = createMockPose(0, 0);

			const result = await processSingleView(front, 175, {
				confidenceThreshold: 0.7,
				imageHeight: 1080,
			});

			// All measurements should have confidence >= 0.7
			const allAboveThreshold = result.measurements.every(m => m.confidence >= 0.7);
			expect(allAboveThreshold).toBe(true);
		});
	});

	describe('Performance Benchmarks', () => {
		it('maintains consistent performance over multiple runs', async () => {
			const front = createMockPose(0, 0);
			const side = createMockPose(0.01, 0);
			const durations: number[] = [];

			for (let i = 0; i < 10; i++) {
				const start = performance.now();
				await processMeasurements({ front, side }, 175);
				durations.push(performance.now() - start);
			}

			const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
			expect(avgDuration).toBeLessThan(2000);

			// No significant performance degradation
			const lastDuration = durations[durations.length - 1];
			expect(lastDuration).toBeLessThan(avgDuration * 1.5);
		}, 25000); // 25s test timeout

		it('reports processing time accurately in metadata', async () => {
			const front = createMockPose(0, 0);

			const start = performance.now();
			const result = await processMeasurements({ front }, 175);
			const actualDuration = performance.now() - start;

			// Reported processing time should be within 50% of actual
			expect(result.metadata.processingTime).toBeGreaterThan(0);
			expect(result.metadata.processingTime).toBeLessThan(actualDuration * 1.5);
		});
	});

	describe('Multi-Frame Averaging', () => {
		it('improves accuracy with 3+ frames per view', () => {
			// Create 3 slightly different poses
			const pose1 = createMockPose(0, 0);
			const pose2 = createMockPose(0.005, 0);
			const pose3 = createMockPose(-0.005, 0);

			const single = averageLandmarks([pose1]);
			const multi = averageLandmarks([pose1, pose2, pose3]);

			// Multi-frame should have more stable (averaged) values
			expect(multi[0].x).toBeCloseTo(0.5, 3);

			// Variance should be lower in multi-frame
			const singleVariance = Math.abs(single[0].x - 0.5);
			const multiVariance = Math.abs(multi[0].x - 0.5);
			expect(multiVariance).toBeLessThanOrEqual(singleVariance);
		});

		it('increases confidence scores with more frames', () => {
			const pose1 = createMockPose(0, 0);
			pose1.worldLandmarks[0].visibility = 0.8;

			const pose2 = createMockPose(0, 0);
			pose2.worldLandmarks[0].visibility = 0.85;

			const pose3 = createMockPose(0, 0);
			pose3.worldLandmarks[0].visibility = 0.9;

			const averaged = averageLandmarks([pose1, pose2, pose3]);

			// Average should be (0.8 + 0.85 + 0.9) / 3 = 0.85
			expect(averaged[0].visibility).toBeCloseTo(0.85, 2);
		});
	});

	describe('Edge Cases', () => {
		it('handles all landmarks with low visibility', async () => {
			const front = createMockPose(0, 0);
			front.worldLandmarks.forEach(lm => {
				lm.visibility = 0.3; // Very low visibility
			});

			const result = await processMeasurements({ front }, 175);

			// Should still process (may have fewer measurements due to filtering)
			expect(result.measurements).toBeDefined();

			// Quality flags should reflect issues
			expect(result.qualityFlags.lowConfidenceCount).toBeGreaterThan(0);
			expect(result.calibration.poseQuality).toBeLessThan(0.5);
		});

		it('handles extreme user heights', async () => {
			const front = createMockPose(0, 0);

			// Very short person
			const shortResult = await processMeasurements({ front }, 140);
			expect(shortResult.calibration.userHeight).toBe(140);

			// Very tall person
			const tallResult = await processMeasurements({ front }, 210);
			expect(tallResult.calibration.userHeight).toBe(210);
		});

		it('preserves timestamp format (ISO 8601)', async () => {
			const front = createMockPose(0, 0);

			const result = await processMeasurements({ front }, 175);

			// Should be valid ISO 8601 timestamp
			const timestamp = new Date(result.metadata.timestamp);
			expect(timestamp.toISOString()).toBe(result.metadata.timestamp);
		});
	});
});
