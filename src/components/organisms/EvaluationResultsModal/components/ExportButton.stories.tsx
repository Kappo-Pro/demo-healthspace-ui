/**
 * ExportButton Storybook Stories
 *
 * Stories showcasing the ExportButton component in various states
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ExportButton } from './ExportButton';
import { fn } from '@storybook/test';

const meta: Meta<typeof ExportButton> = {
	title: 'Organisms/EvaluationResultsModal/Components/ExportButton',
	component: ExportButton,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'A button component for exporting evaluation data to PDF with loading state and disabled state handling.',
			},
		},
	},
	argTypes: {
		onClick: {
			description: 'Callback when button is clicked',
			table: {
				type: { summary: '() => void' },
			},
		},
		loading: {
			control: 'boolean',
			description: 'Show loading spinner',
		},
		disabled: {
			control: 'boolean',
			description: 'Disable button',
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
		type: {
			control: 'select',
			options: ['primary', 'default', 'dashed'],
			description: 'Button type',
			table: {
				type: { summary: "'primary' | 'default' | 'dashed'" },
				defaultValue: { summary: 'primary' },
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExportButton>;

/**
 * Default state with primary styling
 */
export const Default: Story = {
	args: {
		onClick: fn(),
	},
};

/**
 * Loading state showing export in progress
 */
export const Loading: Story = {
	args: {
		onClick: fn(),
		loading: true,
	},
};

/**
 * Disabled state with tooltip
 */
export const Disabled: Story = {
	args: {
		onClick: fn(),
		disabled: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Hover over the button to see the tooltip explaining why it is disabled.',
			},
		},
	},
};

/**
 * Default button type (non-primary)
 */
export const DefaultType: Story = {
	args: {
		onClick: fn(),
		type: 'default',
	},
};

/**
 * Dashed button type
 */
export const DashedType: Story = {
	args: {
		onClick: fn(),
		type: 'dashed',
	},
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
	args: {
		onClick: fn(),
		size: 'small',
	},
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
	args: {
		onClick: fn(),
		size: 'large',
	},
};

/**
 * Interactive demo
 */
export const Interactive: Story = {
	args: {
		onClick: fn(),
	},
	parameters: {
		docs: {
			description: {
				story:
					'Click the button to trigger the onClick callback (check the Actions panel).',
			},
		},
	},
};

/**
 * All button types displayed for comparison
 */
export const AllTypes: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
			<ExportButton onClick={fn()} type="primary" />
			<ExportButton onClick={fn()} type="default" />
			<ExportButton onClick={fn()} type="dashed" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all button types',
			},
		},
	},
};

/**
 * All sizes displayed for comparison
 */
export const AllSizes: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
			<ExportButton onClick={fn()} size="small" />
			<ExportButton onClick={fn()} size="middle" />
			<ExportButton onClick={fn()} size="large" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all size variants',
			},
		},
	},
};

/**
 * All states displayed for comparison
 */
export const AllStates: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
			<ExportButton onClick={fn()} />
			<ExportButton onClick={fn()} loading={true} />
			<ExportButton onClick={fn()} disabled={true} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of default, loading, and disabled states',
			},
		},
	},
};

/**
 * Loading state with different sizes
 */
export const LoadingStates: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
			<ExportButton onClick={fn()} loading={true} size="small" />
			<ExportButton onClick={fn()} loading={true} size="middle" />
			<ExportButton onClick={fn()} loading={true} size="large" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Loading state across different sizes',
			},
		},
	},
};
