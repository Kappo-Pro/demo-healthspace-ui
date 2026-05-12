/**
 * useAdminTriageShortcuts Hook
 *
 * Keyboard shortcuts for admin triage dashboard operations.
 * Story 3.4: Desktop Optimization with Keyboard Shortcuts (FR16)
 *
 * Shortcuts:
 * - Cmd/Ctrl+K: Open command palette
 * - J: Navigate to next row
 * - K: Navigate to previous row
 * - Space: Select/deselect current row
 * - Cmd/Ctrl+A: Select all visible rows
 * - Cmd/Ctrl+Shift+A: Deselect all rows
 * - /: Focus search input
 * - Esc: Close modals/drawers
 * - U: Update status (when rows selected)
 * - C: Assign clinician (when rows selected)
 * - E: Export selected (when rows selected)
 * - R: Refresh data
 * - F: Toggle advanced filters
 * - ?: Show keyboard shortcuts help
 *
 * @module hooks/useAdminTriageShortcuts
 */

import { useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export interface AdminTriageShortcutHandlers {
	/** Navigate to next row */
	onNavigateNext?: () => void;

	/** Navigate to previous row */
	onNavigatePrevious?: () => void;

	/** Select/deselect current row */
	onToggleSelection?: () => void;

	/** Select all visible rows */
	onSelectAll?: () => void;

	/** Deselect all rows */
	onDeselectAll?: () => void;

	/** Focus search input */
	onFocusSearch?: () => void;

	/** Close modals/overlays */
	onClose?: () => void;

	/** Update status (when rows selected) */
	onUpdateStatus?: () => void;

	/** Assign clinician (when rows selected) */
	onAssignClinician?: () => void;

	/** Export selected (when rows selected) */
	onExport?: () => void;

	/** Refresh data */
	onRefresh?: () => void;

	/** Toggle advanced filters */
	onToggleFilters?: () => void;

	/** Open command palette */
	onOpenCommandPalette?: () => void;

	/** Show shortcuts help */
	onShowShortcutsHelp?: () => void;
}

export interface UseAdminTriageShortcutsOptions {
	/** Handlers for shortcut actions */
	handlers: AdminTriageShortcutHandlers;

	/** Enable/disable all shortcuts */
	enabled?: boolean;

	/** Prevent shortcuts when typing in inputs (default: true) */
	preventWhenEditing?: boolean;

	/** Whether any rows are selected (enables action shortcuts) */
	hasSelection?: boolean;
}

/**
 * Check if the active element is an input field
 */
function isInputActive(): boolean {
	const activeElement = document.activeElement;
	if (!activeElement) return false;

	const tagName = activeElement.tagName.toLowerCase();
	return (
		tagName === 'input' ||
		tagName === 'textarea' ||
		tagName === 'select' ||
		(activeElement as HTMLElement).isContentEditable
	);
}

/**
 * useAdminTriageShortcuts hook
 *
 * @example
 * ```tsx
 * useAdminTriageShortcuts({
 *   handlers: {
 *     onNavigateNext: () => setFocusedRow(prev => prev + 1),
 *     onToggleSelection: () => toggleRowSelection(focusedRow),
 *     onSelectAll: () => selectAllRows(),
 *     onFocusSearch: () => searchInputRef.current?.focus(),
 *     onUpdateStatus: () => openStatusModal(),
 *   },
 *   enabled: true,
 *   hasSelection: selectedRowKeys.length > 0,
 * });
 * ```
 */
export function useAdminTriageShortcuts({
	handlers,
	enabled = true,
	preventWhenEditing = true,
	hasSelection = false,
}: UseAdminTriageShortcutsOptions): void {
	const handlersRef = useRef(handlers);

	// Update handlers ref when they change
	useEffect(() => {
		handlersRef.current = handlers;
	}, [handlers]);

	// Options for hotkeys (don't prevent default for navigation)
	const baseOptions = {
		enabled,
		enableOnFormTags: !preventWhenEditing,
	};

	// Options for hotkeys that should prevent default
	const preventDefaultOptions = {
		...baseOptions,
		preventDefault: true,
	};

	// Row navigation shortcuts (J/K - vim-style)
	useHotkeys(
		'j',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onNavigateNext?.();
		},
		preventDefaultOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'k',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onNavigatePrevious?.();
		},
		preventDefaultOptions,
		[preventWhenEditing],
	);

	// Selection shortcuts
	useHotkeys(
		'space',
		event => {
			if (preventWhenEditing && isInputActive()) return;
			event.preventDefault();
			handlersRef.current.onToggleSelection?.();
		},
		{ ...baseOptions, preventDefault: false }, // Let handler control preventDefault
		[preventWhenEditing],
	);

	useHotkeys(
		'meta+a, ctrl+a',
		event => {
			// Only intercept if not in an input
			if (!isInputActive()) {
				event.preventDefault();
				handlersRef.current.onSelectAll?.();
			}
		},
		baseOptions,
		[],
	);

	useHotkeys(
		'meta+shift+a, ctrl+shift+a',
		event => {
			event.preventDefault();
			handlersRef.current.onDeselectAll?.();
		},
		{ enabled },
		[],
	);

	// Search focus shortcut
	useHotkeys(
		'/',
		event => {
			if (preventWhenEditing && isInputActive()) return;
			event.preventDefault();
			handlersRef.current.onFocusSearch?.();
		},
		baseOptions,
		[preventWhenEditing],
	);

	// Escape to close
	useHotkeys(
		'escape',
		() => {
			handlersRef.current.onClose?.();
		},
		{ enabled },
		[],
	);

	// Action shortcuts (only enabled when rows are selected)
	useHotkeys(
		'u',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			if (!hasSelection) return;
			handlersRef.current.onUpdateStatus?.();
		},
		{ ...preventDefaultOptions, enabled: enabled && hasSelection },
		[preventWhenEditing, hasSelection],
	);

	useHotkeys(
		'c',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			if (!hasSelection) return;
			handlersRef.current.onAssignClinician?.();
		},
		{ ...preventDefaultOptions, enabled: enabled && hasSelection },
		[preventWhenEditing, hasSelection],
	);

	useHotkeys(
		'e',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			if (!hasSelection) return;
			handlersRef.current.onExport?.();
		},
		{ ...preventDefaultOptions, enabled: enabled && hasSelection },
		[preventWhenEditing, hasSelection],
	);

	// Utility shortcuts
	useHotkeys(
		'r',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onRefresh?.();
		},
		preventDefaultOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'f',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onToggleFilters?.();
		},
		preventDefaultOptions,
		[preventWhenEditing],
	);

	// Command palette (Cmd/Ctrl + K)
	useHotkeys(
		'meta+k, ctrl+k',
		event => {
			event.preventDefault();
			handlersRef.current.onOpenCommandPalette?.();
		},
		{ enabled },
		[],
	);

	// Help shortcut
	useHotkeys(
		'?',
		event => {
			if (preventWhenEditing && isInputActive()) return;
			event.preventDefault();
			handlersRef.current.onShowShortcutsHelp?.();
		},
		baseOptions,
		[preventWhenEditing],
	);
}

/**
 * Admin triage keyboard shortcuts definitions for documentation
 */
export const ADMIN_TRIAGE_SHORTCUTS = [
	// Navigation
	{
		keys: ['J'],
		description: 'Navigate to next row',
		category: 'navigation' as const,
	},
	{
		keys: ['K'],
		description: 'Navigate to previous row',
		category: 'navigation' as const,
	},

	// Selection
	{
		keys: ['Space'],
		description: 'Select/deselect current row',
		category: 'selection' as const,
	},
	{
		keys: ['Cmd', 'A'],
		description: 'Select all visible rows',
		category: 'selection' as const,
	},
	{
		keys: ['Cmd', 'Shift', 'A'],
		description: 'Deselect all rows',
		category: 'selection' as const,
	},

	// Actions (require selection)
	{
		keys: ['U'],
		description: 'Update status',
		category: 'actions' as const,
		requiresSelection: true,
	},
	{
		keys: ['C'],
		description: 'Assign clinician',
		category: 'actions' as const,
		requiresSelection: true,
	},
	{
		keys: ['E'],
		description: 'Export selected',
		category: 'actions' as const,
		requiresSelection: true,
	},

	// Utilities
	{
		keys: ['R'],
		description: 'Refresh data',
		category: 'utilities' as const,
	},
	{
		keys: ['F'],
		description: 'Toggle advanced filters',
		category: 'utilities' as const,
	},
	{
		keys: ['/'],
		description: 'Focus search',
		category: 'utilities' as const,
	},
	{
		keys: ['Cmd', 'K'],
		description: 'Open command palette',
		category: 'utilities' as const,
	},
	{
		keys: ['?'],
		description: 'Show keyboard shortcuts',
		category: 'utilities' as const,
	},
	{
		keys: ['Esc'],
		description: 'Close modals/drawers',
		category: 'utilities' as const,
	},
];
