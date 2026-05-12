/**
 * 3D Body Model Visualization Component
 *
 * Renders parametric 3D body model from measurement data using Three.js.
 * Features real-time pose-driven animation and interactive camera controls.
 *
 * @module organisms/OBodyModel3D
 * @since EPIC-001-S12
 *
 * @example
 * ```tsx
 * import { BodyModel3D } from '@organisms/OBodyModel3D';
 *
 * <BodyModel3D
 *   measurements={processedMeasurements.measurements}
 *   pose={currentPose}
 *   showPerformance={true}
 * />
 * ```
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { PoseResult } from '@types/mediapipe';
import { PoseLandmark } from '@types/mediapipe';
import { PerformanceMonitor } from './PerformanceMonitor';
import { SkinnedMeshBody } from './SkinnedMeshBody';
import { MeasurementMarkers } from './MeasurementMarkers';
import './BodyModel3D.css';

/**
 * Body Model 3D Component Props
 *
 * @property measurements - Flat array of body measurements from ProcessedMeasurementResult
 * @property pose - Optional pose data for real-time animation
 * @property showPerformance - Display performance metrics (FPS counter)
 * @property enableControls - Enable camera orbit controls
 * @property color - Base color for body model (CSS custom property)
 * @property useSkinnedMesh - Use realistic skinned mesh (default) or cylinder fallback
 */
export interface BodyModel3DProps {
	/** Measurements from ProcessedMeasurementResult.measurements */
	measurements: Array<{
		id: string;
		type: 'segment' | 'circumference' | 'ratio' | 'symmetry';
		label: string;
		value: number;
		unit: 'cm' | 'in' | 'ratio';
		confidence: number;
		landmarks?: string[];
	}>;
	/** Optional pose for real-time animation */
	pose?: PoseResult;
	/** Show performance monitor */
	showPerformance?: boolean;
	/** Enable camera controls */
	enableControls?: boolean;
	/** Base color for model */
	color?: string;
	/** Use realistic skinned mesh (default: true) */
	useSkinnedMesh?: boolean;
	/** Visualization mode: 'analysis' (purple wireframe) or 'realistic' (skin tone) */
	visualizationMode?: 'analysis' | 'realistic';
}

/**
 * Parametric Body Segment
 *
 * Represents a single body part (torso, arm, leg, etc.)
 */
interface BodySegment {
	/** Segment identifier (e.g., 'left-upper-arm') */
	id: string;
	/** Position in 3D space */
	position: THREE.Vector3;
	/** Rotation quaternion */
	rotation: THREE.Quaternion;
	/** Length (height) of segment */
	length: number;
	/** Radius at top */
	radiusTop: number;
	/** Radius at bottom */
	radiusBottom: number;
	/** Parent segment for hierarchical animation */
	parent?: string;
}

/**
 * Parametric Body Model Component
 *
 * Renders body geometry from measurements with optional pose animation.
 * Implements AC2, AC3, AC6.
 *
 * @param useSkinnedMesh - If true, use realistic skinned mesh; if false, use cylinders
 */
const ParametricBodyModel: React.FC<{
	measurements: BodyModel3DProps['measurements'];
	pose?: PoseResult;
	color: string;
	useSkinnedMesh: boolean;
	visualizationMode?: 'analysis' | 'realistic';
}> = ({ measurements, pose, color, useSkinnedMesh, visualizationMode = 'analysis' }) => {
	const groupRef = useRef<THREE.Group>(null);
	const [meshError, setMeshError] = React.useState<boolean>(false);

	// Fallback to cylinders if skinned mesh fails
	const shouldUseCylinders = !useSkinnedMesh || meshError;

	// Build body segments from measurements (AC2: Parametric model from measurements)
	const segments = useMemo(() => {
		if (shouldUseCylinders) {
			return createBodySegments(measurements);
		}
		return [];
	}, [measurements, shouldUseCylinders]);

	// Real-time pose-driven animation (AC3)
	useFrame(() => {
		if (!pose || !groupRef.current || !shouldUseCylinders) return;
		// Update segment positions/rotations from pose landmarks
		updateSegmentsFromPose(groupRef.current, segments, pose.worldLandmarks);
	});

	// Debug: Log what will render

	// Render skinned mesh or cylinder fallback
	if (useSkinnedMesh && !meshError) {
		return (
			<SkinnedMeshBody
				measurements={measurements}
				pose={pose}
				color={color}
				enableFallback={true}
				visualizationMode={visualizationMode}
			/>
		);
	}

	// Cylinder fallback
	return (
		<group ref={groupRef}>
			{segments.map(segment => (
				<mesh key={segment.id} position={segment.position} quaternion={segment.rotation}>
					<cylinderGeometry
						args={[
							segment.radiusTop * 0.01, // Convert cm to meters (scaled)
							segment.radiusBottom * 0.01,
							segment.length * 0.01,
							16,
							1,
						]}
					/>
					<meshStandardMaterial color={color} />
				</mesh>
			))}
		</group>
	);
};

/**
 * Scene Lighting Component
 *
 * Provides ambient + directional lighting for body model visibility.
 */
const SceneLighting: React.FC = () => {
	return (
		<>
			{/* Ambient light for overall scene illumination */}
			<ambientLight intensity={0.6} />
			{/* Directional lights for depth/shadows */}
			<directionalLight position={[5, 5, 5]} intensity={0.8} />
			<directionalLight position={[-5, -5, -5]} intensity={0.3} />
		</>
	);
};

/**
 * Main Body Model 3D Component
 *
 * Implements AC1 (Three.js integration), AC4 (camera controls), AC5 (performance).
 * Now with realistic skinned mesh support (EPIC-001-S14).
 */
export const BodyModel3D: React.FC<BodyModel3DProps> = ({
	measurements,
	pose,
	showPerformance = false,
	enableControls = true,
	color = 'var(--brand-primary)',
	useSkinnedMesh = true,
	visualizationMode = 'analysis',
}) => {
	const [fps, setFps] = useState<number>(0);
	const frameTimesRef = useRef<number[]>([]);
	const lastFrameTimeRef = useRef<number>(performance.now());

	// Performance monitoring (AC5: 60fps desktop, 30fps mobile)
	useEffect(() => {
		if (!showPerformance) return;

		const measureFps = () => {
			const now = performance.now();
			const delta = now - lastFrameTimeRef.current;
			lastFrameTimeRef.current = now;

			frameTimesRef.current.push(delta);
			if (frameTimesRef.current.length > 60) {
				frameTimesRef.current.shift();
			}

			// Calculate average FPS
			const avgDelta =
				frameTimesRef.current.reduce((sum, time) => sum + time, 0) /
				frameTimesRef.current.length;
			setFps(Math.round(1000 / avgDelta));

			requestAnimationFrame(measureFps);
		};

		const animationId = requestAnimationFrame(measureFps);
		return () => cancelAnimationFrame(animationId);
	}, [showPerformance]);

	return (
		<div className="body-model-3d">
			{/* AC1: Three.js scene rendering */}
			<Canvas
				camera={{ position: [0, 0.9, 3], fov: 50 }}
				frameloop="demand"
				gl={{
					antialias: true,
					powerPreference: 'high-performance',
					alpha: true,
				}}
				dpr={1} // Adaptive pixel ratio for performance
			>
				{/* Scene lighting */}
				<SceneLighting />

				{/* AC2, AC3, AC6: Parametric body model with pose animation */}
				<ParametricBodyModel
					measurements={measurements}
					pose={pose}
					color={color}
					useSkinnedMesh={useSkinnedMesh}
					visualizationMode={visualizationMode}
				/>

				{/* Measurement markers (shoulders, hips, knees, ankles) */}
				{pose?.worldLandmarks && visualizationMode === 'analysis' && (
					<MeasurementMarkers
						landmarks={pose.worldLandmarks}
						indices={[11, 12, 23, 24, 25, 26, 27, 28]} // shoulders, hips, knees, ankles
					/>
				)}

				{/* AC4: Camera controls (rotate, zoom, pan) */}
				{enableControls && (
					<OrbitControls
						enableDamping={false}
						enableZoom={true}
						zoomSpeed={0.5}
						enablePan={true}
						panSpeed={0.5}
						enableRotate={true}
						rotateSpeed={0.5}
						minDistance={1.5}
						maxDistance={6}
						target={[0, 0.9, 0]}
					/>
				)}
			</Canvas>

			{/* AC5: Performance monitoring */}
			{showPerformance && <PerformanceMonitor fps={fps} />}
		</div>
	);
};

/**
 * Create body segments from measurement data
 *
 * Implements AC2: Parametric body model generation.
 * Maps measurements to 3D body geometry (torso, limbs, head, etc.).
 *
 * @param measurements - Flat measurement array from ProcessedMeasurementResult
 * @returns Array of body segments with geometry properties
 */
function createBodySegments(
	measurements: BodyModel3DProps['measurements'],
): BodySegment[] {
	const segments: BodySegment[] = [];

	// Helper to find measurement by ID
	const getMeasurement = (id: string): number => {
		const m = measurements.find(m => m.id === id);
		return m ? m.value : 0;
	};

	// Torso (core body segment)
	const torsoLength = getMeasurement('torso-length') || 60; // Default 60cm
	const chestCirc = getMeasurement('chest-circumference') || 90;
	const waistCirc = getMeasurement('waist-circumference') || 75;

	segments.push({
		id: 'torso',
		position: new THREE.Vector3(0, 0, 0),
		rotation: new THREE.Quaternion(),
		length: torsoLength,
		radiusTop: chestCirc / (2 * Math.PI), // Circumference to radius
		radiusBottom: waistCirc / (2 * Math.PI),
	});

	// Left Upper Arm
	const leftUpperArmLength = getMeasurement('left-upper-arm-length') || 30;
	const leftBicepCirc = getMeasurement('left-bicep-circumference') || 28;

	segments.push({
		id: 'left-upper-arm',
		position: new THREE.Vector3(-0.3, 0.5, 0), // Offset from shoulder
		rotation: new THREE.Quaternion(),
		length: leftUpperArmLength,
		radiusTop: leftBicepCirc / (2 * Math.PI),
		radiusBottom: leftBicepCirc / (2 * Math.PI) * 0.8,
		parent: 'torso',
	});

	// Right Upper Arm
	const rightUpperArmLength = getMeasurement('right-upper-arm-length') || 30;
	const rightBicepCirc = getMeasurement('right-bicep-circumference') || 28;

	segments.push({
		id: 'right-upper-arm',
		position: new THREE.Vector3(0.3, 0.5, 0),
		rotation: new THREE.Quaternion(),
		length: rightUpperArmLength,
		radiusTop: rightBicepCirc / (2 * Math.PI),
		radiusBottom: rightBicepCirc / (2 * Math.PI) * 0.8,
		parent: 'torso',
	});

	// Left Forearm
	const leftForearmLength = getMeasurement('left-forearm-length') || 25;
	const leftForearmCirc = getMeasurement('left-forearm-circumference') || 24;

	segments.push({
		id: 'left-forearm',
		position: new THREE.Vector3(-0.3, 0.2, 0),
		rotation: new THREE.Quaternion(),
		length: leftForearmLength,
		radiusTop: leftForearmCirc / (2 * Math.PI),
		radiusBottom: leftForearmCirc / (2 * Math.PI) * 0.7,
		parent: 'left-upper-arm',
	});

	// Right Forearm
	const rightForearmLength = getMeasurement('right-forearm-length') || 25;
	const rightForearmCirc = getMeasurement('right-forearm-circumference') || 24;

	segments.push({
		id: 'right-forearm',
		position: new THREE.Vector3(0.3, 0.2, 0),
		rotation: new THREE.Quaternion(),
		length: rightForearmLength,
		radiusTop: rightForearmCirc / (2 * Math.PI),
		radiusBottom: rightForearmCirc / (2 * Math.PI) * 0.7,
		parent: 'right-upper-arm',
	});

	// Left Thigh
	const leftThighLength = getMeasurement('left-thigh-length') || 40;
	const leftThighCirc = getMeasurement('left-thigh-circumference') || 55;

	segments.push({
		id: 'left-thigh',
		position: new THREE.Vector3(-0.15, -0.3, 0),
		rotation: new THREE.Quaternion(),
		length: leftThighLength,
		radiusTop: leftThighCirc / (2 * Math.PI),
		radiusBottom: leftThighCirc / (2 * Math.PI) * 0.6,
		parent: 'torso',
	});

	// Right Thigh
	const rightThighLength = getMeasurement('right-thigh-length') || 40;
	const rightThighCirc = getMeasurement('right-thigh-circumference') || 55;

	segments.push({
		id: 'right-thigh',
		position: new THREE.Vector3(0.15, -0.3, 0),
		rotation: new THREE.Quaternion(),
		length: rightThighLength,
		radiusTop: rightThighCirc / (2 * Math.PI),
		radiusBottom: rightThighCirc / (2 * Math.PI) * 0.6,
		parent: 'torso',
	});

	// Left Calf
	const leftCalfLength = getMeasurement('left-calf-length') || 35;
	const leftCalfCirc = getMeasurement('left-calf-circumference') || 35;

	segments.push({
		id: 'left-calf',
		position: new THREE.Vector3(-0.15, -0.7, 0),
		rotation: new THREE.Quaternion(),
		length: leftCalfLength,
		radiusTop: leftCalfCirc / (2 * Math.PI),
		radiusBottom: leftCalfCirc / (2 * Math.PI) * 0.5,
		parent: 'left-thigh',
	});

	// Right Calf
	const rightCalfLength = getMeasurement('right-calf-length') || 35;
	const rightCalfCirc = getMeasurement('right-calf-circumference') || 35;

	segments.push({
		id: 'right-calf',
		position: new THREE.Vector3(0.15, -0.7, 0),
		rotation: new THREE.Quaternion(),
		length: rightCalfLength,
		radiusTop: rightCalfCirc / (2 * Math.PI),
		radiusBottom: rightCalfCirc / (2 * Math.PI) * 0.5,
		parent: 'right-thigh',
	});

	// Head (simplified as sphere)
	const neckLength = getMeasurement('neck-length') || 10;

	segments.push({
		id: 'head',
		position: new THREE.Vector3(0, 0.8, 0),
		rotation: new THREE.Quaternion(),
		length: neckLength + 20, // Head + neck
		radiusTop: 10, // Head radius ~10cm
		radiusBottom: 5, // Neck radius ~5cm
		parent: 'torso',
	});

	return segments;
}

/**
 * Update segment positions from pose landmarks
 *
 * Implements AC3: Real-time pose-driven animation.
 * Maps pose landmarks to body segment rotations/positions for live animation.
 *
 * @param group - Three.js group containing segment meshes
 * @param segments - Body segment definitions
 * @param landmarks - Pose landmarks from MediaPipe (world coordinates)
 */
function updateSegmentsFromPose(
	group: THREE.Group,
	segments: BodySegment[],
	landmarks: Array<{ x: number; y: number; z: number; visibility: number }>,
): void {
	if (!landmarks || landmarks.length < 33) return;

	// Map of segment IDs to landmark pairs (start, end)
	const segmentLandmarkMap: Record<string, [number, number]> = {
		torso: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_HIP],
		'left-upper-arm': [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW],
		'right-upper-arm': [PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_ELBOW],
		'left-forearm': [PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
		'right-forearm': [PoseLandmark.RIGHT_ELBOW, PoseLandmark.RIGHT_WRIST],
		'left-thigh': [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE],
		'right-thigh': [PoseLandmark.RIGHT_HIP, PoseLandmark.RIGHT_KNEE],
		'left-calf': [PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
		'right-calf': [PoseLandmark.RIGHT_KNEE, PoseLandmark.RIGHT_ANKLE],
		head: [PoseLandmark.NOSE, PoseLandmark.LEFT_SHOULDER], // Approximate
	};

	// Update each segment's rotation based on landmark positions
	segments.forEach((segment, index) => {
		const mesh = group.children[index] as THREE.Mesh;
		if (!mesh) return;

		const landmarkPair = segmentLandmarkMap[segment.id];
		if (!landmarkPair) return;

		const [startIdx, endIdx] = landmarkPair;
		const startLm = landmarks[startIdx];
		const endLm = landmarks[endIdx];

		// Check visibility
		if (!startLm || !endLm || startLm.visibility < 0.5 || endLm.visibility < 0.5) {
			return;
		}

		// Calculate direction vector
		const start = new THREE.Vector3(startLm.x, -startLm.y, startLm.z);
		const end = new THREE.Vector3(endLm.x, -endLm.y, endLm.z);
		const direction = new THREE.Vector3().subVectors(end, start).normalize();

		// Calculate rotation to align segment with direction
		const up = new THREE.Vector3(0, 1, 0);
		const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

		// Update mesh rotation
		mesh.quaternion.copy(quaternion);

		// Update position (midpoint between landmarks)
		const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
		mesh.position.copy(midpoint);
	});
}

export default BodyModel3D;
