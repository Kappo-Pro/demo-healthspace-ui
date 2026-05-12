/**
 * LazyLoadErrorBoundary Component
 *
 * Error boundary for catching and handling lazy loading failures
 *
 * @component
 * @version 1.0.0
 * @story Story 3.1 - Code Splitting
 */

import React, { Component, ReactNode } from 'react';
import { Button, Result } from 'antd';
import i18n from 'i18next';

/**
 * Props interface for LazyLoadErrorBoundary
 */
interface LazyLoadErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;

  /** Optional chunk name for error tracking */
  chunkName?: string;
}

/**
 * State interface for LazyLoadErrorBoundary
 */
interface LazyLoadErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;

  /** The error object (if any) */
  error: Error | null;
}

/**
 * LazyLoadErrorBoundary - Error boundary for lazy loading failures
 *
 * Catches errors during lazy loading (network failures, chunk load errors)
 * and provides a user-friendly error message with retry functionality.
 *
 * Features:
 * - Catches lazy load errors (ChunkLoadError, network failures)
 * - Displays user-friendly error message
 * - Provides retry button
 * - Logs errors to Sentry (if available)
 * - Resets error state on retry
 *
 * @example
 * ```tsx
 * <LazyLoadErrorBoundary chunkName="EvaluationResultsModal">
 *   <Suspense fallback={<ModalLoadingSkeleton />}>
 *     <EvaluationResultsModal {...props} />
 *   </Suspense>
 * </LazyLoadErrorBoundary>
 * ```
 */
export class LazyLoadErrorBoundary extends Component<
  LazyLoadErrorBoundaryProps,
  LazyLoadErrorBoundaryState
> {
  constructor(props: LazyLoadErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Derive state from error
   * Called when a child component throws an error
   */
  static getDerivedStateFromError(error: Error): LazyLoadErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log error details
   * Called after error is caught
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development
    console.error('LazyLoadErrorBoundary caught an error:', error, errorInfo);

    // Log to Sentry if available
    if (typeof window !== 'undefined' && (window as never)['Sentry']) {
      const Sentry = (window as never)['Sentry'] as {
        captureException: (
          error: Error,
          context?: {
            tags?: Record<string, string>;
            contexts?: Record<string, unknown>;
          },
        ) => void;
      };

      Sentry.captureException(error, {
        tags: {
          component: 'LazyLoadErrorBoundary',
          chunkName: this.props.chunkName || 'unknown',
          errorType: error.name,
        },
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
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
   * Render error UI or children
   */
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div data-testid="lazy-load-error-boundary">
          <Result
            status="error"
            title={i18n.t('Admin.data.evaluation.errors.lazyLoad.title')}
            subTitle={i18n.t('Admin.data.evaluation.errors.lazyLoad.subtitle')}
            extra={
              <Button type="primary" onClick={this.handleRetry}>
                {i18n.t('Admin.data.evaluation.errors.lazyLoad.retryButton')}
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}
