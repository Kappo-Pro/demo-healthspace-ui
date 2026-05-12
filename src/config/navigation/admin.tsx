/**
 * Admin Navigation Configuration
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
 * Admin Navigation Configuration
 *
 * Tier 1 Items (Icon Menu):
 * 1. Dashboard - Overview and key metrics
 * 2. Triage - Patient triage workflow with status tracking
 * 3. Users - Patient management hub
 * 4. Settings - Application settings with tier 2 sidebar
 */
export const adminNavigationConfig: NavigationConfig = {
	primary: [
		// Tier 1: Dashboard (no children, navigates directly)
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: <UntitledIcon name="home-02" />,
			path: '/',
			shortcut: 'g h',
			roles: ['admin', 'super-admin'],
		},

		// Tier 1: Triage (has children, shows tier 2 sidebar)
		{
			id: 'triage',
			label: 'Triage',
			icon: <UntitledIcon name="medical-cross" />,
			shortcut: 'g t',
			roles: ['admin', 'super-admin'],
			children: [
				{
					id: 'pending-review',
					label: 'Pending review',
					icon: <UntitledIcon name="clock-fast-forward" />,
					path: '/admin/patients/pending-review',
					badge: 0,
					badgeColor: 'warning',
				},
				{
					id: 'out-of-parameters',
					label: 'Out of parameters',
					icon: <UntitledIcon name="closeCircle" />,
					path: '/admin/patients/out-of-parameters',
					badge: 0,
					badgeColor: 'default',
				},
				{
					id: 'follow-up-required',
					label: 'Follow Up Required',
					icon: <UntitledIcon name="message-check-square" />,
					path: '/admin/patients/follow-up-required',
					badge: 0,
					badgeColor: 'warning',
				},
				{
					id: 'escalation-required',
					label: 'Escalation Required',
					icon: <UntitledIcon name="arrow-circle-right" />,
					path: '/admin/patients/escalation-required',
					badge: 0,
					badgeColor: 'error',
				},
				{
					id: 'reviewed',
					label: 'Reviewed',
					icon: <UntitledIcon name="checkCircle" />,
					path: '/admin/patients/reviewed',
					badge: 0,
					badgeColor: 'success',
				},
			],
		},

		// Tier 1: Users (has children, shows tier 2 sidebar)
		{
			id: 'users',
			label: 'Users',
			icon: <UntitledIcon name="user" />,
			shortcut: 'g u',
			roles: ['admin', 'super-admin'],
			children: [
				{
					id: 'registered',
					label: 'Assigned',
					icon: <UntitledIcon name="user-check-01" />,
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
					id: 'settings-integrations',
					label: 'Integrations',
					icon: <UntitledIcon name="shuffle" />,
					path: '/settings/integrations',
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
