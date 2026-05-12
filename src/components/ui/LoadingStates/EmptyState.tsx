/**
 * Empty and Error State Components
 *
 * Provides user-friendly empty and error states with actions.
 * Based on UX Spec Phase 3: Visual Polish
 * Enhanced in Story 2.5 with posture-specific empty states
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
	/** Icon to display (React node, emoji, or SVG) */
	icon?: React.ReactNode;

	/** Title of empty state */
	title: string;

	/** Description text */
	description?: string;

	/** Action button */
	action?: {
		label: string;
		onClick: () => void;
	};

	/** Secondary action (optional) */
	secondaryAction?: {
		label: string;
		onClick: () => void;
	};

	/** Illustration (SVG or image) */
	illustration?: {
		src: string;
		alt: string;
	};

	/** Context information (time commitment, privacy note) */
	contextInfo?: {
		timeCommitment?: string;
		privacyNote?: string;
	};

	/** Additional CSS class */
	className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	title,
	description,
	action,
	secondaryAction,
	illustration,
	contextInfo,
	className,
}) => {
	const { t } = useTranslation();

	return (
		<section
			className={`${styles.emptyState} ${className || ''}`}
			aria-labelledby="empty-state-title">
			{/* Illustration (if provided) */}
			{illustration && (
				<div className={styles.illustration}>
					<img
						src={illustration.src}
						alt={illustration.alt}
						role="img"
						loading="lazy"
					/>
				</div>
			)}

			{/* Icon (fallback if no illustration) */}
			{!illustration && icon && <div className={styles.icon}>{icon}</div>}

			{/* Title */}
			<h2 id="empty-state-title" className={styles.title}>
				{title}
			</h2>

			{/* Description */}
			{description && <p className={styles.description}>{description}</p>}

			{/* Context info */}
			{contextInfo && (
				<div className={styles.contextInfo}>
					{contextInfo.timeCommitment && (
						<p className={styles.contextItem}>
							<span className={styles.contextLabel}>
								{t('common.ui.loadingStates.time')}:
							</span>{' '}
							{contextInfo.timeCommitment}
						</p>
					)}
					{contextInfo.privacyNote && (
						<p className={styles.contextPrivacy}>{contextInfo.privacyNote}</p>
					)}
				</div>
			)}

			{/* Actions */}
			{(action || secondaryAction) && (
				<div className={styles.actions}>
					{action && (
						<button className={styles.action} onClick={action.onClick}>
							{action.label}
						</button>
					)}
					{secondaryAction && (
						<button
							className={styles.secondaryAction}
							onClick={secondaryAction.onClick}>
							{secondaryAction.label}
						</button>
					)}
				</div>
			)}
		</section>
	);
};

export interface ErrorStateProps {
	/** Error message */
	message: string;

	/** Additional details */
	details?: string;

	/** Retry action */
	retry?: () => void;

	/** Additional CSS class */
	className?: string;

	/** Error icon (defaults to warning icon) */
	icon?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
	message,
	details,
	retry,
	className,
	icon,
}) => {
	return (
		<div className={`${styles.errorState} ${className || ''}`}>
			<div className={styles.errorIcon}>
				{icon || (
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
						<path
							d="M12 2L2 20h20L12 2z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							fill="none"
						/>
						<path
							d="M12 9v4"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<circle cx="12" cy="17" r="1" fill="currentColor" />
					</svg>
				)}
			</div>
			<p className={styles.errorMessage}>{message}</p>
			{details && <p className={styles.errorDetails}>{details}</p>}
			{retry && (
				<button className={styles.retryButton} onClick={retry}>
					Try Again
				</button>
			)}
		</div>
	);
};

/** Success state component (for confirmation screens) */
export interface SuccessStateProps {
	/** Title */
	title: string;

	/** Description */
	description?: string;

	/** Action button */
	action?: {
		label: string;
		onClick: () => void;
	};

	/** Additional CSS class */
	className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
	title,
	description,
	action,
	className,
}) => {
	return (
		<div className={`${styles.successState} ${className || ''}`}>
			<div className={styles.successIcon}>
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none">
					<circle
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="2"
						fill="none"
					/>
					<path
						className={styles.checkmark}
						d="M8 12l2 2 4-4"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						fill="none"
						strokeDasharray="100"
						strokeDashoffset="100"
					/>
				</svg>
			</div>
			<h3 className={styles.successTitle}>{title}</h3>
			{description && (
				<p className={styles.successDescription}>{description}</p>
			)}
			{action && (
				<button className={styles.successAction} onClick={action.onClick}>
					{action.label}
				</button>
			)}
		</div>
	);
};
