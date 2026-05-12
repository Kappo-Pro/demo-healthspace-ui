/**
 * SessionCalendar Storybook Stories
 * EPIC-022-S1: Session Calendar Molecule
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SessionCalendar } from './SessionCalendar';
import { SessionData } from './types';
import { subDays, format } from 'date-fns';

const meta = {
	title: 'Molecules/SessionCalendar',
	component: SessionCalendar,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Calendar heatmap visualization showing user session history over the last 90 days. Similar to GitHub contribution graph, with color intensity representing session frequency.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		data: {
			description: 'Array of session data points',
			control: 'object',
		},
		loading: {
			description: 'Loading state indicator',
			control: 'boolean',
		},
		className: {
			description: 'Custom CSS class name',
			control: 'text',
		},
	},
} satisfies Meta<typeof SessionCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper function to generate sample session data
 */
const generateSampleData = (
	pattern: 'active' | 'moderate' | 'sparse' | 'declining' | 'increasing',
): SessionData[] => {
	const today = new Date();
	const data: SessionData[] = [];

	for (let i = 0; i < 90; i++) {
		const date = format(subDays(today, i), 'yyyy-MM-dd');
		let count = 0;

		switch (pattern) {
			case 'active':
				// Frequent sessions (2-5 per day, some gaps)
				count = i % 3 === 0 ? 0 : Math.floor(Math.random() * 4) + 2;
				break;
			case 'moderate':
				// Moderate activity (1-3 per day, more gaps)
				count = i % 4 === 0 ? 0 : Math.floor(Math.random() * 3) + 1;
				break;
			case 'sparse':
				// Sparse activity (0-2 per day, many gaps)
				count = i % 5 === 0 ? Math.floor(Math.random() * 3) : 0;
				break;
			case 'declining':
				// Declining pattern over time
				count =
					i < 30
						? Math.floor(Math.random() * 5)
						: i < 60
							? Math.floor(Math.random() * 3)
							: i % 3 === 0
								? Math.floor(Math.random() * 2)
								: 0;
				break;
			case 'increasing':
				// Increasing pattern over time
				count =
					i < 30
						? i % 3 === 0
							? Math.floor(Math.random() * 2)
							: 0
						: i < 60
							? Math.floor(Math.random() * 3) + 1
							: Math.floor(Math.random() * 4) + 2;
				break;
		}

		if (count > 0) {
			data.push({ date, count });
		}
	}

	return data;
};

/**
 * Default: Active User Pattern
 * Shows a user with consistent, frequent activity
 */
export const Default: Story = {
	args: {
		data: generateSampleData('active'),
	},
};

/**
 * Moderate Activity
 * User with moderate session frequency
 */
export const ModerateActivity: Story = {
	args: {
		data: generateSampleData('moderate'),
	},
};

/**
 * Sparse Activity
 * User with infrequent sessions
 */
export const SparseActivity: Story = {
	args: {
		data: generateSampleData('sparse'),
	},
};

/**
 * Declining Engagement
 * User becoming less active over time
 */
export const DecliningEngagement: Story = {
	args: {
		data: generateSampleData('declining'),
	},
};

/**
 * Increasing Engagement
 * User becoming more active over time
 */
export const IncreasingEngagement: Story = {
	args: {
		data: generateSampleData('increasing'),
	},
};

/**
 * Loading State
 * Shows spinner while data loads
 */
export const Loading: Story = {
	args: {
		data: generateSampleData('active'),
		loading: true,
	},
};

/**
 * Empty State
 * No session data available
 */
export const Empty: Story = {
	args: {
		data: [],
	},
};

/**
 * Perfect Streak
 * User with sessions every single day
 */
export const PerfectStreak: Story = {
	args: {
		data: Array.from({ length: 90 }, (_, i) => ({
			date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
			count: Math.floor(Math.random() * 3) + 2,
		})),
	},
};

/**
 * Weekend Warrior
 * User who only exercises on weekends
 */
export const WeekendWarrior: Story = {
	args: {
		data: Array.from({ length: 90 }, (_, i) => {
			const date = subDays(new Date(), i);
			const dayOfWeek = date.getDay();
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

			return isWeekend
				? {
						date: format(date, 'yyyy-MM-dd'),
						count: Math.floor(Math.random() * 4) + 2,
					}
				: null;
		}).filter((item): item is SessionData => item !== null),
	},
};

/**
 * Weekday Routine
 * User who exercises on weekdays only
 */
export const WeekdayRoutine: Story = {
	args: {
		data: Array.from({ length: 90 }, (_, i) => {
			const date = subDays(new Date(), i);
			const dayOfWeek = date.getDay();
			const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;

			return isWeekday
				? {
						date: format(date, 'yyyy-MM-dd'),
						count: Math.floor(Math.random() * 3) + 1,
					}
				: null;
		}).filter((item): item is SessionData => item !== null),
	},
};

/**
 * High Intensity Pattern
 * User with consistently high session counts
 */
export const HighIntensity: Story = {
	args: {
		data: Array.from({ length: 60 }, (_, i) => ({
			date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
			count: Math.floor(Math.random() * 3) + 4, // 4-6 sessions
		})),
	},
};

/**
 * Recent Activity Only
 * User who just started (last 2 weeks)
 */
export const RecentActivityOnly: Story = {
	args: {
		data: Array.from({ length: 14 }, (_, i) => ({
			date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
			count: Math.floor(Math.random() * 4) + 1,
		})),
	},
};

/**
 * Custom Class Name
 * Component with custom styling
 */
export const WithCustomClass: Story = {
	args: {
		data: generateSampleData('active'),
		className: 'custom-calendar-style',
	},
	decorators: [
		Story => (
			<div>
				<style>
					{`
            .custom-calendar-style {
              border: 2px solid var(--brand-primary);
              box-shadow: var(--shadow-lg);
            }
          `}
				</style>
				<Story />
			</div>
		),
	],
};
