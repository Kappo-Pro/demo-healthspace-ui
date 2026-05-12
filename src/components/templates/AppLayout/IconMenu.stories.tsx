/**
 * IconMenu Storybook Stories
 *
 * Visual documentation and testing for tier 1 icon navigation.
 */

import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react-webpack5';
import { IconMenu } from './IconMenu';
import { UntitledIcon } from '@atoms/Icon';
import { NavigationItem } from '@components/layouts/AppLayout/types';

const meta: Meta<typeof IconMenu> = {
	title: 'Templates/AppLayout/IconMenu',
	component: IconMenu,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Tier 1 navigation: vertical icon-only menu with no background. Icons render directly on page background with badge support and theme-aware styling.',
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IconMenu>;

// Sample navigation items
const sampleItems: NavigationItem[] = [
	{
		id: 'dashboard',
		label: 'Dashboard',
		icon: <UntitledIcon name="home" size="medium" />,
		path: '/',
	},
	{
		id: 'patients',
		label: 'Patients',
		icon: <UntitledIcon name="users" size="medium" />,
		children: [
			{ id: 'all-patients', label: 'All Patients', icon: null, path: '/patients' },
			{ id: 'new-patients', label: 'New Patients', icon: null, path: '/patients/new' },
		],
	},
	{
		id: 'messages',
		label: 'Messages',
		icon: <UntitledIcon name="mail" size="medium" />,
		badge: 5,
		path: '/messages',
	},
	{
		id: 'settings',
		label: 'Settings',
		icon: <UntitledIcon name="settings" size="medium" />,
		path: '/settings',
	},
];

// Interactive wrapper component
const IconMenuDemo = (args: typeof IconMenu.arguments) => {
	const [selectedKey, setSelectedKey] = useState('dashboard');

	const handleSelect = (key: string, _item: NavigationItem) => {
		setSelectedKey(key);
	};

	return (
		<div style={{ padding: 'var(--spacing-md)', minHeight: 'var(--spacing-xxl)', backgroundColor: 'var(--background-primary)' }}>
			<IconMenu {...args} selectedKey={selectedKey} onSelect={handleSelect} />
		</div>
	);
};

/**
 * Default tier 1 navigation with 4 icons
 */
export const Default: Story = {
	render: (args) => <IconMenuDemo {...args} />,
	args: {
		items: sampleItems,
	},
};

/**
 * With badge counts on multiple items
 */
export const WithBadges: Story = {
	render: (args) => <IconMenuDemo {...args} />,
	args: {
		items: sampleItems,
		badges: {
			patients: 12,
			messages: 5,
		},
	},
};

/**
 * With disabled item
 */
export const WithDisabled: Story = {
	render: (args) => <IconMenuDemo {...args} />,
	args: {
		items: [
			...sampleItems,
			{
				id: 'reports',
				label: 'Reports (Coming Soon)',
				icon: <UntitledIcon name="fileText" size="medium" />,
				disabled: true,
			},
		],
	},
};

/**
 * Dark theme (simulated)
 */
export const DarkTheme: Story = {
	render: (args) => <IconMenuDemo {...args} />,
	args: {
		items: sampleItems,
		badges: {
			messages: 3,
		},
	},
	parameters: {
		backgrounds: { default: 'dark' },
	},
	decorators: [
		(Story) => (
			<div data-theme="dark" style={{ backgroundColor: 'var(--background-primary)', padding: 'var(--spacing-md)', minHeight: 'var(--spacing-xxl)' }}>
				<Story />
			</div>
		),
	],
};

/**
 * Light theme (simulated)
 */
export const LightTheme: Story = {
	render: (args) => <IconMenuDemo {...args} />,
	args: {
		items: sampleItems,
		badges: {
			messages: 3,
		},
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
	decorators: [
		(Story) => (
			<div data-theme="light" style={{ backgroundColor: 'var(--background-primary)', padding: 'var(--spacing-md)', minHeight: 'var(--spacing-xxl)' }}>
				<Story />
			</div>
		),
	],
};
