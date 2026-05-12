/**
 * Bone Mapper Unit Tests
 *
 * Tests bone name normalization from various model sources (Sketchfab, Mixamo).
 *
 * @module organisms/OBodyModel3D/utils/__tests__/boneMapper
 * @since EPIC-001-S15
 */

import * as THREE from 'three';
import { normalizeBoneNames, getCanonicalBoneName } from '../boneMapper';

/**
 * Create mock skeleton with given bone names
 */
function createMockSkeleton(boneNames: string[]): THREE.Skeleton {
	const bones = boneNames.map((name) => {
		const bone = new THREE.Bone();
		bone.name = name;
		return bone;
	});
	return new THREE.Skeleton(bones);
}

describe('boneMapper', () => {
	describe('normalizeBoneNames', () => {
		it('should normalize Mixamo bone names to canonical names', () => {
			const skeleton = createMockSkeleton([
				'mixamorigSpine_02',
				'mixamorigLeftArm_09',
				'mixamorigLeftForeArm_010',
				'mixamorigRightArm_033',
				'mixamorigRightForeArm_034',
				'mixamorigLeftUpLeg_056',
				'mixamorigLeftLeg_00',
				'mixamorigRightUpLeg_060',
				'mixamorigRightLeg_061',
			]);

			normalizeBoneNames(skeleton);

			const boneNames = skeleton.bones.map(b => b.name);

			expect(boneNames).toContain('spine');
			expect(boneNames).toContain('upperArm_L');
			expect(boneNames).toContain('lowerArm_L');
			expect(boneNames).toContain('upperArm_R');
			expect(boneNames).toContain('lowerArm_R');
			expect(boneNames).toContain('thigh_L');
			expect(boneNames).toContain('calf_L');
			expect(boneNames).toContain('thigh_R');
			expect(boneNames).toContain('calf_R');
		});

		it('should normalize Sketchfab bone names to canonical names', () => {
			const skeleton = createMockSkeleton([
				'Spine',
				'LeftUpperArm',
				'LeftForearm',
				'RightUpperArm',
				'RightForearm',
				'LeftThigh',
				'LeftCalf',
				'RightThigh',
				'RightCalf',
			]);

			normalizeBoneNames(skeleton);

			const boneNames = skeleton.bones.map(b => b.name);

			expect(boneNames).toContain('spine');
			expect(boneNames).toContain('upperArm_L');
			expect(boneNames).toContain('lowerArm_L');
			expect(boneNames).toContain('upperArm_R');
			expect(boneNames).toContain('lowerArm_R');
			expect(boneNames).toContain('thigh_L');
			expect(boneNames).toContain('calf_L');
			expect(boneNames).toContain('thigh_R');
			expect(boneNames).toContain('calf_R');
		});

		it('should throw error if critical bones are missing', () => {
			const skeleton = createMockSkeleton([
				'mixamorigSpine_02',
				// Missing arm/leg bones
			]);

			expect(() => normalizeBoneNames(skeleton)).toThrow(
				/Missing critical bones/
			);
		});

		it('should handle extra bones not in mapping', () => {
			const skeleton = createMockSkeleton([
				'mixamorigSpine_02',
				'mixamorigLeftArm_09',
				'mixamorigLeftForeArm_010',
				'mixamorigRightArm_033',
				'mixamorigRightForeArm_034',
				'mixamorigLeftUpLeg_056',
				'mixamorigLeftLeg_00',
				'mixamorigRightUpLeg_060',
				'mixamorigRightLeg_061',
				'SomeUnknownBone', // Should be ignored
				'AnotherExtraBone',
			]);

			expect(() => normalizeBoneNames(skeleton)).not.toThrow();

			const boneNames = skeleton.bones.map(b => b.name);

			// Extra bones should keep original names
			expect(boneNames).toContain('SomeUnknownBone');
			expect(boneNames).toContain('AnotherExtraBone');
		});

		it('should only rename first match for each canonical name', () => {
			const skeleton = createMockSkeleton([
				'mixamorigSpine_02',
				'mixamorigSpine1_03', // Also maps to spine
				'mixamorigLeftArm_09',
				'mixamorigLeftForeArm_010',
				'mixamorigRightArm_033',
				'mixamorigRightForeArm_034',
				'mixamorigLeftUpLeg_056',
				'mixamorigLeftLeg_00',
				'mixamorigRightUpLeg_060',
				'mixamorigRightLeg_061',
			]);

			normalizeBoneNames(skeleton);

			const boneNames = skeleton.bones.map(b => b.name);
			const spineCount = boneNames.filter(name => name === 'spine').length;

			// Only first match should be renamed to 'spine'
			expect(spineCount).toBe(1);
			// Second spine variant maps to 'spine1' (different canonical name)
			expect(boneNames).toContain('spine1');
		});
	});

	describe('getCanonicalBoneName', () => {
		it('should return canonical name for Mixamo bone', () => {
			expect(getCanonicalBoneName('mixamorigLeftArm_09')).toBe('upperArm_L');
			expect(getCanonicalBoneName('mixamorigLeftForeArm_010')).toBe('lowerArm_L');
			expect(getCanonicalBoneName('mixamorigLeftUpLeg_056')).toBe('thigh_L');
			expect(getCanonicalBoneName('mixamorigLeftLeg_00')).toBe('calf_L');
		});

		it('should return canonical name for Sketchfab bone', () => {
			expect(getCanonicalBoneName('LeftUpperArm')).toBe('upperArm_L');
			expect(getCanonicalBoneName('LeftForearm')).toBe('lowerArm_L');
			expect(getCanonicalBoneName('LeftThigh')).toBe('thigh_L');
			expect(getCanonicalBoneName('LeftCalf')).toBe('calf_L');
		});

		it('should return null for unknown bone name', () => {
			expect(getCanonicalBoneName('UnknownBone')).toBeNull();
			expect(getCanonicalBoneName('SomethingElse')).toBeNull();
		});
	});
});
