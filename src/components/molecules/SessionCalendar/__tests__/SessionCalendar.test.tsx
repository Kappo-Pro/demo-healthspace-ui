/**
 * SessionCalendar Component Tests
 * EPIC-022-S1: Session Calendar Molecule
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SessionCalendar } from '../SessionCalendar';
import { SessionData } from '../types';

// Sample test data
const sampleData: SessionData[] = [
	{ date: '2025-10-01', count: 2 },
	{ date: '2025-10-05', count: 1 },
	{ date: '2025-10-10', count: 4 },
	{ date: '2025-10-15', count: 3 },
	{ date: '2025-10-20', count: 5 },
];

describe('SessionCalendar', () => {
	describe('Rendering Tests', () => {
		it('renders calendar grid with data', () => {
			const { container } = render(<SessionCalendar data={sampleData} />);

			const svg = container.querySelector('.session-calendar-svg');
			expect(svg).toBeInTheDocument();

			// Check for legend
			expect(screen.getByText('Less')).toBeInTheDocument();
			expect(screen.getByText('More')).toBeInTheDocument();
		});

		it('applies custom className', () => {
			const { container } = render(
				<SessionCalendar data={sampleData} className="custom-class" />
			);

			const calendar = container.querySelector('.session-calendar');
			expect(calendar).toHaveClass('custom-class');
		});

		it('renders calendar cells for 90 days', () => {
			const { container } = render(<SessionCalendar data={sampleData} />);

			// 90 days should create approximately 90 cells
			const cells = container.querySelectorAll('.session-calendar-cell');
			expect(cells.length).toBeGreaterThanOrEqual(90);
		});
	});

	describe('Loading State Tests', () => {
		it('displays loading spinner when loading is true', () => {
			render(<SessionCalendar data={sampleData} loading={true} />);

			expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
		});

		it('applies loading className', () => {
			const { container } = render(
				<SessionCalendar
					data={sampleData}
					loading={true}
					className="custom-class"
				/>
			);

			const loadingDiv = container.querySelector('.session-calendar-loading');
			expect(loadingDiv).toBeInTheDocument();
			expect(loadingDiv).toHaveClass('custom-class');
		});

		it('does not render calendar when loading', () => {
			const { container } = render(
				<SessionCalendar data={sampleData} loading={true} />
			);

			const svg = container.querySelector('.session-calendar-svg');
			expect(svg).not.toBeInTheDocument();
		});
	});

	describe('Empty State Tests', () => {
		it('displays empty state for empty array', () => {
			render(<SessionCalendar data={[]} />);

			expect(
				screen.getByText('No session data available yet')
			).toBeInTheDocument();
		});

		it('displays empty state for null data', () => {
			render(<SessionCalendar data={null as unknown as SessionData[]} />);

			expect(
				screen.getByText('No session data available yet')
			).toBeInTheDocument();
		});

		it('applies empty className', () => {
			const { container } = render(
				<SessionCalendar data={[]} className="custom-class" />
			);

			const emptyDiv = container.querySelector('.session-calendar-empty');
			expect(emptyDiv).toBeInTheDocument();
			expect(emptyDiv).toHaveClass('custom-class');
		});
	});

	describe('Data Handling Tests', () => {
		it('handles single data point', () => {
			const singlePoint: SessionData[] = [{ date: '2025-10-15', count: 3 }];
			const { container } = render(<SessionCalendar data={singlePoint} />);

			const cells = container.querySelectorAll('.session-calendar-cell');
			expect(cells.length).toBeGreaterThanOrEqual(90);
		});

		it('handles many data points', () => {
			// Generate 50 data points
			const manyPoints: SessionData[] = Array.from({ length: 50 }, (_, i) => ({
				date: `2025-${String(9 + Math.floor(i / 30)).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
				count: (i % 6) + 1,
			}));

			const { container } = render(<SessionCalendar data={manyPoints} />);

			const svg = container.querySelector('.session-calendar-svg');
			expect(svg).toBeInTheDocument();
		});

		it('handles edge case session counts', () => {
			const edgeCases: SessionData[] = [
				{ date: '2025-10-01', count: 0 },
				{ date: '2025-10-05', count: 5 },
				{ date: '2025-10-10', count: 10 }, // Should render same as 5+
			];

			const { container } = render(<SessionCalendar data={edgeCases} />);

			const svg = container.querySelector('.session-calendar-svg');
			expect(svg).toBeInTheDocument();
		});
	});

	describe('Props Tests', () => {
		it('uses default loading state (false)', () => {
			const { container } = render(<SessionCalendar data={sampleData} />);

			const svg = container.querySelector('.session-calendar-svg');
			expect(svg).toBeInTheDocument();
		});

		it('handles missing className', () => {
			const { container } = render(<SessionCalendar data={sampleData} />);

			const calendar = container.querySelector('.session-calendar');
			expect(calendar).toBeInTheDocument();
		});
	});

	describe('Accessibility Tests', () => {
		it('has displayName set', () => {
			expect(SessionCalendar.displayName).toBe('SessionCalendar');
		});

		it('has semantic aria-label on SVG', () => {
			const { container } = render(<SessionCalendar data={sampleData} />);

			const svg = container.querySelector('svg[role="img"]');
			expect(svg).toHaveAttribute(
				'aria-label',
				'Session activity calendar heatmap'
			);
		});

		it('includes data-testid attributes on cells', () => {
			const { container } = render(<SessionCalendar data={sampleData} />);

			const cells = container.querySelectorAll('[data-testid^="calendar-cell-"]');
			expect(cells.length).toBeGreaterThan(0);
		});
	});

	describe('Color Intensity Tests', () => {
		it('applies correct colors based on session count', () => {
			const colorTestData: SessionData[] = [
				{ date: '2025-10-01', count: 0 },
				{ date: '2025-10-02', count: 1 },
				{ date: '2025-10-03', count: 2 },
				{ date: '2025-10-04', count: 3 },
				{ date: '2025-10-05', count: 4 },
				{ date: '2025-10-06', count: 5 },
			];

			const { container } = render(<SessionCalendar data={colorTestData} />);

			// Check that cells have data-count attributes
			const cell0 = container.querySelector('[data-count="0"]');
			const cell5 = container.querySelector('[data-count="5"]');

			expect(cell0).toBeInTheDocument();
			expect(cell5).toBeInTheDocument();
		});
	});

	describe('Integration Tests', () => {
		it('transitions from loading to data state', () => {
			const { container, rerender } = render(
				<SessionCalendar data={sampleData} loading={true} />
			);

			expect(screen.getByText('Loading calendar...')).toBeInTheDocument();

			rerender(<SessionCalendar data={sampleData} loading={false} />);

			const svg = container.querySelector('.session-calendar-svg');
			expect(svg).toBeInTheDocument();
		});

		it('transitions from empty to data state', () => {
			const { container, rerender } = render(<SessionCalendar data={[]} />);

			expect(
				screen.getByText('No session data available yet')
			).toBeInTheDocument();

			rerender(<SessionCalendar data={sampleData} />);

			const svg = container.querySelector('.session-calendar-svg');
			expect(svg).toBeInTheDocument();
		});

		it('updates when data changes', () => {
			const initialData: SessionData[] = [{ date: '2025-10-01', count: 2 }];
			const updatedData: SessionData[] = [{ date: '2025-10-15', count: 5 }];

			const { container, rerender } = render(
				<SessionCalendar data={initialData} />
			);

			let cells = container.querySelectorAll('[data-count="2"]');
			expect(cells.length).toBeGreaterThan(0);

			rerender(<SessionCalendar data={updatedData} />);

			cells = container.querySelectorAll('[data-count="5"]');
			expect(cells.length).toBeGreaterThan(0);
		});
	});

	describe('Legend Tests', () => {
		it('renders legend with correct labels', () => {
			render(<SessionCalendar data={sampleData} />);

			expect(screen.getByText('Less')).toBeInTheDocument();
			expect(screen.getByText('More')).toBeInTheDocument();
		});

		it('renders 6 legend cells (0-5)', () => {
			const { container } = render(<SessionCalendar data={sampleData} />);

			const legendCells = container.querySelectorAll('.legend-cell');
			expect(legendCells.length).toBe(6);
		});
	});
});
