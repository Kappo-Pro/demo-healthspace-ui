/**
 * Unit Tests: Segment Calculations
 *
 * @module utils/bodyMeasurement/__tests__/segments.test
 */

import {
	calculateSegment,
	shoulderWidth,
	armSpan,
	legLength,
	torsoLength,
	upperArmLength,
	forearmLength,
	thighLength,
	calfLength,
	headToToe,
	hipWidth,
} from '../segments';

describe('Segment Calculations', () => {
	describe('calculateSegment', () => {
		it('calculates segment length accurately', () => {
			const landmark1 = { x: 0, y: 100, z: 0, visibility: 1 };
			const landmark2 = { x: 40, y: 100, z: 0, visibility: 1 };
			const pixelsPerCm = 2; // 2 pixels = 1cm

			const result = calculateSegment(landmark1, landmark2, pixelsPerCm);

			expect(result.lengthPx).toBe(40); // 40 pixels
			expect(result.lengthCm).toBe(20); // 40 / 2 = 20cm
			expect(result.confidence).toBe(1);
		});

		it('propagates confidence from landmark visibility', () => {
			const landmark1 = { x: 0, y: 0, z: 0, visibility: 0.9 };
			const landmark2 = { x: 10, y: 0, z: 0, visibility: 0.8 };
			const pixelsPerCm = 2;

			const result = calculateSegment(landmark1, landmark2, pixelsPerCm);

			expect(result.confidence).toBe(0.8); // Min of 0.9 and 0.8
		});

		it('uses custom segment name', () => {
			const landmark1 = { x: 0, y: 0, z: 0, visibility: 1 };
			const landmark2 = { x: 10, y: 0, z: 0, visibility: 1 };
			const pixelsPerCm = 2;

			const result = calculateSegment(landmark1, landmark2, pixelsPerCm, 'test-segment');

			expect(result.segment).toBe('test-segment');
		});

		it('defaults to "generic" segment name', () => {
			const landmark1 = { x: 0, y: 0, z: 0, visibility: 1 };
			const landmark2 = { x: 10, y: 0, z: 0, visibility: 1 };
			const pixelsPerCm = 2;

			const result = calculateSegment(landmark1, landmark2, pixelsPerCm);

			expect(result.segment).toBe('generic');
		});
	});

	describe('shoulderWidth', () => {
		it('calculates shoulder width correctly', () => {
			const leftShoulder = { x: 0, y: 100, z: 0, visibility: 1 };
			const rightShoulder = { x: 40, y: 100, z: 0, visibility: 1 };
			const pixelsPerCm = 2;

			const result = shoulderWidth(leftShoulder, rightShoulder, pixelsPerCm);

			expect(result.segment).toBe('shoulder-width');
			expect(result.lengthCm).toBe(20);
			expect(result.confidence).toBe(1);
		});

		it('handles 3D shoulder positions', () => {
			const leftShoulder = { x: 0, y: 100, z: 0, visibility: 0.95 };
			const rightShoulder = { x: 30, y: 100, z: 10, visibility: 0.9 };
			const pixelsPerCm = 2;

			const result = shoulderWidth(leftShoulder, rightShoulder, pixelsPerCm);

			expect(result.lengthPx).toBeCloseTo(31.62, 1); // sqrt(30² + 10²)
			expect(result.confidence).toBe(0.9);
		});
	});

	describe('armSpan', () => {
		it('calculates arm span correctly', () => {
			const leftWrist = { x: 0, y: 100, z: 0, visibility: 1 };
			const rightWrist = { x: 170, y: 100, z: 0, visibility: 1 };
			const pixelsPerCm = 1; // 1 pixel = 1cm

			const result = armSpan(leftWrist, rightWrist, pixelsPerCm);

			expect(result.segment).toBe('arm-span');
			expect(result.lengthCm).toBe(170);
		});
	});

	describe('legLength', () => {
		it('calculates leg length correctly', () => {
			const hip = { x: 100, y: 0, z: 0, visibility: 1 };
			const ankle = { x: 100, y: 90, z: 0, visibility: 1 };
			const pixelsPerCm = 1;

			const result = legLength(hip, ankle, pixelsPerCm);

			expect(result.segment).toBe('leg-length');
			expect(result.lengthCm).toBe(90);
		});
	});

	describe('torsoLength', () => {
		it('calculates torso length correctly', () => {
			const shoulderMid = { x: 100, y: 0, z: 0, visibility: 1 };
			const hipMid = { x: 100, y: 60, z: 0, visibility: 1 };
			const pixelsPerCm = 1;

			const result = torsoLength(shoulderMid, hipMid, pixelsPerCm);

			expect(result.segment).toBe('torso-length');
			expect(result.lengthCm).toBe(60);
		});
	});

	describe('upperArmLength', () => {
		it('calculates upper arm length correctly', () => {
			const shoulder = { x: 0, y: 0, z: 0, visibility: 1 };
			const elbow = { x: 0, y: 30, z: 0, visibility: 1 };
			const pixelsPerCm = 1;

			const result = upperArmLength(shoulder, elbow, pixelsPerCm);

			expect(result.segment).toBe('upper-arm-length');
			expect(result.lengthCm).toBe(30);
		});
	});

	describe('forearmLength', () => {
		it('calculates forearm length correctly', () => {
			const elbow = { x: 0, y: 30, z: 0, visibility: 1 };
			const wrist = { x: 0, y: 55, z: 0, visibility: 1 };
			const pixelsPerCm = 1;

			const result = forearmLength(elbow, wrist, pixelsPerCm);

			expect(result.segment).toBe('forearm-length');
			expect(result.lengthCm).toBe(25);
		});
	});

	describe('thighLength', () => {
		it('calculates thigh length correctly', () => {
			const hip = { x: 100, y: 0, z: 0, visibility: 1 };
			const knee = { x: 100, y: 45, z: 0, visibility: 1 };
			const pixelsPerCm = 1;

			const result = thighLength(hip, knee, pixelsPerCm);

			expect(result.segment).toBe('thigh-length');
			expect(result.lengthCm).toBe(45);
		});
	});

	describe('calfLength', () => {
		it('calculates calf length correctly', () => {
			const knee = { x: 100, y: 45, z: 0, visibility: 1 };
			const ankle = { x: 100, y: 85, z: 0, visibility: 1 };
			const pixelsPerCm = 1;

			const result = calfLength(knee, ankle, pixelsPerCm);

			expect(result.segment).toBe('calf-length');
			expect(result.lengthCm).toBe(40);
		});
	});

	describe('headToToe', () => {
		it('calculates full body height correctly', () => {
			const nose = { x: 100, y: 0, z: 0, visibility: 1 };
			const ankle = { x: 100, y: 175, z: 0, visibility: 1 };
			const pixelsPerCm = 1;

			const result = headToToe(nose, ankle, pixelsPerCm);

			expect(result.segment).toBe('head-to-toe');
			expect(result.lengthCm).toBe(175);
		});
	});

	describe('hipWidth', () => {
		it('calculates hip width correctly', () => {
			const leftHip = { x: 80, y: 100, z: 0, visibility: 1 };
			const rightHip = { x: 120, y: 100, z: 0, visibility: 1 };
			const pixelsPerCm = 1;

			const result = hipWidth(leftHip, rightHip, pixelsPerCm);

			expect(result.segment).toBe('hip-width');
			expect(result.lengthCm).toBe(40);
		});
	});

	describe('confidence propagation', () => {
		it('uses minimum visibility as confidence', () => {
			const highVis = { x: 0, y: 0, z: 0, visibility: 0.95 };
			const lowVis = { x: 10, y: 0, z: 0, visibility: 0.65 };
			const pixelsPerCm = 1;

			const result = calculateSegment(highVis, lowVis, pixelsPerCm);

			expect(result.confidence).toBe(0.65);
		});

		it('defaults to 1.0 if visibility undefined', () => {
			const landmark1 = { x: 0, y: 0, z: 0 };
			const landmark2 = { x: 10, y: 0, z: 0 };
			const pixelsPerCm = 1;

			const result = calculateSegment(landmark1, landmark2, pixelsPerCm);

			expect(result.confidence).toBe(1.0);
		});
	});
});
