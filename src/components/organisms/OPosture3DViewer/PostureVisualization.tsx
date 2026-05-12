import React from 'react';
import { useTranslation } from 'react-i18next';
import { WebGLCapabilityProvider } from './WebGLCapabilityProvider';
import { usePosturePreference } from './usePosturePreference';
import { useWebGLCapability } from './useWebGLCapability';
import { PostureViewSelector } from './PostureViewSelector';
import { Posture3DViewerLazy } from './Posture3DViewerLazy';
import { Default2DView } from './Default2DView';
import { PoseLandmark } from './Posture3DViewer';
import './PostureVisualization.css';

/**
 * Props for PostureVisualization component
 */
export interface PostureVisualizationProps {
	/** 33 MediaPipe pose landmarks */
	landmarks: PoseLandmark[];

	/** Posture deviation angle in degrees */
	deviationDegrees: number;

	/** Optional color override for 3D skeleton */
	color?: string;

	/** Show performance overlay in 3D mode */
	showPerformance?: boolean;

	/** Optional custom 2D view component (fallback) */
	fallback2DView?: React.ReactNode;

	/** Optional CSS class name */
	className?: string;
}

/**
 * PostureVisualizationContent - Internal component with hooks
 * (must be inside WebGLCapabilityProvider)
 */
const PostureVisualizationContent: React.FC<PostureVisualizationProps> = ({
	landmarks,
	deviationDegrees,
	color,
	showPerformance = false,
	fallback2DView,
	className = '',
}) => {
	const { t } = useTranslation();

	// Get user's view preference with localStorage persistence
	const { view, savePreference } = usePosturePreference();

	// Get WebGL capability detection from context
	const { isSupported } = useWebGLCapability();

	return (
		<div className={`posture-visualization ${className}`.trim()}>
			{/* View Selector Toggle */}
			<PostureViewSelector
				currentView={view}
				onChange={savePreference}
				is3DAvailable={isSupported}
			/>

			{/* Conditional View Rendering */}
			{view === '2d' ? (
				<div
					className="posture-2d-view"
					role="region"
					aria-label={t('Patient.data.postures.postureViewContainer.ariaLabel2D')}>
					{fallback2DView || (
						<Default2DView
							landmarks={landmarks}
							deviationDegrees={deviationDegrees}
						/>
					)}
				</div>
			) : (
				<div
					className="posture-3d-view"
					role="region"
					aria-label={t('Patient.data.postures.postureViewContainer.ariaLabel3D')}>
					<Posture3DViewerLazy
						landmarks={landmarks}
						deviationDegrees={deviationDegrees}
						color={color}
						showPerformance={showPerformance}
					/>
				</div>
			)}
		</div>
	);
};

/**
 * PostureVisualization - Progressive enhancement wrapper for posture visualization
 *
 * Main entry point for consumers. Provides complete progressive enhancement system
 * with 2D/3D toggle, WebGL detection, lazy loading, and preference persistence.
 *
 * **Progressive Enhancement Layers:**
 * 1. Basic: Default 2D text-based summary (no 3D dependencies)
 * 2. Enhanced: Toggle control with localStorage persistence
 * 3. Advanced: Lazy-loaded 3D visualization (~900KB) when user opts in
 *
 * **Features:**
 * - Automatic WebGL detection
 * - User preference persistence (localStorage)
 * - Lazy loading of 3D viewer bundle
 * - Accessible view switching
 * - Custom 2D fallback support
 * - Performance monitoring for 3D view
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PostureVisualization
 *   landmarks={poseLandmarks}
 *   deviationDegrees={15}
 * />
 *
 * // With performance monitor
 * <PostureVisualization
 *   landmarks={poseLandmarks}
 *   deviationDegrees={15}
 *   showPerformance={true}
 * />
 *
 * // With custom 2D fallback
 * <PostureVisualization
 *   landmarks={poseLandmarks}
 *   deviationDegrees={15}
 *   fallback2DView={<MyCustom2DView />}
 * />
 * ```
 */
export const PostureVisualization: React.FC<
	PostureVisualizationProps
> = props => {
	return (
		<WebGLCapabilityProvider>
			<PostureVisualizationContent {...props} />
		</WebGLCapabilityProvider>
	);
};
