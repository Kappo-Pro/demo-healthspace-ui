/**
 * User/Patient Navigation Configuration
 *
 * Two-Tier Navigation Structure:
 * - Tier 1: Icon-only menu (far left, always visible)
 * - Tier 2: Sublinks sidebar (shows when tier 1 item with children selected)
 *
 * @see docs/ux-specification.md Section 2.2
 */

import { UntitledIcon } from '@atoms/Icon';
import { NavigationConfig } from '@components/layouts/AppLayout/types';

/**
 * User/Patient Navigation Configuration
 *
 * Tier 1 Items (Icon Menu):
 * 1. Dashboard - Personal health overview
 * 2. Virtual Assessment - Health assessments
 * 3. ROM Analysis - Range of Motion scans
 * 4. Surveys - Survey management
 * 5. My Reports - Health reports (no children)
 * 6. Active Programs - Exercise programs (no children)
 * 7. Program History - Past programs (no children)
 * 8. Exercise Library - Exercise catalog (no children)
 */
export const userNavigationConfig: NavigationConfig = {
	primary: [
		// Tier 1: Dashboard (no children, navigates directly)
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: <UntitledIcon name="home-02" />,
			path: '/',
			shortcut: 'g h',
			roles: ['user'],
			children: [
				{
					id: 'dashboard',
					label: 'Dashboard',
					icon: <UntitledIcon name="home-02" />,
					path: '/',
				}
			],
		},

		// Tier 1: Virtual Assessment (has children, shows tier 2 sidebar)
		{
			id: 'virtual-assessment',
			label: 'Virtual Assessment',
			icon: <UntitledIcon name="certificate-02" />,
			shortcut: 'g v',
			roles: ['user'],
			children: [
				{
					id: 'start-assessment',
					label: 'Start Assessment',
					icon: <UntitledIcon name="clipboard-plus" />,
					path: '/:userId/virtual-evaluation/start',
				},
				{
					id: 'assessment-results',
					label: 'My Results',
					icon: <UntitledIcon name="bar-chart-square-plus" />,
					path: '/:userId/virtual-evaluation/result',
				},
			],
		},

		// Tier 1: ROM Analysis (has children, shows tier 2 sidebar)
		{
			id: 'rom-analysis',
			label: 'ROM Analysis',
			icon: <UntitledIcon name="play-square" />,
			shortcut: 'g r',
			roles: ['user'],
			children: [
				{
					id: 'start-scan',
					label: 'Select',
					icon: <UntitledIcon name="clipboard-plus" />,
					path: '/:userId/rom/scan',
				},
				{
					id: 'rom-results',
					label: 'My Results',
					icon: <UntitledIcon name="bar-chart-square-plus" />,
					children: [
						{
							id: 'vitalscan-rom-summary',
							label: 'ROM Sessions',
							path: '/:userId/rom/summary',
							icon: <UntitledIcon name="activity" />,
						},
						{
							id: 'posture-summary',
							label: 'Posture Sessions',
							path: '/:userId/rom/posture-analytics/summary',
							icon: <UntitledIcon name="user" />,
						},
						{
							id: 'captures',
							label: 'Captures',
							icon: <UntitledIcon name="image" />,
							path: '/:userId/rom/captures',
						},
					],
				},
			],
		},

		{
			id: 'programs',
			label: 'Programs',
			icon: <UntitledIcon name="holder" />,
			shortcut: 'g s',
			roles: ['user'],
			children: [
				{
					id: 'exercise-library',
					label: 'Start Program',
					icon: <UntitledIcon name="file-heart-02" />,
					path: '/:userId/program/create',
				},
				{
					id: 'program-history',
					label: 'Program Summary',
					icon: <UntitledIcon name="fileText" />,
					path: '/:userId/program/summary',
				},
			],
		},

		// Tier 1: Surveys (has children, shows tier 2 sidebar)
		{
			id: 'surveys',
			label: 'Surveys',
			icon: <UntitledIcon name="magic-wand" />,
			shortcut: 'g s',
			roles: ['user'],
			children: [
				{
					id: 'available-surveys',
					label: 'Available Surveys',
					icon: <UntitledIcon name="holder" />,
					path: '/:userId/survey/start',
				},
				{
					id: 'my-responses',
					label: 'My Responses',
					icon: <UntitledIcon name="file-check-02" />,
					path: '/:userId/survey/summary',
				},
			],
		},

		// Tier 1: My Reports (no children, navigates directly)
		{
			id: 'my-reports',
			label: 'My Reports',
			icon: <UntitledIcon name="bar-chart-square-01" />,
			path: '/:userId/report/summary',
			shortcut: 'g p',
			roles: ['user'],
		},
	],

	footer: [],
};

export const screeningNavigationConfig: NavigationConfig = {
	primary: [
		// Tier 1: Dashboard (no children, navigates directly)
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: <UntitledIcon name="home-02" />,
			path: '/',
			shortcut: 'g h',
			roles: ['user'],
			children: [
				{
					id: 'dashboard',
					label: 'Dashboard',
					icon: <UntitledIcon name="home-02" />,
					path: '/',
				}
			],
		},

		// Tier 1: ROM Analysis (has children, shows tier 2 sidebar)
		{
			id: 'rom-analysis',
			label: 'ROM Analysis',
			icon: <UntitledIcon name="play-square" />,
			shortcut: 'g r',
			roles: ['user'],
			children: [
				{
					id: 'start-scan',
					label: 'Select',
					icon: <UntitledIcon name="clipboard-plus" />,
					path: '/:userId/rom/scan',
				},
				{
					id: 'rom-results',
					label: 'My Results',
					icon: <UntitledIcon name="bar-chart-square-plus" />,
					children: [
						{
							id: 'vitalscan-rom-summary',
							label: 'ROM Sessions',
							path: '/:userId/rom/summary',
							icon: <UntitledIcon name="activity" />,
						},
						{
							id: 'posture-summary',
							label: 'Posture Sessions',
							path: '/:userId/rom/posture-analytics/summary',
							icon: <UntitledIcon name="user" />,
						},
						{
							id: 'captures',
							label: 'Captures',
							icon: <UntitledIcon name="image" />,
							path: '/:userId/rom/captures',
						},
					],
				},
			],
		},

		// Tier 1: My Reports (no children, navigates directly)
		{
			id: 'my-reports',
			label: 'My Reports',
			icon: <UntitledIcon name="bar-chart-square-01" />,
			path: '/:userId/report/summary',
			shortcut: 'g p',
			roles: ['user'],
		},
	],

	footer: [],
};

export const interventionUserNavigationConfig: NavigationConfig = {
	primary: [
		// Tier 1: Dashboard (no children, navigates directly)
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: <UntitledIcon name="home-02" />,
			path: '/',
			shortcut: 'g h',
			roles: ['user'],
			children: [
				{
					id: 'dashboard',
					label: 'Dashboard',
					icon: <UntitledIcon name="home-02" />,
					path: '/',
				}
			],
		},


		// Tier 1: ROM Analysis (has children, shows tier 2 sidebar)
		{
			id: 'rom-analysis',
			label: 'ROM Analysis',
			icon: <UntitledIcon name="play-square" />,
			shortcut: 'g r',
			roles: ['user'],
			children: [
				{
					id: 'start-scan',
					label: 'Select',
					icon: <UntitledIcon name="clipboard-plus" />,
					path: '/:userId/rom/scan',
				},
				{
					id: 'rom-results',
					label: 'My Results',
					icon: <UntitledIcon name="bar-chart-square-plus" />,
					children: [
						{
							id: 'vitalscan-rom-summary',
							label: 'ROM Sessions',
							path: '/:userId/rom/summary',
							icon: <UntitledIcon name="activity" />,
						},
						{
							id: 'posture-summary',
							label: 'Posture Sessions',
							path: '/:userId/rom/posture-analytics/summary',
							icon: <UntitledIcon name="user" />,
						},
						{
							id: 'captures',
							label: 'Captures',
							icon: <UntitledIcon name="image" />,
							path: '/:userId/rom/captures',
						},
					],
				},
			],
		},

		{
			id: 'programs',
			label: 'Programs',
			icon: <UntitledIcon name="holder" />,
			shortcut: 'g s',
			roles: ['user'],
			children: [
				{
					id: 'exercise-library',
					label: 'Start Program',
					icon: <UntitledIcon name="file-heart-02" />,
					path: '/:userId/program/create',
				},
				{
					id: 'program-history',
					label: 'Program Summary',
					icon: <UntitledIcon name="fileText" />,
					path: '/:userId/program/summary',
				},
			],
		},

		// Tier 1: My Reports (no children, navigates directly)
		{
			id: 'my-reports',
			label: 'My Reports',
			icon: <UntitledIcon name="bar-chart-square-01" />,
			path: '/:userId/report/summary',
			shortcut: 'g p',
			roles: ['user'],
		},
	],

	footer: [],
};
