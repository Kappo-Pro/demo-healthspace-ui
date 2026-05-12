/**
 * useQualityValidation Hook
 *
 * Validates pose quality for body measurement capture.
 * Checks lighting, distance, and pose clarity thresholds.
 *
 * @module hooks/useQualityValidation
 * @since EPIC-001-S4
 */

import { useMemo } from 'react';
import type { PoseResult } from '@types/mediapipe';
import { PoseLandmark } from '@types/mediapipe';

export interface QualityFlags {
	/** Lighting quality assessment */
	lighting: 'good' | 'poor';

	/** Camera distance assessment */
	distance: 'optimal' | 'too-close' | 'too-far';

	/** Pose clarity assessment */
	pose: 'clear' | 'occluded';
}

export interface UseQualityValidationReturn {
	/** Quality assessment flags */
	qualityFlags: QualityFlags;

	/** Overall quality score (0-100) */
	qualityScore: number;

	/** Is pose ready for capture (all thresholds met) */
	isReadyForCapture: boolean;

	/** Specific feedback messages */
	feedbackMessages: string[];
}

/**
 * Quality Validation Hook
 *
 * Evaluates pose quality for measurement capture based on:
 * - Lighting (landmark visibility)
 * - Distance (shoulder width in frame)
 * - Pose clarity (overall visibility)
 *
 * @param poseResult - Current pose detection result
 * @param view - Current capture view (front/side/back)
 * @returns Quality validation state
 *
 * @example
 * ```typescript
 * const { qualityFlags, qualityScore, isReadyForCapture } = useQualityValidation(
 *   poseResult,
 *   'front'
 * );
 *
 * if (isReadyForCapture) {
 *   // Auto-capture countdown
 * }
 * ```
 */
export function useQualityValidation(
	poseResult: PoseResult | null,
	view: 'front' | 'side' | 'back'
): UseQualityValidationReturn {
	const qualityFlags = useMemo<QualityFlags>(() => {
		if (!poseResult || !poseResult.landmarks) {
			return { lighting: 'poor', distance: 'too-far', pose: 'occluded' };
		}

		const landmarks = poseResult.landmarks;

		// Calculate average visibility across all landmarks
		const avgVisibility =
			landmarks.reduce((sum, landmark) => sum + (landmark.visibility || 0), 0) /
			landmarks.length;

		// Lighting assessment (based on visibility)
		// Good lighting: > 0.7 average visibility
		const lighting = avgVisibility > 0.7 ? 'good' : 'poor';

		// Distance assessment (based on shoulder width in frame)
		const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];
		const rightShoulder = landmarks[PoseLandmark.RIGHT_SHOULDER];

		if (!leftShoulder || !rightShoulder) {
			return { lighting, distance: 'too-far', pose: 'occluded' };
		}

		const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

		// Optimal distance: shoulder width 10-30% of frame width
		// Too close: > 30%
		// Too far: < 10%
		let distance: 'optimal' | 'too-close' | 'too-far';
		if (shoulderWidth > 0.3) {
			distance = 'too-close';
		} else if (shoulderWidth < 0.1) {
			distance = 'too-far';
		} else {
			distance = 'optimal';
		}

		// Pose clarity (based on key landmark visibility)
		// Check critical landmarks based on view
		let criticalLandmarks: number[];
		if (view === 'front') {
			// Front view: shoulders, hips, knees visible
			criticalLandmarks = [
				PoseLandmark.LEFT_SHOULDER,
				PoseLandmark.RIGHT_SHOULDER,
				PoseLandmark.LEFT_HIP,
				PoseLandmark.RIGHT_HIP,
				PoseLandmark.LEFT_KNEE,
				PoseLandmark.RIGHT_KNEE,
			];
		} else if (view === 'side') {
			// Side view: one side visible
			criticalLandmarks = [
				PoseLandmark.NOSE,
				PoseLandmark.LEFT_SHOULDER,
				PoseLandmark.LEFT_HIP,
				PoseLandmark.LEFT_KNEE,
				PoseLandmark.LEFT_ANKLE,
			];
		} else {
			// Back view: shoulders, hips, ankles
			criticalLandmarks = [
				PoseLandmark.LEFT_SHOULDER,
				PoseLandmark.RIGHT_SHOULDER,
				PoseLandmark.LEFT_HIP,
				PoseLandmark.RIGHT_HIP,
				PoseLandmark.LEFT_ANKLE,
				PoseLandmark.RIGHT_ANKLE,
			];
		}

		const criticalVisibility =
			criticalLandmarks.reduce((sum, idx) => {
				const landmark = landmarks[idx];
				return sum + (landmark?.visibility || 0);
			}, 0) / criticalLandmarks.length;

		const pose = criticalVisibility > 0.6 ? 'clear' : 'occluded';

		return { lighting, distance, pose };
	}, [poseResult, view]);

	const qualityScore = useMemo(() => {
		let score = 0;

		// Lighting: 33 points
		if (qualityFlags.lighting === 'good') {
			score += 33;
		}

		// Distance: 33 points
		if (qualityFlags.distance === 'optimal') {
			score += 33;
		}

		// Pose clarity: 34 points
		if (qualityFlags.pose === 'clear') {
			score += 34;
		}

		return score;
	}, [qualityFlags]);

	const isReadyForCapture = useMemo(() => {
		// All quality checks must pass
		return qualityScore >= 90;
	}, [qualityScore]);

	const feedbackMessages = useMemo(() => {
		const messages: string[] = [];

		if (qualityFlags.lighting === 'poor') {
			messages.push('Improve lighting for better visibility');
		}

		if (qualityFlags.distance === 'too-close') {
			messages.push('Step back from the camera');
		} else if (qualityFlags.distance === 'too-far') {
			messages.push('Move closer to the camera');
		}

		if (qualityFlags.pose === 'occluded') {
			messages.push(`Ensure full body is visible for ${view} view`);
		}

		if (messages.length === 0) {
			messages.push('Perfect! Hold still...');
		}

		return messages;
	}, [qualityFlags, view]);

	return {
		qualityFlags,
		qualityScore,
		isReadyForCapture,
		feedbackMessages,
	};
}
