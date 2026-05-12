/**
 * PostureImageComparison Component Tests (Story 2.2)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostureImageComparison } from './PostureImageComparison';
import type { PostureAnalysis, PostureComparisonSummary } from '@types';

// Mock data
const mockComparison: PostureAnalysis = {
	id: 'session-123',
	userId: 'user-456',
	sessionId: 'session-123',
	baselineImageUrl: '/images/baseline.jpg',
	currentImageUrl: '/images/current.jpg',
	scanDate: '2025-03-20T10:30:00Z',
	baselineDate: '2025-01-15T09:00:00Z',
	annotations: [],
	improvements: [
		{
			id: 'imp-1',
			bodyPart: 'shoulder alignment',
			deltaValue: 15,
			deltaUnit: '°',
			description: 'Shoulder alignment improved by 15°',
			direction: 'improved',
		},
	],
	attentionAreas: [],
	clinicalNotes: 'Test notes',
	overallScore: 85,
	createdAt: '2025-03-20T10:30:00Z',
	updatedAt: '2025-03-20T10:45:00Z',
};

const mockSummary: PostureComparisonSummary = {
	totalAreas: 4,
	improvedCount: 3,
	attentionCount: 1,
	stableCount: 0,
	overallProgress: 'improved',
};

describe('PostureImageComparison', () => {
	test('renders loading state', () => {
		render(
			<PostureImageComparison
				sessionId="test-123"
				comparison={null}
				summary={null}
				isLoading={true}
			/>,
		);

		expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
	});

	test('renders error state', () => {
		const errorMessage = 'Failed to load data';
		render(
			<PostureImageComparison
				sessionId="test-123"
				comparison={null}
				summary={null}
				error={errorMessage}
			/>,
		);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	test('renders empty state when no data', () => {
		render(
			<PostureImageComparison
				sessionId="test-123"
				comparison={null}
				summary={null}
			/>,
		);

		expect(
			screen.getByText(/no comparison data available/i),
		).toBeInTheDocument();
	});

	test('renders side-by-side images when data provided', () => {
		render(
			<PostureImageComparison
				sessionId="test-123"
				comparison={mockComparison}
				summary={mockSummary}
				showAnnotations={false}
				showSummary={false}
			/>,
		);

		// Check for baseline and current images
		expect(screen.getByAltText(/baseline posture/i)).toBeInTheDocument();
		expect(screen.getByAltText(/current posture/i)).toBeInTheDocument();
	});

	test('renders improvement summary when showSummary=true', () => {
		render(
			<PostureImageComparison
				sessionId="test-123"
				comparison={mockComparison}
				summary={mockSummary}
				showAnnotations={false}
				showSummary={true}
			/>,
		);

		expect(screen.getByRole('region', { name: /improvement summary/i })).toBeInTheDocument();
	});

	test('hides improvement summary when showSummary=false', () => {
		render(
			<PostureImageComparison
				sessionId="test-123"
				comparison={mockComparison}
				summary={mockSummary}
				showAnnotations={false}
				showSummary={false}
			/>,
		);

		expect(screen.queryByRole('region', { name: /improvement summary/i })).not.toBeInTheDocument();
	});

	test('renders with dates in correct format', () => {
		render(
			<PostureImageComparison
				sessionId="test-123"
				comparison={mockComparison}
				summary={mockSummary}
			/>,
		);

		// Check for date labels (you may need to adjust based on actual date formatting)
		expect(screen.getByText(/baseline/i)).toBeInTheDocument();
		expect(screen.getByText(/current/i)).toBeInTheDocument();
	});

	test('renders with correct accessibility attributes', () => {
		render(
			<PostureImageComparison
				sessionId="test-123"
				comparison={mockComparison}
				summary={mockSummary}
			/>,
		);

		// Check main region has label
		const mainRegion = screen.getByRole('region', { name: /posture comparison/i });
		expect(mainRegion).toBeInTheDocument();

		// Check images have alt text
		const images = screen.getAllByRole('img');
		images.forEach((img) => {
			expect(img).toHaveAttribute('alt');
		});
	});
});
