/**
 * SeverityIndicator Storybook Stories
 *
 * Stories showcasing the SeverityIndicator component in various states
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SeverityIndicator } from './SeverityIndicator';

const meta: Meta<typeof SeverityIndicator> = {
	title: 'Organisms/EvaluationResultsModal/Components/SeverityIndicator',
	component: SeverityIndicator,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'A colored badge component that displays severity levels with appropriate colors. Uses design system tokens for WCAG AA compliant colors.',
			},
		},
	},
	argTypes: {
		level: {
			control: 'select',
			options: ['high', 'medium', 'low'],
			description: 'Severity level',
			table: {
				type: { summary: "'high' | 'medium' | 'low'" },
			},
		},
		label: {
			control: 'text',
			description: 'Optional custom label (defaults to capitalized level)',
		},
		size: {
			control: 'select',
			options: ['small', 'default', 'large'],
			description: 'Size variant',
			table: {
				type: { summary: "'small' | 'default' | 'large'" },
				defaultValue: { summary: 'default' },
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SeverityIndicator>;

/**
 * High severity indicator with red color
 */
export const High: Story = {
	args: {
		level: 'high',
	},
};

/**
 * Medium severity indicator with orange color
 */
export const Medium: Story = {
	args: {
		level: 'medium',
	},
};

/**
 * Low severity indicator with green color
 */
export const Low: Story = {
	args: {
		level: 'low',
	},
};

/**
 * Custom label example showing "Critical" instead of "High"
 */
export const CustomLabel: Story = {
	args: {
		level: 'high',
		label: 'Critical',
	},
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
	args: {
		level: 'medium',
		size: 'small',
	},
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
	args: {
		level: 'high',
		size: 'large',
	},
};

/**
 * All severity levels displayed side-by-side for comparison
 */
export const AllSeverities: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
			<SeverityIndicator level="high" />
			<SeverityIndicator level="medium" />
			<SeverityIndicator level="low" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all three severity levels',
			},
		},
	},
};

/**
 * All size variants for high severity
 */
export const AllSizes: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
			<SeverityIndicator level="high" size="small" />
			<SeverityIndicator level="high" size="default" />
			<SeverityIndicator level="high" size="large" />
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

/**
 * Custom labels for each severity level
 */
export const WithCustomLabels: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
			<SeverityIndicator level="high" label="Critical" />
			<SeverityIndicator level="medium" label="Warning" />
			<SeverityIndicator level="low" label="Normal" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Examples of custom labels',
			},
		},
	},
};
