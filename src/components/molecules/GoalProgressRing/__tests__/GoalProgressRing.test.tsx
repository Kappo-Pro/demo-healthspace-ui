/**
 * GoalProgressRing Unit Tests
 *
 * Test suite for the GoalProgressRing molecule component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GoalProgressRing } from '../GoalProgressRing';

/**
 * Mock Ant Design Spin component
 */
jest.mock('antd', () => ({
	Spin: ({ size }: { size: string }) => (
		<div data-testid="spin" data-size={size}>
			Loading...
		</div>
	),
}));

describe('GoalProgressRing', () => {
	/**
	 * Rendering Tests
	 */
	describe('Rendering', () => {
		it('should render with required props', () => {
			render(<GoalProgressRing title="Balance" progress={75} />);

			expect(screen.getByRole('img')).toBeInTheDocument();
			expect(screen.getByText('Balance')).toBeInTheDocument();
		});

		it('should apply custom className', () => {
			const { container } = render(
				<GoalProgressRing
					title="Balance"
					progress={75}
					className="custom-class"
				/>
			);

			const ringElement = container.querySelector('.goal-progress-ring');
			expect(ringElement).toHaveClass('custom-class');
		});

		it('should apply custom size', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} size={200} />
			);

			const ringElement = container.querySelector('.goal-progress-ring');
			expect(ringElement).toHaveStyle({ width: '200px', height: '200px' });
		});

		it('should use default size when not provided', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} />
			);

			const ringElement = container.querySelector('.goal-progress-ring');
			expect(ringElement).toHaveStyle({ width: '120px', height: '120px' });
		});
	});

	/**
	 * Loading State Tests
	 */
	describe('Loading State', () => {
		it('should render loading spinner when loading is true', () => {
			render(<GoalProgressRing title="Balance" progress={75} loading={true} />);

			expect(screen.getByTestId('spin')).toBeInTheDocument();
			expect(screen.queryByText('Balance')).not.toBeInTheDocument();
		});

		it('should apply loading className', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} loading={true} />
			);

			expect(
				container.querySelector('.goal-progress-ring-loading')
			).toBeInTheDocument();
		});

		it('should have proper aria-label in loading state', () => {
			render(<GoalProgressRing title="Balance" progress={75} loading={true} />);

			const loadingElement = screen.getByRole('status');
			expect(loadingElement).toHaveAttribute(
				'aria-label',
				'Loading Balance progress'
			);
		});

		it('should use custom aria-label in loading state', () => {
			render(
				<GoalProgressRing
					title="Balance"
					progress={75}
					loading={true}
					ariaLabel="Custom loading label"
				/>
			);

			const loadingElement = screen.getByRole('status');
			expect(loadingElement).toHaveAttribute(
				'aria-label',
				'Custom loading label'
			);
		});
	});

	/**
	 * Progress Tests
	 */
	describe('Progress', () => {
		it('should display correct percentage', async () => {
			render(<GoalProgressRing title="Balance" progress={75} />);

			// Wait for animation to complete
			await waitFor(
				() => {
					expect(screen.getByText('75%')).toBeInTheDocument();
				},
				{ timeout: 200 }
			);
		});

		it('should clamp progress to 0-100 range (over 100)', async () => {
			render(<GoalProgressRing title="Balance" progress={150} />);

			await waitFor(
				() => {
					expect(screen.getByText('100%')).toBeInTheDocument();
				},
				{ timeout: 200 }
			);
		});

		it('should clamp progress to 0-100 range (under 0)', async () => {
			render(<GoalProgressRing title="Balance" progress={-50} />);

			await waitFor(
				() => {
					expect(screen.getByText('0%')).toBeInTheDocument();
				},
				{ timeout: 200 }
			);
		});

		it('should handle 0% progress', async () => {
			render(<GoalProgressRing title="Balance" progress={0} />);

			await waitFor(
				() => {
					expect(screen.getByText('0%')).toBeInTheDocument();
				},
				{ timeout: 200 }
			);
		});

		it('should handle 100% progress', async () => {
			render(<GoalProgressRing title="Balance" progress={100} />);

			await waitFor(
				() => {
					expect(screen.getByText('100%')).toBeInTheDocument();
				},
				{ timeout: 200 }
			);
		});

		it('should round decimal progress values', async () => {
			render(<GoalProgressRing title="Balance" progress={75.7} />);

			await waitFor(
				() => {
					expect(screen.getByText('76%')).toBeInTheDocument();
				},
				{ timeout: 200 }
			);
		});
	});

	/**
	 * Color Threshold Tests
	 */
	describe('Color Thresholds', () => {
		it('should apply warning color for progress < 50%', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={30} />
			);

			const circle = container.querySelector('.progress-ring-circle-warning');
			expect(circle).toBeInTheDocument();
		});

		it('should apply primary color for progress 50-74%', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={60} />
			);

			const circle = container.querySelector('.progress-ring-circle-primary');
			expect(circle).toBeInTheDocument();
		});

		it('should apply success color for progress >= 75%', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={85} />
			);

			const circle = container.querySelector('.progress-ring-circle-success');
			expect(circle).toBeInTheDocument();
		});

		it('should apply warning color at exactly 49%', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={49} />
			);

			const circle = container.querySelector('.progress-ring-circle-warning');
			expect(circle).toBeInTheDocument();
		});

		it('should apply primary color at exactly 50%', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={50} />
			);

			const circle = container.querySelector('.progress-ring-circle-primary');
			expect(circle).toBeInTheDocument();
		});

		it('should apply success color at exactly 75%', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} />
			);

			const circle = container.querySelector('.progress-ring-circle-success');
			expect(circle).toBeInTheDocument();
		});
	});

	/**
	 * SVG Structure Tests
	 */
	describe('SVG Structure', () => {
		it('should render background circle', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} />
			);

			const backgroundCircle = container.querySelector(
				'.progress-ring-background'
			);
			expect(backgroundCircle).toBeInTheDocument();
		});

		it('should render progress circle', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} />
			);

			const progressCircle = container.querySelector('.progress-ring-circle');
			expect(progressCircle).toBeInTheDocument();
		});

		it('should have proper SVG dimensions', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} size={150} />
			);

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('width', '150');
			expect(svg).toHaveAttribute('height', '150');
		});

		it('should hide SVG from screen readers', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} />
			);

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('aria-hidden', 'true');
		});
	});

	/**
	 * Content Tests
	 */
	describe('Content', () => {
		it('should display title', () => {
			render(<GoalProgressRing title="Balance Training" progress={75} />);

			expect(screen.getByText('Balance Training')).toBeInTheDocument();
		});

		it('should display percentage with % symbol', async () => {
			render(<GoalProgressRing title="Balance" progress={75} />);

			await waitFor(
				() => {
					expect(screen.getByText('75%')).toBeInTheDocument();
				},
				{ timeout: 200 }
			);
		});

		it('should have progress content container', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} />
			);

			const content = container.querySelector('.progress-content');
			expect(content).toBeInTheDocument();
		});
	});

	/**
	 * Accessibility Tests
	 */
	describe('Accessibility', () => {
		it('should have displayName', () => {
			expect(GoalProgressRing.displayName).toBe('GoalProgressRing');
		});

		it('should have role="img" on container', () => {
			render(<GoalProgressRing title="Balance" progress={75} />);

			const container = screen.getByRole('img');
			expect(container).toBeInTheDocument();
		});

		it('should have default aria-label', () => {
			render(<GoalProgressRing title="Balance" progress={75} />);

			const container = screen.getByRole('img');
			expect(container).toHaveAttribute(
				'aria-label',
				'Balance goal progress: 75%'
			);
		});

		it('should use custom aria-label when provided', () => {
			render(
				<GoalProgressRing
					title="Balance"
					progress={75}
					ariaLabel="Custom progress label"
				/>
			);

			const container = screen.getByRole('img');
			expect(container).toHaveAttribute('aria-label', 'Custom progress label');
		});

		it('should update aria-label when progress changes', async () => {
			const { rerender } = render(
				<GoalProgressRing title="Balance" progress={50} />
			);

			await waitFor(() => {
				const container = screen.getByRole('img');
				expect(container).toHaveAttribute(
					'aria-label',
					'Balance goal progress: 50%'
				);
			});

			rerender(<GoalProgressRing title="Balance" progress={80} />);

			await waitFor(() => {
				const container = screen.getByRole('img');
				expect(container).toHaveAttribute(
					'aria-label',
					'Balance goal progress: 80%'
				);
			});
		});
	});

	/**
	 * Integration Tests
	 */
	describe('Integration', () => {
		it('should transition from loading to data state', async () => {
			const { rerender } = render(
				<GoalProgressRing title="Balance" progress={75} loading={true} />
			);

			expect(screen.getByTestId('spin')).toBeInTheDocument();

			rerender(<GoalProgressRing title="Balance" progress={75} loading={false} />);

			expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
			await waitFor(() => {
				expect(screen.getByText('75%')).toBeInTheDocument();
			});
		});

		it('should update when progress changes', async () => {
			const { rerender } = render(
				<GoalProgressRing title="Balance" progress={50} />
			);

			await waitFor(() => {
				expect(screen.getByText('50%')).toBeInTheDocument();
			});

			rerender(<GoalProgressRing title="Balance" progress={80} />);

			await waitFor(() => {
				expect(screen.getByText('80%')).toBeInTheDocument();
			});
		});

		it('should update color threshold when progress changes', async () => {
			const { container, rerender } = render(
				<GoalProgressRing title="Balance" progress={40} />
			);

			expect(
				container.querySelector('.progress-ring-circle-warning')
			).toBeInTheDocument();

			rerender(<GoalProgressRing title="Balance" progress={80} />);

			await waitFor(() => {
				expect(
					container.querySelector('.progress-ring-circle-success')
				).toBeInTheDocument();
			});
		});

		it('should maintain title when progress changes', async () => {
			const { rerender } = render(
				<GoalProgressRing title="Balance Training" progress={50} />
			);

			expect(screen.getByText('Balance Training')).toBeInTheDocument();

			rerender(<GoalProgressRing title="Balance Training" progress={80} />);

			expect(screen.getByText('Balance Training')).toBeInTheDocument();
		});
	});

	/**
	 * Props Tests
	 */
	describe('Props', () => {
		it('should use default loading state (false)', () => {
			render(<GoalProgressRing title="Balance" progress={75} />);

			expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
			expect(screen.getByText('Balance')).toBeInTheDocument();
		});

		it('should handle missing className gracefully', () => {
			const { container } = render(
				<GoalProgressRing title="Balance" progress={75} />
			);

			const ringElement = container.querySelector('.goal-progress-ring');
			expect(ringElement).toBeInTheDocument();
		});

		it('should handle missing ariaLabel gracefully', () => {
			render(<GoalProgressRing title="Balance" progress={75} />);

			const container = screen.getByRole('img');
			expect(container).toHaveAttribute('aria-label');
		});
	});
});
