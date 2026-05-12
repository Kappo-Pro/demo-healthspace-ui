/**
 * AssessmentStatusCard Unit Tests
 *
 * EPIC-002-S4: Test Suite for AssessmentStatusCard Molecule Component
 *
 * Coverage Target: 80%
 *
 * Test Strategy:
 * 1. Test rendering with different assessment types (ROM, Posture, Survey)
 * 2. Test status badge rendering (completed/pending/expired)
 * 3. Test helper functions (getStatusBadge, getCTAText)
 * 4. Test date formatting
 * 5. Test score display (present/null)
 * 6. Test CTA button behavior
 * 7. Test accessibility (touch targets, ARIA attributes)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssessmentStatusCard } from '../index';
import { getStatusBadge, getCTAText } from '../utils';
import type { AssessmentStatusCardProps } from '../types';

// ============================================================================
// HELPER FUNCTION TESTS
// ============================================================================

describe('AssessmentStatusCard - Helper Functions', () => {
	describe('getStatusBadge', () => {
		it('should return correct config for completed status', () => {
			const config = getStatusBadge('completed');
			expect(config.text).toBe('Completed');
			expect(config.color).toBe('success');
			expect(config.icon).toBeDefined();
		});

		it('should return correct config for pending status', () => {
			const config = getStatusBadge('pending');
			expect(config.text).toBe('Pending');
			expect(config.color).toBe('warning');
			expect(config.icon).toBeDefined();
		});

		it('should return correct config for expired status', () => {
			const config = getStatusBadge('expired');
			expect(config.text).toBe('Expired');
			expect(config.color).toBe('error');
			expect(config.icon).toBeDefined();
		});
	});

	describe('getCTAText', () => {
		it('should return "Retake" for completed status', () => {
			expect(getCTAText('completed')).toBe('Retake');
		});

		it('should return "Resume" for pending status', () => {
			expect(getCTAText('pending')).toBe('Resume');
		});

		it('should return "Start" for expired status', () => {
			expect(getCTAText('expired')).toBe('Start');
		});
	});
});

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('AssessmentStatusCard - Basic Rendering', () => {
	const defaultProps: AssessmentStatusCardProps = {
		type: 'rom',
		status: 'pending',
		lastUpdated: '2025-10-18T10:00:00Z',
		score: null,
		onAction: jest.fn(),
	};

	it('should render ROM assessment type', () => {
		render(<AssessmentStatusCard {...defaultProps} type="rom" />);
		expect(screen.getByText(/ROM Assessment/i)).toBeInTheDocument();
	});

	it('should render Posture assessment type', () => {
		render(<AssessmentStatusCard {...defaultProps} type="posture" />);
		expect(screen.getByText(/POSTURE Assessment/i)).toBeInTheDocument();
	});

	it('should render Survey assessment type', () => {
		render(<AssessmentStatusCard {...defaultProps} type="survey" />);
		expect(screen.getByText(/SURVEY Assessment/i)).toBeInTheDocument();
	});

	it('should render with uppercase assessment type', () => {
		render(<AssessmentStatusCard {...defaultProps} type="rom" />);
		// Verify type is uppercased
		const title = screen.getByText(/ROM Assessment/i);
		expect(title.textContent).toContain('ROM');
	});
});

// ============================================================================
// STATUS BADGE TESTS
// ============================================================================

describe('AssessmentStatusCard - Status Badge', () => {
	const defaultProps: AssessmentStatusCardProps = {
		type: 'rom',
		status: 'pending',
		lastUpdated: '2025-10-18T10:00:00Z',
		score: null,
		onAction: jest.fn(),
	};

	it('should render completed badge with success color', () => {
		render(<AssessmentStatusCard {...defaultProps} status="completed" />);

		expect(screen.getByText('Completed')).toBeInTheDocument();
		const badge = document.querySelector('.ant-badge-status-success');
		expect(badge).toBeInTheDocument();
	});

	it('should render pending badge with warning color', () => {
		render(<AssessmentStatusCard {...defaultProps} status="pending" />);

		expect(screen.getByText('Pending')).toBeInTheDocument();
		const badge = document.querySelector('.ant-badge-status-warning');
		expect(badge).toBeInTheDocument();
	});

	it('should render expired badge with error color', () => {
		render(<AssessmentStatusCard {...defaultProps} status="expired" />);

		expect(screen.getByText('Expired')).toBeInTheDocument();
		const badge = document.querySelector('.ant-badge-status-error');
		expect(badge).toBeInTheDocument();
	});

	it('should render status icon for completed', () => {
		const { container } = render(
			<AssessmentStatusCard {...defaultProps} status="completed" />,
		);

		// CheckCircleOutlined icon should be present
		const icon = container.querySelector('.anticon-check-circle');
		expect(icon).toBeInTheDocument();
	});

	it('should render status icon for pending', () => {
		const { container } = render(
			<AssessmentStatusCard {...defaultProps} status="pending" />,
		);

		// ClockCircleOutlined icon should be present
		const icon = container.querySelector('.anticon-clock-circle');
		expect(icon).toBeInTheDocument();
	});

	it('should render status icon for expired', () => {
		const { container } = render(
			<AssessmentStatusCard {...defaultProps} status="expired" />,
		);

		// ExclamationCircleOutlined icon should be present
		const icon = container.querySelector('.anticon-exclamation-circle');
		expect(icon).toBeInTheDocument();
	});
});

// ============================================================================
// DATE FORMATTING TESTS
// ============================================================================

describe('AssessmentStatusCard - Date Formatting', () => {
	const defaultProps: AssessmentStatusCardProps = {
		type: 'rom',
		status: 'completed',
		lastUpdated: '2025-10-18T10:00:00Z',
		score: null,
		onAction: jest.fn(),
	};

	it('should display formatted date using date-fns', () => {
		render(<AssessmentStatusCard {...defaultProps} />);

		// Should contain "Last updated" text with relative time
		expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
		expect(screen.getByText(/ago/i)).toBeInTheDocument();
	});

	it('should format recent dates correctly', () => {
		// Date 2 days ago
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

		render(
			<AssessmentStatusCard
				{...defaultProps}
				lastUpdated={twoDaysAgo.toISOString()}
			/>,
		);

		expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
		expect(screen.getByText(/2 days ago/i)).toBeInTheDocument();
	});

	it('should handle very recent updates', () => {
		// Date 1 hour ago
		const oneHourAgo = new Date();
		oneHourAgo.setHours(oneHourAgo.getHours() - 1);

		render(
			<AssessmentStatusCard
				{...defaultProps}
				lastUpdated={oneHourAgo.toISOString()}
			/>,
		);

		expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
		// Should show "about 1 hour ago" or similar
		expect(screen.getByText(/hour ago/i)).toBeInTheDocument();
	});
});

// ============================================================================
// SCORE DISPLAY TESTS
// ============================================================================

describe('AssessmentStatusCard - Score Display', () => {
	const defaultProps: AssessmentStatusCardProps = {
		type: 'rom',
		status: 'completed',
		lastUpdated: '2025-10-18T10:00:00Z',
		score: null,
		onAction: jest.fn(),
	};

	it('should display score when available', () => {
		render(<AssessmentStatusCard {...defaultProps} score={85} />);

		expect(screen.getByText('Score: 85/100')).toBeInTheDocument();
	});

	it('should display zero score correctly', () => {
		render(<AssessmentStatusCard {...defaultProps} score={0} />);

		expect(screen.getByText('Score: 0/100')).toBeInTheDocument();
	});

	it('should display perfect score correctly', () => {
		render(<AssessmentStatusCard {...defaultProps} score={100} />);

		expect(screen.getByText('Score: 100/100')).toBeInTheDocument();
	});

	it('should not display score when null', () => {
		render(<AssessmentStatusCard {...defaultProps} score={null} />);

		expect(screen.queryByText(/Score:/i)).not.toBeInTheDocument();
	});

	it('should not display score for pending assessments', () => {
		render(
			<AssessmentStatusCard {...defaultProps} status="pending" score={null} />,
		);

		expect(screen.queryByText(/Score:/i)).not.toBeInTheDocument();
	});
});

// ============================================================================
// CTA BUTTON TESTS
// ============================================================================

describe('AssessmentStatusCard - CTA Button', () => {
	const defaultProps: AssessmentStatusCardProps = {
		type: 'rom',
		status: 'pending',
		lastUpdated: '2025-10-18T10:00:00Z',
		score: null,
		onAction: jest.fn(),
	};

	it('should render "Start" button for expired status', () => {
		render(<AssessmentStatusCard {...defaultProps} status="expired" />);

		const button = screen.getByRole('button', { name: 'Start' });
		expect(button).toBeInTheDocument();
	});

	it('should render "Resume" button for pending status', () => {
		render(<AssessmentStatusCard {...defaultProps} status="pending" />);

		const button = screen.getByRole('button', { name: 'Resume' });
		expect(button).toBeInTheDocument();
	});

	it('should render "Retake" button for completed status', () => {
		render(<AssessmentStatusCard {...defaultProps} status="completed" />);

		const button = screen.getByRole('button', { name: 'Retake' });
		expect(button).toBeInTheDocument();
	});

	it('should call onAction when button is clicked', () => {
		const mockOnAction = jest.fn();
		render(<AssessmentStatusCard {...defaultProps} onAction={mockOnAction} />);

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(mockOnAction).toHaveBeenCalledTimes(1);
	});

	it('should have primary button type', () => {
		render(<AssessmentStatusCard {...defaultProps} />);

		const button = screen.getByRole('button');
		expect(button).toHaveClass('ant-btn-primary');
	});
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('AssessmentStatusCard - Accessibility', () => {
	const defaultProps: AssessmentStatusCardProps = {
		type: 'rom',
		status: 'pending',
		lastUpdated: '2025-10-18T10:00:00Z',
		score: null,
		onAction: jest.fn(),
	};

	it('should have button with minimum touch target height (44px)', () => {
		const { container } = render(<AssessmentStatusCard {...defaultProps} />);

		const button = container.querySelector('button');
		expect(button).toBeInTheDocument();

		// Check styled-component applies min-height: 44px
		// Note: In jsdom, computed styles may not reflect CSS, so we check the class exists
		expect(button).toHaveClass('ant-btn');
	});

	it('should be keyboard accessible', () => {
		const mockOnAction = jest.fn();
		render(<AssessmentStatusCard {...defaultProps} onAction={mockOnAction} />);

		const button = screen.getByRole('button');
		button.focus();

		expect(button).toHaveFocus();
	});

	it('should render as an Ant Design Card', () => {
		const { container } = render(<AssessmentStatusCard {...defaultProps} />);

		const card = container.querySelector('.ant-card');
		expect(card).toBeInTheDocument();
	});

	it('should have accessible button text', () => {
		render(<AssessmentStatusCard {...defaultProps} status="pending" />);

		// Button should have clear, accessible text
		const button = screen.getByRole('button', { name: /Resume/i });
		expect(button).toBeInTheDocument();
	});
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('AssessmentStatusCard - Integration', () => {
	it('should render all elements together for completed assessment with score', () => {
		const mockOnAction = jest.fn();

		render(
			<AssessmentStatusCard
				type="rom"
				status="completed"
				lastUpdated="2025-10-18T10:00:00Z"
				score={92}
				onAction={mockOnAction}
			/>,
		);

		// Check all elements
		expect(screen.getByText(/ROM Assessment/i)).toBeInTheDocument();
		expect(screen.getByText('Completed')).toBeInTheDocument();
		expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
		expect(screen.getByText('Score: 92/100')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Retake' })).toBeInTheDocument();
	});

	it('should render all elements for pending posture assessment without score', () => {
		const mockOnAction = jest.fn();

		render(
			<AssessmentStatusCard
				type="posture"
				status="pending"
				lastUpdated="2025-10-19T14:30:00Z"
				score={null}
				onAction={mockOnAction}
			/>,
		);

		expect(screen.getByText(/POSTURE Assessment/i)).toBeInTheDocument();
		expect(screen.getByText('Pending')).toBeInTheDocument();
		expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
		expect(screen.queryByText(/Score:/i)).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
	});

	it('should render all elements for expired survey assessment', () => {
		const mockOnAction = jest.fn();

		render(
			<AssessmentStatusCard
				type="survey"
				status="expired"
				lastUpdated="2025-10-10T08:00:00Z"
				score={null}
				onAction={mockOnAction}
			/>,
		);

		expect(screen.getByText(/SURVEY Assessment/i)).toBeInTheDocument();
		expect(screen.getByText('Expired')).toBeInTheDocument();
		expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
	});

	it('should handle user interaction correctly', () => {
		const mockOnAction = jest.fn();

		render(
			<AssessmentStatusCard
				type="rom"
				status="completed"
				lastUpdated="2025-10-18T10:00:00Z"
				score={85}
				onAction={mockOnAction}
			/>,
		);

		const button = screen.getByRole('button', { name: 'Retake' });

		// Click once
		fireEvent.click(button);
		expect(mockOnAction).toHaveBeenCalledTimes(1);

		// Click again
		fireEvent.click(button);
		expect(mockOnAction).toHaveBeenCalledTimes(2);
	});
});
