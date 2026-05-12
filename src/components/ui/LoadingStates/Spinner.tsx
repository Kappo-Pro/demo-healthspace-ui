/**
 * Spinner Component
 *
 * Loading spinner with multiple sizes and variants.
 * Used for inline loading states and button loading states.
 *
 * Based on UX Spec Phase 3: Visual Polish
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Spinner.module.css';

export interface SpinnerProps {
	/** Size of the spinner */
	size?: 'sm' | 'md' | 'lg' | 'xl';

	/** Color variant */
	// eslint-disable-next-line vitalflow/no-hardcoded-colors
	variant?: 'primary' | 'secondary' | 'white' | 'current';

	/** Additional CSS class */
	className?: string;

	/** Accessible label */
	label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
	size = 'md',
	variant = 'primary',
	className,
	label,
}) => {
	const { t } = useTranslation();
	const ariaLabel = label || t('common.ui.loadingStates.loading');

	return (
		<div
			className={`${styles.spinner} ${styles[size]} ${styles[variant]} ${className || ''}`}
			role="status"
			aria-label={ariaLabel}>
			<svg className={styles.svg} viewBox="0 0 24 24" fill="none">
				<circle
					className={styles.circle}
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="3"
				/>
				<path
					className={styles.path}
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
			<span className={styles.srOnly}>{ariaLabel}</span>
		</div>
	);
};

/** Progress bar with optional shimmer effect */
export const ProgressBar: React.FC<{
	progress: number;
	showLabel?: boolean;
	shimmer?: boolean;
	className?: string;
}> = ({ progress, showLabel = false, shimmer = false, className }) => {
	const clampedProgress = Math.min(100, Math.max(0, progress));

	return (
		<div className={`${styles.progressContainer} ${className || ''}`}>
			{showLabel && (
				<div className={styles.progressLabel}>
					<span>{clampedProgress}%</span>
				</div>
			)}
			<div
				className={styles.progressBar}
				role="progressbar"
				aria-valuenow={clampedProgress}
				aria-valuemin={0}
				aria-valuemax={100}>
				<div
					className={`${styles.progressFill} ${shimmer ? styles.shimmer : ''}`}
					style={{ width: `${clampedProgress}%` }}
				/>
			</div>
		</div>
	);
};

/** Dots loading indicator */
export const DotsLoader: React.FC<{
	size?: 'sm' | 'md' | 'lg';
	variant?: 'primary' | 'secondary';
	className?: string;
}> = ({ size = 'md', variant = 'primary', className }) => {
	const { t } = useTranslation();
	const loadingText = t('common.ui.loadingStates.loading');

	return (
		<div
			className={`${styles.dotsLoader} ${styles[size]} ${styles[variant]} ${className || ''}`}
			role="status"
			aria-label={loadingText}>
			<div className={styles.dot} />
			<div className={styles.dot} />
			<div className={styles.dot} />
			<span className={styles.srOnly}>{loadingText}</span>
		</div>
	);
};

/** Pulse loader (for subtle loading states) */
export const PulseLoader: React.FC<{
	className?: string;
}> = ({ className }) => {
	const { t } = useTranslation();
	const loadingText = t('common.ui.loadingStates.loading');

	return (
		<div
			className={`${styles.pulseLoader} ${className || ''}`}
			role="status"
			aria-label={loadingText}>
			<span className={styles.srOnly}>{loadingText}</span>
		</div>
	);
};
