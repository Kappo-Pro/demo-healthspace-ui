/**
 * Settings Route Wrapper
 *
 * Simple routing wrapper for Settings page.
 * Feature flag infrastructure removed after successful rollout completion.
 *
 * Note: Legacy Settings UI was fully replaced and deprecated folder removed October 2025
 * Feature flag infrastructure removed after 100% rollout completion (November 2025)
 */

import React from 'react';

// Modern Settings page with code splitting, lazy loading, and performance optimizations
import NewSettings from './SettingsPage';

/**
 * SettingsRoute - Settings page wrapper
 *
 * Renders the modern Settings UI (Epic 2-4 implementation).
 * Feature flag infrastructure removed after successful 100% rollout.
 *
 * @example
 * ```tsx
 * // In router file
 * <Route path={router.SETTINGS} element={<SettingsRoute />} />
 * ```
 */
const SettingsRoute: React.FC = () => {
	// Always render modern Settings UI
	// Feature flag infrastructure removed after successful rollout
	return <NewSettings />;
};

export default SettingsRoute;
