/**
 * ModalErrorBoundary Component
 *
 * Error boundary specifically for EvaluationResultsModal with enhanced error tracking.
 * Integrates with Sentry for production error monitoring and rollout tracking.
 *
 * @component
 * @version 2.0.0
 * @story Story 5.3 - Production Deployment
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Space } from 'antd';
import i18n from 'i18next';

/**
 * Props interface for ModalErrorBoundary
 */
interface ModalErrorBoundaryProps {
	/** Child components to render */
	children: ReactNode;

	/** Optional fallback UI (uses default if not provided) */
	fallback?: ReactNode;

	/** Evaluation ID for error context */
	evaluationId?: string;

	/** User ID for error context */
	userId?: string;
}

/**
 * State interface for ModalErrorBoundary
 */
interface ModalErrorBoundaryState {
	/** Whether an error has been caught */
	hasError: boolean;

	/** The error object (if any) */
	error: Error | null;
}

/**
 * ModalErrorBoundary - Error boundary for evaluation modal
 *
 * Catches runtime errors in modal component tree and provides:
 * - User-friendly error UI with retry functionality
 * - Error logging to Sentry (if available)
 * - Evaluation and user context for debugging
 *
 * Features:
 * - Graceful error handling (prevents app crash)
 * - Detailed error logging with context
 * - Retry button to attempt recovery
 *
 * @example
 * ```tsx
 * <ModalErrorBoundary
 *   evaluationId={evaluationData.id}
 *   userId={user.id}
 * >
 *   <EvaluationResultsModal {...props} />
 * </ModalErrorBoundary>
 * ```
 */
export class ModalErrorBoundary extends Component<
	ModalErrorBoundaryProps,
	ModalErrorBoundaryState
> {
	constructor(props: ModalErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	/**
	 * Derive state from error
	 * Called when a child component throws an error
	 */
	static getDerivedStateFromError(error: Error): ModalErrorBoundaryState {
		return { hasError: true, error };
	}

	/**
	 * Log error details
	 * Called after error is caught
	 */
	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Log to console in development
		console.error('ModalErrorBoundary caught error:', error, errorInfo);

		// Log to Sentry if available
		this.logToSentry(error, errorInfo);
	}

	/**
	 * Log error to Sentry
	 *
	 * Sends error to Sentry with rich context:
	 * - Evaluation ID
	 * - User ID
	 * - React component stack
	 */
	private logToSentry(error: Error, errorInfo: ErrorInfo): void {
		if (typeof window === 'undefined') {
			return;
		}

		// Check if Sentry is available
		const sentryInstance = (window as { Sentry?: SentryInstance }).Sentry;
		if (!sentryInstance) {
			// Sentry not available (likely development or staging)
			console.warn('Sentry not available - error not logged to Sentry');
			return;
		}

		try {
			sentryInstance.captureException(error, {
				contexts: {
					react: {
						componentStack: errorInfo.componentStack,
					},
					evaluationModal: {
						evaluationId: this.props.evaluationId,
						userId: this.props.userId,
					},
				},
				tags: {
					feature: 'evaluation-modal',
					errorBoundary: 'ModalErrorBoundary',
				},
				level: 'error',
			});
		} catch (sentryError) {
			// Intentionally silent - Sentry errors should not crash the app
			console.warn('Failed to log error to Sentry:', sentryError);
		}
	}

	/**
	 * Handle retry button click
	 * Resets error state to attempt re-render
	 */
	handleRetry = (): void => {
		this.setState({ hasError: false, error: null });
	};

	/**
	 * Handle fallback to legacy view
	 * Redirects to legacy collapse panel
	 */
	handleFallbackToLegacy = (): void => {
		// Reload page to force legacy view
		// This ensures user can still access evaluation data
		window.location.reload();
	};

	/**
	 * Render error UI or children
	 */
	render(): ReactNode {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div
					data-testid="modal-error-boundary"
					style={{
						padding: 'var(--spacing-6)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						minHeight: 'var(--spacing-100)',
					}}>
					<Alert
						message={i18n.t('Admin.data.evaluation.errors.modalError.title')}
						description={
							<Space
								direction="vertical"
								size="middle"
								style={{ width: '100%' }}>
								<p>
									{i18n.t(
										'Admin.data.evaluation.errors.modalError.description1',
									)}
								</p>
								<p style={{ marginBottom: 0 }}>
									{i18n.t(
										'Admin.data.evaluation.errors.modalError.description2',
									)}
								</p>
							</Space>
						}
						type="error"
						showIcon
						action={
							<Space direction="vertical" size="small">
								<Button type="primary" onClick={this.handleRetry}>
									{i18n.t(
										'Admin.data.evaluation.errors.modalError.retryButton',
									)}
								</Button>
								<Button onClick={this.handleFallbackToLegacy}>
									{i18n.t(
										'Admin.data.evaluation.errors.modalError.legacyViewButton',
									)}
								</Button>
							</Space>
						}
					/>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * Sentry instance interface
 * TypeScript interface for Sentry global object
 */
interface SentryInstance {
	captureException: (
		error: Error,
		context?: {
			contexts?: Record<string, unknown>;
			tags?: Record<string, string>;
			level?: 'error' | 'warning' | 'info';
		},
	) => void;
}
