/**
 * Command Palette Orchestrator - State Reducer
 *
 * State machine reducer managing all palette mode transitions.
 * Handles 4 states: idle → userSearch → userContext → drawerExpanded
 */

import {
	PaletteState,
	PaletteAction,
	PALETTE_LIMITS,
	PALETTE_DIMENSIONS,
} from './types';

/**
 * Initial state for the palette
 */
export const initialPaletteState: PaletteState = {
	mode: 'idle',
	query: '',
	selectedUser: null,
	selectedAction: null,
	drawerContent: null,
	selectedIndex: 0,
	recentUsers: [],
	selectedProgram: null,
	userSelectionLocked: false,
};

/**
 * State machine reducer
 *
 * @param state - Current palette state
 * @param action - Action to apply
 * @returns New state after applying action
 */
export function paletteReducer(
	state: PaletteState,
	action: PaletteAction,
): PaletteState {
	switch (action.type) {
		case 'OPEN':
			// Reset to idle mode but preserve recent users
			return {
				...initialPaletteState,
				recentUsers: state.recentUsers,
			};

		case 'CLOSE':
			// Full reset to initial state
			return {
				...initialPaletteState,
				recentUsers: state.recentUsers,
			};

		case 'SET_QUERY': {
			// Update query and reset selection ONLY if mode changes
			const newMode = action.query.length > 0 ? 'userSearch' : 'idle';
			const modeChanged = newMode !== state.mode;

			return {
				...state,
				query: action.query,
				mode: newMode,
				// Only reset selectedIndex if mode changed or query is being set
				selectedIndex: modeChanged ? 0 : state.selectedIndex,
			};
		}

		case 'SELECT_USER':
			// Transition to userContext mode
			return {
				...state,
				mode: 'userContext',
				selectedUser: action.user,
				query: '',
				selectedIndex: 0,
			};

		case 'CLEAR_USER':
			// Back to idle mode, clear all user-related state
			return {
				...state,
				mode: 'idle',
				selectedUser: null,
				selectedAction: null,
				drawerContent: null,
				query: '',
				selectedIndex: 0,
			};

		case 'SELECT_ACTION':
			// If action opens drawer, transition to drawerExpanded
			if (action.action.opensDrawer && action.action.drawerComponent) {
				return {
					...state,
					mode: 'drawerExpanded',
					selectedAction: action.action,
					drawerContent: {
						title: action.action.label,
						component: action.action.drawerComponent,
						props: { user: state.selectedUser },
						width: 300,
					},
				};
			}

			// Otherwise just execute action without state change
			// The action handler will be called by the component
			return state;

		case 'CLOSE_DRAWER':
			// Back to userContext mode
			return {
				...state,
				mode: 'userContext',
				selectedAction: null,
				drawerContent: null,
			};

		case 'NAVIGATE_UP':
			// Move selection up (decrement, min 0)
			return {
				...state,
				selectedIndex: state.selectedIndex > 0 ? state.selectedIndex - 1 : 0,
			};

		case 'NAVIGATE_DOWN': {
			// Move selection down (increment, max maxIndex)
			const newIndex =
				state.selectedIndex < action.maxIndex
					? state.selectedIndex + 1
					: state.selectedIndex;
			return {
				...state,
				selectedIndex: newIndex,
			};
		}

		case 'SET_SELECTED_INDEX':
			// Directly set selected index (used by hover events)
			return {
				...state,
				selectedIndex: action.index,
			};

		case 'ADD_RECENT_USER': {
			// Add user to recent list (max 5, most recent first)
			const filtered = state.recentUsers.filter(id => id !== action.userId);
			return {
				...state,
				recentUsers: [action.userId, ...filtered].slice(
					0,
					PALETTE_LIMITS.maxRecentUsers,
				),
			};
		}

		case 'SELECT_PROGRAM':
			// Transition to programContext mode
			return {
				...state,
				mode: 'programContext',
				selectedProgram: action.program,
				query: '',
				selectedIndex: 0,
			};

		case 'CLEAR_PROGRAM':
			// Back to userContext mode
			return {
				...state,
				mode: 'userContext',
				selectedProgram: null,
				query: '',
				selectedIndex: 0,
			};

		case 'LOCK_USER_SELECTION':
			// Lock or unlock user selection
			return {
				...state,
				userSelectionLocked: action.locked,
			};

		case 'SET_MODE':
			// Explicitly set palette mode (for auto-search enhancement)
			return {
				...state,
				mode: action.mode,
				selectedIndex: 0, // Reset selection when mode changes
			};

		default:
			// TypeScript exhaustiveness check
			return state;
	}
}

/**
 * Helper function to check if palette is in a user context
 */
export function hasUserContext(state: PaletteState): boolean {
	return state.mode === 'userContext' || state.mode === 'drawerExpanded';
}

/**
 * Helper function to check if drawer is expanded
 */
export function isDrawerExpanded(state: PaletteState): boolean {
	return state.mode === 'drawerExpanded';
}

/**
 * Helper function to check if palette is searching
 */
export function isSearching(state: PaletteState): boolean {
	return state.mode === 'userSearch' && state.query.length > 0;
}

/**
 * Helper function to get current dimensions
 */
export function getCurrentDimensions(state: PaletteState) {
	return PALETTE_DIMENSIONS[state.mode];
}
