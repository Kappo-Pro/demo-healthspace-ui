/**
 * GoalProgressRing - Molecule Component
 *
 * Circular progress indicator for functional goal completion tracking.
 * Features smooth animation on mount and dynamic color coding based on progress.
 *
 * @example
 * // Parent component should translate the title
 * const { t } = useTypedTranslation();
 * <GoalProgressRing
 *   title={t('Admin.consultation.goals.metrics.balance')}
 *   progress={75}
 *   size={120}
 * />
 */

import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { GoalProgressRingProps, ProgressColorThreshold } from './types';
import './GoalProgressRing.css';

/**
 * Get color based on progress percentage
 *
 * - 0-49%: Warning (orange)
 * - 50-74%: Primary (purple)
 * - 75-100%: Success (green)
 */
const getProgressColor = (progress: number): string => {
	if (progress >= 75) return 'var(--color-success-600)';
	if (progress >= 50) return 'var(--color-purple-700)';
	return 'var(--color-warning-600)';
};

/**
 * Get color threshold type for styling
 */
const getProgressThreshold = (progress: number): ProgressColorThreshold => {
	if (progress >= 75) return 'success';
	if (progress >= 50) return 'primary';
	return 'warning';
};

/**
 * GoalProgressRing Component
 */
export const GoalProgressRing: React.FC<GoalProgressRingProps> = ({
	title,
	progress,
	size = 120,
	loading = false,
	className = '',
	ariaLabel,
}) => {
	const { t } = useTypedTranslation();
	const [animatedProgress, setAnimatedProgress] = useState(0);

	// Clamp progress to 0-100 range
	const clampedProgress = Math.max(0, Math.min(100, progress));

	/**
	 * Animate progress from 0 to actual value on mount or progress change
	 */
	useEffect(() => {
		// Small delay to ensure CSS transition triggers
		const timer = setTimeout(() => {
			setAnimatedProgress(clampedProgress);
		}, 100);

		return () => clearTimeout(timer);
	}, [clampedProgress]);

	// SVG circle calculations
	const strokeWidth = 8;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (animatedProgress / 100) * circumference;

	// Color and threshold
	const progressColor = getProgressColor(animatedProgress);
	const threshold = getProgressThreshold(animatedProgress);

	/**
	 * Loading state
	 */
	if (loading) {
		return (
			<div
				className={`goal-progress-ring-loading ${className}`}
				style={{ width: size, height: size }}
				role="status"
				aria-label={ariaLabel || t('Admin.consultation.goals.progress.loading', { title })}
			>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div
			className={`goal-progress-ring ${className}`}
			style={{ width: size, height: size }}
			role="img"
			aria-label={
				ariaLabel || t('Admin.consultation.goals.progress.ariaLabel', {
					title,
					progress: Math.round(animatedProgress)
				})
			}
		>
			{/* SVG Progress Ring */}
			<svg
				className="goal-progress-ring-svg"
				width={size}
				height={size}
				aria-hidden="true"
			>
				{/* Background circle */}
				<circle
					className="progress-ring-background"
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="var(--color-gray-200)"
					strokeWidth={strokeWidth}
				/>

				{/* Progress circle */}
				<circle
					className={`progress-ring-circle progress-ring-circle-${threshold}`}
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={progressColor}
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
				/>
			</svg>

			{/* Centered content */}
			<div className="progress-content">
				<div
					className={`progress-percentage progress-percentage-${threshold}`}
					style={{ color: progressColor }}
				>
					{Math.round(animatedProgress)}%
				</div>
				<div className="progress-title">{title}</div>
			</div>
		</div>
	);
};

// Display name for debugging
GoalProgressRing.displayName = 'GoalProgressRing';

export default GoalProgressRing;
