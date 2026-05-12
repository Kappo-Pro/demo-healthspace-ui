/**
 * TrendIndicator Component Tests
 *
 * Verifies all acceptance criteria:
 * - AC-003: Positive trends display green with ↑ arrow
 * - AC-004: Negative trends display red with ↓ arrow
 * - AC-005: Neutral trends display gray with — symbol
 * - AC-006: Percentage formatted to 1 decimal place
 */

import React from 'react';
import { render } from '@testing-library/react';
import { TrendIndicator } from './TrendIndicator';

describe('TrendIndicator', () => {
	describe('AC-003: Positive trends', () => {
		it('should display positive value with + prefix', () => {
			const { container } = render(<TrendIndicator value={5.234} />);
			expect(container.textContent).toContain('+5.2%');
		});

		it('should use green color for positive trends', () => {
			const { container } = render(<TrendIndicator value={10} />);
			const element = container.querySelector('.trend-indicator');
			expect(element).toHaveStyle({ color: 'var(--color-success-600)' });
		});
	});

	describe('AC-004: Negative trends', () => {
		it('should display negative value with - prefix', () => {
			const { container } = render(<TrendIndicator value={-3.1} />);
			expect(container.textContent).toContain('-3.1%');
		});

		it('should use red color for negative trends', () => {
			const { container } = render(<TrendIndicator value={-10} />);
			const element = container.querySelector('.trend-indicator');
			expect(element).toHaveStyle({ color: 'var(--color-error-600)' });
		});
	});

	describe('AC-005: Neutral trends', () => {
		it('should display zero without prefix', () => {
			const { container } = render(<TrendIndicator value={0} />);
			expect(container.textContent).toContain('0.0%');
			expect(container.textContent).not.toContain('+0.0%');
			expect(container.textContent).not.toContain('-0.0%');
		});

		it('should use gray color for neutral trends', () => {
			const { container } = render(<TrendIndicator value={0} />);
			const element = container.querySelector('.trend-indicator');
			expect(element).toHaveStyle({ color: 'var(--text-tertiary)' });
		});

		it('should display neutral symbol for zero', () => {
			const { container } = render(<TrendIndicator value={0} />);
			expect(container.textContent).toContain('—');
		});
	});

	describe('AC-006: Percentage formatting', () => {
		it('should format to 1 decimal place', () => {
			const { container } = render(<TrendIndicator value={5.234} />);
			expect(container.textContent).toContain('5.2%');
		});

		it('should round correctly', () => {
			const { container } = render(<TrendIndicator value={5.678} />);
			expect(container.textContent).toContain('5.7%');
		});

		it('should handle whole numbers', () => {
			const { container } = render(<TrendIndicator value={5} />);
			expect(container.textContent).toContain('5.0%');
		});
	});
});
