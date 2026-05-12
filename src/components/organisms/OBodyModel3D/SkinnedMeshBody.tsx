/**
 * Skinned Mesh Body Component
 *
 * Renders realistic humanoid body using skinned mesh with measurement-based deformation.
 * Replaces cylindrical segment rendering with smooth, realistic mesh.
 *
 * @module organisms/OBodyModel3D/SkinnedMeshBody
 * @since EPIC-001-S14
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSkinnedHumanoid } from './utils/humanoidMesh';
import { calculateBoneScaling, applyBoneScaling, type Measurement } from './utils/boneScaling';
import { loadPreRiggedHumanoid } from './utils/modelLoader';
import { normalizeBoneNames } from './utils/boneMapper';
import { createWireframeMaterial } from './materials/WireframeMaterial';
import { resolveCSSColor } from './utils/colorUtils';

// Re-use types from existing system
interface PoseResult {
	worldLandmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
}

enum PoseLandmark {
	NOSE = 0,
	LEFT_EYE_INNER = 1,
	LEFT_EYE = 2,
	LEFT_EYE_OUTER = 3,
	RIGHT_EYE_INNER = 4,
	RIGHT_EYE = 5,
	RIGHT_EYE_OUTER = 6,
	LEFT_EAR = 7,
	RIGHT_EAR = 8,
	MOUTH_LEFT = 9,
	MOUTH_RIGHT = 10,
	LEFT_SHOULDER = 11,
	RIGHT_SHOULDER = 12,
	LEFT_ELBOW = 13,
	RIGHT_ELBOW = 14,
	LEFT_WRIST = 15,
	RIGHT_WRIST = 16,
	LEFT_PINKY = 17,
	RIGHT_PINKY = 18,
	LEFT_INDEX = 19,
	RIGHT_INDEX = 20,
	LEFT_THUMB = 21,
	RIGHT_THUMB = 22,
	LEFT_HIP = 23,
	RIGHT_HIP = 24,
	LEFT_KNEE = 25,
	RIGHT_KNEE = 26,
	LEFT_ANKLE = 27,
	RIGHT_ANKLE = 28,
	LEFT_HEEL = 29,
	RIGHT_HEEL = 30,
	LEFT_FOOT_INDEX = 31,
	RIGHT_FOOT_INDEX = 32,
}

/**
 * Skinned Mesh Body Props
 */
export interface SkinnedMeshBodyProps {
	/** Body measurements for deformation */
	measurements: Measurement[];
	/** Optional pose for animation */
	pose?: PoseResult;
	/** Base color for body */
	color?: string;
	/** Enable fallback to cylinders on error */
	enableFallback?: boolean;
	/** Visualization mode: 'analysis' (purple wireframe) or 'realistic' (skin tone) */
	visualizationMode?: 'analysis' | 'realistic';
}

/**
 * Skinned Mesh Body Component
 *
 * Renders realistic humanoid mesh scaled by measurements.
 * Animates with pose landmarks when available.
 *
 * @example
 * ```tsx
 * <SkinnedMeshBody
 *   measurements={processedMeasurements.measurements}
 *   pose={currentPose}
 *   color="var(--brand-primary)"
 * />
 * ```
 */
export const SkinnedMeshBody: React.FC<SkinnedMeshBodyProps> = ({
	measurements,
	pose,
	color = 'var(--text-tertiary)',
	enableFallback = true,
	visualizationMode = 'analysis',
}) => {
	const meshRef = useRef<THREE.SkinnedMesh>(null);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Load or create humanoid mesh based on visualization mode
	const [humanoid, setHumanoid] = useState<THREE.SkinnedMesh | null>(null);

	useEffect(() => {
		let mounted = true;

		async function loadModel() {
			if (visualizationMode === 'analysis') {
				// Load pre-rigged model for analysis mode
				setIsLoading(true);
				try {
					const mesh = await loadPreRiggedHumanoid('/models/human-female-basemesh.glb');

					if (!mounted) return;

					// Normalize bone names
					normalizeBoneNames(mesh.skeleton);

					// Apply A-pose when no pose data provided
					if (!pose) {
						applyAPose(mesh.skeleton);
					}

					setHumanoid(mesh);
					setIsLoading(false);
				} catch (err) {
					if (!mounted) return;
					console.error('[SkinnedMeshBody] Failed to load model:', err);
					setError(err as Error);
					setIsLoading(false);
				}
			} else {
				// Use procedural mesh for realistic mode
				try {
					const mesh = createSkinnedHumanoid();
					if (mounted) setHumanoid(mesh);
				} catch (err) {
					if (mounted) {
						console.error('[SkinnedMeshBody] Failed to create procedural mesh:', err);
						setError(err as Error);
					}
				}
			}
		}

		loadModel();

		return () => {
			mounted = false;
		};
	}, [visualizationMode, pose]);

	// Auto-scale mesh to fit camera frustum
	useEffect(() => {
		if (!humanoid) return;

		// Compute bounding box
		humanoid.geometry.computeBoundingBox();
		const bbox = humanoid.geometry.boundingBox;

		if (!bbox) return;

		const size = new THREE.Vector3().subVectors(bbox.max, bbox.min);
		const center = bbox.getCenter(new THREE.Vector3());

		// Target height: ~1.8 units (human height in scene scale)
		// Camera is at z=3, looking at y=0.9
		const targetHeight = 1.8;
		const currentHeight = size.y;

		if (currentHeight > 0) {
			const scaleFactor = targetHeight / currentHeight;
			humanoid.scale.setScalar(scaleFactor);
		}

		// Center mesh vertically (feet at y=0)
		humanoid.position.y = -bbox.min.y * humanoid.scale.y;

		// Log final world transform
		humanoid.updateMatrixWorld(true);
		const worldPos = new THREE.Vector3();
		humanoid.getWorldPosition(worldPos);

	}, [humanoid]);

	// Apply measurement-based bone scaling
	useEffect(() => {
		if (!humanoid || !meshRef.current) return;

		try {
			const scalingConfig = calculateBoneScaling(measurements);
			applyBoneScaling(humanoid.skeleton, scalingConfig);

			// Update skeleton
			humanoid.skeleton.update();
		} catch (err) {
			console.error('[SkinnedMeshBody] Failed to apply measurements:', err);
			setError(err as Error);
		}
	}, [humanoid, measurements]);

	// Material based on visualization mode
	const material = useMemo(() => {
		if (visualizationMode === 'analysis') {
			// Resolve CSS variable to hex color for WebGL shader
			const resolvedColor = resolveCSSColor(color, 0x9370db);
			return createWireframeMaterial(resolvedColor);
		} else {
			// Use fixed skin tone for realistic mode
			return new THREE.MeshStandardMaterial({
				color: 0xddaa88, // Warm tan/beige skin tone
				roughness: 0.6,
				metalness: 0.1,
				side: THREE.DoubleSide,
			});
		}
	}, [visualizationMode, color]);

	// Real-time pose animation (only when pose data provided)
	useFrame(() => {
		// Skip animation when no pose data - maintain A-pose
		if (!pose || !meshRef.current) return;

		try {
			updateSkeletonFromPose(meshRef.current, pose.worldLandmarks);
		} catch (err) {
			console.error('[SkinnedMeshBody] Pose update failed:', err);
		}
	});

	// Loading state
	if (isLoading) {
		return null; // Could render loading spinner here
	}

	// Error handling: show fallback or error state
	if (error) {
		if (enableFallback) {
			console.warn('[SkinnedMeshBody] Using fallback rendering due to error:', error.message);
			return null; // Let parent component handle fallback
		}
		throw error;
	}

	if (!humanoid) {
		return null;
	}

	// Apply material directly to mesh object
	humanoid.material = material;
	humanoid.visible = true;
	humanoid.frustumCulled = false;

	// Use primitive to render existing SkinnedMesh object
	// This is the correct R3F approach for pre-loaded Three.js objects
	return <primitive object={humanoid} ref={meshRef} />;
};

/**
 * Apply A-pose to skeleton (arms horizontal)
 *
 * Standard pose for body measurement visualization.
 * Arms extended horizontally to the sides like letter "A" or "T".
 *
 * @param skeleton - Three.js skeleton to apply pose to
 */
function applyAPose(skeleton: THREE.Skeleton): void {

	skeleton.bones.forEach(bone => {
		// Reset all bones to default rotation first
		bone.rotation.set(0, 0, 0);

		// Apply A-pose specific rotations
		if (bone.name === 'upperArm_L') {
			// Rotate left arm to horizontal (90 degrees around Z axis)
			bone.rotation.z = Math.PI / 2;
		} else if (bone.name === 'upperArm_R') {
			// Rotate right arm to horizontal (-90 degrees around Z axis)
			bone.rotation.z = -Math.PI / 2;
		} else if (bone.name === 'lowerArm_L' || bone.name === 'lowerArm_R') {
			// Keep forearms straight (already reset to 0,0,0)
		}
	});

	// Update skeleton matrices
	skeleton.update();
}

/**
 * Update skeleton bones from pose landmarks
 *
 * Maps MediaPipe pose landmarks to bone rotations for realistic animation.
 *
 * @param mesh - Skinned mesh with skeleton
 * @param landmarks - Pose landmarks (world coordinates)
 */
function updateSkeletonFromPose(
	mesh: THREE.SkinnedMesh,
	landmarks: Array<{ x: number; y: number; z: number; visibility: number }>,
): void {
	if (!landmarks || landmarks.length < 33) return;

	const { skeleton } = mesh;
	if (!skeleton) return;

	// Bone-to-landmark mapping
	const boneMap: Record<string, [number, number]> = {
		spine: [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_SHOULDER],
		spine1: [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_SHOULDER],
		spine2: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER],
		neck: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.NOSE],
		upperArm_L: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW],
		lowerArm_L: [PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
		upperArm_R: [PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_ELBOW],
		lowerArm_R: [PoseLandmark.RIGHT_ELBOW, PoseLandmark.RIGHT_WRIST],
		thigh_L: [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE],
		calf_L: [PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
		thigh_R: [PoseLandmark.RIGHT_HIP, PoseLandmark.RIGHT_KNEE],
		calf_R: [PoseLandmark.RIGHT_KNEE, PoseLandmark.RIGHT_ANKLE],
	};

	skeleton.bones.forEach(bone => {
		const landmarkPair = boneMap[bone.name];
		if (!landmarkPair) return;

		const [startIdx, endIdx] = landmarkPair;
		const startLm = landmarks[startIdx];
		const endLm = landmarks[endIdx];

		// Check visibility
		if (
			!startLm ||
			!endLm ||
			startLm.visibility < 0.5 ||
			endLm.visibility < 0.5
		) {
			return;
		}

		// Calculate direction vector
		const start = new THREE.Vector3(startLm.x, -startLm.y, startLm.z);
		const end = new THREE.Vector3(endLm.x, -endLm.y, endLm.z);
		const direction = new THREE.Vector3().subVectors(end, start).normalize();

		// Calculate rotation to align bone with direction
		const up = new THREE.Vector3(0, 1, 0);
		const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

		// Apply rotation (smoothed for stability)
		bone.quaternion.slerp(quaternion, 0.2);
	});

	// Update skeleton matrices
	skeleton.update();
}

/**
 * Fallback Cylinder Body Component
 *
 * Renders body using simple cylinders when skinned mesh fails.
 * Maintains API compatibility with SkinnedMeshBody.
 */
export const FallbackCylinderBody: React.FC<SkinnedMeshBodyProps> = ({
	measurements,
	pose: _pose,
	color = 'var(--text-tertiary)',
}) => {
	const groupRef = useRef<THREE.Group>(null);

	// Resolve CSS custom property
	const resolvedColor = useMemo(() => {
		if (!color.startsWith('var(')) return color;

		const tempEl = document.createElement('div');
		tempEl.style.color = color;
		document.body.appendChild(tempEl);
		const computed = getComputedStyle(tempEl).color;
		document.body.removeChild(tempEl);
		return computed;
	}, [color]);

	// Simplified segment rendering (from original BodyModel3D)
	const segments = useMemo(() => {
		const getMeasurement = (id: string): number => {
			const m = measurements.find(m => m.id === id);
			return m ? m.value : 0;
		};

		return [
			{
				id: 'torso',
				position: new THREE.Vector3(0, 0, 0),
				length: getMeasurement('torso-length') || 60,
				radiusTop: (getMeasurement('chest-circumference') || 90) / (2 * Math.PI),
				radiusBottom: (getMeasurement('waist-circumference') || 75) / (2 * Math.PI),
			},
		];
	}, [measurements]);

	return (
		<group ref={groupRef}>
			{segments.map(segment => (
				<mesh
					key={segment.id}
					position={segment.position}
				>
					<cylinderGeometry
						args={[
							segment.radiusTop * 0.01,
							segment.radiusBottom * 0.01,
							segment.length * 0.01,
							16,
							1,
						]}
					/>
					<meshStandardMaterial color={resolvedColor} />
				</mesh>
			))}
		</group>
	);
};

export default SkinnedMeshBody;
