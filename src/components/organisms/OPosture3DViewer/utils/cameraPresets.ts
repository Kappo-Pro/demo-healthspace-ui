import { CameraPresetName } from '../CameraPresets';

/**
 * Camera preset configuration
 */
export interface CameraPreset {
	/** Preset identifier */
	name: CameraPresetName;

	/** Camera position [x, y, z] */
	position: [number, number, number];

	/** Camera lookAt target [x, y, z] */
	lookAt: [number, number, number];

	/** Human-readable label */
	label: string;

	/** Keyboard shortcut key */
	shortcut: string;
}

/**
 * Predefined camera preset configurations for 3D posture viewing
 *
 * Each preset provides an optimal viewing angle for posture analysis:
 * - **Front**: Frontal view for face-on posture assessment
 * - **Side**: Lateral view for spine curvature and forward head posture
 * - **Top**: Bird's eye view for shoulder alignment and symmetry
 * - **Diagonal**: 3D perspective for overall posture visualization
 *
 * All presets look at origin (0, 0, 0) where the posture skeleton is centered.
 * Distances are calibrated for a normalized pose model (-1 to 1 range).
 *
 * @example
 * ```ts
 * import { CAMERA_PRESETS } from './cameraPresets';
 *
 * const frontPreset = CAMERA_PRESETS.front;
 * camera.position.set(...frontPreset.position);
 * controls.target.set(...frontPreset.lookAt);
 * ```
 */
export const CAMERA_PRESETS: Record<CameraPresetName, CameraPreset> = {
	/**
	 * Front view - straight-on frontal perspective
	 * Ideal for assessing frontal symmetry, shoulder leveling, hip alignment
	 */
	front: {
		name: 'front',
		position: [0, 0, 3],
		lookAt: [0, 0, 0],
		label: 'Front View',
		shortcut: '1',
	},

	/**
	 * Side view - lateral perspective
	 * Ideal for spine curvature, forward head posture, pelvic tilt assessment
	 */
	side: {
		name: 'side',
		position: [3, 0, 0],
		lookAt: [0, 0, 0],
		label: 'Side View',
		shortcut: '2',
	},

	/**
	 * Top view - bird's eye perspective
	 * Ideal for shoulder rotation, head tilt, overall symmetry from above
	 */
	top: {
		name: 'top',
		position: [0, 3, 0],
		lookAt: [0, 0, 0],
		label: 'Top View',
		shortcut: '3',
	},

	/**
	 * Diagonal view - 3D perspective
	 * Ideal for comprehensive posture visualization and spatial understanding
	 */
	diagonal: {
		name: 'diagonal',
		position: [2, 2, 2],
		lookAt: [0, 0, 0],
		label: 'Diagonal View',
		shortcut: '4',
	},
};

/**
 * Get preset configuration by name
 * @param presetName - Name of the preset
 * @returns Camera preset configuration
 */
export function getPreset(presetName: CameraPresetName): CameraPreset {
	return CAMERA_PRESETS[presetName];
}

/**
 * Get all preset names
 * @returns Array of preset names
 */
export function getPresetNames(): CameraPresetName[] {
	return Object.keys(CAMERA_PRESETS) as CameraPresetName[];
}
