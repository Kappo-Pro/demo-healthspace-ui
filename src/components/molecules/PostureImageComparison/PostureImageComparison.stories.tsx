/**
 * PostureImageComparison Storybook Stories (Story 2.2)
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PostureImageComparison } from './PostureImageComparison';
import type { PostureAnalysis, PostureComparisonSummary } from '@types';

// Mock data for stories
const mockComparison: PostureAnalysis = {
	id: 'session-123',
	userId: 'user-456',
	sessionId: 'session-123',
	baselineImageUrl: 'https://via.placeholder.com/600x800/e0e0e0/000000?text=Baseline+Scan',
	currentImageUrl: 'https://via.placeholder.com/600x800/bbdefb/000000?text=Current+Scan',
	scanDate: '2025-03-20T10:30:00Z',
	baselineDate: '2025-01-15T09:00:00Z',
	annotations: [
		{
			id: 'ann-1',
			type: 'angle',
			coordinates: [
				{ x: 200, y: 150 },
				{ x: 220, y: 140 },
				{ x: 240, y: 160 },
			],
			label: 'Shoulder Alignment',
			value: '+15°',
			color: 'var(--color-success-500)',
			opacity: 0.6,
		},
		{
			id: 'ann-2',
			type: 'landmark',
			coordinates: [{ x: 300, y: 400 }],
			label: 'Hip Alignment',
			value: '+5mm',
			color: 'var(--color-success-500)',
			opacity: 0.8,
		},
	],
	improvements: [
		{
			id: 'imp-1',
			bodyPart: 'shoulder alignment',
			deltaValue: 15,
			deltaUnit: '°',
			description: 'Shoulder alignment improved by 15°',
			direction: 'improved',
		},
		{
			id: 'imp-2',
			bodyPart: 'neck tilt',
			deltaValue: -8,
			deltaUnit: '°',
			description: 'Neck tilt improved by 8° (closer to neutral)',
			direction: 'improved',
		},
		{
			id: 'imp-3',
			bodyPart: 'hip alignment',
			deltaValue: 5,
			deltaUnit: 'mm',
			description: 'Hip alignment improved by 5mm',
			direction: 'improved',
		},
		{
			id: 'imp-4',
			bodyPart: 'lower back curve',
			deltaValue: -3,
			deltaUnit: '°',
			description: 'Lower back curve needs attention',
			direction: 'attention',
			severity: 'moderate',
		},
	],
	attentionAreas: [
		{
			id: 'att-1',
			bodyPart: 'lower back',
			issue: 'increased lordosis',
			severity: 'moderate',
			coordinates: [
				{ x: 280, y: 500 },
				{ x: 320, y: 500 },
				{ x: 320, y: 550 },
				{ x: 280, y: 550 },
			],
			color: 'var(--color-warning-500)',
			recommendations: ['exercise-123', 'exercise-456'],
		},
	],
	clinicalNotes: 'Overall improvement noted. Continue with current exercise routine.',
	overallScore: 82,
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

const meta: Meta<typeof PostureImageComparison> = {
	title: 'Molecules/PostureImageComparison',
	component: PostureImageComparison,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Side-by-side posture image comparison with annotation overlays (Story 2.2 - FR7a)',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		sessionId: {
			control: 'text',
			description: 'Session ID for tracking',
		},
		showAnnotations: {
			control: 'boolean',
			description: 'Show/hide annotation overlays',
		},
		showSummary: {
			control: 'boolean',
			description: 'Show/hide improvement summary',
		},
		isLoading: {
			control: 'boolean',
			description: 'Loading state',
		},
	},
};

export default meta;
type Story = StoryObj<typeof PostureImageComparison>;

/**
 * Default comparison with all features enabled
 */
export const Default: Story = {
	args: {
		sessionId: 'session-123',
		comparison: mockComparison,
		summary: mockSummary,
		showAnnotations: true,
		showSummary: true,
	},
};

/**
 * Without improvement summary
 */
export const WithoutSummary: Story = {
	args: {
		sessionId: 'session-123',
		comparison: mockComparison,
		summary: mockSummary,
		showAnnotations: true,
		showSummary: false,
	},
};

/**
 * Loading state
 */
export const Loading: Story = {
	args: {
		sessionId: 'session-123',
		comparison: null,
		summary: null,
		isLoading: true,
	},
};

/**
 * Error state
 */
export const Error: Story = {
	args: {
		sessionId: 'session-123',
		comparison: null,
		summary: null,
		error: 'Failed to load comparison data from server',
	},
};

/**
 * Empty state (no data available)
 */
export const Empty: Story = {
	args: {
		sessionId: 'session-123',
		comparison: null,
		summary: null,
	},
};

/**
 * Mobile view (resize viewport to <768px to see)
 */
export const Mobile: Story = {
	args: {
		sessionId: 'session-123',
		comparison: mockComparison,
		summary: mockSummary,
		showAnnotations: true,
		showSummary: true,
	},
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
	},
};
