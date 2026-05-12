/**
 * useCalendarShortcuts Hook
 *
 * Keyboard shortcuts for calendar operations.
 * Includes navigation, view switching, actions, and accessibility.
 *
 * Shortcuts:
 * - T: Go to today
 * - N: Next period
 * - P: Previous period
 * - M: Month view
 * - W: Week view
 * - D: Day view
 * - A: Agenda view
 * - S: Schedule activity
 * - F: Toggle filters
 * - /: Focus search
 * - Cmd/Ctrl+K: Command palette
 * - ?: Show shortcuts help
 * - Arrow keys: Navigate dates
 * - Esc: Close modals
 */

import { useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarShortcutHandlers {
	/** Navigate to today */
	onNavigateToday?: () => void;

	/** Navigate to next period */
	onNavigateNext?: () => void;

	/** Navigate to previous period */
	onNavigatePrevious?: () => void;

	/** Change calendar view */
	onChangeView?: (view: CalendarView) => void;

	/** Open schedule modal */
	onOpenScheduleModal?: () => void;

	/** Toggle filter panel */
	onToggleFilters?: () => void;

	/** Focus search input */
	onFocusSearch?: () => void;

	/** Open command palette */
	onOpenCommandPalette?: () => void;

	/** Show shortcuts help */
	onShowShortcutsHelp?: () => void;

	/** Close modals/overlays */
	onClose?: () => void;
}

export interface UseCalendarShortcutsOptions {
	/** Handlers for shortcut actions */
	handlers: CalendarShortcutHandlers;

	/** Enable/disable all shortcuts */
	enabled?: boolean;

	/** Prevent shortcuts when typing in inputs */
	preventWhenEditing?: boolean;
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
 * useCalendarShortcuts hook
 */
export function useCalendarShortcuts({
	handlers,
	enabled = true,
	preventWhenEditing = true,
}: UseCalendarShortcutsOptions): void {
	const handlersRef = useRef(handlers);

	// Update handlers ref when they change
	useEffect(() => {
		handlersRef.current = handlers;
	}, [handlers]);

	// Options for all hotkeys
	const hotkeyOptions = {
		enabled,
		enableOnFormTags: !preventWhenEditing,
		preventDefault: true,
	};

	// Navigation shortcuts
	useHotkeys(
		't',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onNavigateToday?.();
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'n',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onNavigateNext?.();
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'p',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onNavigatePrevious?.();
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	// Arrow key navigation
	useHotkeys(
		'left',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onNavigatePrevious?.();
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'right',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onNavigateNext?.();
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	// View switching shortcuts
	useHotkeys(
		'm',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onChangeView?.('month');
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'w',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onChangeView?.('week');
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'd',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onChangeView?.('day');
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'a',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onChangeView?.('agenda');
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	// Action shortcuts
	useHotkeys(
		's',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onOpenScheduleModal?.();
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'f',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onToggleFilters?.();
		},
		hotkeyOptions,
		[preventWhenEditing],
	);

	useHotkeys(
		'/',
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onFocusSearch?.();
		},
		hotkeyOptions,
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
		() => {
			if (preventWhenEditing && isInputActive()) return;
			handlersRef.current.onShowShortcutsHelp?.();
		},
		hotkeyOptions,
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
}

/**
 * Calendar keyboard shortcuts definitions for documentation
 */
export const CALENDAR_SHORTCUTS = [
	// Navigation
	{
		keys: 'T',
		description: 'Go to today',
		category: 'calendar-navigation' as const,
	},
	{
		keys: ['N', '→'],
		description: 'Next period',
		category: 'calendar-navigation' as const,
	},
	{
		keys: ['P', '←'],
		description: 'Previous period',
		category: 'calendar-navigation' as const,
	},

	// View switching
	{
		keys: 'M',
		description: 'Month view',
		category: 'calendar-views' as const,
	},
	{
		keys: 'W',
		description: 'Week view',
		category: 'calendar-views' as const,
	},
	{
		keys: 'D',
		description: 'Day view',
		category: 'calendar-views' as const,
	},
	{
		keys: 'A',
		description: 'Agenda view',
		category: 'calendar-views' as const,
	},

	// Actions
	{
		keys: 'S',
		description: 'Schedule activity',
		category: 'calendar-actions' as const,
	},
	{
		keys: 'F',
		description: 'Toggle filters',
		category: 'calendar-actions' as const,
	},
	{
		keys: '/',
		description: 'Focus search',
		category: 'calendar-actions' as const,
	},
	{
		keys: ['Cmd', 'K'],
		description: 'Command palette',
		category: 'calendar-actions' as const,
	},
	{
		keys: '?',
		description: 'Show shortcuts',
		category: 'calendar-actions' as const,
	},
	{
		keys: 'Esc',
		description: 'Close modal',
		category: 'calendar-actions' as const,
	},
];
