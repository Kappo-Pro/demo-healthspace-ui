/**
 * Procedural Humanoid Mesh Generator
 *
 * Creates a simple skinned humanoid mesh programmatically without external assets.
 * Optimized for performance (<10k triangles) and measurement-based deformation.
 *
 * @module organisms/OBodyModel3D/utils/humanoidMesh
 * @since EPIC-001-S14
 */

import * as THREE from 'three';

/**
 * Bone configuration for humanoid skeleton
 */
interface BoneConfig {
	name: string;
	parent: string | null;
	position: THREE.Vector3;
	length: number;
}

/**
 * Humanoid skeleton configuration
 *
 * Defines 15 bones matching standard humanoid rig.
 */
const SKELETON_CONFIG: BoneConfig[] = [
	// Root
	{ name: 'hips', parent: null, position: new THREE.Vector3(0, 0.8, 0), length: 0.1 },

	// Spine (3 segments)
	{ name: 'spine', parent: 'hips', position: new THREE.Vector3(0, 0.1, 0), length: 0.2 },
	{ name: 'spine1', parent: 'spine', position: new THREE.Vector3(0, 0.2, 0), length: 0.15 },
	{ name: 'spine2', parent: 'spine1', position: new THREE.Vector3(0, 0.15, 0), length: 0.15 },

	// Neck/Head
	{ name: 'neck', parent: 'spine2', position: new THREE.Vector3(0, 0.15, 0), length: 0.1 },
	{ name: 'head', parent: 'neck', position: new THREE.Vector3(0, 0.1, 0), length: 0.2 },

	// Left Arm
	{
		name: 'upperArm_L',
		parent: 'spine2',
		position: new THREE.Vector3(-0.15, 0.1, 0),
		length: 0.3,
	},
	{
		name: 'lowerArm_L',
		parent: 'upperArm_L',
		position: new THREE.Vector3(0, -0.3, 0),
		length: 0.25,
	},

	// Right Arm
	{
		name: 'upperArm_R',
		parent: 'spine2',
		position: new THREE.Vector3(0.15, 0.1, 0),
		length: 0.3,
	},
	{
		name: 'lowerArm_R',
		parent: 'upperArm_R',
		position: new THREE.Vector3(0, -0.3, 0),
		length: 0.25,
	},

	// Left Leg
	{ name: 'thigh_L', parent: 'hips', position: new THREE.Vector3(-0.1, -0.05, 0), length: 0.4 },
	{ name: 'calf_L', parent: 'thigh_L', position: new THREE.Vector3(0, -0.4, 0), length: 0.35 },

	// Right Leg
	{ name: 'thigh_R', parent: 'hips', position: new THREE.Vector3(0.1, -0.05, 0), length: 0.4 },
	{ name: 'calf_R', parent: 'thigh_R', position: new THREE.Vector3(0, -0.4, 0), length: 0.35 },
];

/**
 * Create humanoid skeleton from configuration
 *
 * @returns Array of bones in hierarchical order
 */
function createSkeleton(): THREE.Bone[] {
	const bones: THREE.Bone[] = [];
	const boneMap = new Map<string, THREE.Bone>();

	// Create all bones
	SKELETON_CONFIG.forEach(config => {
		const bone = new THREE.Bone();
		bone.name = config.name;
		bone.position.copy(config.position);
		bones.push(bone);
		boneMap.set(config.name, bone);
	});

	// Build hierarchy
	SKELETON_CONFIG.forEach(config => {
		if (config.parent) {
			const parentBone = boneMap.get(config.parent);
			const bone = boneMap.get(config.name);
			if (parentBone && bone) {
				parentBone.add(bone);
			}
		}
	});

	return bones;
}

/**
 * Create anatomically curved profile for torso
 *
 * Generates organic curves: chest expansion → waist → hips
 *
 * @param height - Torso height
 * @param segments - Number of vertical segments
 * @returns Array of {y, radius} points defining torso contour
 */
function createTorsoProfile(height: number, segments: number): Array<{ y: number; radius: number }> {
	const profile: Array<{ y: number; radius: number }> = [];

	for (let i = 0; i <= segments; i++) {
		const t = i / segments; // 0 = bottom (hips), 1 = top (shoulders)
		const y = t * height;

		// Anatomical curve: hips → waist → chest → shoulders
		// Using sine curve for organic shape
		let radius: number;

		if (t < 0.3) {
			// Hips region (0-30%): widest at bottom
			radius = 0.16 + Math.sin(t * Math.PI * 3.3) * 0.03;
		} else if (t < 0.6) {
			// Waist region (30-60%): narrowest point
			const waistT = (t - 0.3) / 0.3;
			radius = 0.11 - Math.sin(waistT * Math.PI) * 0.02;
		} else {
			// Chest/shoulders (60-100%): moderate width
			const chestT = (t - 0.6) / 0.4;
			radius = 0.12 + Math.sin(chestT * Math.PI * 0.5) * 0.04;
		}

		profile.push({ y, radius });
	}

	return profile;
}

/**
 * Create anatomically curved profile for limbs
 *
 * Adds muscle bulge in middle section
 *
 * @param height - Limb length
 * @param radiusTop - Radius at joint (shoulder/hip)
 * @param radiusBottom - Radius at extremity (wrist/ankle)
 * @param segments - Number of vertical segments
 * @param muscleBulge - Muscle definition amount (0-1)
 * @returns Array of {y, radius} points
 */
function createLimbProfile(
	height: number,
	radiusTop: number,
	radiusBottom: number,
	segments: number,
	muscleBulge: number = 0.15
): Array<{ y: number; radius: number }> {
	const profile: Array<{ y: number; radius: number }> = [];

	for (let i = 0; i <= segments; i++) {
		const t = i / segments;
		const y = t * height;

		// Base taper
		const baseRadius = radiusTop + (radiusBottom - radiusTop) * t;

		// Add muscle bulge in middle (bicep/thigh)
		// Peak at 40% down for realistic muscle placement
		const bulgeFactor = Math.sin((1 - Math.abs(t - 0.4) * 2.5) * Math.PI * 0.5);
		const radius = baseRadius + (radiusTop * muscleBulge * bulgeFactor);

		profile.push({ y, radius });
	}

	return profile;
}

/**
 * Generate vertices/indices for lathe geometry from profile
 *
 * @param profile - Array of {y, radius} points
 * @param center - Center position (x, z)
 * @param radialSegments - Smoothness around circumference
 * @param boneIndex - Bone for skinning
 * @returns Geometry data arrays
 */
function generateLatheGeometry(
	profile: Array<{ y: number; radius: number }>,
	center: { x: number; z: number },
	radialSegments: number,
	boneIndex: number
): {
	positions: number[];
	normals: number[];
	skinIndices: number[];
	skinWeights: number[];
	indices: number[];
} {
	const positions: number[] = [];
	const normals: number[] = [];
	const skinIndices: number[] = [];
	const skinWeights: number[] = [];
	const indices: number[] = [];

	const vertexOffset = 0;

	// Generate vertices
	profile.forEach((point, heightIdx) => {
		const { y, radius } = point;

		for (let radialIdx = 0; radialIdx <= radialSegments; radialIdx++) {
			const u = radialIdx / radialSegments;
			const theta = u * Math.PI * 2;

			const x = center.x + Math.cos(theta) * radius;
			const z = center.z + Math.sin(theta) * radius;

			positions.push(x, y, z);

			// Calculate normal (perpendicular to surface)
			// Approximate using neighboring profile points
			let normalY = 0;
			if (heightIdx > 0 && heightIdx < profile.length - 1) {
				const prevR = profile[heightIdx - 1].radius;
				const nextR = profile[heightIdx + 1].radius;
				const prevY = profile[heightIdx - 1].y;
				const nextY = profile[heightIdx + 1].y;
				normalY = -(nextR - prevR) / (nextY - prevY);
			}

			const nx = Math.cos(theta);
			const nz = Math.sin(theta);
			const length = Math.sqrt(nx * nx + normalY * normalY + nz * nz);

			normals.push(nx / length, normalY / length, nz / length);

			// Skin weights (100% to single bone)
			skinIndices.push(boneIndex, 0, 0, 0);
			skinWeights.push(1, 0, 0, 0);
		}
	});

	// Generate indices
	const heightSegments = profile.length - 1;
	for (let y = 0; y < heightSegments; y++) {
		for (let x = 0; x < radialSegments; x++) {
			const a = vertexOffset + y * (radialSegments + 1) + x;
			const b = vertexOffset + (y + 1) * (radialSegments + 1) + x;
			const c = vertexOffset + (y + 1) * (radialSegments + 1) + x + 1;
			const d = vertexOffset + y * (radialSegments + 1) + x + 1;

			indices.push(a, b, d);
			indices.push(b, c, d);
		}
	}

	return { positions, normals, skinIndices, skinWeights, indices };
}

/**
 * Create procedural humanoid geometry
 *
 * Generates anatomically realistic mesh using organic curves.
 * Target: <10k triangles for 60fps performance.
 *
 * @returns BufferGeometry with position, normal, skinIndex, skinWeight attributes
 */
function createHumanoidGeometry(): THREE.BufferGeometry {
	const geometry = new THREE.BufferGeometry();

	const allPositions: number[] = [];
	const allNormals: number[] = [];
	const allSkinIndices: number[] = [];
	const allSkinWeights: number[] = [];
	const allIndices: number[] = [];

	let globalVertexOffset = 0;

	// Helper to add geometry part
	const addGeometryPart = (part: ReturnType<typeof generateLatheGeometry>) => {
		allPositions.push(...part.positions);
		allNormals.push(...part.normals);
		allSkinIndices.push(...part.skinIndices);
		allSkinWeights.push(...part.skinWeights);

		// Offset indices
		part.indices.forEach(idx => {
			allIndices.push(idx + globalVertexOffset);
		});

		globalVertexOffset += part.positions.length / 3;
	};

	// 1. TORSO - anatomical curve (hips → waist → chest → shoulders)
	const torsoProfile = createTorsoProfile(0.65, 8); // 8 segments for smooth curve
	const torsoGeom = generateLatheGeometry(
		torsoProfile.map(p => ({ y: p.y + 0.75, radius: p.radius })),
		{ x: 0, z: 0 },
		20, // high radial segments for smooth torso
		1 // spine bone
	);
	addGeometryPart(torsoGeom);

	// 2. HEAD - sphere (smooth)
	const headGeom = new THREE.SphereGeometry(0.11, 16, 16);
	const headPositions = headGeom.attributes.position.array;
	const headNormals = headGeom.attributes.normal.array;
	const headIndices = headGeom.index?.array || [];

	for (let i = 0; i < headPositions.length; i += 3) {
		allPositions.push(
			headPositions[i],
			headPositions[i + 1] + 1.5, // offset to neck position
			headPositions[i + 2]
		);
		allNormals.push(headNormals[i], headNormals[i + 1], headNormals[i + 2]);
		allSkinIndices.push(5, 0, 0, 0); // head bone
		allSkinWeights.push(1, 0, 0, 0);
	}

	headIndices.forEach(idx => {
		allIndices.push(idx + globalVertexOffset);
	});
	globalVertexOffset += headPositions.length / 3;

	// 3. LIMBS - with muscle definition
	const limbConfigs = [
		// Left upper arm
		{
			profile: createLimbProfile(0.3, 0.045, 0.065, 5, 0.18),
			center: { x: -0.15, z: 0 },
			yOffset: 1.0,
			radialSegments: 12,
			boneIndex: 6,
		},
		// Left forearm
		{
			profile: createLimbProfile(0.25, 0.03, 0.045, 4, 0.12),
			center: { x: -0.15, z: 0 },
			yOffset: 0.75,
			radialSegments: 12,
			boneIndex: 7,
		},
		// Right upper arm
		{
			profile: createLimbProfile(0.3, 0.045, 0.065, 5, 0.18),
			center: { x: 0.15, z: 0 },
			yOffset: 1.0,
			radialSegments: 12,
			boneIndex: 8,
		},
		// Right forearm
		{
			profile: createLimbProfile(0.25, 0.03, 0.045, 4, 0.12),
			center: { x: 0.15, z: 0 },
			yOffset: 0.75,
			radialSegments: 12,
			boneIndex: 9,
		},
		// Left thigh
		{
			profile: createLimbProfile(0.4, 0.065, 0.12, 5, 0.25),
			center: { x: -0.1, z: 0 },
			yOffset: 0.4,
			radialSegments: 14,
			boneIndex: 10,
		},
		// Left calf
		{
			profile: createLimbProfile(0.35, 0.042, 0.065, 5, 0.15),
			center: { x: -0.1, z: 0 },
			yOffset: 0.05,
			radialSegments: 14,
			boneIndex: 11,
		},
		// Right thigh
		{
			profile: createLimbProfile(0.4, 0.065, 0.12, 5, 0.25),
			center: { x: 0.1, z: 0 },
			yOffset: 0.4,
			radialSegments: 14,
			boneIndex: 12,
		},
		// Right calf
		{
			profile: createLimbProfile(0.35, 0.042, 0.065, 5, 0.15),
			center: { x: 0.1, z: 0 },
			yOffset: 0.05,
			radialSegments: 14,
			boneIndex: 13,
		},
	];

	limbConfigs.forEach(config => {
		const limbGeom = generateLatheGeometry(
			config.profile.map(p => ({ y: p.y + config.yOffset, radius: p.radius })),
			config.center,
			config.radialSegments,
			config.boneIndex
		);
		addGeometryPart(limbGeom);
	});

	// Set attributes
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3));
	geometry.setAttribute('normal', new THREE.Float32BufferAttribute(allNormals, 3));
	geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(allSkinIndices, 4));
	geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(allSkinWeights, 4));
	geometry.setIndex(allIndices);

	geometry.computeBoundingSphere();
	geometry.computeVertexNormals(); // Recompute for smooth shading

	return geometry;
}

/**
 * Create complete skinned mesh with humanoid geometry and skeleton
 *
 * Main entry point for creating realistic body model.
 *
 * @returns SkinnedMesh with attached skeleton, ready for animation
 *
 * @example
 * ```tsx
 * const humanoid = createSkinnedHumanoid();
 * scene.add(humanoid);
 *
 * // Apply measurements
 * const config = calculateBoneScaling(measurements);
 * applyBoneScaling(humanoid.skeleton, config);
 * ```
 */
export function createSkinnedHumanoid(): THREE.SkinnedMesh {
	// Create skeleton
	const bones = createSkeleton();
	const skeleton = new THREE.Skeleton(bones);

	// Create geometry
	const geometry = createHumanoidGeometry();

	// Create material (skin tone, double-sided for visibility)
	const material = new THREE.MeshStandardMaterial({
		color: 0xddaa88, // Skin tone (more visible than gray)
		roughness: 0.6,
		metalness: 0.1,
		side: THREE.DoubleSide, // Render both sides
		flatShading: false, // Smooth shading
	});

	// Create skinned mesh
	const mesh = new THREE.SkinnedMesh(geometry, material);
	mesh.add(bones[0]); // Add root bone
	mesh.bind(skeleton);

	// DEBUG: Log geometry stats
	const geom = geometry as THREE.BufferGeometry;

	// Triangle count available via validatePerformance() function if needed

	return mesh;
}

/**
 * Performance validation
 *
 * Checks if humanoid mesh meets performance targets.
 *
 * @param mesh - Skinned mesh to validate
 * @returns Performance metrics
 */
export interface PerformanceMetrics {
	triangleCount: number;
	vertexCount: number;
	boneCount: number;
	meetsTarget: boolean; // <10k triangles
}

export function validatePerformance(mesh: THREE.SkinnedMesh): PerformanceMetrics {
	const geometry = mesh.geometry as THREE.BufferGeometry;
	const triangleCount = geometry.index ? geometry.index.count / 3 : 0;
	const vertexCount = geometry.attributes.position.count;
	const boneCount = mesh.skeleton.bones.length;

	return {
		triangleCount,
		vertexCount,
		boneCount,
		meetsTarget: triangleCount < 10000,
	};
}
