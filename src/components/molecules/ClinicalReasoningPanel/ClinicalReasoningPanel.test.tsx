/**
 * ClinicalReasoningPanel.test.tsx
 *
 * Unit tests for Clinical Reasoning Panel molecule
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClinicalReasoningPanel } from './ClinicalReasoningPanel';
import type { ClinicalReasoning } from '@types';

describe('ClinicalReasoningPanel', () => {
	const mockReasoning: ClinicalReasoning = {
		exerciseId: '1',
		explanation:
			'Your posture scan showed forward head posture. This stretch helps by strengthening your neck muscles.',
		postureFindings: [
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
				description: 'Rounded shoulders from desk work',
			},
		],
		expectedOutcome: 'Reduced neck tension',
		timeline: '2-3 weeks',
		evidenceLinks: [
			{
				id: '1',
				title: 'Understanding Posture',
				url: '/resources/posture',
				type: 'article',
				source: 'strapi',
			},
		],
		benefits: [
			'Strengthens neck muscles',
			'Reduces tension',
			'Improves posture awareness',
		],
		readabilityScore: 75.5,
	};

	it('should render explanation', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		expect(screen.getByText('Why This Exercise?')).toBeInTheDocument();
		expect(
			screen.getByText(/your posture scan showed forward head posture/i),
		).toBeInTheDocument();
	});

	it('should render posture findings', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		expect(screen.getByText('Your Posture Findings')).toBeInTheDocument();
		expect(screen.getByText('Neck')).toBeInTheDocument();
		expect(screen.getByText('15° forward tilt')).toBeInTheDocument();
		expect(
			screen.getByText('Forward head posture detected'),
		).toBeInTheDocument();
	});

	it('should render severity tags', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		expect(screen.getByText('moderate')).toBeInTheDocument();
		expect(screen.getByText('mild')).toBeInTheDocument();
	});

	it('should render priority tags', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		expect(screen.getByText('high priority')).toBeInTheDocument();
		expect(screen.getByText('medium priority')).toBeInTheDocument();
	});

	it('should render benefits list', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		expect(screen.getByText('How This Helps')).toBeInTheDocument();
		expect(screen.getByText('Strengthens neck muscles')).toBeInTheDocument();
		expect(screen.getByText('Reduces tension')).toBeInTheDocument();
		expect(screen.getByText('Improves posture awareness')).toBeInTheDocument();
	});

	it('should render expected outcome', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		expect(screen.getByText('Expected Outcome')).toBeInTheDocument();
		expect(screen.getByText('Reduced neck tension')).toBeInTheDocument();
	});

	it('should render timeline', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		expect(screen.getByText('Expected Timeline')).toBeInTheDocument();
		expect(screen.getByText('2-3 weeks')).toBeInTheDocument();
	});

	it('should render educational resources', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		expect(screen.getByText('Learn More')).toBeInTheDocument();
		expect(screen.getByText('Understanding Posture')).toBeInTheDocument();
	});

	it('should render with no posture findings', () => {
		const reasoningNoFindings: ClinicalReasoning = {
			...mockReasoning,
			postureFindings: [],
		};

		render(<ClinicalReasoningPanel reasoning={reasoningNoFindings} />);

		expect(screen.queryByText('Your Posture Findings')).not.toBeInTheDocument();
	});

	it('should render with no benefits', () => {
		const reasoningNoBenefits: ClinicalReasoning = {
			...mockReasoning,
			benefits: [],
		};

		render(<ClinicalReasoningPanel reasoning={reasoningNoBenefits} />);

		expect(screen.queryByText('How This Helps')).not.toBeInTheDocument();
	});

	it('should render with no educational resources', () => {
		const reasoningNoResources: ClinicalReasoning = {
			...mockReasoning,
			evidenceLinks: [],
		};

		render(<ClinicalReasoningPanel reasoning={reasoningNoResources} />);

		expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
	});

	it('should have accessible region role', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		const region = screen.getByRole('region', { name: 'Clinical reasoning' });
		expect(region).toBeInTheDocument();
	});

	it('should apply custom className', () => {
		const { container } = render(
			<ClinicalReasoningPanel
				reasoning={mockReasoning}
				className="custom-class"
			/>,
		);

		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('should show readability score in development mode', () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'development';

		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		// Readability score should be visible in dev mode
		expect(screen.getByText(/Readability: 75.5/i)).toBeInTheDocument();
		expect(screen.getByText(/✓ Pass/i)).toBeInTheDocument();

		process.env.NODE_ENV = originalEnv;
	});

	it('should handle severity colors correctly', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		// Moderate severity should have warning color
		const moderateTag = screen.getByText('moderate').closest('.ant-tag');
		expect(moderateTag).toHaveClass('ant-tag-warning');

		// Mild severity should have success color
		const mildTag = screen.getByText('mild').closest('.ant-tag');
		expect(mildTag).toHaveClass('ant-tag-success');
	});

	it('should handle priority colors correctly', () => {
		render(<ClinicalReasoningPanel reasoning={mockReasoning} />);

		// High priority should have error color
		const highPriorityTag = screen
			.getByText('high priority')
			.closest('.ant-tag');
		expect(highPriorityTag).toHaveClass('ant-tag-error');

		// Medium priority should have warning color
		const mediumPriorityTag = screen
			.getByText('medium priority')
			.closest('.ant-tag');
		expect(mediumPriorityTag).toHaveClass('ant-tag-warning');
	});
});
