/**
 * Body Measurement Service
 *
 * Processing pipeline for body measurement SDK.
 * Integrates pose detection with measurement algorithms.
 *
 * @module services/bodyMeasurement
 * @since EPIC-001-S5
 */

export {
	processMeasurements,
	processSingleView,
	averageLandmarks,
	averageLandmarksMultiView,
	type MultiViewPoses,
	type ProcessedMeasurementResult,
} from './processingPipeline';
