 
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { PerformanceMonitor } from './PerformanceMonitor';
import { CameraPresets, CameraPresetName } from './CameraPresets';
import { animateCamera } from './utils/animateCamera';
import { CAMERA_PRESETS } from './utils/cameraPresets';
import './Posture3DViewer.css';

export interface PoseLandmark {
	x: number;
	y: number;
	z: number;
	visibility?: number;
}

export interface Posture3DViewerProps {
	landmarks: PoseLandmark[];
	deviationDegrees: number;
	color?: string;
	showPerformance?: boolean;
}

// MediaPipe pose connections (simplified subset for visualization)
const POSE_CONNECTIONS = [
	[11, 12], // Shoulders
	[11, 13],
	[13, 15], // Left arm
	[12, 14],
	[14, 16], // Right arm
	[11, 23],
	[12, 24], // Torso
	[23, 24], // Hips
	[23, 25],
	[25, 27], // Left leg
	[24, 26],
	[26, 28], // Right leg
];

/**
 * Camera controller component - handles camera preset animations
 * Must be inside Canvas to access useThree hook
 */
const CameraController: React.FC<{
	activePreset: CameraPresetName;
}> = ({ activePreset }) => {
	const { camera, controls } = useThree();
	const cancelAnimationRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		// Cancel any ongoing animation
		if (cancelAnimationRef.current) {
			cancelAnimationRef.current();
		}

		// Wait for controls to be ready
		if (!controls) {
			return;
		}

		// Get preset configuration
		const preset = CAMERA_PRESETS[activePreset];

		// Temporarily disable OrbitControls during animation
		const orbitControls = controls as unknown;
		const wasEnabled = orbitControls.enabled;
		orbitControls.enabled = false;

		// Animate camera to preset position
		cancelAnimationRef.current = animateCamera({
			camera,
			controls: controls as unknown as {
				target: THREE.Vector3;
				update: () => void;
			},
			targetPosition: preset.position,
			targetLookAt: preset.lookAt,
			duration: 400,
			onComplete: () => {
				// Re-enable OrbitControls after animation
				orbitControls.enabled = wasEnabled;
			},
		});

		return () => {
			// Cleanup on unmount
			if (cancelAnimationRef.current) {
				cancelAnimationRef.current();
			}
			// Re-enable controls if animation was cancelled
			orbitControls.enabled = wasEnabled;
		};
	}, [activePreset, camera, controls]);

	return null;
};

const PostureSkeleton: React.FC<{
	landmarks: PoseLandmark[];
	color?: string;
}> = ({ landmarks, color = 'var(--brand-primary)' }) => {
	// Convert normalized landmarks to 3D positions
	const positions = useMemo(() => {
		return landmarks.map(lm => ({
			x: (lm.x - 0.5) * 2, // Center at origin
			y: -(lm.y - 0.5) * 2, // Flip Y axis
			z: lm.z * 2, // Scale Z depth
		}));
	}, [landmarks]);

	// Create line segments for skeleton connections
	const lineSegments = useMemo(() => {
		return POSE_CONNECTIONS.map(([start, end]) => {
			if (positions[start] && positions[end]) {
				return {
					points: [
						new THREE.Vector3(
							positions[start].x,
							positions[start].y,
							positions[start].z,
						),
						new THREE.Vector3(
							positions[end].x,
							positions[end].y,
							positions[end].z,
						),
					],
					key: `${start}-${end}`,
				};
			}
			return null;
		}).filter(Boolean) as { points: THREE.Vector3[]; key: string }[];
	}, [positions]);

	return (
		<group>
			{/* Render joint spheres */}
			{positions.map((pos, index) => (
				<mesh key={index} position={[pos.x, pos.y, pos.z]}>
					<sphereGeometry args={[0.02, 16, 16]} />
					<meshStandardMaterial
						color={
							landmarks[index]?.visibility && landmarks[index].visibility > 0.7
								? 'var(--color-success-500)'
								: 'var(--color-warning-500)'
						}
					/>
				</mesh>
			))}

			{/* Render skeleton connections */}
			{lineSegments.map(segment => (
				<Line
					key={segment.key}
					points={segment.points}
					color={color}
					lineWidth={2}
				/>
			))}
		</group>
	);
};

export const Posture3DViewer: React.FC<Posture3DViewerProps> = ({
	landmarks,
	deviationDegrees,
	color,
	showPerformance = false,
}) => {
	const { t } = useTypedTranslation();
	const viewerRef = useRef<HTMLDivElement>(null);
	const [announcement, setAnnouncement] = useState('');
	const [activePreset, setActivePreset] = useState<CameraPresetName>('front');

	// Determine posture quality for accessibility announcement
	type QualityType = 'excellent' | 'good' | 'fair' | 'needsAttention';
	const postureQuality: QualityType = useMemo(() => {
		if (deviationDegrees <= 5) return 'excellent';
		if (deviationDegrees <= 10) return 'good';
		if (deviationDegrees <= 15) return 'fair';
		return 'needsAttention';
	}, [deviationDegrees]);

	// Get quality translation label
	const getQualityLabel = (q: QualityType): string => {
		switch (q) {
			case 'excellent':
				return t(
					'Patient.data.postures.viewer3D.posture3DViewer.qualityExcellent',
				);
			case 'good':
				return t('Patient.data.postures.viewer3D.posture3DViewer.qualityGood');
			case 'fair':
				return t('Patient.data.postures.viewer3D.posture3DViewer.qualityFair');
			case 'needsAttention':
				return t(
					'Patient.data.postures.viewer3D.posture3DViewer.qualityNeedsAttention',
				);
		}
	};

	// Announce posture changes to screen readers
	useEffect(() => {
		const qualityLabel = getQualityLabel(postureQuality);

		setAnnouncement(
			t('Patient.data.postures.viewer3D.posture3DViewer.announcement', {
				quality: qualityLabel,
				degrees: deviationDegrees.toFixed(1),
			}),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postureQuality, deviationDegrees]);

	// Focus management on mount
	useEffect(() => {
		if (viewerRef.current) {
			viewerRef.current.focus();
		}
	}, []);

	return (
		<div
			ref={viewerRef}
			className="posture-3d-viewer"
			role="region"
			aria-label={t('Patient.data.postures.viewer3D.posture3DViewer.ariaLabel')}
			aria-describedby="posture-keyboard-instructions"
			tabIndex={-1}>
			{/* Skip link for keyboard users */}
			<a href="#posture-controls" className="skip-link sr-only-focusable">
				{t('Patient.data.postures.viewer3D.posture3DViewer.skipLink')}
			</a>

			{/* Screen reader live region for dynamic announcements */}
			<div
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className="sr-only">
				{announcement}
			</div>

			{/* Hidden keyboard instructions for screen readers */}
			<div id="posture-keyboard-instructions" className="sr-only">
				{t(
					'Patient.data.postures.viewer3D.posture3DViewer.keyboardInstructions',
				)}
			</div>

			<Canvas
				camera={{ position: [0, 0, 3], fov: 50 }}
				gl={{
					antialias: true,
					powerPreference: 'high-performance',
				}}>
				{/* Lighting */}
				<ambientLight intensity={0.5} />
				<directionalLight position={[10, 10, 5]} intensity={1} />
				<directionalLight position={[-10, -10, -5]} intensity={0.5} />

				{/* 3D Posture Skeleton */}
				{landmarks.length > 0 && (
					<PostureSkeleton landmarks={landmarks} color={color} />
				)}

				{/* Camera Controls */}
				<OrbitControls
					makeDefault
					enableDamping
					dampingFactor={0.05}
					rotateSpeed={0.5}
					zoomSpeed={0.5}
					panSpeed={0.5}
				/>

				{/* Camera Preset Controller */}
				<CameraController activePreset={activePreset} />
			</Canvas>

			{/* Camera Preset Buttons */}
			<CameraPresets
				activePreset={activePreset}
				onPresetChange={setActivePreset}
				disabled={landmarks.length === 0}
			/>

			{/* Performance monitoring overlay */}
			<PerformanceMonitor visible={showPerformance} />

			{/* Info overlay */}
			<div
				id="posture-controls"
				className="posture-info-overlay"
				role="region"
				aria-label={t(
					'Patient.data.postures.viewer3D.posture3DViewer.metricsAriaLabel',
				)}>
				<div
					aria-label={t(
						'Patient.data.postures.viewer3D.posture3DViewer.landmarksAriaLabel',
						{ count: landmarks.length },
					)}>
					{t('Patient.data.postures.viewer3D.posture3DViewer.landmarksLabel', {
						count: landmarks.length,
					})}
				</div>
				<div
					aria-label={t(
						'Patient.data.postures.viewer3D.posture3DViewer.deviationAriaLabel',
						{ degrees: deviationDegrees.toFixed(1) },
					)}>
					{t('Patient.data.postures.viewer3D.posture3DViewer.deviationLabel', {
						degrees: deviationDegrees.toFixed(1),
					})}
				</div>
			</div>
		</div>
	);
};

export default Posture3DViewer;
