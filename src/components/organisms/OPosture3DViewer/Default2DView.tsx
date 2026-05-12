import React from 'react';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { PoseLandmark } from './Posture3DViewer';
import './Default2DView.css';

/**
 * Props for Default2DView component
 */
export interface Default2DViewProps {
	/** MediaPipe pose landmarks */
	landmarks: PoseLandmark[];

	/** Posture deviation in degrees */
	deviationDegrees: number;
}

/**
 * Quality categories based on deviation degrees
 */
type PostureQuality = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Determine posture quality from deviation degrees
 */
const getPostureQuality = (degrees: number): PostureQuality => {
	const absDegrees = Math.abs(degrees);

	if (absDegrees <= 5) return 'excellent';
	if (absDegrees <= 10) return 'good';
	if (absDegrees <= 15) return 'fair';
	return 'poor';
};

/**
 * Get color for quality indicator
 */
const getQualityColor = (quality: PostureQuality): string => {
	switch (quality) {
		case 'excellent':
			return 'var(--status-success)';
		case 'good':
			return 'var(--status-info)';
		case 'fair':
			return 'var(--status-warning)';
		case 'poor':
			return 'var(--status-error)';
	}
};

/**
 * Default2DView - Simple 2D fallback view for posture visualization
 *
 * Displays basic posture metrics without 3D visualization.
 * Used as default view for progressive enhancement.
 *
 * Features:
 * - Lightweight (no 3D dependencies)
 * - Accessible text-based summary
 * - Color-coded quality indicators
 * - Encourages upgrade to 3D
 *
 * @example
 * ```tsx
 * <Default2DView
 *   landmarks={poseLandmarks}
 *   deviationDegrees={8.5}
 * />
 * ```
 */
export const Default2DView: React.FC<Default2DViewProps> = ({
	landmarks,
	deviationDegrees,
}) => {
	const { t } = useTypedTranslation();
	const quality = getPostureQuality(deviationDegrees);
	const qualityColor = getQualityColor(quality);

	// Get quality translation
	const getQualityLabel = (q: PostureQuality): string => {
		switch (q) {
			case 'excellent':
				return t(
					'Patient.data.postures.viewer3D.default2DView.qualityExcellent',
				);
			case 'good':
				return t('Patient.data.postures.viewer3D.default2DView.qualityGood');
			case 'fair':
				return t('Patient.data.postures.viewer3D.default2DView.qualityFair');
			case 'poor':
				return t('Patient.data.postures.viewer3D.default2DView.qualityPoor');
		}
	};
	const qualityLabel = getQualityLabel(quality);

	return (
		<div
			className="default-2d-view"
			role="region"
			aria-label={t('Patient.data.postures.viewer3D.default2DView.ariaLabel')}>
			<div className="posture-summary">
				<h3 className="summary-title">
					{t('Patient.data.postures.viewer3D.default2DView.title')}
				</h3>

				<div className="metric-list">
					<div className="metric">
						<span className="metric-label">
							{t(
								'Patient.data.postures.viewer3D.default2DView.landmarksDetected',
							)}
						</span>
						<span className="metric-value">
							{t(
								'Patient.data.postures.viewer3D.default2DView.landmarksCount',
								{ count: landmarks.length },
							)}
						</span>
					</div>

					<div className="metric">
						<span className="metric-label">
							{t('Patient.data.postures.viewer3D.default2DView.deviation')}
						</span>
						<span className="metric-value" style={{ color: qualityColor }}>
							{deviationDegrees.toFixed(1)}°
						</span>
					</div>

					<div className="metric">
						<span className="metric-label">
							{t('Patient.data.postures.viewer3D.default2DView.quality')}
						</span>
						<span
							className="metric-value quality-badge"
							style={{ color: qualityColor }}
							data-quality={quality}>
							{qualityLabel}
						</span>
					</div>
				</div>
			</div>

			<div className="upgrade-message" role="complementary">
				<svg
					className="upgrade-icon"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true">
					<path
						d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
						fill="currentColor"
					/>
				</svg>
				<p>
					{t('Patient.data.postures.viewer3D.default2DView.upgradeMessage')}
				</p>
			</div>
		</div>
	);
};
