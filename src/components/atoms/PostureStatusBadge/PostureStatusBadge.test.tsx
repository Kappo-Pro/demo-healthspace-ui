/**
 * PostureStatusBadge Component Tests
 *
 * Verifies:
 * - Correct status rendering for all 5 levels
 * - Icon display toggle
 * - Size variants
 * - Accessibility attributes
 * - Color-coded status indicators
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PostureStatusBadge } from './PostureStatusBadge';
import type { PostureStatus } from '@types/posture';

describe('PostureStatusBadge', () => {
	describe('Status rendering', () => {
		const statuses: PostureStatus[] = [
			'excellent',
			'good',
			'fair',
			'poor',
			'critical',
		];

		it.each(statuses)('should render %s status correctly', status => {
			render(<PostureStatusBadge status={status} />);

			const expectedLabels: Record<PostureStatus, string> = {
				excellent: 'Excellent',
				good: 'Good',
				fair: 'Fair',
				poor: 'Poor',
				critical: 'Critical',
			};

			expect(screen.getByText(expectedLabels[status])).toBeInTheDocument();
		});

		it.each(statuses)(
			'should have correct ARIA label for %s status',
			status => {
				const { container } = render(<PostureStatusBadge status={status} />);
				const badge = container.querySelector('.posture-status-badge');
				expect(badge).toHaveAttribute('role', 'status');
				expect(badge).toHaveAttribute('aria-label');
			},
		);
	});

	describe('Icon display', () => {
		it('should show icon by default', () => {
			const { container } = render(<PostureStatusBadge status="excellent" />);
			const icon = container.querySelector('.posture-status-badge__icon');
			expect(icon).toBeInTheDocument();
		});

		it('should hide icon when showIcon is false', () => {
			const { container } = render(
				<PostureStatusBadge status="excellent" showIcon={false} />,
			);
			const icon = container.querySelector('.posture-status-badge__icon');
			expect(icon).not.toBeInTheDocument();
		});
	});

	describe('Size variants', () => {
		it('should apply small size class', () => {
			const { container } = render(
				<PostureStatusBadge status="good" size="small" />,
			);
			const badge = container.querySelector('.posture-status-badge--small');
			expect(badge).toBeInTheDocument();
		});

		it('should apply default size class', () => {
			const { container } = render(
				<PostureStatusBadge status="good" size="default" />,
			);
			const badge = container.querySelector('.posture-status-badge--default');
			expect(badge).toBeInTheDocument();
		});

		it('should apply large size class', () => {
			const { container } = render(
				<PostureStatusBadge status="good" size="large" />,
			);
			const badge = container.querySelector('.posture-status-badge--large');
			expect(badge).toBeInTheDocument();
		});

		it('should use default size when not specified', () => {
			const { container } = render(<PostureStatusBadge status="good" />);
			const badge = container.querySelector('.posture-status-badge--default');
			expect(badge).toBeInTheDocument();
		});
	});

	describe('Custom className', () => {
		it('should apply custom className', () => {
			const { container } = render(
				<PostureStatusBadge status="excellent" className="custom-class" />,
			);
			const badge = container.querySelector('.custom-class');
			expect(badge).toBeInTheDocument();
		});

		it('should preserve base class with custom className', () => {
			const { container } = render(
				<PostureStatusBadge status="excellent" className="custom-class" />,
			);
			const badge = container.querySelector(
				'.posture-status-badge.custom-class',
			);
			expect(badge).toBeInTheDocument();
		});
	});

	describe('Color coding', () => {
		it('should apply success color for excellent status', () => {
			const { container } = render(<PostureStatusBadge status="excellent" />);
			const badge = container.querySelector('.posture-status-badge');
			expect(badge).toHaveStyle({ color: 'var(--color-success-600)' });
		});

		it('should apply warning color for fair status', () => {
			const { container } = render(<PostureStatusBadge status="fair" />);
			const badge = container.querySelector('.posture-status-badge');
			expect(badge).toHaveStyle({ color: 'var(--color-warning-600)' });
		});

		it('should apply error color for critical status', () => {
			const { container } = render(<PostureStatusBadge status="critical" />);
			const badge = container.querySelector('.posture-status-badge');
			expect(badge).toHaveStyle({ color: 'var(--color-error-600)' });
		});
	});
});
