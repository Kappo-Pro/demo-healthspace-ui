/**
 * Body Measurement Types
 *
 * TypeScript interfaces for body measurement SDK feature.
 * Supports 40+ clinical measurements inspired by TrueToForm.
 *
 * @module types/bodyMeasurement
 * @since EPIC-001-S1
 */

/**
 * Body Measurement Type
 *
 * Categories of measurements that can be captured.
 *
 * @example
 * ```typescript
 * const type: BodyMeasurementType = BodyMeasurementType.SEGMENT;
 * ```
 */
export enum BodyMeasurementType {
	/** Length between two points (e.g., shoulder width, arm length) */
	SEGMENT = 'segment',

	/** Estimated circumference measurement (e.g., chest, waist, hip) */
	CIRCUMFERENCE = 'circumference',

	/** Proportional measurements and ratios (e.g., waist-to-hip ratio) */
	RATIO = 'ratio',

	/** Left-right symmetry comparison (e.g., shoulder height difference) */
	SYMMETRY = 'symmetry',
}

/**
 * Individual Body Measurement
 *
 * Represents a single measurement captured from the body scan.
 *
 * @example
 * ```typescript
 * const measurement: BodyMeasurement = {
 *   id: 'shoulder-width',
 *   type: BodyMeasurementType.SEGMENT,
 *   label: 'Shoulder Width',
 *   value: 42.5,
 *   unit: 'cm',
 *   confidence: 0.95,
 *   landmarks: ['shoulder_left', 'shoulder_right']
 * };
 * ```
 */
export interface BodyMeasurement {
	/** Unique identifier (e.g., 'chest-circumference', 'shoulder-width') */
	id: string;

	/** Type of measurement */
	type: BodyMeasurementType;

	/** Display name for the measurement */
	label: string;

	/** Measurement value */
	value: number;

	/** Unit of measurement */
	unit: 'cm' | 'in' | 'ratio';

	/** Confidence score (0-1) indicating measurement reliability */
	confidence: number;

	/** Optional: MediaPipe keypoints used for calculation */
	landmarks?: string[];
}

/**
 * Calibration Data
 *
 * Contains calibration information used to convert pixel measurements
 * to real-world units (cm/inches).
 *
 * @example
 * ```typescript
 * const calibration: CalibrationData = {
 *   userHeight: 175,
 *   cameraDistance: 150,
 *   poseQuality: 0.9,
 *   calibrationMethod: 'height'
 * };
 * ```
 */
export interface CalibrationData {
	/** User-reported height in centimeters */
	userHeight: number;

	/** Estimated camera-to-subject distance in centimeters */
	cameraDistance: number;

	/** Pose detection quality score (0-1) */
	poseQuality: number;

	/** Method used for calibration */
	calibrationMethod: 'height' | 'reference-object';
}

/**
 * Body Measurement Result
 *
 * Complete result object returned from body measurement assessment.
 * Contains all measurements, calibration data, quality flags, and metadata.
 *
 * @example
 * ```typescript
 * const result: BodyMeasurementResult = {
 *   measurements: [
 *     {
 *       id: 'chest-circumference',
 *       type: BodyMeasurementType.CIRCUMFERENCE,
 *       label: 'Chest Circumference',
 *       value: 95.5,
 *       unit: 'cm',
 *       confidence: 0.92,
 *       landmarks: ['shoulder_left', 'shoulder_right', 'hip_left', 'hip_right']
 *     }
 *   ],
 *   calibration: {
 *     userHeight: 175,
 *     cameraDistance: 150,
 *     poseQuality: 0.9,
 *     calibrationMethod: 'height'
 *   },
 *   metadata: {
 *     timestamp: '2026-01-08T10:30:00Z',
 *     processingTime: 2500,
 *     modelVersion: '1.0.0',
 *     deviceInfo: {
 *       userAgent: 'Mozilla/5.0...',
 *       screenResolution: '1920x1080'
 *     }
 *   },
 *   qualityFlags: {
 *     lighting: 'good',
 *     distance: 'optimal',
 *     pose: 'clear'
 *   }
 * };
 * ```
 */
export interface BodyMeasurementResult {
	/** Array of all captured measurements */
	measurements: BodyMeasurement[];

	/** Calibration data used for pixel-to-real-world conversion */
	calibration: CalibrationData;

	/** Metadata about the assessment session */
	metadata: {
		/** ISO 8601 timestamp when assessment was completed */
		timestamp: string;

		/** Processing time in milliseconds */
		processingTime: number;

		/** Model version used for pose detection */
		modelVersion: string;

		/** Device information */
		deviceInfo: {
			/** Browser user agent string */
			userAgent: string;

			/** Screen resolution (e.g., '1920x1080') */
			screenResolution: string;
		};
	};

	/** Quality indicators for the assessment */
	qualityFlags: {
		/** Lighting conditions assessment */
		lighting: 'good' | 'poor';

		/** Camera distance assessment */
		distance: 'optimal' | 'too-close' | 'too-far';

		/** Pose clarity assessment */
		pose: 'clear' | 'occluded';
	};
}
