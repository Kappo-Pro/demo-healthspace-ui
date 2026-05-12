/**
 * OBodyModel3D - 3D Body Model Visualization
 *
 * Exports 3D body model visualization component with parametric model generation,
 * real-time pose-driven animation, and interactive measurement annotations.
 *
 * @module organisms/OBodyModel3D
 * @since EPIC-001-S12
 * @updated EPIC-001-S13 - Added interactive annotations
 * @updated EPIC-001-S14 - Added skinned mesh body
 */

export { BodyModel3D, type BodyModel3DProps } from './BodyModel3D';
export { PerformanceMonitor, type PerformanceMonitorProps } from './PerformanceMonitor';

// EPIC-001-S14: Skinned Mesh Body
export { SkinnedMeshBody, FallbackCylinderBody, type SkinnedMeshBodyProps } from './SkinnedMeshBody';

// EPIC-001-S13: Interactive Annotations
export {
	InteractiveAnnotations,
	type InteractiveAnnotationsProps,
} from './InteractiveAnnotations';
export { ComparisonView, type ComparisonViewProps } from './ComparisonView';
export { ProgressChart, type ProgressChartProps } from './ProgressChart';

// Types
export type {
	MeasurementAnnotation,
	ComparisonData,
	MeasurementChange,
	ProgressEntry,
	ComparisonReport,
} from './types/annotations';

// Utilities
export {
	createAnnotationsFromMeasurements,
	calculateComparison,
	generateComparisonReport,
	exportReportToJSON,
	getChangeColor,
	getChangeIcon,
} from './utils/annotationUtils';

// EPIC-001-S14: Bone scaling utilities
export {
	calculateBoneScaling,
	applyBoneScaling,
	validateMeasurements,
	type BoneScale,
	type BoneScalingConfig,
	type ValidationResult,
} from './utils/boneScaling';

export {
	createSkinnedHumanoid,
	validatePerformance,
	type PerformanceMetrics,
} from './utils/humanoidMesh';
