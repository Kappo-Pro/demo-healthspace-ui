// Main Progressive Enhancement Component (Task 6.2) - PRIMARY EXPORT
export { PostureVisualization } from './PostureVisualization';
export type { PostureVisualizationProps } from './PostureVisualization';
export { Default2DView } from './Default2DView';
export type { Default2DViewProps } from './Default2DView';

// Progressive Enhancement Hooks
export { usePosturePreference } from './usePosturePreference';
export type {
	PostureViewMode,
	UsePosturePreferenceReturn,
} from './usePosturePreference';
export { useWebGLCapability } from './useWebGLCapability';
export type { UseWebGLCapabilityReturn } from './useWebGLCapability';

// Context Provider
export { WebGLCapabilityProvider } from './WebGLCapabilityProvider';
export type {
	WebGLCapabilityContextValue,
	WebGLCapabilityProviderProps,
} from './WebGLCapabilityProvider';

// View Selector (Task 6.1)
export { PostureViewSelector } from './PostureViewSelector';
export type { PostureViewSelectorProps } from './PostureViewSelector';

// 3D Viewer Components (Tasks 1-5)
export { default as Posture3DViewer } from './Posture3DViewer';
export { Posture3DViewerLazy } from './Posture3DViewerLazy';
export { PerformanceMonitor } from './PerformanceMonitor';
export type { Posture3DViewerProps, PoseLandmark } from './Posture3DViewer';
