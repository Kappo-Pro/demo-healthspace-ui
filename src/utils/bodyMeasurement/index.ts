/**
 * Body Measurement SDK - Core Algorithm Library
 *
 * Complete measurement calculation suite for 40+ anthropometric metrics.
 * Integrates with BlazePose GHUM 33-keypoint pose detection.
 *
 * @module utils/bodyMeasurement
 * @since EPIC-001-S2
 *
 * @example
 * ```typescript
 * import { calculateAllMeasurements } from '@utils/bodyMeasurement';
 * import { PoseLandmark } from '@types/mediapipe';
 *
 * const result = calculateAllMeasurements(
 *   worldLandmarks,
 *   175 // user height in cm
 * );
 * ```
 */

// Re-export all utilities
export * from './geometry';
export * from './calibration';
export * from './segments';
export * from './circumferences';
export * from './ratios';
export * from './symmetry';

import { Point3D, distance3D, midpoint3D, isLandmarkVisible } from './geometry';
import {
	calibrateFromLandmarks,
	CalibrationResult,
	isCalibrationValid,
} from './calibration';
import {
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
	neckLength,
	handLength,
	footLength,
	inseam,
	elbowSpan,
	kneeSpan,
	SegmentResult,
} from './segments';
import {
	chestCircumference,
	waistCircumference,
	hipCircumference,
	thighCircumference,
	calfCircumference,
	bicepCircumference,
	forearmCircumference,
	neckCircumference,
	CircumferenceResult,
} from './circumferences';
import { calculateAllRatios, RatioResult } from './ratios';
import {
	armSymmetry,
	legSymmetry,
	shoulderSymmetry,
	hipSymmetry,
	thighSymmetry,
	calfSymmetry,
	SymmetryResult,
	overallSymmetryScore,
} from './symmetry';
import { PoseLandmark } from '@types/mediapipe';

/**
 * Complete Body Measurement Result
 *
 * Contains all measurements, calibration data, quality flags, and metadata.
 *
 * @property measurements - All measurements (segments, circumferences, ratios, symmetry)
 * @property calibration - Calibration data used
 * @property metadata - Assessment metadata
 * @property qualityFlags - Quality indicators
 */
export interface BodyMeasurementResult {
	/** All measurements combined */
	measurements: {
		segments: SegmentResult[];
		circumferences: CircumferenceResult[];
		ratios: RatioResult[];
		symmetry: SymmetryResult[];
	};

	/** Calibration data */
	calibration: CalibrationResult;

	/** Assessment metadata */
	metadata: {
		/** ISO timestamp */
		timestamp: string;

		/** Processing time (ms) */
		processingTime: number;

		/** Total measurement count */
		totalMeasurements: number;

		/** Average confidence score */
		averageConfidence: number;

		/** Overall symmetry score (0-100) */
		symmetryScore: number;
	};

	/** Quality assessment flags */
	qualityFlags: {
		/** Calibration valid? */
		calibrationValid: boolean;

		/** All landmarks visible? */
		allLandmarksVisible: boolean;

		/** Low confidence count */
		lowConfidenceCount: number;
	};
}

/**
 * Calculate all measurements from pose landmarks
 *
 * Main entry point for body measurement suite.
 * Processes 33 pose landmarks → 40+ measurements.
 *
 * @param landmarks - 33 BlazePose GHUM landmarks (worldLandmarks in meters)
 * @param userHeight - User-reported height (cm)
 * @param imageHeight - Video frame height (pixels, default: 720)
 * @returns Complete measurement result
 *
 * @throws Error if landmarks missing or userHeight invalid
 *
 * @example
 * ```typescript
 * const poseResult = await detectPose(videoFrame);
 * const measurements = calculateAllMeasurements(
 *   poseResult.worldLandmarks,
 *   175  // 175cm height
 * );
 *  * ```
 */
export function calculateAllMeasurements(
	landmarks: Point3D[],
	userHeight: number,
	imageHeight = 720
): BodyMeasurementResult {
	const startTime = performance.now();

	// Validate inputs
	if (!landmarks || landmarks.length !== 33) {
		throw new Error('Invalid landmarks: expected 33 BlazePose GHUM landmarks');
	}
	if (userHeight <= 0 || userHeight > 300) {
		throw new Error('Invalid userHeight: must be 0 < height < 300 cm');
	}

	// Step 1: Calibrate
	const noseLandmark = landmarks[PoseLandmark.NOSE];
	const leftAnkleLandmark = landmarks[PoseLandmark.LEFT_ANKLE];

	const calibration = calibrateFromLandmarks(
		noseLandmark,
		leftAnkleLandmark,
		userHeight,
		imageHeight
	);

	const pixelsPerCm = calibration.pixelsPerCm;

	// Step 2: Calculate segments (15 measurements)
	const segments: SegmentResult[] = [
		shoulderWidth(
			landmarks[PoseLandmark.LEFT_SHOULDER],
			landmarks[PoseLandmark.RIGHT_SHOULDER],
			pixelsPerCm
		),
		armSpan(
			landmarks[PoseLandmark.LEFT_WRIST],
			landmarks[PoseLandmark.RIGHT_WRIST],
			pixelsPerCm
		),
		legLength(
			landmarks[PoseLandmark.LEFT_HIP],
			landmarks[PoseLandmark.LEFT_ANKLE],
			pixelsPerCm
		),
		legLength(
			landmarks[PoseLandmark.RIGHT_HIP],
			landmarks[PoseLandmark.RIGHT_ANKLE],
			pixelsPerCm
		),
		torsoLength(
			midpoint3D(
				landmarks[PoseLandmark.LEFT_SHOULDER],
				landmarks[PoseLandmark.RIGHT_SHOULDER]
			),
			midpoint3D(landmarks[PoseLandmark.LEFT_HIP], landmarks[PoseLandmark.RIGHT_HIP]),
			pixelsPerCm
		),
		upperArmLength(
			landmarks[PoseLandmark.LEFT_SHOULDER],
			landmarks[PoseLandmark.LEFT_ELBOW],
			pixelsPerCm
		),
		upperArmLength(
			landmarks[PoseLandmark.RIGHT_SHOULDER],
			landmarks[PoseLandmark.RIGHT_ELBOW],
			pixelsPerCm
		),
		forearmLength(
			landmarks[PoseLandmark.LEFT_ELBOW],
			landmarks[PoseLandmark.LEFT_WRIST],
			pixelsPerCm
		),
		forearmLength(
			landmarks[PoseLandmark.RIGHT_ELBOW],
			landmarks[PoseLandmark.RIGHT_WRIST],
			pixelsPerCm
		),
		thighLength(
			landmarks[PoseLandmark.LEFT_HIP],
			landmarks[PoseLandmark.LEFT_KNEE],
			pixelsPerCm
		),
		thighLength(
			landmarks[PoseLandmark.RIGHT_HIP],
			landmarks[PoseLandmark.RIGHT_KNEE],
			pixelsPerCm
		),
		calfLength(
			landmarks[PoseLandmark.LEFT_KNEE],
			landmarks[PoseLandmark.LEFT_ANKLE],
			pixelsPerCm
		),
		calfLength(
			landmarks[PoseLandmark.RIGHT_KNEE],
			landmarks[PoseLandmark.RIGHT_ANKLE],
			pixelsPerCm
		),
		headToToe(noseLandmark, leftAnkleLandmark, pixelsPerCm),
		hipWidth(
			landmarks[PoseLandmark.LEFT_HIP],
			landmarks[PoseLandmark.RIGHT_HIP],
			pixelsPerCm
		),
	];

	// Step 3: Calculate circumferences (8 measurements)
	const circumferences: CircumferenceResult[] = [
		chestCircumference(
			landmarks[PoseLandmark.LEFT_SHOULDER],
			landmarks[PoseLandmark.RIGHT_SHOULDER],
			pixelsPerCm
		),
		waistCircumference(
			landmarks[PoseLandmark.LEFT_HIP],
			landmarks[PoseLandmark.RIGHT_HIP],
			pixelsPerCm
		),
		hipCircumference(
			landmarks[PoseLandmark.LEFT_HIP],
			landmarks[PoseLandmark.RIGHT_HIP],
			pixelsPerCm
		),
		thighCircumference(
			landmarks[PoseLandmark.LEFT_HIP],
			landmarks[PoseLandmark.LEFT_KNEE],
			pixelsPerCm
		),
		thighCircumference(
			landmarks[PoseLandmark.RIGHT_HIP],
			landmarks[PoseLandmark.RIGHT_KNEE],
			pixelsPerCm
		),
		calfCircumference(
			landmarks[PoseLandmark.LEFT_KNEE],
			landmarks[PoseLandmark.LEFT_ANKLE],
			pixelsPerCm
		),
		calfCircumference(
			landmarks[PoseLandmark.RIGHT_KNEE],
			landmarks[PoseLandmark.RIGHT_ANKLE],
			pixelsPerCm
		),
		bicepCircumference(
			landmarks[PoseLandmark.LEFT_SHOULDER],
			landmarks[PoseLandmark.LEFT_ELBOW],
			pixelsPerCm
		),
	];

	// Step 4: Calculate ratios (5 measurements)
	const shoulderWidthValue = segments.find(s => s.segment === 'shoulder-width')?.lengthCm ?? 0;
	const waistCircValue = circumferences.find(c => c.bodyPart === 'waist')?.circumferenceCm ?? 0;
	const hipCircValue = circumferences.find(c => c.bodyPart === 'hip')?.circumferenceCm ?? 0;
	const armSpanValue = segments.find(s => s.segment === 'arm-span')?.lengthCm ?? 0;
	const torsoLengthValue = segments.find(s => s.segment === 'torso-length')?.lengthCm ?? 0;
	const leftArmLength =
		(segments.find(s => s.segment === 'upper-arm-length')?.lengthCm ?? 0) +
		(segments.find(s => s.segment === 'forearm-length')?.lengthCm ?? 0);
	const leftLegLengthValue = segments.find(s => s.segment === 'leg-length')?.lengthCm ?? 0;

	const ratios = calculateAllRatios(
		{
			shoulderWidth: shoulderWidthValue,
			waistCirc: waistCircValue,
			hipCirc: hipCircValue,
			armLength: leftArmLength,
			legLength: leftLegLengthValue,
			torsoLength: torsoLengthValue,
			armSpan: armSpanValue,
			height: userHeight,
		},
		calibration.confidence
	);

	// Step 5: Calculate symmetry (6 measurements)
	const leftArmTotal =
		distance3D(
			landmarks[PoseLandmark.LEFT_SHOULDER],
			landmarks[PoseLandmark.LEFT_ELBOW]
		) +
		distance3D(landmarks[PoseLandmark.LEFT_ELBOW], landmarks[PoseLandmark.LEFT_WRIST]);
	const rightArmTotal =
		distance3D(
			landmarks[PoseLandmark.RIGHT_SHOULDER],
			landmarks[PoseLandmark.RIGHT_ELBOW]
		) +
		distance3D(landmarks[PoseLandmark.RIGHT_ELBOW], landmarks[PoseLandmark.RIGHT_WRIST]);

	const leftLegTotal = distance3D(
		landmarks[PoseLandmark.LEFT_HIP],
		landmarks[PoseLandmark.LEFT_ANKLE]
	);
	const rightLegTotal = distance3D(
		landmarks[PoseLandmark.RIGHT_HIP],
		landmarks[PoseLandmark.RIGHT_ANKLE]
	);

	const symmetry: SymmetryResult[] = [
		armSymmetry(leftArmTotal, rightArmTotal, calibration.confidence),
		legSymmetry(leftLegTotal, rightLegTotal, calibration.confidence),
		shoulderSymmetry(
			landmarks[PoseLandmark.LEFT_SHOULDER].y,
			landmarks[PoseLandmark.RIGHT_SHOULDER].y,
			calibration.confidence
		),
		hipSymmetry(
			landmarks[PoseLandmark.LEFT_HIP].y,
			landmarks[PoseLandmark.RIGHT_HIP].y,
			calibration.confidence
		),
		thighSymmetry(
			distance3D(
				landmarks[PoseLandmark.LEFT_HIP],
				landmarks[PoseLandmark.LEFT_KNEE]
			),
			distance3D(
				landmarks[PoseLandmark.RIGHT_HIP],
				landmarks[PoseLandmark.RIGHT_KNEE]
			),
			calibration.confidence
		),
		calfSymmetry(
			distance3D(
				landmarks[PoseLandmark.LEFT_KNEE],
				landmarks[PoseLandmark.LEFT_ANKLE]
			),
			distance3D(
				landmarks[PoseLandmark.RIGHT_KNEE],
				landmarks[PoseLandmark.RIGHT_ANKLE]
			),
			calibration.confidence
		),
	];

	// Step 6: Calculate metadata
	const processingTime = performance.now() - startTime;
	const totalMeasurements =
		segments.length + circumferences.length + ratios.length + symmetry.length;

	const allMeasurements = [
		...segments.map(s => s.confidence),
		...circumferences.map(c => c.confidence),
		...ratios.map(r => r.confidence),
		...symmetry.map(s => s.confidence),
	];
	const averageConfidence =
		allMeasurements.reduce((sum, c) => sum + c, 0) / allMeasurements.length;

	const symmetryScore = overallSymmetryScore(symmetry);

	// Step 7: Quality flags
	const allLandmarksVisible = landmarks.every(isLandmarkVisible);
	const lowConfidenceCount = allMeasurements.filter(c => c < 0.7).length;

	return {
		measurements: {
			segments,
			circumferences,
			ratios,
			symmetry,
		},
		calibration,
		metadata: {
			timestamp: new Date().toISOString(),
			processingTime: Math.round(processingTime),
			totalMeasurements,
			averageConfidence: Math.round(averageConfidence * 100) / 100,
			symmetryScore,
		},
		qualityFlags: {
			calibrationValid: isCalibrationValid(calibration),
			allLandmarksVisible,
			lowConfidenceCount,
		},
	};
}
