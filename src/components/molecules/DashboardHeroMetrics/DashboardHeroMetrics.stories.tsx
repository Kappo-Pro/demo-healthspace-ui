/**
 * DashboardHeroMetrics Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DashboardHeroMetrics } from './DashboardHeroMetrics';
import type { DashboardMetrics } from './types';

const meta = {
	title: 'Molecules/DashboardHeroMetrics',
	component: DashboardHeroMetrics,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'DashboardHeroMetrics displays three key patient metrics (ROM score, sessions completed, and current streak) in a responsive grid layout using MetricCard components.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		loading: {
			control: 'boolean',
			description: 'Shows skeleton loading state for all cards',
		},
		metrics: {
			description: 'Dashboard metrics data object',
		},
	},
} satisfies Meta<typeof DashboardHeroMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default metrics with all trends
const defaultMetrics: DashboardMetrics = {
	romScore: 85,
	romTrend: 5,
	sessionsCompleted: 12,
	sessionsTrend: 3,
	currentStreak: 7,
	streakTrend: 2,
};

/**
 * Default state showing all three metrics with positive trends
 */
export const Default: Story = {
	args: {
		metrics: defaultMetrics,
		loading: false,
	},
};

/**
 * Loading state - shows skeleton UI for all cards
 */
export const Loading: Story = {
	args: {
		metrics: defaultMetrics,
		loading: true,
	},
};

/**
 * Null ROM score - displays 'N/A' when patient hasn't completed ROM assessment
 */
export const NullRomScore: Story = {
	args: {
		metrics: {
			...defaultMetrics,
			romScore: null,
			romTrend: undefined,
		},
		loading: false,
	},
};

/**
 * No trends - works without optional trend indicators
 */
export const NoTrends: Story = {
	args: {
		metrics: {
			romScore: 85,
			sessionsCompleted: 12,
			currentStreak: 7,
		},
		loading: false,
	},
};

/**
 * Negative trends - shows declining metrics
 */
export const NegativeTrends: Story = {
	args: {
		metrics: {
			romScore: 75,
			romTrend: -5,
			sessionsCompleted: 8,
			sessionsTrend: -2,
			currentStreak: 3,
			streakTrend: -4,
		},
		loading: false,
	},
};

/**
 * Zero values - patient just starting their journey
 */
export const ZeroValues: Story = {
	args: {
		metrics: {
			romScore: 0,
			romTrend: 0,
			sessionsCompleted: 0,
			sessionsTrend: 0,
			currentStreak: 0,
			streakTrend: 0,
		},
		loading: false,
	},
};

/**
 * Perfect ROM score - patient achieved maximum ROM score
 */
export const PerfectScore: Story = {
	args: {
		metrics: {
			romScore: 100,
			romTrend: 15,
			sessionsCompleted: 25,
			sessionsTrend: 10,
			currentStreak: 14,
			streakTrend: 7,
		},
		loading: false,
	},
};

/**
 * Single day streak - tests singular "day" suffix
 */
export const OneDayStreak: Story = {
	args: {
		metrics: {
			romScore: 60,
			romTrend: 2,
			sessionsCompleted: 1,
			sessionsTrend: 1,
			currentStreak: 1,
			streakTrend: 1,
		},
		loading: false,
	},
};

/**
 * High activity - engaged patient with many sessions and long streak
 */
export const HighActivity: Story = {
	args: {
		metrics: {
			romScore: 92,
			romTrend: 8,
			sessionsCompleted: 45,
			sessionsTrend: 12,
			currentStreak: 21,
			streakTrend: 5,
		},
		loading: false,
	},
};

/**
 * Mixed trends - some metrics improving, others declining
 */
export const MixedTrends: Story = {
	args: {
		metrics: {
			romScore: 80,
			romTrend: 5, // improving
			sessionsCompleted: 10,
			sessionsTrend: -2, // declining
			currentStreak: 5,
			streakTrend: 3, // improving
		},
		loading: false,
	},
};
