/**
 * StatusDropdown Component Tests
 *
 * Tests for the StatusDropdown component including:
 * - Rendering with current status
 * - Disabled state
 * - Size variants
 * - Component props
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusDropdown } from './StatusDropdown';

describe('StatusDropdown', () => {
	const mockOnChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders with current status selected', () => {
			render(
				<StatusDropdown currentStatus="pending" onChange={mockOnChange} />
			);
			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toBeInTheDocument();
		});

		it('has minimum width of 150px', () => {
			render(
				<StatusDropdown currentStatus="pending" onChange={mockOnChange} />
			);
			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toHaveStyle({ minWidth: '150px' });
		});

		it('renders with pending status', () => {
			render(
				<StatusDropdown currentStatus="pending" onChange={mockOnChange} />
			);
			expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
		});

		it('renders with in-review status', () => {
			render(
				<StatusDropdown currentStatus="in-review" onChange={mockOnChange} />
			);
			expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
		});

		it('renders with completed status', () => {
			render(
				<StatusDropdown currentStatus="completed" onChange={mockOnChange} />
			);
			expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
		});

		it('renders with archived status', () => {
			render(
				<StatusDropdown currentStatus="archived" onChange={mockOnChange} />
			);
			expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
		});
	});

	describe('Disabled State', () => {
		it('disables dropdown when disabled prop is true', () => {
			render(
				<StatusDropdown
					currentStatus="pending"
					onChange={mockOnChange}
					disabled={true}
				/>
			);
			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toHaveClass('ant-select-disabled');
		});

		it('is enabled by default', () => {
			render(
				<StatusDropdown currentStatus="pending" onChange={mockOnChange} />
			);
			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).not.toHaveClass('ant-select-disabled');
		});
	});

	describe('Size Variants', () => {
		it('handles size prop correctly - small', () => {
			render(
				<StatusDropdown
					currentStatus="pending"
					onChange={mockOnChange}
					size="small"
				/>
			);
			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toHaveClass('ant-select-sm');
		});

		it('handles size prop correctly - middle (default)', () => {
			render(
				<StatusDropdown
					currentStatus="pending"
					onChange={mockOnChange}
					size="middle"
				/>
			);
			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).not.toHaveClass('ant-select-sm');
			expect(dropdown).not.toHaveClass('ant-select-lg');
		});

		it('handles size prop correctly - large', () => {
			render(
				<StatusDropdown
					currentStatus="pending"
					onChange={mockOnChange}
					size="large"
				/>
			);
			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toHaveClass('ant-select-lg');
		});
	});

	describe('Component Props', () => {
		it('accepts onChange callback', () => {
			const onChange = jest.fn();
			render(<StatusDropdown currentStatus="pending" onChange={onChange} />);
			expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
		});

		it('accepts all valid status values', () => {
			const statuses: Array<
				'pending' | 'in-review' | 'completed' | 'archived'
			> = ['pending', 'in-review', 'completed', 'archived'];

			statuses.forEach((status) => {
				const { container } = render(
					<StatusDropdown currentStatus={status} onChange={mockOnChange} />
				);
				expect(
					container.querySelector('[data-testid="status-dropdown"]')
				).toBeInTheDocument();
			});
		});

		it('accepts optional disabled prop', () => {
			const { rerender } = render(
				<StatusDropdown currentStatus="pending" onChange={mockOnChange} />
			);
			let dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).not.toHaveClass('ant-select-disabled');

			rerender(
				<StatusDropdown
					currentStatus="pending"
					onChange={mockOnChange}
					disabled={true}
				/>
			);
			dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toHaveClass('ant-select-disabled');
		});

		it('accepts optional size prop', () => {
			const { rerender } = render(
				<StatusDropdown
					currentStatus="pending"
					onChange={mockOnChange}
					size="small"
				/>
			);
			let dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toHaveClass('ant-select-sm');

			rerender(
				<StatusDropdown
					currentStatus="pending"
					onChange={mockOnChange}
					size="large"
				/>
			);
			dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toHaveClass('ant-select-lg');
		});
	});

	describe('Accessibility', () => {
		it('has data-testid attribute', () => {
			render(
				<StatusDropdown currentStatus="pending" onChange={mockOnChange} />
			);
			expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
		});

		it('uses Ant Design Select component', () => {
			render(
				<StatusDropdown currentStatus="pending" onChange={mockOnChange} />
			);
			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toHaveClass('ant-select');
		});
	});
});
