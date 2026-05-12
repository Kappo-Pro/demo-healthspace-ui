/**
 * PostureJourneyView Storybook Stories
 * Story 2.1: Patient Journey Timeline View
 *
 * Stories:
 * - Default state with sample data
 * - Empty state (no scans)
 * - Loading state
 * - Mobile viewport story
 * - Dark mode story
 * - Compact mode
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import PostureJourneyView from './index';
import { PatientJourneyState } from '@types';

// Mock journey data
const mockJourneyData: PatientJourneyState = {
	patientId: 'user-123',
	startDate: '2024-09-01T00:00:00Z',
	sessions: [
		{
			id: 'session-1',
			date: '2024-09-01T10:00:00Z',
			assessment: 'posture-initial',
			score: 65,
			improvement: 0,
			status: 'complete' as const,
		},
		{
			id: 'session-2',
			date: '2024-09-15T10:00:00Z',
			assessment: 'posture-followup',
			score: 72,
			improvement: 7,
			status: 'complete' as const,
		},
		{
			id: 'session-3',
			date: '2024-10-01T10:00:00Z',
			assessment: 'posture-progress',
			score: 80,
			improvement: 8,
			status: 'complete' as const,
		},
		{
			id: 'session-4',
			date: '2024-10-20T10:00:00Z',
			assessment: 'posture-current',
			score: 85,
			improvement: 5,
			status: 'in_progress' as const,
		},
	],
	milestones: [
		{
			id: 'milestone-1',
			title: 'First Assessment',
			description: 'Completed baseline posture scan',
			achievedAt: '2024-09-01T10:00:00Z',
			type: 'assessment_complete' as const,
			icon: 'CheckCircleOutlined',
		},
		{
			id: 'milestone-2',
			title: '10% Improvement',
			description: 'Posture score improved by 10%',
			achievedAt: '2024-09-15T10:00:00Z',
			type: 'improvement_10' as const,
			icon: 'TrophyOutlined',
		},
		{
			id: 'milestone-3',
			title: '7-Day Streak',
			description: 'Completed exercises for 7 consecutive days',
			achievedAt: '2024-10-01T10:00:00Z',
			type: 'streak_7' as const,
			icon: 'FireOutlined',
		},
		{
			id: 'milestone-4',
			title: '20% Improvement',
			description: 'Target: Improve posture score by 20%',
			achievedAt: null,
			type: 'improvement_20' as const,
			icon: 'RocketOutlined',
		},
	],
	progress: {
		totalAssessments: 4,
		averageScore: 75.5,
		scoreImprovement: 20,
		adherenceRate: 85,
	},
};

const emptyJourneyData: PatientJourneyState = {
	patientId: 'user-123',
	startDate: new Date().toISOString(),
	sessions: [],
	milestones: [],
	progress: {
		totalAssessments: 0,
		averageScore: 0,
		scoreImprovement: 0,
		adherenceRate: 0,
	},
};

// Mock Redux store factory
const createMockStore = (journeyData: PatientJourneyState | null) => {
	const postureSlice = createSlice({
		name: 'postures',
		initialState: {
			data: journeyData?.sessions || [],
			postureReport: null,
		},
		reducers: {},
	});

	const userSlice = createSlice({
		name: 'user',
		initialState: {
			user: { id: 'user-123' },
		},
		reducers: {},
	});

	return configureStore({
		reducer: {
			postures: postureSlice.reducer,
			user: userSlice.reducer,
		},
		preloadedState: {
			postures: {
				data: journeyData?.sessions || [],
				postureReport: null,
			},
			user: {
				user: { id: 'user-123' },
			},
		},
	});
};

// Story metadata
const meta: Meta<typeof PostureJourneyView> = {
	title: 'Epic 2/Organisms/PostureJourneyView',
	component: PostureJourneyView,
	tags: ['autodocs', 'epic-2', 'story-2.1'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Patient journey timeline view with milestones, progress metrics, and mobile-optimized swipeable interface. Implements AC1-AC5 from Story 2.1 (FR6).',
			},
		},
	},
	argTypes: {
		compact: {
			description: 'Show compact mode (for sidebars)',
			control: 'boolean',
		},
		loading: {
			description: 'Loading state',
			control: 'boolean',
		},
	},
};

export default meta;
type Story = StoryObj<typeof PostureJourneyView>;

/**
 * Default journey with 4 sessions and 3 achieved milestones
 */
export const Default: Story = {
	render: args => (
		<Provider store={createMockStore(mockJourneyData)}>
			<div style={{ padding: 'var(--spacing-6)', minHeight: '100vh' }}>
				<PostureJourneyView {...args} />
			</div>
		</Provider>
	),
};

/**
 * Empty state - no assessments completed yet
 */
export const EmptyState: Story = {
	render: args => (
		<Provider store={createMockStore(emptyJourneyData)}>
			<div style={{ padding: 'var(--spacing-6)', minHeight: '100vh' }}>
				<PostureJourneyView {...args} />
			</div>
		</Provider>
	),
};

/**
 * Loading state
 */
export const Loading: Story = {
	render: args => (
		<Provider store={createMockStore(mockJourneyData)}>
			<div style={{ padding: 'var(--spacing-6)', minHeight: '100vh' }}>
				<PostureJourneyView {...args} loading={true} />
			</div>
		</Provider>
	),
};

/**
 * Compact mode for sidebar display
 */
export const CompactMode: Story = {
	render: args => (
		<Provider store={createMockStore(mockJourneyData)}>
			<div style={{ padding: 'var(--spacing-6)', minHeight: '100vh', maxWidth: '400px' }}>
				<PostureJourneyView {...args} compact={true} />
			</div>
		</Provider>
	),
};

/**
 * Mobile viewport (swipeable timeline)
 */
export const MobileView: Story = {
	render: args => (
		<Provider store={createMockStore(mockJourneyData)}>
			<div style={{ padding: 'var(--spacing-4)', minHeight: '100vh' }}>
				<PostureJourneyView {...args} />
			</div>
		</Provider>
	),
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
		docs: {
			description: {
				story:
					'Mobile-optimized view with left-aligned timeline and touch-friendly interactions (AC4). Swipe gestures supported.',
			},
		},
	},
};

/**
 * Tablet viewport
 */
export const TabletView: Story = {
	render: args => (
		<Provider store={createMockStore(mockJourneyData)}>
			<div style={{ padding: 'var(--spacing-5)', minHeight: '100vh' }}>
				<PostureJourneyView {...args} />
			</div>
		</Provider>
	),
	parameters: {
		viewport: {
			defaultViewport: 'tablet',
		},
	},
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
	render: args => (
		<Provider store={createMockStore(mockJourneyData)}>
			<div
				style={{
					padding: 'var(--spacing-6)',
					minHeight: '100vh',
					background: 'var(--color-neutral-900)',
				}}>
				<PostureJourneyView {...args} />
			</div>
		</Provider>
	),
	parameters: {
		backgrounds: {
			default: 'dark',
		},
	},
};

/**
 * High progress journey (all milestones achieved)
 */
export const HighProgress: Story = {
	render: args => {
		const highProgressData: PatientJourneyState = {
			...mockJourneyData,
			milestones: mockJourneyData.milestones.map(m => ({
				...m,
				achievedAt: m.achievedAt || new Date().toISOString(),
			})),
			progress: {
				totalAssessments: 12,
				averageScore: 92,
				scoreImprovement: 35,
				adherenceRate: 98,
			},
		};

		return (
			<Provider store={createMockStore(highProgressData)}>
				<div style={{ padding: 'var(--spacing-6)', minHeight: '100vh' }}>
					<PostureJourneyView {...args} />
				</div>
			</Provider>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Journey with all milestones achieved and high scores. Shows encouraging message (AC2).',
			},
		},
	},
};

/**
 * Accessibility testing
 */
export const AccessibilityTest: Story = {
	render: args => (
		<Provider store={createMockStore(mockJourneyData)}>
			<div style={{ padding: 'var(--spacing-6)', minHeight: '100vh' }}>
				<PostureJourneyView {...args} />
			</div>
		</Provider>
	),
	parameters: {
		a11y: {
			config: {
				rules: [
					{
						id: 'color-contrast',
						enabled: true,
					},
					{
						id: 'button-name',
						enabled: true,
					},
					{
						id: 'aria-valid-attr',
						enabled: true,
					},
				],
			},
		},
		docs: {
			description: {
				story:
					'Accessibility test story. Verify keyboard navigation (arrow keys), screen reader support, and WCAG 2.1 AA compliance (AC5).',
			},
		},
	},
};
