/**
 * UntitledIcon Storybook Stories
 *
 * Interactive documentation and examples for the UntitledIcon component.
 * Phase 1 Registry Expansion - November 2025
 */
import type { Meta, StoryObj } from '@storybook/react';
import { UntitledIcon } from './UntitledIcon';
import { IconRegistry } from './iconRegistry';
import type { IconName } from './types';

const meta = {
	title: 'Design System/Atoms/Icon/UntitledIcon',
	component: UntitledIcon,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `
# UntitledIcon Component

Type-safe icon component using Untitled UI Icons library with Ant Design integration.

## Features
- 110+ icons from Untitled UI Icons
- Type-safe icon names (autocomplete support)
- Flexible sizing (predefined or custom pixels)
- Color customization
- Accessibility built-in
- Ant Design compatibility

## Import
\`\`\`tsx
import { UntitledIcon } from '@atoms/Icon';
\`\`\`

## Usage
\`\`\`tsx
<UntitledIcon name="search" size="medium" />
<UntitledIcon name="user" size={24} color="var(--brand-primary)" />
<UntitledIcon name="close" aria-label="Close dialog" onClick={handleClose} />
\`\`\`
				`,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		name: {
			control: 'select',
			options: Object.keys(IconRegistry),
			description: 'Icon name from registry (type-safe)',
		},
		size: {
			control: 'select',
			options: ['small', 'medium', 'large', 'xlarge', 16, 20, 24, 32],
			description: 'Icon size (predefined or custom pixels)',
		},
		color: {
			control: 'color',
			description: 'Icon color (CSS color value)',
		},
		className: {
			control: 'text',
			description: 'Additional CSS class names',
		},
		'aria-label': {
			control: 'text',
			description: 'Accessibility label for screen readers',
		},
	},
} satisfies Meta<typeof UntitledIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// PRIMARY STORY
// ========================================
export const Default: Story = {
	args: {
		name: 'search',
		size: 'medium',
	},
};

// ========================================
// ICON GALLERY - ALL 110+ ICONS
// ========================================
export const IconGallery: Story = {
	render: () => {
		const iconNames = Object.keys(IconRegistry) as IconName[];

		// Categorize icons for organized display
		const categories = {
			Navigation: iconNames.filter(name =>
				['arrow', 'chevron', 'home', 'global', 'left', 'right'].some(keyword =>
					name.toLowerCase().includes(keyword)
				)
			),
			Actions: iconNames.filter(name =>
				['check', 'close', 'copy', 'delete', 'trash', 'download', 'edit', 'plus', 'reload', 'refresh', 'save', 'search', 'share', 'undo', 'upload', 'x'].some(keyword =>
					name.toLowerCase().includes(keyword)
				)
			),
			Status: iconNames.filter(name =>
				['circle', 'info', 'alert', 'warning', 'loading', 'loader', 'trophy', 'smile', 'heart'].some(keyword =>
					name.toLowerCase().includes(keyword)
				)
			),
			'UI Elements': iconNames.filter(name =>
				['user', 'users', 'menu', 'settings', 'bell', 'eye', 'lock', 'unlock', 'filter', 'calendar', 'clock', 'list', 'sort'].some(keyword =>
					name.toLowerCase().includes(keyword)
				)
			),
			'Media & Files': iconNames.filter(name =>
				['camera', 'play', 'file', 'mic', 'audio', 'volume'].some(keyword =>
					name.toLowerCase().includes(keyword)
				)
			),
			'UI Components': iconNames.filter(name =>
				['drag', 'holder', 'table', 'font', 'moon', 'sun', 'project', 'folder'].some(keyword =>
					name.toLowerCase().includes(keyword)
				)
			),
			'Integration & Technical': iconNames.filter(name =>
				['api', 'code', 'key', 'mail', 'paperclip', 'rocket', 'lightning', 'clear', 'fire', 'zap'].some(keyword =>
					name.toLowerCase().includes(keyword)
				)
			),
		};

		return (
			<div style={{ fontFamily: 'system-ui, sans-serif' }}>
				<h2 style={{ marginBottom: 'var(--spacing-8)', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)' }}>
					Icon Gallery - {iconNames.length} Icons
				</h2>

				{Object.entries(categories).map(([category, icons]) => (
					<div key={category} style={{ marginBottom: 'var(--spacing-12)' }}>
						<h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary, #666)' }}>
							{category} ({icons.length})
						</h3>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
								gap: 'var(--spacing-4)',
								padding: 'var(--spacing-4)',
								backgroundColor: 'var(--bg-secondary, #f5f5f5)',
								borderRadius: '8px',
							}}
						>
							{icons.map(iconName => (
								<div
									key={iconName}
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: 'var(--spacing-2)',
										padding: 'var(--spacing-4)',
										backgroundColor: 'white',
										borderRadius: '6px',
										border: '1px solid var(--border-primary, #e0e0e0)',
										transition: 'all 0.2s',
										cursor: 'pointer',
									}}
									onMouseEnter={e => {
										e.currentTarget.style.transform = 'translateY(-2px)';
										e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
									}}
									onMouseLeave={e => {
										e.currentTarget.style.transform = 'translateY(0)';
										e.currentTarget.style.boxShadow = 'none';
									}}
									onClick={() => {
										navigator.clipboard.writeText(`<UntitledIcon name="${iconName}" />`);
										alert(`Copied: <UntitledIcon name="${iconName}" />`);
									}}
									title={`Click to copy: <UntitledIcon name="${iconName}" />`}
								>
									<UntitledIcon name={iconName} size="large" />
									<span
										style={{
											fontSize: 'var(--font-size-xs)',
											color: 'var(--text-tertiary, #999)',
											textAlign: 'center',
											wordBreak: 'break-word',
										}}
									>
										{iconName}
									</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Complete icon gallery showing all 110+ available icons organized by category. Click any icon to copy its usage code.',
			},
		},
	},
};

// ========================================
// SIZE VARIANTS
// ========================================
export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center', flexWrap: 'wrap' }}>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="home" size="small" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>small (14px)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="home" size="medium" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>medium (16px)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="home" size="large" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>large (20px)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="home" size="xlarge" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>xlarge (24px)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="home" size={32} />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>custom (32px)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="home" size={48} />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>custom (48px)</p>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Icon size variants: predefined sizes (small, medium, large, xlarge) and custom pixel values.',
			},
		},
	},
};

// ========================================
// COLOR VARIANTS
// ========================================
export const Colors: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center', flexWrap: 'wrap' }}>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="heart" size="xlarge" color="currentColor" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>currentColor</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="heart" size="xlarge" color="#ef4444" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>red (#ef4444)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="heart" size="xlarge" color="#3b82f6" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>blue (#3b82f6)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="heart" size="xlarge" color="#10b981" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>green (#10b981)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="heart" size="xlarge" color="#f59e0b" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>orange (#f59e0b)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="heart" size="xlarge" color="#8b5cf6" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>purple (#8b5cf6)</p>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Icons can be colored using CSS color values (hex, rgb, CSS variables, etc.).',
			},
		},
	},
};

// ========================================
// INTERACTIVE STATES
// ========================================
export const States: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center', flexWrap: 'wrap' }}>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="settings" size="xlarge" />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>default</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon
					name="settings"
					size="xlarge"
					style={{ cursor: 'pointer' }}
					onClick={() => alert('Icon clicked!')}
				/>
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>clickable (hover me)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<UntitledIcon name="settings" size="xlarge" style={{ opacity: 0.5 }} />
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>disabled (opacity: 0.5)</p>
			</div>
			<div style={{ textAlign: 'center' }}>
				<div
					style={{
						display: 'inline-flex',
						padding: 'var(--spacing-2)',
						borderRadius: '4px',
						backgroundColor: '#f0f0f0',
						cursor: 'pointer',
						transition: 'all 0.2s',
					}}
					onMouseEnter={e => {
						e.currentTarget.style.backgroundColor = '#e0e0e0';
					}}
					onMouseLeave={e => {
						e.currentTarget.style.backgroundColor = '#f0f0f0';
					}}
				>
					<UntitledIcon name="settings" size="xlarge" />
				</div>
				<p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)', color: '#666' }}>button (hover me)</p>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Icons in different interactive states: default, clickable, disabled, and as buttons.',
			},
		},
	},
};

// ========================================
// ACCESSIBILITY
// ========================================
export const Accessibility: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', maxWidth: '600px' }}>
			<div>
				<h3 style={{ marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>Decorative Icon (hidden from screen readers)</h3>
				<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
					<UntitledIcon name="user" aria-hidden="true" />
					<span>John Doe</span>
				</div>
				<code style={{ fontSize: 'var(--font-size-xs)', color: '#666', marginTop: 'var(--spacing-1)', display: 'block' }}>
					{`<UntitledIcon name="user" aria-hidden="true" />`}
				</code>
			</div>

			<div>
				<h3 style={{ marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>Icon with Label (accessible)</h3>
				<button
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 'var(--spacing-2)',
						padding: '0.5rem 1rem',
						border: '1px solid #ddd',
						borderRadius: '4px',
						background: 'white',
						cursor: 'pointer',
					}}
				>
					<UntitledIcon name="search" aria-label="Search" />
					<span>Search</span>
				</button>
				<code style={{ fontSize: 'var(--font-size-xs)', color: '#666', marginTop: 'var(--spacing-1)', display: 'block' }}>
					{`<UntitledIcon name="search" aria-label="Search" />`}
				</code>
			</div>

			<div>
				<h3 style={{ marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>Icon-only Button (requires aria-label)</h3>
				<button
					style={{
						padding: 'var(--spacing-2)',
						border: '1px solid #ddd',
						borderRadius: '4px',
						background: 'white',
						cursor: 'pointer',
					}}
				>
					<UntitledIcon name="close" aria-label="Close dialog" />
				</button>
				<code style={{ fontSize: 'var(--font-size-xs)', color: '#666', marginTop: 'var(--spacing-1)', display: 'block' }}>
					{`<UntitledIcon name="close" aria-label="Close dialog" />`}
				</code>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Proper accessibility patterns for icons: decorative (hidden), with labels, and icon-only buttons.',
			},
		},
	},
};

// ========================================
// COMMON USE CASES
// ========================================
export const UseCases: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
			{/* Navigation */}
			<div>
				<h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-base)' }}>Navigation</h3>
				<div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
					<button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="arrowLeft" />
						<span>Back</span>
					</button>
					<button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<span>Next</span>
						<UntitledIcon name="arrowRight" />
					</button>
					<button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="home" />
						<span>Home</span>
					</button>
				</div>
			</div>

			{/* Actions */}
			<div>
				<h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-base)' }}>Actions</h3>
				<div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
					<button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="plus" />
						<span>Add</span>
					</button>
					<button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="edit" />
						<span>Edit</span>
					</button>
					<button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="delete" />
						<span>Delete</span>
					</button>
					<button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="download" />
						<span>Download</span>
					</button>
					<button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="share" />
						<span>Share</span>
					</button>
				</div>
			</div>

			{/* Status Indicators */}
			<div>
				<h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-base)' }}>Status Indicators</h3>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="checkCircle" color="#10b981" />
						<span>Success: Operation completed</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="alertTriangle" color="#f59e0b" />
						<span>Warning: Please review</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="xCircle" color="#ef4444" />
						<span>Error: Operation failed</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
						<UntitledIcon name="info" color="#3b82f6" />
						<span>Info: Additional information</span>
					</div>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Common icon usage patterns in navigation, actions, and status indicators.',
			},
		},
	},
};
