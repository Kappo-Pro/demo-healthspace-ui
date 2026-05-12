/**
 * Bone Scaling Utilities
 *
 * Maps body measurements to bone transformations for skinned mesh.
 *
 * @module organisms/OBodyModel3D/utils/boneScaling
 * @since EPIC-001-S14
 */

import * as THREE from 'three';

/**
 * Bone scale data for skinned mesh
 */
export interface BoneScale {
	/** Bone name */
	name: string;
	/** Scale factor for length (Y-axis) */
	scaleY: number;
	/** Scale factor for width/depth (X/Z-axis) */
	scaleXZ: number;
}

/**
 * Complete bone scaling configuration
 */
export interface BoneScalingConfig {
	/** Individual bone scales */
	bones: BoneScale[];
	/** Overall body height scale */
	heightScale: number;
	/** Overall body width scale */
	widthScale: number;
}

/**
 * Default measurement values (cm) for normalization
 *
 * Based on average adult measurements (50th percentile).
 */
const DEFAULT_MEASUREMENTS = {
	'torso-length': 60,
	'chest-circumference': 90,
	'waist-circumference': 75,
	'hip-circumference': 95,
	'left-upper-arm-length': 30,
	'right-upper-arm-length': 30,
	'left-forearm-length': 25,
	'right-forearm-length': 25,
	'left-bicep-circumference': 28,
	'right-bicep-circumference': 28,
	'left-forearm-circumference': 24,
	'right-forearm-circumference': 24,
	'left-thigh-length': 40,
	'right-thigh-length': 40,
	'left-calf-length': 35,
	'right-calf-length': 35,
	'left-thigh-circumference': 55,
	'right-thigh-circumference': 55,
	'left-calf-circumference': 35,
	'right-calf-circumference': 35,
	'neck-length': 10,
} as const;

/**
 * Measurement type for bone scaling
 */
export interface Measurement {
	id: string;
	type: 'segment' | 'circumference' | 'ratio' | 'symmetry';
	label: string;
	value: number;
	unit: 'cm' | 'in' | 'ratio';
	confidence: number;
	landmarks?: string[];
}

/**
 * Calculate bone scaling configuration from measurements
 *
 * Maps flat measurement array to bone scale factors.
 *
 * @param measurements - Body measurements array
 * @returns Bone scaling configuration for skinned mesh
 *
 * @example
 * ```ts
 * const config = calculateBoneScaling(measurements);
 * // Apply to skeleton
 * skeleton.bones.forEach(bone => {
 *   const scale = config.bones.find(b => b.name === bone.name);
 *   if (scale) {
 *     bone.scale.set(scale.scaleXZ, scale.scaleY, scale.scaleXZ);
 *   }
 * });
 * ```
 */
export function calculateBoneScaling(
	measurements: Measurement[],
): BoneScalingConfig {
	// Helper to get measurement value or default
	const getMeasurement = (id: string): number => {
		const m = measurements.find(m => m.id === id);
		return m?.value || DEFAULT_MEASUREMENTS[id as keyof typeof DEFAULT_MEASUREMENTS] || 0;
	};

	// Helper to calculate scale ratio
	const scaleRatio = (id: string): number => {
		const value = getMeasurement(id);
		const defaultValue = DEFAULT_MEASUREMENTS[id as keyof typeof DEFAULT_MEASUREMENTS];
		return defaultValue ? value / defaultValue : 1.0;
	};

	// Helper to calculate width scale from circumference
	const circumferenceScale = (id: string): number => {
		// Circumference = 2πr, so scale = √(C1/C2) for area-based scaling
		const value = getMeasurement(id);
		const defaultValue = DEFAULT_MEASUREMENTS[id as keyof typeof DEFAULT_MEASUREMENTS];
		return defaultValue ? Math.sqrt(value / defaultValue) : 1.0;
	};

	// Calculate individual bone scales
	const bones: BoneScale[] = [
		// Spine (3 segments for torso)
		{
			name: 'spine',
			scaleY: scaleRatio('torso-length'),
			scaleXZ: (circumferenceScale('chest-circumference') + circumferenceScale('waist-circumference')) / 2,
		},
		{
			name: 'spine1',
			scaleY: scaleRatio('torso-length'),
			scaleXZ: circumferenceScale('waist-circumference'),
		},
		{
			name: 'spine2',
			scaleY: scaleRatio('torso-length'),
			scaleXZ: circumferenceScale('chest-circumference'),
		},

		// Head/Neck
		{
			name: 'neck',
			scaleY: scaleRatio('neck-length'),
			scaleXZ: 1.0, // Keep neck proportional
		},
		{
			name: 'head',
			scaleY: 1.0, // Keep head proportional
			scaleXZ: 1.0,
		},

		// Left Arm
		{
			name: 'upperArm_L',
			scaleY: scaleRatio('left-upper-arm-length'),
			scaleXZ: circumferenceScale('left-bicep-circumference'),
		},
		{
			name: 'lowerArm_L',
			scaleY: scaleRatio('left-forearm-length'),
			scaleXZ: circumferenceScale('left-forearm-circumference'),
		},

		// Right Arm
		{
			name: 'upperArm_R',
			scaleY: scaleRatio('right-upper-arm-length'),
			scaleXZ: circumferenceScale('right-bicep-circumference'),
		},
		{
			name: 'lowerArm_R',
			scaleY: scaleRatio('right-forearm-length'),
			scaleXZ: circumferenceScale('right-forearm-circumference'),
		},

		// Left Leg
		{
			name: 'thigh_L',
			scaleY: scaleRatio('left-thigh-length'),
			scaleXZ: circumferenceScale('left-thigh-circumference'),
		},
		{
			name: 'calf_L',
			scaleY: scaleRatio('left-calf-length'),
			scaleXZ: circumferenceScale('left-calf-circumference'),
		},

		// Right Leg
		{
			name: 'thigh_R',
			scaleY: scaleRatio('right-thigh-length'),
			scaleXZ: circumferenceScale('right-thigh-circumference'),
		},
		{
			name: 'calf_R',
			scaleY: scaleRatio('right-calf-length'),
			scaleXZ: circumferenceScale('right-calf-circumference'),
		},
	];

	// Calculate overall body scales
	const heightScale =
		(scaleRatio('torso-length') +
			scaleRatio('left-thigh-length') +
			scaleRatio('left-calf-length')) /
		3;

	const widthScale =
		(circumferenceScale('chest-circumference') +
			circumferenceScale('waist-circumference') +
			circumferenceScale('hip-circumference')) /
		3;

	return {
		bones,
		heightScale,
		widthScale,
	};
}

/**
 * Apply bone scaling to Three.js skeleton
 *
 * Directly modifies skeleton bone scales based on measurements.
 *
 * @param skeleton - Three.js Skeleton instance
 * @param config - Bone scaling configuration
 *
 * @example
 * ```ts
 * const config = calculateBoneScaling(measurements);
 * applyBoneScaling(mesh.skeleton, config);
 * ```
 */
export function applyBoneScaling(
	skeleton: THREE.Skeleton,
	config: BoneScalingConfig,
): void {
	config.bones.forEach(boneScale => {
		const bone = skeleton.bones.find(b => b.name === boneScale.name);
		if (bone) {
			bone.scale.set(boneScale.scaleXZ, boneScale.scaleY, boneScale.scaleXZ);
		}
	});
}

/**
 * Validation result
 */
export interface ValidationResult {
	valid: boolean;
	warnings: string[];
}

/**
 * Validate measurement accuracy for bone scaling
 *
 * Checks if measurements are within reasonable bounds (±50% of defaults).
 *
 * @param measurements - Body measurements
 * @returns Validation result with warnings
 */
export function validateMeasurements(
	measurements: Measurement[],
): ValidationResult {
	const warnings: string[] = [];

	measurements.forEach(m => {
		const defaultValue = DEFAULT_MEASUREMENTS[m.id as keyof typeof DEFAULT_MEASUREMENTS];
		if (!defaultValue) return;

		const ratio = m.value / defaultValue;

		// Check if measurement is within ±50% of default (reasonable human variation)
		if (ratio < 0.5 || ratio > 1.5) {
			warnings.push(
				`${m.label}: ${m.value}${m.unit} is ${ratio < 0.5 ? 'too small' : 'too large'} (expected ~${defaultValue}${m.unit})`,
			);
		}

		// Check confidence score
		if (m.confidence < 0.7) {
			warnings.push(`${m.label}: Low confidence (${(m.confidence * 100).toFixed(0)}%)`);
		}
	});

	return {
		valid: warnings.length === 0,
		warnings,
	};
}
