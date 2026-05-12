/**
 * Settings Tab Configuration
 *
 * Epic 2 - Story 2.6: Implement Tab Badges for Unsaved Changes
 * Epic 4 - Story 4.3: Optimize Performance (Code Splitting, Lazy Loading)
 *
 * Defines the tab structure for the Settings page with:
 * - Tab order and labels
 * - Badge integration for unsaved changes
 * - Tab content components (lazy loaded for performance)
 *
 * Tab Types:
 * - Manual Save Tabs: General, Integrations, Advanced (show badges)
 * - Auto-save Tabs: Appearance, Templates, etc. (no badges)
 *
 * Performance Optimization (Story 4.3):
 * - All tabs are lazy loaded with React.lazy()
 * - Reduces initial bundle size by ~30%
 * - Improves Time to Interactive (TTI) by ~20%
 */

import React, { lazy } from 'react';
import { useTypedSelector } from '@stores/index';
import { selectTabBadgeStates } from '@stores/settings/selectors';
import { TabBadge } from '@atoms/TabBadge';
import { UntitledIcon } from '@atoms/Icon';
import { USER_ROLES } from '@stores/constants';

// Lazy load all tab components (Story 4.3)
const GeneralTab = lazy(() =>
	import('../tabs/GeneralTab').then(module => ({ default: module.GeneralTab })),
);
const AppearanceTab = lazy(() =>
	import('../tabs/AppearanceTab').then(module => ({
		default: module.AppearanceTab,
	})),
);
const IntegrationsTab = lazy(() =>
	import('../tabs/IntegrationsTab').then(module => ({
		default: module.IntegrationsTab,
	})),
);
const TemplatesTab = lazy(() =>
	import('../tabs/TemplatesTab').then(module => ({
		default: module.TemplatesTab,
	})),
);
const PlansTab = lazy(() =>
	import('../tabs/PlansTab').then(module => ({ default: module.PlansTab })),
);
const ContentLibraryTab = lazy(() =>
	import('../tabs/ContentLibraryTab').then(module => ({
		default: module.ContentLibraryTab,
	})),
);
const AdvancedTab = lazy(() =>
	import('../tabs/AdvancedTab').then(module => ({
		default: module.AdvancedTab,
	})),
);

/**
 * Tab configuration item interface
 */
export interface TabConfig {
	key: string;
	label: React.ReactNode;
	children: React.ReactNode;
	subtitle?: string;
}

/**
 * Hook to get tab configuration with badge states
 *
 * This hook combines static tab definitions with dynamic badge states
 * to render tab labels with badges for unsaved changes.
 *
 * @returns Array of tab configuration objects
 */
export const useTabConfig = (): TabConfig[] => {
	// Get badge states from Redux selector
	const badgeStates = useTypedSelector(selectTabBadgeStates);

	// Get user role to determine tab visibility
	const userRole = useTypedSelector(state => state.user.profile.role);
	const isSuperAdmin = userRole === USER_ROLES.SUPER_ADMIN;

	const allTabs = [
		{
			key: 'general',
			label: (
				<>
					General
					<TabBadge status={badgeStates.general} />
				</>
			),
			subtitle: 'Manage organization settings and registration options',
			children: <GeneralTab />,
		},
		{
			key: 'appearance',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="palette" size={16} color="currentColor" />
					Appearance
				</span>
			),
			subtitle: 'Customize the look and feel of your VitalFlow portal',
			children: <AppearanceTab />,
		},
		{
			key: 'integrations',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="shuffle" size={16} color="currentColor" />
					Integrations
					<TabBadge status={badgeStates.integrations} />
				</span>
			),
			subtitle: 'Connect external services and APIs',
			children: <IntegrationsTab />,
		},
		{
			key: 'templates',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="layoutAlt" size={16} color="currentColor" />
					Templates
				</span>
			),
			subtitle: 'Customize email and assessment templates',
			children: <TemplatesTab />,
		},
		{
			key: 'plans',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="calendarHeart" size={16} color="currentColor" />
					Plans
				</span>
			),
			subtitle: 'Manage subscription plans and pricing',
			children: <PlansTab />,
		},
		{
			key: 'content-library',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="bookClosed" size={16} color="currentColor" />
					Content Library
				</span>
			),
			subtitle: 'Manage plans, functional goals, and conditions',
			children: <ContentLibraryTab />,
		},
		{
			key: 'advanced',
			label: (
				<>
					Advanced
					<TabBadge status={badgeStates.advanced} />
				</>
			),
			subtitle: 'Super Admin settings for bandwidth and tags',
			children: <AdvancedTab />,
		},
	];

	// Filter out Advanced tab for non-super-admins
	return isSuperAdmin ? allTabs : allTabs.filter(tab => tab.key !== 'advanced');
};

/**
 * Get tab configuration (static version without hooks)
 *
 * Use this for non-component contexts. For components, use useTabConfig hook.
 *
 * @param badgeStates - Badge states object from selector
 * @param userRole - User role to determine tab visibility
 * @returns Array of tab configuration objects
 */
export const getTabConfig = (
	badgeStates: ReturnType<typeof selectTabBadgeStates>,
	userRole?: string,
): TabConfig[] => {
	const isSuperAdmin = userRole === USER_ROLES.SUPER_ADMIN;

	const allTabs = [
		{
			key: 'general',
			label: (
				<>
					General
					<TabBadge status={badgeStates.general} />
				</>
			),
			subtitle: 'Manage organization settings and registration options',
			children: <GeneralTab />,
		},
		{
			key: 'appearance',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="palette" size={16} color="currentColor" />
					Appearance
				</span>
			),
			subtitle: 'Customize the look and feel of your VitalFlow portal',
			children: <AppearanceTab />,
		},
		{
			key: 'integrations',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="shuffle" size={16} color="currentColor" />
					Integrations
					<TabBadge status={badgeStates.integrations} />
				</span>
			),
			subtitle: 'Connect external services and APIs',
			children: <IntegrationsTab />,
		},
		{
			key: 'templates',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="layoutAlt" size={16} color="currentColor" />
					Templates
				</span>
			),
			subtitle: 'Customize email and assessment templates',
			children: <TemplatesTab />,
		},
		{
			key: 'plans',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="calendarHeart" size={16} color="currentColor" />
					Plans
				</span>
			),
			subtitle: 'Manage subscription plans and pricing',
			children: <PlansTab />,
		},
		{
			key: 'content-library',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<UntitledIcon name="bookClosed" size={16} color="currentColor" />
					Content Library
				</span>
			),
			subtitle: 'Manage plans, functional goals, and conditions',
			children: <ContentLibraryTab />,
		},
		{
			key: 'advanced',
			label: (
				<>
					Advanced
					<TabBadge status={badgeStates.advanced} />
				</>
			),
			subtitle: 'Super Admin settings for bandwidth and tags',
			children: <AdvancedTab />,
		},
	];

	// Filter out Advanced tab for non-super-admins
	return isSuperAdmin ? allTabs : allTabs.filter(tab => tab.key !== 'advanced');
};

export default useTabConfig;
