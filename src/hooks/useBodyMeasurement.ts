/**
 * useBodyMeasurement Hook
 *
 * Main workflow orchestration for body measurement SDK.
 * Manages calibration, multi-view capture, and measurement calculation.
 *
 * @module hooks/useBodyMeasurement
 * @since EPIC-001-S4
 */

import { useState, useCallback } from 'react';
import { calculateAllMeasurements } from '@utils/bodyMeasurement';
import type { PoseLandmark3D } from '@types/mediapipe';
import type { BodyMeasurementResult } from '@utils/bodyMeasurement';

export type WorkflowStep =
	| 'calibration'
	| 'capture-front'
	| 'capture-side'
	| 'capture-back'
	| 'processing'
	| 'complete';

export interface CapturedPose {
	landmarks: PoseLandmark3D[];
	worldLandmarks: PoseLandmark3D[];
	timestamp: number;
	imageData?: string; // Base64 image
}

export interface UseBodyMeasurementReturn {
	/** Current workflow step */
	currentStep: WorkflowStep;

	/** User height in cm */
	userHeight: number | null;

	/** Captured poses (front/side/back) */
	capturedPoses: {
		front?: CapturedPose;
		side?: CapturedPose;
		back?: CapturedPose;
	};

	/** Measurement result */
	measurementResult: BodyMeasurementResult | null;

	/** Is processing measurements */
	isProcessing: boolean;

	/** Error message */
	error: string | null;

	/** Set user height and complete calibration */
	completeCalibration: (height: number) => void;

	/** Capture pose for current view */
	capturePose: (
		view: 'front' | 'side' | 'back',
		landmarks: PoseLandmark3D[],
		worldLandmarks: PoseLandmark3D[],
		imageData?: string
	) => void;

	/** Calculate measurements from captured poses */
	calculateMeasurements: () => Promise<void>;

	/** Reset workflow */
	reset: () => void;
}

/**
 * Body Measurement Workflow Hook
 *
 * Orchestrates complete body measurement flow:
 * 1. Calibration (user height)
 * 2. Multi-view capture (front/side/back)
 * 3. Measurement calculation
 *
 * @returns Workflow state and controls
 *
 * @example
 * ```typescript
 * const {
 *   currentStep,
 *   completeCalibration,
 *   capturePose,
 *   calculateMeasurements
 * } = useBodyMeasurement();
 *
 * // Step 1: Calibration
 * completeCalibration(175); // 175cm height
 *
 * // Step 2: Capture poses
 * capturePose('front', landmarks, worldLandmarks);
 * capturePose('side', landmarks, worldLandmarks);
 * capturePose('back', landmarks, worldLandmarks);
 *
 * // Step 3: Calculate measurements
 * await calculateMeasurements();
 * ```
 */
export function useBodyMeasurement(): UseBodyMeasurementReturn {
	const [currentStep, setCurrentStep] = useState<WorkflowStep>('calibration');
	const [userHeight, setUserHeight] = useState<number | null>(null);
	const [capturedPoses, setCapturedPoses] = useState<{
		front?: CapturedPose;
		side?: CapturedPose;
		back?: CapturedPose;
	}>({});
	const [measurementResult, setMeasurementResult] = useState<BodyMeasurementResult | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Complete calibration and move to front capture
	const completeCalibration = useCallback((height: number) => {
		if (height <= 0 || height > 300) {
			setError('Invalid height: must be between 0 and 300 cm');
			return;
		}

		setUserHeight(height);
		setCurrentStep('capture-front');
		setError(null);
	}, []);

	// Capture pose for specific view
	const capturePose = useCallback(
		(
			view: 'front' | 'side' | 'back',
			landmarks: PoseLandmark3D[],
			worldLandmarks: PoseLandmark3D[],
			imageData?: string
		) => {
			// Store captured pose
			const pose: CapturedPose = {
				landmarks,
				worldLandmarks,
				timestamp: Date.now(),
				imageData,
			};

			setCapturedPoses(prev => ({ ...prev, [view]: pose }));

			// Progress to next step
			if (view === 'front') {
				setCurrentStep('capture-side');
			} else if (view === 'side') {
				setCurrentStep('capture-back');
			} else if (view === 'back') {
				setCurrentStep('processing');
			}

			setError(null);
		},
		[]
	);

	// Calculate measurements from captured poses
	const calculateMeasurements = useCallback(async () => {
		if (!userHeight) {
			setError('User height not set. Complete calibration first.');
			return;
		}

		if (!capturedPoses.front || !capturedPoses.side || !capturedPoses.back) {
			setError('All three views (front/side/back) must be captured');
			return;
		}

		setIsProcessing(true);
		setError(null);

		try {
			// Use front view worldLandmarks as primary for measurements
			// TODO: Future enhancement - fuse multi-view data for better accuracy
			const primaryLandmarks = capturedPoses.front.worldLandmarks;

			// Calculate all measurements
			const result = calculateAllMeasurements(primaryLandmarks, userHeight);

			setMeasurementResult(result);
			setCurrentStep('complete');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to calculate measurements';
			setError(message);
			console.error('[useBodyMeasurement] Calculation error:', err);
		} finally {
			setIsProcessing(false);
		}
	}, [userHeight, capturedPoses]);

	// Reset workflow
	const reset = useCallback(() => {
		setCurrentStep('calibration');
		setUserHeight(null);
		setCapturedPoses({});
		setMeasurementResult(null);
		setIsProcessing(false);
		setError(null);
	}, []);

	return {
		currentStep,
		userHeight,
		capturedPoses,
		measurementResult,
		isProcessing,
		error,
		completeCalibration,
		capturePose,
		calculateMeasurements,
		reset,
	};
}
