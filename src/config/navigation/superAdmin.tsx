/**
 * Super Admin Navigation Configuration
 *
 * Two-Tier Navigation Structure:
 * - Tier 1: Icon-only menu (far left, always visible)
 * - Tier 2: Sublinks sidebar (shows when tier 1 item with children selected)
 *
 * @see docs/ux-specification.md Section 2.2
 */

import { UntitledIcon } from '@atoms/Icon';
import { NavigationConfig } from '@components/layouts/AppLayout/types';
import { router } from '@routers/routers';

/**
 * Super Admin Navigation Configuration
 *
 * Tier 1 Items (Icon Menu):
 * 1. Dashboard - Overview and key metrics
 * 2. Users - System-wide user management
 */
export const superAdminNavigationConfig: NavigationConfig = {
	primary: [
		// Tier 1: Dashboard (no children, navigates directly)
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: <UntitledIcon name="home-02" />,
			path: '/',
			shortcut: 'g h',
			roles: ['super-admin'],
		},

		// Tier 1: Users (has children, shows tier 2 sidebar)
		{
			id: 'users',
			label: 'Users',
			icon: <UntitledIcon name="user" />,
			shortcut: 'g u',
			roles: ['super-admin'],
			children: [
				{
					id: 'registered',
					label: 'All Users',
					icon: <UntitledIcon name="users" />,
					path: '/admin/patients/registered',
					badge: 0,
					badgeColor: 'success',
				},
				{
					id: 'unassigned',
					label: 'Unassigned',
					icon: <UntitledIcon name="user-x-01" />,
					path: '/admin/patients/unassigned',
					badge: 0,
					badgeColor: 'info',
				},
				{
					id: 'consent-forms',
					label: 'Legal Consent',
					icon: <UntitledIcon name="edit" />,
					path: '/admin/patients/consent-forms',
					badge: 0,
					badgeColor: 'warning',
				},
			],
		},
	],

	footer: [
		// Tier 1: Settings (has children, shows tier 2 sidebar)
		// Placed in footer to appear at bottom of icon menu
		{
			id: 'settings',
			label: 'Settings',
			icon: <UntitledIcon name="settings" />,
			shortcut: 'g s',
			roles: ['admin', 'super-admin'],
			children: [
				{
					id: 'settings-general',
					label: 'General',
					icon: <UntitledIcon name="settings" />,
					path: '/settings/general',
				},
				{
					id: 'settings-appearance',
					label: 'Appearance',
					icon: <UntitledIcon name="palette" />,
					path: '/settings/appearance',
				},
				{
					id: 'settings-integrations',
					label: 'Integrations',
					icon: <UntitledIcon name="shuffle" />,
					path: '/settings/integrations',
				},
				{
					id: 'settings-templates',
					label: 'Templates',
					icon: <UntitledIcon name="layoutAlt" />,
					path: '/settings/templates',
				},
				{
					id: 'settings-plans',
					label: 'Plans',
					icon: <UntitledIcon name="calendarHeart" />,
					path: '/settings/plans',
				},
				{
					id: 'settings-content-library',
					label: 'Content Library',
					icon: <UntitledIcon name="bookClosed" />,
					path: '/settings/content-library',
				},
				{
					id: 'settings-download-app',
					label: 'Download App',
					icon: <UntitledIcon name="download" />,
					path: '/settings/download-app',
				},
				{
					id: 'settings-export-reports',
					label: 'Export Reports',
					icon: <UntitledIcon name="upload" />,
					path: router.SETTINGS_EXPORT_REPORTS,
				},
			],
		},
	],
};
