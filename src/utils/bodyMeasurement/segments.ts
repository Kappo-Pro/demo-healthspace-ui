/**
 * Body Segment Length Calculations
 *
 * Computes 15+ segment lengths from pose landmarks.
 * All measurements calibrated to real-world units (cm).
 *
 * @module utils/bodyMeasurement/segments
 * @since EPIC-001-S2
 */

import { Point3D, distance3D } from './geometry';
import { pixelsToCm } from './calibration';

/**
 * Segment Measurement Result
 *
 * @property segment - Segment identifier (e.g., 'shoulder-width')
 * @property lengthPx - Raw length in pixels or meters
 * @property lengthCm - Calibrated length in centimeters
 * @property confidence - Measurement confidence (0-1)
 */
export interface SegmentResult {
	/** Segment identifier */
	segment: string;

	/** Raw length in landmark units */
	lengthPx: number;

	/** Calibrated length (cm) */
	lengthCm: number;

	/** Confidence score (0-1) */
	confidence: number;
}

/**
 * Calculate segment length between two landmarks
 *
 * Generic segment calculator. Confidence propagates from landmark visibility.
 *
 * @param landmark1 - First landmark
 * @param landmark2 - Second landmark
 * @param pixelsPerCm - Calibration ratio
 * @param segmentName - Optional segment name
 * @returns Segment measurement result
 */
export function calculateSegment(
	landmark1: Point3D,
	landmark2: Point3D,
	pixelsPerCm: number,
	segmentName = 'generic'
): SegmentResult {
	const lengthPx = distance3D(landmark1, landmark2);
	const lengthCm = pixelsToCm(lengthPx, pixelsPerCm);

	// Confidence based on landmark visibility
	const confidence = Math.min(
		landmark1.visibility ?? 1,
		landmark2.visibility ?? 1
	);

	return {
		segment: segmentName,
		lengthPx,
		lengthCm,
		confidence,
	};
}

/**
 * Calculate shoulder width (left to right shoulder)
 *
 * Key metric for upper body proportions.
 * Average adult range: 35-50cm
 *
 * @param leftShoulder - Left shoulder landmark
 * @param rightShoulder - Right shoulder landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Shoulder width measurement
 */
export function shoulderWidth(
	leftShoulder: Point3D,
	rightShoulder: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(leftShoulder, rightShoulder, pixelsPerCm, 'shoulder-width');
}

/**
 * Calculate arm span (left wrist to right wrist)
 *
 * Typically equals height in adults (±5cm).
 * Useful for height validation.
 *
 * @param leftWrist - Left wrist landmark
 * @param rightWrist - Right wrist landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Arm span measurement
 */
export function armSpan(
	leftWrist: Point3D,
	rightWrist: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(leftWrist, rightWrist, pixelsPerCm, 'arm-span');
}

/**
 * Calculate leg length (hip to ankle)
 *
 * Measures from hip center to ankle.
 * Average adult: 75-95cm
 *
 * @param hip - Hip landmark
 * @param ankle - Ankle landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Leg length measurement
 */
export function legLength(
	hip: Point3D,
	ankle: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(hip, ankle, pixelsPerCm, 'leg-length');
}

/**
 * Calculate torso length (shoulder midpoint to hip midpoint)
 *
 * Vertical trunk measurement.
 * Average adult: 50-70cm
 *
 * @param shoulderMid - Midpoint between shoulders
 * @param hipMid - Midpoint between hips
 * @param pixelsPerCm - Calibration ratio
 * @returns Torso length measurement
 */
export function torsoLength(
	shoulderMid: Point3D,
	hipMid: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(shoulderMid, hipMid, pixelsPerCm, 'torso-length');
}

/**
 * Calculate upper arm length (shoulder to elbow)
 *
 * @param shoulder - Shoulder landmark
 * @param elbow - Elbow landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Upper arm length measurement
 */
export function upperArmLength(
	shoulder: Point3D,
	elbow: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(shoulder, elbow, pixelsPerCm, 'upper-arm-length');
}

/**
 * Calculate forearm length (elbow to wrist)
 *
 * @param elbow - Elbow landmark
 * @param wrist - Wrist landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Forearm length measurement
 */
export function forearmLength(
	elbow: Point3D,
	wrist: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(elbow, wrist, pixelsPerCm, 'forearm-length');
}

/**
 * Calculate thigh length (hip to knee)
 *
 * @param hip - Hip landmark
 * @param knee - Knee landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Thigh length measurement
 */
export function thighLength(
	hip: Point3D,
	knee: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(hip, knee, pixelsPerCm, 'thigh-length');
}

/**
 * Calculate calf length (knee to ankle)
 *
 * @param knee - Knee landmark
 * @param ankle - Ankle landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Calf length measurement
 */
export function calfLength(
	knee: Point3D,
	ankle: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(knee, ankle, pixelsPerCm, 'calf-length');
}

/**
 * Calculate head-to-toe length (full body height)
 *
 * Nose to ankle distance. Used for calibration validation.
 *
 * @param nose - Nose landmark (head)
 * @param ankle - Ankle landmark (foot)
 * @param pixelsPerCm - Calibration ratio
 * @returns Head-to-toe measurement
 */
export function headToToe(
	nose: Point3D,
	ankle: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(nose, ankle, pixelsPerCm, 'head-to-toe');
}

/**
 * Calculate hip width (left hip to right hip)
 *
 * Key metric for waist-to-hip ratio.
 * Average adult: 28-40cm
 *
 * @param leftHip - Left hip landmark
 * @param rightHip - Right hip landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Hip width measurement
 */
export function hipWidth(
	leftHip: Point3D,
	rightHip: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(leftHip, rightHip, pixelsPerCm, 'hip-width');
}

/**
 * Calculate neck length (nose to shoulder midpoint)
 *
 * Approximate neck length for posture analysis.
 *
 * @param nose - Nose landmark
 * @param shoulderMid - Midpoint between shoulders
 * @param pixelsPerCm - Calibration ratio
 * @returns Neck length measurement
 */
export function neckLength(
	nose: Point3D,
	shoulderMid: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(nose, shoulderMid, pixelsPerCm, 'neck-length');
}

/**
 * Calculate hand length (wrist to index finger)
 *
 * @param wrist - Wrist landmark
 * @param index - Index finger landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Hand length measurement
 */
export function handLength(
	wrist: Point3D,
	index: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(wrist, index, pixelsPerCm, 'hand-length');
}

/**
 * Calculate foot length (heel to foot index)
 *
 * @param heel - Heel landmark
 * @param footIndex - Foot index landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Foot length measurement
 */
export function footLength(
	heel: Point3D,
	footIndex: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(heel, footIndex, pixelsPerCm, 'foot-length');
}

/**
 * Calculate inseam (hip to ankle, inner leg)
 *
 * Approximation using hip-to-ankle distance.
 * Average adult: 70-85cm
 *
 * @param hip - Hip landmark
 * @param ankle - Ankle landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Inseam measurement
 */
export function inseam(
	hip: Point3D,
	ankle: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(hip, ankle, pixelsPerCm, 'inseam');
}

/**
 * Calculate elbow span (left elbow to right elbow)
 *
 * Useful for ergonomic assessments.
 *
 * @param leftElbow - Left elbow landmark
 * @param rightElbow - Right elbow landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Elbow span measurement
 */
export function elbowSpan(
	leftElbow: Point3D,
	rightElbow: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(leftElbow, rightElbow, pixelsPerCm, 'elbow-span');
}

/**
 * Calculate knee span (left knee to right knee)
 *
 * Lower body width measurement.
 *
 * @param leftKnee - Left knee landmark
 * @param rightKnee - Right knee landmark
 * @param pixelsPerCm - Calibration ratio
 * @returns Knee span measurement
 */
export function kneeSpan(
	leftKnee: Point3D,
	rightKnee: Point3D,
	pixelsPerCm: number
): SegmentResult {
	return calculateSegment(leftKnee, rightKnee, pixelsPerCm, 'knee-span');
}
