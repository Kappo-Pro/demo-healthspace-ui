/* eslint-disable vitalflow/no-hardcoded-colors */
/**
 * Posture3DViewer - Technology Spike Component
 *
 * PROTOTYPE ONLY - Created for Story 1.8 technology evaluation
 *
 * Purpose: Evaluate Three.js performance for 3D posture visualization
 * - Tests rendering MediaPipe pose landmarks in 3D
 * - Measures FPS on mobile devices
 * - Evaluates bundle size impact
 * - Determines if 3D visualization is viable for MVP
 *
 * DO NOT USE IN PRODUCTION - This is a spike/prototype for decision-making
 *
 * @module posture/__prototype__/3d-viewer
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { FRONT_VIEW_CONNECTIONS } from '@utils/PoseDetectionUtility';

/**
 * Performance metrics tracked during spike
 */
interface PerformanceMetrics {
	fps: number;
	frameTime: number;
	memoryUsed: number;
	renderTime: number;
}

/**
 * Props for the 3D viewer component
 */
interface Posture3DViewerProps {
	/** MediaPipe pose landmarks (33 points in 3D space) */
	landmarks: NormalizedLandmark[];
	/** Enable performance monitoring */
	measurePerformance?: boolean;
	/** Callback for performance metrics */
	onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

/**
 * Skeleton component - renders pose landmarks as spheres and connections as lines
 */
const PostureSkeleton: React.FC<{ landmarks: NormalizedLandmark[] }> = ({
	landmarks,
}) => {
	const meshRef = useRef<THREE.Group>(null);
	const [rotation, setRotation] = useState(0);

	// Auto-rotate for demo purposes
	useFrame((state, delta) => {
		if (meshRef.current) {
			setRotation(prev => prev + delta * 0.5);
			meshRef.current.rotation.y = rotation;
		}
	});

	// Convert normalized landmarks to 3D positions
	const positions = useMemo(() => {
		return landmarks.map(lm => ({
			x: (lm.x - 0.5) * 2, // Center at origin
			y: -(lm.y - 0.5) * 2, // Flip Y axis (MediaPipe uses top-left origin)
			z: lm.z * 2, // Scale Z depth
		}));
	}, [landmarks]);

	// Create line segments for skeleton connections
	const lineSegments = useMemo(() => {
		return FRONT_VIEW_CONNECTIONS.map(({ start, end }) => {
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
		<group ref={meshRef}>
			{/* Render joint spheres */}
			{positions.map((pos, index) => (
				<mesh key={index} position={[pos.x, pos.y, pos.z]}>
					<sphereGeometry args={[0.02, 16, 16]} />
					<meshStandardMaterial
						color={landmarks[index].visibility > 0.7 ? '#4CAF50' : '#FFC107'}
					/>
				</mesh>
			))}

			{/* Render skeleton connections */}
			{lineSegments.map(segment => (
				<Line
					key={segment.key}
					points={segment.points}
					color="#2196F3"
					lineWidth={2}
				/>
			))}
		</group>
	);
};

/**
 * Performance monitor component - tracks FPS and render time
 */
const PerformanceMonitor: React.FC<{
	onMetricsUpdate: (metrics: PerformanceMetrics) => void;
}> = ({ onMetricsUpdate }) => {
	const frameCount = useRef(0);
	const lastTime = useRef(performance.now());
	const renderStartTime = useRef(0);

	useFrame(() => {
		frameCount.current++;
		renderStartTime.current = performance.now();

		// Update metrics every 60 frames (~1 second at 60fps)
		if (frameCount.current >= 60) {
			const now = performance.now();
			const elapsed = now - lastTime.current;
			const fps = (frameCount.current / elapsed) * 1000;
			const frameTime = elapsed / frameCount.current;
			const renderTime = now - renderStartTime.current;

			// Get memory usage if available (Chrome only)
			const memoryUsed =
				(performance as unknown as { memory?: { usedJSHeapSize: number } })
					.memory?.usedJSHeapSize || 0;

			onMetricsUpdate({
				fps: Math.round(fps),
				frameTime: Math.round(frameTime * 100) / 100,
				memoryUsed: Math.round(memoryUsed / 1024 / 1024), // Convert to MB
				renderTime: Math.round(renderTime * 100) / 100,
			});

			frameCount.current = 0;
			lastTime.current = now;
		}
	});

	return null;
};

/**
 * Posture3DViewer - Main component
 *
 * Renders MediaPipe pose landmarks in 3D space using Three.js
 * Includes camera controls (orbit, zoom, pan)
 * Monitors performance metrics for spike evaluation
 */
const Posture3DViewer: React.FC<Posture3DViewerProps> = ({
	landmarks,
	measurePerformance = false,
	onMetricsUpdate,
}) => {
	const [isWebGLAvailable, setIsWebGLAvailable] = useState(true);

	// Check WebGL support
	useEffect(() => {
		const canvas = document.createElement('canvas');
		const gl =
			canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		setIsWebGLAvailable(!!gl);
	}, []);

	if (!isWebGLAvailable) {
		return (
			<div
				style={{
					padding: 'var(--spacing-8)',
					textAlign: 'center',
					backgroundColor: 'var(--color-red-100)',
					color: 'var(--color-red-700)',
					borderRadius: 'var(--radius-lg)',
				}}>
				<h3>WebGL Not Supported</h3>
				<p>
					Your device does not support WebGL, which is required for 3D
					visualization.
				</p>
				<p>This is a critical finding for the technology spike.</p>
			</div>
		);
	}

	if (!landmarks || landmarks.length === 0) {
		return (
			<div
				style={{
					padding: 'var(--spacing-8)',
					textAlign: 'center',
					backgroundColor: 'var(--color-gray-100)',
				}}>
				<p>No pose landmarks available. Please run a posture scan first.</p>
			</div>
		);
	}

	return (
		<div style={{ width: '100%', height: '600px', position: 'relative' }}>
			<Canvas
				camera={{ position: [0, 0, 3], fov: 50 }}
				gl={{
					antialias: true,
					powerPreference: 'high-performance', // Test high-performance mode
				}}>
				{/* Lighting */}
				<ambientLight intensity={0.5} />
				<directionalLight position={[10, 10, 5]} intensity={1} />
				<directionalLight position={[-10, -10, -5]} intensity={0.5} />

				{/* 3D Posture Skeleton */}
				<PostureSkeleton landmarks={landmarks} />

				{/* Camera Controls */}
				<OrbitControls
					enableDamping
					dampingFactor={0.05}
					rotateSpeed={0.5}
					zoomSpeed={0.5}
					panSpeed={0.5}
				/>

				{/* Performance Monitor */}
				{measurePerformance && onMetricsUpdate && (
					<PerformanceMonitor onMetricsUpdate={onMetricsUpdate} />
				)}
			</Canvas>

			{/* Grid helper for spatial reference */}
			<div
				style={{
					position: 'absolute',
					bottom: '10px',
					right: '10px',
					padding: '8px 12px',
					backgroundColor: 'rgba(0, 0, 0, 0.7)',
					color: "var(--text-on-dark)",
					borderRadius: 'var(--radius-sm)',
					fontSize: 'var(--font-size-xs)',
				}}>
				<div>Landmarks: {landmarks.length}</div>
				<div>Use mouse to rotate, zoom, pan</div>
			</div>
		</div>
	);
};

export default Posture3DViewer;
export type { PerformanceMetrics, Posture3DViewerProps };
