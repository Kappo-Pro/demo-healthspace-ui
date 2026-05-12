/**
 * One-time cleanup of deprecated feature flag localStorage keys
 * @see EPIC: feature-flag-removal
 * @deprecated This cleanup runs once per user and can be removed after 30 days (Dec 7, 2025)
 */
export const cleanupFeatureFlagStorage = (): void => {
	const keysToRemove: string[] = [];

	// Find all feature flag keys
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (
			key &&
			(key.startsWith('ff_') ||
				key.startsWith('ff-override-') ||
				key === 'beta_cohort' ||
				key.includes('feature_flag'))
		) {
			keysToRemove.push(key);
		}
	}

	// Remove them
	keysToRemove.forEach(key => localStorage.removeItem(key));

	// Mark cleanup as done (prevent re-running)
	localStorage.setItem('ff_cleanup_done', 'true');

	if (keysToRemove.length > 0) {
	}
};
