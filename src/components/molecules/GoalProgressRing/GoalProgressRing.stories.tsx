/**
 * GoalProgressRing Stories
 *
 * Storybook stories showcasing the GoalProgressRing molecule component
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { GoalProgressRing } from './GoalProgressRing';

const meta: Meta<typeof GoalProgressRing> = {
	title: 'Molecules/GoalProgressRing',
	component: GoalProgressRing,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Circular progress ring component for displaying goal completion percentage with smooth animation and dynamic color coding.',
			},
		},
	},
	argTypes: {
		title: {
			control: 'text',
			description: 'Title/name of the goal being tracked',
		},
		progress: {
			control: { type: 'range', min: 0, max: 100, step: 1 },
			description: 'Progress percentage (0-100)',
		},
		size: {
			control: { type: 'number', min: 80, max: 300, step: 10 },
			description: 'Diameter size in pixels',
		},
		loading: {
			control: 'boolean',
			description: 'Loading state',
		},
		className: {
			control: 'text',
			description: 'Additional CSS class',
		},
		ariaLabel: {
			control: 'text',
			description: 'Custom ARIA label for accessibility',
		},
	},
};

export default meta;
type Story = StoryObj<typeof GoalProgressRing>;

/**
 * Default story with 75% progress (success threshold)
 */
export const Default: Story = {
	args: {
		title: 'Balance',
		progress: 75,
		size: 120,
	},
};

/**
 * Warning threshold (< 50%)
 */
export const WarningProgress: Story = {
	args: {
		title: 'Flexibility',
		progress: 35,
		size: 120,
	},
	parameters: {
		docs: {
			description: {
				story: 'Progress below 50% displays in warning color (orange)',
			},
		},
	},
};

/**
 * Primary threshold (50-74%)
 */
export const PrimaryProgress: Story = {
	args: {
		title: 'Strength',
		progress: 62,
		size: 120,
	},
	parameters: {
		docs: {
			description: {
				story: 'Progress between 50-74% displays in primary color (purple)',
			},
		},
	},
};

/**
 * Success threshold (>= 75%)
 */
export const SuccessProgress: Story = {
	args: {
		title: 'Mobility',
		progress: 88,
		size: 120,
	},
	parameters: {
		docs: {
			description: {
				story: 'Progress at or above 75% displays in success color (green)',
			},
		},
	},
};

/**
 * Zero progress
 */
export const ZeroProgress: Story = {
	args: {
		title: 'Not Started',
		progress: 0,
		size: 120,
	},
	parameters: {
		docs: {
			description: {
				story: 'Goal with 0% completion',
			},
		},
	},
};

/**
 * Complete progress (100%)
 */
export const CompleteProgress: Story = {
	args: {
		title: 'Completed',
		progress: 100,
		size: 120,
	},
	parameters: {
		docs: {
			description: {
				story: 'Goal at 100% completion',
			},
		},
	},
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
	args: {
		title: 'Small',
		progress: 65,
		size: 80,
	},
	parameters: {
		docs: {
			description: {
				story: 'Compact 80px diameter ring',
			},
		},
	},
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
	args: {
		title: 'Large Goal',
		progress: 70,
		size: 200,
	},
	parameters: {
		docs: {
			description: {
				story: 'Large 200px diameter ring',
			},
		},
	},
};

/**
 * Loading state
 */
export const Loading: Story = {
	args: {
		title: 'Loading',
		progress: 75,
		size: 120,
		loading: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Loading state with spinner',
			},
		},
	},
};

/**
 * Long title text
 */
export const LongTitle: Story = {
	args: {
		title: 'Complex Balance & Stability',
		progress: 55,
		size: 120,
	},
	parameters: {
		docs: {
			description: {
				story: 'Handles longer goal titles with text wrapping',
			},
		},
	},
};

/**
 * Custom aria label for accessibility
 */
export const CustomAriaLabel: Story = {
	args: {
		title: 'Balance',
		progress: 75,
		size: 120,
		ariaLabel: 'Balance goal: 75 percent complete',
	},
	parameters: {
		docs: {
			description: {
				story: 'Custom ARIA label for screen readers',
			},
		},
	},
};

/**
 * Multiple rings in a grid
 */
export const MultipleRings: Story = {
	render: () => (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-6)' }}>
			<GoalProgressRing title="Balance" progress={85} />
			<GoalProgressRing title="Strength" progress={62} />
			<GoalProgressRing title="Flexibility" progress={45} />
			<GoalProgressRing title="Endurance" progress={78} />
			<GoalProgressRing title="Mobility" progress={30} />
			<GoalProgressRing title="Coordination" progress={92} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Multiple progress rings showing different goals',
			},
		},
	},
};

/**
 * Different sizes comparison
 */
export const SizeComparison: Story = {
	render: () => (
		<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
			<GoalProgressRing title="Small" progress={75} size={80} />
			<GoalProgressRing title="Medium" progress={75} size={120} />
			<GoalProgressRing title="Large" progress={75} size={160} />
			<GoalProgressRing title="XL" progress={75} size={200} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of different ring sizes',
			},
		},
	},
};

/**
 * Color threshold progression
 */
export const ColorThresholds: Story = {
	render: () => (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-6)' }}>
			<div style={{ textAlign: 'center' }}>
				<GoalProgressRing title="25%" progress={25} />
				<p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: '#757575' }}>Warning</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<GoalProgressRing title="50%" progress={50} />
				<p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: '#757575' }}>Primary</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<GoalProgressRing title="75%" progress={75} />
				<p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: '#757575' }}>Success</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<GoalProgressRing title="100%" progress={100} />
				<p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: '#757575' }}>Complete</p>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Color changes at different progress thresholds (25%, 50%, 75%, 100%)',
			},
		},
	},
};

/**
 * Interactive playground
 */
export const Playground: Story = {
	args: {
		title: 'Interactive Goal',
		progress: 65,
		size: 140,
		loading: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive story to test all props dynamically',
			},
		},
	},
};
