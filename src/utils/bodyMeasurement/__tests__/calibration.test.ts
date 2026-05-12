/**
 * Unit Tests: Calibration Utilities
 *
 * @module utils/bodyMeasurement/__tests__/calibration.test
 */

import {
	calculatePixelsPerCm,
	pixelsToCm,
	cmToPixels,
	calibrateFromLandmarks,
	metersToCm,
	isCalibrationValid,
	estimateCameraDistance,
	CalibrationParams,
} from '../calibration';

describe('Calibration Utilities', () => {
	describe('calculatePixelsPerCm', () => {
		it('calculates pixels-per-cm ratio correctly', () => {
			const params: CalibrationParams = {
				userHeight: 175, // 175cm tall
				imageHeight: 720,
				headToToePixels: 600, // 600 pixels tall in image
			};
			expect(calculatePixelsPerCm(params)).toBeCloseTo(3.43, 2); // 600/175
		});

		it('throws error for invalid height', () => {
			const params: CalibrationParams = {
				userHeight: 0,
				imageHeight: 720,
				headToToePixels: 600,
			};
			expect(() => calculatePixelsPerCm(params)).toThrow();
		});

		it('throws error for invalid headToToePixels', () => {
			const params: CalibrationParams = {
				userHeight: 175,
				imageHeight: 720,
				headToToePixels: 0,
			};
			expect(() => calculatePixelsPerCm(params)).toThrow();
		});
	});

	describe('pixelsToCm', () => {
		it('converts pixels to centimeters', () => {
			const pixelsPerCm = 2; // 2 pixels = 1 cm
			expect(pixelsToCm(100, pixelsPerCm)).toBe(50); // 100 pixels = 50cm
		});

		it('handles fractional values', () => {
			const pixelsPerCm = 3.43;
			expect(pixelsToCm(120, pixelsPerCm)).toBeCloseTo(35, 1);
		});

		it('throws error for invalid pixelsPerCm', () => {
			expect(() => pixelsToCm(100, 0)).toThrow();
			expect(() => pixelsToCm(100, -1)).toThrow();
		});
	});

	describe('cmToPixels', () => {
		it('converts centimeters to pixels', () => {
			const pixelsPerCm = 2;
			expect(cmToPixels(50, pixelsPerCm)).toBe(100); // 50cm = 100 pixels
		});

		it('is inverse of pixelsToCm', () => {
			const pixelsPerCm = 3.43;
			const pixels = 120;
			const cm = pixelsToCm(pixels, pixelsPerCm);
			expect(cmToPixels(cm, pixelsPerCm)).toBeCloseTo(pixels, 5);
		});

		it('throws error for invalid pixelsPerCm', () => {
			expect(() => cmToPixels(50, 0)).toThrow();
		});
	});

	describe('calibrateFromLandmarks', () => {
		it('performs full calibration from landmarks', () => {
			const nose = { x: 0, y: 0, z: 0, visibility: 0.95 };
			const ankle = { x: 0, y: 1.75, z: 0, visibility: 0.9 }; // 1.75 meters (worldLandmarks)
			const userHeight = 175; // 175cm
			const imageHeight = 720;

			const result = calibrateFromLandmarks(nose, ankle, userHeight, imageHeight);

			expect(result.pixelsPerCm).toBeCloseTo(1, 1); // 1.75m / 175cm = 1
			expect(result.confidence).toBe(0.9); // Min of visibility scores
			expect(result.metersPerPixel).toBeCloseTo(0.01, 2);
		});

		it('confidence reflects lowest landmark visibility', () => {
			const nose = { x: 0, y: 0, z: 0, visibility: 1.0 };
			const ankle = { x: 0, y: 1.75, z: 0, visibility: 0.7 };
			const result = calibrateFromLandmarks(nose, ankle, 175, 720);
			expect(result.confidence).toBe(0.7);
		});

		it('defaults visibility to 1.0 if undefined', () => {
			const nose = { x: 0, y: 0, z: 0 };
			const ankle = { x: 0, y: 1.75, z: 0 };
			const result = calibrateFromLandmarks(nose, ankle, 175, 720);
			expect(result.confidence).toBe(1.0);
		});
	});

	describe('metersToCm', () => {
		it('converts meters to centimeters', () => {
			expect(metersToCm(1.0)).toBe(100);
			expect(metersToCm(1.75)).toBe(175);
			expect(metersToCm(0.5)).toBe(50);
		});

		it('handles fractional meters', () => {
			expect(metersToCm(1.234)).toBeCloseTo(123.4, 5);
		});
	});

	describe('isCalibrationValid', () => {
		it('returns true for confidence >= 0.7', () => {
			expect(
				isCalibrationValid({
					pixelsPerCm: 3,
					metersPerPixel: 0.01,
					confidence: 0.7,
				})
			).toBe(true);
			expect(
				isCalibrationValid({
					pixelsPerCm: 3,
					metersPerPixel: 0.01,
					confidence: 0.9,
				})
			).toBe(true);
		});

		it('returns false for confidence < 0.7', () => {
			expect(
				isCalibrationValid({
					pixelsPerCm: 3,
					metersPerPixel: 0.01,
					confidence: 0.69,
				})
			).toBe(false);
			expect(
				isCalibrationValid({
					pixelsPerCm: 3,
					metersPerPixel: 0.01,
					confidence: 0.0,
				})
			).toBe(false);
		});
	});

	describe('estimateCameraDistance', () => {
		it('estimates camera distance from head width', () => {
			const headWidthPixels = 100;
			const pixelsPerCm = 2; // 2 pixels = 1cm
			const distance = estimateCameraDistance(headWidthPixels, pixelsPerCm);

			// Head width = 100 / 2 = 50cm
			// Distance = (23cm / 50cm) * 150cm = 69cm
			expect(distance).toBeCloseTo(69, 0);
		});

		it('returns larger distance for smaller head', () => {
			const smallHead = estimateCameraDistance(50, 2); // 25cm head width
			const largeHead = estimateCameraDistance(100, 2); // 50cm head width
			expect(smallHead).toBeGreaterThan(largeHead);
		});
	});
});
