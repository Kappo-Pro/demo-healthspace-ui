/**
 * ContentLibraryPage - Settings Content Library section page wrapper
 *
 * Standalone page component for /settings/pre-existing-conditions route
 * Renders the ContentLibraryTab content within the two-tier navigation layout
 *
 * Features:
 * - Per-tab lazy loading: Each sub-tab fetches own data on mount
 * - No bulk API call on page mount (Story: Content Library Lazy Loading Fix)
 * - Sub-tabs handle own loading/error states
 */

import { SettingsTabSkeleton } from '@atoms/SettingsTabSkeleton';
import React, { Suspense, lazy } from 'react';

const ContentLibraryTab = lazy(() =>
	import('../tabs/ContentLibraryTab').then(module => ({
		default: module.ContentLibraryTab,
	})),
);

const ContentLibraryPage: React.FC = () => {
	return (
		<div className="total-patient-main-div">
			<Suspense fallback={<SettingsTabSkeleton />}>
				<ContentLibraryTab />
			</Suspense>
		</div>
	);
};

export default ContentLibraryPage;
