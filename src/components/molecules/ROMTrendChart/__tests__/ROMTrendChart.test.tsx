/**
 * ROMTrendChart Unit Tests
 *
 * Test suite for the ROMTrendChart molecule component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ROMTrendChart } from '../ROMTrendChart';
import { ROMDataPoint } from '../types';

/**
 * Mock Recharts to avoid canvas rendering issues in tests
 */
jest.mock('recharts', () => {
	const OriginalModule = jest.requireActual('recharts');
	return {
		...OriginalModule,
		ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="responsive-container">{children}</div>
		),
		LineChart: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="line-chart">{children}</div>
		),
		Line: () => <div data-testid="line" />,
		XAxis: () => <div data-testid="x-axis" />,
		YAxis: () => <div data-testid="y-axis" />,
		CartesianGrid: () => <div data-testid="cartesian-grid" />,
		Tooltip: () => <div data-testid="tooltip" />,
	};
});

describe('ROMTrendChart', () => {
	/**
	 * Sample test data
	 */
	const mockData: ROMDataPoint[] = [
		{ date: '2025-10-01T00:00:00.000Z', score: 75 },
		{ date: '2025-10-08T00:00:00.000Z', score: 80 },
		{ date: '2025-10-15T00:00:00.000Z', score: 85 },
		{ date: '2025-10-21T00:00:00.000Z', score: 88 },
	];

	/**
	 * Rendering Tests
	 */
	describe('Rendering', () => {
		it('should render chart with data', () => {
			render(<ROMTrendChart data={mockData} />);

			expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
			expect(screen.getByTestId('line')).toBeInTheDocument();
			expect(screen.getByTestId('x-axis')).toBeInTheDocument();
			expect(screen.getByTestId('y-axis')).toBeInTheDocument();
		});

		it('should apply custom className', () => {
			const { container } = render(
				<ROMTrendChart data={mockData} className="custom-class" />
			);

			const chartElement = container.querySelector('.rom-trend-chart');
			expect(chartElement).toHaveClass('custom-class');
		});

		it('should apply custom height', () => {
			render(<ROMTrendChart data={mockData} height={500} />);

			// Chart should render with custom height
			expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
		});
	});

	/**
	 * Loading State Tests
	 */
	describe('Loading State', () => {
		it('should render loading spinner when loading is true', () => {
			render(<ROMTrendChart data={[]} loading={true} />);

			expect(screen.getByText('Loading chart...')).toBeInTheDocument();
			expect(
				screen.queryByTestId('responsive-container')
			).not.toBeInTheDocument();
		});

		it('should apply loading className', () => {
			const { container } = render(
				<ROMTrendChart data={[]} loading={true} />
			);

			expect(
				container.querySelector('.rom-trend-chart-loading')
			).toBeInTheDocument();
		});
	});

	/**
	 * Empty State Tests
	 */
	describe('Empty State', () => {
		it('should render empty state when data is empty array', () => {
			render(<ROMTrendChart data={[]} />);

			expect(
				screen.getByText('No ROM data available yet')
			).toBeInTheDocument();
			expect(
				screen.queryByTestId('responsive-container')
			).not.toBeInTheDocument();
		});

		it('should render empty state when data is null', () => {
			render(<ROMTrendChart data={null as unknown as ROMDataPoint[]} />);

			expect(
				screen.getByText('No ROM data available yet')
			).toBeInTheDocument();
		});

		it('should apply empty state className', () => {
			const { container } = render(<ROMTrendChart data={[]} />);

			expect(
				container.querySelector('.rom-trend-chart-empty')
			).toBeInTheDocument();
		});
	});

	/**
	 * Data Handling Tests
	 */
	describe('Data Handling', () => {
		it('should handle single data point', () => {
			const singlePoint: ROMDataPoint[] = [
				{ date: '2025-10-21T00:00:00.000Z', score: 75 },
			];

			render(<ROMTrendChart data={singlePoint} />);

			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
		});

		it('should handle many data points', () => {
			const manyPoints: ROMDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
				date: new Date(
					Date.now() - i * 24 * 60 * 60 * 1000
				).toISOString(),
				score: 50 + i,
			}));

			render(<ROMTrendChart data={manyPoints} />);

			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
		});

		it('should handle edge case scores (0 and 100)', () => {
			const edgeCaseData: ROMDataPoint[] = [
				{ date: '2025-10-01T00:00:00.000Z', score: 0 },
				{ date: '2025-10-15T00:00:00.000Z', score: 50 },
				{ date: '2025-10-21T00:00:00.000Z', score: 100 },
			];

			render(<ROMTrendChart data={edgeCaseData} />);

			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
		});
	});

	/**
	 * Props Tests
	 */
	describe('Props', () => {
		it('should use default height when not provided', () => {
			render(<ROMTrendChart data={mockData} />);

			// Should render without errors with default height
			expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
		});

		it('should use default loading state (false)', () => {
			render(<ROMTrendChart data={mockData} />);

			// Should render chart, not loading state
			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
			expect(
				screen.queryByText('Loading chart...')
			).not.toBeInTheDocument();
		});

		it('should handle missing className gracefully', () => {
			const { container } = render(<ROMTrendChart data={mockData} />);

			const chartElement = container.querySelector('.rom-trend-chart');
			expect(chartElement).toBeInTheDocument();
		});
	});

	/**
	 * Accessibility Tests
	 */
	describe('Accessibility', () => {
		it('should have proper displayName', () => {
			expect(ROMTrendChart.displayName).toBe('ROMTrendChart');
		});

		it('should render with semantic structure', () => {
			const { container } = render(<ROMTrendChart data={mockData} />);

			// Should have container div
			expect(
				container.querySelector('.rom-trend-chart')
			).toBeInTheDocument();
		});

		it('should provide empty state message for screen readers', () => {
			render(<ROMTrendChart data={[]} />);

			expect(
				screen.getByText('No ROM data available yet')
			).toBeInTheDocument();
		});
	});

	/**
	 * Integration Tests
	 */
	describe('Integration', () => {
		it('should transition from loading to data state', () => {
			const { rerender } = render(
				<ROMTrendChart data={[]} loading={true} />
			);

			expect(screen.getByText('Loading chart...')).toBeInTheDocument();

			rerender(<ROMTrendChart data={mockData} loading={false} />);

			expect(
				screen.queryByText('Loading chart...')
			).not.toBeInTheDocument();
			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
		});

		it('should transition from empty to data state', () => {
			const { rerender } = render(<ROMTrendChart data={[]} />);

			expect(
				screen.getByText('No ROM data available yet')
			).toBeInTheDocument();

			rerender(<ROMTrendChart data={mockData} />);

			expect(
				screen.queryByText('No ROM data available yet')
			).not.toBeInTheDocument();
			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
		});

		it('should update when data changes', () => {
			const { rerender } = render(<ROMTrendChart data={mockData} />);

			expect(screen.getByTestId('line-chart')).toBeInTheDocument();

			const newData: ROMDataPoint[] = [
				{ date: '2025-11-01T00:00:00.000Z', score: 90 },
			];

			rerender(<ROMTrendChart data={newData} />);

			expect(screen.getByTestId('line-chart')).toBeInTheDocument();
		});
	});
});
