/**
 * AppLayout Types
 *
 * TypeScript type definitions for the unified AppLayout system.
 * This provides strong typing for all layout components and their props.
 */

import { ReactNode } from 'react';

// ============================================
// User Types
// ============================================

export type UserRole = 'admin' | 'super-admin' | 'user';

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	avatarColor?: string;
	role: UserRole;
	firstName?: string;
	lastName?: string;
}

// ============================================
// Navigation Types
// ============================================

export interface NavigationItem {
	/** Unique identifier for the navigation item */
	id: string;

	/** Display label */
	label: string;

	/** Icon component or element */
	icon: ReactNode;

	/** Avatar for user-type navigation items (renders avatar instead of icon) */
	avatar?: {
		src?: string;
		text?: string;
		color?: string;
	};

	/** Navigation path (optional if has children) */
	path?: string;

	/** Click handler (alternative to path) */
	onClick?: () => void;

	/** Child navigation items */
	children?: NavigationItem[];

	/** Badge content (number or text) */
	badge?: number | string;

	/** Badge color variant */

	badgeColor?:
		| 'primary'
		| 'success'
		| 'warning'
		| 'error'
		| 'info'
		| 'purple'
		| 'blue'
		| 'green'
		| 'orange'
		| 'red'
		| 'yellow'
		| 'default';

	/** Status dot color (shows a colored dot before label) */

	statusDot?:
		| 'blue'
		| 'green'
		| 'orange'
		| 'red'
		| 'yellow'
		| 'black'
		| 'default';

	/** Keyboard shortcut */
	shortcut?: string;

	/** Hide from navigation */
	hidden?: boolean;

	/** Disabled state */
	disabled?: boolean;

	/** Required user roles */
	roles?: UserRole[];
}

export interface NavigationConfig {
	/** Primary navigation items */
	primary: NavigationItem[];

	/** Footer navigation items */
	footer?: NavigationItem[];
}

// ============================================
// Breadcrumb Types
// ============================================

export interface BreadcrumbMenuItem {
	/** Menu item key */
	key: string;

	/** Menu item label */
	label: ReactNode;

	/** Click handler */
	onClick?: () => void;
}

export interface Breadcrumb {
	/** Display label */
	label: string;

	/** Navigation path */
	path?: string;

	/** Click handler */
	onClick?: () => void;

	/** Icon */
	icon?: ReactNode;

	/** Avatar for user breadcrumb items */
	avatar?: {
		src?: string;
		text?: string;
		color?: string; // Avatar colors are dynamic user-specific values from backend
	};

	/** Dropdown menu items */
	menu?: {
		items: BreadcrumbMenuItem[];
	};

	/** Hide this breadcrumb */
	hidden?: boolean;

	/** Custom CSS class */
	className?: string;
}

// ============================================
// Selected User Type (for admin viewing patient)
// ============================================

export interface SelectedUser {
	id: string;
	profile?: {
		firstName?: string;
		lastName?: string;
		email?: string;
		imageUrl?: string;
		avatarColor?: string;
	};
}

// ============================================
// Layout Props
// ============================================

export interface AppLayoutProps {
	/** User role determines navigation options */
	userRole: UserRole;

	/** Current user information */
	user: User;

	/** Current navigation path for active state */
	currentPath: string;

	/** Navigation configuration */
	navigationConfig: NavigationConfig;

	/** Optional sidebar collapse control */
	sidebarCollapsed?: boolean;
	onSidebarToggle?: (collapsed: boolean) => void;

	/** Logout handler */
	onLogout?: () => void;

	/** Optional context bar content */
	contextBar?: ReactNode;

	/** Main content */
	children: ReactNode;

	/** Loading state */
	loading?: boolean;

	/** Error state */
	error?: Error | null;

	/** Selected user (when admin is viewing a patient) */
	selectedUser?: SelectedUser | null;
}

// ============================================
// Sidebar Props
// ============================================

export interface SidebarProps {
	/** Navigation items (tier 1 for legacy, tier 2 sublinks for new two-tier mode) */
	items?: NavigationItem[];

	/** Active item key */
	activeKey: string;

	/** Collapsed state */
	collapsed: boolean;
	onCollapse: (collapsed: boolean) => void;

	/** User info */
	user: User;

	/** Selected user (when admin is viewing a patient) */
	selectedUser?: SelectedUser | null;

	/** Optional footer content */
	footer?: ReactNode;

	/** Mobile mode */
	isMobile?: boolean;

	/** Open state for mobile drawer */
	isOpen?: boolean;
	onClose?: () => void;

	/** Theme */
	theme?: 'light' | 'dark' | 'default' | 'vibrant';

	// ============================================
	// Two-Tier Navigation Props (New)
	// ============================================

	/** Tier 2 mode: Show as sublink sidebar */
	tier2Mode?: boolean;

	/** Tier 1 selected item label (e.g., "Triage") */
	title?: string;

	/** Tier 1 selected item icon */
	titleIcon?: ReactNode;

	/** Tier 2 sublinks to render */
	sublinks?: NavigationItem[];

	/** Visibility control for tier 2 mode */
	visible?: boolean;

	/** Navigate handler for sublinks */
	onNavigate?: (path: string) => void;

	/** Badge counts for sublinks */
	badges?: Record<string, number>;

	// ============================================
	// Tier 1 Navigation Props (IconMenu)
	// ============================================

	/** Tier 1 navigation items (for IconMenu) */
	tier1Items?: NavigationItem[];

	/** Tier 1 footer navigation items (for IconMenu footer section) */
	tier1FooterItems?: NavigationItem[];

	/** Selected tier 1 key */
	selectedTier1Key?: string;

	/** Tier 1 selection handler */
	onTier1Select?: (key: string, item: NavigationItem) => void;

	/** Logo click handler (navigate to home) */
	onLogoClick?: () => void;

	/** Logout handler */
	onLogout?: () => void;
}

// ============================================
// Header Props
// ============================================

export interface HeaderProps {
	/** Page title to display in header */
	pageTitle?: string;
	selectedTier1Key?: string | null;
	/** Badge content (number or text) to display next to title */
	badge?: number | string;

	/** Badge color variant */
	badgeColor?:
		| 'primary'
		| 'success'
		| 'warning'
		| 'error'
		| 'info'
		| 'purple'
		| 'blue'
		| 'green'
		| 'orange'
		| 'red'
		| 'yellow'
		| 'default';

	/** Show mobile menu button */
	showMenuButton?: boolean;
	onMenuClick?: () => void;

	/** Sidebar toggle control (desktop two-tier navigation) */
	onToggleSidebar?: () => void;
	sidebarCollapsed?: boolean;

	/** Search functionality */
	searchPlaceholder?: string;

	/** Optional context bar content */
	contextBar?: ReactNode;

	/** Sticky header */
	sticky?: boolean;
}

// ============================================
// Content Props
// ============================================

export interface ContentProps {
	/** Content children */
	children: ReactNode;

	/** Loading state */
	loading?: boolean;

	/** Error state */
	error?: Error | null;

	/** Full width mode (no max-width constraint) */
	fullWidth?: boolean;

	/** No padding mode */
	noPadding?: boolean;

	/** Additional CSS class name */
	className?: string;
}

// ============================================
// Responsive Breakpoints
// ============================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
	xs: number; // 0-639px
	sm: number; // 640px
	md: number; // 768px
	lg: number; // 1024px
	xl: number; // 1280px
	'2xl': number; // 1536px
}

// ============================================
// Sidebar State
// ============================================

export interface SidebarState {
	/** Collapsed state */
	collapsed: boolean;

	/** Mobile open state */
	mobileOpen: boolean;

	/** Current breakpoint */
	breakpoint: Breakpoint;

	/** Is mobile viewport */
	isMobile: boolean;
}

// ============================================
// Keyboard Navigation
// ============================================

export interface KeyboardShortcut {
	/** Key combination (e.g., 'cmd+k', 'g h') */
	keys: string;

	/** Description */
	description: string;

	/** Handler function */
	handler: () => void;

	/** Enabled state */
	enabled?: boolean;

	/** Category for grouping */
	category?: string;
}

export interface KeyboardNavigationConfig {
	/** Registered shortcuts */
	shortcuts: KeyboardShortcut[];

	/** Enable/disable keyboard navigation */
	enabled: boolean;
}
