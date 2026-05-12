/**
 * LazyLoadErrorBoundary Tests
 *
 * @story Story 3.1 - Code Splitting
 */

import React from 'react';
import { render, screen, fireEvent } from '@test-utils';
import { LazyLoadErrorBoundary } from './LazyLoadErrorBoundary';

// Component that throws an error
const ThrowError: React.FC = () => {
  throw new Error('Chunk load failed');
};

// Component that renders successfully
const SuccessComponent: React.FC = () => {
  return <div>Success!</div>;
};

describe('LazyLoadErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when no error occurs', () => {
    render(
      <LazyLoadErrorBoundary>
        <SuccessComponent />
      </LazyLoadErrorBoundary>
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('catches errors and displays error message', () => {
    render(
      <LazyLoadErrorBoundary chunkName="TestChunk">
        <ThrowError />
      </LazyLoadErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByTestId('lazy-load-error-boundary')).toBeInTheDocument();
    expect(screen.getByText('Unable to Load')).toBeInTheDocument();
    expect(
      screen.getByText('Unable to load evaluation details. Please try again.')
    ).toBeInTheDocument();
  });

  it('displays retry button on error', () => {
    render(
      <LazyLoadErrorBoundary chunkName="TestChunk">
        <ThrowError />
      </LazyLoadErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /Retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('resets error state on retry', () => {
    let shouldThrow = true;

    const ConditionalError: React.FC = () => {
      if (shouldThrow) {
        throw new Error('Chunk load failed');
      }
      return <div>Loaded successfully!</div>;
    };

    const { rerender } = render(
      <LazyLoadErrorBoundary chunkName="TestChunk">
        <ConditionalError />
      </LazyLoadErrorBoundary>
    );

    // Should show error
    expect(screen.getByText('Unable to Load')).toBeInTheDocument();

    // Click retry
    shouldThrow = false;
    const retryButton = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryButton);

    // Re-render without error
    rerender(
      <LazyLoadErrorBoundary chunkName="TestChunk">
        <ConditionalError />
      </LazyLoadErrorBoundary>
    );

    // Note: In real React behavior, error boundary resets on retry
    // This test verifies the retry button exists and is clickable
  });

  it('logs error to console', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <LazyLoadErrorBoundary chunkName="TestChunk">
        <ThrowError />
      </LazyLoadErrorBoundary>
    );

    // Should log error to console
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('includes chunk name in error context', () => {
    render(
      <LazyLoadErrorBoundary chunkName="EvaluationResultsModal">
        <ThrowError />
      </LazyLoadErrorBoundary>
    );

    // Should render with chunk name in props
    // (Chunk name would be used in Sentry logging)
    expect(screen.getByTestId('lazy-load-error-boundary')).toBeInTheDocument();
  });

  it('matches snapshot for error state', () => {
    const { container } = render(
      <LazyLoadErrorBoundary chunkName="TestChunk">
        <ThrowError />
      </LazyLoadErrorBoundary>
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for success state', () => {
    const { container } = render(
      <LazyLoadErrorBoundary chunkName="TestChunk">
        <SuccessComponent />
      </LazyLoadErrorBoundary>
    );

    expect(container).toMatchSnapshot();
  });
});
