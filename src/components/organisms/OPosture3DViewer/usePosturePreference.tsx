import { useState, useEffect, useCallback } from 'react';

/**
 * Type for posture view mode
 */
export type PostureViewMode = '2d' | '3d';

/**
 * Local storage key for posture view preference
 */
const STORAGE_KEY = 'posture-view-preference';

/**
 * Default view mode (2D for progressive enhancement)
 */
const DEFAULT_VIEW: PostureViewMode = '2d';

/**
 * Hook return type
 */
export interface UsePosturePreferenceReturn {
	/** Current view mode */
	view: PostureViewMode;

	/** Save new view preference */
	savePreference: (newView: PostureViewMode) => void;

	/** Reset to default preference */
	resetPreference: () => void;
}

/**
 * usePosturePreference - Custom hook for managing user's 2D/3D view preference
 *
 * Features:
 * - localStorage persistence
 * - Progressive enhancement (defaults to 2D)
 * - Type-safe view modes
 * - Automatic preference saving
 *
 * @example
 * ```tsx
 * const { view, savePreference } = usePosturePreference();
 *
 * return (
 *   <button onClick={() => savePreference('3d')}>
 *     Switch to 3D
 *   </button>
 * );
 * ```
 */
export const usePosturePreference = (): UsePosturePreferenceReturn => {
	const [view, setView] = useState<PostureViewMode>(() => {
		// Initialize from localStorage if available
		if (typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem(STORAGE_KEY);
				if (saved === '2d' || saved === '3d') {
					return saved;
				}
			} catch (error) {
				// localStorage not available or quota exceeded
				console.warn('Failed to load posture view preference:', error);
			}
		}
		return DEFAULT_VIEW;
	});

	/**
	 * Save preference to localStorage when view changes
	 */
	useEffect(() => {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(STORAGE_KEY, view);
			} catch (error) {
				// localStorage not available or quota exceeded
				console.warn('Failed to save posture view preference:', error);
			}
		}
	}, [view]);

	/**
	 * Save new view preference
	 */
	const savePreference = useCallback((newView: PostureViewMode): void => {
		setView(newView);
	}, []);

	/**
	 * Reset to default preference
	 */
	const resetPreference = useCallback((): void => {
		setView(DEFAULT_VIEW);
	}, []);

	return {
		view,
		savePreference,
		resetPreference,
	};
};
