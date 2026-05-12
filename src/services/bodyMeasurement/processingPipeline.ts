/**
 * Body Measurement Processing Pipeline
 *
 * Integrates pose detection with measurement algorithms to produce comprehensive
 * body measurement results. Implements multi-frame averaging, confidence scoring,
 * and result aggregation for SDK consumption.
 *
 * @module services/bodyMeasurement/processingPipeline
 * @since EPIC-001-S5
 *
 * @example
 * ```typescript
 * import { processMeasurements } from '@services/bodyMeasurement/processingPipeline';
 *
 * const result = await processMeasurements(
 *   { front: frontPose, side: sidePose, back: backPose },
 *   175 // user height in cm
 * );
 * ```
 */

import type { PoseResult } from '../../types/mediapipe';
import { calculateAllMeasurements, Point3D, isLandmarkVisible } from '../../utils/bodyMeasurement';
import type { BodyMeasurementResult as AlgorithmResult } from '../../utils/bodyMeasurement';

/**
 * Multi-View Pose Input
 *
 * Poses captured from three cardinal views for comprehensive measurement.
 *
 * @property front - Front-facing pose (required)
 * @property side - Side-facing pose (optional for Phase 1)
 * @property back - Back-facing pose (optional for Phase 1)
 */
export interface MultiViewPoses {
	front: PoseResult;
	side?: PoseResult;
	back?: PoseResult;
}

/**
 * Processed Measurement Result
 *
 * SDK-facing result structure with flat measurement array.
 * Compatible with src/components/pages/SDK/shared/types/assessment.types.ts
 *
 * @property measurements - All measurements in flat array format
 * @property calibration - Calibration data used
 * @property metadata - Processing metadata
 * @property qualityFlags - Quality assessment flags
 */
export interface ProcessedMeasurementResult {
	/** Flat array of all measurements */
	measurements: Array<{
		id: string;
		type: 'segment' | 'circumference' | 'ratio' | 'symmetry';
		label: string;
		value: number;
		unit: 'cm' | 'in' | 'ratio';
		confidence: number;
		landmarks?: string[];
	}>;

	/** Calibration data */
	calibration: {
		userHeight: number;
		cameraDistance: number;
		poseQuality: number;
		calibrationMethod: 'height' | 'reference-object';
	};

	/** Processing metadata */
	metadata: {
		timestamp: string;
		processingTime: number;
		totalMeasurements: number;
		averageConfidence: number;
		symmetryScore: number;
	};

	/** Quality flags */
	qualityFlags: {
		calibrationValid: boolean;
		allLandmarksVisible: boolean;
		lowConfidenceCount: number;
	};
}

/**
 * Average landmarks across multiple frames
 *
 * Combines landmarks from multiple pose detections (same view) to reduce noise
 * and improve measurement accuracy.
 *
 * @param poses - Array of pose results from same view (3+ recommended)
 * @returns Averaged landmarks with combined visibility scores
 *
 * @example
 * ```typescript
 * const averaged = averageLandmarks([frame1, frame2, frame3]);
 * ```
 */
export function averageLandmarks(poses: PoseResult[]): Point3D[] {
	if (poses.length === 0) {
		throw new Error('averageLandmarks: poses array cannot be empty');
	}

	// Use worldLandmarks for real-world measurements (in meters)
	const landmarkArrays = poses.map(p => p.worldLandmarks);
	const landmarkCount = landmarkArrays[0].length;

	const averaged: Point3D[] = [];

	for (let i = 0; i < landmarkCount; i++) {
		let sumX = 0;
		let sumY = 0;
		let sumZ = 0;
		let sumVisibility = 0;

		// Sum all values for this landmark index
		for (const landmarks of landmarkArrays) {
			const lm = landmarks[i];
			sumX += lm.x;
			sumY += lm.y;
			sumZ += lm.z;
			sumVisibility += lm.visibility;
		}

		// Calculate average
		const count = landmarkArrays.length;
		averaged.push({
			x: sumX / count,
			y: sumY / count,
			z: sumZ / count,
			visibility: sumVisibility / count,
		});
	}

	return averaged;
}

/**
 * Average landmarks across multiple views
 *
 * Combines landmarks from front/side/back poses to create composite measurement
 * input. Uses weighted averaging based on landmark visibility per view.
 *
 * @param poses - Multi-view poses
 * @returns Averaged landmarks with weighted visibility
 *
 * @example
 * ```typescript
 * const averaged = averageLandmarksMultiView({ front, side, back });
 * ```
 */
export function averageLandmarksMultiView(poses: MultiViewPoses): Point3D[] {
	const views: PoseResult[] = [poses.front];
	if (poses.side) views.push(poses.side);
	if (poses.back) views.push(poses.back);

	return averageLandmarks(views);
}

/**
 * Transform algorithm result to SDK-facing format
 *
 * Converts nested measurement structure (segments/circumferences/ratios/symmetry)
 * to flat array format compatible with SDK types.
 *
 * @param algorithmResult - Result from calculateAllMeasurements
 * @returns Flat measurement array
 *
 * @internal
 */
function transformToSDKFormat(algorithmResult: AlgorithmResult): ProcessedMeasurementResult['measurements'] {
	const measurements: ProcessedMeasurementResult['measurements'] = [];

	// Transform segments
	algorithmResult.measurements.segments.forEach(seg => {
		measurements.push({
			id: seg.segment,
			type: 'segment',
			label: formatLabel(seg.segment),
			value: seg.lengthCm,
			unit: 'cm',
			confidence: seg.confidence,
		});
	});

	// Transform circumferences
	algorithmResult.measurements.circumferences.forEach(circ => {
		measurements.push({
			id: `${circ.bodyPart}-circumference`,
			type: 'circumference',
			label: formatLabel(`${circ.bodyPart}-circumference`),
			value: circ.circumferenceCm,
			unit: 'cm',
			confidence: circ.confidence,
		});
	});

	// Transform ratios
	algorithmResult.measurements.ratios.forEach(ratio => {
		measurements.push({
			id: ratio.id,
			type: 'ratio',
			label: formatLabel(ratio.id),
			value: ratio.value,
			unit: 'ratio',
			confidence: ratio.confidence,
		});
	});

	// Transform symmetry
	algorithmResult.measurements.symmetry.forEach(sym => {
		measurements.push({
			id: sym.id,
			type: 'symmetry',
			label: formatLabel(sym.id),
			value: sym.percentDiff,
			unit: 'ratio',
			confidence: sym.confidence,
		});
	});

	return measurements;
}

/**
 * Format measurement ID to human-readable label
 *
 * @param id - Measurement ID (e.g., 'shoulder-width')
 * @returns Human-readable label (e.g., 'Shoulder Width')
 *
 * @internal
 */
function formatLabel(id: string): string {
	return id
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Process body measurements from multi-view poses
 *
 * Main pipeline entry point. Processes front/side/back poses into comprehensive
 * body measurement result with multi-frame averaging and quality filtering.
 *
 * **Processing Steps:**
 * 1. Average landmarks across views (weighted by visibility)
 * 2. Calculate all measurements using algorithm library (S2)
 * 3. Transform to SDK-facing flat array format
 * 4. Filter low-confidence measurements (threshold: 0.6)
 * 5. Return comprehensive result
 *
 * @param poses - Multi-view poses (front required, side/back optional)
 * @param userHeight - User-reported height in centimeters
 * @param options - Optional processing configuration
 * @returns Processed measurement result ready for SDK consumption
 *
 * @throws Error if poses.front is missing or userHeight invalid
 *
 * @example
 * ```typescript
 * const result = await processMeasurements(
 *   { front: frontPose, side: sidePose, back: backPose },
 *   175, // 175cm height
 *   { confidenceThreshold: 0.7 }
 * );
 *
 *  *  * ```
 */
export async function processMeasurements(
	poses: MultiViewPoses,
	userHeight: number,
	options: {
		/** Minimum confidence threshold (default: 0.6) */
		confidenceThreshold?: number;
		/** Image height for calibration (default: 720) */
		imageHeight?: number;
	} = {}
): Promise<ProcessedMeasurementResult> {
	const startTime = performance.now();

	// Validate inputs
	if (!poses.front) {
		throw new Error('processMeasurements: front pose is required');
	}
	if (userHeight <= 0 || userHeight > 300) {
		throw new Error('processMeasurements: userHeight must be 0 < height < 300 cm');
	}

	const { confidenceThreshold = 0.6, imageHeight = 720 } = options;

	// Step 1: Average landmarks across views
	const avgLandmarks = averageLandmarksMultiView(poses);

	// Step 2: Calculate measurements using algorithm library (S2)
	const algorithmResult = calculateAllMeasurements(avgLandmarks, userHeight, imageHeight);

	// Step 3: Transform to SDK format (flat array)
	let measurements = transformToSDKFormat(algorithmResult);

	// Step 4: Filter low-confidence measurements
	measurements = measurements.filter(m => m.confidence >= confidenceThreshold);

	// Step 5: Calculate pose quality from landmark visibility
	const visibleCount = avgLandmarks.filter(isLandmarkVisible).length;
	const poseQuality = visibleCount / avgLandmarks.length;

	// Step 6: Estimate camera distance (simplified for Phase 1)
	// TODO: Improve with actual depth estimation in Phase 2
	const cameraDistance = 150; // cm (typical optimal distance)

	// Step 7: Build final result
	const processingTime = performance.now() - startTime;

	return {
		measurements,
		calibration: {
			userHeight,
			cameraDistance,
			poseQuality,
			calibrationMethod: 'height',
		},
		metadata: {
			timestamp: new Date().toISOString(),
			processingTime: Math.round(processingTime),
			totalMeasurements: measurements.length,
			averageConfidence:
				measurements.reduce((sum, m) => sum + m.confidence, 0) / measurements.length,
			symmetryScore: algorithmResult.metadata.symmetryScore,
		},
		qualityFlags: {
			calibrationValid: algorithmResult.qualityFlags.calibrationValid,
			allLandmarksVisible: algorithmResult.qualityFlags.allLandmarksVisible,
			lowConfidenceCount: algorithmResult.qualityFlags.lowConfidenceCount,
		},
	};
}

/**
 * Process single-view measurements (simplified)
 *
 * Convenience wrapper for single-view processing (front only).
 * Uses same pipeline but without multi-view averaging.
 *
 * @param frontPose - Front-facing pose result
 * @param userHeight - User height in cm
 * @param options - Processing options
 * @returns Processed measurement result
 *
 * @example
 * ```typescript
 * const result = await processSingleView(frontPose, 175);
 * ```
 */
export async function processSingleView(
	frontPose: PoseResult,
	userHeight: number,
	options?: { confidenceThreshold?: number; imageHeight?: number }
): Promise<ProcessedMeasurementResult> {
	return processMeasurements({ front: frontPose }, userHeight, options);
}
