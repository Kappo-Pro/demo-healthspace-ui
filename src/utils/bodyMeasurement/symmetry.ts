/**
 * Bilateral Symmetry Analysis
 *
 * Compares left-right body measurements for imbalance detection.
 * Useful for physical therapy, posture analysis, and injury assessment.
 *
 * @module utils/bodyMeasurement/symmetry
 * @since EPIC-001-S2
 */

/**
 * Symmetry Analysis Result
 *
 * @property id - Symmetry measurement identifier (e.g., 'arm-symmetry')
 * @property leftValue - Left side measurement (cm)
 * @property rightValue - Right side measurement (cm)
 * @property difference - Absolute difference (cm)
 * @property percentDiff - Percentage difference (%)
 * @property isBalanced - true if within normal range (< 5%)
 * @property confidence - Measurement confidence (0-1)
 */
export interface SymmetryResult {
	/** Symmetry measurement identifier */
	id: string;

	/** Left side measurement (cm) */
	leftValue: number;

	/** Right side measurement (cm) */
	rightValue: number;

	/** Absolute difference (cm) */
	difference: number;

	/** Percentage difference (%) */
	percentDiff: number;

	/** true if within normal range */
	isBalanced: boolean;

	/** Measurement confidence (0-1) */
	confidence: number;
}

/**
 * Calculate bilateral symmetry between left and right measurements
 *
 * Normal asymmetry: <5% (clinical threshold)
 * Moderate: 5-10%, Significant: >10%
 *
 * @param leftMeasurement - Left side measurement (cm)
 * @param rightMeasurement - Right side measurement (cm)
 * @returns Symmetry metrics
 *
 * @example
 * ```typescript
 * const symmetry = bilateralSymmetry(45.2, 46.1);
 * // { difference: 0.9, percentDiff: 1.96 }
 * ```
 */
export function bilateralSymmetry(
	leftMeasurement: number,
	rightMeasurement: number
): { difference: number; percentDiff: number } {
	const difference = Math.abs(leftMeasurement - rightMeasurement);
	const average = (leftMeasurement + rightMeasurement) / 2;

	// Prevent division by zero
	const percentDiff = average > 0 ? (difference / average) * 100 : 0;

	return { difference, percentDiff };
}

/**
 * Create symmetry result with full metadata
 *
 * @param id - Symmetry identifier
 * @param leftValue - Left side measurement
 * @param rightValue - Right side measurement
 * @param confidence - Measurement confidence
 * @param balanceThreshold - Asymmetry threshold % (default: 5%)
 * @returns Complete symmetry result
 */
export function createSymmetryResult(
	id: string,
	leftValue: number,
	rightValue: number,
	confidence: number,
	balanceThreshold = 5.0
): SymmetryResult {
	const { difference, percentDiff } = bilateralSymmetry(leftValue, rightValue);
	const isBalanced = percentDiff < balanceThreshold;

	return {
		id,
		leftValue,
		rightValue,
		difference,
		percentDiff,
		isBalanced,
		confidence,
	};
}

/**
 * Analyze arm symmetry (shoulder to wrist)
 *
 * Detects left-right arm length imbalances.
 * Common causes: injury, posture, handedness effects.
 *
 * @param leftArmLength - Left arm length (cm)
 * @param rightArmLength - Right arm length (cm)
 * @param confidence - Measurement confidence
 * @returns Arm symmetry result
 */
export function armSymmetry(
	leftArmLength: number,
	rightArmLength: number,
	confidence: number
): SymmetryResult {
	return createSymmetryResult('arm-symmetry', leftArmLength, rightArmLength, confidence);
}

/**
 * Analyze leg symmetry (hip to ankle)
 *
 * Detects leg length discrepancies (LLD).
 * Clinical significance: >1cm may require intervention.
 *
 * @param leftLegLength - Left leg length (cm)
 * @param rightLegLength - Right leg length (cm)
 * @param confidence - Measurement confidence
 * @returns Leg symmetry result
 */
export function legSymmetry(
	leftLegLength: number,
	rightLegLength: number,
	confidence: number
): SymmetryResult {
	return createSymmetryResult('leg-symmetry', leftLegLength, rightLegLength, confidence);
}

/**
 * Analyze shoulder height symmetry
 *
 * Detects shoulder elevation differences.
 * Indicators: scoliosis, muscle imbalance, injury.
 *
 * @param leftShoulderHeight - Left shoulder Y-coordinate (cm)
 * @param rightShoulderHeight - Right shoulder Y-coordinate (cm)
 * @param confidence - Measurement confidence
 * @returns Shoulder symmetry result
 */
export function shoulderSymmetry(
	leftShoulderHeight: number,
	rightShoulderHeight: number,
	confidence: number
): SymmetryResult {
	return createSymmetryResult(
		'shoulder-symmetry',
		leftShoulderHeight,
		rightShoulderHeight,
		confidence,
		3.0 // Tighter threshold for height (3%)
	);
}

/**
 * Analyze hip height symmetry
 *
 * Detects pelvic tilt or leg length discrepancy.
 *
 * @param leftHipHeight - Left hip Y-coordinate (cm)
 * @param rightHipHeight - Right hip Y-coordinate (cm)
 * @param confidence - Measurement confidence
 * @returns Hip symmetry result
 */
export function hipSymmetry(
	leftHipHeight: number,
	rightHipHeight: number,
	confidence: number
): SymmetryResult {
	return createSymmetryResult(
		'hip-symmetry',
		leftHipHeight,
		rightHipHeight,
		confidence,
		3.0 // Tighter threshold
	);
}

/**
 * Analyze thigh symmetry
 *
 * Detects muscle imbalances in upper leg.
 *
 * @param leftThighLength - Left thigh length (cm)
 * @param rightThighLength - Right thigh length (cm)
 * @param confidence - Measurement confidence
 * @returns Thigh symmetry result
 */
export function thighSymmetry(
	leftThighLength: number,
	rightThighLength: number,
	confidence: number
): SymmetryResult {
	return createSymmetryResult(
		'thigh-symmetry',
		leftThighLength,
		rightThighLength,
		confidence
	);
}

/**
 * Analyze calf symmetry
 *
 * Detects muscle imbalances in lower leg.
 *
 * @param leftCalfLength - Left calf length (cm)
 * @param rightCalfLength - Right calf length (cm)
 * @param confidence - Measurement confidence
 * @returns Calf symmetry result
 */
export function calfSymmetry(
	leftCalfLength: number,
	rightCalfLength: number,
	confidence: number
): SymmetryResult {
	return createSymmetryResult(
		'calf-symmetry',
		leftCalfLength,
		rightCalfLength,
		confidence
	);
}

/**
 * Analyze wrist symmetry
 *
 * Detects wrist position differences (posture indicator).
 *
 * @param leftWristHeight - Left wrist Y-coordinate (cm)
 * @param rightWristHeight - Right wrist Y-coordinate (cm)
 * @param confidence - Measurement confidence
 * @returns Wrist symmetry result
 */
export function wristSymmetry(
	leftWristHeight: number,
	rightWristHeight: number,
	confidence: number
): SymmetryResult {
	return createSymmetryResult(
		'wrist-symmetry',
		leftWristHeight,
		rightWristHeight,
		confidence,
		10.0 // Looser threshold (wrists vary with arm position)
	);
}

/**
 * Classify symmetry severity
 *
 * @param percentDiff - Percentage difference
 * @returns Severity classification
 */
export function classifySymmetrySeverity(percentDiff: number): string {
	if (percentDiff < 5) return 'normal';
	if (percentDiff < 10) return 'moderate';
	return 'significant';
}

/**
 * Calculate overall body symmetry score
 *
 * Aggregates multiple symmetry metrics into single score.
 * Score: 0-100 (100 = perfect symmetry)
 *
 * @param symmetryResults - Array of symmetry results
 * @returns Overall symmetry score (0-100)
 */
export function overallSymmetryScore(symmetryResults: SymmetryResult[]): number {
	if (symmetryResults.length === 0) return 0;

	// Calculate average asymmetry
	const avgAsymmetry =
		symmetryResults.reduce((sum, result) => sum + result.percentDiff, 0) /
		symmetryResults.length;

	// Convert to score (0% asymmetry = 100 score, 20% asymmetry = 0 score)
	const score = Math.max(0, 100 - avgAsymmetry * 5);

	return Math.round(score);
}

/**
 * Identify most asymmetric body parts
 *
 * Sorts symmetry results by percentage difference (descending).
 * Returns top N most asymmetric measurements.
 *
 * @param symmetryResults - Array of symmetry results
 * @param topN - Number of top results to return (default: 3)
 * @returns Sorted array of most asymmetric measurements
 */
export function identifyAsymmetricParts(
	symmetryResults: SymmetryResult[],
	topN = 3
): SymmetryResult[] {
	return symmetryResults
		.filter(result => !result.isBalanced)
		.sort((a, b) => b.percentDiff - a.percentDiff)
		.slice(0, topN);
}
