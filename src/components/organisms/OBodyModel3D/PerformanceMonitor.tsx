/**
 * Performance Monitor Component
 *
 * Displays real-time FPS counter for 3D scene performance validation.
 * Used to verify AC5 (60fps desktop, 30fps mobile).
 *
 * @module organisms/OBodyModel3D/PerformanceMonitor
 * @since EPIC-001-S12
 */

import React from 'react';
import './PerformanceMonitor.css';

/**
 * Performance Monitor Props
 *
 * @property fps - Current frames per second
 */
export interface PerformanceMonitorProps {
	/** Current FPS measurement */
	fps: number;
}

/**
 * Performance Monitor Component
 *
 * Displays FPS with color-coded status:
 * - Green: ≥60fps (desktop target met)
 * - Yellow: 30-59fps (mobile target met)
 * - Red: <30fps (below targets)
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ fps }) => {
	// Determine status based on FPS targets
	const getStatus = (): 'good' | 'acceptable' | 'poor' => {
		if (fps >= 60) return 'good'; // Desktop target
		if (fps >= 30) return 'acceptable'; // Mobile target
		return 'poor'; // Below targets
	};

	const status = getStatus();

	return (
		<div className={`performance-monitor performance-monitor--${status}`}>
			<span className="performance-monitor__label">FPS:</span>
			<span className="performance-monitor__value">{fps}</span>
		</div>
	);
};

export default PerformanceMonitor;
