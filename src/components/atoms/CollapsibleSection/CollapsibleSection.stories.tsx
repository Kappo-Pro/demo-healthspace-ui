/**
 * CollapsibleSection Storybook Stories
 *
 * Demonstrates all variants and interaction states of the CollapsibleSection component.
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { CollapsibleSection } from './index';
import { useState } from 'react';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof CollapsibleSection> = {
	title: 'Atoms/CollapsibleSection',
	component: CollapsibleSection,
	tags: ['autodocs'],
	argTypes: {
		defaultExpanded: {
			control: 'boolean',
			description: 'Whether the section is expanded by default',
		},
		title: {
			control: 'text',
			description: 'Section title',
		},
		sectionId: {
			control: 'text',
			description: 'Optional ID for ARIA and persistence',
		},
		className: {
			control: 'text',
			description: 'Optional custom CSS class',
		},
		onToggle: {
			action: 'toggled',
			description: 'Callback fired when section is toggled',
		},
	},
	parameters: {
		docs: {
			description: {
				component: `
A collapsible section component with smooth animations and full keyboard support.

### Features
- **Smooth animations**: 300ms transition with GPU acceleration
- **Keyboard navigation**: Full support for Enter, Space, and Escape keys
- **Accessibility**: Complete ARIA attributes and screen reader support
- **Responsive**: Works on all screen sizes
- **Themeable**: Uses design system tokens

### Keyboard Shortcuts
- \`Enter\` or \`Space\`: Toggle expand/collapse
- \`Escape\`: Collapse section (when expanded)
- \`Tab\`: Move focus to/from header

### Accessibility
- Proper ARIA attributes (aria-expanded, aria-controls, aria-hidden)
- Keyboard accessible with visible focus indicators
- Screen reader announcements for state changes
- role="region" for content area
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default expanded state
 * Note: In actual usage, use translation keys: t('Patient.data.newDashboard.myPrograms')
 */
export const Expanded: Story = {
	args: {
		title: 'My Programs',
		defaultExpanded: true,
		children: (
			<div
				style={{ padding: 'var(--spacing-4)', background: '#f5f5f5', borderRadius: '4px' }}>
				<p style={{ margin: 0, marginBottom: 'var(--spacing-2)' }}>
					This section is expanded by default.
				</p>
				<p style={{ margin: 0 }}>
					Click the header or press Enter/Space to collapse it.
				</p>
			</div>
		),
	},
};

/**
 * Default collapsed state
 */
export const Collapsed: Story = {
	args: {
		title: 'Recent Activity',
		defaultExpanded: false,
		children: (
			<div
				style={{ padding: 'var(--spacing-4)', background: '#f5f5f5', borderRadius: '4px' }}>
				<p style={{ margin: 0 }}>
					This section is collapsed by default. Click the header to expand it.
				</p>
			</div>
		),
	},
};

/**
 * With long scrollable content
 */
export const WithLongContent: Story = {
	args: {
		title: 'Program Details',
		defaultExpanded: true,
		children: (
			<div
				style={{ padding: 'var(--spacing-4)', background: '#f5f5f5', borderRadius: '4px' }}>
				<h4 style={{ marginTop: 0 }}>Exercise List</h4>
				{Array.from({ length: 15 }, (_, i) => (
					<div
						key={i}
						style={{
							padding: 'var(--spacing-3)',
							marginBottom: 'var(--spacing-2)',
							background: 'white',
							borderRadius: '4px',
							border: '1px solid #e0e0e0',
						}}>
						<strong>Exercise {i + 1}:</strong> Sample exercise description with
						details about sets, reps, and duration.
					</div>
				))}
			</div>
		),
	},
};

/**
 * With rich content (cards, images, etc.)
 */
export const WithRichContent: Story = {
	args: {
		title: 'Dashboard Overview',
		defaultExpanded: true,
		children: (
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: 'var(--spacing-4)',
				}}>
				<div
					style={{
						padding: 'var(--spacing-4)',
						background: '#fff',
						border: '1px solid #e0e0e0',
						borderRadius: '8px',
					}}>
					<h4 style={{ marginTop: 0, color: '#722ed1' }}>Active Programs</h4>
					<p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
						12
					</p>
					<p style={{ margin: 0, color: '#666' }}>3 new this week</p>
				</div>
				<div
					style={{
						padding: 'var(--spacing-4)',
						background: '#fff',
						border: '1px solid #e0e0e0',
						borderRadius: '8px',
					}}>
					<h4 style={{ marginTop: 0, color: '#722ed1' }}>Completed Sessions</h4>
					<p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
						47
					</p>
					<p style={{ margin: 0, color: '#666' }}>5 this week</p>
				</div>
			</div>
		),
	},
};

/**
 * Multiple collapsible sections (accordion-like)
 */
export const MultipleSections: Story = {
	render: () => (
		<div>
			<CollapsibleSection title="Personal Information" defaultExpanded={true}>
				<div
					style={{
						padding: 'var(--spacing-4)',
						background: '#f5f5f5',
						borderRadius: '4px',
					}}>
					<p style={{ margin: 0 }}>Name: John Doe</p>
					<p style={{ margin: '8px 0 0 0' }}>Email: john.doe@example.com</p>
				</div>
			</CollapsibleSection>

			<CollapsibleSection title="Medical History" defaultExpanded={false}>
				<div
					style={{
						padding: 'var(--spacing-4)',
						background: '#f5f5f5',
						borderRadius: '4px',
					}}>
					<p style={{ margin: 0 }}>
						Previous injuries, conditions, and treatments...
					</p>
				</div>
			</CollapsibleSection>

			<CollapsibleSection title="Current Programs" defaultExpanded={false}>
				<div
					style={{
						padding: 'var(--spacing-4)',
						background: '#f5f5f5',
						borderRadius: '4px',
					}}>
					<p style={{ margin: 0 }}>Active rehabilitation programs...</p>
				</div>
			</CollapsibleSection>
		</div>
	),
};

/**
 * With custom styling
 */
export const CustomStyled: Story = {
	args: {
		title: 'Custom Styled Section',
		defaultExpanded: true,
		className: 'custom-section',
		children: (
			<div
				style={{
					padding: 'var(--spacing-6)',
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					color: 'var(--text-on-dark)',
					borderRadius: '8px',
				}}>
				<h4 style={{ marginTop: 0, color: 'var(--text-on-dark)' }}>
					Premium Content
				</h4>
				<p style={{ margin: 0 }}>This section has custom styling applied.</p>
			</div>
		),
	},
};

/**
 * Interactive controlled example with state
 */
export const ControlledWithState: Story = {
	render: () => {
		const [isExpanded, setIsExpanded] = useState(true);
		const [toggleCount, setToggleCount] = useState(0);

		const handleToggle = (expanded: boolean) => {
			setIsExpanded(expanded);
			setToggleCount(prev => prev + 1);
		};

		return (
			<div>
				<div
					style={{
						padding: 'var(--spacing-4)',
						background: '#f0f0f0',
						borderRadius: '4px',
						marginBottom: 'var(--spacing-4)',
					}}>
					<p style={{ margin: 0 }}>
						<strong>Current State:</strong>{' '}
						{isExpanded ? 'Expanded' : 'Collapsed'}
					</p>
					<p style={{ margin: '8px 0 0 0' }}>
						<strong>Toggle Count:</strong> {toggleCount}
					</p>
				</div>

				<CollapsibleSection
					title="Controlled Section"
					defaultExpanded={isExpanded}
					onToggle={handleToggle}>
					<div
						style={{
							padding: 'var(--spacing-4)',
							background: '#f5f5f5',
							borderRadius: '4px',
						}}>
						<p style={{ margin: 0 }}>
							This section demonstrates controlled behavior with state tracking.
						</p>
						<p style={{ margin: '8px 0 0 0' }}>
							The toggle count and current state are displayed above.
						</p>
					</div>
				</CollapsibleSection>
			</div>
		);
	},
};

/**
 * Empty content
 */
export const EmptyContent: Story = {
	args: {
		title: 'Empty Section',
		defaultExpanded: true,
		children: (
			<div
				style={{ padding: 'var(--spacing-4)', background: '#f5f5f5', borderRadius: '4px' }}>
				<p style={{ margin: 0, color: '#999', fontStyle: 'italic' }}>
					No content available
				</p>
			</div>
		),
	},
};

/**
 * Keyboard navigation playground
 */
export const KeyboardNavigationDemo: Story = {
	args: {
		title: 'Try Keyboard Navigation',
		defaultExpanded: false,
		children: (
			<div
				style={{ padding: 'var(--spacing-4)', background: '#fff3cd', borderRadius: '4px' }}>
				<h4 style={{ marginTop: 0 }}>Keyboard Shortcuts:</h4>
				<ul style={{ margin: 0, paddingLeft: 'var(--spacing-5)' }}>
					<li>
						<code
							style={{
								background: '#f5f5f5',
								padding: '2px 6px',
								borderRadius: '3px',
							}}>
							Tab
						</code>
						: Focus the header
					</li>
					<li>
						<code
							style={{
								background: '#f5f5f5',
								padding: '2px 6px',
								borderRadius: '3px',
							}}>
							Enter
						</code>{' '}
						or{' '}
						<code
							style={{
								background: '#f5f5f5',
								padding: '2px 6px',
								borderRadius: '3px',
							}}>
							Space
						</code>
						: Toggle expand/collapse
					</li>
					<li>
						<code
							style={{
								background: '#f5f5f5',
								padding: '2px 6px',
								borderRadius: '3px',
							}}>
							Escape
						</code>
						: Collapse (when expanded)
					</li>
				</ul>
			</div>
		),
	},
};
