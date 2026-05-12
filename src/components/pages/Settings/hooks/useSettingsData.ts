/**
 * useSettingsData Hook
 *
 * Epic 1 - Story 1.5: Custom hook for fetching settings data
 *
 * Features:
 * - Lazy loading pattern: NO data fetched on mount
 * - Content Library data loaded separately when ContentLibraryPage mounts
 * - Exposes loading, error, and refetch states
 * - Handles errors gracefully with try/catch
 * - Returns stable callback references
 *
 * NOTE: This hook currently returns no-op state for compatibility.
 * Content Library data is fetched lazily in ContentLibraryPage.tsx
 */

import { useCallback, useState } from 'react';

export interface UseSettingsDataReturn {
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

/**
 * Custom hook for settings data state management
 *
 * @returns Object containing loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   const { loading, error, refetch } = useSettingsData();
 *
 *   if (loading) return <Spin />;
 *   if (error) return <Alert message={error} type="error" />;
 *
 *   return <SettingsTabs />;
 * }
 * ```
 */
export function useSettingsData(): UseSettingsDataReturn {
	const [loading] = useState(false);
	const [error] = useState<string | null>(null);

	/**
	 * No-op refetch for compatibility
	 * Individual tabs handle their own data fetching
	 */
	const fetchAllSettings = useCallback(async () => {
		// No-op: Individual tabs fetch their own data
	}, []);

	return {
		loading,
		error,
		refetch: fetchAllSettings,
	};
}

export default useSettingsData;
