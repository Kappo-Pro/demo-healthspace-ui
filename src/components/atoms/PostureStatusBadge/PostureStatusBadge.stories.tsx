/**
 * PostureStatusBadge Storybook Stories
 *
 * Demonstrates all variants and states of the PostureStatusBadge component.
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PostureStatusBadge } from './PostureStatusBadge';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof PostureStatusBadge> = {
	title: 'Atoms/PostureStatusBadge',
	component: PostureStatusBadge,
	tags: ['autodocs'],
	argTypes: {
		status: {
			control: 'select',
			options: ['excellent', 'good', 'fair', 'poor', 'critical'],
			description: 'Posture assessment status level',
		},
		showIcon: {
			control: 'boolean',
			description: 'Show icon next to status label',
		},
		size: {
			control: 'select',
			options: ['small', 'default', 'large'],
			description: 'Badge size variant',
		},
		className: {
			control: 'text',
			description: 'Additional CSS class',
		},
	},
	parameters: {
		docs: {
			description: {
				component: `
A status badge component for displaying posture assessment results.

### Features
- **5 Status Levels**: Excellent, Good, Fair, Poor, Critical
- **Color-Coded**: Semantic colors using design system tokens
- **Icons**: Optional status icons for visual clarity
- **Sizes**: Small, Default, Large variants
- **Accessible**: ARIA labels and semantic HTML
- **Theme-Aware**: Supports light/dark mode

### Status Levels
- **Excellent** (90-100%): Green checkmark - optimal posture
- **Good** (70-89%): Green smile - minor improvements possible
- **Fair** (50-69%): Yellow meh - moderate issues detected
- **Poor** (30-49%): Red frown - significant issues
- **Critical** (<30%): Red warning - immediate attention required

### Usage
\`\`\`tsx
<PostureStatusBadge status="excellent" />
<PostureStatusBadge status="poor" showIcon={false} />
<PostureStatusBadge status="critical" size="large" />
\`\`\`
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof PostureStatusBadge>;

// ============================================================================
// STORIES - Status Variants
// ============================================================================

/**
 * Excellent status - optimal posture (90-100%)
 */
export const Excellent: Story = {
	args: {
		status: 'excellent',
		showIcon: true,
		size: 'default',
	},
};

/**
 * Good status - minor improvements possible (70-89%)
 */
export const Good: Story = {
	args: {
		status: 'good',
		showIcon: true,
		size: 'default',
	},
};

/**
 * Fair status - moderate issues detected (50-69%)
 */
export const Fair: Story = {
	args: {
		status: 'fair',
		showIcon: true,
		size: 'default',
	},
};

/**
 * Poor status - significant issues (30-49%)
 */
export const Poor: Story = {
	args: {
		status: 'poor',
		showIcon: true,
		size: 'default',
	},
};

/**
 * Critical status - immediate attention required (<30%)
 */
export const Critical: Story = {
	args: {
		status: 'critical',
		showIcon: true,
		size: 'default',
	},
};

// ============================================================================
// STORIES - Size Variants
// ============================================================================

/**
 * Small size variant
 */
export const SmallSize: Story = {
	args: {
		status: 'good',
		showIcon: true,
		size: 'small',
	},
};

/**
 * Default size variant
 */
export const DefaultSize: Story = {
	args: {
		status: 'good',
		showIcon: true,
		size: 'default',
	},
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
	args: {
		status: 'good',
		showIcon: true,
		size: 'large',
	},
};

// ============================================================================
// STORIES - Icon Variants
// ============================================================================

/**
 * With icon (default)
 */
export const WithIcon: Story = {
	args: {
		status: 'excellent',
		showIcon: true,
		size: 'default',
	},
};

/**
 * Without icon
 */
export const WithoutIcon: Story = {
	args: {
		status: 'excellent',
		showIcon: false,
		size: 'default',
	},
};

// ============================================================================
// STORIES - Composite Examples
// ============================================================================

/**
 * All status levels comparison
 */
export const AllStatuses: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
			<PostureStatusBadge status="excellent" />
			<PostureStatusBadge status="good" />
			<PostureStatusBadge status="fair" />
			<PostureStatusBadge status="poor" />
			<PostureStatusBadge status="critical" />
		</div>
	),
};

/**
 * All sizes comparison
 */
export const AllSizes: Story = {
	render: () => (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 'var(--spacing-4)',
				alignItems: 'flex-start',
			}}>
			<div>
				<strong>Small:</strong>{' '}
				<PostureStatusBadge status="good" size="small" />
			</div>
			<div>
				<strong>Default:</strong>{' '}
				<PostureStatusBadge status="good" size="default" />
			</div>
			<div>
				<strong>Large:</strong>{' '}
				<PostureStatusBadge status="good" size="large" />
			</div>
		</div>
	),
};

/**
 * In table context (admin dashboard use case)
 */
export const InTableContext: Story = {
	render: () => (
		<table style={{ width: '100%', borderCollapse: 'collapse' }}>
			<thead>
				<tr
					style={{ borderBottom: '2px solid var(--border-primary, #e0e0e0)' }}>
					<th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Patient</th>
					<th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Status</th>
					<th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Score</th>
				</tr>
			</thead>
			<tbody>
				<tr
					style={{
						borderBottom: '1px solid var(--border-secondary, #f0f0f0)',
					}}>
					<td style={{ padding: 'var(--spacing-3)' }}>John Doe</td>
					<td style={{ padding: 'var(--spacing-3)' }}>
						<PostureStatusBadge status="excellent" size="small" />
					</td>
					<td style={{ padding: 'var(--spacing-3)' }}>92/100</td>
				</tr>
				<tr
					style={{
						borderBottom: '1px solid var(--border-secondary, #f0f0f0)',
					}}>
					<td style={{ padding: 'var(--spacing-3)' }}>Jane Smith</td>
					<td style={{ padding: 'var(--spacing-3)' }}>
						<PostureStatusBadge status="good" size="small" />
					</td>
					<td style={{ padding: 'var(--spacing-3)' }}>78/100</td>
				</tr>
				<tr
					style={{
						borderBottom: '1px solid var(--border-secondary, #f0f0f0)',
					}}>
					<td style={{ padding: 'var(--spacing-3)' }}>Bob Johnson</td>
					<td style={{ padding: 'var(--spacing-3)' }}>
						<PostureStatusBadge status="poor" size="small" />
					</td>
					<td style={{ padding: 'var(--spacing-3)' }}>42/100</td>
				</tr>
				<tr>
					<td style={{ padding: 'var(--spacing-3)' }}>Alice Williams</td>
					<td style={{ padding: 'var(--spacing-3)' }}>
						<PostureStatusBadge status="critical" size="small" />
					</td>
					<td style={{ padding: 'var(--spacing-3)' }}>18/100</td>
				</tr>
			</tbody>
		</table>
	),
};

/**
 * In card header context
 */
export const InCardHeader: Story = {
	render: () => (
		<div
			style={{
				border: '1px solid var(--border-primary, #e0e0e0)',
				borderRadius: '8px',
				padding: 'var(--spacing-5)',
				maxWidth: '400px',
			}}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: 'var(--spacing-4)',
				}}>
				<h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>Latest Assessment</h3>
				<PostureStatusBadge status="good" />
			</div>
			<p style={{ margin: 0, color: 'var(--text-secondary, #666)' }}>
				Completed 2 hours ago
			</p>
			<p style={{ marginTop: 'var(--spacing-3)', marginBottom: 0 }}>
				Overall Score: <strong>78/100</strong>
			</p>
		</div>
	),
};

/**
 * Loading state (skeleton)
 */
export const LoadingState: Story = {
	render: () => (
		<div
			style={{
				display: 'inline-block',
				height: 'var(--spacing-5)',
				width: 'var(--spacing-20)',
				background:
					'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
				backgroundSize: '200% 100%',
				animation: 'shimmer 1.5s infinite',
				borderRadius: '4px',
			}}
		/>
	),
};

/**
 * Error state (missing data)
 */
export const ErrorState: Story = {
	render: () => (
		<span style={{ color: 'var(--text-tertiary, #999)', fontStyle: 'italic' }}>
			Status unavailable
		</span>
	),
};
