/**
 * ExportButton Component Tests
 *
 * Tests for the ExportButton component including:
 * - Rendering with label and icon
 * - Click callback behavior
 * - Loading state
 * - Disabled state with tooltip
 * - Size and type variants
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportButton } from './ExportButton';

describe('ExportButton', () => {
	const mockOnClick = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders with default label', () => {
			render(<ExportButton onClick={mockOnClick} />);
			expect(screen.getByText('Export PDF')).toBeInTheDocument();
		});

		it('renders download icon', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			expect(button.querySelector('.anticon-download')).toBeInTheDocument();
		});

		it('renders as Ant Design Button component', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn');
		});

		it('uses primary button type by default', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn-primary');
		});
	});

	describe('Click Behavior', () => {
		it('calls onClick when clicked', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			fireEvent.click(button);
			expect(mockOnClick).toHaveBeenCalledTimes(1);
		});

		it('calls onClick callback', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			fireEvent.click(button);
			// Just verify it was called (args handled by Ant Design)
			expect(mockOnClick).toHaveBeenCalled();
		});

		it('remains interactive after click', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			fireEvent.click(button);
			fireEvent.click(button);
			expect(mockOnClick).toHaveBeenCalledTimes(2);
		});
	});

	describe('Loading State', () => {
		it('shows loading spinner when loading prop is true', () => {
			render(<ExportButton onClick={mockOnClick} loading={true} />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn-loading');
		});

		it('changes text to "Exporting..." when loading', () => {
			render(<ExportButton onClick={mockOnClick} loading={true} />);
			expect(screen.getByText('Exporting...')).toBeInTheDocument();
			expect(screen.queryByText('Export PDF')).not.toBeInTheDocument();
		});

		it('has loading class during loading', () => {
			render(<ExportButton onClick={mockOnClick} loading={true} />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn-loading');
		});

		it('does not call onClick when loading', () => {
			render(<ExportButton onClick={mockOnClick} loading={true} />);
			const button = screen.getByTestId('export-button');
			fireEvent.click(button);
			expect(mockOnClick).not.toHaveBeenCalled();
		});

		it('does not show download icon when loading', () => {
			render(<ExportButton onClick={mockOnClick} loading={true} />);
			const button = screen.getByTestId('export-button');
			expect(button.querySelector('.anticon-download')).not.toBeInTheDocument();
		});

		it('shows loading spinner instead of icon', () => {
			render(<ExportButton onClick={mockOnClick} loading={true} />);
			const button = screen.getByTestId('export-button');
			expect(button.querySelector('.anticon-loading')).toBeInTheDocument();
		});
	});

	describe('Disabled State', () => {
		it('is disabled when disabled prop is true', () => {
			render(<ExportButton onClick={mockOnClick} disabled={true} />);
			const button = screen.getByTestId('export-button');
			expect(button).toBeDisabled();
		});

		it('does not call onClick when disabled', () => {
			render(<ExportButton onClick={mockOnClick} disabled={true} />);
			const button = screen.getByTestId('export-button');
			fireEvent.click(button);
			expect(mockOnClick).not.toHaveBeenCalled();
		});

		it('wraps button with tooltip when disabled', () => {
			const { container } = render(
				<ExportButton onClick={mockOnClick} disabled={true} />
			);
			// Tooltip component is present in the tree
			expect(container.querySelector('.ant-tooltip-inner')).toBeFalsy(); // Tooltip only shows on hover
			expect(screen.getByTestId('export-button')).toBeInTheDocument();
		});

		it('does not show tooltip when loading (even if disabled)', () => {
			render(
				<ExportButton onClick={mockOnClick} disabled={true} loading={true} />
			);
			expect(
				screen.queryByText('No evaluation selected')
			).not.toBeInTheDocument();
		});

		it('is disabled when disabled prop is set', () => {
			render(<ExportButton onClick={mockOnClick} disabled={true} />);
			const button = screen.getByTestId('export-button');
			expect(button).toBeDisabled();
		});

		it('has not-allowed cursor when disabled', () => {
			const { container } = render(
				<ExportButton onClick={mockOnClick} disabled={true} />
			);
			const button = container.querySelector('[data-testid="export-button"]');
			expect(button).toHaveStyle({ cursor: 'not-allowed' });
		});
	});

	describe('Size Variants', () => {
		it('renders small size variant', () => {
			render(<ExportButton onClick={mockOnClick} size="small" />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn-sm');
		});

		it('renders middle size variant (default)', () => {
			render(<ExportButton onClick={mockOnClick} size="middle" />);
			const button = screen.getByTestId('export-button');
			expect(button).not.toHaveClass('ant-btn-sm');
			expect(button).not.toHaveClass('ant-btn-lg');
		});

		it('renders large size variant', () => {
			render(<ExportButton onClick={mockOnClick} size="large" />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn-lg');
		});
	});

	describe('Type Variants', () => {
		it('renders primary type (default)', () => {
			render(<ExportButton onClick={mockOnClick} type="primary" />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn-primary');
		});

		it('renders default type', () => {
			render(<ExportButton onClick={mockOnClick} type="default" />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn');
			expect(button).not.toHaveClass('ant-btn-primary');
		});

		it('renders dashed type', () => {
			render(<ExportButton onClick={mockOnClick} type="dashed" />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn-dashed');
		});
	});

	describe('Styling', () => {
		it('applies styled-components styling', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			// Check that button exists and has Ant Design classes
			expect(button).toBeInTheDocument();
			expect(button).toHaveClass('ant-btn');
		});

		it('is a styled Ant Design button', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveClass('ant-btn');
		});
	});

	describe('Accessibility', () => {
		it('has data-testid attribute', () => {
			render(<ExportButton onClick={mockOnClick} />);
			expect(screen.getByTestId('export-button')).toBeInTheDocument();
		});

		it('is a button element', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			expect(button.tagName).toBe('BUTTON');
		});

		it('has type="button" attribute', () => {
			render(<ExportButton onClick={mockOnClick} />);
			const button = screen.getByTestId('export-button');
			expect(button).toHaveAttribute('type', 'button');
		});
	});

	describe('Edge Cases', () => {
		it('handles both disabled and loading props together', () => {
			render(
				<ExportButton onClick={mockOnClick} disabled={true} loading={true} />
			);
			const button = screen.getByTestId('export-button');
			expect(button).toBeDisabled();
			expect(button).toHaveClass('ant-btn-loading');
			expect(screen.getByText('Exporting...')).toBeInTheDocument();
		});

		it('prioritizes loading text over disabled tooltip', () => {
			render(
				<ExportButton onClick={mockOnClick} disabled={true} loading={true} />
			);
			expect(
				screen.queryByText('No evaluation selected')
			).not.toBeInTheDocument();
			expect(screen.getByText('Exporting...')).toBeInTheDocument();
		});

		it('renders correctly with all props set', () => {
			render(
				<ExportButton
					onClick={mockOnClick}
					loading={false}
					disabled={false}
					size="large"
					type="primary"
				/>
			);
			const button = screen.getByTestId('export-button');
			expect(button).toBeInTheDocument();
			expect(button).toHaveClass('ant-btn-lg');
			expect(button).toHaveClass('ant-btn-primary');
			expect(screen.getByText('Export PDF')).toBeInTheDocument();
		});
	});
});
