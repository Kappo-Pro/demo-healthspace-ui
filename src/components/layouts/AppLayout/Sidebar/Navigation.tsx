/**
 * Navigation Component
 *
 * Hierarchical navigation menu that renders navigation items.
 * Supports primary items, nested secondary items, badges, and keyboard navigation.
 */

import React, { useState, useCallback } from 'react';
import { NavigationItem } from '../types';
import styles from './Navigation.module.css';

// Simple Chevron icon
const ChevronRight = () => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M9 5l7 7-7 7"
		/>
	</svg>
);

interface NavigationProps {
	/** Navigation items */
	items: NavigationItem[];

	/** Active item ID */
	activeId: string;

	/** Collapsed state */
	collapsed: boolean;

	/** Click handler */
	onNavigate?: (item: NavigationItem) => void;
}

interface NavItemProps {
	item: NavigationItem;
	isActive: boolean;
	collapsed: boolean;
	depth: number;
	onNavigate?: (item: NavigationItem) => void;
	activeId: string;
}

const NavItem: React.FC<NavItemProps> = React.memo(
	({ item, isActive, collapsed, depth, onNavigate, activeId }) => {
		const hasChildren = item.children && item.children.length > 0;

		// Check if any child is active (recursively)
		const hasActiveChild = React.useMemo(() => {
			const checkActiveChild = (
				children: NavigationItem[] | undefined,
			): boolean => {
				if (!children) return false;
				return children.some(child => {
					if (child.id === activeId) return true;
					return checkActiveChild(child.children);
				});
			};
			return checkActiveChild(item.children);
		}, [item.children, activeId]);

		// Expansion state: starts expanded if has active child
		const [expanded, setExpanded] = useState(hasActiveChild);

		// Track previous hasActiveChild to detect when it changes from false to true
		const prevHasActiveChild = React.useRef(hasActiveChild);

		// Auto-expand when a child becomes active (but don't force collapse)
		React.useEffect(() => {
			// Only expand if hasActiveChild changed from false to true
			// This allows user to manually collapse even when child is active
			if (hasActiveChild && !prevHasActiveChild.current) {
				setExpanded(true);
			}
			prevHasActiveChild.current = hasActiveChild;
		}, [hasActiveChild]);

		const handleClick = useCallback(
			(e: React.MouseEvent) => {
				// If item has children and sidebar is not collapsed, toggle expansion
				// and DON'T navigate (to prevent resetting the expanded state)
				if (hasChildren && !collapsed) {
					e.preventDefault();
					e.stopPropagation();
					setExpanded(!expanded);
					return; // Stop here, don't navigate
				}

				// Otherwise, handle click/navigation normally
				if (item.onClick) {
					item.onClick();
				} else if (item.path) {
					onNavigate?.(item);
				}
			},
			[hasChildren, collapsed, expanded, item, onNavigate],
		);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick(e as unknown as React.MouseEvent);
				}
			},
			[handleClick],
		);

		// Parent should NOT be active if a child is active
		// Only the actual active item (leaf) should have active state
		const shouldBeActive = isActive && !hasActiveChild;

		const itemClasses = [
			styles.navItem,
			shouldBeActive && styles.active,
			hasChildren && expanded && styles.expanded,
		]
			.filter(Boolean)
			.join(' ');

		const secondaryNavClasses = [
			styles.secondaryNav,
			expanded && styles.expanded,
		]
			.filter(Boolean)
			.join(' ');

		return (
			<>
				<button
					className={itemClasses}
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					disabled={item.disabled}
					data-tooltip={collapsed ? item.label : undefined}
					aria-label={item.label}
					aria-current={shouldBeActive ? 'page' : undefined}
					aria-expanded={hasChildren ? expanded : undefined}>
					{item.icon && <span className={styles.navItemIcon}>{item.icon}</span>}

					<span className={styles.navItemLabel}>{item.label}</span>

					{item.badge !== undefined && item.badge !== null && (
						<span
							className={styles.navItemBadge}
							data-badge-color={item.badgeColor || 'primary'}>
							{item.badge}
						</span>
					)}

					{hasChildren && (
						<span className={styles.navItemChevron}>
							<ChevronRight />
						</span>
					)}
				</button>

				{/* Secondary navigation (children) */}
				{hasChildren && !collapsed && (
					<div className={secondaryNavClasses}>
						{item.children?.map(child => (
							<NavItem
								key={child.id}
								item={child}
								isActive={child.id === activeId}
								collapsed={collapsed}
								depth={depth + 1}
								onNavigate={onNavigate}
								activeId={activeId}
							/>
						))}
					</div>
				)}
			</>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison: only re-render if these specific props change
		// This prevents re-renders when only badge values change from Redux
		const shouldSkipRender =
			prevProps.item.id === nextProps.item.id &&
			prevProps.item.label === nextProps.item.label &&
			prevProps.item.path === nextProps.item.path &&
			prevProps.isActive === nextProps.isActive &&
			prevProps.collapsed === nextProps.collapsed &&
			prevProps.activeId === nextProps.activeId;

		return shouldSkipRender;
	},
);

export const Navigation: React.FC<NavigationProps> = ({
	items,
	activeId,
	collapsed,
	onNavigate,
}) => {
	return (
		<nav
			className={
				collapsed
					? `${styles.navigation} ${styles.collapsed}`
					: styles.navigation
			}>
			{items.map(item => {
				// Skip hidden items
				if (item.hidden) return null;

				return (
					<div key={item.id} className={styles.section}>
						{/* If item has no path but has children, only show children */}
						{item.children && item.children.length > 0 && !item.path ? (
							<>
								{item.children.map(child => (
									<NavItem
										key={child.id}
										item={child}
										isActive={child.id === activeId}
										collapsed={collapsed}
										depth={0}
										onNavigate={onNavigate}
										activeId={activeId}
									/>
								))}
							</>
						) : (
							<NavItem
								item={item}
								isActive={item.id === activeId}
								collapsed={collapsed}
								depth={0}
								onNavigate={onNavigate}
								activeId={activeId}
							/>
						)}
					</div>
				);
			})}
		</nav>
	);
};
