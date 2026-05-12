/**
 * StatusDropdown Storybook Stories
 *
 * Stories showcasing the StatusDropdown component in various states
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { StatusDropdown } from './StatusDropdown';
import { fn } from '@storybook/test';

const meta: Meta<typeof StatusDropdown> = {
	title: 'Organisms/EvaluationResultsModal/Components/StatusDropdown',
	component: StatusDropdown,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'A dropdown component for managing evaluation status with smart confirmation for backward status changes (e.g., Completed → Pending).',
			},
		},
	},
	argTypes: {
		currentStatus: {
			control: 'select',
			options: ['pending', 'in-review', 'completed', 'archived'],
			description: 'Current evaluation status',
			table: {
				type: { summary: "'pending' | 'in-review' | 'completed' | 'archived'" },
			},
		},
		onChange: {
			description: 'Callback when status changes',
			table: {
				type: { summary: '(newStatus: Status) => void' },
			},
		},
		disabled: {
			control: 'boolean',
			description: 'Disable the dropdown',
		},
		size: {
			control: 'select',
			options: ['small', 'middle', 'large'],
			description: 'Ant Design size',
			table: {
				type: { summary: "'small' | 'middle' | 'large'" },
				defaultValue: { summary: 'middle' },
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusDropdown>;

/**
 * Pending status - start of evaluation workflow
 */
export const Pending: Story = {
	args: {
		currentStatus: 'pending',
		onChange: fn(),
	},
};

/**
 * In Review status - evaluation is being reviewed
 */
export const InReview: Story = {
	args: {
		currentStatus: 'in-review',
		onChange: fn(),
	},
};

/**
 * Completed status - evaluation is finished
 */
export const Completed: Story = {
	args: {
		currentStatus: 'completed',
		onChange: fn(),
	},
};

/**
 * Archived status - evaluation is archived
 */
export const Archived: Story = {
	args: {
		currentStatus: 'archived',
		onChange: fn(),
	},
};

/**
 * Disabled state - dropdown cannot be interacted with
 */
export const Disabled: Story = {
	args: {
		currentStatus: 'pending',
		onChange: fn(),
		disabled: true,
	},
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
	args: {
		currentStatus: 'in-review',
		onChange: fn(),
		size: 'small',
	},
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
	args: {
		currentStatus: 'completed',
		onChange: fn(),
		size: 'large',
	},
};

/**
 * Interactive demo showing all status options
 */
export const Interactive: Story = {
	args: {
		currentStatus: 'pending',
		onChange: fn(),
	},
	parameters: {
		docs: {
			description: {
				story:
					'Try selecting different status options. Forward changes (Pending → In Review) happen immediately. Backward changes (Completed → Pending) show a confirmation modal.',
			},
		},
	},
};

/**
 * All statuses displayed for comparison
 */
export const AllStatuses: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
			<StatusDropdown currentStatus="pending" onChange={fn()} />
			<StatusDropdown currentStatus="in-review" onChange={fn()} />
			<StatusDropdown currentStatus="completed" onChange={fn()} />
			<StatusDropdown currentStatus="archived" onChange={fn()} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all four status options',
			},
		},
	},
};

/**
 * All sizes displayed for comparison
 */
export const AllSizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
			<StatusDropdown currentStatus="in-review" onChange={fn()} size="small" />
			<StatusDropdown currentStatus="in-review" onChange={fn()} size="middle" />
			<StatusDropdown currentStatus="in-review" onChange={fn()} size="large" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all three size variants',
			},
		},
	},
};
