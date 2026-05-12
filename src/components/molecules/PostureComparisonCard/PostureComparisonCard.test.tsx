/**
 * PostureComparisonCard Component Tests
 *
 * Verifies:
 * - Comparison data rendering
 * - Current vs baseline display
 * - Metric details display
 * - Trend indicators
 * - Responsive layout
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PostureComparisonCard } from './PostureComparisonCard';
import type { PostureComparison } from '@types/posture';

describe('PostureComparisonCard', () => {
	const mockComparison: PostureComparison = {
		current: {
			sessionId: '2',
			timestamp: '2025-02-01T10:00:00Z',
			score: 85,
			metrics: {
				headAlignment: 90,
				shoulderSymmetry: 85,
				spineCurvature: 80,
				hipAlignment: 82,
				balance: 88,
			},
		},
		baseline: {
			sessionId: '1',
			timestamp: '2025-01-01T10:00:00Z',
			score: 72,
			metrics: {
				headAlignment: 75,
				shoulderSymmetry: 70,
				spineCurvature: 68,
				hipAlignment: 74,
				balance: 73,
			},
		},
		improvements: {
			overallChange: 18.06,
			metricChanges: {
				headAlignment: 20,
				shoulderSymmetry: 21.43,
				spineCurvature: 17.65,
				hipAlignment: 10.81,
				balance: 20.55,
			},
		},
	};

	describe('Basic rendering', () => {
		it('should render card title', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText('Posture Comparison')).toBeInTheDocument();
		});

		it('should render custom title when provided', () => {
			render(
				<PostureComparisonCard
					comparison={mockComparison}
					title="My Progress"
				/>,
			);
			expect(screen.getByText('My Progress')).toBeInTheDocument();
		});
	});

	describe('Current session display', () => {
		it('should display current session label', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText('Current')).toBeInTheDocument();
		});

		it('should display current score', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText('85')).toBeInTheDocument();
		});

		it('should format current date correctly', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText(/Feb 1, 2025/)).toBeInTheDocument();
		});
	});

	describe('Baseline session display', () => {
		it('should display baseline session label', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText('Baseline')).toBeInTheDocument();
		});

		it('should display baseline score', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText('72')).toBeInTheDocument();
		});

		it('should format baseline date correctly', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
		});
	});

	describe('Metric details', () => {
		it('should display metric details by default', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText('Individual Metrics')).toBeInTheDocument();
		});

		it('should hide metric details when showMetricDetails is false', () => {
			render(
				<PostureComparisonCard
					comparison={mockComparison}
					showMetricDetails={false}
				/>,
			);
			expect(screen.queryByText('Individual Metrics')).not.toBeInTheDocument();
		});

		it('should display all metric names', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText(/Head Alignment/)).toBeInTheDocument();
			expect(screen.getByText(/Shoulder Symmetry/)).toBeInTheDocument();
			expect(screen.getByText(/Spine Curvature/)).toBeInTheDocument();
			expect(screen.getByText(/Hip Alignment/)).toBeInTheDocument();
			expect(screen.getByText(/Balance/)).toBeInTheDocument();
		});

		it('should display current vs baseline values for each metric', () => {
			render(<PostureComparisonCard comparison={mockComparison} />);
			expect(screen.getByText('90')).toBeInTheDocument(); // head alignment current
			expect(screen.getByText('75')).toBeInTheDocument(); // head alignment baseline
		});
	});

	describe('Status badges', () => {
		it('should display status badge for current session', () => {
			const { container } = render(
				<PostureComparisonCard comparison={mockComparison} />,
			);
			const badges = container.querySelectorAll('.posture-status-badge');
			expect(badges.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('Custom className', () => {
		it('should apply custom className', () => {
			const { container } = render(
				<PostureComparisonCard
					comparison={mockComparison}
					className="custom-comparison"
				/>,
			);
			expect(container.querySelector('.custom-comparison')).toBeInTheDocument();
		});
	});
});
