import {
	NavigationConfig,
	NavigationItem,
} from '@components/layouts/AppLayout/types';
import { getNavigationConfig } from '@config/navigation';
import { PLANS, USER_ROLES } from '@stores/constants';
import { useTypedSelector } from '@stores/index';
import { useMemo } from 'react';

/**
 * Badge mapping interface
 */
export interface BadgeMapping {
	[itemId: string]: number | string | undefined;
}

/**
 * Enhance navigation configuration with badges recursively
 */
export function enhanceNavigationWithBadges(
	config: NavigationConfig,
	badges: BadgeMapping,
): NavigationConfig {
	/**
	 * Recursively enhance items with badge values
	 * Preserves existing structure while injecting badge data
	 *
	 * For patient-triage children: disables items when badge count is 0
	 */
	const enhanceItems = (
		items: NavigationItem[],
		parentId?: string,
	): NavigationItem[] => {
		if (!Array.isArray(items)) return [];

		return items
			.filter(item => !!item) // FIX: Filter out null/undefined items to prevent crash
			.map(item => {
				const badgeValue = badges[item.id];
				const isPatientTriageChild = parentId === 'patient-triage';

				// Determine if item should be disabled
				// Only disable patient-triage children when badge is exactly 0
				const shouldDisable =
					isPatientTriageChild && badgeValue !== undefined && badgeValue === 0;

				return {
					...item,
					// Use badge from mapping if available, otherwise keep original
					badge: badgeValue !== undefined ? badgeValue : item.badge,
					// Disable patient-triage children when badge count is 0
					disabled: shouldDisable || item.disabled,
					// Recursively enhance children, passing current item ID as parent
					children: item.children
						? enhanceItems(item.children, item.id)
						: undefined,
				};
			});
	};

	return {
		...config,
		primary: enhanceItems(config.primary || []),
		footer: config.footer ? enhanceItems(config.footer) : undefined,
	};
}

/**
 * React hook for navigation with automatic badge integration
 */
export function useNavigationWithBadges(
	role: 'admin' | 'super-admin' | 'user',
): NavigationConfig {
	// Use primitive selectors to avoid reference equality issues
	const adminPatient = useTypedSelector(state => state.adminDashboardPatient);
	const unAssignedCount = adminPatient.unAssignedCount;
	const registeredCount = adminPatient.registeredCount;
	const assignedCount = adminPatient.assignedCount;
	const consentFormCount = adminPatient.consentFormCount;
	const statsCount = adminPatient.statsCount;
const user = useTypedSelector(state => state.user);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans
	);

	const planType = savedUserPlans?.planType;
	const isScreening = planType === PLANS.SCREENING;
	const isIntervention =
		planType === PLANS.EARLYINTERVENTION;
	// Get base navigation config for role
	const baseConfig = useMemo(() => getNavigationConfig(role,isIntervention, isScreening ), [role,isScreening, isIntervention]);

	// Calculate dashboard status totals using primitive values
	const newPatients = statsCount?.newUsers || 0;
	const pendingReview =
		(statsCount?.pendingReview?.evaluation || 0) +
		(statsCount?.pendingReview?.omniRom || 0) +
		(statsCount?.pendingReview?.letsMove || 0) +
		(statsCount?.pendingReview?.survey || 0);
	const outOfParams =
		(statsCount?.outOfParams?.evaluation || 0) +
		(statsCount?.outOfParams?.omniRom || 0) +
		(statsCount?.outOfParams?.letsMove || 0) +
		(statsCount?.outOfParams?.survey || 0);
	const followUpRequired =
		(statsCount?.followUpRequired?.evaluation || 0) +
		(statsCount?.followUpRequired?.omniRom || 0) +
		(statsCount?.followUpRequired?.letsMove || 0) +
		(statsCount?.followUpRequired?.survey || 0);
	const escalationRequired =
		(statsCount?.escalationRequired?.evaluation || 0) +
		(statsCount?.escalationRequired?.omniRom || 0) +
		(statsCount?.escalationRequired?.letsMove || 0) +
		(statsCount?.escalationRequired?.survey || 0);
	const reviewed =
		(statsCount?.reviewed?.evaluation || 0) +
		(statsCount?.reviewed?.omniRom || 0) +
		(statsCount?.reviewed?.letsMove || 0) +
		(statsCount?.reviewed?.survey || 0);

	const enhancedConfig = useMemo(() => {
		const badges: BadgeMapping = {
			'new-patients': newPatients,
			'pending-review': pendingReview,
			'out-of-parameters': outOfParams,
			'follow-up-required': followUpRequired,
			'escalation-required': escalationRequired,
			reviewed: reviewed,
			registered:
				user.profile.role === USER_ROLES.ADMIN
					? assignedCount
					: registeredCount,
			unassigned: unAssignedCount,
			'consent-forms': consentFormCount,
		};
		return enhanceNavigationWithBadges(baseConfig, badges);
	}, [
		baseConfig,
		newPatients,
		pendingReview,
		outOfParams,
		followUpRequired,
		escalationRequired,
		reviewed,
		user.profile.role,
		assignedCount,
		registeredCount,
		unAssignedCount,
		consentFormCount,
	]);

	/**
	 * Filter step — removes:
	 * - items with id "pending-invites"
	 * - items with badge === 0
	 * - parents with no remaining children
	 */
	const filterItems = (items?: NavigationItem[]): NavigationItem[] => {
		if (!Array.isArray(items)) return [];

		return items
			.filter(
				item =>
					item.id !== 'pending-invites' &&
					(item.badge === undefined || item.badge > 0),
			)
			.map(item => {
				const filteredChildren = filterItems(item.children);
				// If item has children, only keep it if children remain
				if (item.children && filteredChildren.length === 0) {
					return null;
				}
				return {
					...item,
					children: filteredChildren.length ? filteredChildren : undefined,
				};
			})
			.filter(Boolean) as NavigationItem[];
	};

	const filteredConfig = useMemo<NavigationConfig>(
		() => ({
			...enhancedConfig,
			primary: filterItems(enhancedConfig.primary),
			footer: filterItems(enhancedConfig.footer),
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[enhancedConfig],
	);

	return filteredConfig;
}

/**
 * Compute tier 1 badge counts by aggregating tier 2 child badges
 */
export function computeTier1Badges(
	navigationItems: NavigationItem[],
	tier2Badges: BadgeMapping,
): BadgeMapping {
	return navigationItems.reduce((acc, item) => {
		if (item.children && item.children.length > 0) {
			// Has children - sum child badge counts
			const total = item.children.reduce((sum, child) => {
				const childBadge = tier2Badges[child.id];
				const count = typeof childBadge === 'number' ? childBadge : 0;
				return sum + count;
			}, 0);
			acc[item.id] = total;
		} else {
			// No children - use own badge if exists
			acc[item.id] = tier2Badges[item.id] || 0;
		}
		return acc;
	}, {} as BadgeMapping);
}

/**
 * Badge color helper
 */
export function getBadgeColor(
	count: number,
	thresholds?: { warning?: number; danger?: number },
): string {
	const { warning = 10, danger = 20 } = thresholds || {};

	if (count >= danger) return 'var(--color-status-error)';
	if (count >= warning) return 'var(--color-status-warning)';
	if (count > 0) return 'var(--color-status-info)';
	return 'var(--color-status-success)';
}
