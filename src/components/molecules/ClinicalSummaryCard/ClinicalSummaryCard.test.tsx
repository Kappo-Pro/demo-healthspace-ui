/**
 * ClinicalSummaryCard.test.tsx
 *
 * Unit tests for Clinical Summary Card molecule
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClinicalSummaryCard } from './ClinicalSummaryCard';
import type { ClinicalSummary } from '@types';

describe('ClinicalSummaryCard', () => {
	const mockSummary: ClinicalSummary = {
		topConcerns: [
			{
				id: '1',
				bodyArea: 'neck',
				measurement: '15° forward tilt',
				severity: 'moderate',
				priority: 'high',
				description: 'Forward head posture detected',
			},
			{
				id: '2',
				bodyArea: 'shoulders',
				measurement: '12° internal rotation',
				severity: 'mild',
				priority: 'medium',
				description: 'Rounded shoulders',
			},
			{
				id: '3',
				bodyArea: 'lower back',
				measurement: '8° anterior tilt',
				severity: 'moderate',
				priority: 'medium',
				description: 'Lower back curve irregularity',
			},
		],
		overallAssessment:
			'Moderate postural imbalances detected, primarily in the neck and upper back regions. These issues are common in individuals who spend prolonged time at a desk.',
		treatmentPlan:
			'Focus on strengthening neck and shoulder muscles while improving core stability. Exercises will target forward head posture and rounded shoulders.',
		progressIndicators: [
			'Improved neck mobility',
			'Reduced tension in shoulders',
			'Better posture awareness',
		],
		expectedImprovementTimeline: '4-6 weeks',
		generatedAt: '2025-10-24T10:00:00Z',
	};

	describe('Full variant', () => {
		it('should render title', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(screen.getByText('Your Clinical Summary')).toBeInTheDocument();
		});

		it('should render generation date', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			// Date should be formatted
			expect(screen.getByText(/Generated on/i)).toBeInTheDocument();
		});

		it('should render overall assessment', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(screen.getByText('Overall Assessment')).toBeInTheDocument();
			expect(
				screen.getByText(/moderate postural imbalances detected/i),
			).toBeInTheDocument();
		});

		it('should render top 3 concerns', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(screen.getByText('Top 3 Posture Concerns')).toBeInTheDocument();
			expect(screen.getByText('Neck')).toBeInTheDocument();
			expect(screen.getByText('Shoulders')).toBeInTheDocument();
			expect(screen.getByText('Lower back')).toBeInTheDocument();
		});

		it('should render concern measurements', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(screen.getByText('15° forward tilt')).toBeInTheDocument();
			expect(screen.getByText('12° internal rotation')).toBeInTheDocument();
			expect(screen.getByText('8° anterior tilt')).toBeInTheDocument();
		});

		it('should render priority tags', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(screen.getByText('high priority')).toBeInTheDocument();
			expect(screen.getAllByText('medium priority').length).toBe(2);
		});

		it('should render treatment plan', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(screen.getByText('Treatment Approach')).toBeInTheDocument();
			expect(
				screen.getByText(/focus on strengthening neck and shoulder muscles/i),
			).toBeInTheDocument();
		});

		it('should render progress indicators', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(screen.getByText('What to Watch For')).toBeInTheDocument();
			expect(screen.getByText('Improved neck mobility')).toBeInTheDocument();
			expect(
				screen.getByText('Reduced tension in shoulders'),
			).toBeInTheDocument();
			expect(screen.getByText('Better posture awareness')).toBeInTheDocument();
		});

		it('should render expected timeline', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(
				screen.getByText('Expected Improvement Timeline'),
			).toBeInTheDocument();
			expect(screen.getByText('4-6 weeks')).toBeInTheDocument();
			expect(screen.getByText(/with consistent practice/i)).toBeInTheDocument();
		});

		it('should render numbered concerns (1, 2, 3)', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			expect(screen.getByText('1.')).toBeInTheDocument();
			expect(screen.getByText('2.')).toBeInTheDocument();
			expect(screen.getByText('3.')).toBeInTheDocument();
		});
	});

	describe('Compact variant', () => {
		it('should render compact title', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="compact" />);

			expect(screen.getByText('Clinical Summary')).toBeInTheDocument();
		});

		it('should render top 3 concerns in compact format', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="compact" />);

			expect(screen.getByText(/1\. neck/i)).toBeInTheDocument();
			expect(screen.getByText(/2\. shoulders/i)).toBeInTheDocument();
			expect(screen.getByText(/3\. lower back/i)).toBeInTheDocument();
		});

		it('should render priority tags in compact format', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="compact" />);

			expect(screen.getByText('high')).toBeInTheDocument();
			expect(screen.getAllByText('medium').length).toBe(2);
		});

		it('should render expected improvement in compact format', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="compact" />);

			expect(
				screen.getByText(/expected improvement: 4-6 weeks/i),
			).toBeInTheDocument();
		});

		it('should not render full details in compact mode', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="compact" />);

			expect(screen.queryByText('Overall Assessment')).not.toBeInTheDocument();
			expect(screen.queryByText('Treatment Approach')).not.toBeInTheDocument();
			expect(screen.queryByText('What to Watch For')).not.toBeInTheDocument();
		});
	});

	describe('Edge cases', () => {
		it('should handle empty progress indicators', () => {
			const summaryNoIndicators: ClinicalSummary = {
				...mockSummary,
				progressIndicators: [],
			};

			render(
				<ClinicalSummaryCard summary={summaryNoIndicators} variant="full" />,
			);

			expect(screen.queryByText('What to Watch For')).not.toBeInTheDocument();
		});

		it('should limit to top 3 concerns', () => {
			const summaryManyConcerns: ClinicalSummary = {
				...mockSummary,
				topConcerns: [
					...mockSummary.topConcerns,
					{
						id: '4',
						bodyArea: 'hips',
						measurement: '5° tilt',
						severity: 'mild',
						priority: 'low',
						description: 'Minor hip imbalance',
					},
					{
						id: '5',
						bodyArea: 'knees',
						measurement: '3° valgus',
						severity: 'mild',
						priority: 'low',
						description: 'Slight knee misalignment',
					},
				],
			};

			render(
				<ClinicalSummaryCard summary={summaryManyConcerns} variant="full" />,
			);

			// Should only show first 3
			expect(screen.queryByText('Hips')).not.toBeInTheDocument();
			expect(screen.queryByText('Knees')).not.toBeInTheDocument();
		});

		it('should apply custom className', () => {
			const { container } = render(
				<ClinicalSummaryCard summary={mockSummary} className="custom-class" />,
			);

			expect(container.querySelector('.custom-class')).toBeInTheDocument();
		});

		it('should render priority icons', () => {
			render(<ClinicalSummaryCard summary={mockSummary} variant="full" />);

			// High priority should have exclamation icon
			const highPriorityTag = screen
				.getByText('high priority')
				.closest('.ant-tag');
			expect(
				highPriorityTag?.querySelector('.anticon-exclamation-circle'),
			).toBeInTheDocument();

			// Medium priority should have clock icon
			const mediumPriorityTags = screen.getAllByText('medium priority');
			const mediumTag = mediumPriorityTags[0].closest('.ant-tag');
			expect(
				mediumTag?.querySelector('.anticon-clock-circle'),
			).toBeInTheDocument();
		});
	});
});
