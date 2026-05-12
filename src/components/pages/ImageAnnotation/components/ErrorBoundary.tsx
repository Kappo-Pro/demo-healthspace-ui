import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, theme } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error Boundary component for ImageAnnotation system
 * Catches JavaScript errors anywhere in the child component tree
 */
export class AnnotationErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details (in production, this would go to a logging service)
    this.logError(error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private generateErrorId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Create safe error log (removing sensitive information)
    const safeError = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'), // Limit stack trace
      component: errorInfo.componentStack?.split('\n').slice(0, 3).join('\n'), // Limit component stack
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Annotation Error Boundary');
      console.error('Error:', safeError);
      console.error('Full Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // In production, send to error tracking service
    // This would typically be Sentry, LogRocket, or similar
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(safeError);
    }
  };

  private handleReload = () => {
    // Clear error state and reload the component
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    });
  };

  private handlePageReload = () => {
    // Reload the entire page as a last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      const { token } = theme.useToken();

      // Default error UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: token.colorBgLayout
        }}>
          <div style={{ maxWidth: '500px', width: '100%', padding: 'var(--spacing-5)' }}>
            <Result
              status="error"
              title="Something went wrong"
              subTitle={
                <div style={{ textAlign: 'left' }}>
                  <p style={{ marginBottom: 'var(--spacing-2)', color: token.colorText }}>
                    The annotation tool encountered an unexpected error.
                    This has been logged and will be investigated.
                  </p>
                  <details style={{
                    fontSize: 'var(--font-size-xs)',
                    color: token.colorTextSecondary,
                    marginTop: 'var(--spacing-4)'
                  }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontWeight: 'var(--font-weight-medium)',
                      color: token.colorText
                    }}>
                      Error Details (ID: {this.state.errorId})
                    </summary>
                    <div style={{
                      marginTop: 'var(--spacing-2)',
                      padding: 'var(--spacing-2)',
                      backgroundColor: token.colorBgContainer,
                      borderRadius: token.borderRadius,
                      border: `1px solid ${token.colorBorder}`
                    }}>
                      <div style={{ marginBottom: 'var(--spacing-2)', color: token.colorText }}>
                        <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                      </div>
                      {process.env.NODE_ENV === 'development' && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: token.colorTextSecondary }}>
                          <strong>Stack:</strong>
                          <pre style={{
                            marginTop: 'var(--spacing-1)',
                            whiteSpace: 'pre-wrap',
                            color: token.colorTextSecondary,
                            fontSize: '11px'
                          }}>
                            {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              }
              extra={[
                <Button
                  key="reload"
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                >
                  Try Again
                </Button>,
                <Button
                  key="refresh"
                  icon={<ReloadOutlined />}
                  onClick={this.handlePageReload}
                >
                  Refresh Page
                </Button>
              ]}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const captureError = (error: Error) => {
    setError(error);
  };

  // Throw error to be caught by nearest error boundary
  if (error) {
    throw error;
  }

  return { captureError, resetError };
}

/**
 * Higher-order component that wraps components with error boundary
 */
export function withErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const ComponentWithErrorBoundary = (props: T) => {
    return (
      <AnnotationErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </AnnotationErrorBoundary>
    );
  };

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
}

// Export types for use in other components
export type { ErrorBoundaryProps, ErrorBoundaryState };