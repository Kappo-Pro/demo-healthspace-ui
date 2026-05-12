/**
 * ProgressMilestone Component Tests
 *
 * Verifies:
 * - Achievement status rendering (achieved/pending)
 * - Type-specific icon display
 * - Date formatting
 * - Metric improvement display
 * - Compact mode
 * - Accessibility attributes
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressMilestone } from './ProgressMilestone';
import type { PatientMilestone } from '@types/posture';

describe('ProgressMilestone', () => {
	const baseMilestone: PatientMilestone = {
		id: '1',
		title: 'First Assessment',
		description: 'Completed initial posture assessment',
		achievedAt: '2025-01-15T10:00:00Z',
		type: 'assessment',
	};

	describe('Basic rendering', () => {
		it('should render milestone title', () => {
			render(<ProgressMilestone milestone={baseMilestone} />);
			expect(screen.getByText('First Assessment')).toBeInTheDocument();
		});

		it('should render milestone description when provided', () => {
			render(<ProgressMilestone milestone={baseMilestone} />);
			expect(
				screen.getByText('Completed initial posture assessment'),
			).toBeInTheDocument();
		});

		it('should not render description when not provided', () => {
			const milestoneNoDesc = { ...baseMilestone, description: undefined };
			const { container } = render(
				<ProgressMilestone milestone={milestoneNoDesc} />,
			);
			expect(
				container.querySelector('.progress-milestone__description'),
			).not.toBeInTheDocument();
		});
	});

	describe('Achievement status', () => {
		it('should render achieved milestone with success icon', () => {
			const { container } = render(
				<ProgressMilestone milestone={baseMilestone} />,
			);
			expect(
				container.querySelector('.progress-milestone--achieved'),
			).toBeInTheDocument();
			expect(
				container.querySelector('.progress-milestone__status-icon--achieved'),
			).toBeInTheDocument();
		});

		it('should render pending milestone with clock icon', () => {
			const pendingMilestone = { ...baseMilestone, achievedAt: null };
			const { container } = render(
				<ProgressMilestone milestone={pendingMilestone} />,
			);
			expect(
				container.querySelector('.progress-milestone--pending'),
			).toBeInTheDocument();
			expect(
				container.querySelector('.progress-milestone__status-icon--pending'),
			).toBeInTheDocument();
		});

		it('should display achievement date for achieved milestones', () => {
			render(<ProgressMilestone milestone={baseMilestone} />);
			expect(screen.getByText(/Achieved:/)).toBeInTheDocument();
			expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
		});

		it('should not display achievement date for pending milestones', () => {
			const pendingMilestone = { ...baseMilestone, achievedAt: null };
			render(<ProgressMilestone milestone={pendingMilestone} />);
			expect(screen.queryByText(/Achieved:/)).not.toBeInTheDocument();
		});
	});

	describe('Milestone types', () => {
		const types: Array<PatientMilestone['type']> = [
			'assessment',
			'improvement',
			'goal',
			'treatment',
		];

		it.each(types)('should render %s type milestone', type => {
			const milestone = { ...baseMilestone, type };
			const { container } = render(<ProgressMilestone milestone={milestone} />);
			expect(
				container.querySelector('.progress-milestone__type-icon'),
			).toBeInTheDocument();
		});
	});

	describe('Metric improvement', () => {
		const milestoneWithMetric: PatientMilestone = {
			...baseMilestone,
			metricImprovement: {
				metric: 'Shoulder Symmetry',
				before: 60,
				after: 80,
			},
		};

		it('should display metric improvement when available', () => {
			render(
				<ProgressMilestone
					milestone={milestoneWithMetric}
					showMetricImprovement={true}
				/>,
			);
			expect(screen.getByText(/Shoulder Symmetry:/)).toBeInTheDocument();
			expect(screen.getByText(/60 → 80/)).toBeInTheDocument();
		});

		it('should calculate and display improvement percentage', () => {
			render(
				<ProgressMilestone
					milestone={milestoneWithMetric}
					showMetricImprovement={true}
				/>,
			);
			expect(screen.getByText(/\+33%/)).toBeInTheDocument();
		});

		it('should hide metric improvement when showMetricImprovement is false', () => {
			render(
				<ProgressMilestone
					milestone={milestoneWithMetric}
					showMetricImprovement={false}
				/>,
			);
			expect(screen.queryByText(/Shoulder Symmetry:/)).not.toBeInTheDocument();
		});

		it('should not display metric improvement when not available', () => {
			render(
				<ProgressMilestone
					milestone={baseMilestone}
					showMetricImprovement={true}
				/>,
			);
			const { container } = render(
				<ProgressMilestone milestone={baseMilestone} />,
			);
			expect(
				container.querySelector('.progress-milestone__metric-improvement'),
			).not.toBeInTheDocument();
		});

		it('should show positive change with + prefix', () => {
			render(<ProgressMilestone milestone={milestoneWithMetric} />);
			const changeElement = screen.getByText(/\+33%/);
			expect(changeElement).toHaveClass('positive');
		});

		it('should show negative change without + prefix', () => {
			const negativeMetric = {
				...baseMilestone,
				metricImprovement: {
					metric: 'Test',
					before: 80,
					after: 60,
				},
			};
			render(<ProgressMilestone milestone={negativeMetric} />);
			const changeElement = screen.getByText(/-25%/);
			expect(changeElement).toHaveClass('negative');
		});
	});

	describe('Compact mode', () => {
		it('should apply compact class when compact prop is true', () => {
			const { container } = render(
				<ProgressMilestone milestone={baseMilestone} compact={true} />,
			);
			expect(
				container.querySelector('.progress-milestone--compact'),
			).toBeInTheDocument();
		});

		it('should not apply compact class by default', () => {
			const { container } = render(
				<ProgressMilestone milestone={baseMilestone} />,
			);
			expect(
				container.querySelector('.progress-milestone--compact'),
			).not.toBeInTheDocument();
		});
	});

	describe('Custom className', () => {
		it('should apply custom className', () => {
			const { container } = render(
				<ProgressMilestone
					milestone={baseMilestone}
					className="custom-milestone"
				/>,
			);
			expect(container.querySelector('.custom-milestone')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have listitem role', () => {
			const { container } = render(
				<ProgressMilestone milestone={baseMilestone} />,
			);
			const milestone = container.querySelector('[role="listitem"]');
			expect(milestone).toBeInTheDocument();
		});

		it('should have descriptive aria-label for achieved milestone', () => {
			const { container } = render(
				<ProgressMilestone milestone={baseMilestone} />,
			);
			const milestone = container.querySelector('[role="listitem"]');
			expect(milestone).toHaveAttribute(
				'aria-label',
				'First Assessment - Achieved',
			);
		});

		it('should have descriptive aria-label for pending milestone', () => {
			const pendingMilestone = { ...baseMilestone, achievedAt: null };
			const { container } = render(
				<ProgressMilestone milestone={pendingMilestone} />,
			);
			const milestone = container.querySelector('[role="listitem"]');
			expect(milestone).toHaveAttribute(
				'aria-label',
				'First Assessment - Pending',
			);
		});
	});
});
