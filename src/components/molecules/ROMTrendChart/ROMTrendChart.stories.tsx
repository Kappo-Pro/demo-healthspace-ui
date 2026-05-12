/**
 * ROMTrendChart Storybook Stories
 *
 * Interactive documentation and visual testing for the ROMTrendChart component
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ROMTrendChart } from './ROMTrendChart';
import { ROMDataPoint } from './types';

/**
 * Generate sample ROM data for different scenarios
 */
const generateROMData = (
	count: number,
	trend: 'improving' | 'declining' | 'stable' | 'fluctuating',
): ROMDataPoint[] => {
	const data: ROMDataPoint[] = [];
	const today = new Date();
	const baseScore = 70;

	for (let i = 0; i < count; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() - (count - i - 1) * 7); // Weekly data points

		let score = baseScore;
		switch (trend) {
			case 'improving':
				score = baseScore + (i * 20) / count;
				break;
			case 'declining':
				score = baseScore - (i * 20) / count;
				break;
			case 'stable':
				score = baseScore + (Math.random() * 4 - 2); // ±2 variation
				break;
			case 'fluctuating':
				score = baseScore + Math.sin(i) * 15;
				break;
		}

		data.push({
			date: date.toISOString(),
			score: Math.round(Math.max(0, Math.min(100, score))),
		});
	}

	return data;
};

/**
 * Component Metadata
 */
const meta: Meta<typeof ROMTrendChart> = {
	title: 'Molecules/ROMTrendChart',
	component: ROMTrendChart,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Displays ROM (Range of Motion) score trends over time using Recharts. Features responsive sizing, hover tooltips, design system theming, and graceful empty state handling.',
			},
		},
	},
	argTypes: {
		data: {
			description: 'Array of ROM data points with date and score',
			control: { type: 'object' },
		},
		loading: {
			description: 'Loading state indicator',
			control: { type: 'boolean' },
		},
		height: {
			description: 'Chart height in pixels',
			control: { type: 'number', min: 200, max: 600, step: 50 },
		},
		className: {
			description: 'Optional CSS class name',
			control: { type: 'text' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof ROMTrendChart>;

/**
 * Default Story - Improving Trend
 */
export const Default: Story = {
	args: {
		data: generateROMData(12, 'improving'),
		loading: false,
		height: 300,
	},
};

/**
 * Declining Trend
 */
export const DecliningTrend: Story = {
	args: {
		data: generateROMData(12, 'declining'),
		loading: false,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'ROM scores showing a declining trend over time.',
			},
		},
	},
};

/**
 * Stable Progress
 */
export const StableProgress: Story = {
	args: {
		data: generateROMData(12, 'stable'),
		loading: false,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story:
					'ROM scores remaining relatively stable with minor fluctuations.',
			},
		},
	},
};

/**
 * Fluctuating Pattern
 */
export const FluctuatingPattern: Story = {
	args: {
		data: generateROMData(12, 'fluctuating'),
		loading: false,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'ROM scores with significant ups and downs.',
			},
		},
	},
};

/**
 * Loading State
 */
export const Loading: Story = {
	args: {
		data: [],
		loading: true,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'Loading spinner displayed while fetching data.',
			},
		},
	},
};

/**
 * Empty State
 */
export const EmptyState: Story = {
	args: {
		data: [],
		loading: false,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'Empty state message when no ROM data is available.',
			},
		},
	},
};

/**
 * Sparse Data (Few Points)
 */
export const SparseData: Story = {
	args: {
		data: generateROMData(3, 'improving'),
		loading: false,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'Chart with only a few data points.',
			},
		},
	},
};

/**
 * Dense Data (Many Points)
 */
export const DenseData: Story = {
	args: {
		data: generateROMData(24, 'fluctuating'),
		loading: false,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'Chart with many data points over a longer period.',
			},
		},
	},
};

/**
 * Custom Height - Tall
 */
export const TallChart: Story = {
	args: {
		data: generateROMData(12, 'improving'),
		loading: false,
		height: 500,
	},
	parameters: {
		docs: {
			description: {
				story: 'Chart with increased height for better visibility.',
			},
		},
	},
};

/**
 * Custom Height - Short
 */
export const ShortChart: Story = {
	args: {
		data: generateROMData(12, 'improving'),
		loading: false,
		height: 200,
	},
	parameters: {
		docs: {
			description: {
				story: 'Compact chart with reduced height.',
			},
		},
	},
};

/**
 * Perfect Score
 */
export const PerfectScore: Story = {
	args: {
		data: [
			{
				date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
				score: 95,
			},
			{
				date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				score: 98,
			},
			{ date: new Date().toISOString(), score: 100 },
		],
		loading: false,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'ROM scores approaching perfect recovery.',
			},
		},
	},
};

/**
 * Low Scores
 */
export const LowScores: Story = {
	args: {
		data: [
			{
				date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
				score: 15,
			},
			{
				date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				score: 20,
			},
			{ date: new Date().toISOString(), score: 25 },
		],
		loading: false,
		height: 300,
	},
	parameters: {
		docs: {
			description: {
				story: 'ROM scores in the lower range.',
			},
		},
	},
};
