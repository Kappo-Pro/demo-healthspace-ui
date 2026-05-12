/**
 * Calibration Utilities for Body Measurement
 *
 * Converts pixel-space measurements to real-world units (cm).
 * Primary calibration method: user-reported height as reference.
 *
 * @module utils/bodyMeasurement/calibration
 * @since EPIC-001-S2
 */

import { Point3D, distance3D } from './geometry';

/**
 * Calibration Parameters
 *
 * @property userHeight - User-reported height in centimeters
 * @property imageHeight - Video frame height in pixels
 * @property headToToePixels - Detected head-to-toe distance in pixels
 */
export interface CalibrationParams {
	/** User-reported height (cm) */
	userHeight: number;

	/** Video frame height (pixels) */
	imageHeight: number;

	/** Detected head-to-toe distance (pixels or meters from worldLandmarks) */
	headToToePixels: number;
}

/**
 * Calibration Result
 *
 * @property pixelsPerCm - Conversion ratio (pixels per centimeter)
 * @property metersPerPixel - Alternative conversion (meters per pixel)
 * @property confidence - Calibration quality score (0-1)
 */
export interface CalibrationResult {
	/** Pixels per centimeter conversion ratio */
	pixelsPerCm: number;

	/** Meters per pixel (alternative unit) */
	metersPerPixel: number;

	/** Calibration confidence (based on pose quality) */
	confidence: number;
}

/**
 * Calculate pixels-per-centimeter ratio for calibration
 *
 * Uses user-reported height as ground truth reference.
 * Formula: pixelsPerCm = headToToePixels / userHeight
 *
 * @param params - Calibration parameters
 * @returns Pixels per centimeter ratio
 *
 * @example
 * ```typescript
 * const ratio = calculatePixelsPerCm({
 *   userHeight: 175,        // 175cm tall
 *   imageHeight: 720,       // 720p video
 *   headToToePixels: 600    // Person is 600 pixels tall
 * });
 * // Returns 3.43 (600 / 175)
 * ```
 */
export function calculatePixelsPerCm(params: CalibrationParams): number {
	if (params.userHeight <= 0 || params.headToToePixels <= 0) {
		throw new Error('Invalid calibration params: height and distance must be > 0');
	}

	return params.headToToePixels / params.userHeight;
}

/**
 * Convert pixel distance to centimeters
 *
 * Applies calibration ratio to convert screen-space measurement to real-world.
 *
 * @param pixelDistance - Distance in pixels
 * @param pixelsPerCm - Calibration ratio from calculatePixelsPerCm()
 * @returns Distance in centimeters
 *
 * @example
 * ```typescript
 * const widthCm = pixelsToCm(120, 3.43); // 120 pixels / 3.43 = 35cm
 * ```
 */
export function pixelsToCm(pixelDistance: number, pixelsPerCm: number): number {
	if (pixelsPerCm <= 0) {
		throw new Error('Invalid pixelsPerCm: must be > 0');
	}

	return pixelDistance / pixelsPerCm;
}

/**
 * Convert centimeters to pixels
 *
 * Inverse of pixelsToCm(). Useful for visualization overlays.
 *
 * @param cm - Distance in centimeters
 * @param pixelsPerCm - Calibration ratio
 * @returns Distance in pixels
 */
export function cmToPixels(cm: number, pixelsPerCm: number): number {
	if (pixelsPerCm <= 0) {
		throw new Error('Invalid pixelsPerCm: must be > 0');
	}

	return cm * pixelsPerCm;
}

/**
 * Perform full calibration from pose landmarks
 *
 * Calculates calibration ratio using head and ankle landmarks.
 * Returns calibration result with confidence score.
 *
 * @param noseLandmark - Nose landmark (head reference)
 * @param ankleLandmark - Ankle landmark (foot reference)
 * @param userHeight - User-reported height (cm)
 * @param imageHeight - Video frame height (pixels)
 * @returns Complete calibration result
 *
 * @example
 * ```typescript
 * const calibration = calibrateFromLandmarks(
 *   worldLandmarks[PoseLandmark.NOSE],
 *   worldLandmarks[PoseLandmark.LEFT_ANKLE],
 *   175,  // 175cm tall
 *   720   // 720p video
 * );
 * ```
 */
export function calibrateFromLandmarks(
	noseLandmark: Point3D,
	ankleLandmark: Point3D,
	userHeight: number,
	imageHeight: number
): CalibrationResult {
	// Calculate head-to-toe distance in landmark space
	const headToToePixels = distance3D(noseLandmark, ankleLandmark);

	// Calculate conversion ratio
	const pixelsPerCm = calculatePixelsPerCm({
		userHeight,
		imageHeight,
		headToToePixels,
	});

	// Confidence based on landmark visibility
	const confidence = Math.min(
		noseLandmark.visibility ?? 1,
		ankleLandmark.visibility ?? 1
	);

	// Alternative unit (meters per pixel)
	const metersPerPixel = userHeight / 100 / headToToePixels;

	return {
		pixelsPerCm,
		metersPerPixel,
		confidence,
	};
}

/**
 * Convert worldLandmarks (meters) to centimeters
 *
 * MediaPipe worldLandmarks use meters. This helper converts to cm.
 *
 * @param metersDistance - Distance in meters
 * @returns Distance in centimeters
 */
export function metersToCm(metersDistance: number): number {
	return metersDistance * 100;
}

/**
 * Validate calibration quality
 *
 * Checks if calibration is reliable based on confidence threshold.
 * Confidence < 0.7 indicates poor pose detection or occlusion.
 *
 * @param calibration - Calibration result to validate
 * @returns true if confidence >= 0.7
 */
export function isCalibrationValid(calibration: CalibrationResult): boolean {
	return calibration.confidence >= 0.7;
}

/**
 * Calculate camera-to-subject distance estimate
 *
 * Uses similar triangles to estimate distance from camera.
 * Assumes average head size of 23cm.
 *
 * @param headWidthPixels - Detected head width in pixels
 * @param pixelsPerCm - Calibration ratio
 * @returns Estimated distance in centimeters
 */
export function estimateCameraDistance(
	headWidthPixels: number,
	pixelsPerCm: number
): number {
	const AVERAGE_HEAD_WIDTH_CM = 23;
	const headWidthCm = pixelsToCm(headWidthPixels, pixelsPerCm);

	// Distance estimation (simplified model)
	// More accurate methods would use focal length
	return (AVERAGE_HEAD_WIDTH_CM / headWidthCm) * 150; // 150cm baseline
}
