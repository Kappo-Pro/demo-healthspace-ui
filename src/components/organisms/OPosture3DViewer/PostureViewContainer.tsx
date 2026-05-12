import React, { useState, useEffect } from 'react';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { PostureViewSelector } from './PostureViewSelector';
import { Posture3DViewerLazy } from './Posture3DViewerLazy';
import { PoseLandmark } from './Posture3DViewer';

/**
 * PostureViewContainer - Integration example showing how to use PostureViewSelector
 * with the 3D viewer and hooks
 *
 * This component demonstrates:
 * - User preference persistence with localStorage
 * - WebGL capability detection
 * - Progressive enhancement (2D → 3D)
 * - Conditional rendering based on view mode
 *
 * @example
 * ```tsx
 * <PostureViewContainer
 *   landmarks={poseLandmarks}
 *   deviationDegrees={5}
 * />
 * ```
 */
export const PostureViewContainer: React.FC<{
	/** Pose landmarks from MediaPipe */
	landmarks: PoseLandmark[];

	/** Deviation angle in degrees */
	deviationDegrees: number;
}> = ({ landmarks, deviationDegrees }) => {
	const { t } = useTypedTranslation();

	// Local state for view mode (in real app, use usePosturePreference hook)
	const [view, setView] = useState<'2d' | '3d'>('2d');

	// Local state for WebGL detection (in real app, use useWebGLCapability hook)
	const [isWebGLSupported, setIsWebGLSupported] = useState(true);

	/**
	 * Detect WebGL support on mount
	 * In production, this would be handled by useWebGLCapability hook
	 */
	useEffect(() => {
		try {
			const canvas = document.createElement('canvas');
			const gl =
				canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			setIsWebGLSupported(gl !== null);
		} catch (e) {
			setIsWebGLSupported(false);
		}
	}, []);

	/**
	 * Load preference from localStorage on mount
	 * In production, this would be handled by usePosturePreference hook
	 */
	useEffect(() => {
		const saved = localStorage.getItem('posture-view-preference');
		if (saved === '2d' || saved === '3d') {
			setView(saved);
		}
	}, []);

	/**
	 * Save preference to localStorage when changed
	 * In production, this would be handled by usePosturePreference hook
	 */
	const handleViewChange = (newView: '2d' | '3d'): void => {
		setView(newView);
		localStorage.setItem('posture-view-preference', newView);
	};

	return (
		<div className="posture-view-container">
			{/* View Selector Toggle */}
			<PostureViewSelector
				currentView={view}
				onChange={handleViewChange}
				is3DAvailable={isWebGLSupported}
			/>

			{/* Conditional Rendering based on view mode */}
			{view === '2d' ? (
				<div className="posture-2d-view">
					{/* 2D Posture View Component (existing component) */}
					<div
						style={{
							padding: 'var(--spacing-5)',
							border: '1px solid var(--color-border)',
							borderRadius: 'var(--radius-lg)',
						}}>
						<h3>{t('Patient.data.postures.viewer3D.postureViewContainer.title2D')}</h3>
						<p>{t('Patient.data.postures.viewer3D.postureViewContainer.deviationLabel', { degrees: deviationDegrees })}</p>
						<p>{t('Patient.data.postures.viewer3D.postureViewContainer.landmarksLabel', { count: landmarks.length })}</p>
						{/* In production, render actual 2D canvas visualization */}
					</div>
				</div>
			) : (
				<div className="posture-3d-view">
					{/* 3D Posture Viewer (lazy-loaded) */}
					<Posture3DViewerLazy
						landmarks={landmarks}
						deviationDegrees={deviationDegrees}
					/>
				</div>
			)}
		</div>
	);
};

export default PostureViewContainer;
