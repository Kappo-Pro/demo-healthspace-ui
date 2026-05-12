/**
 * Selected User Navigation Utility
 *
 * Converts menuUser from AdminMenuLists to NavigationItem format
 * for display in the tier 2 sidebar when a user is selected.
 */

import { NavigationItem } from '@components/layouts/AppLayout/types';
import { router } from '@routers/routers';
import React from 'react';

interface MenuUserItem {
	key: string;
	label?: string;
	icon: React.ReactNode;
	options?: Array<{
		key: string;
		name: string;
		icon: React.ReactNode;
	}>;
}

interface SelectedUser {
	id: string;
	profile?: {
		firstName?: string;
		lastName?: string;
		imageUrl?: string;
		avatarColor?: string;
	};
}

/**
 * Generate path for a menu item key based on selected user
 */
function getPathForKey(key: string, userId: string): string {
	const navigationMap: Record<string, string> = {
		// User Activity
		activity: `/${userId}/activity`,
		userActivity: `/${userId}/activity`,

		// Virtual Evaluation
		virtualEvaluation: `/${userId}/virtual-evaluation/start`,
		listEvaluation: `/${userId}/virtual-evaluation/result`,

		// VitalScan ROM
		startScan: `/${userId}${router.AIASSISTANT_START_SCAN}`,
		romProgram: `/${userId}${router.AIASSISTANT_ROM_PROGRAM}`,
		romSummary: `/${userId}${router.AIASSISTANT_ROM_SUMMARY}`,
		captures: `/${userId}${router.AIASSISTANT_CAPTURES}`,
		postureSummary: `/${userId}${router.AIASSISTANT_POSTURE_SUMMARY}`,
		postureCaptures: `/${userId}${router.AIASSISTANT_POSTURE_CAPTURES}`,
		customSummary: `/${userId}${router.AIASSISTANT_CUSTOM_SUMMARY}`,

		// Let's Move (Programs)
		generateProgram: `/${userId}${router.AIASSISTANT_GENERATE_PROGRAM}`,
		programs: `/${userId}${router.AIASSISTANT_PROGRAMS}`,
		listSessions: `/${userId}${router.AIASSISTANT_LIST_SESSIONS}`,

		// Survey
		createSurvey: `/${userId}/survey/create`,
		startSurveyUser: `/${userId}/survey/start`,
		surveySummary: `/${userId}/survey/summary`,

		// Reports
		createReport: `/${userId}/report/create`,
		myReport: `/${userId}${router.AIASSISTANT_MY_REPORT}`,

		// Dashboard
		dashboard: `/${userId}/dashboard`,
		patientView: `/${userId}/dashboard`,
	};

	return navigationMap[key] || `/${userId}`;
}

/**
 * Convert menuUser items to NavigationItem format for tier 2 sidebar
 *
 * Note: Categories with children get the first child's path as their default path.
 * This ensures handleTier1Select can navigate to a valid route.
 */
export function convertMenuUserToNavigationItems(
	menuUser: MenuUserItem[],
	userId: string,
): NavigationItem[] {
	return menuUser.map(item => {
		// Convert options to children first (needed to determine default path)
		const children = item.options?.length
			? item.options.map(option => ({
					id: option.key,
					label: option.name,
					icon: option.icon,
					path: getPathForKey(option.key, userId),
				}))
			: undefined;

		// For categories with children, use first child's path as the category path
		// This enables navigation when clicking the category in tier 1
		const categoryPath = children?.length
			? children[0].path
			: getPathForKey(item.key, userId);

		const navItem: NavigationItem = {
			id: item.key,
			label: item.label || '',
			icon: item.icon,
			path: categoryPath,
			children,
		};

		return navItem;
	});
}

/**
 * Create a NavigationItem for the selected user to display in IconMenu
 */
export function createSelectedUserNavItem(
	selectedUser: SelectedUser,
	menuUser: MenuUserItem[],
): NavigationItem {
	const userId = selectedUser.id;
	const firstName = selectedUser.profile?.firstName || '';
	const lastName = selectedUser.profile?.lastName || '';
	const fullName = `${firstName} ${lastName}`.trim() || 'User';

	return {
		id: 'selected-user',
		label: fullName,
		icon: null, // Not used - avatar is rendered instead
		avatar: {
			src: selectedUser.profile?.imageUrl,
			text: firstName.charAt(0)?.toUpperCase() || 'U',
			color: selectedUser.profile?.avatarColor || 'var(--brand-primary)',
		},
		children: convertMenuUserToNavigationItems(menuUser, userId),
	};
}
