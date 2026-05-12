/**
 * ModalErrorBoundary Component Tests
 *
 * Tests for error boundary with Sentry integration.
 *
 * @see src/components/organisms/EvaluationResultsModal/ModalErrorBoundary.tsx
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalErrorBoundary } from './ModalErrorBoundary';

// Component that throws error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
	if (shouldThrow) {
		throw new Error('Test error');
	}
	return <div>No error</div>;
};

describe('ModalErrorBoundary', () => {
	// Suppress console.error for cleaner test output
	const originalError = console.error;
	beforeAll(() => {
		console.error = jest.fn();
	});

	afterAll(() => {
		console.error = originalError;
	});

	it('should render children when no error', () => {
		render(
			<ModalErrorBoundary>
				<div>Test content</div>
			</ModalErrorBoundary>,
		);

		expect(screen.getByText('Test content')).toBeInTheDocument();
	});

	it('should render error UI when child throws error', () => {
		render(
			<ModalErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		expect(screen.getByTestId('modal-error-boundary')).toBeInTheDocument();
		expect(
			screen.getByText('Unable to Load Evaluation Details'),
		).toBeInTheDocument();
	});

	it('should display error message with description', () => {
		render(
			<ModalErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		expect(
			screen.getByText(
				/We encountered an error while loading the evaluation details/i,
			),
		).toBeInTheDocument();
		expect(
			screen.getByText(/You can try refreshing, or return to the legacy view/i),
		).toBeInTheDocument();
	});

	it('should display Retry button', () => {
		render(
			<ModalErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
	});

	it('should display Return to Legacy View button', () => {
		render(
			<ModalErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		expect(
			screen.getByRole('button', { name: /return to legacy view/i }),
		).toBeInTheDocument();
	});

	it('should reset error state when Retry clicked', () => {
		const { rerender } = render(
			<ModalErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		// Error UI displayed
		expect(screen.getByTestId('modal-error-boundary')).toBeInTheDocument();

		// Click Retry
		fireEvent.click(screen.getByRole('button', { name: /retry/i }));

		// Re-render with no error
		rerender(
			<ModalErrorBoundary>
				<ThrowError shouldThrow={false} />
			</ModalErrorBoundary>,
		);

		// Children should render
		expect(screen.getByText('No error')).toBeInTheDocument();
		expect(
			screen.queryByTestId('modal-error-boundary'),
		).not.toBeInTheDocument();
	});

	it('should reload page when Return to Legacy View clicked', () => {
		// Mock window.location.reload
		delete (window as Partial<Window>).location;
		window.location = { reload: jest.fn() } as never;

		render(
			<ModalErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		// Click Return to Legacy View
		fireEvent.click(
			screen.getByRole('button', { name: /return to legacy view/i }),
		);

		// Should reload page
		expect(window.location.reload).toHaveBeenCalled();
	});

	it('should render custom fallback if provided', () => {
		const customFallback = <div>Custom error message</div>;

		render(
			<ModalErrorBoundary fallback={customFallback}>
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		expect(screen.getByText('Custom error message')).toBeInTheDocument();
		expect(
			screen.queryByTestId('modal-error-boundary'),
		).not.toBeInTheDocument();
	});

	it('should pass evaluationId and userId to error context', () => {
		const mockSentry = {
			captureException: jest.fn(),
		};

		// Mock Sentry global
		(window as unknown as { Sentry: typeof mockSentry }).Sentry = mockSentry;

		render(
			<ModalErrorBoundary evaluationId="eval-123" userId="user-456">
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		// Sentry should be called with context
		expect(mockSentry.captureException).toHaveBeenCalledWith(
			expect.any(Error),
			expect.objectContaining({
				contexts: expect.objectContaining({
					evaluationModal: {
						evaluationId: 'eval-123',
						userId: 'user-456',
					},
				}),
				tags: expect.objectContaining({
					feature: 'evaluation-modal',
					errorBoundary: 'ModalErrorBoundary',
				}),
			}),
		);

		// Cleanup
		delete (window as { Sentry?: typeof mockSentry }).Sentry;
	});

	it('should log to Sentry when error caught', () => {
		const mockSentry = {
			captureException: jest.fn(),
		};

		(window as unknown as { Sentry: typeof mockSentry }).Sentry = mockSentry;

		render(
			<ModalErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ModalErrorBoundary>,
		);

		expect(mockSentry.captureException).toHaveBeenCalled();

		// Cleanup
		delete (window as { Sentry?: typeof mockSentry }).Sentry;
	});

	it('should handle missing Sentry gracefully', () => {
		// Ensure Sentry is not available
		delete (window as { Sentry?: unknown }).Sentry;

		// Should not throw
		expect(() => {
			render(
				<ModalErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ModalErrorBoundary>,
			);
		}).not.toThrow();

		// Error UI should still render
		expect(screen.getByTestId('modal-error-boundary')).toBeInTheDocument();
	});

	it('should handle Sentry logging error gracefully', () => {
		const mockSentry = {
			captureException: jest.fn(() => {
				throw new Error('Sentry error');
			}),
		};

		(window as unknown as { Sentry: typeof mockSentry }).Sentry = mockSentry;

		// Should not throw
		expect(() => {
			render(
				<ModalErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ModalErrorBoundary>,
			);
		}).not.toThrow();

		// Error UI should still render
		expect(screen.getByTestId('modal-error-boundary')).toBeInTheDocument();

		// Cleanup
		delete (window as { Sentry?: typeof mockSentry }).Sentry;
	});
});
