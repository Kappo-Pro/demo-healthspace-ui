/**
 * EmptyStateMessage Storybook Stories
 *
 * Demonstrates all variants and states of the EmptyStateMessage component.
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { EmptyStateMessage } from './EmptyStateMessage';
import { HeartOutlined } from '@ant-design/icons';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof EmptyStateMessage> = {
	title: 'Atoms/EmptyStateMessage',
	component: EmptyStateMessage,
	tags: ['autodocs'],
	argTypes: {
		title: {
			control: 'text',
			description: 'Main title message',
		},
		description: {
			control: 'text',
			description: 'Descriptive text',
		},
		type: {
			control: 'select',
			options: ['no-data', 'no-results', 'error', 'permission-denied'],
			description: 'Empty state type (affects default icon)',
		},
		icon: {
			control: false,
			description: 'Custom icon (overrides default)',
		},
		cta: {
			control: 'object',
			description: 'Call-to-action configuration',
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
A versatile empty state component for displaying "no data" scenarios.

### Features
- **4 Empty State Types**: no-data, no-results, error, permission-denied
- **Default Icons**: Type-specific icons with semantic colors
- **Custom Icons**: Override default with custom icon components
- **Call-to-Action**: Optional button with primary/secondary variants
- **Responsive**: Adapts to mobile and desktop layouts
- **Accessible**: ARIA labels and live regions

### Empty State Types
- **no-data**: Default state when no data exists
- **no-results**: When search/filter returns empty results
- **error**: When an error prevents data display
- **permission-denied**: When user lacks access permissions

### Usage
\`\`\`tsx
<EmptyStateMessage
  title="No assessments yet"
  description="Complete your first posture assessment to see results here"
  type="no-data"
  cta={{
    label: 'Start Assessment',
    onClick: () => navigate('/assessment')
  }}
/>
\`\`\`
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof EmptyStateMessage>;

// ============================================================================
// STORIES - Empty State Types
// ============================================================================

/**
 * No data state (default)
 */
export const NoData: Story = {
	args: {
		title: 'No assessments yet',
		description: 'Complete your first posture assessment to see results here',
		type: 'no-data',
	},
};

/**
 * No results from search/filter
 */
export const NoResults: Story = {
	args: {
		title: 'No results found',
		description: 'Try adjusting your search criteria or filters',
		type: 'no-results',
	},
};

/**
 * Error state
 */
export const ErrorState: Story = {
	args: {
		title: 'Unable to load data',
		description:
			'Something went wrong while fetching assessments. Please try again.',
		type: 'error',
	},
};

/**
 * Permission denied state
 */
export const PermissionDenied: Story = {
	args: {
		title: 'Access restricted',
		description:
			"You don't have permission to view this content. Contact your administrator.",
		type: 'permission-denied',
	},
};

// ============================================================================
// STORIES - With Call-to-Action
// ============================================================================

/**
 * With primary CTA button
 */
export const WithPrimaryCTA: Story = {
	args: {
		title: 'No programs assigned',
		description: 'Start by creating your first rehabilitation program',
		type: 'no-data',
		cta: {
			label: 'Create Program',
			variant: 'primary',
		},
	},
};

/**
 * With secondary CTA button
 */
export const WithSecondaryCTA: Story = {
	args: {
		title: 'No recent activity',
		description:
			'Your activity feed will appear here once you start using the platform',
		type: 'no-data',
		cta: {
			label: 'View Archive',
			variant: 'secondary',
		},
	},
};

// ============================================================================
// STORIES - Custom Icons
// ============================================================================

/**
 * With custom icon
 */
export const CustomIcon: Story = {
	args: {
		title: 'No favorites yet',
		description: 'Mark exercises as favorites to quickly access them later',
		type: 'no-data',
		icon: <HeartOutlined />,
	},
};

/**
 * Without icon
 */
export const WithoutIcon: Story = {
	args: {
		title: 'Minimal empty state',
		description: 'Sometimes less is more',
		icon: null,
	},
};

// ============================================================================
// STORIES - Context Examples
// ============================================================================

/**
 * Patient dashboard (no assessments)
 */
export const PatientDashboardEmpty: Story = {
	args: {
		title: 'Welcome to your dashboard',
		description:
			'Get started by completing your first posture assessment. It only takes 5 minutes!',
		type: 'no-data',
		cta: {
			label: 'Start First Assessment',
			variant: 'primary',
		},
	},
};

/**
 * Admin triage (no patients requiring review)
 */
export const AdminTriageEmpty: Story = {
	args: {
		title: 'All caught up!',
		description: 'No patients require review at this time. Great work!',
		type: 'no-data',
	},
};

/**
 * Search results empty
 */
export const SearchResultsEmpty: Story = {
	args: {
		title: 'No patients match your search',
		description: 'Try using different keywords or check for typos',
		type: 'no-results',
		cta: {
			label: 'Clear Filters',
			variant: 'secondary',
		},
	},
};

/**
 * Error loading patient data
 */
export const LoadingError: Story = {
	args: {
		title: 'Failed to load patient data',
		description:
			'We encountered an error while fetching the data. Please refresh the page or try again later.',
		type: 'error',
		cta: {
			label: 'Retry',
			variant: 'primary',
		},
	},
};

/**
 * Insufficient permissions
 */
export const InsufficientPermissions: Story = {
	args: {
		title: 'Access denied',
		description:
			'You need admin privileges to view patient triage dashboard. Contact your administrator for access.',
		type: 'permission-denied',
		cta: {
			label: 'Request Access',
			variant: 'primary',
		},
	},
};

// ============================================================================
// STORIES - In Containers
// ============================================================================

/**
 * In card container
 */
export const InCardContainer: Story = {
	render: () => (
		<div
			style={{
				border: '1px solid var(--border-primary, #e0e0e0)',
				borderRadius: '12px',
				overflow: 'hidden',
				maxWidth: '600px',
			}}>
			<div
				style={{
					padding: '16px 20px',
					borderBottom: '1px solid var(--border-secondary, #f0f0f0)',
					background: 'var(--surface-primary, #fff)',
				}}>
				<h3 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
					Recent Assessments
				</h3>
			</div>
			<EmptyStateMessage
				title="No recent assessments"
				description="Your assessment history will appear here"
				type="no-data"
				cta={{
					label: 'Take Assessment',
				}}
			/>
		</div>
	),
};

/**
 * In table (no rows)
 */
export const InTableContext: Story = {
	render: () => (
		<div
			style={{
				border: '1px solid var(--border-primary, #e0e0e0)',
				borderRadius: '8px',
			}}>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr
						style={{
							borderBottom: '2px solid var(--border-primary, #e0e0e0)',
						}}>
						<th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Patient</th>
						<th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Status</th>
						<th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Score</th>
						<th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Date</th>
					</tr>
				</thead>
			</table>
			<div className="empty-state-message--small">
				<EmptyStateMessage
					title="No patients found"
					description="Adjust filters to see results"
					type="no-results"
				/>
			</div>
		</div>
	),
};

/**
 * Compact variant for sidebar/widget
 */
export const CompactVariant: Story = {
	render: () => (
		<div
			style={{
				width: '300px',
				border: '1px solid var(--border-primary, #e0e0e0)',
				borderRadius: '8px',
				padding: 'var(--spacing-4)',
			}}>
			<EmptyStateMessage
				title="No alerts"
				description="All systems normal"
				type="no-data"
				className="empty-state-message--small"
			/>
		</div>
	),
};

/**
 * Multiple empty states comparison
 */
export const AllTypes: Story = {
	render: () => (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(2, 1fr)',
				gap: 'var(--spacing-6)',
			}}>
			<div
				style={{
					border: '1px solid #e0e0e0',
					borderRadius: '8px',
					padding: 'var(--spacing-4)',
				}}>
				<EmptyStateMessage
					title="No Data"
					description="Default empty state"
					type="no-data"
				/>
			</div>
			<div
				style={{
					border: '1px solid #e0e0e0',
					borderRadius: '8px',
					padding: 'var(--spacing-4)',
				}}>
				<EmptyStateMessage
					title="No Results"
					description="Search returned nothing"
					type="no-results"
				/>
			</div>
			<div
				style={{
					border: '1px solid #e0e0e0',
					borderRadius: '8px',
					padding: 'var(--spacing-4)',
				}}>
				<EmptyStateMessage
					title="Error"
					description="Something went wrong"
					type="error"
				/>
			</div>
			<div
				style={{
					border: '1px solid #e0e0e0',
					borderRadius: '8px',
					padding: 'var(--spacing-4)',
				}}>
				<EmptyStateMessage
					title="Access Denied"
					description="Insufficient permissions"
					type="permission-denied"
				/>
			</div>
		</div>
	),
};
