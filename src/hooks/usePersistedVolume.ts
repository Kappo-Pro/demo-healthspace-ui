import { useState, useCallback } from 'react';

const VOLUME_STORAGE_KEY = 'vitalflow-rom-volume';
const DEFAULT_VOLUME = 100;

/**
 * Get stored volume from localStorage
 */
export function getStoredVolume(): number {
	try {
		const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
		if (stored !== null) {
			const parsed = parseInt(stored, 10);
			if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
				return parsed;
			}
		}
	} catch {
		// localStorage not available
	}
	return DEFAULT_VOLUME;
}

/**
 * Save volume to localStorage
 */
export function saveVolume(value: number): void {
	try {
		const clamped = Math.max(0, Math.min(100, value));
		localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
	} catch {
		// localStorage not available
	}
}

/**
 * Hook for managing persisted volume state
 * Reads initial value from localStorage and saves changes
 */
export function usePersistedVolume(initialVolume?: number) {
	const [volume, setVolumeState] = useState(() =>
		initialVolume ?? getStoredVolume()
	);

	const setVolume = useCallback((value: number) => {
		const clamped = Math.max(0, Math.min(100, value));
		setVolumeState(clamped);
		saveVolume(clamped);
	}, []);

	return [volume, setVolume] as const;
}

export { VOLUME_STORAGE_KEY };
