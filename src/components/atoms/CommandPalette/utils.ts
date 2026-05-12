/**
 * Command Palette Orchestrator - Utility Functions
 *
 * Reusable helper functions for search, formatting, and storage.
 */

import { User } from './types';

// Re-export fuzzyMatch from shared hook for backward compatibility
export { fuzzyMatch } from '@hooks/useFuzzySearch';

/**
 * Normalized role type for consistent role checking
 */
export type NormalizedRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'PATIENT';

/**
 * Normalize user role to uppercase with underscores
 *
 * Handles various backend formats:
 * - 'super-admin' → 'SUPER_ADMIN'
 * - 'admin' → 'ADMIN'
 * - 'ADMIN' → 'ADMIN'
 * - 'user' → 'USER'
 *
 * @param role - Raw role string from backend
 * @returns Normalized role string or undefined
 */
export function normalizeRole(role?: string): NormalizedRole | undefined {
	if (!role) return undefined;
	return role.toUpperCase().replace(/-/g, '_') as NormalizedRole;
}

/**
 * Check if normalized role is an admin role (SUPER_ADMIN or ADMIN)
 *
 * @param role - Raw role string from backend
 * @returns True if user has admin privileges
 */
export function isAdminRole(role?: string): boolean {
	const normalized = normalizeRole(role);
	return normalized === 'SUPER_ADMIN' || normalized === 'ADMIN';
}

/**
 * Check if normalized role is super admin
 *
 * @param role - Raw role string from backend
 * @returns True if user is super admin
 */
export function isSuperAdminRole(role?: string): boolean {
	return normalizeRole(role) === 'SUPER_ADMIN';
}

/**
 * Format user's full name
 *
 * @param user - User object
 * @returns Formatted full name
 */
export function formatUserName(user: User): string {
	return `${user.profile.firstName} ${user.profile.lastName}`;
}

/**
 * Format user role for display
 *
 * @param role - User role string
 * @returns Formatted role (e.g., "SUPER_ADMIN" → "Super Admin")
 */
export function formatRole(role?: string): string {
	if (!role) return 'User';
	return role
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format last login as relative time
 *
 * @param lastLogin - ISO date string
 * @returns Relative time string (e.g., "2h ago", "3d ago")
 */
export function formatLastLogin(lastLogin?: string): string {
	if (!lastLogin) return 'Never';

	const date = new Date(lastLogin);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins}m ago`;

	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h ago`;

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) return `${diffDays}d ago`;

	return date.toLocaleDateString();
}

/**
 * Local storage key for recent users
 */
const RECENT_USERS_KEY = 'command-palette:recent-users';

/**
 * Save recent users to localStorage
 *
 * @param userIds - Array of user IDs to save
 */
export function saveRecentUsers(userIds: string[]): void {
	try {
		localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(userIds));
	} catch (error) {
		// Intentionally silent: localStorage failures should not break UX
		// (e.g., Safari private mode, quota exceeded, disabled storage)
	}
}

/**
 * Load recent users from localStorage
 *
 * @returns Array of user IDs (empty array if none found or error)
 */
export function loadRecentUsers(): string[] {
	try {
		const data = localStorage.getItem(RECENT_USERS_KEY);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		return [];
	}
}

/**
 * Format keyboard shortcut for display
 *
 * @param shortcut - Shortcut string (e.g., "cmd+k", "ctrl+shift+p")
 * @returns Formatted shortcut with symbols (e.g., "⌘K", "Ctrl⇧P")
 */
export function formatShortcut(shortcut: string): string {
	return shortcut
		.replace(/cmd/gi, '⌘')
		.replace(/ctrl/gi, 'Ctrl')
		.replace(/shift/gi, '⇧')
		.replace(/alt/gi, '⌥')
		.replace(/\+/g, '');
}

/**
 * Get initials from user name
 *
 * @param user - User object
 * @returns Two-letter initials (e.g., "John Doe" → "JD")
 */
export function getUserInitials(user: User): string {
	const firstName = user.profile.firstName || '';
	const lastName = user.profile.lastName || '';
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Get status badge color based on user status
 *
 * @param status - User status
 * @returns CSS color variable name
 */
export function getStatusColor(
	status?: 'active' | 'inactive' | 'suspended',
): string {
	switch (status) {
		case 'active':
			return 'var(--color-success-600)';
		case 'inactive':
			return 'var(--color-neutral-500)';
		case 'suspended':
			return 'var(--color-error-600)';
		default:
			return 'var(--color-neutral-500)';
	}
}

/**
 * Get role badge color based on user role
 *
 * @param role - User role
 * @returns CSS color variable name
 */
export function getRoleColor(role?: string): string {
	switch (role) {
		case 'SUPER_ADMIN':
			return 'var(--brand-primary)';
		case 'ADMIN':
			return 'var(--color-info-600)';
		case 'USER':
			return 'var(--color-success-600)';
		case 'PATIENT':
			return 'var(--color-neutral-600)';
		default:
			return 'var(--color-neutral-500)';
	}
}

/**
 * Debounce function for search input with proper cleanup
 *
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function with cancel method
 */
export function debounce<T extends (...args: any[]) => unknown>(
	func: T,
	wait: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
	let timeout: NodeJS.Timeout | null = null;

	const debounced = function (...args: Parameters<T>) {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			timeout = null;
			func(...args);
		}, wait);
	};

	debounced.cancel = () => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	};

	return debounced;
}

/**
 * Check if user has required role
 *
 * @param userRole - User's current role
 * @param requiredRoles - Array of required roles
 * @returns True if user has one of the required roles
 */
export function hasRequiredRole(
	userRole: string | undefined,
	requiredRoles: string[],
): boolean {
	if (!userRole) return false;
	return requiredRoles.includes(userRole);
}

/**
 * Get role-based initial state for CommandPalette
 *
 * @param currentUser - Current authenticated user
 * @returns Partial state object for initializing palette
 */
export function getRoleBasedInitialState(currentUser: User | null): {
	mode: 'idle' | 'userContext';
	selectedUser: User | null;
} {
	if (!currentUser) {
		return { mode: 'idle', selectedUser: null };
	}

	const normalized = normalizeRole(currentUser.profile.role);

	switch (normalized) {
		case 'SUPER_ADMIN':
		case 'ADMIN':
			// Admins start in idle mode (show admin actions)
			return {
				mode: 'idle',
				selectedUser: null,
			};

		case 'USER':
		case 'PATIENT':
			// Users are pre-selected to their own context
			return {
				mode: 'userContext',
				selectedUser: currentUser,
			};

		default:
			return {
				mode: 'idle',
				selectedUser: null,
			};
	}
}

/**
 * Check if user role allows user selection/search
 *
 * @param user - User object to check
 * @returns True if user can search and select other users
 */
export function canSelectUsers(user: User | null): boolean {
	if (!user) return false;
	return isAdminRole(user.profile.role);
}

/**
 * Check if user can assign roles to other users
 *
 * @param user - User object to check
 * @returns True if user can assign roles (SUPER_ADMIN only)
 */
export function canAssignRoles(user: User | null): boolean {
	if (!user) return false;
	return isSuperAdminRole(user.profile.role);
}

/**
 * Check if user can delete other users
 *
 * @param user - User object to check
 * @returns True if user can delete users (SUPER_ADMIN only)
 */
export function canDeleteUsers(user: User | null): boolean {
	if (!user) return false;
	return isSuperAdminRole(user.profile.role);
}

/**
 * Get filtered command set based on user role
 *
 * @param commands - Array of commands with optional requiredRole
 * @param currentUser - Current authenticated user
 * @returns Filtered commands array based on user's role
 */
export function getFilteredCommands<T extends { requiredRole?: string[] }>(
	commands: T[],
	currentUser: User | null,
): T[] {
	if (!currentUser) return [];

	const normalized = normalizeRole(currentUser.profile.role);

	return commands.filter(command => {
		if (!command.requiredRole) return true;
		return normalized ? command.requiredRole.includes(normalized) : false;
	});
}
