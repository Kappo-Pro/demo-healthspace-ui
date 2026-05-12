/**
 * Body Measurement Algorithms
 *
 * Anthropometric calculation utilities for body measurements.
 * Converts MediaPipe pose landmarks to real-world measurements (cm/inches).
 *
 * EPIC-001-S4: Measurement Algorithms for Body Measurement SDK
 *
 * @module utils/measurements/algorithms
 */

import type { PoseLandmark3D } from '../../types/mediapipe';
import type { BodyMeasurement, BodyMeasurementType, CalibrationData } from '../../types/bodyMeasurement';

/**
 * Minimum confidence threshold for landmark-based calculations
 */
const MIN_LANDMARK_CONFIDENCE = 0.5;

/**
 * Calculate Euclidean distance between two 3D landmarks (normalized coordinates)
 */
export function calculateDistance(
	landmark1: PoseLandmark3D,
	landmark2: PoseLandmark3D
): number {
	const dx = landmark2.x - landmark1.x;
	const dy = landmark2.y - landmark1.y;
	const dz = landmark2.z - landmark1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Estimate circumference from width measurement using ellipse approximation
 *
 * Assumes body cross-section is approximately elliptical with major:minor ratio ~1.3:1
 */
export function calculateCircumference(
	widthDistance: number,
	pixelToCmRatio: number
): number {
	// Convert normalized distance to cm
	const widthCm = widthDistance * pixelToCmRatio;

	// Assume depth is ~77% of width (1/1.3) for elliptical approximation
	const depthCm = widthCm * 0.77;

	// Ramanujan's approximation for ellipse circumference
	const a = widthCm / 2; // Semi-major axis
	const b = depthCm / 2; // Semi-minor axis
	const h = Math.pow((a - b) / (a + b), 2);
	const circumference = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

	return circumference;
}

/**
 * Estimate user height from pose landmarks
 *
 * Uses full-body vertical span (nose to ankle) and applies correction factor
 */
export function estimateHeight(
	landmarks: PoseLandmark3D[],
	pixelToCmRatio: number
): { value: number; confidence: number } {
	// Key landmarks: nose (0), left ankle (27), right ankle (28)
	const nose = landmarks[0];
	const leftAnkle = landmarks[27];
	const rightAnkle = landmarks[28];

	// Use ankle with better visibility
	const ankle =
		leftAnkle.visibility > rightAnkle.visibility ? leftAnkle : rightAnkle;

	// Calculate vertical distance (nose to ankle)
	const verticalSpan = Math.abs(ankle.y - nose.y);

	// Apply correction factor (ankle to floor is ~8% of height)
	const heightEstimate = verticalSpan * pixelToCmRatio * 1.08;

	// Confidence is average of landmark visibilities
	const confidence = (nose.visibility + ankle.visibility) / 2;

	return { value: heightEstimate, confidence };
}

/**
 * Calculate pixel-to-centimeter ratio using user-provided height
 *
 * @param userHeightCm User's actual height in centimeters
 * @param landmarks Pose landmarks
 * @returns Calibration scale factor
 */
export function calculatePixelToCmRatio(
	userHeightCm: number,
	landmarks: PoseLandmark3D[]
): number {
	const { value: estimatedHeightPixels } = estimateHeight(landmarks, 1);

	// Ratio = actual height / estimated height (in normalized units)
	return userHeightCm / estimatedHeightPixels;
}

/**
 * Calculate shoulder width measurement
 */
function calculateShoulderWidth(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement {
	const leftShoulder = landmarks[11]; // Left shoulder
	const rightShoulder = landmarks[12]; // Right shoulder

	const distance = calculateDistance(leftShoulder, rightShoulder);
	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);
	const valueCm = distance * pixelToCm;

	return {
		id: 'shoulder-width',
		type: 'segment' as BodyMeasurementType,
		label: 'Shoulder Width',
		value: Math.round(valueCm * 10) / 10, // Round to 1 decimal
		unit: 'cm',
		confidence: (leftShoulder.visibility + rightShoulder.visibility) / 2,
		landmarks: ['shoulder_left', 'shoulder_right'],
	};
}

/**
 * Calculate chest circumference (estimated)
 */
function calculateChestCircumference(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement {
	const leftShoulder = landmarks[11];
	const rightShoulder = landmarks[12];

	// Use shoulder width as proxy for chest width
	const shoulderDistance = calculateDistance(leftShoulder, rightShoulder);
	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);

	// Chest is typically ~85% of shoulder width
	const chestWidth = shoulderDistance * 0.85;
	const circumference = calculateCircumference(chestWidth, pixelToCm);

	return {
		id: 'chest-circumference',
		type: 'circumference' as BodyMeasurementType,
		label: 'Chest Circumference',
		value: Math.round(circumference * 10) / 10,
		unit: 'cm',
		confidence: (leftShoulder.visibility + rightShoulder.visibility) / 2,
		landmarks: ['shoulder_left', 'shoulder_right'],
	};
}

/**
 * Calculate waist circumference (estimated)
 */
function calculateWaistCircumference(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement {
	const leftHip = landmarks[23];
	const rightHip = landmarks[24];

	// Hip width as proxy for waist width (waist is ~90% of hip width)
	const hipDistance = calculateDistance(leftHip, rightHip);
	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);
	const waistWidth = hipDistance * 0.9;
	const circumference = calculateCircumference(waistWidth, pixelToCm);

	return {
		id: 'waist-circumference',
		type: 'circumference' as BodyMeasurementType,
		label: 'Waist Circumference',
		value: Math.round(circumference * 10) / 10,
		unit: 'cm',
		confidence: (leftHip.visibility + rightHip.visibility) / 2,
		landmarks: ['hip_left', 'hip_right'],
	};
}

/**
 * Calculate hip circumference
 */
function calculateHipCircumference(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement {
	const leftHip = landmarks[23];
	const rightHip = landmarks[24];

	const hipDistance = calculateDistance(leftHip, rightHip);
	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);
	const circumference = calculateCircumference(hipDistance, pixelToCm);

	return {
		id: 'hip-circumference',
		type: 'circumference' as BodyMeasurementType,
		label: 'Hip Circumference',
		value: Math.round(circumference * 10) / 10,
		unit: 'cm',
		confidence: (leftHip.visibility + rightHip.visibility) / 2,
		landmarks: ['hip_left', 'hip_right'],
	};
}

/**
 * Calculate arm length (shoulder to wrist)
 */
function calculateArmLength(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData,
	side: 'left' | 'right'
): BodyMeasurement {
	const shoulderIdx = side === 'left' ? 11 : 12;
	const elbowIdx = side === 'left' ? 13 : 14;
	const wristIdx = side === 'left' ? 15 : 16;

	const shoulder = landmarks[shoulderIdx];
	const elbow = landmarks[elbowIdx];
	const wrist = landmarks[wristIdx];

	const upperArmDist = calculateDistance(shoulder, elbow);
	const forearmDist = calculateDistance(elbow, wrist);
	const totalDist = upperArmDist + forearmDist;

	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);
	const valueCm = totalDist * pixelToCm;

	return {
		id: `${side}-arm-length`,
		type: 'segment' as BodyMeasurementType,
		label: `${side === 'left' ? 'Left' : 'Right'} Arm Length`,
		value: Math.round(valueCm * 10) / 10,
		unit: 'cm',
		confidence: (shoulder.visibility + elbow.visibility + wrist.visibility) / 3,
		landmarks: [
			`${side}_shoulder`,
			`${side}_elbow`,
			`${side}_wrist`,
		],
	};
}

/**
 * Calculate leg length (hip to ankle)
 */
function calculateLegLength(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData,
	side: 'left' | 'right'
): BodyMeasurement {
	const hipIdx = side === 'left' ? 23 : 24;
	const kneeIdx = side === 'left' ? 25 : 26;
	const ankleIdx = side === 'left' ? 27 : 28;

	const hip = landmarks[hipIdx];
	const knee = landmarks[kneeIdx];
	const ankle = landmarks[ankleIdx];

	const thighDist = calculateDistance(hip, knee);
	const shinDist = calculateDistance(knee, ankle);
	const totalDist = thighDist + shinDist;

	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);
	const valueCm = totalDist * pixelToCm;

	return {
		id: `${side}-leg-length`,
		type: 'segment' as BodyMeasurementType,
		label: `${side === 'left' ? 'Left' : 'Right'} Leg Length`,
		value: Math.round(valueCm * 10) / 10,
		unit: 'cm',
		confidence: (hip.visibility + knee.visibility + ankle.visibility) / 3,
		landmarks: [`${side}_hip`, `${side}_knee`, `${side}_ankle`],
	};
}

/**
 * Calculate hip width
 */
function calculateHipWidth(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement {
	const leftHip = landmarks[23];
	const rightHip = landmarks[24];

	const distance = calculateDistance(leftHip, rightHip);
	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);
	const valueCm = distance * pixelToCm;

	return {
		id: 'hip-width',
		type: 'segment' as BodyMeasurementType,
		label: 'Hip Width',
		value: Math.round(valueCm * 10) / 10,
		unit: 'cm',
		confidence: (leftHip.visibility + rightHip.visibility) / 2,
		landmarks: ['hip_left', 'hip_right'],
	};
}

/**
 * Calculate waist-to-hip ratio
 */
function calculateWaistToHipRatio(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement {
	const waist = calculateWaistCircumference(landmarks, calibration);
	const hip = calculateHipCircumference(landmarks, calibration);

	const ratio = waist.value / hip.value;

	return {
		id: 'waist-to-hip-ratio',
		type: 'ratio' as BodyMeasurementType,
		label: 'Waist-to-Hip Ratio',
		value: Math.round(ratio * 100) / 100, // Round to 2 decimals
		unit: 'ratio',
		confidence: Math.min(waist.confidence, hip.confidence),
		landmarks: ['hip_left', 'hip_right'],
	};
}

/**
 * Calculate torso length (shoulder to hip)
 */
function calculateTorsoLength(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement {
	const leftShoulder = landmarks[11];
	const rightShoulder = landmarks[12];
	const leftHip = landmarks[23];
	const rightHip = landmarks[24];

	// Use midpoint of shoulders and hips
	const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
	const hipMidY = (leftHip.y + rightHip.y) / 2;

	const verticalDist = Math.abs(hipMidY - shoulderMidY);
	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);
	const valueCm = verticalDist * pixelToCm;

	return {
		id: 'torso-length',
		type: 'segment' as BodyMeasurementType,
		label: 'Torso Length',
		value: Math.round(valueCm * 10) / 10,
		unit: 'cm',
		confidence:
			(leftShoulder.visibility +
				rightShoulder.visibility +
				leftHip.visibility +
				rightHip.visibility) /
			4,
		landmarks: ['shoulder_left', 'shoulder_right', 'hip_left', 'hip_right'],
	};
}

/**
 * Calculate shoulder symmetry (height difference between shoulders)
 */
function calculateShoulderSymmetry(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement {
	const leftShoulder = landmarks[11];
	const rightShoulder = landmarks[12];

	const heightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
	const pixelToCm = calculatePixelToCmRatio(calibration.userHeight, landmarks);
	const valueCm = heightDiff * pixelToCm;

	return {
		id: 'shoulder-symmetry',
		type: 'symmetry' as BodyMeasurementType,
		label: 'Shoulder Symmetry',
		value: Math.round(valueCm * 10) / 10,
		unit: 'cm',
		confidence: (leftShoulder.visibility + rightShoulder.visibility) / 2,
		landmarks: ['shoulder_left', 'shoulder_right'],
	};
}

/**
 * Check if landmarks are sufficient for measurements
 */
export function validateLandmarkQuality(landmarks: PoseLandmark3D[]): {
	isValid: boolean;
	reason?: string;
} {
	// Check key landmarks visibility
	const keyLandmarks = [
		landmarks[0], // Nose
		landmarks[11], // Left shoulder
		landmarks[12], // Right shoulder
		landmarks[23], // Left hip
		landmarks[24], // Right hip
		landmarks[27], // Left ankle
		landmarks[28], // Right ankle
	];

	const lowConfidenceLandmarks = keyLandmarks.filter(
		lm => lm.visibility < MIN_LANDMARK_CONFIDENCE
	);

	if (lowConfidenceLandmarks.length > 2) {
		return {
			isValid: false,
			reason: 'Insufficient landmark visibility. Please ensure full body is visible.',
		};
	}

	return { isValid: true };
}

/**
 * Calculate all body measurements from pose landmarks
 *
 * @param landmarks MediaPipe pose landmarks (33 keypoints)
 * @param calibration Calibration data (user height, camera distance, etc.)
 * @returns Array of body measurements
 */
export function calculateAllMeasurements(
	landmarks: PoseLandmark3D[],
	calibration: CalibrationData
): BodyMeasurement[] {
	const measurements: BodyMeasurement[] = [];

	// Validate landmarks
	const validation = validateLandmarkQuality(landmarks);
	if (!validation.isValid) {
		console.warn('[Measurements] Low quality landmarks:', validation.reason);
		// Continue with calculation but confidence scores will reflect quality
	}

	// Circumferences
	measurements.push(calculateChestCircumference(landmarks, calibration));
	measurements.push(calculateWaistCircumference(landmarks, calibration));
	measurements.push(calculateHipCircumference(landmarks, calibration));

	// Segment lengths
	measurements.push(calculateShoulderWidth(landmarks, calibration));
	measurements.push(calculateHipWidth(landmarks, calibration));
	measurements.push(calculateTorsoLength(landmarks, calibration));

	// Arms and legs
	measurements.push(calculateArmLength(landmarks, calibration, 'left'));
	measurements.push(calculateArmLength(landmarks, calibration, 'right'));
	measurements.push(calculateLegLength(landmarks, calibration, 'left'));
	measurements.push(calculateLegLength(landmarks, calibration, 'right'));

	// Height estimate
	const heightEstimate = estimateHeight(landmarks, calculatePixelToCmRatio(calibration.userHeight, landmarks));
	measurements.push({
		id: 'height-estimate',
		type: 'segment' as BodyMeasurementType,
		label: 'Height (Estimated)',
		value: Math.round(heightEstimate.value * 10) / 10,
		unit: 'cm',
		confidence: heightEstimate.confidence,
		landmarks: ['nose', 'ankle_left', 'ankle_right'],
	});

	// Ratios and symmetry
	measurements.push(calculateWaistToHipRatio(landmarks, calibration));
	measurements.push(calculateShoulderSymmetry(landmarks, calibration));

	return measurements;
}
