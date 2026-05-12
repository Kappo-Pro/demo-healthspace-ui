/**
 * Content Component
 *
 * Main content area wrapper that:
 * - Provides consistent padding and spacing
 * - Handles max-width constraints
 * - Supports loading and error states
 * - Responsive padding for mobile/tablet/desktop
 * - Optional full-width mode
 */

import { Typography } from 'antd';

const { Paragraph } = Typography;
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContentProps } from '../types';
import styles from './Content.module.css';

// Simple icons
const AlertIcon = () => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
		/>
	</svg>
);

const LoadingSpinner = () => (
	<svg className={styles.spinner} viewBox="0 0 24 24" fill="none">
		<circle
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			strokeWidth="4"
			opacity="0.25"
		/>
		<path
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			opacity="0.75"
		/>
	</svg>
);

export const Content: React.FC<ContentProps> = ({
	children,
	loading = false,
	error = null,
	fullWidth = false,
	noPadding = false,
	className,
}) => {
	const { t } = useTranslation();

	const contentClasses = [
		styles.content,
		fullWidth && styles.fullWidth,
		noPadding && styles.noPadding,
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<main className={contentClasses}>
			{loading ? (
				<div className={styles.loadingState}>
					<LoadingSpinner />
					<p>{t('common.appLayout.content.loading')}</p>
				</div>
			) : error ? (
				<div className={styles.errorState}>
					<AlertIcon />
					<h2>{t('common.appLayout.content.error')}</h2>
					<Paragraph>
						{error.message || 'An unexpected error occurred'}
					</Paragraph>
					<button
						className={styles.retryButton}
						onClick={() => window.location.reload()}>
						Reload page
					</button>
				</div>
			) : (
				children
			)}
		</main>
	);
};
