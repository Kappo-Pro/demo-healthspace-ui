/**
 * Body Proportion Ratios
 *
 * Calculates proportional metrics and body composition indicators.
 * Ratios are dimensionless (unit-independent).
 *
 * @module utils/bodyMeasurement/ratios
 * @since EPIC-001-S2
 */

/**
 * Ratio Measurement Result
 *
 * @property id - Ratio identifier (e.g., 'waist-to-hip')
 * @property value - Ratio value (dimensionless)
 * @property confidence - Measurement confidence (0-1)
 * @property interpretation - Optional health interpretation
 */
export interface RatioResult {
	/** Ratio identifier */
	id: string;

	/** Ratio value (dimensionless) */
	value: number;

	/** Measurement confidence (0-1) */
	confidence: number;

	/** Optional health interpretation */
	interpretation?: string;
}

/**
 * Calculate shoulder-to-waist ratio
 *
 * Measures upper body taper (V-shape indicator).
 * Ideal male: 1.4-1.6, Female: 1.3-1.4
 *
 * @param shoulderWidth - Shoulder width (cm)
 * @param waistWidth - Waist width (cm)
 * @returns Ratio result
 *
 * @example
 * ```typescript
 * const ratio = shoulderToWaistRatio(45, 32); // Returns 1.41
 * ```
 */
export function shoulderToWaistRatio(
	shoulderWidth: number,
	waistWidth: number
): number {
	if (waistWidth <= 0) {
		throw new Error('Invalid waist width: must be > 0');
	}
	return shoulderWidth / waistWidth;
}

/**
 * Calculate waist-to-hip ratio (WHR)
 *
 * Key health indicator for cardiovascular risk.
 * Healthy male: <0.90, Female: <0.85
 *
 * @param waistCircumference - Waist circumference (cm)
 * @param hipCircumference - Hip circumference (cm)
 * @returns Ratio result with health interpretation
 *
 * @example
 * ```typescript
 * const whr = waistToHipRatio(80, 100); // Returns 0.80
 * ```
 */
export function waistToHipRatio(
	waistCircumference: number,
	hipCircumference: number
): number {
	if (hipCircumference <= 0) {
		throw new Error('Invalid hip circumference: must be > 0');
	}
	return waistCircumference / hipCircumference;
}

/**
 * Interpret waist-to-hip ratio for health risk
 *
 * @param whr - Waist-to-hip ratio
 * @param isMale - true for male, false for female
 * @returns Health risk interpretation
 */
export function interpretWHR(whr: number, isMale: boolean): string {
	if (isMale) {
		if (whr < 0.9) return 'Low risk';
		if (whr < 1.0) return 'Moderate risk';
		return 'High risk';
	} else {
		if (whr < 0.8) return 'Low risk';
		if (whr < 0.85) return 'Moderate risk';
		return 'High risk';
	}
}

/**
 * Calculate arm-to-torso ratio
 *
 * Proportional indicator for upper body balance.
 * Average: 0.7-0.9
 *
 * @param armLength - Upper arm + forearm length (cm)
 * @param torsoLength - Torso length (cm)
 * @returns Ratio value
 */
export function armToTorsoRatio(armLength: number, torsoLength: number): number {
	if (torsoLength <= 0) {
		throw new Error('Invalid torso length: must be > 0');
	}
	return armLength / torsoLength;
}

/**
 * Calculate leg-to-torso ratio
 *
 * Proportional indicator for lower body balance.
 * Average: 1.0-1.3
 *
 * @param legLength - Hip to ankle length (cm)
 * @param torsoLength - Torso length (cm)
 * @returns Ratio value
 */
export function legToTorsoRatio(legLength: number, torsoLength: number): number {
	if (torsoLength <= 0) {
		throw new Error('Invalid torso length: must be > 0');
	}
	return legLength / torsoLength;
}

/**
 * Calculate arm-span-to-height ratio
 *
 * Typically equals 1.0 (±0.03) in adults.
 * Deviations may indicate skeletal proportions or posture issues.
 *
 * @param armSpan - Left wrist to right wrist (cm)
 * @param height - Head to toe height (cm)
 * @returns Ratio value
 */
export function armSpanToHeightRatio(armSpan: number, height: number): number {
	if (height <= 0) {
		throw new Error('Invalid height: must be > 0');
	}
	return armSpan / height;
}

/**
 * Calculate sitting height ratio (leg-to-height)
 *
 * Indicates relative leg length vs. total height.
 * Average: 0.50-0.54 (legs are ~50% of height)
 *
 * @param legLength - Hip to ankle (cm)
 * @param height - Total height (cm)
 * @returns Ratio value
 */
export function sittingHeightRatio(legLength: number, height: number): number {
	if (height <= 0) {
		throw new Error('Invalid height: must be > 0');
	}
	return legLength / height;
}

/**
 * Calculate biacromial-to-biiliac ratio (shoulder-to-hip width)
 *
 * Body shape indicator.
 * Male average: 1.3-1.5, Female average: 1.1-1.3
 *
 * @param shoulderWidth - Shoulder width (cm)
 * @param hipWidth - Hip width (cm)
 * @returns Ratio value
 */
export function biacromialToBiiliacRatio(
	shoulderWidth: number,
	hipWidth: number
): number {
	if (hipWidth <= 0) {
		throw new Error('Invalid hip width: must be > 0');
	}
	return shoulderWidth / hipWidth;
}

/**
 * Calculate ponderal index (height-to-weight ratio)
 *
 * Alternative to BMI. Height³/weight.
 * Useful for clinical assessment when weight is available.
 *
 * Note: Requires external weight input (not from pose)
 *
 * @param heightCm - Height (cm)
 * @param weightKg - Weight (kg)
 * @returns Ponderal index
 */
export function ponderalIndex(heightCm: number, weightKg: number): number {
	if (weightKg <= 0) {
		throw new Error('Invalid weight: must be > 0');
	}
	const heightM = heightCm / 100;
	return heightM / Math.cbrt(weightKg);
}

/**
 * Create ratio result with confidence
 *
 * Wraps ratio calculation with confidence and interpretation.
 *
 * @param id - Ratio identifier
 * @param value - Ratio value
 * @param confidence - Measurement confidence
 * @param interpretation - Optional health interpretation
 * @returns Ratio result object
 */
export function createRatioResult(
	id: string,
	value: number,
	confidence: number,
	interpretation?: string
): RatioResult {
	return {
		id,
		value,
		confidence,
		interpretation,
	};
}

/**
 * Calculate all standard body ratios
 *
 * @param measurements - Object with named measurements (cm)
 * @param confidence - Base confidence score
 * @returns Array of ratio results
 */
export function calculateAllRatios(
	measurements: {
		shoulderWidth: number;
		waistCirc: number;
		hipCirc: number;
		armLength: number;
		legLength: number;
		torsoLength: number;
		armSpan: number;
		height: number;
	},
	confidence = 0.85
): RatioResult[] {
	const ratios: RatioResult[] = [];

	// Shoulder-to-waist (approximate waist from hip)
	if (measurements.shoulderWidth > 0 && measurements.waistCirc > 0) {
		const ratio = shoulderToWaistRatio(
			measurements.shoulderWidth,
			measurements.waistCirc / Math.PI // Convert circumference to approximate width
		);
		ratios.push(createRatioResult('shoulder-to-waist', ratio, confidence * 0.8));
	}

	// Waist-to-hip ratio
	if (measurements.waistCirc > 0 && measurements.hipCirc > 0) {
		const whr = waistToHipRatio(measurements.waistCirc, measurements.hipCirc);
		ratios.push(
			createRatioResult('waist-to-hip', whr, confidence, interpretWHR(whr, true))
		);
	}

	// Arm-to-torso ratio
	if (measurements.armLength > 0 && measurements.torsoLength > 0) {
		const ratio = armToTorsoRatio(measurements.armLength, measurements.torsoLength);
		ratios.push(createRatioResult('arm-to-torso', ratio, confidence));
	}

	// Leg-to-torso ratio
	if (measurements.legLength > 0 && measurements.torsoLength > 0) {
		const ratio = legToTorsoRatio(measurements.legLength, measurements.torsoLength);
		ratios.push(createRatioResult('leg-to-torso', ratio, confidence));
	}

	// Arm-span-to-height ratio
	if (measurements.armSpan > 0 && measurements.height > 0) {
		const ratio = armSpanToHeightRatio(measurements.armSpan, measurements.height);
		ratios.push(createRatioResult('arm-span-to-height', ratio, confidence));
	}

	return ratios;
}
