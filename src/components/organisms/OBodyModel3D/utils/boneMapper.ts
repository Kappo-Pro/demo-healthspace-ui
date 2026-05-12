/**
 * Bone Mapper Utility
 *
 * Normalizes bone names from various model sources (Sketchfab, Mixamo)
 * to canonical names used in measurement-based bone scaling.
 *
 * @module organisms/OBodyModel3D/utils/boneMapper
 * @since EPIC-001-S15
 */

import * as THREE from 'three';

/**
 * Bone name mapping configuration
 * Maps canonical names to model-specific variants
 *
 * Based on model-bone-hierarchy.md analysis
 */
const BONE_NAME_MAPPINGS: Record<string, string[]> = {
	// Spine/Torso
	spine: ['mixamorigSpine_02', 'Spine', 'spine', 'Spine1'],
	spine1: ['mixamorigSpine1_03', 'Spine1', 'spine1'],
	spine2: ['mixamorigSpine2_04', 'Spine2', 'spine2'],
	neck: ['mixamorigNeck_05', 'Neck', 'neck'],

	// Left Arm
	upperArm_L: ['mixamorigLeftArm_09', 'LeftUpperArm', 'Arm_L_Upper', 'L_UpperArm', 'LeftArm'],
	lowerArm_L: ['mixamorigLeftForeArm_010', 'LeftForearm', 'Arm_L_Lower', 'L_Forearm', 'LeftForeArm'],

	// Right Arm
	upperArm_R: ['mixamorigRightArm_033', 'RightUpperArm', 'Arm_R_Upper', 'R_UpperArm', 'RightArm'],
	lowerArm_R: ['mixamorigRightForeArm_034', 'RightForearm', 'Arm_R_Lower', 'R_Forearm', 'RightForeArm'],

	// Left Leg
	thigh_L: ['mixamorigLeftUpLeg_056', 'LeftThigh', 'Leg_L_Upper', 'L_Thigh', 'LeftUpLeg'],
	calf_L: ['mixamorigLeftLeg_00', 'LeftCalf', 'Leg_L_Lower', 'L_Calf', 'LeftLeg'], // NOTE: Mixamo uses "Leg" not "Calf"

	// Right Leg
	thigh_R: ['mixamorigRightUpLeg_060', 'RightThigh', 'Leg_R_Upper', 'R_Thigh', 'RightUpLeg'],
	calf_R: ['mixamorigRightLeg_061', 'RightCalf', 'Leg_R_Lower', 'R_Calf', 'RightLeg'], // NOTE: Mixamo uses "Leg" not "Calf"
};

/**
 * Critical bones that MUST be present for measurement-based scaling
 */
const CRITICAL_BONES = [
	'spine',
	'upperArm_L',
	'lowerArm_L',
	'upperArm_R',
	'lowerArm_R',
	'thigh_L',
	'calf_L',
	'thigh_R',
	'calf_R',
];

/**
 * Normalize bone names in skeleton to canonical names
 *
 * Renames bones to match canonical naming used in boneMap (SkinnedMeshBody.tsx:227-241).
 * Throws error if critical bones missing.
 *
 * @param skeleton - Three.js skeleton with model-specific bone names
 * @throws Error if critical bones are missing
 *
 * @example
 * ```typescript
 * const mesh = await loadPreRiggedHumanoid('/models/human.glb');
 * normalizeBoneNames(mesh.skeleton); // Renames bones in-place
 * ```
 */
export function normalizeBoneNames(skeleton: THREE.Skeleton): void {

	const foundMappings: Record<string, boolean> = {};

	// Iterate through each canonical name and find matching model bones
	for (const [canonicalName, variants] of Object.entries(BONE_NAME_MAPPINGS)) {
		let found = false;

		for (const bone of skeleton.bones) {
			// Check if bone matches any variant
			if (variants.includes(bone.name)) {
				bone.name = canonicalName;
				foundMappings[canonicalName] = true;
				found = true;
				break; // Only rename first match
			}
		}

		if (!found) {
			console.warn(`[BoneMapper] No match found for canonical name "${canonicalName}"`);
		}
	}

	// Validate critical bones
	const missingCritical = CRITICAL_BONES.filter(name => !foundMappings[name]);

	if (missingCritical.length > 0) {
		const error = new Error(
			`[BoneMapper] Missing critical bones: ${missingCritical.join(', ')}`
		);
		console.error(error.message);
		throw error;
	}

}

/**
 * Get canonical bone name from model-specific variant
 *
 * Utility for testing/debugging bone name mappings.
 *
 * @param modelBoneName - Model-specific bone name
 * @returns Canonical name or null if no mapping found
 */
export function getCanonicalBoneName(modelBoneName: string): string | null {
	for (const [canonicalName, variants] of Object.entries(BONE_NAME_MAPPINGS)) {
		if (variants.includes(modelBoneName)) {
			return canonicalName;
		}
	}
	return null;
}
