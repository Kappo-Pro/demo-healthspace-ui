/**
 * EmptyStateMessage Component Tests
 *
 * Verifies:
 * - Title and description rendering
 * - Type-specific default icons
 * - Custom icon display
 * - CTA button rendering and interaction
 * - Type-specific styling
 * - Accessibility attributes
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyStateMessage } from './EmptyStateMessage';

describe('EmptyStateMessage', () => {
	describe('Basic rendering', () => {
		it('should render title', () => {
			render(
				<EmptyStateMessage title="No data" description="No data available" />,
			);
			expect(screen.getByText('No data')).toBeInTheDocument();
		});

		it('should render description', () => {
			render(
				<EmptyStateMessage title="No data" description="No data available" />,
			);
			expect(screen.getByText('No data available')).toBeInTheDocument();
		});
	});

	describe('Empty state types', () => {
		it('should render no-data type by default', () => {
			const { container } = render(
				<EmptyStateMessage title="No data" description="Empty" />,
			);
			expect(
				container.querySelector('.empty-state-message--no-data'),
			).toBeInTheDocument();
		});

		it('should render no-results type', () => {
			const { container } = render(
				<EmptyStateMessage
					title="No results"
					description="Try different filters"
					type="no-results"
				/>,
			);
			expect(
				container.querySelector('.empty-state-message--no-results'),
			).toBeInTheDocument();
		});

		it('should render error type', () => {
			const { container } = render(
				<EmptyStateMessage
					title="Error"
					description="Something went wrong"
					type="error"
				/>,
			);
			expect(
				container.querySelector('.empty-state-message--error'),
			).toBeInTheDocument();
		});

		it('should render permission-denied type', () => {
			const { container } = render(
				<EmptyStateMessage
					title="Access denied"
					description="You don't have permission"
					type="permission-denied"
				/>,
			);
			expect(
				container.querySelector('.empty-state-message--permission-denied'),
			).toBeInTheDocument();
		});
	});

	describe('Icon display', () => {
		it('should display default icon for no-data type', () => {
			const { container } = render(
				<EmptyStateMessage
					title="No data"
					description="Empty"
					type="no-data"
				/>,
			);
			expect(
				container.querySelector('.empty-state-message__icon'),
			).toBeInTheDocument();
		});

		it('should display custom icon when provided', () => {
			const CustomIcon = () => <span data-testid="custom-icon">Custom</span>;
			render(
				<EmptyStateMessage
					title="No data"
					description="Empty"
					icon={<CustomIcon />}
				/>,
			);
			expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
		});

		it('should not display icon when icon is null', () => {
			const { container } = render(
				<EmptyStateMessage title="No data" description="Empty" icon={null} />,
			);
			expect(
				container.querySelector('.empty-state-message__icon'),
			).not.toBeInTheDocument();
		});
	});

	describe('Call to Action', () => {
		it('should render CTA button when provided', () => {
			const handleClick = jest.fn();
			render(
				<EmptyStateMessage
					title="No data"
					description="Get started"
					cta={{
						label: 'Create New',
						onClick: handleClick,
					}}
				/>,
			);
			expect(screen.getByText('Create New')).toBeInTheDocument();
		});

		it('should call onClick handler when CTA is clicked', () => {
			const handleClick = jest.fn();
			render(
				<EmptyStateMessage
					title="No data"
					description="Get started"
					cta={{
						label: 'Create New',
						onClick: handleClick,
					}}
				/>,
			);
			fireEvent.click(screen.getByText('Create New'));
			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should render primary button by default', () => {
			const { container } = render(
				<EmptyStateMessage
					title="No data"
					description="Get started"
					cta={{
						label: 'Create New',
						onClick: jest.fn(),
					}}
				/>,
			);
			const button = container.querySelector('.ant-btn-primary');
			expect(button).toBeInTheDocument();
		});

		it('should render secondary button when variant is secondary', () => {
			const { container } = render(
				<EmptyStateMessage
					title="No data"
					description="Get started"
					cta={{
						label: 'Create New',
						onClick: jest.fn(),
						variant: 'secondary',
					}}
				/>,
			);
			const button = container.querySelector('.ant-btn-default');
			expect(button).toBeInTheDocument();
		});

		it('should not render CTA when not provided', () => {
			const { container } = render(
				<EmptyStateMessage title="No data" description="Empty" />,
			);
			expect(
				container.querySelector('.empty-state-message__cta'),
			).not.toBeInTheDocument();
		});
	});

	describe('Custom className', () => {
		it('should apply custom className', () => {
			const { container } = render(
				<EmptyStateMessage
					title="No data"
					description="Empty"
					className="custom-empty"
				/>,
			);
			expect(container.querySelector('.custom-empty')).toBeInTheDocument();
		});

		it('should preserve base class with custom className', () => {
			const { container } = render(
				<EmptyStateMessage
					title="No data"
					description="Empty"
					className="custom-empty"
				/>,
			);
			expect(
				container.querySelector('.empty-state-message.custom-empty'),
			).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have status role', () => {
			const { container } = render(
				<EmptyStateMessage title="No data" description="Empty" />,
			);
			const element = container.querySelector('[role="status"]');
			expect(element).toBeInTheDocument();
		});

		it('should have aria-live="polite"', () => {
			const { container } = render(
				<EmptyStateMessage title="No data" description="Empty" />,
			);
			const element = container.querySelector('[aria-live="polite"]');
			expect(element).toBeInTheDocument();
		});

		it('should have descriptive aria-label combining title and description', () => {
			const { container } = render(
				<EmptyStateMessage
					title="No assessments"
					description="Complete your first assessment"
				/>,
			);
			const element = container.querySelector('[role="status"]');
			expect(element).toHaveAttribute(
				'aria-label',
				'No assessments: Complete your first assessment',
			);
		});
	});
});
