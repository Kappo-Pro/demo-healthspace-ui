import React, { Component, ErrorInfo, ReactNode } from 'react';
import i18n from 'i18next';

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
		// Error is already stored in state via getDerivedStateFromError
		// ErrorInfo is available for logging if needed in the future
	}

	handleRetry = (): void => {
		this.setState({ hasError: false, error: null });
	};

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				<div
					className="posture-3d-error"
					role="alert"
					aria-live="assertive"
					aria-atomic="true">
					<p className="posture-3d-error-message">
						{i18n.t('Patient.data.postures.viewer3D.errorBoundary.failedToLoad')}
						{this.state.error && (
							<span className="sr-only">
								{i18n.t('Patient.data.postures.viewer3D.errorBoundary.errorDetails', {
									message: this.state.error.message,
								})}
							</span>
						)}
					</p>
					<button
						onClick={this.handleRetry}
						className="posture-3d-error-button"
						aria-label={i18n.t('Patient.data.postures.viewer3D.errorBoundary.retryButtonAriaLabel')}>
						{i18n.t('Patient.data.postures.viewer3D.errorBoundary.retryButton')}
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
