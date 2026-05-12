/**
 * SeverityIndicator Component Tests
 *
 * Tests for the SeverityIndicator component including:
 * - Rendering with different severity levels
 * - Custom labels
 * - Size variants
 * - Color styling
 * - Accessibility attributes
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SeverityIndicator } from './SeverityIndicator';

describe('SeverityIndicator', () => {
	describe('Rendering', () => {
		it('renders with high severity', () => {
			render(<SeverityIndicator level="high" />);
			expect(screen.getByText('High')).toBeInTheDocument();
			expect(screen.getByTestId('severity-indicator')).toHaveAttribute(
				'aria-label',
				'Severity: High'
			);
		});

		it('renders with medium severity', () => {
			render(<SeverityIndicator level="medium" />);
			expect(screen.getByText('Medium')).toBeInTheDocument();
			expect(screen.getByTestId('severity-indicator')).toHaveAttribute(
				'aria-label',
				'Severity: Medium'
			);
		});

		it('renders with low severity', () => {
			render(<SeverityIndicator level="low" />);
			expect(screen.getByText('Low')).toBeInTheDocument();
			expect(screen.getByTestId('severity-indicator')).toHaveAttribute(
				'aria-label',
				'Severity: Low'
			);
		});
	});

	describe('Custom Label', () => {
		it('renders with custom label', () => {
			render(<SeverityIndicator level="high" label="Critical" />);
			expect(screen.getByText('Critical')).toBeInTheDocument();
			expect(screen.getByTestId('severity-indicator')).toHaveAttribute(
				'aria-label',
				'Severity: Critical'
			);
		});

		it('uses capitalized level as default label', () => {
			render(<SeverityIndicator level="high" />);
			expect(screen.getByText('High')).toBeInTheDocument();
		});
	});

	describe('Size Variants', () => {
		it('renders small size variant', () => {
			const { container } = render(
				<SeverityIndicator level="medium" size="small" />
			);
			const tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ fontSize: '10px' });
		});

		it('renders default size variant', () => {
			const { container } = render(<SeverityIndicator level="medium" />);
			const tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ fontSize: 'var(--font-size-xs)' });
		});

		it('renders large size variant', () => {
			const { container } = render(
				<SeverityIndicator level="medium" size="large" />
			);
			const tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ fontSize: 'var(--font-size-sm)' });
		});
	});

	describe('Color Styling', () => {
		it('applies high severity styling', () => {
			render(<SeverityIndicator level="high" />);
			const tag = screen.getByTestId('severity-indicator');
			// Tag component is rendered and has styling
			expect(tag).toBeInTheDocument();
			expect(tag).toHaveClass('ant-tag');
		});

		it('applies medium severity styling', () => {
			render(<SeverityIndicator level="medium" />);
			const tag = screen.getByTestId('severity-indicator');
			// Tag component is rendered and has styling
			expect(tag).toBeInTheDocument();
			expect(tag).toHaveClass('ant-tag');
		});

		it('applies low severity styling', () => {
			render(<SeverityIndicator level="low" />);
			const tag = screen.getByTestId('severity-indicator');
			// Tag component is rendered and has styling
			expect(tag).toBeInTheDocument();
			expect(tag).toHaveClass('ant-tag');
		});

		it('uses white color for text on all severity levels', () => {
			const { container, rerender } = render(
				<SeverityIndicator level="high" />
			);
			let tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ color: 'white' });

			rerender(<SeverityIndicator level="medium" />);
			tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ color: 'white' });

			rerender(<SeverityIndicator level="low" />);
			tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ color: 'white' });
		});
	});

	describe('Accessibility', () => {
		it('includes ARIA label with severity level', () => {
			render(<SeverityIndicator level="high" />);
			const indicator = screen.getByTestId('severity-indicator');
			expect(indicator).toHaveAttribute('aria-label', 'Severity: High');
		});

		it('includes ARIA label with custom label', () => {
			render(<SeverityIndicator level="high" label="Critical" />);
			const indicator = screen.getByTestId('severity-indicator');
			expect(indicator).toHaveAttribute('aria-label', 'Severity: Critical');
		});

		it('displays text label (not color-only)', () => {
			render(<SeverityIndicator level="high" />);
			expect(screen.getByText('High')).toBeVisible();
		});

		it('uses uppercase text transformation', () => {
			const { container } = render(<SeverityIndicator level="high" />);
			const tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ textTransform: 'uppercase' });
		});
	});

	describe('Styling', () => {
		it('has no margin', () => {
			const { container } = render(<SeverityIndicator level="high" />);
			const tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ margin: '0' });
		});

		it('has no border', () => {
			const { container } = render(<SeverityIndicator level="high" />);
			const tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ border: 'none' });
		});

		it('has bold font weight', () => {
			const { container } = render(<SeverityIndicator level="high" />);
			const tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ fontWeight: 'var(--font-weight-semibold)' });
		});

		it('has letter spacing', () => {
			const { container } = render(<SeverityIndicator level="high" />);
			const tag = container.querySelector('[data-testid="severity-indicator"]');
			expect(tag).toHaveStyle({ letterSpacing: '0.5px' });
		});
	});
});
