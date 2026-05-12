/**
 * Measurement Markers Component
 *
 * Renders white circular markers at key anatomical joints to indicate
 * measurement reference points on the 3D body model.
 *
 * @module organisms/OBodyModel3D/MeasurementMarkers
 * @since EPIC-001-S15
 */

import React from 'react';
import * as THREE from 'three';

/**
 * Measurement Markers Props
 */
export interface MeasurementMarkersProps {
	/** Pose landmarks (world coordinates) */
	landmarks: Array<{ x: number; y: number; z: number }>;
	/** Landmark indices to mark (shoulders, hips, knees, ankles) */
	indices: number[];
}

/**
 * Measurement Markers Component
 *
 * Displays white circular markers at specified landmark positions.
 * Each marker consists of outer ring (torus) and center dot (sphere).
 *
 * Default indices:
 * - 11, 12: Shoulders (left/right)
 * - 23, 24: Hips (left/right)
 * - 25, 26: Knees (left/right)
 * - 27, 28: Ankles (left/right)
 *
 * @example
 * ```tsx
 * <MeasurementMarkers
 *   landmarks={pose.worldLandmarks}
 *   indices={[11, 12, 23, 24, 25, 26, 27, 28]}
 * />
 * ```
 */
export const MeasurementMarkers: React.FC<MeasurementMarkersProps> = ({
	landmarks,
	indices,
}) => {

	// Filter out invalid indices
	const validIndices = indices.filter(idx => idx < landmarks.length && landmarks[idx]);

	if (validIndices.length === 0) {
		console.warn('[MeasurementMarkers] No valid landmarks for indices:', indices);
		return null;
	}

	return (
		<group name="measurement-markers">
			{validIndices.map((idx) => {
				const landmark = landmarks[idx];
				if (!landmark) return null;

				// Convert landmark to Three.js position
				// NOTE: Y-axis inverted for Three.js coordinate system
				const position = new THREE.Vector3(
					landmark.x,
					-landmark.y,
					landmark.z
				);

				return (
					<group key={idx} position={position}>
						{/* Outer ring (torus) */}
						<mesh>
							<torusGeometry args={[0.05, 0.01, 8, 16]} />
							<meshBasicMaterial color={0xffffff} side={THREE.DoubleSide} />
						</mesh>

						{/* Center dot (sphere) */}
						<mesh>
							<sphereGeometry args={[0.015, 8, 8]} />
							<meshBasicMaterial color={0xffffff} />
						</mesh>
					</group>
				);
			})}
		</group>
	);
};

export default MeasurementMarkers;
