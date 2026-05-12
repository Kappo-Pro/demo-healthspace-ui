/**
 * Body Circumference Estimation
 *
 * Estimates circumferences from width measurements.
 * Uses elliptical cross-section model with depth ratios.
 * Accuracy: ±10% typical variance.
 *
 * @module utils/bodyMeasurement/circumferences
 * @since EPIC-001-S2
 */

import { Point3D, distance3D } from './geometry';
import { pixelsToCm } from './calibration';

/**
 * Circumference Measurement Result
 *
 * @property bodyPart - Body part identifier (e.g., 'chest', 'waist')
 * @property circumferenceCm - Estimated circumference (cm)
 * @property confidence - Measurement confidence (0-1)
 * @property widthCm - Input width measurement (cm)
 * @property depthRatio - Depth-to-width ratio used
 */
export interface CircumferenceResult {
	/** Body part identifier */
	bodyPart: string;

	/** Estimated circumference (cm) */
	circumferenceCm: number;

	/** Measurement confidence (0-1) */
	confidence: number;

	/** Source width measurement (cm) */
	widthCm?: number;

	/** Depth ratio applied */
	depthRatio?: number;
}

/**
 * Estimate circumference from width measurement
 *
 * Assumes elliptical cross-section: C ≈ π(a + b)(1 + 3h/(10 + √(4-3h)))
 * where h = ((a-b)/(a+b))² (Ramanujan approximation)
 *
 * @param widthCm - Width measurement (cm)
 * @param depthRatio - Depth-to-width ratio (default: 0.7)
 * @returns Estimated circumference (cm)
 *
 * @example
 * ```typescript
 * const circumference = estimateCircumference(40, 0.7);
 * // Returns ~112cm for 40cm width × 0.7 depth ratio
 * ```
 */
function estimateCircumference(widthCm: number, depthRatio = 0.7): number {
	const depthCm = widthCm * depthRatio;

	// Semi-axes of ellipse
	const a = widthCm / 2;
	const b = depthCm / 2;

	// Ramanujan approximation for ellipse circumference
	const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
	return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/**
 * Calculate chest circumference
 *
 * Uses shoulder width as proxy.
 * Chest depth ratio: 0.65 (less deep than waist)
 * Average adult: 85-110cm
 *
 * @param leftShoulder - Left shoulder landmark
 * @param rightShoulder - Right shoulder landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Chest circumference result
 */
export function chestCircumference(
	leftShoulder: Point3D,
	rightShoulder: Point3D,
	pixelsPerCm: number
): CircumferenceResult {
	const widthPx = distance3D(leftShoulder, rightShoulder);
	const widthCm = pixelsToCm(widthPx, pixelsPerCm);
	const depthRatio = 0.65;
	const circumferenceCm = estimateCircumference(widthCm, depthRatio);

	// Confidence reduced due to estimation uncertainty
	const confidence =
		Math.min(leftShoulder.visibility ?? 1, rightShoulder.visibility ?? 1) * 0.85;

	return {
		bodyPart: 'chest',
		circumferenceCm,
		confidence,
		widthCm,
		depthRatio,
	};
}

/**
 * Calculate waist circumference
 *
 * Uses hip landmark width at waist level.
 * Waist depth ratio: 0.75
 * Average adult: 70-100cm
 *
 * @param leftHip - Left hip landmark
 * @param rightHip - Right hip landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Waist circumference result
 */
export function waistCircumference(
	leftHip: Point3D,
	rightHip: Point3D,
	pixelsPerCm: number
): CircumferenceResult {
	const widthPx = distance3D(leftHip, rightHip);
	const widthCm = pixelsToCm(widthPx, pixelsPerCm);
	const depthRatio = 0.75;
	const circumferenceCm = estimateCircumference(widthCm, depthRatio);

	const confidence =
		Math.min(leftHip.visibility ?? 1, rightHip.visibility ?? 1) * 0.8;

	return {
		bodyPart: 'waist',
		circumferenceCm,
		confidence,
		widthCm,
		depthRatio,
	};
}

/**
 * Calculate hip circumference
 *
 * Measures at widest point of hips.
 * Hip depth ratio: 0.8 (rounder than waist)
 * Average adult: 85-115cm
 *
 * @param leftHip - Left hip landmark
 * @param rightHip - Right hip landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Hip circumference result
 */
export function hipCircumference(
	leftHip: Point3D,
	rightHip: Point3D,
	pixelsPerCm: number
): CircumferenceResult {
	const widthPx = distance3D(leftHip, rightHip);
	const widthCm = pixelsToCm(widthPx, pixelsPerCm);
	const depthRatio = 0.8;
	const circumferenceCm = estimateCircumference(widthCm, depthRatio);

	const confidence =
		Math.min(leftHip.visibility ?? 1, rightHip.visibility ?? 1) * 0.8;

	return {
		bodyPart: 'hip',
		circumferenceCm,
		confidence,
		widthCm,
		depthRatio,
	};
}

/**
 * Calculate thigh circumference
 *
 * Measured at mid-thigh point.
 * Thigh depth ratio: 0.85 (rounded cross-section)
 * Average adult: 45-65cm
 *
 * @param hip - Hip landmark
 * @param knee - Knee landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Thigh circumference result
 */
export function thighCircumference(
	hip: Point3D,
	knee: Point3D,
	pixelsPerCm: number
): CircumferenceResult {
	// Estimate thigh width at mid-thigh (approximate from hip-knee segment)
	const segmentLength = distance3D(hip, knee);
	const widthCm = pixelsToCm(segmentLength * 0.5, pixelsPerCm); // ~50% of segment length
	const depthRatio = 0.85;
	const circumferenceCm = estimateCircumference(widthCm, depthRatio);

	const confidence = Math.min(hip.visibility ?? 1, knee.visibility ?? 1) * 0.75;

	return {
		bodyPart: 'thigh',
		circumferenceCm,
		confidence,
		widthCm,
		depthRatio,
	};
}

/**
 * Calculate calf circumference
 *
 * Measured at widest point of calf.
 * Calf depth ratio: 0.9 (nearly circular)
 * Average adult: 30-45cm
 *
 * @param knee - Knee landmark
 * @param ankle - Ankle landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Calf circumference result
 */
export function calfCircumference(
	knee: Point3D,
	ankle: Point3D,
	pixelsPerCm: number
): CircumferenceResult {
	// Estimate calf width (approximate from knee-ankle segment)
	const segmentLength = distance3D(knee, ankle);
	const widthCm = pixelsToCm(segmentLength * 0.4, pixelsPerCm); // ~40% of segment length
	const depthRatio = 0.9;
	const circumferenceCm = estimateCircumference(widthCm, depthRatio);

	const confidence = Math.min(knee.visibility ?? 1, ankle.visibility ?? 1) * 0.75;

	return {
		bodyPart: 'calf',
		circumferenceCm,
		confidence,
		widthCm,
		depthRatio,
	};
}

/**
 * Calculate bicep circumference
 *
 * Measured at mid-upper-arm.
 * Bicep depth ratio: 0.85
 * Average adult: 25-40cm
 *
 * @param shoulder - Shoulder landmark
 * @param elbow - Elbow landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Bicep circumference result
 */
export function bicepCircumference(
	shoulder: Point3D,
	elbow: Point3D,
	pixelsPerCm: number
): CircumferenceResult {
	// Estimate bicep width (approximate from shoulder-elbow segment)
	const segmentLength = distance3D(shoulder, elbow);
	const widthCm = pixelsToCm(segmentLength * 0.35, pixelsPerCm); // ~35% of segment length
	const depthRatio = 0.85;
	const circumferenceCm = estimateCircumference(widthCm, depthRatio);

	const confidence = Math.min(shoulder.visibility ?? 1, elbow.visibility ?? 1) * 0.7;

	return {
		bodyPart: 'bicep',
		circumferenceCm,
		confidence,
		widthCm,
		depthRatio,
	};
}

/**
 * Calculate forearm circumference
 *
 * Measured at mid-forearm.
 * Forearm depth ratio: 0.9 (nearly circular)
 * Average adult: 20-30cm
 *
 * @param elbow - Elbow landmark
 * @param wrist - Wrist landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Forearm circumference result
 */
export function forearmCircumference(
	elbow: Point3D,
	wrist: Point3D,
	pixelsPerCm: number
): CircumferenceResult {
	// Estimate forearm width
	const segmentLength = distance3D(elbow, wrist);
	const widthCm = pixelsToCm(segmentLength * 0.3, pixelsPerCm); // ~30% of segment length
	const depthRatio = 0.9;
	const circumferenceCm = estimateCircumference(widthCm, depthRatio);

	const confidence = Math.min(elbow.visibility ?? 1, wrist.visibility ?? 1) * 0.7;

	return {
		bodyPart: 'forearm',
		circumferenceCm,
		confidence,
		widthCm,
		depthRatio,
	};
}

/**
 * Calculate neck circumference
 *
 * Estimated from head-to-shoulder geometry.
 * Neck depth ratio: 0.8
 * Average adult: 30-45cm
 *
 * @param leftEar - Left ear landmark
 * @param rightEar - Right ear landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Neck circumference result
 */
export function neckCircumference(
	leftEar: Point3D,
	rightEar: Point3D,
	pixelsPerCm: number
): CircumferenceResult {
	// Estimate neck width from ear-to-ear distance
	const earSpan = distance3D(leftEar, rightEar);
	const widthCm = pixelsToCm(earSpan * 0.6, pixelsPerCm); // Neck narrower than head
	const depthRatio = 0.8;
	const circumferenceCm = estimateCircumference(widthCm, depthRatio);

	const confidence = Math.min(leftEar.visibility ?? 1, rightEar.visibility ?? 1) * 0.65;

	return {
		bodyPart: 'neck',
		circumferenceCm,
		confidence,
		widthCm,
		depthRatio,
	};
}
